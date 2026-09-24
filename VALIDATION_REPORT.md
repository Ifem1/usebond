# Validation report

## Contracts and tests

- `python -m py_compile` over all `contracts/*.py` and `support/*.py`: **passed**.
- `pytest tests/unit -q`: **29 passed**.
- `genvm-lint check` for RightsRegistry, PermissionEngine, PermitBook: syntax lint reported **3 checks passed** for each. SDK validation failed to load the SDK from the linter cache with Windows `WinError 5: Access is denied`; this is not reported as a full lint pass.
- `pytest tests/direct -v`: **2 passed, 4 failed before contract execution**. Failures are in `genlayer-test 0.29.2` `_inject_message_to_fd0`, which attempts to unlink a temporary file still open (`PermissionError: [WinError 32]`).

## Live Studionet evidence

Chain 61999, RPC `https://studio.genlayer.com/api`. Canonical deployments, finalized lifecycle transaction hashes, outcomes, and permit checks are captured in `deployment-manifest.generated.json` and `FINAL_HANDOFF_STATUS.md`.

- Fresh licence registration finalized.
- Conditional permission evaluation finalized; `PERMITTED_WITH_CONDITIONS` persisted and matching finalized-only PermitBook record exists.
- DENIED and INCONCLUSIVE evaluations finalized with no permit record.
- Different wallet's attempt to evaluate the owner's intent did not change evaluation count or stored assessment.
- No separate child transaction ID was returned by this Studionet runtime for the finalized permit callback. Frontend verifies finalized parent plus canonical issuer/digests/outcome/`finalized_only` PermitBook record before displaying the passport.

## Frontend

`npm run typecheck`: **passed**. `npm run build`: **passed**; all five application routes generated (plus Next not-found). Vercel production redeployment and environment updates are intentionally left to the owner; `.env.generated` contains the public variables for the current canonical stack. The injected-wallet model and product visual design remain unchanged.

## Historical failure

The prior failed evaluation is `0xd7632cb9c05041aa3b1c68c3458529820870c2a2e988d40cea1e2ea59548dde0`. Corrective contract changes avoid unsupported GenLayer message datetime access and avoid capturing contract storage state in a nondeterministic callback. The validator retains independent substantive interpretation and handles harmless wording differences without collapsing the four outcomes.
