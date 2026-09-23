"use client";

import { useMemo, useState } from "react";
import { registerLicence } from "@/genlayer-runtime/writer";
import { observeTransaction, type TxObservation } from "@/genlayer-runtime/tx-observer";
import { explorerTx } from "@/genlayer-runtime/config";
import { useRightsIdentity } from "@/signer/rights-identity";

const DEFAULT_MAP: Record<string, string> = {
  commercial_use: "conditional",
  model_training: "restricted",
  derivative_works: "conditional",
  redistribution: "denied",
  attribution: "required",
};

export function PublishTermsComposer({ onClose, onRegistered }: { onClose: () => void; onRegistered: () => void }) {
  const identity = useRightsIdentity();
  const [form, setForm] = useState({
    key: "",
    title: "",
    assetType: "dataset",
    canonicalSource: "",
    rightsHolder: "",
    termsText: "",
  });
  const [rightsMap, setRightsMap] = useState(DEFAULT_MAP);
  const [tx, setTx] = useState<TxObservation | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() =>
    form.key.length >= 4 &&
    form.title.length >= 3 &&
    form.canonicalSource.startsWith("http") &&
    form.rightsHolder.length >= 2 &&
    form.termsText.length >= 80,
  [form]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const account = identity.address || (await identity.connect());
      await identity.ensureNetwork();
      const hash = await registerLicence(account, { ...form, rightsMap });
      const final = await observeTransaction(hash, setTx);
      if (final.stage === "FINALIZED") onRegistered();
    } catch (e: any) {
      setError(e?.message || "Terms registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="publish-workbench" aria-label="Publish licence terms">
      <div className="workbench-head">
        <div>
          <div className="folio-label">Term publisher</div>
          <h2>Freeze a licence</h2>
        </div>
        <button className="text-action" onClick={onClose}>Close ×</button>
      </div>

      <div className="workbench-body">
        <div>
          <div className="field"><label>Licence key</label><input value={form.key} onChange={(e) => update("key", e.target.value)} placeholder="UBL-MERIDIAN-01" /></div>
          <div className="field"><label>Work or asset title</label><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Meridian Climate Data" /></div>
          <div className="field"><label>Asset type</label><select value={form.assetType} onChange={(e) => update("assetType", e.target.value)}><option>dataset</option><option>images</option><option>code</option><option>media</option><option>document</option><option>model</option><option>other</option></select></div>
          <div className="field"><label>Canonical source</label><input value={form.canonicalSource} onChange={(e) => update("canonicalSource", e.target.value)} placeholder="https://…" /></div>
          <div className="field"><label>Rights holder</label><input value={form.rightsHolder} onChange={(e) => update("rightsHolder", e.target.value)} /></div>
          <div className="field"><label>Frozen natural-language terms</label><textarea value={form.termsText} onChange={(e) => update("termsText", e.target.value)} placeholder="Paste the complete licence language that consensus must interpret…" /></div>
        </div>

        <div>
          <div className="folio-label" style={{ marginBottom: 12 }}>Human-readable rights map</div>
          <div className="rights-grid">
            {Object.entries(rightsMap).map(([key, value]) => (
              <label className="rights-control" key={key}>
                <span>{key.replaceAll("_", " ")}</span>
                <select value={value} onChange={(e) => setRightsMap((prev) => ({ ...prev, [key]: e.target.value }))}>
                  <option value="permitted">permitted</option>
                  <option value="conditional">conditional</option>
                  <option value="restricted">restricted</option>
                  <option value="denied">denied</option>
                  <option value="required">required</option>
                  <option value="not_required">not required</option>
                </select>
              </label>
            ))}
          </div>
          <div className="setup-memo" style={{ marginTop: 20 }}>
            The rights map helps people scan the licence. The frozen natural-language terms remain the authoritative input to consensus.
          </div>
          {tx && (
            <div className="tx-ribbon">
              <strong>{tx.stage.replaceAll("_", " ")}</strong>
              <code>{tx.hash.slice(0, 14)}…</code>
              <a href={explorerTx(tx.hash)} target="_blank" rel="noreferrer">explorer ↗</a>
            </div>
          )}
          {error && <p className="error-ink">{error}</p>}
        </div>
      </div>

      <div className="workbench-actions">
        <button className="secondary-action" onClick={onClose}>Cancel</button>
        <button className="primary-action" disabled={!canSubmit || busy} onClick={() => void submit()}>{busy ? "Registering…" : "Freeze terms"}</button>
      </div>
    </section>
  );
}
