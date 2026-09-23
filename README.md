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

### Final Studionet deployment

The finalized deployment manifest is `deployment-manifest.generated.json`.

- RightsRegistry: `0x0a9574917194D7F8a7665cc75103c325706616e6`
- PermissionEngine: `0x84ccd66DA46A1Bd64B3226B1f99AfFb51866Ae85`
- PermitBook: `0x7FC7824396D6bD107eB9041BfDed44e138D92a21`
- Engine binding: `0x30fd662dfd5fbfb584d8f787b7543905e25548f1fe27bb5eed8e92ded0c92cb1`

All four transactions were verified `FINALIZED` on Studionet 61999. The public frontend environment is recorded in `.env.generated`; copy those `NEXT_PUBLIC_*` values into the Vercel project before deploying the frontend.

## Submission principle

Do not present `ACCEPTED` as final permission. The UI treats accepted/ready-to-finalize interpretation as provisional. The semantic parent must finalize, and the separate permit issuance must actually exist before the product presents a permission passport.
