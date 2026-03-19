"""
ILPEP Intelligence ML Service — Synthetic Fraud Data Generator

Generates realistic synthetic training data for the XGBoost fraud classifier.
Simulates Indian financial fraud patterns specific to loyalty point exchanges:

Fraud Patterns Modeled:
    1. Smurfing        — high velocity, small amounts to stay under detection
    2. Device Farming  — multiple devices, geographic dispersion
    3. Velocity Abuse  — abnormal transaction frequency bursts
    4. Load Exploitation — approaching PPI limits rapidly

Normal Pattern:
    - Moderate velocity, single/dual device, reasonable amounts
    - Follows expected distributions for legitimate ILPEP users

Output:
    CSV file with 11 features + 1 label (is_fraud: 0 or 1)
    Features match FraudFeatureTransformer output exactly.

Usage:
    python -m training.data.generate_synthetic_data
    python -m training.data.generate_synthetic_data --samples 20000 --fraud-ratio 0.15
"""

import argparse
import logging
import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ==============================================================================
# Feature Definitions (must match feature_engineering.py exactly)
# ==============================================================================

FEATURE_COLUMNS = [
    # Raw features (from Redis risk_profile)
    "velocity_1h",
    "velocity_24h",
    "total_load_mtd_inr",
    "device_count_30d",
    "exchange_frequency",
    "avg_txn_amount",
    # Engineered features (from FraudFeatureTransformer)
    "velocity_ratio_1h_24h",
    "amount_deviation",
    "load_utilization_pct",
    "device_risk_score",
    "hours_since_last_txn",
]

LABEL_COLUMN = "is_fraud"


# ==============================================================================
# Normal Transaction Generator
# ==============================================================================

def generate_normal_transactions(n_samples: int, rng: np.random.Generator) -> pd.DataFrame:
    """
    Generate synthetic normal (non-fraudulent) transactions.

    Normal users exhibit:
    - Low to moderate velocity (1-5 txns/hour, 5-30 txns/day)
    - 1-2 devices in 30 days
    - Reasonable transaction amounts (₹500 - ₹5,000)
    - Load well within PPI limits
    - Regular time gaps between transactions
    """
    data = {
        # Raw features
        "velocity_1h": rng.poisson(2, n_samples).clip(0, 8),
        "velocity_24h": rng.poisson(10, n_samples).clip(1, 40),
        "total_load_mtd_inr": rng.uniform(500, 7000, n_samples),
        "device_count_30d": rng.choice([1, 1, 1, 2, 2], n_samples),
        "exchange_frequency": rng.poisson(5, n_samples).clip(1, 20),
        "avg_txn_amount": rng.uniform(500, 5000, n_samples),
    }

    df = pd.DataFrame(data)

    # Engineered features (derived consistently)
    df["velocity_ratio_1h_24h"] = df["velocity_1h"] / df["velocity_24h"].clip(lower=1)
    df["amount_deviation"] = rng.uniform(-0.3, 0.5, n_samples)
    df["load_utilization_pct"] = df["total_load_mtd_inr"] / 10_000.0
    df["device_risk_score"] = (df["device_count_30d"] - 1) / 2.0
    df["device_risk_score"] = df["device_risk_score"].clip(0, 1)
    df["hours_since_last_txn"] = rng.exponential(8, n_samples).clip(0.5, 200)

    df[LABEL_COLUMN] = 0
    return df


# ==============================================================================
# Fraud Transaction Generators
# ==============================================================================

def generate_smurfing_transactions(n_samples: int, rng: np.random.Generator) -> pd.DataFrame:
    """
    Smurfing pattern: rapid small transactions to avoid detection thresholds.

    Characteristics:
    - Very high velocity (10-30 txns/hour)
    - Very small amounts (₹100 - ₹500) — stays under ₹50K STR threshold
    - High load utilization (approaching PPI limits)
    - Short time between transactions
    """
    data = {
        "velocity_1h": rng.poisson(18, n_samples).clip(8, 35),
        "velocity_24h": rng.poisson(60, n_samples).clip(30, 120),
        "total_load_mtd_inr": rng.uniform(7000, 9800, n_samples),
        "device_count_30d": rng.choice([1, 2, 2, 3], n_samples),
        "exchange_frequency": rng.poisson(25, n_samples).clip(15, 50),
        "avg_txn_amount": rng.uniform(100, 500, n_samples),
    }

    df = pd.DataFrame(data)
    df["velocity_ratio_1h_24h"] = df["velocity_1h"] / df["velocity_24h"].clip(lower=1)
    df["amount_deviation"] = rng.uniform(-0.8, -0.3, n_samples)  # Below average
    df["load_utilization_pct"] = df["total_load_mtd_inr"] / 10_000.0
    df["device_risk_score"] = (df["device_count_30d"] - 1) / 2.0
    df["device_risk_score"] = df["device_risk_score"].clip(0, 1)
    df["hours_since_last_txn"] = rng.exponential(0.5, n_samples).clip(0.01, 2)

    df[LABEL_COLUMN] = 1
    return df


def generate_device_farming_transactions(n_samples: int, rng: np.random.Generator) -> pd.DataFrame:
    """
    Device farming pattern: multiple devices simulating different users.

    Characteristics:
    - 4+ unique devices in 30 days
    - Moderate velocity but spread across devices
    - Varied amounts and locations
    - High device risk score
    """
    data = {
        "velocity_1h": rng.poisson(5, n_samples).clip(2, 15),
        "velocity_24h": rng.poisson(20, n_samples).clip(8, 50),
        "total_load_mtd_inr": rng.uniform(3000, 8000, n_samples),
        "device_count_30d": rng.choice([4, 5, 6, 7, 8], n_samples),
        "exchange_frequency": rng.poisson(15, n_samples).clip(8, 35),
        "avg_txn_amount": rng.uniform(800, 3000, n_samples),
    }

    df = pd.DataFrame(data)
    df["velocity_ratio_1h_24h"] = df["velocity_1h"] / df["velocity_24h"].clip(lower=1)
    df["amount_deviation"] = rng.uniform(-0.2, 0.8, n_samples)
    df["load_utilization_pct"] = df["total_load_mtd_inr"] / 10_000.0
    df["device_risk_score"] = (df["device_count_30d"] - 1) / 2.0
    df["device_risk_score"] = df["device_risk_score"].clip(0, 1)
    df["hours_since_last_txn"] = rng.exponential(3, n_samples).clip(0.1, 30)

    df[LABEL_COLUMN] = 1
    return df


def generate_velocity_abuse_transactions(n_samples: int, rng: np.random.Generator) -> pd.DataFrame:
    """
    Velocity abuse pattern: sudden burst of high-value transactions.

    Characteristics:
    - Extreme velocity ratio (1h velocity close to 24h velocity)
    - Large transaction amounts (₹5,000 - ₹15,000)
    - Very high amount deviation from user average
    - Very short gaps between transactions
    """
    data = {
        "velocity_1h": rng.poisson(12, n_samples).clip(6, 25),
        "velocity_24h": rng.poisson(15, n_samples).clip(7, 30),
        "total_load_mtd_inr": rng.uniform(5000, 9500, n_samples),
        "device_count_30d": rng.choice([1, 2, 3], n_samples),
        "exchange_frequency": rng.poisson(20, n_samples).clip(10, 40),
        "avg_txn_amount": rng.uniform(5000, 15000, n_samples),
    }

    df = pd.DataFrame(data)
    df["velocity_ratio_1h_24h"] = df["velocity_1h"] / df["velocity_24h"].clip(lower=1)
    df["amount_deviation"] = rng.uniform(1.5, 5.0, n_samples)  # Well above average
    df["load_utilization_pct"] = df["total_load_mtd_inr"] / 10_000.0
    df["device_risk_score"] = (df["device_count_30d"] - 1) / 2.0
    df["device_risk_score"] = df["device_risk_score"].clip(0, 1)
    df["hours_since_last_txn"] = rng.exponential(0.3, n_samples).clip(0.01, 1)

    df[LABEL_COLUMN] = 1
    return df


def generate_load_exploitation_transactions(n_samples: int, rng: np.random.Generator) -> pd.DataFrame:
    """
    Load exploitation pattern: rapidly approaching/exceeding PPI limits.

    Characteristics:
    - Load utilization > 90%
    - High transaction amounts relative to remaining limit
    - Moderate velocity but concentrated loading behavior
    """
    data = {
        "velocity_1h": rng.poisson(6, n_samples).clip(3, 15),
        "velocity_24h": rng.poisson(25, n_samples).clip(10, 50),
        "total_load_mtd_inr": rng.uniform(9000, 10000, n_samples),
        "device_count_30d": rng.choice([1, 2, 3, 4], n_samples),
        "exchange_frequency": rng.poisson(18, n_samples).clip(10, 35),
        "avg_txn_amount": rng.uniform(2000, 8000, n_samples),
    }

    df = pd.DataFrame(data)
    df["velocity_ratio_1h_24h"] = df["velocity_1h"] / df["velocity_24h"].clip(lower=1)
    df["amount_deviation"] = rng.uniform(0.5, 3.0, n_samples)
    df["load_utilization_pct"] = df["total_load_mtd_inr"] / 10_000.0
    df["device_risk_score"] = (df["device_count_30d"] - 1) / 2.0
    df["device_risk_score"] = df["device_risk_score"].clip(0, 1)
    df["hours_since_last_txn"] = rng.exponential(2, n_samples).clip(0.1, 10)

    df[LABEL_COLUMN] = 1
    return df


# ==============================================================================
# Main Generator
# ==============================================================================

def generate_dataset(
    total_samples: int = 10000,
    fraud_ratio: float = 0.20,
    random_seed: int = 42,
) -> pd.DataFrame:
    """
    Generate a complete synthetic fraud detection dataset.

    The fraud samples are split equally across 4 fraud patterns:
    smurfing, device farming, velocity abuse, and load exploitation.

    Args:
        total_samples: Total number of samples to generate.
        fraud_ratio: Fraction of samples that are fraudulent (0.0 to 1.0).
        random_seed: Random seed for reproducibility.

    Returns:
        Shuffled DataFrame with features and labels.
    """
    rng = np.random.default_rng(random_seed)

    n_fraud = int(total_samples * fraud_ratio)
    n_normal = total_samples - n_fraud

    # Split fraud samples across 4 patterns
    n_per_pattern = n_fraud // 4
    n_remainder = n_fraud - (n_per_pattern * 4)

    logger.info(
        "Generating %d samples: %d normal, %d fraud (%.0f%%)",
        total_samples, n_normal, n_fraud, fraud_ratio * 100,
    )

    frames = [
        generate_normal_transactions(n_normal, rng),
        generate_smurfing_transactions(n_per_pattern, rng),
        generate_device_farming_transactions(n_per_pattern, rng),
        generate_velocity_abuse_transactions(n_per_pattern, rng),
        generate_load_exploitation_transactions(n_per_pattern + n_remainder, rng),
    ]

    df = pd.concat(frames, ignore_index=True)
    df = df.sample(frac=1, random_state=random_seed).reset_index(drop=True)

    # Ensure column order matches feature_engineering.py
    df = df[FEATURE_COLUMNS + [LABEL_COLUMN]]

    logger.info("Dataset shape: %s", df.shape)
    logger.info("Fraud distribution:\n%s", df[LABEL_COLUMN].value_counts().to_string())

    return df


# ==============================================================================
# CLI Entry Point
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic fraud detection training data for ILPEP"
    )
    parser.add_argument(
        "--samples", type=int, default=10000,
        help="Total number of samples (default: 10000)"
    )
    parser.add_argument(
        "--fraud-ratio", type=float, default=0.20,
        help="Fraction of fraudulent samples (default: 0.20)"
    )
    parser.add_argument(
        "--seed", type=int, default=42,
        help="Random seed for reproducibility (default: 42)"
    )
    parser.add_argument(
        "--output", type=str, default=None,
        help="Output CSV path (default: training/data/synthetic_fraud_data.csv)"
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    # Default output path
    if args.output is None:
        output_path = Path(__file__).resolve().parent / "synthetic_fraud_data.csv"
    else:
        output_path = Path(args.output)

    # Generate
    df = generate_dataset(
        total_samples=args.samples,
        fraud_ratio=args.fraud_ratio,
        random_seed=args.seed,
    )

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info("Saved dataset to %s", output_path)

    # Summary
    print(f"\n{'='*60}")
    print(f"  Synthetic Fraud Dataset Generated")
    print(f"{'='*60}")
    print(f"  Total samples : {len(df):,}")
    print(f"  Normal (0)    : {(df[LABEL_COLUMN]==0).sum():,}")
    print(f"  Fraud  (1)    : {(df[LABEL_COLUMN]==1).sum():,}")
    print(f"  Features      : {len(FEATURE_COLUMNS)}")
    print(f"  Output        : {output_path}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
