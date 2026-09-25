# USEBOND — Rights Registry & Permission Passports

USEBOND is a GenLayer rights-clearing application for frozen licence terms and exact intended uses. A rights holder registers immutable natural-language terms. A user freezes a concrete use intent. GenLayer consensus then interprets that exact use against that exact licence and returns one of four bounded outcomes:

- `PERMITTED`
- `PERMITTED_WITH_CONDITIONS`
- `DENIED`
- `INCONCLUSIVE`

A permission credential is issued only for permission outcomes, through a separate permit contract, and the issuing message is scheduled `on="finalized"` from the semantic decision transaction.

## Current release

- **Production app:** [usebond-frontend.vercel.app](https://usebond-frontend.vercel.app/)
- **Network:** GenLayer Studionet (`61999`)
- **Lifecycle:** completed end to end, including finalized conditional evaluation and permit issuance, finalized `DENIED` and `INCONCLUSIVE` cases without permits, and rejection of an unauthorized evaluator.
- **Frontend:** manually exercised through the completed wallet-connected lifecycle; the finalized Permission Passport displays the outcome and conditions. Vercel deployment is managed by the project owner.
- **Evidence:** see [`FINAL_HANDOFF_STATUS.md`](FINAL_HANDOFF_STATUS.md) and [`deployment-manifest.generated.json`](deployment-manifest.generated.json).

## Contract architecture

| Contract | Responsibility | Canonical Studionet address |
| --- | --- | --- |
| **RightsRegistry** | Registers immutable licence text, rights map, and terms digest. | [`0x8D266231904d5eA14BEe00298A09BeC971572B2A`](https://explorer-studio.genlayer.com/address/0x8D266231904d5eA14BEe00298A09BeC971572B2A) |
| **PermissionEngine** | Freezes exact-use intents and independently evaluates them against registered terms. | [`0x88C1b897759E57dD3f24c42ed26248FaE6F610A7`](https://explorer-studio.genlayer.com/address/0x88C1b897759E57dD3f24c42ed26248FaE6F610A7) |
| **PermitBook** | Issues a permission passport only from the bound engine after finalized permission outcomes. | [`0xA7Ca373c4eb0A9da8770B310C60C1e3CE61F9676`](https://explorer-studio.genlayer.com/address/0xA7Ca373c4eb0A9da8770B310C60C1e3CE61F9676) |

Finalized deployment transactions: [RightsRegistry](https://explorer-studio.genlayer.com/tx/0xf55ece2d712186155d8c6ee853992a1032ece3ba3146ad392d5db9d24328af21), [PermitBook](https://explorer-studio.genlayer.com/tx/0x57e309bc5f5b7805614f608af40fbdb1d313fe0543f625c8842518d49b862c15), [PermissionEngine](https://explorer-studio.genlayer.com/tx/0x3c85db1b81f24874ea21f65736047d6a71f24330bd8c34294203c05661b10429). The one-time engine binding is [finalized](https://explorer-studio.genlayer.com/tx/0x8cd59a962f7660c79063f17eb4296ceb0b1c24732937e49bff5cc68863bdff52). See the manifest for lifecycle transactions and outcomes.

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

## Try the sample-data flow

1. Open `/registry`, choose **Publish terms**, then choose **Use sample data**. This fills a fresh licence key and a realistic Eurostat population-projections example. The dataset is real, but the inserted terms are clearly marked as an illustrative test scenario—not an official Eurostat licence. Refer to the [dataset](https://ec.europa.eu/eurostat/databrowser/view/proj_23np/default/bar?lang=en) and [official reuse notice](https://ec.europa.eu/eurostat/help/copyright-notice).
2. Review the fields and rights map. Choosing **Use sample data** does not submit anything. **Freeze terms** connects the injected wallet and submits a real registration transaction on Studionet.
3. Open the newly registered record, review its frozen terms and source, then choose **Permission case** in Use Composer. Check the facts and exact-use preview; this button only fills fields.
4. Choose **Freeze this use intent** to create a real on-chain intent. Wait until its creation is finalized; if needed, use **Check intent finality** or **Finalize intent** before continuing. In Permission Lens, review the frozen facts, then choose **Request interpretation** and follow the transaction until finality. `ACCEPTED` is provisional; use the page’s finalization action if prompted.
5. For a permission result, follow the permit issuance and open the Permission Passport only after it is finalized. To test negative paths against the same licence, return to Use Composer and try **Denial case** (it requests full-source redistribution and third-party access) and **Unresolved case** (it proposes individual insurance decisions, which the sample terms intentionally leave open). `DENIED` and `INCONCLUSIVE` must not produce a passport. Consensus results are semantic, not canned demo outputs, so no outcome is hardcoded.

The sample licence key is regenerated each time to avoid collisions with immutable on-chain records; each intent also gets a fresh key. Registration, intent creation, and evaluation are genuine Studionet writes and may incur network fees; use a test wallet funded only for testing. The sample rules do not assert or replace any real-world rights.

## Local validation

```bash
python -m py_compile contracts/*.py support/*.py
pytest tests/unit -q
node --test tests/unit/permit-evidence.test.mjs
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

Latest recorded checks: Python compile passed; unit tests **29 passed**; permit-evidence tests **5/5 passed**; GenVM syntax lint **3 checks passed per contract** (the Windows linter could not load its SDK cache); TypeScript typecheck and Next.js production build passed; direct-mode suite **6/6 passed** on GitHub Actions Ubuntu. See [`VALIDATION_REPORT.md`](VALIDATION_REPORT.md) for versions, platform-specific details, and the CI run.

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

The real Studionet lifecycle is recorded in `deployment-manifest.generated.json` and [`FINAL_HANDOFF_STATUS.md`](FINAL_HANDOFF_STATUS.md). The successful conditional evaluation [`0x9a3ae1280855be88d25c9480f02749430d92c0c45fbf71f93155ee33028d6141`](https://explorer-studio.genlayer.com/tx/0x9a3ae1280855be88d25c9480f02749430d92c0c45fbf71f93155ee33028d6141) triggered permit child [`0xf66546b3631cf3e27afd835da5bc98845d2de2fee2cedae2ff63e510bb9e845f`](https://explorer-studio.genlayer.com/tx/0xf66546b3631cf3e27afd835da5bc98845d2de2fee2cedae2ff63e510bb9e845f); both finalized and executed successfully. `DENIED` and `INCONCLUSIVE` evaluations finalized without permits, and a foreign evaluator was rejected. All hashes and observed outcomes are in the manifest. The child was recovered through Studionet's transaction index (`triggered_by` / `triggered_on=finalized`), although the SDK's `getTriggeredTransactionIds` returned an empty list.

Production frontend: [https://usebond-frontend.vercel.app/](https://usebond-frontend.vercel.app/). The production site is verified on `main` commit `1260da4`; the hosted Permission Lens now detects the finalized permit child and links to a working public Passport. The production bundle contains all three canonical Studionet addresses, and all five public routes returned HTTP 200. `.env.generated` records the public deployment values; no private key belongs in Vercel or this repository.

The live contract lifecycle is complete. In addition to the recorded Studionet transaction evidence, the production frontend was manually exercised through the wallet-connected lifecycle by the user. The finalized conditional result and passport are visible in the hosted app. This manual interaction is separate from automated HTTP and asset checks.

The Permission Lens and public Passport also have a strict recovery path for the current Studionet explorer/RPC read failure on the PermitBook address. If a PermitBook view call fails, the frontend verifies the finalized successful `issue_permit` child transaction from the canonical engine to the canonical PermitBook, then matches its key, holder, outcome, and both digests against the stored intent before presenting the passport. It never treats an accepted parent or an unverified transaction as issuance.

The production UI was verified with intent `UBI-B0873E620B54`: Permission Lens shows the finalized permit as issued and links to the passport, which displays `PERMITTED WITH CONDITIONS` and its recorded conditions. The parent and child hashes are recorded in `FINAL_HANDOFF_STATUS.md`.

## Submission principle

Do not present `ACCEPTED` as final permission. The UI treats accepted/ready-to-finalize interpretation as provisional. The semantic parent must finalize, and the separate permit issuance must actually exist before the product presents a permission passport.
