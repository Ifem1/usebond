# Submission checklist

## Contracts

- [x] Three corrected contracts deployed and finalized on Studionet 61999.
- [x] Validator independently interprets frozen licence and exact intent; four bounded outcomes retained.
- [x] `INCONCLUSIVE` is first-class and emits no permit.
- [x] PermitBook is bound once to the replacement engine; canonical engine issuer confirmed by live permit record. Binding tx hash was not retained.
- [x] Permit issuance remains `on="finalized"`.
- [ ] GenVM SDK validation (syntax checks pass; external SDK cache access denied on Windows).
- [ ] Direct-mode suite (blocked before contract execution by `genlayer-test` Windows temp-file unlink error: 2 passed, 4 blocked).
- [ ] Exact deployed-source byte-for-byte comparison archived for each canonical address.

## Studionet and live flows

- [x] Stable Studionet chain ID 61999 and RPC.
- [x] Deployment and live evidence recorded in `deployment-manifest.generated.json`.
- [x] Licence registration, intent creation, and conditional evaluation finalized.
- [x] Conditional permit record exists with expected outcome, digests, canonical issuer, and finalized-only flag.
- [x] DENIED and INCONCLUSIVE finalized; no permit records.
- [x] Foreign evaluator attempt left intent state unchanged.
- [x] Provisional state is not represented as final permission; UI supports finalized-callback state without child transaction ID.
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
