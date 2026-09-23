"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { LicenceRecord, PermitRecord } from "@/genlayer-runtime/models";
import { findFinalizedPermitTransaction, readLicence, readPermit } from "@/genlayer-runtime/reader";
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
        const value = await readPermit(permitKey);
        setPermit(value);
        if (value) setLicence(await readLicence(value.licence_key));

        const hinted = query.get("tx") || "";
        if (/^0x[0-9a-fA-F]{64}$/.test(hinted)) {
          const observation = await inspectTransaction(hinted);
          if (observation.stage === "FINALIZED") {
            setIssuanceTx(hinted);
            setVerified(true);
            return;
          }
        }

        const discovered = await findFinalizedPermitTransaction(permitKey);
        if (discovered) {
          setIssuanceTx(discovered);
          setVerified(true);
        }
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
        {!loading && deploymentReady() && !permit && <div className="empty-ledger">No permission credential exists under this key.</div>}
        {permit && !verified && (
          <div className="setup-memo">
            <strong>Permit record found, issuance finality not verified.</strong> USEBOND will not present this record as a final permission passport until the permit issuance transaction is independently observed as `FINALIZED`.
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
                <div className="passport-field"><small>Issued</small>{permit.issued_at}</div>
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
                <a href={explorerTx(issuanceTx)} target="_blank" rel="noreferrer">issuance transaction ↗</a>
                <a href={explorerAddress(ADDRESSES.permitBook)} target="_blank" rel="noreferrer">permit book ↗</a>
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
