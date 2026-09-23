import json
from pathlib import Path

import pytest

from support.domain_rules import (
    canonical_digest,
    normalize_outcome,
    permit_eligible,
    permit_key,
    state_label,
    valid_key,
)

ROOT = Path(__file__).resolve().parents[2]


def test_keys_accept_product_ids():
    assert valid_key("UBL-4N72")
    assert valid_key("UBI:2026.09.23")


def test_keys_reject_spaces():
    assert not valid_key("intent with spaces")


def test_digest_is_order_independent():
    assert canonical_digest({"b": 2, "a": 1}) == canonical_digest({"a": 1, "b": 2})


def test_digest_changes_with_terms():
    assert canonical_digest({"terms": "a"}) != canonical_digest({"terms": "b"})


def test_unknown_outcome_fails_safe():
    assert normalize_outcome("maybe", []) == "INCONCLUSIVE"


def test_conditions_upgrade_plain_permission():
    assert normalize_outcome("PERMITTED", ["attribute"]) == "PERMITTED_WITH_CONDITIONS"


def test_denied_is_not_permit_eligible():
    assert not permit_eligible("DENIED")


def test_inconclusive_is_not_permit_eligible():
    assert not permit_eligible("INCONCLUSIVE")


def test_permission_outcomes_are_eligible():
    assert permit_eligible("PERMITTED")
    assert permit_eligible("PERMITTED_WITH_CONDITIONS")


def test_permit_key_is_deterministic():
    assert permit_key("UBI-72K1") == "UBP-UBI-72K1"


def test_accepted_is_provisional_even_with_permission_outcome():
    assert state_label("ACCEPTED", False, "PERMITTED") == "PROVISIONAL"


def test_ready_to_finalize_is_still_provisional():
    assert state_label("READY_TO_FINALIZE", False, "PERMITTED") == "PROVISIONAL"


def test_finalized_permission_waits_for_child_permit():
    assert state_label("FINALIZED", False, "PERMITTED") == "PERMIT_ACTIVATION_PENDING"


def test_permit_exists_is_issued_only_after_finalized_parent_state():
    assert state_label("FINALIZED", True, "PERMITTED") == "PERMISSION_ISSUED"


def test_final_denial_never_waits_for_permit():
    assert state_label("FINALIZED", False, "DENIED") == "FINAL_INTERPRETATION"


def test_undetermined_stays_first_class():
    assert state_label("UNDETERMINED", False, None) == "UNDETERMINED"


def test_engine_emits_permit_only_on_finalized_parent():
    source = (ROOT / "contracts" / "permission_engine.py").read_text()
    assert 'emit(on="finalized").issue_permit' in source
    assert 'emit(on="accepted")' not in source


def test_contracts_do_not_use_future_annotations():
    for path in (ROOT / "contracts").glob("*.py"):
        assert "from __future__ import annotations" not in path.read_text()


def test_engine_has_all_safe_outcomes():
    source = (ROOT / "contracts" / "permission_engine.py").read_text()
    for outcome in ("PERMITTED", "PERMITTED_WITH_CONDITIONS", "DENIED", "INCONCLUSIVE"):
        assert outcome in source


def test_validator_compares_material_obligations_not_just_shape():
    source = (ROOT / "contracts" / "permission_engine.py").read_text()
    assert "material obligation" in source
    assert "Missing a material condition" in source


def test_registry_terms_are_frozen():
    source = (ROOT / "contracts" / "rights_registry.py").read_text()
    assert 'record["frozen"] = True' in source
    assert "update_licence" not in source


def test_permit_book_rejects_non_permission_results():
    source = (ROOT / "contracts" / "permit_book.py").read_text()
    assert 'outcome not in ("PERMITTED", "PERMITTED_WITH_CONDITIONS")' in source


def test_rights_map_example_is_json_serializable():
    sample = {
        "commercial_use": "conditional",
        "model_training": "restricted",
        "redistribution": "denied",
        "attribution": "required",
    }
    assert json.loads(json.dumps(sample))["attribution"] == "required"
