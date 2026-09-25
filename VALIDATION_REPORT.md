# Validation report

## CI validation

Submission validation runs on GitHub Actions `ubuntu-latest`.

- `python -m py_compile contracts/*.py support/*.py`: **passed**.
- `pytest tests/unit -q`: **29/29 passed**.
- `pytest tests/direct -v`: **6/6 passed** on Ubuntu with Python 3.12. The historical Windows `genlayer-test 0.29.2` temp-file unlink error did not reproduce on Linux.
- `node --test tests/unit/permit-evidence.test.mjs`: **5/5 passed**.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed**.

### GenVM lint and SDK validation

The Ubuntu CI job installs the repository's unchanged `requirements.txt` and runs both commands against every contract:

```bash
genvm-lint check contracts/rights_registry.py
genvm-lint validate contracts/rights_registry.py
genvm-lint check contracts/permission_engine.py
genvm-lint validate contracts/permission_engine.py
genvm-lint check contracts/permit_book.py
genvm-lint validate contracts/permit_book.py
```

Result: **passed for all three contracts**. Each `check` reported `Lint passed (3 checks)` and `Validation passed`; each explicit `validate` also reported `Validation passed`. The earlier Windows SDK-cache access-denied result is historical and is not the current validation state.

### Direct Mode

The CI Direct Mode job uses:

```bash
python -m py_compile contracts/*.py support/*.py
pytest tests/unit -q
pytest tests/direct -v
```

Environment: GitHub Actions `ubuntu-latest`, Python 3.12, repository `requirements.txt`.

Result: **6/6 Direct Mode tests passed**. The Windows temp-file issue did not reproduce on Linux.

## Deployed-source provenance

The CI `source-provenance` job verifies that all three deployment transactions are `FINALIZED`, retrieves deployed source from Studionet, hashes it, and compares it with the checked-out repository source.

- **RightsRegistry:** exact byte match. SHA-256 `c331eaccf0e986e990cbb3a7a53aa8839063589c7bb9e3c96b2d3d61c1659b46`.
- **PermissionEngine:** deployed SHA-256 `b26bbca8de05bf531ece5f655a43563ac3f474600022e1a018f02a2f24047604`; Git checkout SHA-256 `689ae2dca081ae08a6811914c8e90d219c150c46792fed31c06c4bc13b6fe573`. The raw bytes differ only because the deployed source uses CRLF line endings and the Git checkout uses LF. EOL-normalized content matches exactly; no contract or validator logic differs.
- **PermitBook:** exact byte match. SHA-256 `941c520d050de3d65463b90c5148a268d016da25e58747aac12a5051ad6558d2`.

The current Studionet legacy code RPC is casing-sensitive for the PermitBook lookup; the deployment-manifest casing succeeds and resolves to the same 20-byte address. Full evidence and reproduction details are in `DEPLOYED_SOURCE_PROVENANCE.md`.

## Live Studionet evidence

Network: GenLayer Studionet, chain ID **61999**, RPC `https://studio.genlayer.com/api`. Canonical deployments, finalized lifecycle transaction hashes, outcomes, and permit checks are captured in `deployment-manifest.generated.json` and `FINAL_HANDOFF_STATUS.md`.

- Fresh licence registration finalized.
- Conditional permission evaluation finalized and returned `PERMITTED_WITH_CONDITIONS`; its finalized-only PermitBook issuance exists.
- DENIED and INCONCLUSIVE evaluations finalized with no permit.
- A different wallet's evaluation attempt was rejected and left intent state unchanged.
- The production wallet-connected lifecycle was completed manually after the frontend fixes; Permission Lens and the public Permission Passport render the finalized conditional permit and conditions.
- Permit recovery remains strict: it requires finalized successful `issue_permit` evidence from the canonical engine to the canonical PermitBook and matches the permit key, holder, outcome, and frozen digests.

## Historical failures

The prior failed evaluation `0xd7632cb9c05041aa3b1c68c3458529820870c2a2e988d40cea1e2ea59548dde0` remains historical evidence. Corrective work avoided unsupported message datetime access and storage capture in the nondeterministic callback without weakening `INCONCLUSIVE`, validator independence, or finalized-only issuance.

The previous Windows Direct Mode temp-file unlink error and Windows GenVM SDK-cache access denial are also historical. Current Ubuntu CI validates both paths successfully.
