"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LicenceRecord } from "@/genlayer-runtime/models";
import { readLicence } from "@/genlayer-runtime/reader";
import { deploymentReady } from "@/genlayer-runtime/config";
import { RightsIdentityMark } from "@/signer/rights-identity";
import { UseComposer } from "@/use-composer/UseComposer";

function classFor(value: string) {
  const v = value.toLowerCase();
  if (v.includes("deny") || v.includes("not permitted")) return "denied";
  if (v.includes("conditional") || v.includes("restricted") || v.includes("required")) return "conditional";
  return "permitted";
}

export function LicenceFolio({ licenceKey }: { licenceKey: string }) {
  const [licence, setLicence] = useState<LicenceRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deploymentReady()) { setLoading(false); return; }
    readLicence(licenceKey)
      .then((value) => setLicence(value))
      .catch((e: any) => setError(e?.message || "Could not read this licence."))
      .finally(() => setLoading(false));
  }, [licenceKey]);

  return (
    <main className="folio-page">
      <div className="shell">
        <div className="folio-nav">
          <Link className="backlink" href="/registry">← Rights registry</Link>
          <RightsIdentityMark />
        </div>

        {!deploymentReady() && <div className="setup-memo"><strong>Deployment configuration required.</strong> Add the finalized Studionet addresses before opening live licence folios.</div>}
        {loading && <div className="empty-ledger">Opening frozen terms…</div>}
        {error && <p className="error-ink">{error}</p>}
        {!loading && deploymentReady() && !licence && <div className="empty-ledger">No frozen licence exists under this key.</div>}

        {licence && (
          <>
            <header className="folio-heading">
              <div className="eyebrow">Licence {licence.licence_key}</div>
              <h1>{licence.title}</h1>
              <div className="folio-subline">
                <span>{licence.rights_holder}</span>
                <span>{licence.asset_type}</span>
                <span>frozen · {licence.registered_at}</span>
                <span>digest {licence.terms_digest.slice(0, 12)}…</span>
              </div>
            </header>

            <div className="folio-layout">
              <aside className="rights-margin">
                <div className="folio-label">Rights map</div>
                <h2>At a glance</h2>
                {Object.entries(licence.rights_map || {}).map(([key, value]) => (
                  <div className="map-row" key={key}>
                    <span>{key.replaceAll("_", " ")}</span>
                    <span className={`map-value ${classFor(value)}`}>{value}</span>
                  </div>
                ))}
                <div className="setup-memo" style={{ marginTop: 24 }}>
                  This map is explanatory. Consensus interprets the frozen licence text below.
                </div>
              </aside>

              <article className="licence-text">
                <div className="folio-label">Frozen licence</div>
                <h2>Governing terms</h2>
                <p>{licence.terms_text}</p>
                <p><a className="text-action" href={licence.canonical_source} target="_blank" rel="noreferrer">Canonical source ↗</a></p>
              </article>
            </div>

            <UseComposer licence={licence} />
          </>
        )}
      </div>
    </main>
  );
}
