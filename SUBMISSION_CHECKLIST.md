# Submission checklist

## Contracts

- [ ] All three contracts lint on the current GenVM linter.
- [ ] Direct mode passes on the exact deployed source.
- [ ] Schema generation succeeds for every deployed contract.
- [ ] RightsRegistry source has no mutation path for frozen licences.
- [ ] PermissionEngine validator independently evaluates substantive licence meaning.
- [ ] Validator is not merely checking enum/JSON shape.
- [ ] `INCONCLUSIVE` is first-class and creates no permit.
- [ ] PermitBook accepts only the canonical engine.
- [ ] PermitBook is bound once to the correct engine.
- [ ] Permit issuance is emitted `on="finalized"`, never `on="accepted"`.
- [ ] Duplicate permit issuance is rejected.

## Studionet

- [ ] Chain ID is 61999 everywhere.
- [ ] RPC is stable Studionet, not Studio Dev.
- [ ] All deployments are FINALIZED.
- [ ] Deployed source matches repository source.
- [ ] Explorer links resolve.
- [ ] Deployment manifest contains the same addresses used by Vercel.

## Live flows

- [ ] Licence registration works from the production frontend.
- [ ] Use intent freezes correctly.
- [ ] Semantic evaluation runs from the production frontend.
- [ ] Provisional accepted state is visibly not final.
- [ ] Explicit finalization path works where required.
- [ ] Permission child issuance is observed before showing passport.
- [ ] Denied intent creates no permit.
- [ ] Inconclusive intent creates no permit.
- [ ] Wrong account cannot evaluate somebody else's intent.

## Frontend

- [ ] Only five agreed page routes are present.
- [ ] No hidden backend or server key is authoritative.
- [ ] Injected EIP-1193 wallet only.
- [ ] Public registry, terms and permit pages work without wallet.
- [ ] No generic success toast substitutes for lifecycle state.
- [ ] Mobile layouts are tested.
- [ ] Keyboard focus is visible and status is not conveyed by colour alone.
- [ ] Production build passes.
- [ ] No mock/demo data is silently shown as live contract data.

## Submission package

- [ ] Repository is public and clean.
- [ ] README contains live Vercel and explorer links.
- [ ] Demo instructions are reproducible.
- [ ] Final commit hash recorded.
- [ ] Video shows real wallet, real Studionet transactions and final permit.
