"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { IntentFacts, LicenceRecord } from "@/genlayer-runtime/models";
import { createIntent } from "@/genlayer-runtime/writer";
import { observeTransaction, type TxObservation } from "@/genlayer-runtime/tx-observer";
import { explorerTx } from "@/genlayer-runtime/config";
import { useRightsIdentity } from "@/signer/rights-identity";

const ACTIONS = [
  "train a model",
  "analyse the material",
  "create a derivative work",
  "redistribute copies",
  "publish generated outputs",
  "embed it in a product",
];
const PURPOSES = ["a commercial product", "internal research", "academic publication", "a public service", "client work"];
const DISTRIBUTIONS = ["outputs distributed publicly", "outputs kept internal", "outputs shared with clients", "no output distribution"];
const TERRITORIES = ["worldwide", "United Kingdom and EU", "United States", "Nigeria", "specified territories only"];
const ATTRIBUTION = ["attribution will be displayed", "attribution will be supplied in documentation", "no attribution is planned"];

function newIntentKey(): string {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
  return `UBI-${suffix}`;
}

export function UseComposer({ licence }: { licence: LicenceRecord }) {
  const router = useRouter();
  const identity = useRightsIdentity();
  const [facts, setFacts] = useState<IntentFacts>({
    action: ACTIONS[0],
    purpose: PURPOSES[0],
    distribution: DISTRIBUTIONS[0],
    territory: TERRITORIES[0],
    attribution: ATTRIBUTION[0],
    source_redistribution: false,
    third_party_access: false,
    extra_facts: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tx, setTx] = useState<TxObservation | null>(null);

  const statement = useMemo(() => {
    return `${facts.action} using ${licence.title} for ${facts.purpose}, with ${facts.distribution}, in ${facts.territory}. ${facts.attribution}. The source ${facts.source_redistribution ? "will" : "will not"} be redistributed and third parties ${facts.third_party_access ? "will" : "will not"} receive source access.${facts.extra_facts ? ` Additional facts: ${facts.extra_facts}` : ""}`;
  }, [facts, licence.title]);

  async function freezeIntent() {
    setBusy(true);
    setError("");
    try {
      const account = identity.address || (await identity.connect());
      await identity.ensureNetwork();
      const key = newIntentKey();
      const hash = await createIntent(account, key, licence.licence_key, facts);
      const final = await observeTransaction(hash, setTx, { maxPolls: 120 });
      if (["PROVISIONAL", "READY_TO_FINALIZE", "FINALIZED"].includes(final.stage)) {
        router.push(`/intent/${encodeURIComponent(key)}?createTx=${encodeURIComponent(hash)}`);
      } else if (final.stage === "UNDETERMINED") {
        setError("Intent registration became undetermined. Do not treat it as registered; inspect the transaction before retrying.");
      } else if (final.stage === "FAILED") {
        setError("Intent registration did not complete.");
      }
    } catch (e: any) {
      setError(e?.message || "Could not freeze this intent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="use-composer">
      <div className="eyebrow">Use composer</div>
      <h2>What do you want to do?</h2>
      <div className="sentence-builder">
        I want to{" "}
        <select className="inline-select" value={facts.action} onChange={(e) => setFacts((v) => ({ ...v, action: e.target.value }))}>{ACTIONS.map((v) => <option key={v}>{v}</option>)}</select>{" "}
        using <strong>{licence.title}</strong> for{" "}
        <select className="inline-select" value={facts.purpose} onChange={(e) => setFacts((v) => ({ ...v, purpose: e.target.value }))}>{PURPOSES.map((v) => <option key={v}>{v}</option>)}</select>, with{" "}
        <select className="inline-select" value={facts.distribution} onChange={(e) => setFacts((v) => ({ ...v, distribution: e.target.value }))}>{DISTRIBUTIONS.map((v) => <option key={v}>{v}</option>)}</select>{" "}
        in <select className="inline-select" value={facts.territory} onChange={(e) => setFacts((v) => ({ ...v, territory: e.target.value }))}>{TERRITORIES.map((v) => <option key={v}>{v}</option>)}</select>.
      </div>

      <div className="fact-strip">
        <div className="field"><label>Attribution</label><select value={facts.attribution} onChange={(e) => setFacts((v) => ({ ...v, attribution: e.target.value }))}>{ATTRIBUTION.map((v) => <option key={v}>{v}</option>)}</select></div>
        <div className="field"><label>Additional facts</label><input value={facts.extra_facts} onChange={(e) => setFacts((v) => ({ ...v, extra_facts: e.target.value }))} placeholder="Optional facts material to the licence" /></div>
        <label className="boolean-line"><input type="checkbox" checked={facts.source_redistribution} onChange={(e) => setFacts((v) => ({ ...v, source_redistribution: e.target.checked }))} /> Redistribute the source material itself</label>
        <label className="boolean-line"><input type="checkbox" checked={facts.third_party_access} onChange={(e) => setFacts((v) => ({ ...v, third_party_access: e.target.checked }))} /> Give third parties access to source material</label>
      </div>

      <div className="intent-preview">
        <div className="folio-label">Exact statement that will be frozen</div>
        <p>{statement}</p>
      </div>

      {tx && <div className="tx-ribbon"><strong>{tx.stage.replaceAll("_", " ")}</strong><code>{tx.hash.slice(0, 14)}…</code><a href={explorerTx(tx.hash)} target="_blank" rel="noreferrer">explorer ↗</a></div>}
      {error && <p className="error-ink">{error}</p>}
      <button className="primary-action" onClick={() => void freezeIntent()} disabled={busy}>{busy ? "Freezing intent…" : "Freeze this use intent"}</button>
    </section>
  );
}
