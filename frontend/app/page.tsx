import { RightsLookup } from "@/rights-desk/catalogue/RightsLookup";

export default function Landing() {
  return (
    <main>
      <div className="shell">
        <div className="mast">
          <span className="wordmark">USEBOND</span>
          <span className="network-stamp">GenLayer · Studionet 61999</span>
        </div>

        <section className="hero">
          <div>
            <div className="hero-kicker">Rights clearing for exact intended uses</div>
            <h1>Can I <em>use</em> this?</h1>
            <p className="hero-copy">
              Freeze licence terms, describe the exact use you intend, and let independent consensus determine whether that use is permitted, conditional, denied, or genuinely inconclusive.
            </p>
          </div>

          <div className="search-folio">
            <div className="folio-label">Rights registry</div>
            <h2>Find the governing terms.</h2>
            <p>Browse registered works, datasets, code, media, documents and other licensed material.</p>
            <RightsLookup />
          </div>
        </section>

        <section className="section-spread">
          <div className="section-heading">
            <h2>Permission is about the exact use.</h2>
            <p>
              USEBOND keeps licence text and use intent frozen before interpretation. A permission credential is not issued merely because a transaction was accepted; authorization follows finality and deterministic credential issuance.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
