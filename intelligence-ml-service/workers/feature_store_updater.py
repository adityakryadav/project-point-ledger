"""
ILPEP Intelligence ML Service — Feature Store Updater

Background worker that consumes transaction events and asynchronously
updates user risk profiles in the Redis Feature Store.

In production, this would consume from a message broker like Kafka or RabbitMQ.
For Phase 3/Day 9, this script simulates event consumption.
"""

import asyncio
import json
import logging
import random
import uuid
from datetime import datetime

from core.redis_feature_store import feature_store

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

async def process_transaction_event(event_data: dict) -> None:
    """
    Process a single transaction event and update the user's risk profile.
    
    Expected event payload:
    {
        "event_type": "EXCHANGE_COMPLETED",
        "user_id": "uuid",
        "amount_inr": 5000.0,
        "device_hash": "a1b2c3d4",
        "timestamp": "2026-03-24T10:00:00Z"
    }
    """
    user_id = event_data.get("user_id")
    if not user_id:
        logger.error("Event missing user_id: %s", event_data)
        return

    amount_inr = event_data.get("amount_inr", 0.0)
    
    # 1. Update basic fields (e.g., last transaction time, device hash)
    await feature_store.update_risk_profile(user_id, {
        "last_txn_timestamp": event_data.get("timestamp", datetime.utcnow().isoformat() + "Z"),
        "device_id_hash": event_data.get("device_hash", "unknown"),
    })

    # 2. Increment counters
    # Increment exchange frequency counter for the user
    await feature_store.increment_velocity(user_id, "exchange_frequency", 1)
    
    # Increment velocity metrics
    await feature_store.increment_velocity(user_id, "velocity_1h", 1)
    await feature_store.increment_velocity(user_id, "velocity_24h", 1)

    # Increment monetary counters
    if amount_inr > 0:
        await feature_store.increment_velocity_float(user_id, "total_load_mtd_inr", amount_inr)
    
    logger.info("Processed event and updated profile for %s", user_id)

async def simulate_event_stream():
    """Simulates an incoming stream of transaction events."""
    logger.info("Starting simulated event consumer...")
    
    sample_users = [str(uuid.uuid4()) for _ in range(5)]
    
    while True:
        await asyncio.sleep(random.uniform(2.0, 5.0))
        
        # Generate mock event
        event = {
            "event_type": "EXCHANGE_COMPLETED",
            "user_id": random.choice(sample_users),
            "amount_inr": round(random.uniform(100.0, 10000.0), 2),
            "device_hash": "mock_device_hash",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        logger.info("[EVENT_RECEIVED] %s", json.dumps(event))
        await process_transaction_event(event)

async def main():
    await feature_store.connect()
    try:
        await simulate_event_stream()
    except asyncio.CancelledError:
        logger.info("Worker shutting down...")
    finally:
        await feature_store.disconnect()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Exiting feature store updater.")
