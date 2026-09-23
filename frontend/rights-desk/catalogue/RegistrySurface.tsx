"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { deploymentReady } from "@/genlayer-runtime/config";
import { listLicenceKeys, readLicence } from "@/genlayer-runtime/reader";
import type { LicenceRecord } from "@/genlayer-runtime/models";
import { RightsIdentityMark } from "@/signer/rights-identity";
import { PublishTermsComposer } from "@/rights-desk/publishing/PublishTermsComposer";

function tone(value: string): string {
  const v = value.toLowerCase();
  if (v.includes("deny") || v.includes("prohibit") || v.includes("not permitted")) return "deny";
  if (v.includes("conditional") || v.includes("restrict") || v.includes("required")) return "conditional";
  return "permit";
}

export function RegistrySurface() {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<LicenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [assetFilter, setAssetFilter] = useState("all");

  async function refresh() {
    if (!deploymentReady()) {
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const keys = await listLicenceKeys();
      const values = await Promise.all(keys.map((key) => readLicence(key)));
      setRecords(values.filter(Boolean) as LicenceRecord[]);
    } catch (e: any) {
      setError(e?.message || "Could not read the rights registry.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((item) => {
      const textMatch = !q || [item.title, item.rights_holder, item.licence_key, item.asset_type]
        .join(" ")
        .toLowerCase()
        .includes(q);
      const assetMatch = assetFilter === "all" || item.asset_type.toLowerCase() === assetFilter;
      return textMatch && assetMatch;
    });
  }, [records, query, assetFilter]);

  return (
    <main className="registry-page">
      <div className="shell">
        <div className="mast">
          <Link className="wordmark" href="/">USEBOND</Link>
          <RightsIdentityMark />
        </div>

        <div className="registry-toolrow">
          <div>
            <div className="eyebrow">Rights registry</div>
            <h1 className="registry-title">Registered terms</h1>
          </div>
          <div className="registry-controls">
            <input
              aria-label="Search registry"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search registry…"
              style={{ background: "transparent", border: 0, borderBottom: "1px solid var(--rule)", padding: "10px 2px", minWidth: 220 }}
            />
            <button className="primary-action" onClick={() => setPublishing((v) => !v)}>
              {publishing ? "Close publisher" : "Publish terms +"}
            </button>
          </div>
        </div>

        <div className="filter-strip" aria-label="Registry filters">
          {[
            ["all", "All"],
            ["dataset", "Data"],
            ["images", "Images"],
            ["code", "Code"],
            ["media", "Media"],
            ["document", "Documents"],
          ].map(([value, label]) => (
            <button key={value} className={`filter-pill ${assetFilter === value ? "active" : ""}`} onClick={() => setAssetFilter(value)}>
              {label}
            </button>
          ))}
        </div>

        {publishing && (
          <PublishTermsComposer
            onClose={() => setPublishing(false)}
            onRegistered={() => {
              setPublishing(false);
              void refresh();
            }}
          />
        )}

        {!deploymentReady() && (
          <div className="setup-memo">
            <strong>Deployment configuration required.</strong> The registry UI is ready, but the three Studionet contract addresses are intentionally blank in this handoff. Deploy to chain 61999, copy <code>.env.generated</code> into the frontend environment, then reload.
          </div>
        )}

        {error && <p className="error-ink">{error}</p>}
        {loading && <div className="empty-ledger">Reading the registry…</div>}
        {!loading && deploymentReady() && filtered.length === 0 && (
          <div className="empty-ledger">No registered terms match this index.</div>
        )}

        <div className="rights-index">
          {filtered.map((item) => (
            <Link className="rights-entry" href={`/terms/${encodeURIComponent(item.licence_key)}`} key={item.licence_key}>
              <div className="index-letter">{item.title.slice(0, 1).toUpperCase()}</div>
              <div>
                <h2 className="rights-title">{item.title}</h2>
                <div className="rights-meta">
                  {item.rights_holder}<br />{item.asset_type} · {item.licence_key}
                </div>
              </div>
              <div className="rights-map-mini">
                {Object.entries(item.rights_map || {}).slice(0, 6).map(([key, value]) => (
                  <span className={`right-tag ${tone(value)}`} key={key}>{key.replaceAll("_", " ")}: {value}</span>
                ))}
              </div>
              <div className="rights-meta" style={{ textAlign: "right" }}>frozen<br />{item.terms_digest.slice(0, 9)}…</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
