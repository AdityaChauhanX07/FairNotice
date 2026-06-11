"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const DEFAULT_MESSAGE = "The analysis could not be completed.";

/** Reads `?message=` — isolated so it can sit inside a Suspense boundary. */
function ErrorDetail() {
  const params = useSearchParams();
  const message = params.get("message")?.trim() || DEFAULT_MESSAGE;
  return <div className="e-detail">{message}</div>;
}

export default function ErrorPage() {
  return (
    <div className="errscreen">
      <div className="e-ic">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3l9 16H3l9-16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
      </div>
      <h1>Something went wrong.</h1>
      <p>
        We could not finish analyzing your document. Your information was not
        lost, and nothing was stored.
      </p>

      <Suspense fallback={<div className="e-detail">{DEFAULT_MESSAGE}</div>}>
        <ErrorDetail />
      </Suspense>

      <div className="e-actions">
        <Link className="btn btn-primary" href="/upload">
          Try again <span className="arw">→</span>
        </Link>
        <Link className="btn btn-ghost" href="/">
          Go home
        </Link>
      </div>
    </div>
  );
}
