"""
ILPEP Intelligence ML Service — Configuration Module

Centralized configuration for model paths, Redis settings,
fraud thresholds, pricing defaults, and inference timeouts.
"""

import os
from pathlib import Path


# ==============================================================================
# Base Paths
# ==============================================================================
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
TRAINING_DATA_DIR = BASE_DIR / "training" / "data"


# ==============================================================================
# Redis Feature Store Configuration
# ==============================================================================
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

# Key format for risk profiles
REDIS_RISK_PROFILE_PREFIX = "risk_profile:"

# TTL for risk profile entries (seconds) — 24 hours default
REDIS_RISK_PROFILE_TTL = int(os.getenv("REDIS_RISK_PROFILE_TTL", "86400"))


# ==============================================================================
# XGBoost Fraud Detection Configuration
# ==============================================================================
FRAUD_MODEL_PATH = MODELS_DIR / "xgboost_fraud_classifier_v1.pkl"
FRAUD_MODEL_VERSION = os.getenv("FRAUD_MODEL_VERSION", "v1.0")

# Fraud score thresholds (0.0 = safe, 1.0 = fraud)
FRAUD_THRESHOLD_BLOCK = float(os.getenv("FRAUD_THRESHOLD_BLOCK", "0.80"))
FRAUD_THRESHOLD_FLAG = float(os.getenv("FRAUD_THRESHOLD_FLAG", "0.50"))

# Inference timeout in milliseconds
FRAUD_INFERENCE_TIMEOUT_MS = int(os.getenv("FRAUD_INFERENCE_TIMEOUT_MS", "200"))

# Feature vector fields used for fraud scoring
FRAUD_FEATURE_FIELDS = [
    "velocity_1h",
    "velocity_24h",
    "total_load_mtd_inr",
    "device_count_30d",
    "exchange_frequency",
    "avg_txn_amount",
]


# ==============================================================================
# DQN Pricing Agent Configuration
# ==============================================================================
DQN_MODEL_PATH = MODELS_DIR / "dqn_pricing_agent_v1.pt"
DQN_MODEL_VERSION = os.getenv("DQN_MODEL_VERSION", "dqn_v1.0")

# Quote validity window (seconds) — 5 minutes default
PRICING_QUOTE_VALIDITY_SECONDS = int(os.getenv("PRICING_QUOTE_VALIDITY_SECONDS", "300"))

# Cooldown between quotes for the same user-partner pair (seconds)
PRICING_COOLDOWN_SECONDS = int(os.getenv("PRICING_COOLDOWN_SECONDS", "300"))


# ==============================================================================
# MLOps — Drift Monitoring
# ==============================================================================
# KL-Divergence threshold for auto-retraining trigger
KL_DIVERGENCE_THRESHOLD = float(os.getenv("KL_DIVERGENCE_THRESHOLD", "0.1"))

# Drift check frequency (in days)
DRIFT_CHECK_FREQUENCY_DAYS = int(os.getenv("DRIFT_CHECK_FREQUENCY_DAYS", "7"))


# ==============================================================================
# API Server Configuration
# ==============================================================================
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8001"))
API_VERSION = "v1"
SERVICE_NAME = "intelligence-ml-service"
