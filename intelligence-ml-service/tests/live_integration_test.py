import pytest
from fastapi.testclient import TestClient
from main import app

def test_live_integration_flow():
    """
    Test the live integration flow simulating a TransactionProcessor orchestrating
    calls to both the pricing and fraud ML endpoints back-to-back.
    """
    with TestClient(app) as client:
        # 1. Fetch Dynamic Price
        pricing_payload = {
            "user_id": "test-user-e2e",
            "partner_id": "partner-e2e",
            "source_points": 1500.0,
            "partner_inventory": 5000.0,
            "partner_redemption_rate": 0.90,
            "user_exchange_frequency": 3,
            "market_demand_index": 0.8
        }
        
        price_response = client.post("/api/v1/pricing/quote", json=pricing_payload)
        
        assert price_response.status_code == 200
        price_data = price_response.json()
        assert "exchange_rate" in price_data
        
        exchange_rate = price_data["exchange_rate"]
        
        # 2. Fetch Fraud Score using the evaluated amount
        amount_inr = 1500.0 * exchange_rate
        
        fraud_payload = {
            "user_id": "test-user-e2e",
            "device_hash": "device-xyz123",
            "amount": amount_inr,
            "kyc_status": "FULL"
        }
        
        fraud_response = client.post("/api/v1/fraud/score", json=fraud_payload)
        
        assert fraud_response.status_code == 200
        fraud_data = fraud_response.json()
        assert "fraud_score" in fraud_data
        assert "decision" in fraud_data
        
        assert fraud_data["fraud_score"] >= 0.0
        assert fraud_data["fraud_score"] <= 1.0
