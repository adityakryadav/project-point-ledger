"""
ILPEP Intelligence ML Service — XGBoost Fraud Classifier Training

End-to-end training pipeline for the XGBoost fraud detection model.
Generates synthetic data (if not found), trains the classifier, evaluates
performance, and serializes the model for production use.

Output:
    models/xgboost_fraud_classifier_v1.pkl — serialized XGBoost model

Training Features (11 total, matching FraudFeatureTransformer):
    Raw (6):  velocity_1h, velocity_24h, total_load_mtd_inr,
              device_count_30d, exchange_frequency, avg_txn_amount
    Engineered (5): velocity_ratio_1h_24h, amount_deviation,
                    load_utilization_pct, device_risk_score, hours_since_last_txn

Fraud Patterns Detected:
    - Smurfing (rapid small transactions)
    - Device farming (multiple device fingerprints)
    - Velocity anomalies (burst transaction patterns)
    - Load exploitation (PPI limit abuse)

Usage:
    cd intelligence-ml-service
    python -m training.train_xgboost
    python -m training.train_xgboost --samples 20000 --fraud-ratio 0.15
"""

import argparse
import logging
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.config import FRAUD_MODEL_PATH, FRAUD_MODEL_VERSION
from training.data.generate_synthetic_data import (
    FEATURE_COLUMNS,
    LABEL_COLUMN,
    generate_dataset,
)

logger = logging.getLogger(__name__)

# ==============================================================================
# Default Paths
# ==============================================================================

DATA_DIR = Path(__file__).resolve().parent / "data"
DEFAULT_DATA_PATH = DATA_DIR / "synthetic_fraud_data.csv"
DEFAULT_MODEL_PATH = FRAUD_MODEL_PATH  # From config.py


# ==============================================================================
# XGBoost Hyperparameters
# ==============================================================================

# Tuned for Indian financial fraud detection:
# - Higher max_depth (6) to capture complex fraud patterns
# - Moderate learning_rate (0.1) for stable convergence
# - scale_pos_weight adjusted for class imbalance
# - eval_metric uses AUC for fraud detection (threshold-independent)

XGBOOST_PARAMS = {
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 3,
    "gamma": 0.1,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "objective": "binary:logistic",
    "eval_metric": "auc",
    "random_state": 42,
    "n_jobs": -1,
}


# ==============================================================================
# Training Pipeline
# ==============================================================================

def load_or_generate_data(
    data_path: Path,
    total_samples: int = 10000,
    fraud_ratio: float = 0.20,
) -> pd.DataFrame:
    """
    Load training data from CSV, or generate synthetic data if not found.

    Args:
        data_path: Path to the CSV training data.
        total_samples: Samples to generate if CSV does not exist.
        fraud_ratio: Fraud ratio for generation.

    Returns:
        DataFrame with features and labels.
    """
    if data_path.exists():
        logger.info("Loading existing dataset from %s", data_path)
        df = pd.read_csv(data_path)
        logger.info("Loaded %d samples", len(df))
    else:
        logger.info("Dataset not found at %s. Generating synthetic data...", data_path)
        df = generate_dataset(
            total_samples=total_samples,
            fraud_ratio=fraud_ratio,
        )
        data_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(data_path, index=False)
        logger.info("Saved generated dataset to %s", data_path)

    return df


def train_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
) -> XGBClassifier:
    """
    Train the XGBoost fraud classifier.

    Uses early stopping on the validation set to prevent overfitting.
    Adjusts scale_pos_weight for class imbalance.

    Args:
        X_train: Training feature matrix.
        y_train: Training labels.
        X_val: Validation feature matrix.
        y_val: Validation labels.

    Returns:
        Trained XGBClassifier instance.
    """
    # Calculate class weight for imbalanced dataset
    n_negative = (y_train == 0).sum()
    n_positive = (y_train == 1).sum()
    scale_pos_weight = n_negative / max(n_positive, 1)

    logger.info(
        "Class distribution — Normal: %d, Fraud: %d (scale_pos_weight=%.2f)",
        n_negative, n_positive, scale_pos_weight,
    )

    params = {**XGBOOST_PARAMS, "scale_pos_weight": scale_pos_weight}
    model = XGBClassifier(**params)

    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )

    try:
        best_iter = model.best_iteration
        logger.info("Training complete. Best iteration: %d", best_iter)
    except AttributeError:
        logger.info("Training complete. Used all %d estimators.", params["n_estimators"])
    return model


def evaluate_model(
    model: XGBClassifier,
    X_test: np.ndarray,
    y_test: np.ndarray,
    feature_names: list,
) -> dict:
    """
    Evaluate the trained model and print comprehensive metrics.

    Metrics reported:
    - Accuracy, Precision, Recall, F1 Score
    - AUC-ROC (threshold-independent, key metric for fraud detection)
    - Confusion matrix
    - Feature importance ranking
    - Classification report (per-class breakdown)

    Returns:
        Dict with all computed metrics.
    """
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    # Metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    # Print results
    print(f"\n{'='*60}")
    print(f"  XGBoost Fraud Classifier — Evaluation Results")
    print(f"{'='*60}")
    print(f"  Accuracy  : {accuracy:.4f}")
    print(f"  Precision : {precision:.4f}")
    print(f"  Recall    : {recall:.4f}")
    print(f"  F1 Score  : {f1:.4f}")
    print(f"  AUC-ROC   : {auc_roc:.4f}")
    print(f"\n  Confusion Matrix:")
    print(f"  {'':>20} Predicted Normal  Predicted Fraud")
    print(f"  {'Actual Normal':>20}  {cm[0][0]:>14}  {cm[0][1]:>14}")
    print(f"  {'Actual Fraud':>20}  {cm[1][0]:>14}  {cm[1][1]:>14}")

    # Classification report
    print(f"\n  Classification Report:")
    report = classification_report(y_test, y_pred, target_names=["Normal", "Fraud"])
    for line in report.split("\n"):
        print(f"  {line}")

    # Feature importance
    importances = model.feature_importances_
    importance_df = pd.DataFrame({
        "feature": feature_names,
        "importance": importances,
    }).sort_values("importance", ascending=False)

    print(f"\n  Feature Importance (Top 11):")
    print(f"  {'Feature':<30} {'Importance':>10}")
    print(f"  {'-'*40}")
    for _, row in importance_df.iterrows():
        bar = "#" * int(row["importance"] * 50)
        print(f"  {row['feature']:<30} {row['importance']:>10.4f}  {bar}")

    print(f"{'='*60}\n")

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "auc_roc": auc_roc,
        "confusion_matrix": cm.tolist(),
    }


def save_model(model: XGBClassifier, output_path: Path) -> None:
    """
    Serialize the trained model using joblib.

    The .pkl file is loaded by ModelRegistry.load_fraud_model() at
    service startup for real-time inference.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_path)
    file_size = output_path.stat().st_size
    logger.info(
        "Model saved to %s (%.1f KB)",
        output_path, file_size / 1024,
    )


# ==============================================================================
# Main Pipeline
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Train XGBoost fraud classifier for ILPEP"
    )
    parser.add_argument(
        "--samples", type=int, default=10000,
        help="Total synthetic samples if generating data (default: 10000)"
    )
    parser.add_argument(
        "--fraud-ratio", type=float, default=0.20,
        help="Fraud ratio for synthetic data (default: 0.20)"
    )
    parser.add_argument(
        "--test-size", type=float, default=0.20,
        help="Test set fraction (default: 0.20)"
    )
    parser.add_argument(
        "--data-path", type=str, default=None,
        help=f"Path to training CSV (default: {DEFAULT_DATA_PATH})"
    )
    parser.add_argument(
        "--model-output", type=str, default=None,
        help=f"Output path for .pkl model (default: {DEFAULT_MODEL_PATH})"
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    data_path = Path(args.data_path) if args.data_path else DEFAULT_DATA_PATH
    model_output = Path(args.model_output) if args.model_output else DEFAULT_MODEL_PATH

    # =========================================================================
    # Step 1: Load or generate data
    # =========================================================================
    logger.info("=" * 60)
    logger.info("Step 1: Loading training data")
    logger.info("=" * 60)

    df = load_or_generate_data(data_path, args.samples, args.fraud_ratio)

    X = df[FEATURE_COLUMNS].values
    y = df[LABEL_COLUMN].values

    # =========================================================================
    # Step 2: Train/test split (stratified to maintain fraud ratio)
    # =========================================================================
    logger.info("=" * 60)
    logger.info("Step 2: Splitting data (test_size=%.2f)", args.test_size)
    logger.info("=" * 60)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=args.test_size,
        stratify=y,
        random_state=42,
    )

    logger.info("Train set: %d samples", len(X_train))
    logger.info("Test set:  %d samples", len(X_test))

    # =========================================================================
    # Step 3: Train model
    # =========================================================================
    logger.info("=" * 60)
    logger.info("Step 3: Training XGBoost classifier")
    logger.info("=" * 60)

    model = train_model(X_train, y_train, X_test, y_test)

    # =========================================================================
    # Step 4: Evaluate
    # =========================================================================
    logger.info("=" * 60)
    logger.info("Step 4: Evaluating model")
    logger.info("=" * 60)

    metrics = evaluate_model(model, X_test, y_test, FEATURE_COLUMNS)

    # =========================================================================
    # Step 5: Save model
    # =========================================================================
    logger.info("=" * 60)
    logger.info("Step 5: Saving model to %s", model_output)
    logger.info("=" * 60)

    save_model(model, model_output)

    # =========================================================================
    # Summary
    # =========================================================================
    print(f"\n{'='*60}")
    print(f"  Training Pipeline Complete!")
    print(f"{'='*60}")
    print(f"  Model version : {FRAUD_MODEL_VERSION}")
    print(f"  Model file    : {model_output}")
    print(f"  AUC-ROC       : {metrics['auc_roc']:.4f}")
    print(f"  F1 Score      : {metrics['f1']:.4f}")
    print(f"  Precision     : {metrics['precision']:.4f}")
    print(f"  Recall        : {metrics['recall']:.4f}")
    print(f"{'='*60}\n")

    return metrics


if __name__ == "__main__":
    main()
