"use client";

import { useMemo, useState } from "react";
import { registerLicence } from "@/genlayer-runtime/writer";
import { observeTransaction, type TxObservation } from "@/genlayer-runtime/tx-observer";
import { explorerTx } from "@/genlayer-runtime/config";
import { useRightsIdentity } from "@/signer/rights-identity";
import { ExecutionResult } from "genlayer-js/types";

const DEFAULT_MAP: Record<string, string> = {
  commercial_use: "conditional",
  model_training: "restricted",
  derivative_works: "conditional",
  redistribution: "denied",
  attribution: "required",
};

function isValidSource(value: string) {
  const source = value.trim();
  return source.length <= 512 && (source.startsWith("https://") || source.startsWith("ipfs://"));
}

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

  const canSubmit = useMemo(() => {
    const key = form.key.trim();
    const title = form.title.trim();
    const assetType = form.assetType.trim();
    const holder = form.rightsHolder.trim();
    const terms = form.termsText.trim();
    const mapJson = JSON.stringify(rightsMap);
    return /^[A-Za-z0-9._:-]{4,64}$/.test(key) &&
      title.length >= 3 && title.length <= 140 &&
      assetType.length >= 2 && assetType.length <= 48 &&
      isValidSource(form.canonicalSource) &&
      holder.length >= 2 && holder.length <= 140 &&
      terms.length >= 80 && form.termsText.length <= 12000 &&
      Object.keys(rightsMap).length > 0 && mapJson.length <= 6000;
  }, [form, rightsMap]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const account = identity.address || (await identity.connect());
      await identity.ensureNetwork();
      const hash = await registerLicence(account, {
        key: form.key.trim(),
        title: form.title.trim(),
        assetType: form.assetType.trim(),
        canonicalSource: form.canonicalSource.trim(),
        rightsHolder: form.rightsHolder.trim(),
        termsText: form.termsText.trim(),
        rightsMap,
      });
      const final = await observeTransaction(hash, setTx);
      if (final.stage === "FINALIZED") {
        const executionResult = (final.raw as { txExecutionResultName?: ExecutionResult } | null)?.txExecutionResultName;
        if (executionResult === ExecutionResult.FINISHED_WITH_RETURN) onRegistered();
        else if (executionResult === ExecutionResult.FINISHED_WITH_ERROR) {
          setError("The transaction finalized, but the registry rejected the licence. Check the transaction details before retrying.");
        } else {
          setError("The transaction finalized, but its execution result is unavailable. Verify it in the explorer before retrying.");
        }
      } else if (final.stage === "FAILED" || final.stage === "UNDETERMINED") {
        setError(`Registration did not complete (${final.stage.toLowerCase().replaceAll("_", " ")}). Check the transaction in the explorer.`);
      }
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
          <div className="field"><label htmlFor="licence-key">Licence key</label><input id="licence-key" required maxLength={64} value={form.key} onChange={(e) => update("key", e.target.value)} placeholder="UBL-MERIDIAN-01" aria-describedby="licence-key-help" /><small id="licence-key-help">4–64 letters, numbers, dots, underscores, colons or hyphens.</small></div>
          <div className="field"><label htmlFor="licence-title">Work or asset title</label><input id="licence-title" required minLength={3} maxLength={140} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Meridian Climate Data" /></div>
          <div className="field"><label htmlFor="licence-asset-type">Asset type</label><select id="licence-asset-type" required value={form.assetType} onChange={(e) => update("assetType", e.target.value)}><option>dataset</option><option>images</option><option>code</option><option>media</option><option>document</option><option>model</option><option>other</option></select></div>
          <div className="field"><label htmlFor="licence-source">Canonical source</label><input id="licence-source" required maxLength={512} value={form.canonicalSource} onChange={(e) => update("canonicalSource", e.target.value)} placeholder="https://… or ipfs://…" aria-describedby="licence-source-help" /><small id="licence-source-help">Use https:// or ipfs:// (max 512 characters).</small></div>
          <div className="field"><label htmlFor="licence-holder">Rights holder</label><input id="licence-holder" required minLength={2} maxLength={140} value={form.rightsHolder} onChange={(e) => update("rightsHolder", e.target.value)} /></div>
          <div className="field"><label htmlFor="licence-terms">Frozen natural-language terms</label><textarea id="licence-terms" required minLength={80} maxLength={12000} value={form.termsText} onChange={(e) => update("termsText", e.target.value)} placeholder="Paste the complete licence language that consensus must interpret…" aria-describedby="licence-terms-help" /><small id="licence-terms-help">At least 80 non-space characters; {form.termsText.length}/12,000 characters.</small></div>
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
