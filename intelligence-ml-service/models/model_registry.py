"""
ILPEP Intelligence ML Service — Model Registry

Handles loading, versioning, lifecycle management, and hot-swapping
of ML models. Supports XGBoost (.pkl) and PyTorch (.pt) model formats.

Enhanced Capabilities (Day 3):
    - Model metadata tracking (loaded_at, file_size, file_path)
    - Validation on load (file integrity checks)
    - Reload / hot-swap support for auto-retraining pipeline
    - Model status reporting for health endpoints
"""

import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


# ==============================================================================
# Model Metadata
# ==============================================================================

class ModelMetadata:
    """
    Tracks metadata for a loaded model instance.

    Used by the health endpoint and MLOps pipeline to report model status,
    and by fraud_logs to record which model version scored each transaction.
    """

    def __init__(
        self,
        name: str,
        version: str,
        file_path: Path,
        file_size_bytes: int,
    ):
        self.name = name
        self.version = version
        self.file_path = file_path
        self.file_size_bytes = file_size_bytes
        self.loaded_at = datetime.now(timezone.utc)
        self.inference_count = 0

    def to_dict(self) -> Dict[str, Any]:
        """Serialize metadata for API responses."""
        return {
            "name": self.name,
            "version": self.version,
            "file_path": str(self.file_path),
            "file_size_bytes": self.file_size_bytes,
            "loaded_at": self.loaded_at.isoformat(),
            "inference_count": self.inference_count,
        }


# ==============================================================================
# Model Registry
# ==============================================================================

class ModelRegistry:
    """
    Central registry for ML model loading and version management.

    Responsibilities:
    - Load serialized models from disk (XGBoost .pkl, PyTorch .pt)
    - Track model versions for audit trail (fraud_logs.model_version)
    - Provide thread-safe model access for inference endpoints
    - Support hot-swapping models during auto-retraining
    - Report model status for health checks and monitoring
    """

    # Supported model types and their expected file extensions
    SUPPORTED_FORMATS = {
        "fraud": ".pkl",
        "pricing": ".pt",
    }

    def __init__(self):
        self._models: Dict[str, Any] = {}
        self._versions: Dict[str, str] = {}
        self._metadata: Dict[str, ModelMetadata] = {}
        self._load_history: List[Dict[str, Any]] = []

    # ==========================================================================
    # Model Loading
    # ==========================================================================

    def load_fraud_model(self, model_path: Path, version: str) -> bool:
        """
        Load XGBoost fraud classifier from serialized .pkl file.

        Args:
            model_path: Path to the .pkl model file.
            version: Model version string (e.g., 'v1.0').

        Returns:
            True if model loaded successfully, False otherwise.
        """
        if not self._validate_model_file(model_path, "fraud"):
            return False

        try:
            import joblib

            model = joblib.load(model_path)
            self._register_model("fraud", model, version, model_path)
            logger.info("Loaded fraud model %s from %s", version, model_path)
            return True
        except Exception as e:
            logger.error("Failed to load fraud model: %s", e)
            self._record_load_event("fraud", version, str(model_path), False, str(e))
            return False

    def load_pricing_model(self, model_path: Path, version: str) -> bool:
        """
        Load DQN pricing agent from serialized .pt file.

        Args:
            model_path: Path to the .pt model file.
            version: Model version string (e.g., 'dqn_v1.0').

        Returns:
            True if model loaded successfully, False otherwise.
        """
        if not self._validate_model_file(model_path, "pricing"):
            return False

        try:
            import torch
            from training.train_dqn import DQNNetwork, STATE_DIM, PRICE_ACTIONS

            checkpoint = torch.load(
                model_path, map_location=torch.device("cpu"), weights_only=False
            )
            
            if isinstance(checkpoint, dict):
                model = DQNNetwork(state_dim=STATE_DIM, action_dim=len(PRICE_ACTIONS))
                # Check if it was saved as {'model_state_dict': ..., etc.} or direct state dict
                if "model_state_dict" in checkpoint:
                    model.load_state_dict(checkpoint["model_state_dict"])
                else:
                    model.load_state_dict(checkpoint)
                model.eval()
            else:
                model = checkpoint
                model.eval()

            self._register_model("pricing", model, version, model_path)
            logger.info("Loaded pricing model %s from %s", version, model_path)
            return True
        except Exception as e:
            logger.error("Failed to load pricing model: %s", e)
            self._record_load_event("pricing", version, str(model_path), False, str(e))
            return False

    # ==========================================================================
    # Model Reload (Hot-Swap for Auto-Retraining)
    # ==========================================================================

    def reload_fraud_model(self, model_path: Path, version: str) -> bool:
        """
        Hot-swap the fraud model with a newly trained version.

        Used by the auto-retraining pipeline (retraining_trigger.py) when
        KL-Divergence drift exceeds the 0.1 threshold.

        The old model remains in memory until the new one is validated and
        registered, ensuring zero-downtime model updates.

        Args:
            model_path: Path to the new .pkl model file.
            version: New model version string.

        Returns:
            True if reload succeeded, False otherwise.
        """
        old_version = self._versions.get("fraud", "none")
        logger.info(
            "Reloading fraud model: %s → %s", old_version, version
        )
        success = self.load_fraud_model(model_path, version)
        if success:
            logger.info(
                "Fraud model hot-swapped: %s → %s", old_version, version
            )
        return success

    def reload_pricing_model(self, model_path: Path, version: str) -> bool:
        """
        Hot-swap the pricing model with a newly trained version.

        Args:
            model_path: Path to the new .pt model file.
            version: New model version string.

        Returns:
            True if reload succeeded, False otherwise.
        """
        old_version = self._versions.get("pricing", "none")
        logger.info(
            "Reloading pricing model: %s → %s", old_version, version
        )
        success = self.load_pricing_model(model_path, version)
        if success:
            logger.info(
                "Pricing model hot-swapped: %s → %s", old_version, version
            )
        return success

    # ==========================================================================
    # Model Access
    # ==========================================================================

    def get_model(self, model_name: str) -> Optional[Any]:
        """Get a loaded model by name ('fraud' or 'pricing')."""
        return self._models.get(model_name)

    def get_version(self, model_name: str) -> str:
        """Get the version string for a loaded model."""
        return self._versions.get(model_name, "unknown")

    def get_metadata(self, model_name: str) -> Optional[ModelMetadata]:
        """Get metadata for a loaded model."""
        return self._metadata.get(model_name)

    def is_model_loaded(self, model_name: str) -> bool:
        """Check if a specific model is loaded and ready for inference."""
        return model_name in self._models

    def list_models(self) -> Dict[str, str]:
        """List all loaded models and their versions."""
        return {
            name: self._versions.get(name, "unknown")
            for name in self._models
        }

    def record_inference(self, model_name: str) -> None:
        """Increment inference counter for monitoring."""
        if model_name in self._metadata:
            self._metadata[model_name].inference_count += 1

    # ==========================================================================
    # Status & Health Reporting
    # ==========================================================================

    def get_status_report(self) -> Dict[str, Any]:
        """
        Generate a comprehensive status report for health endpoints.

        Returns dict with: loaded models, their metadata, and load history.
        Used by the /health endpoint in main.py.
        """
        return {
            "models_loaded": len(self._models),
            "models": {
                name: meta.to_dict()
                for name, meta in self._metadata.items()
            },
            "supported_formats": self.SUPPORTED_FORMATS,
            "load_history": self._load_history[-10:],  # Last 10 events
        }

    # ==========================================================================
    # Internal Helpers
    # ==========================================================================

    def _validate_model_file(self, model_path: Path, model_type: str) -> bool:
        """
        Validate a model file before loading.

        Checks:
        1. File exists on disk
        2. File extension matches expected format
        3. File is not empty (size > 0)
        """
        if not model_path.exists():
            logger.warning(
                "%s model not found at %s. "
                "Service will start without %s capability. "
                "Train a model first using training/train_%s.py",
                model_type.title(), model_path,
                model_type, "xgboost" if model_type == "fraud" else "dqn",
            )
            return False

        expected_ext = self.SUPPORTED_FORMATS.get(model_type)
        if expected_ext and model_path.suffix != expected_ext:
            logger.error(
                "Invalid file extension for %s model: expected '%s', got '%s'",
                model_type, expected_ext, model_path.suffix,
            )
            return False

        file_size = os.path.getsize(model_path)
        if file_size == 0:
            logger.error(
                "%s model file is empty (0 bytes): %s",
                model_type.title(), model_path,
            )
            return False

        return True

    def _register_model(
        self,
        name: str,
        model: Any,
        version: str,
        file_path: Path,
    ) -> None:
        """Register a successfully loaded model with metadata."""
        self._models[name] = model
        self._versions[name] = version
        self._metadata[name] = ModelMetadata(
            name=name,
            version=version,
            file_path=file_path,
            file_size_bytes=os.path.getsize(file_path),
        )
        self._record_load_event(name, version, str(file_path), True)

    def _record_load_event(
        self,
        model_name: str,
        version: str,
        file_path: str,
        success: bool,
        error: str = "",
    ) -> None:
        """Record a model load event for audit and debugging."""
        self._load_history.append({
            "model": model_name,
            "version": version,
            "file_path": file_path,
            "success": success,
            "error": error,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })


# Singleton instance — shared across the application
registry = ModelRegistry()
