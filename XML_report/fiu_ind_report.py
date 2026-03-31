"""
FIU-IND STR XML report generator (batch of suspicious transactions).

This module turns a list of transaction dictionaries into a single XML file
with the shape:

    <Batch>
      <Report>
        <Transaction>...</Transaction>
        ...
      </Report>
    </Batch>

Flow:
1. validate each transaction (required keys, types, value ranges, ISO timestamp)
2. build an in-memory XML tree (xml.etree.ElementTree)
3. pretty-print and write to disk

Run directly:  python fiu_ind_report.py
Import:        from fiu_ind_report import GenerateFIUINDReport
"""

from __future__ import annotations

import logging
import sys
from datetime import datetime
from typing import Any
import xml.etree.ElementTree as ET

# ---------------------------------------------------------------------------
# Logging — INFO for normal flow, ERROR with traceback on failures
# ---------------------------------------------------------------------------
# Library code uses this logger; configure logging in your app or run __main__ (see below).
logger = logging.getLogger(__name__)


# Field names expected in each input dict (FIU-style tags in XML)
REQUIRED_FIELDS = (
    "transaction_id",
    "user_id",
    "amount",
    "timestamp",
    "fraud_score",
)


def _is_non_empty_str(value: Any) -> bool:
    return isinstance(value, str) and len(value.strip()) > 0


def validate_transaction(txn: dict[str, Any]) -> None:
    """
    Ensure one transaction dict has all required keys, correct types, and sane values.

    Raises:
        TypeError: if txn is not a dict.
        ValueError: if any rule is violated (missing field, bad type, out of range, bad date).
    """
    if not isinstance(txn, dict):
        raise TypeError(f"Each transaction must be a dict, got {type(txn).__name__}")

    for field in REQUIRED_FIELDS:
        if field not in txn:
            raise ValueError(f"Missing required field: {field}")

    if not _is_non_empty_str(txn["transaction_id"]):
        raise ValueError("transaction_id must be a non-empty string")
    if not _is_non_empty_str(txn["user_id"]):
        raise ValueError("user_id must be a non-empty string")

    amount = txn["amount"]
    if not isinstance(amount, (int, float)):
        raise ValueError("amount must be a number (int or float)")
    if isinstance(amount, bool):
        raise ValueError("amount must be a number (int or float), not bool")

    fs = txn["fraud_score"]
    if not isinstance(fs, (int, float)):
        raise ValueError("fraud_score must be a number (int or float)")
    if isinstance(fs, bool):
        raise ValueError("fraud_score must be a number (int or float), not bool")
    if not (0.0 <= float(fs) <= 1.0):
        raise ValueError("fraud_score must be between 0 and 1 (inclusive)")

    ts = txn["timestamp"]
    if not isinstance(ts, str):
        raise ValueError("timestamp must be a string in ISO 8601 format")
    # Accept common ISO variants; fromisoformat handles offset and most forms
    ts_norm = ts.replace("Z", "+00:00") if ts.endswith("Z") else ts
    try:
        datetime.fromisoformat(ts_norm)
    except ValueError as exc:
        raise ValueError(f"Invalid timestamp format (expected ISO 8601): {ts!r}") from exc


def validate_transactions(transactions: list[dict[str, Any]]) -> None:
    """Validate the whole input: must be a list (may be empty) of dicts."""
    if not isinstance(transactions, list):
        raise TypeError(f"transactions must be a list, got {type(transactions).__name__}")
    for i, txn in enumerate(transactions):
        try:
            validate_transaction(txn)
        except (TypeError, ValueError) as e:
            raise ValueError(f"Invalid transaction at index {i}: {e}") from e


def build_xml(transactions: list[dict[str, Any]]) -> ET.Element:
    """
    Build <Batch><Report>...<Transaction/>...</Report></Batch>.

    Does not validate; call validate_transactions first.
    """
    batch = ET.Element("Batch")
    report = ET.SubElement(batch, "Report")

    for txn in transactions:
        tx_el = ET.SubElement(report, "Transaction")
        ET.SubElement(tx_el, "TransactionID").text = str(txn["transaction_id"])
        ET.SubElement(tx_el, "UserID").text = str(txn["user_id"])
        ET.SubElement(tx_el, "Amount").text = str(txn["amount"])
        ET.SubElement(tx_el, "Timestamp").text = str(txn["timestamp"])
        ET.SubElement(tx_el, "FraudScore").text = str(txn["fraud_score"])

    return batch


def save_xml(root: ET.Element, file_name: str) -> None:
    """
    Write XML to file with UTF-8 declaration and pretty indentation (2 spaces).

    Uses ET.indent (Python 3.9+).
    """
    ET.indent(root, space="  ", level=0)
    tree = ET.ElementTree(root)
    tree.write(
        file_name,
        encoding="utf-8",
        xml_declaration=True,
        method="xml",
    )
    logger.info("XML file saved: %s", file_name)


def GenerateFIUINDReport(
    transactions: list[dict[str, Any]],
    output_file: str = "report.xml",
) -> None:
    """
    Validate input, build FIU-IND-style batch XML, and save to output_file.

    Raises:
        TypeError, ValueError: on invalid input (after logging).
        OSError: if the file cannot be written.

    On any failure, the error is logged at ERROR level with exception info, then re-raised.
    """
    try:
        logger.info("Starting FIU-IND report generation (%d transaction(s))", len(transactions))
        validate_transactions(transactions)
        root = build_xml(transactions)
        save_xml(root, output_file)
        logger.info("Report generated successfully: %s", output_file)
    except (TypeError, ValueError, OSError):
        logger.exception("FIU-IND report generation failed")
        raise


# ---------------------------------------------------------------------------
# Sample data — same shape your API or database layer would produce
# ---------------------------------------------------------------------------
SAMPLE_TRANSACTIONS: list[dict[str, Any]] = [
    {
        "transaction_id": "TXN001",
        "user_id": "USER123",
        "amount": 50000,
        "timestamp": "2026-03-29T10:30:00",
        "fraud_score": 0.92,
    },
    {
        "transaction_id": "TXN002",
        "user_id": "USER456",
        "amount": 120000,
        "timestamp": "2026-03-29T11:00:00",
        "fraud_score": 0.87,
    },
]


if __name__ == "__main__":
    # Configure root logger when run as script so messages appear
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        stream=sys.stdout,
    )
    GenerateFIUINDReport(SAMPLE_TRANSACTIONS, output_file="report.xml")
    print("\nDone. Open report.xml to see pretty-printed XML.")
