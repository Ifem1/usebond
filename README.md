# USEBOND

USEBOND is a GenLayer rights-clearing application for frozen licence terms and exact intended uses. A rights holder registers immutable natural-language terms. A user freezes a concrete use intent. GenLayer consensus then interprets that exact use against that exact licence and returns one of four bounded outcomes:

- `PERMITTED`
- `PERMITTED_WITH_CONDITIONS`
- `DENIED`
- `INCONCLUSIVE`

A permission credential is issued only for permission outcomes, through a separate permit contract, and the issuing message is scheduled `on="finalized"` from the semantic decision transaction.

## Target network

This handoff is intentionally configured for **stable GenLayer Studionet, chain ID 61999**.

- RPC: `https://studio.genlayer.com/api`
- Chain ID: `61999`
- Explorer: `https://explorer-studio.genlayer.com`
- Native token: `GEN`

Do not substitute Studio Dev / chain 61997.

## Repository map

```text
contracts/
  rights_registry.py       immutable licence registration
  permission_engine.py     intent freezing + substantive GenLayer interpretation
  permit_book.py           one-time permission credential issuance

deploy/
  deployScript.ts          ordered three-contract deployment + one-time engine binding

frontend/
  app/                     only the five agreed page routes
  rights-desk/             catalogue and term publishing
  term-sheet/              readable frozen licence
  use-composer/            exact intended-use construction
  permission-lens/         clause trace, consensus, finality UI
  permit-book/             public permission passport
  genlayer-runtime/        reads, writes, fees, transaction observer
  signer/                  injected EIP-1193 wallet only
  imprint/                 reserved for product visual-language extensions

tests/
  unit/                    locally runnable invariant tests
  direct/                  GenLayer direct-mode tests

demo/                      one complete licence + opposing intent scenarios
```

## Routes

```text
/
/registry
/terms/[licenceKey]
/intent/[intentKey]
/permit/[permitKey]
```

There are no hidden technical routes for evidence, consensus, account, dashboard or settings.

## Local validation

```bash
python -m py_compile contracts/*.py support/*.py
pytest tests/unit -q
```

After installing the current GenLayer toolchain:

```bash
genvm-lint check contracts/rights_registry.py
genvm-lint check contracts/permission_engine.py
genvm-lint check contracts/permit_book.py
pytest tests/direct -v
```

Frontend:

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## Deployment

The canonical deployment is finalized on Studionet 61999. No private key is stored in the repository or Vercel; writes use an injected EIP-1193 wallet.

See `DEPLOYMENT_RUNBOOK.md` and `MEGA_PROMPT_FOR_AGENT.md`.

### Corrected Studionet deployment

The finalized deployment manifest is `deployment-manifest.generated.json`.

- RightsRegistry: `0x8D266231904d5eA14BEe00298A09BeC971572B2A`
- PermissionEngine: `0x88C1b897759E57dD3f24c42ed26248FaE6F610A7`
- PermitBook: `0xA7Ca373c4eb0A9da8770B310C60C1e3CE61F9676`
- Deployment transactions: registry `0xf55ece2d712186155d8c6ee853992a1032ece3ba3146ad392d5db9d24328af21`, permit book `0x57e309bc5f5b7805614f608af40fbdb1d313fe0543f625c8842518d49b862c15`, permission engine `0x3c85db1b81f24874ea21f65736047d6a71f24330bd8c34294203c05661b10429`.

All three deployments finalized. The PermitBook binding transaction is `0x8cd59a962f7660c79063f17eb4296ceb0b1c24732937e49bff5cc68863bdff52` (FINALIZED, execution returned). Previous addresses above were superseded; see the manifest for historical context.

The real Studionet lifecycle is recorded in `deployment-manifest.generated.json`. The successful conditional evaluation `0x9a3ae1280855be88d25c9480f02749430d92c0c45fbf71f93155ee33028d6141` triggered permit child `0xf66546b3631cf3e27afd835da5bc98845d2de2fee2cedae2ff63e510bb9e845f`; both finalized and executed successfully. DENIED and INCONCLUSIVE evaluations finalized without permits, and a foreign evaluator was rejected. The child was recovered through Studionet's transaction index (`triggered_by` / `triggered_on=finalized`), although the SDK's `getTriggeredTransactionIds` returned an empty list.

For Vercel, copy the six public values from `.env.generated` and redeploy the frontend yourself. No private keys belong in Vercel or this repository.

All four transactions were verified `FINALIZED` on Studionet 61999. The public frontend environment is recorded in `.env.generated`; copy those `NEXT_PUBLIC_*` values into the Vercel project before deploying the frontend.

## Submission principle

Do not present `ACCEPTED` as final permission. The UI treats accepted/ready-to-finalize interpretation as provisional. The semantic parent must finalize, and the separate permit issuance must actually exist before the product presents a permission passport.
