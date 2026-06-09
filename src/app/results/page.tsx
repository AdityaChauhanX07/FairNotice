"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  mockResults,
  RESULTS_STORAGE_KEY,
  type ResultsPayload,
} from "@/lib/mock-data";
import { TopBar } from "@/components/results/TopBar";
import { AlertBanner } from "@/components/results/AlertBanner";
import { SummaryCard } from "@/components/results/SummaryCard";
import { DeadlineTimeline } from "@/components/results/DeadlineTimeline";
import { ClaimAnalysis } from "@/components/results/ClaimAnalysis";
import { Rights, RedFlags } from "@/components/results/RightsAndFlags";
import { Options } from "@/components/results/Options";
import { ResponseLetterCard } from "@/components/results/ResponseLetterCard";
import {
  Resources,
  Glossary,
} from "@/components/results/ResourcesAndGlossary";
import { SidebarNav } from "@/components/results/SidebarNav";

/**
 * Reads the analysis bundle from `sessionStorage` (written by the upload
 * flow). Falls back to the mock dataset so the dashboard is always demoable
 * during development.
 */
function loadResults(): ResultsPayload {
  try {
    const raw = sessionStorage.getItem(RESULTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ResultsPayload;
  } catch {
    /* ignore malformed storage and fall back to mock */
  }
  return mockResults;
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultsPayload | null>(null);

  // sessionStorage is only available on the client, so read after mount.
  // Server and first client render both show the loader (results === null),
  // so this deferred read is hydration-safe.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from a client-only external store (sessionStorage)
    setResults(loadResults());
  }, []);

  if (!results) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const { extraction, analysis, explanation, actionPlan, meta } = results;

  return (
    <div className="bg-glow-amber min-h-screen px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl gap-10">
        {/* Sticky sidebar nav (desktop only) */}
        <SidebarNav />

        {/* Main column */}
        <div className="min-w-0 flex-1 space-y-12">
          <TopBar
            documentType={extraction.document_type}
            processingTime={meta.processingTime}
            statutesReferenced={meta.statutesReferenced}
          />

          <AlertBanner
            urgency={analysis.urgency}
            assessment={analysis.overall_assessment}
            referralNeeded={analysis.referral_needed}
          />

          <SummaryCard extraction={extraction} explanation={explanation} />

          <DeadlineTimeline timeline={actionPlan.timeline} />

          <ClaimAnalysis claims={analysis.claim_analysis} />

          <Rights rights={analysis.rights_summary} />

          <RedFlags flags={analysis.red_flags} />

          <Options options={actionPlan.options} />

          <ResponseLetterCard letter={actionPlan.response_letter} />

          <Resources resources={actionPlan.resources} />

          <Glossary terms={explanation.key_terms} />

          {/* Footer disclaimer */}
          <footer className="border-t border-border pt-8">
            <p className="text-xs leading-relaxed text-muted">
              This tool provides legal information, not legal advice. All
              analysis is based on publicly available statutes and the document
              you uploaded. For complex situations, always consult a licensed
              attorney.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
