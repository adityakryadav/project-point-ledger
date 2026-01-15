"""
ILPEP Intelligence ML Service — Feature Engineering Module

Transforms raw transaction data and Redis risk profiles into ML-ready
feature vectors for:
  1. XGBoost Fraud Detection — velocity ratios, amount deviations, device risk
  2. DQN Dynamic Pricing — liquidity scores, user retention signals, inventory

Design Decisions:
    - Separates raw feature retrieval (Redis) from engineered features (this module)
    - All transformations are deterministic and stateless (no side effects)
    - Feature names and order match the training pipeline exactly
    - Uses NumPy for efficient vectorized computation
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import numpy as np

from core.config import FRAUD_FEATURE_FIELDS

logger = logging.getLogger(__name__)


# ==============================================================================
# Feature Definitions
# ==============================================================================

# Fraud detection features (order matches XGBoost training)
FRAUD_RAW_FIELDS = FRAUD_FEATURE_FIELDS  # From config: velocity_1h, velocity_24h, etc.

# Engineered fraud features (appended after raw features)
FRAUD_ENGINEERED_FIELDS = [
    "velocity_ratio_1h_24h",    # velocity_1h / velocity_24h (burst detection)
    "amount_deviation",          # (amount - avg_txn_amount) / avg_txn_amount
    "load_utilization_pct",      # total_load_mtd / 10000 (Small PPI) or 200000 (Full KYC)
    "device_risk_score",         # device_count_30d normalized (>3 = high risk)
    "hours_since_last_txn",      # time gap from last transaction
]

# DQN pricing state features
PRICING_STATE_FIELDS = [
    "partner_inventory_level",   # current point inventory for the partner
    "partner_redemption_rate",   # historical redemption success rate
    "user_exchange_frequency",   # how often user exchanges (loyalty signal)
    "market_demand_index",       # aggregate demand across all users
    "time_of_day_normalized",    # 0.0 (midnight) to 1.0 (23:59)
    "day_of_week_normalized",    # 0.0 (Monday) to 1.0 (Sunday)
]


# ==============================================================================
# Fraud Feature Engineering
# ==============================================================================

class FraudFeatureTransformer:
    """
    Transforms raw risk profile data into engineered features for the
    XGBoost fraud classifier.

    The transformer produces two categories of features:
    1. Raw features: direct values from Redis (velocity_1h, velocity_24h, etc.)
    2. Engineered features: computed ratios and scores (velocity_ratio, amount_deviation, etc.)

    Usage:
        transformer = FraudFeatureTransformer()
        feature_vector = transformer.transform(
            raw_profile={"velocity_1h": 15, "velocity_24h": 45, ...},
            transaction_amount=5000.00,
            kyc_status="SMALL"
        )
    """

    # PPI load limits (from RBI Master Directions)
    SMALL_PPI_MONTHLY_LIMIT = 10_000.00    # ₹10,000/month for Small PPI
    FULL_KYC_BALANCE_LIMIT = 200_000.00    # ₹2,00,000 balance for Full KYC

    def transform(
        self,
        raw_profile: Dict[str, Any],
        transaction_amount: float,
        kyc_status: str = "SMALL",
    ) -> np.ndarray:
        """
        Generate the complete fraud feature vector.

        Args:
            raw_profile: Dict from Redis risk_profile:{user_id}.
            transaction_amount: The current transaction amount in INR.
            kyc_status: User's KYC tier ('SMALL' or 'FULL').

        Returns:
            NumPy array of float64 features in the order expected by XGBoost.
        """
        # 1. Extract raw features (in training order)
        raw_features = self._extract_raw_features(raw_profile)

        # 2. Compute engineered features
        engineered = self._compute_engineered_features(
            raw_profile, transaction_amount, kyc_status
        )

        # 3. Concatenate into single feature vector
        feature_vector = np.concatenate([raw_features, engineered])

        logger.debug(
            "Fraud feature vector generated: %d features (raw=%d, engineered=%d)",
            len(feature_vector), len(raw_features), len(engineered),
        )
        return feature_vector

    def _extract_raw_features(self, profile: Dict[str, Any]) -> np.ndarray:
        """Extract raw features from Redis profile in training order."""
        values = []
        for field in FRAUD_RAW_FIELDS:
            raw_val = profile.get(field, 0)
            try:
                values.append(float(raw_val))
            except (ValueError, TypeError):
                logger.warning(
                    "Non-numeric value for '%s': %s. Defaulting to 0.0",
                    field, raw_val,
                )
                values.append(0.0)
        return np.array(values, dtype=np.float64)

    def _compute_engineered_features(
        self,
        profile: Dict[str, Any],
        txn_amount: float,
        kyc_status: str,
    ) -> np.ndarray:
        """Compute derived features from raw profile data."""
        features = []

        # --- Velocity ratio (burst detection) ---
        # High ratio = many transactions in 1h relative to 24h = suspicious burst
        velocity_1h = self._safe_float(profile.get("velocity_1h", 0))
        velocity_24h = self._safe_float(profile.get("velocity_24h", 0))
        velocity_ratio = velocity_1h / max(velocity_24h, 1.0)
        features.append(velocity_ratio)

        # --- Amount deviation ---
        # How far this transaction deviates from user's average
        avg_amount = self._safe_float(profile.get("avg_txn_amount", 0))
        if avg_amount > 0:
            amount_deviation = (txn_amount - avg_amount) / avg_amount
        else:
            # No history → treat as neutral (0.0)
            amount_deviation = 0.0
        features.append(amount_deviation)

        # --- Load utilization percentage ---
        # How close the user is to their PPI limit
        total_load_mtd = self._safe_float(profile.get("total_load_mtd_inr", 0))
        if kyc_status == "FULL":
            limit = self.FULL_KYC_BALANCE_LIMIT
        else:
            limit = self.SMALL_PPI_MONTHLY_LIMIT
        load_utilization = total_load_mtd / limit if limit > 0 else 0.0
        features.append(load_utilization)

        # --- Device risk score ---
        # Multiple devices in 30 days = higher risk
        # Normalized: 1 device = 0.0, 3+ devices = 1.0
        device_count = self._safe_float(profile.get("device_count_30d", 1))
        device_risk = min((device_count - 1) / 2.0, 1.0)
        device_risk = max(device_risk, 0.0)
        features.append(device_risk)

        # --- Hours since last transaction ---
        # Very recent transactions = potential velocity attack
        last_txn_ts = profile.get("last_txn_timestamp", "")
        hours_since = self._hours_since_timestamp(last_txn_ts)
        features.append(hours_since)

        return np.array(features, dtype=np.float64)

    @staticmethod
    def _safe_float(value: Any, default: float = 0.0) -> float:
        """Safely convert a value to float, returning default on failure."""
        try:
            return float(value)
        except (ValueError, TypeError):
            return default

    @staticmethod
    def _hours_since_timestamp(ts_str: str) -> float:
        """
        Calculate hours elapsed since an ISO 8601 timestamp.

        Returns 999.0 if the timestamp is empty or unparseable (indicates
        very old or missing transaction — low velocity risk signal).
        """
        if not ts_str:
            return 999.0  # No history → treat as very long gap

        try:
            last_txn = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            delta = now - last_txn
            return max(delta.total_seconds() / 3600.0, 0.0)
        except (ValueError, TypeError):
            return 999.0

    def get_feature_names(self) -> List[str]:
        """Return ordered list of all feature names (raw + engineered)."""
        return list(FRAUD_RAW_FIELDS) + list(FRAUD_ENGINEERED_FIELDS)


# ==============================================================================
# Pricing Feature Engineering
# ==============================================================================

class PricingFeatureTransformer:
    """
    Transforms market and user data into state vectors for the DQN
    pricing agent.

    The DQN agent uses these features to determine optimal exchange rates
    that balance revenue maximization, inventory management, and user retention.

    Usage:
        transformer = PricingFeatureTransformer()
        state_vector = transformer.transform(
            partner_inventory=50000,
            partner_redemption_rate=0.85,
            user_exchange_frequency=12,
            market_demand_index=0.7,
        )
    """

    def transform(
        self,
        partner_inventory: float,
        partner_redemption_rate: float,
        user_exchange_frequency: int,
        market_demand_index: float,
    ) -> np.ndarray:
        """
        Generate the DQN state vector for pricing decisions.

        Args:
            partner_inventory: Current point inventory for the partner.
            partner_redemption_rate: Historical redemption success rate (0-1).
            user_exchange_frequency: Monthly exchange count for this user.
            market_demand_index: Aggregate demand metric (0-1).

        Returns:
            NumPy array of normalized float64 features.
        """
        now = datetime.now(timezone.utc)

        features = [
            # Inventory level — log-scaled for extreme values
            self._log_scale(partner_inventory),

            # Redemption rate — already 0-1
            np.clip(partner_redemption_rate, 0.0, 1.0),

            # User exchange frequency — log-scaled
            self._log_scale(user_exchange_frequency),

            # Market demand — already 0-1
            np.clip(market_demand_index, 0.0, 1.0),

            # Time of day — normalized to 0-1
            (now.hour * 60 + now.minute) / 1440.0,

            # Day of week — normalized to 0-1 (Monday=0, Sunday=6)
            now.weekday() / 6.0,
        ]

        state_vector = np.array(features, dtype=np.float64)

        logger.debug(
            "Pricing state vector: %s",
            dict(zip(PRICING_STATE_FIELDS, state_vector)),
        )
        return state_vector

    @staticmethod
    def _log_scale(value: float) -> float:
        """Apply log(1 + x) scaling for values with large ranges."""
        return float(np.log1p(max(value, 0)))

    def get_feature_names(self) -> List[str]:
        """Return ordered list of pricing state feature names."""
        return list(PRICING_STATE_FIELDS)


# ==============================================================================
# Module-level instances
# ==============================================================================

fraud_transformer = FraudFeatureTransformer()
pricing_transformer = PricingFeatureTransformer()
