"""
ILPEP Intelligence ML Service — Model Registry

Handles loading, versioning, and lifecycle management of ML models.
Supports XGBoost (.pkl) and PyTorch (.pt) model formats.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class ModelRegistry:
    """
    Central registry for ML model loading and version management.
    
    Responsibilities:
    - Load serialized models from disk (XGBoost .pkl, PyTorch .pt)
    - Track model versions for audit trail (fraud_logs.model_version)
    - Provide thread-safe model access for inference endpoints
    - Support hot-swapping models during auto-retraining
    """

    def __init__(self):
        self._models: Dict[str, Any] = {}
        self._versions: Dict[str, str] = {}
        self._loaded: bool = False

    def load_fraud_model(self, model_path: Path, version: str) -> None:
        """
        Load XGBoost fraud classifier from serialized .pkl file.
        
        Args:
            model_path: Path to the .pkl model file
            version: Model version string (e.g., 'v1.0')
        """
        try:
            import joblib
            
            if not model_path.exists():
                logger.warning(
                    f"Fraud model not found at {model_path}. "
                    "Service will start without fraud scoring capability. "
                    "Train a model first using training/train_xgboost.py"
                )
                return
            
            self._models["fraud"] = joblib.load(model_path)
            self._versions["fraud"] = version
            logger.info(f"Loaded fraud model {version} from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load fraud model: {e}")

    def load_pricing_model(self, model_path: Path, version: str) -> None:
        """
        Load DQN pricing agent from serialized .pt file.
        
        Args:
            model_path: Path to the .pt model file
            version: Model version string (e.g., 'dqn_v1.0')
        """
        try:
            import torch
            
            if not model_path.exists():
                logger.warning(
                    f"Pricing model not found at {model_path}. "
                    "Service will start without dynamic pricing capability. "
                    "Train a model first using training/train_dqn.py"
                )
                return
            
            self._models["pricing"] = torch.load(
                model_path, map_location=torch.device("cpu")
            )
            self._versions["pricing"] = version
            logger.info(f"Loaded pricing model {version} from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load pricing model: {e}")

    def get_model(self, model_name: str) -> Optional[Any]:
        """Get a loaded model by name ('fraud' or 'pricing')."""
        return self._models.get(model_name)

    def get_version(self, model_name: str) -> str:
        """Get the version string for a loaded model."""
        return self._versions.get(model_name, "unknown")

    def is_model_loaded(self, model_name: str) -> bool:
        """Check if a specific model is loaded and ready for inference."""
        return model_name in self._models

    def list_models(self) -> Dict[str, str]:
        """List all loaded models and their versions."""
        return {name: self._versions.get(name, "unknown") for name in self._models}


# Singleton instance — shared across the application
registry = ModelRegistry()
