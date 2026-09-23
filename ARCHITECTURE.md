# USEBOND architecture

## Trust problem

The product is for situations where a licence contains natural-language permissions, restrictions and conditions and the proposed use is also semantically rich. A rights holder should not be able to reinterpret the licence opportunistically after seeing the use, while a user should not self-certify that their desired use is allowed. The frozen licence and frozen intent therefore become the immutable inputs to independent consensus.

The contract does not claim to decide external law or prove ownership. Its bounded question is:

> Given this frozen licence text and this frozen intended use, what permission outcome does the licence itself support?

If the frozen text cannot fairly resolve the use, the safe result is `INCONCLUSIVE`.

## Contracts

### 1. RightsRegistry

Responsibilities:

- registers one immutable licence record under a unique key;
- requires a canonical `https://` or `ipfs://` source;
- stores natural-language terms and a human-readable rights map;
- computes a canonical SHA-256 commitment over the frozen licence content;
- exposes read-only lookup and index methods;
- has no update method for a registered licence.

A changed licence should be a new key/version, not an in-place mutation.

### 2. PermissionEngine

Responsibilities:

- reads the frozen licence from `RightsRegistry`;
- freezes a structured exact-use intent and digest;
- performs the only non-deterministic semantic decision;
- leader and validators independently interpret the same frozen licence and intent;
- the validator requires the same outcome and then performs a substantive semantic comparison of material clauses, obligations and prohibitions;
- stores the consensus assessment;
- only for permission outcomes, emits a deterministic credential issuance message to `PermitBook` **on finalized**.

The validator is intentionally not a schema checker. A leader result that omits a material condition should be rejected even if its JSON is perfectly shaped.

### 3. PermitBook

Responsibilities:

- binds exactly one `PermissionEngine` after deployment;
- accepts issuance only from that engine;
- accepts only `PERMITTED` and `PERMITTED_WITH_CONDITIONS` results;
- stores one immutable permit per deterministic permit key;
- stores conditions, material clauses and both frozen digests;
- rejects duplicates.

The separation is meaningful: semantic interpretation and permission credential issuance have different trust and lifecycle responsibilities.

## Contract flow

```text
Rights holder
    |
    v
RightsRegistry.register_licence
    |
    | immutable licence + terms digest
    v
User creates exact use intent
    |
    v
PermissionEngine.create_intent
    |
    | frozen intent + intent digest
    v
PermissionEngine.evaluate_intent
    |
    +--> leader independently interprets
    |
    +--> validators independently interpret
    |      and compare material obligations
    |
    v
consensus assessment
    |
    +--> DENIED / INCONCLUSIVE -> no permit message
    |
    +--> PERMITTED / CONDITIONAL
             |
             | emit(on="finalized")
             v
         PermitBook.issue_permit
```

## Safe semantic result set

`PERMITTED`: frozen terms support the exact use without extra obligations beyond facts already frozen in the intent.

`PERMITTED_WITH_CONDITIONS`: frozen terms support the use only if listed obligations are satisfied.

`DENIED`: frozen terms materially prohibit the exact use.

`INCONCLUSIVE`: ambiguity, omission or contradiction prevents a fair determination from the frozen text.

`INCONCLUSIVE` is not a denial and is never a permit.

## Frontend authority model

Contract state is authoritative. Browser state is presentation only.

```text
GenLayer
  -> raw contract reads
  -> typed rights / intent / permit records
  -> domain surface
  -> React
```

Writes:

```text
user action
  -> field validation
  -> Studionet/network check
  -> GenLayer fee estimate
  -> injected-wallet signature
  -> transaction submission
  -> transaction observer
  -> provisional result if ACCEPTED
  -> finality observation
  -> contract reread
  -> permit existence check
```

The code never uses `writeContract()` completion as a permission-success signal.

## Route surface

```text
/
/registry
/terms/[licenceKey]
/intent/[intentKey]
/permit/[permitKey]
```

The licence-to-intent-to-permit sequence is encoded as separate domain documents rather than a dashboard or control-room hierarchy.

## Visual model

The frontend uses a rights-office / publishing-imprint aesthetic:

- parchment `#F3EBDD`
- near-black ink `#221C18`
- burgundy authority `#7B2D3B`
- olive permission `#5B6744`
- ochre condition `#B77A32`
- sand rules `#D8CBB7`

Layout is driven by ruled documents, marginalia, clause traces and a shareable passport rather than KPI cards.
