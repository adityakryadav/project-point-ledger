"""
HDFC Loyalty Adapter (Adapter Design Pattern)

This module pretends to talk to HDFC's real loyalty API. In production you would
use HTTP requests (requests library) with auth headers and real URLs.

Here we only *simulate* a successful JSON response so you can learn the flow
without needing bank credentials.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


class HDFCLoyaltyAdapter:
    """
    Adapter class: one place to change when HDFC changes their API.

    - Same interface even if the bank switches from REST to SOAP, etc.
    - Today: returns mock data that looks like their API.
    """

    def __init__(self) -> None:
        # In real code: base_url, api_key, timeout, etc.
        self._mock_enabled = True

    def fetch_loyalty_raw(self, user_id: str) -> Dict[str, Any]:
        """
        Simulates GET /loyalty?user_id=...

        Returns a dict shaped like the bank's JSON (raw / unvalidated).
        """
        logger.info("HDFC adapter: fetching loyalty (mock) for user_id=%s", user_id)

        if self._mock_enabled:
            # Simulated response — same keys you might see from a real API
            mock_response: Dict[str, Any] = {
                "user_id": user_id,
                "points": 1000,
                "conversion_rate": 0.25,  # INR per loyalty point (example)
            }
            logger.debug("HDFC adapter: mock raw payload=%s", mock_response)
            return mock_response

        # Placeholder if you later turn off mocks and call requests.get(...)
        raise NotImplementedError("Real HDFC API integration not implemented in this demo.")
