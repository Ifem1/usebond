# USEBOND finishing prompt for the receiving agent

You are receiving a nearly complete GenLayer project called **USEBOND**. Do not start over. Your job is to validate the supplied implementation against the current GenLayer toolchain, make only necessary finishing fixes, deploy the exact final source to **stable Studionet 61999**, wire the finalized addresses into the frontend, run real end-to-end flows, host the frontend on Vercel, and leave the repository submission-ready with reproducible evidence.

## Product in one paragraph

USEBOND freezes natural-language licence terms and an exact intended use before interpretation. GenLayer consensus independently evaluates whether that exact use is `PERMITTED`, `PERMITTED_WITH_CONDITIONS`, `DENIED`, or `INCONCLUSIVE`. A separate permit contract can issue a shareable permission credential only for permission outcomes, and the semantic decision contract emits that issuance **on finalized**, not on accepted. The product is deliberately bounded to interpreting the frozen licence text against the frozen intent; it does not claim to decide external law or prove ownership.

## One non-negotiable frontend constraint

Treat the supplied frontend as a clean-room product. Do not copy, adapt or structurally reproduce frontend code, route hierarchies, component hierarchies, layouts or UI treatments from repositories under `github.com/ometere123` or from previously supplied project frontends. Preserve USEBOND's own rights-registry / licence-folio / Use Composer / Permission Lens / Permission Passport identity unless a concrete usability bug requires a local change.

## Frozen target network

Use only:

```text
Network   GenLayer Studionet
Chain ID  61999
RPC       https://studio.genlayer.com/api
Explorer  https://explorer-studio.genlayer.com
Currency  GEN
```

Do not deploy to Studio Dev 61997. Do not point the stable `studionet` chain object at a preview RPC.

## Read these first

1. `README.md`
2. `ARCHITECTURE.md`
3. `DEPLOYMENT_RUNBOOK.md`
4. `SUBMISSION_CHECKLIST.md`
5. `REVIEW_TARGET.md`
6. `VALIDATION_REPORT.md`
7. `CLEAN_ROOM_FRONTEND.md`
8. all three files in `contracts/`
9. `frontend/genlayer-runtime/*`
10. `demo/*`

## Current implementation

### Contracts

`contracts/rights_registry.py`

- immutable licence registration;
- natural-language terms plus structured rights map;
- canonical HTTPS/IPFS source;
- deterministic SHA-256 terms commitment;
- no in-place update path.

`contracts/permission_engine.py`

- freezes an exact-use intent and digest;
- reads the committed licence from the registry;
- uses `run_nondet_unsafe` with custom leader/validator logic;
- validator independently reconstructs the interpretation;
- validator rejects material disagreement in obligations/prohibitions, not merely malformed JSON;
- untrusted licence/intent text is explicitly treated as data rather than prompt instructions;
- supports exactly four semantic outcomes;
- emits permitted credential issuance `on="finalized"` only.

`contracts/permit_book.py`

- deployer binds one canonical permission engine once;
- only that engine can issue;
- denied/inconclusive outcomes cannot issue permits;
- permit keys are single-use;
- records both frozen digests, conditions and material clauses.

### Frontend routes

Do not expand the route surface without a real requirement:

```text
/
/registry
/terms/[licenceKey]
/intent/[intentKey]
/permit/[permitKey]
```

The frontend is already wired for:

- public walletless reads;
- injected EIP-1193 signing only;
- Studionet switch/add flow;
- fee estimation before writes;
- transaction status observation;
- accepted/ready-to-finalize shown as provisional;
- explicit finalization action when the SDK reports `READY_TO_FINALIZE`;
- triggered child transaction discovery after semantic parent finalization;
- independent child permit-issuance finality verification before the Permission Passport is displayed;
- fallback permit-transaction discovery through `sim_getTransactionsForAddress` on Studionet.

## Your execution order

### Phase 1: establish exact toolchain

Check the current official GenLayer docs/repositories before changing versions. Record the versions that actually pass deployment.

The handoff baseline is:

```text
genlayer-py v0.18 family
genlayer-test v0.29 family
genlayer-js ^1.1.8
genvm-linter current main
```

If the current stable Studionet requires a compatible newer patch/minor, update deliberately and document it. Do not mix Studio Dev release-candidate packages into the 61999 deployment.

### Phase 2: contract preflight

Run:

```bash
python -m py_compile contracts/*.py support/*.py
genvm-lint check contracts/rights_registry.py
genvm-lint check contracts/permission_engine.py
genvm-lint check contracts/permit_book.py
pytest tests/unit -q
pytest tests/direct -v
```

Then generate/inspect schemas for all three contracts using the current supported method.

If anything fails, fix the smallest root cause. In particular:

- do not add `from __future__ import annotations` to contracts if it causes schema annotations to become unsupported strings;
- do not weaken the custom validator into enum/shape checking;
- do not move external/nondeterministic calls outside the nondeterministic block;
- do not perform storage writes, contract calls or message emission inside leader/validator nondeterministic functions;
- keep permit emission `on="finalized"`;
- preserve `INCONCLUSIVE` as a first-class safe result.

Add a real direct-mode three-contract integration test if the current direct runner supports cross-contract message scheduling cleanly. Cover at least one permission outcome, one denial and one inconclusive outcome.

### Phase 3: frontend install/build

From repo root:

```bash
npm install
npm run typecheck
npm run build
```

Fix all TypeScript/build errors. Do not silence errors with broad `any` changes unless the GenLayer SDK type surface forces a narrow adapter cast.

Test responsive layout and keyboard focus. Keep the parchment / ink / burgundy / olive / ochre visual system and the document-based interaction model.

### Phase 4: deploy to 61999

Use the recipient's funded wallet and the canonical current GenLayer CLI/deployment workflow.

Deploy in this exact dependency order:

1. `RightsRegistry`
2. `PermitBook`
3. `PermissionEngine(registryAddress, permitBookAddress)`
4. call `PermitBook.bind_engine(permissionEngineAddress)` once

`deploy/deployScript.ts` already implements the sequence and writes `.env.generated` and `deployment-manifest.generated.json`.

Every deployment and binding transaction used in the submission must be **FINALIZED**. If the current network requires explicit finalization, do it. Do not accept `ACCEPTED` as sufficient evidence.

After deployment, verify:

- every explorer address resolves;
- schema works at the deployed address;
- deployed source exactly matches the final repository source;
- `PermitBook.engine_address` equals the canonical engine;
- no stale previous address appears anywhere in frontend, README or Vercel environment.

### Phase 5: production environment

Copy the finalized addresses into Vercel:

```text
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
NEXT_PUBLIC_RIGHTS_REGISTRY_ADDRESS=<finalized registry>
NEXT_PUBLIC_PERMISSION_ENGINE_ADDRESS=<finalized engine>
NEXT_PUBLIC_PERMIT_BOOK_ADDRESS=<finalized permit book>
```

Deploy the `frontend` app on Vercel. If Vercel is configured from repo root, set the correct workspace/root settings rather than moving the app into a new architecture.

### Phase 6: live end-to-end proof

Use `demo/meridian_licence.json` and `demo/test_intents.json`.

#### Flow A: permission with conditions

Register the Meridian licence from the production frontend.

Create an intent that:

- trains a model;
- is commercial;
- publishes aggregate/model outputs;
- displays attribution;
- does not redistribute source records;
- does not provide third-party source access.

Capture:

- licence registration hash;
- intent creation hash;
- semantic evaluation hash;
- accepted/provisional screen if observed;
- final semantic parent status;
- triggered permit child hash;
- child `FINALIZED` status;
- `/permit/[permitKey]` showing a finalized Permission Passport;
- explorer links for every relevant transaction.

The exact semantic output may be `PERMITTED` or `PERMITTED_WITH_CONDITIONS` depending on the independent validator set, but it must materially reflect the attribution and source-access terms. Do not hardcode the demo to fake a desired outcome.

#### Flow B: explicit denial

Create the provided source-redistribution intent. The licence explicitly prohibits that use. Verify the decision is substantively tied to that clause and that no permit is issued.

#### Flow C: inconclusive safe failure

Register a separate intentionally ambiguous licence, submit a use the text does not resolve, and verify `INCONCLUSIVE` creates no permission credential.

#### Flow D: access/replay boundaries

Verify:

- another wallet cannot evaluate somebody else's frozen intent;
- non-engine callers cannot issue a permit;
- the engine cannot be rebound after canonical binding;
- duplicate licence, intent and permit keys fail;
- wrong network is caught in the frontend;
- rejected wallet signatures do not create fake success UI.

### Phase 7: finality UX audit

This is critical.

At no point may the UI say or imply that `ACCEPTED` means final permission.

Expected lifecycle presentation:

```text
submitted
-> consensus running
-> provisional interpretation (if accepted)
-> ready to finalize / finality pending
-> semantic parent finalized
-> permit child created
-> permit child finalized
-> Permission Passport displayed
```

`UNDETERMINED`, `DENIED`, `INCONCLUSIVE`, timeout and canceled states must never become permission.

If a permit record is readable but its issuance transaction cannot be independently verified as finalized, keep the passport withheld. The supplied frontend already does this; preserve the behavior.

### Phase 8: production UX audit

Test from a clean browser profile and on a narrow mobile viewport:

- `/` loads with no wallet;
- registry search works;
- filters work;
- `/registry` reads without wallet;
- `/terms/[licenceKey]` renders full terms and rights map;
- Use Composer clearly shows the exact statement before signing;
- `/intent/[intentKey]` traces use facts to material clauses;
- conditions are understandable and not hidden in raw JSON;
- explorer links resolve;
- wallet is requested only for writes/finalization;
- public finalized permit works without wallet;
- no horizontal desktop layout is simply squeezed onto mobile.

### Phase 9: repository evidence and documentation

Update README with:

- Vercel production URL;
- all three canonical addresses;
- explorer address links;
- final deployment and binding hashes;
- one finalized semantic evaluation + permit issuance example;
- exact tested tool versions;
- final test counts;
- short reproducible demo instructions.

Add a final deployment manifest committed to the repository only after verifying it contains no secret material.

Keep private keys, seed phrases and API secrets out of source, commits and Vercel public environment variables.

### Phase 10: final submission audit

Before declaring submission-ready, run the full `SUBMISSION_CHECKLIST.md` literally.

Also inspect the deployed app manually against the review target:

- GenLayer is deciding a consequential semantic permission question, not decorating a normal app with AI text;
- the validator checks substance;
- the multi-contract split is justified by responsibility;
- all uncertainty/failure paths are visible;
- repo builds cleanly;
- live frontend talks to the exact deployed source;
- the complete flow is usable by a reviewer without developer intervention.

## What you may change

You may fix:

- SDK/API migrations;
- schema/linter compatibility;
- incorrect GenLayer transaction status handling;
- real frontend bugs;
- accessibility/responsive defects;
- deployment tooling issues;
- test coverage gaps;
- documentation inaccuracies discovered from live deployment.

## What you should not casually change

Do not casually change:

- the five route names;
- the four semantic outcomes;
- immutable licence/intention model;
- separate permit-issuance contract;
- substantive independent validator requirement;
- finalized-only permit emission;
- injected-wallet-only model;
- the document/rights-office product identity.

If a current SDK limitation forces a structural change, document the exact limitation and preserve the same security property by another mechanism.

## Definition of done

Do not report "done" merely because Vercel deployed.

Done means all of the following are true:

- contracts lint and schema-load on the current stable toolchain;
- tests pass;
- all three contracts are deployed to 61999 and finalized;
- engine binding is finalized;
- production frontend builds and is on Vercel;
- frontend addresses match the canonical contracts;
- real write transactions work from the hosted app;
- at least one semantic permission flow reaches a separately finalized permit child;
- denied and inconclusive paths issue no permit;
- accepted is never treated as final;
- final README and evidence are complete;
- no known submission blocker remains.

When finished, return a concise release report containing final commit, CI status, Vercel URL, three contract addresses, deployment/binding hashes, live proof hashes, test counts and any remaining limitation. Do not hide an unresolved limitation behind "submission ready".
