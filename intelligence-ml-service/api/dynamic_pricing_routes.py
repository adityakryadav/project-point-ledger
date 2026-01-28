"""
ILPEP Intelligence ML Service — Dynamic Pricing API Routes

FastAPI router for real-time dynamic pricing quotes using the DQN agent.

Endpoint:
    POST /quote — Get a time-bound exchange rate quote

Pipeline:
    1. Receive quote request (user, partner, points, market features)
    2. Check rate limit/cooldown for the user-partner pair
    3. Transform raw features into DQN state vector
    4. Run DQN inference to get optimal price multiplier
    5. Calculate final exchange rate (base_rate * multiplier)
    6. Return quote with validity window and metadata

Design Decisions:
    - Fast, sub-100ms inference
    - Uses in-memory dict for cooldowns (production would use Redis)
    - Quote expiration logic handled centrally

Maps to execution plan: Member 3, Day 7, Phase 2
"""

import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, Tuple

import numpy as np
import torch
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.config import (
    PRICING_QUOTE_VALIDITY_SECONDS,
    PRICING_COOLDOWN_SECONDS,
)
from core.feature_engineering import pricing_transformer
from models.model_registry import registry

logger = logging.getLogger(__name__)


# ==============================================================================
# In-Memory Cooldown Store
# ==============================================================================
# In Phase 3, this should be moved to Redis to support distributed workers.
# Format: {(user_id, partner_id): last_quote_timestamp}
_quote_cooldowns: Dict[Tuple[str, str], float] = {}


# ==============================================================================
# Request / Response Models
# ==============================================================================

class PricingQuoteRequest(BaseModel):
    """Input payload for requesting an exchange quote."""

    user_id: str = Field(
        ...,
        description="UUID of the user",
    )
    partner_id: str = Field(
        ...,
        description="UUID of the source partner",
    )
    source_points: float = Field(
        ...,
        gt=0,
        description="Number of points to exchange",
    )
    
    # Market/State Features (usually provided by backend/Redis)
    partner_inventory: float = Field(
        ...,
        ge=0,
        description="Current point inventory held by the partner",
    )
    partner_redemption_rate: float = Field(
        ...,
        ge=0.0, le=1.0,
        description="Partner's historical redemption completion rate",
    )
    user_exchange_frequency: int = Field(
        ...,
        ge=0,
        description="Number of exchanges by this user in the last 30 days",
    )
    market_demand_index: float = Field(
        ...,
        ge=0.0, le=1.0,
        description="Aggregate platform demand metric",
    )


class PricingQuoteResponse(BaseModel):
    """Output payload containing the generated exchange quote."""

    quote_id: str = Field(
        ...,
        description="Time-based unique identifier for this quote",
    )
    exchange_rate: float = Field(
        ...,
        gt=0,
        description="Calculated INR per point conversion rate",
    )
    price_multiplier: float = Field(
        ...,
        description="The raw multiplier selected by the DQN agent",
    )
    base_rate: float = Field(
        ...,
        description="The baseline conversion rate used for calculation",
    )
    valid_until: str = Field(
        ...,
        description="ISO 8601 timestamp when this quote expires",
    )
    model_version: str = Field(
        ...,
        description="Version of the DQN model used",
    )
    latency_ms: float = Field(
        ...,
        description="Inference latency in milliseconds",
    )


# ==============================================================================
# Router
# ==============================================================================

router = APIRouter(tags=["Dynamic Pricing"])


@router.post(
    "/quote",
    response_model=PricingQuoteResponse,
    summary="Get a dynamic pricing quote",
    description=(
        "Evaluates market conditions using the DQN pricing agent to provide "
        "an optimal exchange rate. Quotes are time-bound and subject to "
        "per-user/partner cooldown periods."
    ),
)
async def get_pricing_quote(request: PricingQuoteRequest) -> PricingQuoteResponse:
    start_time = time.perf_counter()
    now_ts = time.time()

    # =========================================================================
    # Step 1: Verify model is loaded
    # =========================================================================
    if not registry.is_model_loaded("pricing"):
        raise HTTPException(
            status_code=503,
            detail={
                "error": "pricing_model_not_loaded",
                "message": (
                    "DQN pricing model is not loaded. "
                    "Train a model first using: python -m training.train_dqn"
                ),
            },
        )

    model = registry.get_model("pricing")
    model_version = registry.get_version("pricing")
    metadata = registry.get_metadata("pricing")

    # =========================================================================
    # Step 2: Check Cooldown
    # =========================================================================
    cooldown_key = (request.user_id, request.partner_id)
    last_quote_time = _quote_cooldowns.get(cooldown_key, 0)
    
    if now_ts - last_quote_time < PRICING_COOLDOWN_SECONDS:
        remaining = int(PRICING_COOLDOWN_SECONDS - (now_ts - last_quote_time))
        raise HTTPException(
            status_code=429,
            detail={
                "error": "quote_cooldown_active",
                "message": f"Please wait {remaining} seconds before requesting a new quote for this partner.",
                "retry_after_seconds": remaining,
            },
        )

    # =========================================================================
    # Step 3: Build State Vector
    # =========================================================================
    state_vector = pricing_transformer.transform(
        partner_inventory=request.partner_inventory,
        partner_redemption_rate=request.partner_redemption_rate,
        user_exchange_frequency=request.user_exchange_frequency,
        market_demand_index=request.market_demand_index,
    )

    # =========================================================================
    # Step 4: Run DQN Inference
    # =========================================================================
    try:
        # State formulation to PyTorch tensor
        state_tensor = torch.FloatTensor(state_vector).unsqueeze(0)
        
        # Inference mode
        with torch.no_grad():
            q_values = model(state_tensor)
            best_action_idx = int(q_values.argmax(dim=1).item())

        # Retrieve action mapping from model's original training config (if saved)
        # Fallback to hardcoded default if metadata is missing
        # In train_dqn.py, PRICE_ACTIONS = [0.85, 0.88, 0.91, 0.94, 0.97, 1.00, 1.03, 1.06, 1.09, 1.12, 1.15]
        # and BASE_EXCHANGE_RATE = 0.75
        price_actions = [0.85, 0.88, 0.91, 0.94, 0.97, 1.00, 1.03, 1.06, 1.09, 1.12, 1.15]
        base_rate = 0.75
        
        # In a real deployed scenario, this config comes from the checkpoint
        # For Day 7, we align with the hardcoded values from train_dqn.py
        
        multiplier = price_actions[best_action_idx]
        exchange_rate = base_rate * multiplier
        
    except Exception as e:
        logger.error(
            "Pricing inference failed for user %s: %s",
            request.user_id, str(e),
        )
        raise HTTPException(
            status_code=500,
            detail={
                "error": "inference_failed",
                "message": f"DQN model inference error: {str(e)}",
            },
        )

    # =========================================================================
    # Step 5: Generate Quote Metadata
    # =========================================================================
    # Update cooldown
    _quote_cooldowns[cooldown_key] = now_ts
    
    # Generate quote ID (format: qt-{timestamp}-{short_hash})
    quote_id = f"qt-{int(now_ts)}-{hash(request.user_id + request.partner_id) % 10000:04d}"
    
    # Calculate validity window
    now_dt = datetime.now(timezone.utc)
    valid_until = now_dt + timedelta(seconds=PRICING_QUOTE_VALIDITY_SECONDS)

    # Track metrics
    registry.record_inference("pricing")
    elapsed_ms = (time.perf_counter() - start_time) * 1000

    logger.info(
        "Quote generated for %s (Partner %s): rate=%.4f (x%.2f) valid_until=%s",
        request.user_id, request.partner_id, exchange_rate, multiplier, valid_until.isoformat()
    )

    # =========================================================================
    # Step 6: Return Response
    # =========================================================================
    return PricingQuoteResponse(
        quote_id=quote_id,
        exchange_rate=round(exchange_rate, 4),
        price_multiplier=multiplier,
        base_rate=base_rate,
        valid_until=valid_until.isoformat(),
        model_version=model_version,
        latency_ms=round(elapsed_ms, 2),
    )


@router.get(
    "/model-status",
    summary="Get pricing model status",
    description="Returns metadata about the loaded DQN pricing agent.",
    tags=["Dynamic Pricing"],
)
async def pricing_model_status():
    """Return current pricing model metadata and health."""
    metadata = registry.get_metadata("pricing")
    return {
        "model_loaded": registry.is_model_loaded("pricing"),
        "model_version": registry.get_version("pricing"),
        "metadata": metadata.to_dict() if metadata else None,
        "config": {
            "quote_validity_seconds": PRICING_QUOTE_VALIDITY_SECONDS,
            "cooldown_seconds": PRICING_COOLDOWN_SECONDS,
        },
    }
