"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import "./landing.css";

/* ------------------------------------------------------------------ */
/* Inline icons (match the Claude Design — no lucide on the landing)   */
/* ------------------------------------------------------------------ */

function BrandMark() {
  return (
    <svg className="mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="2.5" width="17" height="19" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <line x1="7.5" y1="8" x2="16.5" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="#36D6A1" strokeWidth="2" strokeLinecap="round" />
      <line x1="7.5" y1="16" x2="12.5" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const STATS = [
  {
    fig: "~90",
    sup: "%",
    lead: "of tenants face eviction court without a lawyer.",
    body: "Their landlords almost always have one. The paperwork is written to be obeyed, not understood.",
  },
  {
    fig: "50",
    sup: "%+",
    lead: "of denied health claims get overturned on appeal.",
    body: "Most people never appeal, because the denial letter never tells them they can.",
  },
  {
    fig: "$60",
    sup: "B+",
    lead: "in government benefits go unclaimed every year.",
    body: "Not because people don’t qualify. Because the forms are confusing enough to give up on.",
  },
];

const DOCS = [
  {
    title: "Eviction Notices",
    desc: "Pay-or-quit, just-cause, improper service, miscounted deadlines. The notice that arrives taped to a door.",
    count: "17",
    of: "tenant-law statutes",
  },
  {
    title: "Insurance Denials",
    desc: "Claim denials, appeal rights, IMR timelines, bad-faith and ACA protections you weren’t told about.",
    count: "12",
    of: "insurance statutes",
  },
  {
    title: "Benefits Terminations",
    desc: "CalFresh, Medi-Cal, fair-hearing rights, notice requirements. The letter that quietly cuts you off.",
    count: "10",
    of: "benefits statutes",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Hero entrance — stagger the masked lines + faded elements */
    const hero = root.querySelector<HTMLElement>(".hero");
    const playHero = () => {
      if (!hero) return;
      if (!reduce) {
        const lines = hero.querySelectorAll<HTMLElement>(".line-mask > span");
        lines.forEach((el, i) => {
          el.style.transitionDelay = `${0.18 + i * 0.085}s`;
        });
        const base = 0.18 + lines.length * 0.085;
        hero.querySelectorAll<HTMLElement>(".reveal-hero").forEach((el, i) => {
          el.style.animationDelay = `${base + i * 0.07}s`;
        });
        void hero.offsetWidth; // commit initial state before transitions
      }
      hero.classList.add("ready");
    };
    if (document.fonts && document.fonts.ready) {
      Promise.race([
        document.fonts.ready,
        new Promise((r) => setTimeout(r, 600)),
      ]).then(playHero);
    } else {
      setTimeout(playHero, 60);
    }

    /* Scroll-triggered reveals */
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const group = el.parentElement;
          const sibs = group
            ? Array.from(group.querySelectorAll(":scope > [data-reveal]"))
            : [el];
          const idx = Math.max(0, sibs.indexOf(el));
          el.style.transitionDelay = `${Math.min(idx, 4) * 0.08}s`;
          el.classList.add("in");
          obs.unobserve(el);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="landing-page landing-root" ref={rootRef}>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <main id="main">
        <span id="top" />

        {/* ============ HERO ============ */}
        <header className="hero" id="hero">
          <div className="wrap">
            <p className="eyebrow hero-eyebrow reveal-hero">
              PLAIN-LANGUAGE LEGAL HELP <span className="dot">·</span> CALIFORNIA{" "}
              <span className="dot">·</span> NEVER STORED
            </p>

            <h1 aria-label="Upload the document you don't understand. Get back the rights you didn't know you had.">
              <span className="line-mask">
                <span>Upload the document</span>
              </span>
              <span className="line-mask">
                <span>you don&rsquo;t understand.</span>
              </span>
              <span className="line-mask">
                <span>
                  Get back the <span className="accent">rights</span>
                </span>
              </span>
              <span className="line-mask">
                <span>you didn&rsquo;t know you had.</span>
              </span>
            </h1>

            <p className="hero-sub reveal-hero">
              FairNotice reads eviction notices, insurance denials, and benefits
              letters. It explains them in plain language, checks{" "}
              <b>every claim against real California statutes</b>, and drafts
              your response. In seconds.
            </p>

            <div className="hero-cta reveal-hero">
              <Link className="btn btn-primary" href="/upload">
                Upload Your Document <span className="arw">→</span>
              </Link>
              <Link className="btn btn-ghost" href="/upload">
                Try a sample <span className="arw">→</span>
              </Link>
            </div>

            <p className="hero-meta reveal-hero">
              <span>Free</span>
              <span className="sep">·</span>
              <span>Open source</span>
              <span className="sep">·</span>
              <span>Processed in-memory</span>
            </p>
          </div>
          <div className="scroll-cue" aria-hidden="true">
            <span>SCROLL</span>
            <span className="bar" />
          </div>
        </header>

        {/* ============ THE GAP ============ */}
        <section className="band band-line" id="why">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="eyebrow">THE ACCESS-TO-JUSTICE GAP</span>
              <h2 className="sec-title">
                Millions get documents that change their lives,
                <br />
                and have no idea what they <em>actually say.</em>
              </h2>
            </div>

            <div className="stats">
              {STATS.map((s) => (
                <div className="stat-row" data-reveal key={s.lead}>
                  <div className="stat-fig">
                    {s.fig}
                    <sup>{s.sup}</sup>
                  </div>
                  <div className="stat-body">
                    <p className="lead">{s.lead}</p>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="band band-line" id="how">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="eyebrow">HOW IT WORKS</span>
              <h2 className="sec-title">Three steps. Thirty to ninety seconds.</h2>
            </div>

            <div className="steps">
              <div className="step" data-reveal>
                <svg className="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <div className="num">01</div>
                <h3>Upload</h3>
                <p>
                  Drop a PDF, photo, or screenshot of the letter you received.
                  Or load a sample to see the whole flow.
                </p>
              </div>
              <div className="step" data-reveal>
                <svg className="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6h11M4 12h16M4 18h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="19" cy="6" r="2.4" stroke="#36D6A1" strokeWidth="1.6" />
                </svg>
                <div className="num">02</div>
                <h3>It reads &amp; cites</h3>
                <p>
                  FairNotice extracts every claim and deadline, then checks each
                  one against real statutes, citing the law or saying it found
                  none.
                </p>
              </div>
              <div className="step" data-reveal>
                <svg className="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l4.5 4.5L19 7" stroke="#36D6A1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="num">03</div>
                <h3>Your action plan</h3>
                <p>
                  A plain-language breakdown, your rights, red flags, your
                  options, and a draft response letter ready to send.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CITED OR SILENT ============ */}
        <section className="band band-line" id="cited">
          <div className="wrap">
            <div className="cite-grid">
              <div className="cite-copy" data-reveal>
                <span className="eyebrow" style={{ display: "inline-block", marginBottom: 20 }}>
                  THE CORE RULE
                </span>
                <h2>
                  Cited, or <em>silent.</em>
                </h2>
                <p>
                  Every statement about your rights is backed by a specific
                  statute and shown clearly, never buried in prose. FairNotice
                  never answers from general legal knowledge. It reasons about{" "}
                  <em style={{ fontStyle: "normal", color: "var(--text)" }}>your</em>{" "}
                  document against real law.
                </p>
                <p className="silent">
                  &ldquo;No statute found in our database addressing this. Consult
                  a local attorney.&rdquo; That is what it says when it can&rsquo;t
                  find the law, instead of guessing.
                </p>
              </div>

              {/* static visual demo — not connected to real data */}
              <div className="analysis" data-reveal aria-label="Example claim analysis">
                <div className="ah">
                  <span className="doc-tag">EVICTION NOTICE · CLAIM 02</span>
                  <span className="badge invalid">Potentially invalid</span>
                </div>
                <blockquote className="claim-quote">
                  &ldquo;Tenant must pay $1,850 rent plus a $150 administrative
                  fee within 3 days or vacate.&rdquo;
                </blockquote>
                <div className="ana-label">PLAIN-LANGUAGE ANALYSIS</div>
                <p className="ana-text">
                  A 3-day pay-or-quit notice can demand <strong>rent only</strong>.
                  Bundling a separate &ldquo;admin fee&rdquo; into the amount due
                  can <strong>void the entire notice</strong> — meaning this demand
                  may not be legally enforceable as written.
                </p>
                <div className="evidence">
                  <div className="ana-label">GROUNDED IN</div>
                  <div className="statute-list">
                    <span className="statute">
                      <span>CCP §1161</span>
                      <span className="who">supports you</span>
                    </span>
                    <span className="statute">
                      <span>Civ. Code §1946.2</span>
                      <span className="who">supports you</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ WHAT IT READS ============ */}
        <section className="band band-line" id="docs">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="eyebrow">WHAT IT READS</span>
              <h2 className="sec-title">
                Three kinds of letter. <em>One</em> curated body of law.
              </h2>
              <p className="sec-sub">
                39 California statutes, hand-curated and fully inspectable, with
                no black-box similarity scores.
              </p>
            </div>

            <div className="rows">
              {DOCS.map((d) => (
                <div className="row-item" data-reveal key={d.title}>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                  <div className="cnt">
                    <b>{d.count}</b> {d.of}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ WHAT IT CATCHES ============ */}
        <section className="band band-line" id="catches">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="eyebrow">FROM THE SAMPLE EVICTION NOTICE</span>
              <h2 className="sec-title">
                What a careful read <em>catches.</em>
              </h2>
              <p className="sec-sub">
                Four findings the app flags on the eviction notice it ships with.
                Each one links to a specific statute and a concrete next step.
              </p>
            </div>

            <div className="catch-grid" data-reveal>
              <div className="catch">
                <div className="ct-top">
                  <svg className="flag" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 21V4m0 0h11l-2 4 2 4H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h4>Bundled fees</h4>
                </div>
                <p>
                  The notice demands a <span className="hl">$150 &ldquo;admin fee&rdquo;</span>{" "}
                  alongside rent. A 3-day pay-or-quit can only demand rent.
                  Bundling fees can void the entire notice.
                </p>
                <span className="statute">
                  <span>CCP §1161</span>
                </span>
              </div>
              <div className="catch">
                <div className="ct-top">
                  <svg className="flag" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 9v4l2.5 2.5M9 2h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h4>Miscounted deadline</h4>
                </div>
                <p>
                  The 3-day window <span className="hl">counts weekends</span>, but
                  weekends and judicial holidays must be excluded. The real
                  deadline is later than stated.
                </p>
                <span className="statute">
                  <span>CCP §1161</span>
                </span>
              </div>
              <div className="catch">
                <div className="ct-top">
                  <svg className="flag" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7l8-4 8 4-8 4-8-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M4 7v7c0 3 8 6 8 6s8-3 8-6V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <h4>Improper service</h4>
                </div>
                <p>
                  Posting on the door <span className="hl">alone</span>{" "}
                  {"may not satisfy California’s service requirements, which can be a defense in court."}
                </p>
                <span className="statute">
                  <span>CCP §1162</span>
                </span>
              </div>
              <div className="catch">
                <div className="ct-top">
                  <svg className="flag" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h4>Right to cure</h4>
                </div>
                <p>
                  After <span className="hl">12 months of tenancy</span>, just-cause
                  protections kick in, and curable violations need their own notice
                  and a chance to fix the problem.
                </p>
                <span className="statute">
                  <span>Civ. Code §1946.2</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PRINCIPLES ============ */}
        <section className="band band-line" id="principles">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="eyebrow">PRINCIPLES</span>
              <h2 className="sec-title">
                A tool that knows what it doesn&rsquo;t know is safer than one
                that always has an answer.
              </h2>
            </div>

            <div className="principles">
              <div className="principle" data-reveal>
                <svg className="pic" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 7h8M9 12h8M9 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M4 7l1.2 1.2L7.5 6M4 12l1.2 1.2L7.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>Document-grounded</h3>
                <p>
                  FairNotice never answers from general legal knowledge. It
                  reasons about your specific document against real statutes.
                </p>
              </div>
              <div className="principle" data-reveal>
                <svg className="pic" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 7h8M9 12h8M9 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M4 7l1.2 1.2L7.5 6M4 12l1.2 1.2L7.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>Cited or silent</h3>
                <p>
                  Every claim about your rights cites a statute. When no law is
                  found, it says so plainly, never guesses.
                </p>
              </div>
              <div className="principle" data-reveal>
                <svg className="pic" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <h3>Refusal as a feature</h3>
                <p>
                  For matters out of scope — criminal, custody, safety — the app
                  refuses and routes you to a professional. Knowing its limits is
                  the point.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CLOSING CTA ============ */}
        <section className="closing band-line" id="upload">
          <div className="wrap">
            <h2 data-reveal>
              Bring the letter that <em>scared</em> you.
            </h2>
            <div className="cta-row" data-reveal>
              <Link className="btn btn-primary" href="/upload">
                Upload Your Document <span className="arw">→</span>
              </Link>
              <Link className="btn btn-ghost" href="/upload">
                Try a sample <span className="arw">→</span>
              </Link>
            </div>
            <p className="reassure" data-reveal>
              Processed in-memory · Never stored · Cites real California law
            </p>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <Link className="brand" href="/" aria-label="FairNotice home">
                <BrandMark />
                <span className="name">
                  <b>Fair</b>Notice
                </span>
              </Link>
              <p
                style={{
                  marginTop: 16,
                  color: "var(--faint)",
                  fontSize: 14,
                  maxWidth: "30ch",
                }}
              >
                Upload the document you don&rsquo;t understand. Get back the
                rights you didn&rsquo;t know you had.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h5>Product</h5>
                <a href="#how">How it works</a>
                <a href="#docs">What it reads</a>
                <a href="#principles">Principles</a>
                <Link href="/upload">Upload</Link>
              </div>
              <div className="footer-col">
                <h5>The law</h5>
                <a href="#cited">Cited or silent</a>
                <a href="#catches">What it catches</a>
                <a href="#docs">Statute coverage</a>
              </div>
              <div className="footer-col">
                <h5>Trust</h5>
                <a href="#principles">Privacy</a>
                <a href="#principles">Confidence scoring</a>
                <a href="#principles">Safety routing</a>
              </div>
            </div>
          </div>
          <div className="disclaimer">
            <p className="legal">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v3m0 12v3M5 8l5 4-5 4m14-8l-5 4 5 4M3 12h3m12 0h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span>
                FairNotice provides{" "}
                <b style={{ color: "var(--dim)", fontWeight: 600 }}>
                  legal information, not legal advice.
                </b>{" "}
                It does not create an attorney-client relationship. California
                statute coverage is deepest; other states are analyzed with lower
                confidence. Laws change, so verify against official sources.
              </span>
            </p>
            <span className="copy">FAIRNOTICE · STEMINATE 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
