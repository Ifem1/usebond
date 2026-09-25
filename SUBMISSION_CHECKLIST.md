# Submission checklist

## Contracts

- [x] Three corrected contracts deployed and finalized on Studionet 61999.
- [x] Validator independently interprets frozen licence and exact intent; four bounded outcomes retained.
- [x] `INCONCLUSIVE` is first-class and emits no permit.
- [x] PermitBook is bound once to the replacement engine; successful finalized binding transaction recorded as `0x8cd59a962f7660c79063f17eb4296ceb0b1c24732937e49bff5cc68863bdff52`.
- [x] Permit issuance remains `on="finalized"`.
- [ ] GenVM SDK validation (syntax checks pass; external SDK cache access denied on Windows).
- [ ] Direct-mode suite (blocked before contract execution by `genlayer-test` Windows temp-file unlink error: 2 passed, 4 blocked).
- [ ] Exact deployed-source byte-for-byte comparison archived for each canonical address.

## Studionet and live flows

- [x] Stable Studionet chain ID 61999 and RPC.
- [x] Deployment and live evidence recorded in `deployment-manifest.generated.json`.
- [x] Licence registration, intent creation, and conditional evaluation finalized.
- [x] Conditional evaluation and triggered PermitBook child both finalized and executed successfully; permit record has expected outcome, digests, canonical issuer, and finalized-only flag.
- [x] DENIED and INCONCLUSIVE finalized; no permit records.
- [x] Foreign evaluator attempt left intent state unchanged.
- [x] Provisional state is not represented as final permission; UI verifies the finalized parent and finalized-only permit record. Child transaction was recovered from Studionet's index.
- [x] Frontend typecheck and Next production build passed; results recorded in validation report.
- [x] Registry and licence folio handle boolean and other JSON rights-map values without calling string methods on non-strings.
- [ ] Owner redeploys Vercel using `.env.generated`, then verifies production wallet-connected flow.

## Frontend and handoff

- [x] Injected EIP-1193 wallet only; no wallet model change.
- [x] Existing product design retained.
- [x] No private test key stored in the repository or output.
- [x] Final deployment and lifecycle documentation updated.
- [x] Final source manifest hash regenerated after source and documentation changes.
- [ ] Final commit and push to `main`.
