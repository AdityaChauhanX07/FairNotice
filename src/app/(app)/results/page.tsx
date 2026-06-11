"use client";

import { useEffect, useState } from "react";
import {
  mockResults,
  RESULTS_STORAGE_KEY,
  type ResultsPayload,
} from "@/lib/mock-data";
import { calculateConfidence } from "@/lib/confidence";
import { toViewModel } from "@/lib/results-adapter";
import { ResultsHeader } from "@/components/results/ResultsHeader";
import { AlertBanner } from "@/components/results/AlertBanner";
import { ConfidenceSection } from "@/components/results/ConfidenceSection";
import { SummaryCard } from "@/components/results/SummaryCard";
import { DeadlineTimeline } from "@/components/results/DeadlineTimeline";
import { ClaimAnalysis } from "@/components/results/ClaimAnalysis";
import { RightsSection, RedFlags } from "@/components/results/RightsSection";
import { OptionsSection } from "@/components/results/OptionsSection";
import { ResponseLetter } from "@/components/results/ResponseLetter";
import { ResourcesSection } from "@/components/results/ResourcesSection";
import { GlossarySection } from "@/components/results/GlossarySection";
import { SafetyView } from "@/components/results/SafetyView";
import { SidebarNav, type NavItem } from "@/components/results/SidebarNav";
import { ScaleIcon } from "@/components/results/shared";

/**
 * Reads the analysis bundle from `sessionStorage` (written by the upload flow).
 * Falls back to the mock dataset so the dashboard is always demoable.
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

  // sessionStorage is client-only; read after mount (hydration-safe).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from a client-only external store
    setResults(loadResults());
  }, []);

  if (!results) {
    return (
      <div className="shell">
        <p style={{ color: "var(--ink-3)" }}>Loading your analysis…</p>
      </div>
    );
  }

  const confidence = calculateConfidence(
    results.analysis,
    results.extraction,
    results.extraction.jurisdiction.state ?? ""
  );
  const vm = toViewModel(results, confidence);

  // Safety-routed (referral-only) result: refusal view, no analysis.
  if (vm.safetyFlags.length > 0) {
    return (
      <div className="shell">
        <SafetyView vm={vm} />
      </div>
    );
  }

  // Build the ordered list of present sections (drives numbering + sidebar).
  const showAlert = vm.urgency === "critical" || vm.urgency === "high";
  const showLetter = vm.letter.paragraphs.length > 0;

  const nav: NavItem[] = [];
  if (showAlert) nav.push({ id: "assessment", label: "Assessment" });
  nav.push({ id: "confidence", label: "Confidence" });
  nav.push({ id: "summary", label: "Summary" });
  if (vm.deadlines.length) nav.push({ id: "deadlines", label: "Deadlines" });
  if (vm.claims.length) nav.push({ id: "claims", label: "Claim analysis" });
  if (vm.rights.length) nav.push({ id: "rights", label: "Your rights" });
  if (vm.redFlags.length) nav.push({ id: "flags", label: "Red flags" });
  if (vm.options.length) nav.push({ id: "options", label: "Your options" });
  if (showLetter) nav.push({ id: "letter", label: "Draft letter" });
  if (vm.resources.length) nav.push({ id: "resources", label: "Get help" });
  if (vm.glossary.length) nav.push({ id: "glossary", label: "Glossary" });

  const ix = (id: string) => nav.findIndex((n) => n.id === id) + 1;

  return (
    <div className="res-layout">
      <SidebarNav items={nav} />

      <div className="res-main">
        <ResultsHeader header={vm.header} />

        {showAlert ? (
          <AlertBanner
            index={ix("assessment")}
            urgency={vm.urgency}
            assessment={vm.overallAssessment}
            referralNeeded={vm.referralNeeded}
            referralReason={vm.referralReason}
          />
        ) : null}

        <ConfidenceSection index={ix("confidence")} confidence={vm.confidence} />
        <SummaryCard index={ix("summary")} header={vm.header} summary={vm.summary} />
        <DeadlineTimeline index={ix("deadlines")} deadlines={vm.deadlines} />
        <ClaimAnalysis index={ix("claims")} claims={vm.claims} />
        <RightsSection index={ix("rights")} rights={vm.rights} />
        <RedFlags index={ix("flags")} flags={vm.redFlags} />
        <OptionsSection index={ix("options")} options={vm.options} />
        <ResponseLetter index={ix("letter")} letter={vm.letter} />
        <ResourcesSection index={ix("resources")} resources={vm.resources} />
        <GlossarySection index={ix("glossary")} glossary={vm.glossary} />

        <div className="res-footer">
          <ScaleIcon />
          <p>
            FairNotice provides{" "}
            <b>legal information, not legal advice</b>, and does not create an
            attorney-client relationship. This analysis is based only on the
            document you uploaded and the California statutes in our store. Laws
            change, so verify against official sources before acting.
          </p>
        </div>
      </div>
    </div>
  );
}
