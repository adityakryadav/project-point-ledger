import pytest
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
def test_fraud_score_accuracy_blocked(mock_transformer, mock_feature_store, mock_registry):
    mock_registry.is_model_loaded.return_value = True
    mock_registry.get_version.return_value = "v1.0.0"
    
    # Mock high fraud probability -> BLOCKED
    mock_model = MagicMock()
    mock_model.predict_proba.return_value = [[0.1, 0.95]]
    mock_registry.get_model.return_value = mock_model
    
    # Mock feature store
    from unittest.mock import AsyncMock
    mock_feature_store.get_risk_profile = AsyncMock(return_value={"hist_auth_count": 5})

    # Mock transformer
    import numpy as np
    mock_transformer.transform.return_value = np.array([1.0, 2.0, 3.0])

    response = client.post(
        f"/api/{API_VERSION}/fraud/score",
        json={
            "user_id": "user-123",
            "device_hash": "hash123",
            "amount": 10000.0,
            "kyc_status": "FULL"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["fraud_score"] == 0.95
    assert data["decision"] == "BLOCKED"

@patch("api.fraud_scoring_routes.registry")
@patch("api.fraud_scoring_routes.feature_store")
@patch("api.fraud_scoring_routes.fraud_transformer")
def test_fraud_score_accuracy_authorized(mock_transformer, mock_feature_store, mock_registry):
    mock_registry.is_model_loaded.return_value = True
    mock_registry.get_version.return_value = "v1.0.0"
    
    # Mock low fraud probability -> AUTHORIZED
    mock_model = MagicMock()
    mock_model.predict_proba.return_value = [[0.9, 0.10]]
    mock_registry.get_model.return_value = mock_model
    
    from unittest.mock import AsyncMock
    mock_feature_store.get_risk_profile = AsyncMock(return_value=None)

    import numpy as np
    mock_transformer.transform.return_value = np.array([0.0, 0.0])

    response = client.post(
        f"/api/{API_VERSION}/fraud/score",
        json={
            "user_id": "user-safe",
            "device_hash": "hash-safe",
            "amount": 100.0,
            "kyc_status": "SMALL"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["fraud_score"] == 0.10
    assert data["decision"] == "AUTHORIZED"
