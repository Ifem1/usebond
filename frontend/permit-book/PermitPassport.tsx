"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { LicenceRecord, PermitRecord } from "@/genlayer-runtime/models";
import { findFinalizedPermitTransaction, readIntent, readLicence, readPermit } from "@/genlayer-runtime/reader";
import { permitFromFinalizedIssuance } from "@/genlayer-runtime/permit-evidence";
import { inspectTransaction } from "@/genlayer-runtime/tx-observer";
import { deploymentReady, explorerAddress, explorerTx, ADDRESSES } from "@/genlayer-runtime/config";

export function PermitPassport({ permitKey }: { permitKey: string }) {
  const query = useSearchParams();
  const [permit, setPermit] = useState<PermitRecord | null>(null);
  const [licence, setLicence] = useState<LicenceRecord | null>(null);
  const [issuanceTx, setIssuanceTx] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deploymentReady()) { setLoading(false); return; }
    (async () => {
      try {
        let value: PermitRecord | null = null;
        let permitReadUnavailable = false;
        try { value = await readPermit(permitKey); } catch { permitReadUnavailable = true; }
        const hinted = query.get("tx") || "";
        let discovered = /^0x[0-9a-fA-F]{64}$/.test(hinted) ? hinted : "";
        let observation = discovered ? await inspectTransaction(discovered).catch(() => null) : null;
        let evidence = observation ? permitFromFinalizedIssuance(observation.raw, permitKey) : null;
        if (!evidence) {
          discovered = await findFinalizedPermitTransaction(permitKey) || "";
          observation = discovered ? await inspectTransaction(discovered).catch(() => null) : null;
          evidence = observation ? permitFromFinalizedIssuance(observation.raw, permitKey) : null;
        }
        if (!discovered || !observation || !evidence) {
          if (value) setPermit(value);
          else if (permitReadUnavailable) setError("The PermitBook read endpoint is unavailable, and no finalized successful issuance transaction could be verified. This page will not claim a permission passport.");
          return;
        }

        const intent = await readIntent(evidence.intent_key);
        const verifiedEvidence = permitFromFinalizedIssuance(observation.raw, permitKey, intent);
        if (!intent || !verifiedEvidence) {
          setError("The finalized issuance transaction does not match the stored intent. The passport remains withheld.");
          return;
        }
        if (value && (
          value.permit_key !== verifiedEvidence.permit_key ||
          value.intent_digest !== verifiedEvidence.intent_digest ||
          value.terms_digest !== verifiedEvidence.terms_digest ||
          value.holder.toLowerCase() !== verifiedEvidence.holder.toLowerCase()
        )) {
          setError("The PermitBook record does not match its finalized issuance transaction. The passport remains withheld.");
          return;
        }

        value = value || verifiedEvidence;
        setPermit(value);
        setLicence(await readLicence(value.licence_key));
        setIssuanceTx(discovered);
        setVerified(true);
      } catch (e: any) {
        setError(e?.message || "Could not read this permission credential.");
      } finally {
        setLoading(false);
      }
    })();
  }, [permitKey, query]);

  return (
    <main className="passport-page">
      <div className="shell">
        {!deploymentReady() && <div className="setup-memo"><strong>Deployment configuration required.</strong> Public permission passports become live after the permit book is deployed on Studionet 61999.</div>}
        {loading && <div className="empty-ledger">Reading permission credential…</div>}
        {error && <p className="error-ink">{error}</p>}
        {!loading && deploymentReady() && !permit && !error && <div className="empty-ledger">No permission credential exists under this key.</div>}
        {permit && !verified && (
          <div className="setup-memo">
            <strong>Permit record found, finality not verified.</strong> USEBOND will not present this record as a final permission passport until its finalized evaluation is independently observed.
          </div>
        )}

        {permit && verified && (
          <article className="permission-passport">
            <div className="passport-top">
              <Link className="wordmark" href="/">USEBOND</Link>
              <span className="network-stamp">Finalized permission credential</span>
            </div>
            <div className="passport-body">
              <div className="permission-stamp"><strong>{permit.outcome === "PERMITTED" ? "PERMITTED" : "PERMITTED\nWITH CONDITIONS"}</strong></div>
              <h1 className="passport-title">{licence?.title || permit.licence_key}</h1>
              <p style={{ textAlign: "center", color: "var(--muted)" }}>{permit.permit_key}</p>

              <div className="passport-grid">
                <div className="passport-field"><small>Holder</small>{permit.holder}</div>
                <div className="passport-field"><small>Licence</small>{permit.licence_key}</div>
                <div className="passport-field"><small>Intent</small>{permit.intent_key}</div>
                <div className="passport-field"><small>Issued</small>{permit.issued_at || "Recorded by finalized issuance"}</div>
                <div className="passport-field"><small>Terms digest</small>{permit.terms_digest.slice(0, 20)}…</div>
                <div className="passport-field"><small>Intent digest</small>{permit.intent_digest.slice(0, 20)}…</div>
              </div>

              <div className="passport-conditions">
                <div className="folio-label">Authorized interpretation</div>
                <p>{permit.summary}</p>
                {permit.conditions?.length > 0 ? (
                  <ol className="conditions-list">{permit.conditions.map((condition, index) => <li key={`${condition}-${index}`}>{condition}</li>)}</ol>
                ) : <p>No additional conditions were recorded beyond the frozen intent itself.</p>}
              </div>

              <div className="setup-memo">
                This credential represents the frozen licence and exact intent identified above. It is not a general legal opinion and does not authorize a different use.
              </div>

              <div className="tx-ribbon">
                <strong>FINALIZED</strong>
                <code>{issuanceTx.slice(0, 18)}…</code>
                <a href={explorerTx(issuanceTx)} target="_blank" rel="noreferrer">finalized permit issuance ↗</a>
                <a href={explorerAddress(ADDRESSES.permitBook)} target="_blank" rel="noreferrer">permit book ↗</a>
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
