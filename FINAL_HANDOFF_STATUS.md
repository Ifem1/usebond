# Final handoff status

## Root cause and correction

The original deployed `PermissionEngine.evaluate_intent` failed on Studionet due to runtime incompatibilities in the execution path: `gl.message.datetime` is not available in this deployed GenLayer message type, and a bound contract normalizer captured storage-backed `self` state in the nondeterministic callback. The contract was corrected to avoid message datetime access and use a module-level normalizer. JSON-mode LLM results are consumed as structured data where available, guarded by `glvm.Return`; both leader and validator independently interpret the frozen licence and intent. Validators compare substantive outcome, conditions, and material clauses, using a strict semantic-equivalence check only when textual normalization differs. `INCONCLUSIVE` remains explicit, and permit issuance remains finalized-only.

The older failed evaluation remains historical evidence: `0xd7632cb9c05041aa3b1c68c3458529820870c2a2e988d40cea1e2ea59548dde0`.

## Canonical contracts (Studionet 61999)

- RightsRegistry: `0x8D266231904d5eA14BEe00298A09BeC971572B2A`
- PermissionEngine: `0x88C1b897759E57dD3f24c42ed26248FaE6F610A7`
- PermitBook: `0xA7Ca373c4eb0A9da8770B310C60C1e3CE61F9676`
- Deployment transactions and live hashes: `deployment-manifest.generated.json`.
- New PermitBook is bound to the new engine, verified by a real finalized permit record whose issuer is the canonical engine. Exact binding transaction hash was not retained and is intentionally left null in the manifest.

All contract deployments finalized. The replacement stack was used for all the live tests below. Historical deployment addresses have been superseded and are not canonical.

## Live Studionet results

- Licence `UBL-FINAL-04` registered: `0x7f897a46e1932fbd9e00e2adc159bab27a7167c1d1a69e0b2f055dec56d2338a` (finalized).
- Conditional intent `UBI-COMPARE-TEST-01`: create `0x02d549299ebf884950d03b42412a6cf8cfc9404cb45a43da8cc54b0aa09d6e79`; evaluate `0xc4c7d19dc9f6f1527adcdb7bcee121375324c38232d4f0c5a2f3dda9f086ed60` (finalized). Stored outcome `PERMITTED_WITH_CONDITIONS`; attribution condition preserved. Permit key `UBP-UBI-COMPARE-TEST-01` exists in the canonical PermitBook with matching holder, licence/intent digests, canonical issuer, and `finalized_only: true`.
- DENIED: intent create `0xdfe4040b792bf5059de9e8bd09176ad80012833d037f8833b3d9aff74762a23a`; evaluation `0x4e3d908fc79a4a9d105fe0b7f8db590f3b8f21635548405ba7aceee4a8ee3af6` (finalized); no permit under its key.
- INCONCLUSIVE: intent create `0xf06d0e970bbe572de9d643ef7e727f1b74dfbac737bbd3d7bacf8b7549da5b97`; evaluation `0x939019adc7937f6f631737e30af6cd04480c39345941f2f864cb7b9dfe1c7b1c` (finalized); no permit under its key.
- Unauthorized evaluator attempt: `0xe971c2a37217fc3a01dfc9e78e6b3f519afacdb94243bc4cc1c5f9578c726780` from a different wallet. Intent evaluation count and stored assessment remained unchanged; no new permit was created.

The RPC did not expose a separate triggered child transaction ID for the finalized callback, although the callback's PermitBook state is present. The frontend therefore recognizes this exact runtime behavior only after the parent evaluation is finalized and the matching canonical finalized-only record is verified. It does not label the parent as a child issuance transaction.

## Validation status

- Python compile: passed.
- Unit tests: 29 passed.
- GenVM lint syntax checks: passed for all three contracts. SDK validation could not load the linter cache due Windows access denied.
- Direct-mode tests: 2 passed, 4 blocked by `genlayer-test` 0.29.2 Windows temp-file unlink (`WinError 32`) before contract test execution.
- TypeScript typecheck: passed (`tsc --noEmit`). Next production build: passed (`next build`; all routes generated).
- Production Vercel deployment/environment: owner action. Use the public values in `.env.generated`; deploy is intentionally not performed by this agent.

This repository is not marked submission-ready until the owner-controlled Vercel environment redeployment and production wallet-connected verification are confirmed. Private test keys were not included in Git or this handoff.
