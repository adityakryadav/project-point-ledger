import pytest
from unittest.mock import AsyncMock, MagicMock
import asyncio

from core.redis_feature_store import RedisFeatureStore
from core.config import FRAUD_FEATURE_FIELDS


@pytest.fixture
def mock_redis():
    mock_client = AsyncMock()
    
    # Mock pipeline
    mock_pipeline = AsyncMock()
    mock_pipeline.execute = AsyncMock(return_value=[1]) # For hincrby returns
    
    # pipeline() is a sync call returning an async context manager
    mock_client.pipeline = MagicMock()
    mock_client.pipeline.return_value.__aenter__.return_value = mock_pipeline
    
    return mock_client

@pytest.fixture
def feature_store(mock_redis):
    store = RedisFeatureStore()
    store._client = mock_redis
    store._pool = MagicMock()
    return store

def test_get_risk_profile_exists(feature_store, mock_redis):
    async def _test():
        mock_profile = {"velocity_1h": "5", "device_id_hash": "abc"}
        mock_redis.hgetall.return_value = mock_profile
        
        profile = await feature_store.get_risk_profile("test-user")
        
        assert profile == mock_profile
        mock_redis.hgetall.assert_called_once_with("risk_profile:test-user")
    asyncio.run(_test())


def test_get_risk_profile_not_exists(feature_store, mock_redis):
    async def _test():
        mock_redis.hgetall.return_value = {}
        
        profile = await feature_store.get_risk_profile("test-user")
        
        assert profile is None
    asyncio.run(_test())

def test_set_risk_profile(feature_store, mock_redis):
    async def _test():
        profile = {"velocity_1h": 5}
        await feature_store.set_risk_profile("test-user", profile)
        
        pipe = mock_redis.pipeline.return_value.__aenter__.return_value
        pipe.delete.assert_called_once_with("risk_profile:test-user")
        pipe.hset.assert_called_once_with("risk_profile:test-user", mapping=profile)
        pipe.execute.assert_called_once()
    asyncio.run(_test())


def test_get_feature_vector(feature_store, mock_redis):
    async def _test():
        # Mock hmget to return values in order of FRAUD_FEATURE_FIELDS
        mock_values = ["10", "25", "15000.5"] + ["0"] * (len(FRAUD_FEATURE_FIELDS) - 3)
        mock_redis.hmget.return_value = mock_values
        
        vector = await feature_store.get_feature_vector("test-user")
        
        assert vector is not None
        assert len(vector) == len(FRAUD_FEATURE_FIELDS)
        assert vector[0] == 10.0
        assert vector[1] == 25.0
        assert vector[2] == 15000.5
    asyncio.run(_test())


def test_increment_velocity(feature_store, mock_redis):
    async def _test():
        new_val = await feature_store.increment_velocity("test-user", "velocity_1h", 2)
        
        pipe = mock_redis.pipeline.return_value.__aenter__.return_value
        pipe.hincrby.assert_called_once_with("risk_profile:test-user", "velocity_1h", 2)
        
        assert new_val == 1
    asyncio.run(_test())
