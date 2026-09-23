"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Assessment, IntentRecord, LicenceRecord, PermitRecord } from "@/genlayer-runtime/models";
import { parseJson } from "@/genlayer-runtime/models";
import { readIntent, readLicence, readPermit } from "@/genlayer-runtime/reader";
import { evaluateIntent } from "@/genlayer-runtime/writer";
import { finalizeTransaction, inspectTransaction, observeTransaction, triggeredTransactions, type TxObservation } from "@/genlayer-runtime/tx-observer";
import { deploymentReady, explorerTx } from "@/genlayer-runtime/config";
import { RightsIdentityMark, useRightsIdentity } from "@/signer/rights-identity";

function outcomeClass(outcome?: string) {
  if (outcome === "DENIED") return "denied";
  if (outcome === "INCONCLUSIVE") return "inconclusive";
  return "permitted";
}

export function PermissionLens({ intentKey }: { intentKey: string }) {
  const params = useSearchParams();
  const identity = useRightsIdentity();
  const [intent, setIntent] = useState<IntentRecord | null>(null);
  const [licence, setLicence] = useState<LicenceRecord | null>(null);
  const [permit, setPermit] = useState<PermitRecord | null>(null);
  const [tx, setTx] = useState<TxObservation | null>(null);
  const [activeHash, setActiveHash] = useState(params.get("tx") || "");
  const [permitTx, setPermitTx] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const assessment = useMemo(() => parseJson<Assessment>(intent?.assessment_json || ""), [intent?.assessment_json]);

  async function load() {
    if (!deploymentReady()) return;
    const nextIntent = await readIntent(intentKey);
    setIntent(nextIntent);
    if (nextIntent) {
      const [nextLicence, nextPermit] = await Promise.all([
        readLicence(nextIntent.licence_key),
        nextIntent.permit_key ? readPermit(nextIntent.permit_key) : Promise.resolve(null),
      ]);
      setLicence(nextLicence);
      setPermit(nextPermit);
    }
  }

  useEffect(() => {
    setError("");
    load().catch((e: any) => setError(e?.message || "Could not open this permission intent."));
  }, [intentKey]);

  useEffect(() => {
    if (!activeHash) return;
    inspectTransaction(activeHash)
      .then(setTx)
      .catch(() => undefined);
  }, [activeHash]);

  async function runEvaluation() {
    setBusy(true);
    setError("");
    try {
      const account = identity.address || (await identity.connect());
      await identity.ensureNetwork();
      const hash = await evaluateIntent(account, intentKey);
      setActiveHash(hash);
      window.history.replaceState(null, "", `/intent/${encodeURIComponent(intentKey)}?tx=${encodeURIComponent(hash)}`);
      const observed = await observeTransaction(hash, setTx);
      await load();
      if (observed.stage === "UNDETERMINED") {
        setError("Consensus could not resolve this interpretation. INCONCLUSIVE and UNDETERMINED are not permission grants.");
      }
    } catch (e: any) {
      setError(e?.message || "Evaluation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function finalizeReady() {
    if (!activeHash) return;
    setBusy(true);
    setError("");
    try {
      const account = identity.address || (await identity.connect());
      await identity.ensureNetwork();
      await finalizeTransaction(activeHash, account);
      const parent = await observeTransaction(activeHash, setTx, { maxPolls: 120 });
      await load();
      if (parent.stage === "FINALIZED") {
        for (let i = 0; i < 20; i += 1) {
          const children = await triggeredTransactions(activeHash);
          if (children.length) {
            const childHash = children[0];
            const child = await observeTransaction(childHash, () => undefined, { maxPolls: 120 });
            if (child.stage === "READY_TO_FINALIZE") {
              await finalizeTransaction(childHash, account);
              await observeTransaction(childHash, () => undefined, { maxPolls: 120 });
            }
            const verifiedChild = await inspectTransaction(childHash);
            if (verifiedChild.stage === "FINALIZED") {
              setPermitTx(childHash);
              const current = await readIntent(intentKey);
              if (current?.permit_key) setPermit(await readPermit(current.permit_key));
              break;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    } catch (e: any) {
      setError(e?.message || "Finalization failed.");
    } finally {
      setBusy(false);
    }
  }

  const provisional = tx?.stage === "PROVISIONAL" || tx?.stage === "READY_TO_FINALIZE";
  const finalityUnverified = Boolean(assessment && !permit && !tx);
  const finalObserved = tx?.stage === "FINALIZED";
  const clauses = assessment?.material_clauses || [];

  return (
    <main className="permission-page">
      <div className="shell">
        <div className="folio-nav">
          <Link className="backlink" href={intent ? `/terms/${encodeURIComponent(intent.licence_key)}` : "/registry"}>← Governing terms</Link>
          <RightsIdentityMark />
        </div>

        {!deploymentReady() && <div className="setup-memo"><strong>Deployment configuration required.</strong> This route is wired for live Studionet reads and writes once finalized addresses are supplied.</div>}
        {error && <p className="error-ink">{error}</p>}
        {deploymentReady() && !intent && !error && <div className="empty-ledger">Opening frozen intent…</div>}

        {intent && (
          <>
            <header className="intent-heading">
              <div className="eyebrow">Intent {intent.intent_key}</div>
              <h1>Permission Lens</h1>
              <div className="intent-statement">{intent.intent_statement}</div>
            </header>

            <section className="lens-grid">
              <div className="lens-column">
                <h3>Exact intended use</h3>
                {Object.entries(intent.facts).filter(([key]) => key !== "extra_facts").map(([key, value]) => (
                  <div className="intent-fact" key={key}>
                    <b>{key.replaceAll("_", " ")}</b>
                    <span>{typeof value === "boolean" ? (value ? "yes" : "no") : String(value)}</span>
                  </div>
                ))}
              </div>

              <div className="trace-column" aria-hidden="true">→<br />→<br />→<br />→</div>

              <div className="lens-column">
                <h3>{clauses.length ? "Material licence clauses" : "Governing terms"}</h3>
                {clauses.length ? clauses.map((item, index) => (
                  <div className="clause-block" key={`${item.clause}-${index}`}>
                    <b>{item.clause || `Clause ${index + 1}`}</b>
                    <span>{item.effect}</span>
                    <p className="rights-meta">{item.reason}</p>
                  </div>
                )) : (
                  <div className="clause-block">
                    <b>{licence?.title || intent.licence_key}</b>
                    <span>Relevant clauses will appear after independent consensus interprets the frozen licence against this exact intent.</span>
                  </div>
                )}
              </div>
            </section>

            <section className="interpretation-stack">
              <div className="stack-rail">
                <div className="stack-step"><strong>Frozen terms</strong>bound to digest</div>
                <div className="stack-step"><strong>Frozen intent</strong>exact use fixed</div>
                <div className={`stack-step ${tx && !finalObserved ? "active" : ""}`}><strong>Interpretation</strong>{tx ? tx.stage.replaceAll("_", " ").toLowerCase() : "not requested"}</div>
                <div className={`stack-step ${finalObserved ? "active" : ""}`}><strong>Finality</strong>{finalObserved ? "observed" : "pending"}</div>
                <div className={`stack-step ${permit && permitTx ? "active" : ""}`}><strong>Permission</strong>{permit && permitTx ? "issued" : "not issued"}</div>
              </div>

              <div>
                {!assessment && (
                  <div className="assessment-sheet">
                    <div className="folio-label">Interpretation not yet requested</div>
                    <h2 style={{ fontFamily: "Georgia,serif", fontWeight: 500 }}>Independent consensus will evaluate the exact use against the frozen terms.</h2>
                    <p className="rights-meta">The validator is required to reconstruct the material permission outcome and obligations, not merely check JSON shape.</p>
                    <button className="primary-action" disabled={busy} onClick={() => void runEvaluation()}>{busy ? "Submitting…" : "Request interpretation"}</button>
                  </div>
                )}

                {assessment && (
                  <div className="assessment-sheet">
                    <div className="folio-label">Current interpretation {provisional && <span className="provisional-seal">PROVISIONAL</span>} {finalityUnverified && <span className="provisional-seal">FINALITY UNVERIFIED</span>}</div>
                    <div className={`outcome ${outcomeClass(assessment.outcome)}`}>{assessment.outcome.replaceAll("_", " ")}</div>
                    <p>{assessment.summary}</p>
                    {assessment.conditions?.length > 0 && (
                      <>
                        <div className="folio-label">Conditions</div>
                        <ol className="conditions-list">{assessment.conditions.map((condition, index) => <li key={`${condition}-${index}`}>{condition}</li>)}</ol>
                      </>
                    )}
                    {(provisional || finalityUnverified) && <div className="setup-memo"><strong>This is not a permission credential.</strong> An accepted or ready-to-finalize interpretation remains provisional. No permit should be represented as issued until finality and permit-book activation are observed.</div>}
                    {tx?.stage === "READY_TO_FINALIZE" && <button className="primary-action" disabled={busy} onClick={() => void finalizeReady()}>{busy ? "Finalizing…" : "Finalize interpretation"}</button>}
                    {finalObserved && !permit && assessment.outcome.startsWith("PERMITTED") && <div className="setup-memo"><strong>Parent interpretation finalized.</strong> Finalized child issuance is still being observed. Do not claim the permit yet.</div>}
                    {permit && permitTx && <p><Link className="primary-action" href={`/permit/${encodeURIComponent(permit.permit_key)}?tx=${encodeURIComponent(permitTx)}`}>Open finalized permission passport</Link></p>}
                    {permit && !permitTx && <div className="setup-memo"><strong>Permit record detected, finality not yet independently verified.</strong> The passport remains withheld until the issuance transaction itself is observed as FINALIZED.</div>}
                  </div>
                )}

                {tx && (
                  <div className="tx-ribbon">
                    <strong>{tx.stage.replaceAll("_", " ")}</strong>
                    <code>{tx.hash.slice(0, 18)}…</code>
                    <a href={explorerTx(tx.hash)} target="_blank" rel="noreferrer">technical record ↗</a>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
