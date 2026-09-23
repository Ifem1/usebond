import Link from "next/link";
import { RightsLookup } from "@/rights-desk/catalogue/RightsLookup";
import { RightsIdentityMark } from "@/signer/rights-identity";
import { ADDRESSES, deploymentReady, explorerAddress } from "@/genlayer-runtime/config";

const FLOW = [
  {
    step: "01",
    accent: "lime",
    title: "Freeze the terms",
    copy: "Register the exact licence text and its source so the permission question starts from an immutable reference.",
  },
  {
    step: "02",
    accent: "yellow",
    title: "Describe the exact use",
    copy: "Turn a vague “can I use this?” into a concrete intent: action, purpose, distribution, territory and attribution.",
  },
  {
    step: "03",
    accent: "orange",
    title: "Resolve by consensus",
    copy: "GenLayer interprets the frozen terms against that frozen intent, with finality kept separate from provisional acceptance.",
  },
  {
    step: "04",
    accent: "pink",
    title: "Issue the permit",
    copy: "Only a finalized permission outcome can become a public permission passport. Denied or inconclusive outcomes issue nothing.",
  },
] as const;

function shortAddress(address: string) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "not configured";
}

export default function Landing() {
  const live = deploymentReady();
  const contracts = [
    ["Rights Registry", ADDRESSES.registry, "Frozen licence terms"],
    ["Permission Engine", ADDRESSES.engine, "Exact-use interpretation"],
    ["Permit Book", ADDRESSES.permitBook, "Finalized credentials"],
  ] as const;

  return (
    <main className="home-page">
      <div className="home-orb orb-a" />
      <div className="home-orb orb-b" />
      <div className="home-grid" />

      <div className="home-shell">
        <header className="home-nav">
          <Link className="home-brand" href="/" aria-label="USEBOND home">
            <span className="bond-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>USEBOND</span>
          </Link>

          <nav className="home-links" aria-label="Primary navigation">
            <a href="#how">How it works</a>
            <Link href="/registry">Registry</Link>
          </nav>

          <div className="home-wallet">
            <span className={`live-pill ${live ? "is-live" : ""}`}>
              <i /> {live ? "Studionet live" : "Studionet"}
            </span>
            <RightsIdentityMark />
          </div>
        </header>

        <section className="home-hero">
          <div className="hero-main">
            <div className="hero-badge">
              <span>RIGHTS CLEARING</span>
              <b>FOR EXACT INTENDED USES</b>
            </div>

            <h1>
              Know what you can
              <span> actually use.</span>
            </h1>

            <p className="home-lede">
              USEBOND turns licence ambiguity into a traceable permission flow. Freeze the terms, define the exact intended use, let independent GenLayer consensus interpret the match, and issue a credential only after finality.
            </p>

            <div className="home-actions">
              <Link className="home-cta primary" href="/registry">Explore rights registry <span>→</span></Link>
              <a className="home-cta ghost" href="#how">See the permission flow</a>
            </div>

            <div className="trust-line">
              <span><i className="dot pink" /> exact-use intent</span>
              <span><i className="dot lime" /> consensus-backed</span>
              <span><i className="dot yellow" /> finalized permits only</span>
            </div>
          </div>

          <div className="hero-console">
            <div className="console-top">
              <div>
                <span className="console-kicker">PERMISSION DESK</span>
                <h2>Start with the governing terms.</h2>
              </div>
              <span className="console-signal"><i /> LIVE</span>
            </div>

            <p>Search a work, dataset, codebase, document or other registered asset before describing the use you want to make of it.</p>
            <RightsLookup />

            <div className="console-map">
              <div className="permission-path">
                <span className="path-node node-pink">TERMS</span>
                <i />
                <span className="path-node node-yellow">INTENT</span>
                <i />
                <span className="path-node node-orange">CONSENSUS</span>
                <i />
                <span className="path-node node-lime">PERMIT</span>
              </div>
            </div>

            <div className="console-note">
              <strong>Injected wallet only.</strong>
              <span>No wallet selector, no custodial account and no hidden server signer.</span>
            </div>
          </div>
        </section>

        <section className="signal-strip" aria-label="USEBOND product principles">
          <div><small>QUESTION</small><strong>Can I use this?</strong></div>
          <div><small>BOUNDARY</small><strong>Exact intent, not vague permission</strong></div>
          <div><small>OUTPUT</small><strong>Permit · Conditional · Denied · Inconclusive</strong></div>
        </section>

        <section className="home-section" id="how">
          <div className="home-section-head">
            <div>
              <span className="section-kicker">THE PERMISSION FLOW</span>
              <h2>Four steps. One frozen trail.</h2>
            </div>
            <p>Each stage keeps the previous one bound. The meaning can be interpreted; the underlying terms and declared use cannot quietly change underneath the decision.</p>
          </div>

          <div className="flow-cards">
            {FLOW.map((item) => (
              <article className={`flow-card accent-${item.accent}`} key={item.step}>
                <div className="flow-card-top"><span>{item.step}</span><i /></div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section contract-section">
          <div className="home-section-head">
            <div>
              <span className="section-kicker">ON-CHAIN RAILS</span>
              <h2>Three contracts. Clear responsibilities.</h2>
            </div>
            <p>The frontend is not the authority. It reads and writes against the deployed GenLayer contracts, while final permission remains gated by on-chain lifecycle state.</p>
          </div>

          <div className="contract-grid">
            {contracts.map(([name, address, role], index) => {
              const valid = /^0x[0-9a-fA-F]{40}$/.test(address);
              const body = (
                <>
                  <div className="contract-number">0{index + 1}</div>
                  <div>
                    <small>{role}</small>
                    <h3>{name}</h3>
                    <code>{shortAddress(address)}</code>
                  </div>
                  <span className="contract-arrow">↗</span>
                </>
              );
              return valid ? (
                <a className="contract-card" href={explorerAddress(address)} target="_blank" rel="noreferrer" key={name}>{body}</a>
              ) : (
                <div className="contract-card" key={name}>{body}</div>
              );
            })}
          </div>
        </section>

        <section className="decision-section">
          <div className="decision-copy">
            <span className="section-kicker">NOT A YES/NO TOY</span>
            <h2>Permission can be precise.</h2>
            <p>A useful rights system needs room for conditions and uncertainty. USEBOND preserves four bounded outcomes instead of forcing every licence question into a simplistic binary.</p>
            <Link className="text-link" href="/registry">Browse frozen terms <span>→</span></Link>
          </div>

          <div className="decision-stack">
            <div className="decision-chip permitted"><span>01</span><b>PERMITTED</b><small>Use can proceed as declared.</small></div>
            <div className="decision-chip conditional"><span>02</span><b>PERMITTED WITH CONDITIONS</b><small>Obligations travel with the permission.</small></div>
            <div className="decision-chip denied"><span>03</span><b>DENIED</b><small>The exact declared use is not authorized.</small></div>
            <div className="decision-chip inconclusive"><span>04</span><b>INCONCLUSIVE</b><small>Uncertainty stays visible; no permit is issued.</small></div>
          </div>
        </section>

        <section className="home-final">
          <div className="final-glow" />
          <span className="section-kicker">USEBOND · GENLAYER STUDIONET 61999</span>
          <h2>Move from “I think this is allowed” to a permission trail you can inspect.</h2>
          <div className="home-actions">
            <Link className="home-cta primary" href="/registry">Open USEBOND <span>→</span></Link>
          </div>
          <div className="final-meta">
            <span>Frozen licence terms</span><span>Exact-use intents</span><span>Consensus interpretation</span><span>Finalized permission passports</span>
          </div>
        </section>

        <footer className="home-footer">
          <Link className="home-brand small" href="/"><span className="bond-mark" aria-hidden="true"><i /><i /><i /></span><span>USEBOND</span></Link>
          <span>Rights clearing for exact intended uses.</span>
          <Link href="/registry">Registry →</Link>
        </footer>
      </div>
    </main>
  );
}
