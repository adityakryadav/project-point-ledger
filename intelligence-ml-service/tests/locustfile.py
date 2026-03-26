from locust import HttpUser, task, between
import random

class MLServiceLoadTest(HttpUser):
    # Wait between 0.1 and 0.5 seconds between tasks
    wait_time = between(0.1, 0.5)

    @task(3)
    def test_pricing_endpoint(self):
        """Simulate high volume of dynamic pricing requests"""
        payload = {
            "user_id": f"load-user-{random.randint(1, 1000)}",
            "partner_id": f"partner-{random.randint(1, 5)}",
            "source_points": random.uniform(100.0, 10000.0),
            "partner_inventory": 5000.0,
            "partner_redemption_rate": 0.85,
            "user_exchange_frequency": random.randint(1, 20),
            "market_demand_index": random.uniform(0.1, 1.0)
        }
        # The expected p95 latency is < 200ms
        with self.client.post("/api/v1/pricing/quote", json=payload, catch_response=True) as response:
            if response.elapsed.total_seconds() > 0.2:
                response.failure(f"Latency exceeded 200ms threshold: {response.elapsed.total_seconds()}s")
            elif response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(2)
    def test_fraud_scoring_endpoint(self):
        """Simulate fraud scoring checks triggered after pricing quote"""
        payload = {
            "user_id": f"load-user-{random.randint(1, 1000)}",
            "device_hash": f"device-xyz-{random.randint(1,100)}",
            "amount": random.uniform(100.0, 50000.0),
            "kyc_status": random.choice(["SMALL", "FULL"])
        }
        with self.client.post("/api/v1/fraud/score", json=payload, catch_response=True) as response:
            if response.elapsed.total_seconds() > 0.2:
                response.failure(f"Latency exceeded 200ms threshold: {response.elapsed.total_seconds()}s")
            elif response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")
