"""Direct-mode access-control tests for PermitBook."""

import json


def test_owner_can_bind_engine_once(direct_vm, direct_deploy, direct_owner, direct_alice):
    direct_vm.sender = direct_owner
    book = direct_deploy("contracts/permit_book.py")
    from genlayer import Address
    engine = direct_alice.as_hex if hasattr(direct_alice, "as_hex") else Address(direct_alice).as_hex
    book.bind_engine(engine)
    with direct_vm.expect_revert("engine already bound"):
        book.bind_engine(engine)


def test_non_engine_cannot_issue(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    direct_vm.sender = direct_owner
    book = direct_deploy("contracts/permit_book.py")
    from genlayer import Address
    engine = direct_alice.as_hex if hasattr(direct_alice, "as_hex") else Address(direct_alice).as_hex
    book.bind_engine(engine)

    direct_vm.sender = direct_bob
    decision = json.dumps({"outcome": "PERMITTED", "conditions": []})
    with direct_vm.expect_revert("unauthorised issuer"):
        book.issue_permit("UBP-X001", "UBI-X001", "UBL-X001", engine, decision)
