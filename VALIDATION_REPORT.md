# Validation report

## Contracts and tests

- `python -m py_compile` over all `contracts/*.py` and `support/*.py`: **passed**.
- `pytest tests/unit -q`: **29 passed**.
- `genvm-lint check` for RightsRegistry, PermissionEngine, PermitBook: syntax lint reported **3 checks passed** for each. SDK validation failed to load the SDK from the linter cache with Windows `WinError 5: Access is denied`; this is not reported as a full lint pass.
- `pytest tests/direct -v` on GitHub Actions `ubuntu-latest` with Python 3.12 and the repository's unchanged `requirements.txt`: **6 passed in 31.89s**. The prior Windows-only `genlayer-test 0.29.2` temp-file unlink `PermissionError` did not reproduce on Linux. CI run: https://github.com/Ifem1/usebond/actions/runs/36127693802.

## Live Studionet evidence

Chain 61999, RPC `https://studio.genlayer.com/api`. Canonical deployments, finalized lifecycle transaction hashes, outcomes, and permit checks are captured in `deployment-manifest.generated.json` and `FINAL_HANDOFF_STATUS.md`.

- Fresh licence registration finalized.
- Conditional permission evaluation finalized and execution returned; `PERMITTED_WITH_CONDITIONS` persisted and matching finalized-only PermitBook record exists. Its finalized permit child was recovered from the Studionet transaction index and its execution returned.
- DENIED and INCONCLUSIVE evaluations finalized with no permit record.
- Different wallet's attempt to evaluate the owner's intent did not change evaluation count or stored assessment.
- The SDK's `getTriggeredTransactionIds` returned an empty list, but Studionet's address transaction index exposed the finalized permit child with `triggered_by` pointing to the successful parent evaluation and `triggered_on=finalized`. The frontend verifies finalized parent plus canonical issuer/digests/outcome/`finalized_only` PermitBook record before displaying the passport.

## Frontend

The Studionet explorer's PermitBook read panel currently returns `Contract ... not found` for the canonical PermitBook even though its finalized `issue_permit` transaction is present and successful. The UI prefers the contract record but can recover a passport from the finalized child transaction. It decodes Studionet's `data.calldata.raw` using GenLayer JS `abi.calldata`, then requires the canonical engine sender and PermitBook destination, `issue_permit` calldata, successful execution, a permitted outcome, and a match to the intent record and both frozen digests. The executable recovery tests pass **5/5** (`node --test tests/unit/permit-evidence.test.mjs`) against SDK-encoded GenLayer calldata, including conditional field preservation and rejection of provisional, failed, unauthorized, denied, inconclusive, or mismatched evidence.

The production crash shown in the user's console was `TypeError: r.toLowerCase is not a function` while rendering `rights_map`. The deployed `UBL-FINAL-04` record contains boolean rights-map values; Registry and folio components previously assumed strings. The fix formats booleans as Yes/No and only applies semantic string classification to string values. The publisher form was also aligned with registry limits and now checks execution success, not only transaction finality. `npm run typecheck` and `npm run build`: **passed after the fixes**; all five application routes generated (plus Next not-found). GitHub reports Vercel deployment success for frontend commit `6d975e2`; all five production routes return HTTP 200, and its public client bundle contains the three canonical contract addresses and updated publishing-validation strings. A hosted wallet-connected write/evaluation has not been re-run after that deployment. The injected-wallet model and product visual design remain unchanged.

The shared rights-map formatter smoke test passed **5/5** cases: true, false, string label, number, and nested object.

## Historical failure

The prior failed evaluation is `0xd7632cb9c05041aa3b1c68c3458529820870c2a2e988d40cea1e2ea59548dde0`. Corrective contract changes avoid unsupported GenLayer message datetime access and avoid capturing contract storage state in a nondeterministic callback. The validator retains independent substantive interpretation and handles harmless wording differences without collapsing the four outcomes.
