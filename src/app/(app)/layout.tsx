import type { ReactNode } from "react";
import Link from "next/link";
import "../app.css";

/** Persistent app topbar (matches the Claude Design app.html). */
function AppTopBar() {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="FairNotice home">
        <svg className="mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="2.5" width="17" height="19" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <line x1="7.5" y1="8" x2="16.5" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
          <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="#0E8A62" strokeWidth="2" strokeLinecap="round" />
          <line x1="7.5" y1="16" x2="12.5" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
        </svg>
        <span className="name">
          <b>Fair</b>Notice
        </span>
      </Link>
      <div className="topbar-right">
        <span className="pill hide-sm">
          <span className="led" />
          Processed in-memory, never stored
        </span>
        <span className="pill disclaimer">Legal information, not legal advice</span>
      </div>
    </header>
  );
}

/**
 * Route-group layout for the app pages (/upload, /results, /error).
 * Applies the `.theme-light` warm-paper theme and the shared topbar.
 * The landing page (outside this group) stays on the dark theme.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-light">
      <AppTopBar />
      {children}
    </div>
  );
}
