# USEBOND

USEBOND is a GenLayer rights-clearing application for frozen licence terms and exact intended uses. A rights holder registers immutable natural-language terms. A user freezes a concrete use intent. GenLayer consensus interprets that exact use against that exact licence and returns one of four bounded outcomes:

- `PERMITTED`
- `PERMITTED_WITH_CONDITIONS`
- `DENIED`
- `INCONCLUSIVE`

A permission credential is issued only for permission outcomes, through a separate permit contract, and the issuing message is scheduled `on="finalized"` from the semantic decision transaction.

## Live app

- Frontend: https://usebond-frontend.vercel.app/
- Network: GenLayer Studionet, chain ID `61999`
- Explorer: https://explorer-studio.genlayer.com

The production frontend uses an injected EIP-1193 wallet only. There is no WalletConnect selector, custodial signer, or server-held user key.

## Target network

USEBOND is configured for **stable GenLayer Studionet, chain ID 61999**.

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
  app/                     the five product routes + visual system
  rights-desk/             catalogue and term publishing
  term-sheet/              readable frozen licence
  use-composer/            exact intended-use construction
  permission-lens/         clause trace, consensus, finality UI
  permit-book/             public permission passport
  genlayer-runtime/        reads, writes, fees, transaction observer
  signer/                  injected EIP-1193 wallet only

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

The product intentionally avoids generic dashboard/settings/account routes. The public flow moves from the registry into frozen terms, exact-use intent, interpretation, and finalized permission passport.

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

## Final Studionet deployment

The finalized deployment manifest is `deployment-manifest.generated.json`.

- RightsRegistry: `0x0a9574917194D7F8a7665cc75103c325706616e6`
- PermissionEngine: `0x84ccd66DA46A1Bd64B3226B1f99AfFb51866Ae85`
- PermitBook: `0x7FC7824396D6bD107eB9041BfDed44e138D92a21`
- Engine binding transaction: `0x30fd662dfd5fbfb584d8f787b7543905e25548f1fe27bb5eed8e92ded0c92cb1`

The recorded deployment lifecycle is finalized on Studionet 61999. Production environment variables must point to these same canonical addresses.

## Frontend product boundary

USEBOND does not use mock records as live state. Public registry, term and permit reads come from the deployed contracts. Wallet-gated actions use the browser's injected provider and enforce Studionet before writes.

The permission UI also keeps lifecycle boundaries explicit: an accepted or ready-to-finalize semantic interpretation is not shown as a final permission credential. The semantic parent must finalize, and the PermitBook issuance itself must be observed before a finalized permission passport is presented.

## Submission principle

Do not present `ACCEPTED` as final permission. Do not present an unverified PermitBook record as a finalized credential. A reviewer should be able to trace the frozen licence, frozen intent, semantic outcome, finality state and permit issuance independently.
