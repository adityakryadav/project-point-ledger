"""
ILPEP Intelligence ML Service — FastAPI Application Entry Point

Provides:
- Health check endpoint
- Startup lifecycle: loads ML models, connects Redis
- Router mounting for fraud scoring and dynamic pricing (added in Phase 2)
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.config import (
    SERVICE_NAME,
    API_VERSION,
    FRAUD_MODEL_PATH,
    FRAUD_MODEL_VERSION,
    DQN_MODEL_PATH,
    DQN_MODEL_VERSION,
)
from models.model_registry import registry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(SERVICE_NAME)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    
    Startup:
    - Load XGBoost fraud classifier (if available)
    - Load DQN pricing agent (if available)
    - Connect to Redis feature store (Phase 2)
    
    Shutdown:
    - Graceful cleanup of connections
    """
    logger.info(f"Starting {SERVICE_NAME}...")
    
    # Load ML models (will log warnings if model files don't exist yet)
    registry.load_fraud_model(FRAUD_MODEL_PATH, FRAUD_MODEL_VERSION)
    registry.load_pricing_model(DQN_MODEL_PATH, DQN_MODEL_VERSION)
    
    loaded_models = registry.list_models()
    if loaded_models:
        logger.info(f"Models loaded: {loaded_models}")
    else:
        logger.warning(
            "No models loaded. Train models first, then restart the service."
        )
    
    logger.info(f"{SERVICE_NAME} started successfully")
    yield
    
    # Shutdown
    logger.info(f"Shutting down {SERVICE_NAME}...")


# ==============================================================================
# FastAPI Application
# ==============================================================================
app = FastAPI(
    title="ILPEP Intelligence & ML Service",
    description=(
        "AI/ML microservice for the Indian Loyalty Points Exchange Platform. "
        "Provides real-time fraud detection (XGBoost) and dynamic pricing (DQN) "
        "for transaction processing."
    ),
    version=API_VERSION,
    lifespan=lifespan,
)


# ==============================================================================
# Health Check
# ==============================================================================
@app.get("/health", tags=["System"])
async def health_check():
    """
    Service health check endpoint.
    Returns loaded model status and service metadata.
    """
    return {
        "status": "healthy",
        "service": SERVICE_NAME,
        "version": API_VERSION,
        "models": registry.list_models(),
        "models_loaded": {
            "fraud": registry.is_model_loaded("fraud"),
            "pricing": registry.is_model_loaded("pricing"),
        },
    }


@app.get("/", tags=["System"])
async def root():
    """Root endpoint — service info."""
    return {
        "service": SERVICE_NAME,
        "description": "ILPEP Intelligence & ML Service",
        "version": API_VERSION,
        "endpoints": {
            "health": "/health",
            "fraud_scoring": f"/api/{API_VERSION}/fraud/score",
            "dynamic_pricing": f"/api/{API_VERSION}/pricing/quote",
        },
    }


# ==============================================================================
# Route Registration (to be added in Phase 2)
# ==============================================================================
# from api.fraud_scoring_routes import router as fraud_router
# from api.dynamic_pricing_routes import router as pricing_router
# app.include_router(fraud_router, prefix=f"/api/{API_VERSION}/fraud")
# app.include_router(pricing_router, prefix=f"/api/{API_VERSION}/pricing")
