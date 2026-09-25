# Final handoff status

## Root cause and correction

The original deployed `PermissionEngine.evaluate_intent` failed on Studionet due to runtime incompatibilities in the execution path: `gl.message.datetime` is not available in this deployed GenLayer message type, and a bound contract normalizer captured storage-backed `self` state in the nondeterministic callback. The contract was corrected to avoid message datetime access and use a module-level normalizer. JSON-mode LLM results are consumed as structured data where available, guarded by `glvm.Return`; both leader and validator independently interpret the frozen licence and intent. Validators compare substantive outcome, conditions, and material clauses, using a strict semantic-equivalence check only when textual normalization differs. `INCONCLUSIVE` remains explicit, and permit issuance remains finalized-only.

The older failed evaluation remains historical evidence: `0xd7632cb9c05041aa3b1c68c3458529820870c2a2e988d40cea1e2ea59548dde0`.

## Canonical contracts (Studionet 61999)

- RightsRegistry: `0x8D266231904d5eA14BEe00298A09BeC971572B2A`
- PermissionEngine: `0x88C1b897759E57dD3f24c42ed26248FaE6F610A7`
- PermitBook: `0xA7Ca373c4eb0A9da8770B310C60C1e3CE61F9676`
- Deployment transactions and live hashes: `deployment-manifest.generated.json`.
- PermitBook is bound once to the canonical engine. The successful finalized binding transaction is `0x8cd59a962f7660c79063f17eb4296ceb0b1c24732937e49bff5cc68863bdff52`; a later rebind attempt rolled back with `engine already bound`.

All contract deployments finalized. The replacement stack was used for all the live tests below. Historical deployment addresses have been superseded and are not canonical.

## Live Studionet results

- Licence `UBL-FINAL-04` registered: `0x7f897a46e1932fbd9e00e2adc159bab27a7167c1d1a69e0b2f055dec56d2338a` (finalized).
- Conditional intent `UBI-COMPARE-TEST-01`: create `0x02d549299ebf884950d03b42412a6cf8cfc9404cb45a43da8cc54b0aa09d6e79`; successful evaluation `0x9a3ae1280855be88d25c9480f02749430d92c0c45fbf71f93155ee33028d6141` (FINALIZED, validator execution returned). Stored outcome `PERMITTED_WITH_CONDITIONS`; attribution condition preserved. Finalized permit child `0xf66546b3631cf3e27afd835da5bc98845d2de2fee2cedae2ff63e510bb9e845f` (FINALIZED, execution returned) was triggered by the evaluation. Permit key `UBP-UBI-COMPARE-TEST-01` exists in the canonical PermitBook with the canonical engine issuer and `finalized_only: true`.
- DENIED: intent create `0xdfe4040b792bf5059de9e8bd09176ad80012833d037f8833b3d9aff74762a23a`; successful evaluation `0xe169ab92ad692e07cd90b65fb13ec959f724cfdd8743f2641fed4a3c89f31630` (FINALIZED, validator execution returned); stored outcome `DENIED`; permit lookup for `UBP-UBI-DENIED-LIVE-01` is empty.
- INCONCLUSIVE: intent create `0xf06d0e970bbe572de9d643ef7e727f1b74dfbac737bbd3d7bacf8b7549da5b97`; evaluation `0x939019adc7937f6f631737e30af6cd04480c39345941f2f864cb7b9dfe1c7b1c` (FINALIZED, validator execution returned); stored outcome `INCONCLUSIVE`; permit lookup for `UBP-UBI-INCONCLUSIVE-LIVE-01` is empty.
- Unauthorized evaluator attempt: `0xe971c2a37217fc3a01dfc9e78e6b3f519afacdb94243bc4cc1c5f9578c726780` from a different wallet. Intent evaluation count and stored assessment remained unchanged; no new permit was created.

The app-level `getTriggeredTransactionIds` call returned an empty list, but the Studionet transaction index exposed the child directly: its `triggered_by` is the successful conditional evaluation hash and `triggered_on` is `finalized`. Earlier hashes previously labelled as the successful positive and denied evaluations were repeat attempts; they correctly rolled back because those intents were already conclusively assessed. This report now points to the successful first evaluation transactions.

## Production route failure and fix

The production Registry crash was traced from the supplied Brave console screenshot to `rights_map` rendering. The live `UBL-FINAL-04` record uses boolean rights-map values, while the Registry and licence folio called `.toLowerCase()` on every value. Both components now safely format JSON values, render booleans as Yes/No, and only classify string labels. GitHub reports Vercel deployment success for frontend commit `6d975e2`; all five production routes return HTTP 200, and the public client bundle contains the canonical addresses and updated publisher validation.

The Permission Lens / Passport read issue was traced to the Studionet explorer's PermitBook view endpoint returning `Contract 0xA7Ca373c4eb0A9da8770B310C60C1e3CE61F9676 not found` despite a real finalized issue transaction. The current intent's parent evaluation `0x933ffa468b57546cb69cc5058365c3b1be9448f2e7a4b0fbc9713c0313b9f906` finalized and triggered child `0x188093adcb0aabc38dd960e6c7fb237f698760341138b576052b5b23a90b2d53`, which finalized successfully and returned `UBP-UBI-B0873E620B54`. The child targets the canonical PermitBook, originates from the canonical engine, and its calldata contains the conditional assessment for intent `UBI-B0873E620B54`. The frontend now recovers that evidence from finalized `issue_permit` calldata and cross-checks the stored intent and both digests; no contract redeployment is needed for this frontend-only correction.

## Validation status

- Python compile: passed.
- Unit tests: 29 passed.
- GenVM lint syntax checks: passed for all three contracts. SDK validation could not load the linter cache due Windows access denied.
- Direct-mode tests: 2 passed, 4 blocked by `genlayer-test` 0.29.2 Windows temp-file unlink (`WinError 32`) before contract test execution.
- TypeScript typecheck and Next production build passed before and after the rights-map rendering fix; all routes generated.
- Permission issuance fallback tests: **5/5 passed** (`node --test tests/unit/permit-evidence.test.mjs`); final frontend typecheck and production build passed with the recovery path.
- Production Vercel deployment: completed for frontend commit `6d975e2`; subsequent `main` commits contain evidence/documentation updates only. Public bundle addresses match the canonical manifest.
- Remaining production UX verification: a wallet-connected write/evaluation from the hosted frontend has not been repeated after that deployment. Existing live contract lifecycle evidence is complete; this is a distinct frontend integration check.

This repository is not marked submission-ready while the hosted wallet-connected flow and the unchecked contract-tooling/source-match checklist items remain unverified. Private test keys were not included in Git or this handoff.
