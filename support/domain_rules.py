"""Pure deterministic helpers used by local tests and documentation examples.

This module is not contract source. It mirrors product invariants so they can be
checked without a GenVM installation.
"""

from __future__ import annotations

import hashlib
import json
import re

OUTCOMES = {
    "PERMITTED",
    "PERMITTED_WITH_CONDITIONS",
    "DENIED",
    "INCONCLUSIVE",
}

KEY_RE = re.compile(r"^[A-Za-z0-9._:-]{4,96}$")


def valid_key(value: str) -> bool:
    return bool(KEY_RE.fullmatch(value))


def canonical_digest(payload: dict) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def normalize_outcome(outcome: str, conditions: list[str]) -> str:
    value = outcome.upper()
    if value not in OUTCOMES:
        return "INCONCLUSIVE"
    if value == "PERMITTED" and conditions:
        return "PERMITTED_WITH_CONDITIONS"
    return value


def permit_eligible(outcome: str) -> bool:
    return outcome in {"PERMITTED", "PERMITTED_WITH_CONDITIONS"}


def permit_key(intent_key: str) -> str:
    if not valid_key(intent_key):
        raise ValueError("invalid intent key")
    return "UBP-" + intent_key


def state_label(tx_status: str, permit_exists: bool, outcome: str | None) -> str:
    """Project GenLayer lifecycle into human-facing permission state."""
    status = tx_status.upper()
    if status == "FINALIZED":
        if permit_exists:
            return "PERMISSION_ISSUED"
        if outcome in {"DENIED", "INCONCLUSIVE"}:
            return "FINAL_INTERPRETATION"
        return "PERMIT_ACTIVATION_PENDING"
    if status in {"ACCEPTED", "READY_TO_FINALIZE"}:
        return "PROVISIONAL"
    if status == "UNDETERMINED":
        return "UNDETERMINED"
    if status in {"CANCELED", "VALIDATORS_TIMEOUT", "LEADER_TIMEOUT"}:
        return "FAILED_OR_RETRYABLE"
    return "CONSENSUS_RUNNING"
