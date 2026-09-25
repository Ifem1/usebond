# Validation report

## Contracts and tests

- `python -m py_compile` over all `contracts/*.py` and `support/*.py`: **passed**.
- `pytest tests/unit -q`: **29 passed**.
- `genvm-lint check` for RightsRegistry, PermissionEngine, PermitBook: syntax lint reported **3 checks passed** for each. SDK validation failed to load the SDK from the linter cache with Windows `WinError 5: Access is denied`; this is not reported as a full lint pass.
- `pytest tests/direct -v`: **2 passed, 4 failed before contract execution**. Failures are in `genlayer-test 0.29.2` `_inject_message_to_fd0`, which attempts to unlink a temporary file still open (`PermissionError: [WinError 32]`).

## Live Studionet evidence

Chain 61999, RPC `https://studio.genlayer.com/api`. Canonical deployments, finalized lifecycle transaction hashes, outcomes, and permit checks are captured in `deployment-manifest.generated.json` and `FINAL_HANDOFF_STATUS.md`.

- Fresh licence registration finalized.
- Conditional permission evaluation finalized and execution returned; `PERMITTED_WITH_CONDITIONS` persisted and matching finalized-only PermitBook record exists. Its finalized permit child was recovered from the Studionet transaction index and its execution returned.
- DENIED and INCONCLUSIVE evaluations finalized with no permit record.
- Different wallet's attempt to evaluate the owner's intent did not change evaluation count or stored assessment.
- The SDK's `getTriggeredTransactionIds` returned an empty list, but Studionet's address transaction index exposed the finalized permit child with `triggered_by` pointing to the successful parent evaluation and `triggered_on=finalized`. The frontend verifies finalized parent plus canonical issuer/digests/outcome/`finalized_only` PermitBook record before displaying the passport.

## Frontend

The production crash shown in the user's console was `TypeError: r.toLowerCase is not a function` while rendering `rights_map`. The deployed `UBL-FINAL-04` record contains boolean rights-map values; Registry and folio components previously assumed strings. The fix formats booleans as Yes/No and only applies semantic string classification to string values. `npm run typecheck` and `npm run build`: **passed after the fix**; all five application routes generated (plus Next not-found). HTTP checks returned 200 for all five route URLs and their JS bundles. Vercel production redeployment from the fix commit is still required. The injected-wallet model and product visual design remain unchanged.

The shared rights-map formatter smoke test passed **5/5** cases: true, false, string label, number, and nested object.

## Historical failure

The prior failed evaluation is `0xd7632cb9c05041aa3b1c68c3458529820870c2a2e988d40cea1e2ea59548dde0`. Corrective contract changes avoid unsupported GenLayer message datetime access and avoid capturing contract storage state in a nondeterministic callback. The validator retains independent substantive interpretation and handles harmless wording differences without collapsing the four outcomes.
