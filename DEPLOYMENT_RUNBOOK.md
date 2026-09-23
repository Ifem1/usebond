# Deployment runbook

## 1. Fresh environment

Use stable **Studionet 61999** only.

```text
RPC       https://studio.genlayer.com/api
Chain ID  61999
Explorer  https://explorer-studio.genlayer.com
Currency  GEN
```

Do not point a 61999 chain configuration at the Studio Dev RPC.

## 2. Install and verify current tooling

The handoff pins the same baseline families used by the current GenLayer boilerplate, but the finishing agent must check the official docs/repositories at deployment time and update compatible patch versions if required.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install
```

Record versions in the final README / submission evidence.

## 3. Contract gates before deployment

```bash
python -m py_compile contracts/*.py
genvm-lint check contracts/rights_registry.py
genvm-lint check contracts/permission_engine.py
genvm-lint check contracts/permit_book.py
pytest tests/unit -q
pytest tests/direct -v
```

Do not deploy through unresolved linter errors or schema failures.

## 4. Frontend gates

```bash
npm run typecheck
npm run build
```

The production build must succeed without placeholder addresses being silently treated as live.

## 5. Deploy in this order

1. `RightsRegistry`
2. `PermitBook`
3. `PermissionEngine(registry, permitBook)`
4. call `PermitBook.bind_engine(permissionEngine)` exactly once

`deploy/deployScript.ts` automates this sequence and writes `.env.generated` plus a deployment manifest. It waits for `FINALIZED`; if the network requires an explicit finalizer action, perform that action with the current CLI/SDK and rerun/continue rather than weakening the script to accept provisional deployments.

## 6. Verify deployed source and schema

For each contract:

- explorer address resolves;
- deployment transaction is `FINALIZED`;
- deployed source matches the repository source being submitted;
- schema generation succeeds;
- all expected public methods exist;
- `PermitBook.engine_address` is the canonical `PermissionEngine` address.

## 7. Live lifecycle proof

Use `demo/meridian_licence.json`.

### Flow A: permitted/conditional

1. register the demo licence;
2. create an intent for commercial model training with public aggregate outputs, attribution, no source redistribution and no third-party source access;
3. call `evaluate_intent`;
4. capture the evaluation transaction while consensus is running;
5. capture `ACCEPTED` as provisional, if observed;
6. finalize the parent transaction;
7. observe the finalized child permit issuance;
8. verify the permit exists in `PermitBook` and opens at `/permit/[permitKey]`.

### Flow B: denied

Create an intent that redistributes the source dataset to third parties. The frozen text explicitly prohibits it. Verify a denied semantic assessment and verify no permit is created.

### Flow C: ambiguity / safe failure

Add a separate licence whose text genuinely does not resolve a requested use. Verify that `INCONCLUSIVE` does not create a permit.

## 8. Frontend environment

Copy the three finalized addresses from `.env.generated` into the Vercel project:

```text
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
NEXT_PUBLIC_RIGHTS_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_PERMISSION_ENGINE_ADDRESS=0x...
NEXT_PUBLIC_PERMIT_BOOK_ADDRESS=0x...
```

Redeploy after setting environment variables.

## 9. Production UX test

Test from a clean browser profile:

- landing loads without wallet;
- registry reads without wallet;
- licence folio reads without wallet;
- writing prompts wallet only at the point of action;
- wrong network produces a switch/add request;
- rejected signatures produce useful errors;
- transaction stages are visible;
- `ACCEPTED` is described as provisional;
- `UNDETERMINED` never becomes permission;
- permit passport is public and walletless;
- mobile layout is usable;
- all explorer links resolve.

## 10. Submission evidence

Keep the final repo commit, Vercel URL, all three contract addresses, deployment hashes, engine-binding hash, one finalized permission flow, one denied flow, and screenshots/video of the live UI.
