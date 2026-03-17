"""
ILPEP Intelligence ML Service — Redis Feature Store

Async Redis client for managing user risk profiles used in real-time
fraud detection and dynamic pricing. Provides CRUD operations with
connection pooling, TTL management, and batch retrieval.

Key Schema:
    risk_profile:{user_id} -> Hash
    {
        "velocity_1h": 15,
        "velocity_24h": 45,
        "total_load_mtd_inr": 45000.00,
        "device_id_hash": "a1b2c3d4",
        "device_count_30d": 3,
        "last_ip_geo": "Mumbai",
        "exchange_frequency": 12,
        "avg_txn_amount": 2500.00,
        "last_txn_timestamp": "2026-03-15T14:30:00Z"
    }

Design Decisions:
    - Uses redis.asyncio for non-blocking I/O in FastAPI async context
    - Connection pooling via redis.asyncio.ConnectionPool (max 20 connections)
    - All profile operations use Redis HASH type for partial field updates
    - Feature vector extraction uses ordered fields from config.FRAUD_FEATURE_FIELDS
    - TTL refreshed on every write to keep active profiles alive
"""

import logging
from typing import Optional

import redis.asyncio as aioredis

from core.config import (
    FRAUD_FEATURE_FIELDS,
    REDIS_DB,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
    REDIS_RISK_PROFILE_PREFIX,
    REDIS_RISK_PROFILE_TTL,
)

logger = logging.getLogger(__name__)


class RedisFeatureStore:
    """
    Async Redis feature store for ML risk profiles.

    Usage:
        store = RedisFeatureStore()
        await store.connect()

        # Write a profile
        await store.set_risk_profile("user-uuid", {
            "velocity_1h": 5,
            "velocity_24h": 20,
            "total_load_mtd_inr": 15000.00,
            ...
        })

        # Get feature vector for inference
        features = await store.get_feature_vector("user-uuid")

        await store.disconnect()
    """

    def __init__(self):
        """Initialize the feature store (does not connect yet)."""
        self._pool: Optional[aioredis.ConnectionPool] = None
        self._client: Optional[aioredis.Redis] = None

    # ==========================================================================
    # Connection Management
    # ==========================================================================

    async def connect(self) -> None:
        """
        Establish connection pool to Redis.

        Creates a connection pool with max 20 connections for concurrent
        access from multiple FastAPI request handlers.
        """
        if self._client is not None:
            logger.warning("RedisFeatureStore is already connected")
            return

        self._pool = aioredis.ConnectionPool(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            password=REDIS_PASSWORD,
            max_connections=20,
            decode_responses=True,  # Auto-decode bytes to str
        )
        self._client = aioredis.Redis(connection_pool=self._pool)

        logger.info(
            "RedisFeatureStore connected to %s:%s (db=%s)",
            REDIS_HOST, REDIS_PORT, REDIS_DB,
        )

    async def disconnect(self) -> None:
        """Close the Redis connection pool and release resources."""
        if self._client is not None:
            await self._client.aclose()
            self._client = None
        if self._pool is not None:
            await self._pool.disconnect()
            self._pool = None

        logger.info("RedisFeatureStore disconnected")

    def _ensure_connected(self) -> None:
        """Raise RuntimeError if not connected."""
        if self._client is None:
            raise RuntimeError(
                "RedisFeatureStore is not connected. Call connect() first."
            )

    def _profile_key(self, user_id: str) -> str:
        """Build the Redis key for a user's risk profile."""
        return f"{REDIS_RISK_PROFILE_PREFIX}{user_id}"

    # ==========================================================================
    # CRUD Operations
    # ==========================================================================

    async def get_risk_profile(self, user_id: str) -> Optional[dict]:
        """
        Retrieve the full risk profile for a user.

        Args:
            user_id: UUID string of the user.

        Returns:
            Dictionary of all profile fields, or None if not found.
        """
        self._ensure_connected()
        key = self._profile_key(user_id)

        profile = await self._client.hgetall(key)
        if not profile:
            logger.debug("No risk profile found for user %s", user_id)
            return None

        logger.debug("Retrieved risk profile for user %s (%d fields)", user_id, len(profile))
        return profile

    async def set_risk_profile(self, user_id: str, profile: dict) -> None:
        """
        Write a complete risk profile for a user (overwrite all fields).

        Sets TTL to configured REDIS_RISK_PROFILE_TTL (default 24h).

        Args:
            user_id: UUID string of the user.
            profile: Dictionary of profile fields and values.
        """
        self._ensure_connected()
        key = self._profile_key(user_id)

        # Delete existing and write new profile atomically via pipeline
        async with self._client.pipeline(transaction=True) as pipe:
            pipe.delete(key)
            pipe.hset(key, mapping=profile)
            pipe.expire(key, REDIS_RISK_PROFILE_TTL)
            await pipe.execute()

        logger.info(
            "Set risk profile for user %s (%d fields, TTL=%ds)",
            user_id, len(profile), REDIS_RISK_PROFILE_TTL,
        )

    async def update_risk_profile(self, user_id: str, data: dict) -> None:
        """
        Partially update a user's risk profile (merge fields).

        Only updates the specified fields; existing fields are preserved.
        Refreshes TTL on every update to keep active profiles alive.

        Args:
            user_id: UUID string of the user.
            data: Dictionary of fields to update/add.
        """
        self._ensure_connected()
        key = self._profile_key(user_id)

        async with self._client.pipeline(transaction=True) as pipe:
            pipe.hset(key, mapping=data)
            pipe.expire(key, REDIS_RISK_PROFILE_TTL)
            await pipe.execute()

        logger.debug(
            "Updated risk profile for user %s (%d fields)",
            user_id, len(data),
        )

    async def delete_risk_profile(self, user_id: str) -> bool:
        """
        Delete a user's risk profile.

        Args:
            user_id: UUID string of the user.

        Returns:
            True if the profile existed and was deleted, False otherwise.
        """
        self._ensure_connected()
        key = self._profile_key(user_id)

        deleted = await self._client.delete(key)
        if deleted:
            logger.info("Deleted risk profile for user %s", user_id)
        return bool(deleted)

    # ==========================================================================
    # ML Feature Extraction
    # ==========================================================================

    async def get_feature_vector(self, user_id: str) -> Optional[list[float]]:
        """
        Extract an ordered feature vector for ML model inference.

        Returns features in the exact order defined by config.FRAUD_FEATURE_FIELDS,
        which matches the training feature order of the XGBoost classifier.

        Args:
            user_id: UUID string of the user.

        Returns:
            List of float values in FRAUD_FEATURE_FIELDS order,
            or None if no profile exists.
        """
        self._ensure_connected()
        key = self._profile_key(user_id)

        # Use HMGET for ordered field retrieval (single round trip)
        values = await self._client.hmget(key, FRAUD_FEATURE_FIELDS)

        # If all values are None, the profile doesn't exist
        if all(v is None for v in values):
            logger.debug("No feature vector available for user %s", user_id)
            return None

        # Convert to floats, defaulting missing fields to 0.0
        feature_vector = []
        for field, value in zip(FRAUD_FEATURE_FIELDS, values):
            try:
                feature_vector.append(float(value) if value is not None else 0.0)
            except (ValueError, TypeError):
                logger.warning(
                    "Non-numeric value for field '%s' in user %s profile: %s. Defaulting to 0.0",
                    field, user_id, value,
                )
                feature_vector.append(0.0)

        logger.debug(
            "Feature vector for user %s: %s",
            user_id, dict(zip(FRAUD_FEATURE_FIELDS, feature_vector)),
        )
        return feature_vector

    # ==========================================================================
    # Atomic Operations (for background workers)
    # ==========================================================================

    async def increment_velocity(
        self, user_id: str, field: str, amount: int = 1
    ) -> int:
        """
        Atomically increment a velocity counter in a user's risk profile.

        Used by background workers to update real-time velocity metrics
        (e.g., velocity_1h, velocity_24h, exchange_frequency).

        Args:
            user_id: UUID string of the user.
            field: The field name to increment (e.g., "velocity_1h").
            amount: The increment value (default: 1).

        Returns:
            The new value of the field after incrementing.
        """
        self._ensure_connected()
        key = self._profile_key(user_id)

        async with self._client.pipeline(transaction=True) as pipe:
            pipe.hincrby(key, field, amount)
            pipe.expire(key, REDIS_RISK_PROFILE_TTL)
            results = await pipe.execute()

        new_value = results[0]
        logger.debug(
            "Incremented %s for user %s by %d → %d",
            field, user_id, amount, new_value,
        )
        return new_value

    async def increment_velocity_float(
        self, user_id: str, field: str, amount: float
    ) -> float:
        """
        Atomically increment a float field in a user's risk profile.

        Used for monetary counters like total_load_mtd_inr.

        Args:
            user_id: UUID string of the user.
            field: The field name to increment (e.g., "total_load_mtd_inr").
            amount: The float increment value.

        Returns:
            The new value of the field after incrementing.
        """
        self._ensure_connected()
        key = self._profile_key(user_id)

        async with self._client.pipeline(transaction=True) as pipe:
            pipe.hincrbyfloat(key, field, amount)
            pipe.expire(key, REDIS_RISK_PROFILE_TTL)
            results = await pipe.execute()

        new_value = results[0]
        logger.debug(
            "Incremented %s for user %s by %.2f → %.2f",
            field, user_id, amount, new_value,
        )
        return new_value

    # ==========================================================================
    # Bulk Operations (for batch processing)
    # ==========================================================================

    async def bulk_get_profiles(
        self, user_ids: list[str]
    ) -> dict[str, Optional[dict]]:
        """
        Retrieve risk profiles for multiple users in a single pipeline call.

        Uses Redis pipeline to minimize round trips for batch operations
        (e.g., batch fraud scoring, periodic reports).

        Args:
            user_ids: List of user UUID strings.

        Returns:
            Dictionary mapping user_id → profile dict (or None if not found).
        """
        self._ensure_connected()

        if not user_ids:
            return {}

        async with self._client.pipeline(transaction=False) as pipe:
            for user_id in user_ids:
                pipe.hgetall(self._profile_key(user_id))
            results = await pipe.execute()

        profiles = {}
        for user_id, profile in zip(user_ids, results):
            profiles[user_id] = profile if profile else None

        logger.info(
            "Bulk retrieved %d profiles (%d found)",
            len(user_ids),
            sum(1 for p in profiles.values() if p is not None),
        )
        return profiles

    # ==========================================================================
    # Health Check
    # ==========================================================================

    async def health_check(self) -> bool:
        """
        Check Redis connectivity.

        Returns:
            True if Redis responds to PING, False otherwise.
        """
        try:
            self._ensure_connected()
            result = await self._client.ping()
            return result
        except Exception as e:
            logger.error("Redis health check failed: %s", str(e))
            return False


# ==============================================================================
# Module-level singleton instance
# Used by FastAPI dependency injection via app.state
# ==============================================================================
feature_store = RedisFeatureStore()
