# Submission checklist

## Contracts and validation

- [x] Three corrected contracts deployed and finalized on Studionet 61999.
- [x] Validator independently interprets frozen licence and exact intent; four bounded outcomes retained.
- [x] `INCONCLUSIVE` is first-class and emits no permit.
- [x] PermitBook is bound once to the canonical engine; finalized binding transaction `0x8cd59a962f7660c79063f17eb4296ceb0b1c24732937e49bff5cc68863bdff52`.
- [x] Permit issuance remains `on="finalized"`.
- [x] GenVM lint and full SDK validation passed for RightsRegistry, PermissionEngine, and PermitBook on GitHub Actions Ubuntu / Python 3.12 using both `genvm-lint check` and `genvm-lint validate`.
- [x] Direct Mode on GitHub Actions `ubuntu-latest`, Python 3.12: **6/6 passed**. The historical Windows temp-file error did not reproduce.
- [x] Deployed-source comparison archived for all three canonical deployments. RightsRegistry and PermitBook are exact byte matches; PermissionEngine differs only by CRLF/LF bytes and matches exactly after EOL normalization. See `DEPLOYED_SOURCE_PROVENANCE.md`.

## Studionet and live flows

- [x] Stable Studionet chain ID 61999 and RPC retained.
- [x] Canonical addresses and finalized deployment transaction hashes are consistent across the handoff documents.
- [x] Deployment and live evidence recorded in `deployment-manifest.generated.json`.
- [x] Licence registration, intent creation, and conditional evaluation finalized.
- [x] Conditional evaluation and triggered PermitBook child finalized and executed successfully; permit record has the expected outcome, digests, canonical issuer, and finalized-only flag.
- [x] DENIED and INCONCLUSIVE finalized; no permit records.
- [x] Foreign evaluator attempt left intent state unchanged.
- [x] Provisional state is not represented as final permission.
- [x] Permit passport recovery verifies finalized canonical `issue_permit` evidence; executable fallback tests pass **5/5**.
- [x] Frontend typecheck and Next production build pass.
- [x] Registry and licence folio safely handle boolean and other JSON rights-map values.
- [x] Production deployment exposes all five routes and the canonical Studionet addresses.
- [x] Wallet-connected hosted frontend lifecycle manually completed; the production Permission Passport renders the finalized conditional result and conditions.

## Frontend and handoff

- [x] Injected EIP-1193 wallet only; no wallet model change.
- [x] Existing product design retained.
- [x] No private test key stored in the repository or output.
- [x] Final deployment, lifecycle, Direct Mode, GenVM, and deployed-source evidence documented.
- [x] Source manifest regenerated after the final documentation/CI cleanup.
