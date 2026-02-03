import pytest
import time
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from core.config import API_VERSION

client = TestClient(app)

@patch("api.fraud_scoring_routes.registry")
@patch("api.fraud_scoring_routes.feature_store")
@patch("api.fraud_scoring_routes.fraud_transformer")
def test_fraud_scoring_latency(mock_transformer, mock_feature_store, mock_registry):
    # Setup mocks
    mock_registry.is_model_loaded.return_value = True
    mock_registry.get_version.return_value = "v1.0.0"
    mock_model = MagicMock()
    mock_model.predict_proba.return_value = [[0.9, 0.1]]
    mock_registry.get_model.return_value = mock_model
    
    from unittest.mock import AsyncMock
    mock_feature_store.get_risk_profile = AsyncMock(return_value={})
    
    import numpy as np
    mock_transformer.transform.return_value = np.array([1.0])

    # Warmup
    _ = client.post(
        f"/api/{API_VERSION}/fraud/score",
        json={"user_id": "u1", "device_hash": "d1", "amount": 100.0, "kyc_status": "SMALL"}
    )
    
    latencies = []
    # Test 20 requests to ensure average is < 200ms
    for i in range(20):
        start = time.perf_counter()
        response = client.post(
            f"/api/{API_VERSION}/fraud/score",
            json={"user_id": f"u{i}", "device_hash": f"d{i}", "amount": 100.0, "kyc_status": "SMALL"}
        )
        end = time.perf_counter()
        assert response.status_code == 200
        latencies.append((end - start)*1000)
        
    avg_latency = sum(latencies)/len(latencies)
    assert avg_latency < 200.0, f"Latency {avg_latency:.2f}ms exceeds requirement of <200ms"

@patch("api.dynamic_pricing_routes.registry")
@patch("api.dynamic_pricing_routes.pricing_transformer")
@patch("api.dynamic_pricing_routes._quote_cooldowns", {})
def test_dynamic_pricing_latency(mock_transformer, mock_registry):
    mock_registry.is_model_loaded.return_value = True
    mock_registry.get_version.return_value = "v1.0.0"
    mock_registry.get_metadata.return_value = {}
    
    mock_model = MagicMock()
    import torch
    # Mocking DQN return of Q values
    mock_model.return_value = torch.FloatTensor([[0.1, 0.5, 0.9, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]])
    mock_registry.get_model.return_value = mock_model
    
    import numpy as np
    mock_transformer.transform.return_value = np.array([1.0, 0.5, 3, 0.8])

    latencies = []
    for i in range(20):
        start = time.perf_counter()
        response = client.post(
            f"/api/{API_VERSION}/pricing/quote",
            json={
                "user_id": f"u{i}",
                "partner_id": f"p{i}",
                "source_points": 1000,
                "partner_inventory": 50000,
                "partner_redemption_rate": 0.8,
                "user_exchange_frequency": 3,
                "market_demand_index": 0.7
            }
        )
        end = time.perf_counter()
        assert response.status_code == 200
        latencies.append((end - start)*1000)
        
    avg_latency = sum(latencies)/len(latencies)
    assert avg_latency < 200.0, f"Latency {avg_latency:.2f}ms exceeds requirement of <200ms"
