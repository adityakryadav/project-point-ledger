"""
Partner Loyalty Microservice (beginner demo)

Flow:
1. Validate the incoming user_id (input validation).
2. Use HDFCLoyaltyAdapter to EXTRACT raw JSON (mocked).
3. Use etl.normalizer to TRANSFORM + NORMALIZE into our standard output.

Run as script:
  python main.py

Run Flask API:
  pip install flask
  python main.py --serve
  # GET:  curl "http://127.0.0.1:5000/fetch-points?user_id=USER123"
  # POST: curl -X POST http://127.0.0.1:5000/fetch-points -H "Content-Type: application/json" -d '{"user_id":"USER123"}'
"""

from __future__ import annotations

import argparse
import logging
import sys
from typing import Any, Dict

from adapter.hdfc_adapter import HDFCLoyaltyAdapter
from etl.normalizer import LoyaltyValidationError, run_etl

# ---------------------------------------------------------------------------
# Logging: INFO to console; change to DEBUG to see more detail
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Single shared adapter instance (could use dependency injection in larger apps)
_adapter = HDFCLoyaltyAdapter()


def validate_user_id(user_id: str) -> str:
    """
    Input validation: user_id must be a short non-empty alphanumeric id (demo rule).
    Adjust regex/rules to match your real product.
    """
    if user_id is None:
        raise ValueError("user_id is required")
    if not isinstance(user_id, str):
        raise ValueError("user_id must be a string")
    uid = user_id.strip()
    if not uid:
        raise ValueError("user_id cannot be empty")
    if len(uid) > 64:
        raise ValueError("user_id is too long")
    return uid


def fetch_points(user_id: str) -> Dict[str, Any]:
    """
    Core function: call adapter → return normalized loyalty data.

    Returns:
        {
            "user_id": "...",
            "points": ...,
            "value_in_inr": ...,
        }
    """
    uid = validate_user_id(user_id)

    try:
        # Step A: raw data from "external" system (mocked in adapter)
        raw = _adapter.fetch_loyalty_raw(uid)
        # Step B: ETL pipeline produces our canonical response
        return run_etl(raw)
    except LoyaltyValidationError as e:
        logger.warning("Validation failed for user_id=%s: %s", uid, e)
        raise
    except Exception as e:
        logger.exception("Unexpected error while fetching points for user_id=%s", uid)
        raise RuntimeError("Failed to fetch loyalty points") from e


def _demo_cli() -> None:
    """Sample input/output for learning — run without Flask."""
    sample_user = "USER123"
    print("Sample input (CLI): user_id =", repr(sample_user))
    try:
        out = fetch_points(sample_user)
        print("Sample output (JSON-like dict):")
        print(out)
    except Exception as e:
        print("Error:", e)
        sys.exit(1)


def _run_flask() -> None:
    """Flask HTTP API (requires: pip install flask). Main endpoint: /fetch-points."""
    try:
        from flask import Flask, jsonify, request
    except ImportError as e:
        print("Flask is not installed. Run: pip install flask", file=sys.stderr)
        raise SystemExit(1) from e

    app = Flask(__name__)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.route("/fetch-points", methods=["GET", "POST"])
    def fetch_points_api():
        """
        GET:  /fetch-points?user_id=USER123
        POST: /fetch-points  JSON body: {"user_id": "USER123"}
        """
        if request.method == "GET":
            uid = request.args.get("user_id")
            if uid is None:
                return jsonify({"error": "Missing required query parameter: user_id"}), 400
        else:
            body = request.get_json(silent=True) or {}
            uid = body.get("user_id")
            if uid is None:
                return jsonify({"error": "Missing required JSON field: user_id"}), 400

        try:
            data = fetch_points(str(uid))
            return jsonify(data), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except LoyaltyValidationError as e:
            return jsonify({"error": str(e)}), 422
        except RuntimeError as e:
            return jsonify({"error": str(e)}), 500

    logger.info("Starting Flask on http://127.0.0.1:5000 (GET/POST /fetch-points)")
    app.run(host="127.0.0.1", port=5000, debug=False)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Partner loyalty demo service")
    parser.add_argument(
        "--serve",
        action="store_true",
        help="Run Flask API on port 5000 (GET/POST /fetch-points)",
    )
    args = parser.parse_args()
    if args.serve:
        _run_flask()
    else:
        _demo_cli()
