# Intelligence ML Service

AI/ML microservice for the ILPEP (Indian Loyalty Points Exchange Platform).

## Responsibilities

- **Fraud Detection**: XGBoost classifier scoring every transaction in real-time (<200ms latency)
- **Dynamic Pricing**: DQN (Deep Q-Network) agent computing optimal exchange rates based on market liquidity
- **Redis Feature Store**: High-speed in-memory profiles for real-time ML inference
- **MLOps**: KL-Divergence drift monitoring with auto-retraining when drift > 0.1

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Python 3.10+ | Primary language |
| FastAPI | Async microservice framework |
| XGBoost | Fraud detection classifier |
| PyTorch | Deep Q-Network pricing agent |
| Redis | In-memory feature store |
| scikit-learn | Feature preprocessing & metrics |
| Docker | Containerization |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health & model status |
| `POST` | `/api/v1/fraud/score` | Real-time fraud scoring |
| `POST` | `/api/v1/pricing/quote` | Dynamic pricing quote |

## Directory Structure

```
├── api/                      # FastAPI route handlers
│   ├── fraud_scoring_routes.py
│   └── dynamic_pricing_routes.py
├── core/                     # Configuration & shared utilities
│   ├── config.py
│   ├── redis_feature_store.py
│   └── feature_engineering.py
├── models/                   # ML model files & registry
│   ├── model_registry.py
│   ├── xgboost_fraud_classifier_v1.pkl
│   └── dqn_pricing_agent_v1.pt
├── workers/                  # Background workers
│   ├── kl_divergence_monitor.py
│   ├── feature_store_updater.py
│   └── retraining_trigger.py
├── training/                 # Model training scripts
│   ├── train_xgboost.py
│   ├── train_dqn.py
│   └── data/
├── tests/                    # Test suite
├── main.py                   # FastAPI entrypoint
├── requirements.txt          # Python dependencies
├── Dockerfile                # Container definition
└── README.md
```

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service locally
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Run with Docker
docker build -t ilpep-ml-service .
docker run -p 8001:8001 ilpep-ml-service
```

## Key Thresholds

| Metric | Value |
|--------|-------|
| Fraud score range | 0.0 (safe) → 1.0 (fraud) |
| Block threshold | ≥ 0.80 |
| Flag threshold | ≥ 0.50 |
| Inference latency | < 200ms |
| KL-Divergence retrain | > 0.1 |
| Quote cooldown | 300 seconds |
