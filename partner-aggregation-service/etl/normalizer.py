"""
ETL pipeline for loyalty points.

Steps (typical data pipeline language):
1. EXTRACT   — raw dict from the adapter (already done before this module).
2. TRANSFORM — clean, validate types/ranges, fix missing fields if policy allows.
3. NORMALIZE  — business rule: points × rate → value in INR.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Tuple

logger = logging.getLogger(__name__)


class LoyaltyValidationError(ValueError):
    """Raised when raw loyalty data fails validation rules."""


def extract(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    EXTRACT: pass-through of raw payload (could also merge multiple sources).

    Here we just return a shallow copy so callers cannot mutate the adapter's dict by accident.
    """
    return dict(raw)


def transform(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    TRANSFORM: validate required keys and sensible values; coerce types.

    Raises LoyaltyValidationError if data is unusable.
    """
    required = ("user_id", "points", "conversion_rate")
    missing = [k for k in required if k not in raw]
    if missing:
        raise LoyaltyValidationError(f"Missing fields: {missing}")

    user_id = raw["user_id"]
    if not isinstance(user_id, str) or not user_id.strip():
        raise LoyaltyValidationError("user_id must be a non-empty string")

    points = raw["points"]
    rate = raw["conversion_rate"]

    if not isinstance(points, (int, float)):
        raise LoyaltyValidationError("points must be a number")
    if points < 0:
        raise LoyaltyValidationError("points cannot be negative")

    if not isinstance(rate, (int, float)):
        raise LoyaltyValidationError("conversion_rate must be a number")
    if rate < 0:
        raise LoyaltyValidationError("conversion_rate cannot be negative")

    cleaned = {
        "user_id": user_id.strip(),
        "points": float(points),
        "conversion_rate": float(rate),
    }
    logger.debug("Transform: cleaned record=%s", cleaned)
    return cleaned


def normalize(cleaned: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
    """
    NORMALIZE: apply business rule — INR value = points × conversion_rate.

    Returns (value_in_inr, full_output_dict_without_redundant_rate_in_output).
    """
    points = cleaned["points"]
    rate = cleaned["conversion_rate"]
    value_in_inr = round(points * rate, 2)

    result = {
        "user_id": cleaned["user_id"],
        "points": int(points) if points == int(points) else points,
        "value_in_inr": value_in_inr,
    }
    logger.info("Normalize: user=%s points=%s → INR %s", result["user_id"], points, value_in_inr)
    return value_in_inr, result


def run_etl(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run extract → transform → normalize in order.

    Single entry point used by main.fetch_points.
    """
    extracted = extract(raw)
    cleaned = transform(extracted)
    _, normalized = normalize(cleaned)
    return normalized
