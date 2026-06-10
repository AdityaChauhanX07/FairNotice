"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** The FairNotice document brand mark (inline SVG, matches the design). */
function BrandMark() {
  return (
    <svg className="mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="2.5"
        width="17"
        height="19"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <line
        x1="7.5"
        y1="8"
        x2="16.5"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="7.5"
        y1="12"
        x2="16.5"
        y2="12"
        stroke="#36D6A1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="7.5"
        y1="16"
        x2="12.5"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "#why", label: "The gap" },
  { href: "#how", label: "How it reads" },
  { href: "#catches", label: "What it catches" },
  { href: "#principles", label: "Principles" },
];

/** Landing nav — fixed, dark, with scroll-progress bar (matches FairNotice.html). */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      setScrolled(y > 36);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? (y / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="landing-page">
      <div className="progress" style={{ width: `${progress}%` }} />
      <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Primary">
        <Link className="brand" href="/" aria-label="FairNotice home">
          <BrandMark />
          <span className="name">
            <b>Fair</b>Notice
          </span>
        </Link>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} className="nav-link" href={l.href}>
              {l.label}
            </a>
          ))}
          <Link className="btn btn-primary btn-sm" href="/upload">
            Upload Your Document <span className="arw">→</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  // Landing ("/") gets the dark editorial nav. The app pages (/upload,
  // /results, /error) render their own topbar via the (app) route-group
  // layout, so the global navbar stays out of their way.
  return pathname === "/" ? <LandingNav /> : null;
}
