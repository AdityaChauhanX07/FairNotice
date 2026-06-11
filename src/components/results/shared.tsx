import { Fragment, type ReactNode } from "react";
import type { LegalStatus } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Inline icons (match the Claude Design app-results icon set)        */
/* ------------------------------------------------------------------ */

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

export const AlertIcon = () => (
  <Svg>
    <path d="M12 3l9 16H3l9-16z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </Svg>
);
export const CheckIcon = () => (
  <Svg>
    <path d="M5 12l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export const ChevIcon = () => (
  <Svg>
    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export const ShieldIcon = () => (
  <Svg>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </Svg>
);
export const FlagIcon = () => (
  <Svg>
    <path d="M5 21V4m0 0h11l-2 4 2 4H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export const ArrowRIcon = () => (
  <Svg>
    <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export const PhoneIcon = () => (
  <Svg>
    <path d="M5 4h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </Svg>
);
export const PinIcon = () => (
  <Svg>
    <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.5" />
  </Svg>
);
export const CopyIcon = () => (
  <Svg>
    <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="currentColor" strokeWidth="1.6" />
  </Svg>
);
export const DownloadIcon = () => (
  <Svg>
    <path d="M12 4v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 18h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);
export const InfoIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 11v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </Svg>
);
export const LockIcon = () => (
  <Svg>
    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" />
  </Svg>
);
export const ScaleIcon = () => (
  <Svg>
    <path d="M12 4v16M7 20h10M5 7h14M5 7l-2 5a3 3 0 006 0L7 7m12 0l-2 5a3 3 0 006 0l-2-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ------------------------------------------------------------------ */
/* Shared building blocks                                             */
/* ------------------------------------------------------------------ */

export const STATUS_CLASS: Record<LegalStatus, string> = {
  valid: "b-teal",
  potentially_invalid: "b-red",
  requires_review: "b-amber",
  standard_procedure: "b-slate",
};

/** Numbered section wrapper used by every results block. */
export function Block({
  index,
  id,
  title,
  sub,
  children,
}: {
  index: number;
  id: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="block" id={`sec-${id}`}>
      <div className="block-head">
        <span className="b-ix">{String(index).padStart(2, "0")}</span>
        <h2>{title}</h2>
        {sub ? <span className="b-sub">{sub}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** Statute citation chip. `supports` shades it for/against the recipient. */
export function Statute({
  num,
  supports,
}: {
  num: string;
  supports?: "you" | "sender";
}) {
  const cls = supports === "sender" ? "statute against" : "statute";
  return (
    <span className={cls}>
      <span>{num}</span>
      {supports ? (
        <span className="who">
          supports {supports === "you" ? "you" : "sender"}
        </span>
      ) : null}
    </span>
  );
}

// Matches CA-style citations and federal regs (Civ. Code, CCP, Ins. Code,
// H&S Code, C.F.R., bare §…). Longest alternative first.
const CITATION_RE =
  /((?:(?:California|Cal\.?)\s+)?(?:Civil Code|Code of Civil Procedure|Insurance Code|Health and Safety Code|Government Code|Welfare and Institutions Code)\s+§?\s?\d+(?:\.\d+)*(?:\([a-z0-9]+\))?|\d+\s+C\.?F\.?R\.?\s+§?\s?\d+(?:\.\d+)*(?:\([a-z0-9)(]+\))?|§\s?\d+(?:\.\d+)*(?:\([a-z0-9]+\))?)/gi;

/** Splits text on statute citations and wraps each in a `.l-cite` chip. */
export function highlightCitations(text: string): ReactNode[] {
  return text.split(CITATION_RE).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="l-cite">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}
