# Submission checklist

## Contracts

- [x] Three corrected contracts deployed and finalized on Studionet 61999.
- [x] Validator independently interprets frozen licence and exact intent; four bounded outcomes retained.
- [x] `INCONCLUSIVE` is first-class and emits no permit.
- [x] PermitBook is bound once to the replacement engine; successful finalized binding transaction recorded as `0x8cd59a962f7660c79063f17eb4296ceb0b1c24732937e49bff5cc68863bdff52`.
- [x] Permit issuance remains `on="finalized"`.
- [ ] GenVM SDK validation (syntax checks pass; external SDK cache access denied on Windows).
- [x] Direct-mode suite on GitHub Actions `ubuntu-latest`: **6/6 passed in 31.89s** using Python 3.12 and the repository's unchanged `requirements.txt`; the prior Windows temp-file unlink error did not reproduce. Run: https://github.com/Ifem1/usebond/actions/runs/36127693802.
- [ ] Exact deployed-source byte-for-byte comparison archived for each canonical address.

## Studionet and live flows

- [x] Stable Studionet chain ID 61999 and RPC.
- [x] Deployment and live evidence recorded in `deployment-manifest.generated.json`.
- [x] Licence registration, intent creation, and conditional evaluation finalized.
- [x] Conditional evaluation and triggered PermitBook child both finalized and executed successfully; permit record has expected outcome, digests, canonical issuer, and finalized-only flag.
- [x] DENIED and INCONCLUSIVE finalized; no permit records.
- [x] Foreign evaluator attempt left intent state unchanged.
- [x] Provisional state is not represented as final permission; UI verifies the finalized parent and finalized-only permit record. Child transaction was recovered from Studionet's index.
- [x] Permit passport recovers finalized issuance from canonical successful `issue_permit` calldata when the Studionet PermitBook view endpoint is unavailable; executable recovery tests pass 5/5.
- [x] Frontend typecheck and Next production build passed; results recorded in validation report.
- [x] Registry and licence folio handle boolean and other JSON rights-map values without calling string methods on non-strings.
- [x] Vercel deployment verified through commit `1260da4`; all five production routes return HTTP 200, the Permission Lens recognizes finalized issuance, and the public Passport renders the matching finalized transaction and conditions.
- [x] Wallet-connected hosted frontend lifecycle manually completed by the user after the frontend fixes; production Permission Passport screenshot confirms the finalized conditional result and displayed conditions. See `FINAL_HANDOFF_STATUS.md`.

## Frontend and handoff

- [x] Injected EIP-1193 wallet only; no wallet model change.
- [x] Existing product design retained.
- [x] No private test key stored in the repository or output.
- [x] Final deployment and lifecycle documentation updated.
- [x] Final source manifest hash regenerated after source and documentation changes.
- [x] Direct Mode CI and validation evidence committed and pushed to `main`.
