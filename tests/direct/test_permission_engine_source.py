"""Static direct-suite guardrails for the consensus contract.

The finishing agent should add a full deployed three-contract integration test after
installing the exact current GenLayer direct runner, because cross-contract message
scheduling changes more often than deterministic unit semantics.
"""

from pathlib import Path


def test_permission_engine_uses_custom_validator():
    source = Path("contracts/permission_engine.py").read_text()
    assert "run_nondet_unsafe" in source
    assert "validator_fn" in source
    assert "material_clauses" in source


def test_permission_engine_never_issues_on_acceptance():
    source = Path("contracts/permission_engine.py").read_text()
    assert 'emit(on="accepted")' not in source
    assert 'emit(on="finalized")' in source
