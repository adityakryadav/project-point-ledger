"""
ILPEP Intelligence ML Service — KL Divergence Monitor

Background worker that simulates a weekly cron job to detect feature drift.
It compares a "reference" baseline distribution with "recent" production data
using Kullback-Leibler (KL) Divergence.

If the KL divergence exceeds a threshold, it logs an alert to trigger auto-retraining.
"""

import asyncio
import logging
import random
from typing import List

import numpy as np
from scipy.stats import entropy

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

KL_DRIFT_THRESHOLD = 0.10

def generate_reference_distribution() -> List[float]:
    """Simulate a baseline distribution of a feature (e.g., amount_inr) from training data."""
    # Normal distribution around 5000
    data = np.random.normal(loc=5000.0, scale=1500.0, size=1000)
    data = np.clip(data, 100, 10000)
    return data.tolist()

def generate_recent_distribution(drift: bool = False) -> List[float]:
    """Simulate recent production data. If drift=True, change the distribution shape."""
    if drift:
        # Shifted distribution (simulating drift)
        data = np.random.normal(loc=6500.0, scale=2000.0, size=1000)
    else:
        # Similar to baseline
        data = np.random.normal(loc=5100.0, scale=1550.0, size=1000)
    
    data = np.clip(data, 100, 10000)
    return data.tolist()

def compute_kl_divergence(baseline: List[float], recent: List[float]) -> float:
    """Compute KL Divergence between two empirical samples using histograms."""
    # Define common bins for both distributions
    bins = np.linspace(100, 10000, 50)
    
    # Calculate histograms
    p_counts, _ = np.histogram(baseline, bins=bins)
    q_counts, _ = np.histogram(recent, bins=bins)
    
    # Add a small epsilon to avoid division by zero or log(0)
    p_counts = p_counts + 1e-10
    q_counts = q_counts + 1e-10
    
    # Normalize to create probability distributions
    p_probs = p_counts / np.sum(p_counts)
    q_probs = q_counts / np.sum(q_counts)
    
    # Calculate KL Divergence
    kl_div = entropy(pk=q_probs, qk=p_probs) # Scipy entropy: sum(pk * log(pk/qk))
    return float(kl_div)

async def check_for_drift(feature_name: str, baseline: List[float], recent: List[float]) -> None:
    """Evaluate drift for a specific feature."""
    logger.info("Computing KL divergence for feature: %s", feature_name)
    
    kl_div = compute_kl_divergence(baseline, recent)
    logger.info("KL Divergence score for %s: %.4f (Threshold: %.4f)", feature_name, kl_div, KL_DRIFT_THRESHOLD)
    
    if kl_div > KL_DRIFT_THRESHOLD:
        logger.warning("[ALERT] Feature drift detected in '%s'! (Score: %.4f > %.4f)", 
                       feature_name, kl_div, KL_DRIFT_THRESHOLD)
        logger.warning("=> Triggering auto-retraining pipeline...")
        # In a real system, this could trigger an Airflow DAG or an API call to a training service.
    else:
        logger.info("[OK] Feature '%s' is stable. No retraining required.", feature_name)

async def main():
    logger.info("Starting KL Divergence Monitor (Weekly Cron)...")
    
    # Simulating the reference data from ModelRegistry metadata
    logger.info("Loading baseline reference feature distributions...")
    baseline_amount = generate_reference_distribution()
    
    # Simulating data pulled from Redis Feature Store for the last 7 days
    logger.info("Fetching recent feature distributions from Feature Store...")
    # By default, we simulate a drift scenario to demonstrate the alert
    simulate_drift_scenario = True
    recent_amount = generate_recent_distribution(drift=simulate_drift_scenario)
    
    await asyncio.sleep(1.0) # Simulate DB/Redis latency
    
    # Check for drift
    await check_for_drift("amount_inr", baseline_amount, recent_amount)
    
    logger.info("KL Divergence check complete.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Exiting monitor.")
