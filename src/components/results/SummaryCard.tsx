"use client";

import { FileText, Building2, Calendar, MapPin, Sparkles } from "lucide-react";
import type { DocumentExplanation, DocumentExtraction } from "@/lib/types";
import { Card, Section, SectionHeading } from "./shared";

const DOC_TYPE_LABELS: Record<string, string> = {
  eviction_notice: "Eviction Notice",
  insurance_denial: "Insurance Denial",
  benefits_termination: "Benefits Termination",
  court_summons: "Court Summons",
  medical_bill: "Medical Bill",
  other: "Document",
};

/** Formats an ISO-ish date string into "June 1, 2026", or returns it as-is. */
function formatDate(value: string | null): string {
  if (!value) return "Not stated";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function senderLabel(extraction: DocumentExtraction): string {
  const { name, organization } = extraction.sender;
  if (name && organization) return `${name}, ${organization}`;
  return name ?? organization ?? "Not stated";
}

function jurisdictionLabel(extraction: DocumentExtraction): string {
  const { city, state } = extraction.jurisdiction;
  return [city, state].filter(Boolean).join(", ") || "Not stated";
}

interface MetaItem {
  icon: typeof FileText;
  label: string;
  value: string;
}

export interface SummaryCardProps {
  extraction: DocumentExtraction;
  explanation: DocumentExplanation;
}

export function SummaryCard({ extraction, explanation }: SummaryCardProps) {
  const meta: MetaItem[] = [
    {
      icon: FileText,
      label: "Document Type",
      value:
        DOC_TYPE_LABELS[extraction.document_type] ?? extraction.document_type,
    },
    { icon: Building2, label: "From", value: senderLabel(extraction) },
    {
      icon: Calendar,
      label: "Date Issued",
      value: formatDate(extraction.date_issued),
    },
    {
      icon: MapPin,
      label: "Jurisdiction",
      value: jurisdictionLabel(extraction),
    },
  ];

  return (
    <Section id="summary">
      <Card className="p-6 sm:p-8">
        <SectionHeading icon={<FileText className="h-5 w-5" />}>
          What You Received
        </SectionHeading>

        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          {explanation.document_summary}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {meta.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 bg-surface p-4"
            >
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-foreground/90">
            {explanation.emotional_reassurance}
          </p>
        </div>
      </Card>
    </Section>
  );
}
