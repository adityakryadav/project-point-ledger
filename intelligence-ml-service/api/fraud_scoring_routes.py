"""
ILPEP Intelligence ML Service — Fraud Scoring API Routes

FastAPI router for real-time fraud score inference.

Endpoint:
    POST /score — Evaluate a transaction for fraud risk

Pipeline:
    1. Receive transaction context (user_id, device_hash, amount, kyc_status)
    2. Retrieve user's risk profile from Redis feature store
    3. Transform raw profile into engineered feature vector
    4. Run XGBoost model inference (target: <200ms latency)
    5. Map score to decision (AUTHORIZED / FLAGGED / BLOCKED)
    6. Return scored response with latency and model metadata

Design Decisions:
    - Uses dependency injection for feature store and model registry
    - Graceful degradation: missing Redis profile → default (zero) features
    - Model not loaded → HTTP 503 (Service Unavailable)
    - Latency measured end-to-end including Redis retrieval
    - Inference count tracked in model registry for monitoring

Maps to execution plan: Member 3, Day 5, Phase 2
"""

import logging
import time
from typing import Optional

import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.config import (
    FRAUD_THRESHOLD_BLOCK,
    FRAUD_THRESHOLD_FLAG,
    FRAUD_MODEL_VERSION,
)
from core.feature_engineering import fraud_transformer
from core.redis_feature_store import feature_store
from models.model_registry import registry

logger = logging.getLogger(__name__)


# ==============================================================================
# Request / Response Models
# ==============================================================================

class FraudScoreRequest(BaseModel):
    """
    Input payload for fraud scoring.

    Sent by the Ledger Accounting Service (via exchange_handler.go, Day 9
    integration) before committing an exchange transaction.
    """

    user_id: str = Field(
        ...,
        description="UUID of the user initiating the exchange",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    device_hash: str = Field(
        ...,
        description="SHA-256 hash of the user's device fingerprint",
        examples=["a1b2c3d4e5f6"],
    )
    amount: float = Field(
        ...,
        gt=0,
        description="Transaction amount in INR",
        examples=[5000.00],
    )
    kyc_status: str = Field(
        default="SMALL",
        description="User's KYC tier: 'SMALL' or 'FULL'",
        examples=["SMALL", "FULL"],
    )


class FraudScoreResponse(BaseModel):
    """
    Output payload from fraud scoring.

    Contains the fraud probability score, decision, model metadata,
    and inference latency for monitoring.
    """

    user_id: str = Field(
        ...,
        description="UUID of the scored user",
    )
    fraud_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Fraud probability (0.0 = safe, 1.0 = fraud)",
    )
    decision: str = Field(
        ...,
        description="Action taken: AUTHORIZED, FLAGGED, or BLOCKED",
    )
    model_version: str = Field(
        ...,
        description="Version of the XGBoost model used for inference",
    )
    latency_ms: float = Field(
        ...,
        description="End-to-end inference latency in milliseconds",
    )
    features_used: int = Field(
        ...,
        description="Number of features in the input vector",
    )
    risk_profile_found: bool = Field(
        ...,
        description="Whether a Redis risk profile existed for this user",
    )


# ==============================================================================
# Decision Logic
# ==============================================================================

def _score_to_decision(fraud_score: float) -> str:
    """
    Map a fraud probability score to an actionable decision.

    Thresholds (from config.py, matching transaction_processor.go):
        >= 0.80  →  BLOCKED   (auto-reject, alert compliance team)
        >= 0.50  →  FLAGGED   (allow but flag for manual review)
        <  0.50  →  AUTHORIZED (auto-approve)
    """
    if fraud_score >= FRAUD_THRESHOLD_BLOCK:
        return "BLOCKED"
    if fraud_score >= FRAUD_THRESHOLD_FLAG:
        return "FLAGGED"
    return "AUTHORIZED"


# ==============================================================================
# Router
# ==============================================================================

router = APIRouter(tags=["Fraud Detection"])


@router.post(
    "/score",
    response_model=FraudScoreResponse,
    summary="Score a transaction for fraud risk",
    description=(
        "Evaluates a transaction against the XGBoost fraud classifier. "
        "Retrieves the user's risk profile from Redis, builds an engineered "
        "feature vector, and returns a fraud probability score with a decision."
    ),
)
async def score_transaction(request: FraudScoreRequest) -> FraudScoreResponse:
    """
    Real-time fraud scoring endpoint.

    Full pipeline:
    1. Validate model availability (503 if not loaded)
    2. Retrieve risk profile from Redis (graceful fallback to defaults)
    3. Build feature vector via FraudFeatureTransformer
    4. Run XGBoost inference → fraud probability [0.0, 1.0]
    5. Map to decision (AUTHORIZED / FLAGGED / BLOCKED)
    6. Track inference count in registry
    """
    start_time = time.perf_counter()

    # =========================================================================
    # Step 1: Verify model is loaded
    # =========================================================================
    if not registry.is_model_loaded("fraud"):
        raise HTTPException(
            status_code=503,
            detail={
                "error": "fraud_model_not_loaded",
                "message": (
                    "XGBoost fraud model is not loaded. "
                    "Train a model first using: python -m training.train_xgboost"
                ),
            },
        )

    model = registry.get_model("fraud")
    model_version = registry.get_version("fraud")

    # =========================================================================
    # Step 2: Retrieve risk profile from Redis
    # =========================================================================
    risk_profile_found = True
    try:
        raw_profile = await feature_store.get_risk_profile(request.user_id)
    except RuntimeError:
        # Redis not connected — use empty profile, log warning
        logger.warning(
            "Redis feature store not connected. Using default profile for user %s",
            request.user_id,
        )
        raw_profile = None

    if raw_profile is None:
        # No profile found — first-time user or expired profile
        # Use empty/default values (all zeros → low risk, as expected for new users)
        logger.info(
            "No risk profile found for user %s. Using default features.",
            request.user_id,
        )
        raw_profile = {}
        risk_profile_found = False

    # =========================================================================
    # Step 3: Build feature vector
    # =========================================================================
    feature_vector = fraud_transformer.transform(
        raw_profile=raw_profile,
        transaction_amount=request.amount,
        kyc_status=request.kyc_status,
    )

    # =========================================================================
    # Step 4: Run XGBoost inference
    # =========================================================================
    try:
        # XGBoost expects 2D input: (n_samples, n_features)
        features_2d = feature_vector.reshape(1, -1)

        # predict_proba returns [[prob_class_0, prob_class_1]]
        # We want prob_class_1 (fraud probability)
        fraud_proba = model.predict_proba(features_2d)[0][1]

        # Clamp to [0, 1] for safety (should already be, but defensive)
        fraud_score = float(np.clip(fraud_proba, 0.0, 1.0))

    except Exception as e:
        logger.error(
            "Inference failed for user %s: %s",
            request.user_id, str(e),
        )
        raise HTTPException(
            status_code=500,
            detail={
                "error": "inference_failed",
                "message": f"Model inference error: {str(e)}",
            },
        )

    # =========================================================================
    # Step 5: Map score to decision
    # =========================================================================
    decision = _score_to_decision(fraud_score)

    # =========================================================================
    # Step 6: Track inference and calculate latency
    # =========================================================================
    registry.record_inference("fraud")

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    logger.info(
        "Fraud score for user %s: %.4f → %s (%.1fms, model=%s, profile=%s)",
        request.user_id,
        fraud_score,
        decision,
        elapsed_ms,
        model_version,
        "found" if risk_profile_found else "default",
    )

    # =========================================================================
    # Step 7: Return response
    # =========================================================================
    return FraudScoreResponse(
        user_id=request.user_id,
        fraud_score=round(fraud_score, 4),
        decision=decision,
        model_version=model_version,
        latency_ms=round(elapsed_ms, 2),
        features_used=len(feature_vector),
        risk_profile_found=risk_profile_found,
    )


@router.get(
    "/model-status",
    summary="Get fraud model status",
    description="Returns metadata about the loaded fraud detection model.",
    tags=["Fraud Detection"],
)
async def fraud_model_status():
    """Return current fraud model metadata and health."""
    metadata = registry.get_metadata("fraud")
    return {
        "model_loaded": registry.is_model_loaded("fraud"),
        "model_version": registry.get_version("fraud"),
        "metadata": metadata.to_dict() if metadata else None,
        "thresholds": {
            "block": FRAUD_THRESHOLD_BLOCK,
            "flag": FRAUD_THRESHOLD_FLAG,
        },
    }
"""
Complexity: 7
Description: Complete fraud scoring FastAPI router with POST /score and GET /model-status endpoints. The /score endpoint implements the full inference pipeline: Redis profile retrieval → feature engineering → XGBoost prediction → decision mapping. Handles graceful degradation when Redis is unavailable or user profiles are missing.
"""
