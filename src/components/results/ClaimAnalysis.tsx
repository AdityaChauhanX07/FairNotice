"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Scale, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { ClaimAnalysis as ClaimAnalysisType } from "@/lib/types";
import {
  Pill,
  Section,
  SectionHeading,
  STATUS_STYLES,
  highlightStatutes,
} from "./shared";

/* ------------------------------------------------------------------ */
/* Single accordion card                                               */
/* ------------------------------------------------------------------ */

function ClaimCard({
  claim,
  index,
  expanded,
  onToggle,
}: {
  claim: ClaimAnalysisType;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status = STATUS_STYLES[claim.legal_status];
  const panelId = `claim-panel-${claim.claim_id}`;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-surface transition-colors ${
        expanded ? "border-accent/40" : "border-border hover:border-border/80"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 p-4 text-left sm:gap-4 sm:p-5"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-sm font-bold text-muted">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground sm:text-base">
          {claim.original_claim}
        </span>
        <Pill className={`hidden shrink-0 sm:inline-flex ${status.className}`}>
          {status.label}
        </Pill>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Status pill shown below on mobile where header has no room */}
      <div className="px-4 pb-3 sm:hidden">
        <Pill className={status.className}>{status.label}</Pill>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={panelId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-border px-4 py-5 sm:px-5">
              {/* What the document says */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  What the document says
                </p>
                <p className="mt-1.5 border-l-2 border-border pl-3 text-sm italic leading-relaxed text-foreground/80">
                  {claim.original_claim}
                </p>
              </div>

              {/* What this means for you */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  What this means for you
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                  {claim.analysis}
                </p>
              </div>

              {/* What the law says */}
              {claim.relevant_statutes.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    What the law says
                  </p>
                  <div className="mt-2 space-y-3">
                    {claim.relevant_statutes.map((statute) => (
                      <div
                        key={statute.statute_id}
                        className="rounded-xl border border-border bg-background/50 p-4"
                      >
                        <p className="font-semibold text-accent">
                          {statute.statute_number}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          {statute.relevance}
                        </p>
                        <span
                          className={`mt-2.5 inline-flex items-center gap-1 text-xs font-medium ${
                            statute.supports_claim
                              ? "text-red-300"
                              : "text-emerald-300"
                          }`}
                        >
                          {statute.supports_claim ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          )}
                          {statute.supports_claim
                            ? "Supports sender's position"
                            : "Supports your position"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* What you should do */}
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  What you should do
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                  {highlightStatutes(claim.user_action)}
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export interface ClaimAnalysisProps {
  claims: ClaimAnalysisType[];
}

export function ClaimAnalysis({ claims }: ClaimAnalysisProps) {
  // First claim open by default to invite interaction.
  const [openId, setOpenId] = useState<number | null>(claims[0]?.claim_id ?? null);

  if (claims.length === 0) return null;

  return (
    <Section id="claims">
      <SectionHeading icon={<Scale className="h-5 w-5" />}>
        What&apos;s Being Claimed — And What The Law Says
      </SectionHeading>

      <div className="mt-6 space-y-3">
        {claims.map((claim, i) => (
          <ClaimCard
            key={claim.claim_id}
            claim={claim}
            index={i}
            expanded={openId === claim.claim_id}
            onToggle={() =>
              setOpenId((prev) =>
                prev === claim.claim_id ? null : claim.claim_id
              )
            }
          />
        ))}
      </div>
    </Section>
  );
}
