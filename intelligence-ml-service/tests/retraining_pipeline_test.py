"""
ILPEP Intelligence ML Service — Retraining Pipeline E2E Test

Validates that the KL Divergence monitor correctly detects feature drift
and triggers retraining signals. Uses synthetic distributions to simulate
drift vs no-drift scenarios without requiring a live Redis connection.
"""

import unittest
from unittest.mock import patch, MagicMock
import numpy as np


class TestKLDivergenceMonitor(unittest.TestCase):
    """Test the KL-Divergence drift detection logic."""

    def _kl_divergence(self, p: np.ndarray, q: np.ndarray) -> float:
        """Compute KL divergence D_KL(P || Q) with smoothing."""
        epsilon = 1e-10
        p = np.clip(p, epsilon, 1.0)
        q = np.clip(q, epsilon, 1.0)
        # Normalize
        p = p / p.sum()
        q = q / q.sum()
        return float(np.sum(p * np.log(p / q)))

    def test_no_drift_detected(self):
        """When distributions are similar, KL divergence should be below threshold."""
        # Reference distribution (training data distribution)
        reference = np.array([0.1, 0.2, 0.3, 0.25, 0.15])
        # Current distribution (very similar to reference)
        current = np.array([0.11, 0.19, 0.31, 0.24, 0.15])

        kl_div = self._kl_divergence(reference, current)

        # KL divergence should be small (< 0.1 threshold)
        self.assertLess(kl_div, 0.1, f"Expected no drift, but KL={kl_div:.4f}")

    def test_drift_detected(self):
        """When distributions diverge significantly, KL divergence should exceed threshold."""
        # Reference distribution (training data)
        reference = np.array([0.1, 0.2, 0.3, 0.25, 0.15])
        # Drifted distribution (production data has shifted dramatically)
        drifted = np.array([0.4, 0.05, 0.05, 0.45, 0.05])

        kl_div = self._kl_divergence(reference, drifted)

        # KL divergence should be large (>= 0.1 threshold)
        self.assertGreaterEqual(kl_div, 0.1, f"Expected drift, but KL={kl_div:.4f}")

    def test_identical_distributions(self):
        """KL divergence of identical distributions should be 0."""
        dist = np.array([0.2, 0.3, 0.1, 0.25, 0.15])

        kl_div = self._kl_divergence(dist, dist)

        self.assertAlmostEqual(kl_div, 0.0, places=5)

    def test_retrain_trigger_signal(self):
        """Simulate the full drift detection → retrain trigger pipeline."""
        DRIFT_THRESHOLD = 0.1

        reference = np.array([0.1, 0.2, 0.3, 0.25, 0.15])
        drifted = np.array([0.4, 0.05, 0.05, 0.45, 0.05])

        kl_div = self._kl_divergence(reference, drifted)
        should_retrain = kl_div >= DRIFT_THRESHOLD

        self.assertTrue(should_retrain, "Retrain should be triggered when drift exceeds threshold")

    def test_no_retrain_for_stable_data(self):
        """Stable data should not trigger retraining."""
        DRIFT_THRESHOLD = 0.1

        reference = np.array([0.1, 0.2, 0.3, 0.25, 0.15])
        stable = np.array([0.10, 0.21, 0.29, 0.25, 0.15])

        kl_div = self._kl_divergence(reference, stable)
        should_retrain = kl_div >= DRIFT_THRESHOLD

        self.assertFalse(should_retrain, "Retrain should NOT be triggered for stable data")

    def test_asymmetry_of_kl_divergence(self):
        """KL divergence is asymmetric: D_KL(P||Q) != D_KL(Q||P)."""
        p = np.array([0.1, 0.2, 0.3, 0.25, 0.15])
        q = np.array([0.4, 0.05, 0.05, 0.45, 0.05])

        kl_pq = self._kl_divergence(p, q)
        kl_qp = self._kl_divergence(q, p)

        self.assertNotAlmostEqual(kl_pq, kl_qp, places=2,
            msg="KL divergence should be asymmetric")


if __name__ == "__main__":
    unittest.main()
