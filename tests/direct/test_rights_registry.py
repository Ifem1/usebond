"""Direct-mode tests. Requires genlayer-test; run with pytest tests/direct -v."""


def test_register_and_read_licence(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/rights_registry.py")
    direct_vm.sender = direct_alice
    key = contract.register_licence(
        "UBL-DEMO-1",
        "Meridian Climate Data",
        "dataset",
        "https://example.org/meridian",
        "Meridian Institute",
        "Commercial analysis is allowed with attribution. Model training is allowed only for internal systems. Redistribution of source records is prohibited. Generated outputs may be published if they do not expose source records. Attribution must name Meridian Institute.",
        '{"commercial_use":"conditional","model_training":"restricted","redistribution":"denied","attribution":"required"}',
    )
    assert key == "UBL-DEMO-1"
    assert contract.licence_exists(key)
    assert '"frozen": true' in contract.get_licence_json(key)


def test_duplicate_licence_reverts(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/rights_registry.py")
    direct_vm.sender = direct_alice
    args = (
        "UBL-DEMO-2", "Example Work", "dataset", "https://example.org/work",
        "Example Holder",
        "This licence permits internal analysis with attribution and prohibits redistribution of source records. It is deliberately long enough for the registry validation boundary.",
        '{"analysis":"permitted","redistribution":"denied"}',
    )
    contract.register_licence(*args)
    with direct_vm.expect_revert("licence key already exists"):
        contract.register_licence(*args)
