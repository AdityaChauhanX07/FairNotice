import type { ResultsPayload } from "@/lib/mock-data";
import type {
  ConfidenceReport,
  DocumentExtraction,
  DocumentType,
  LegalStatus,
  Likelihood,
  ResourceType,
  UrgencyLevel,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* View-model types                                                   */
/* ------------------------------------------------------------------ */

export interface VMStatute {
  num: string;
  relevance: string;
  /** "you" = supports the recipient, "sender" = supports the sender. */
  supports: "you" | "sender";
}

export interface VMClaim {
  id: number;
  claim: string;
  status: LegalStatus;
  statusLabel: string;
  analysis: string;
  statutes: VMStatute[];
  action: string;
}

export interface VMDeadline {
  date: string;
  urgency: UrgencyLevel;
  action: string;
  detail: string;
  statute: string | null;
}

export interface VMOption {
  id: number;
  title: string;
  description: string;
  likelihood: Likelihood;
  statute: string | null;
  recommended: boolean;
}

export interface VMResource {
  name: string;
  description: string;
  type: ResourceType;
  contact: string;
  local: boolean;
}

export interface VMGlossaryTerm {
  term: string;
  def: string;
}

export interface VMRedFlag {
  title: string;
  text: string;
}

export interface VMFactor {
  name: string;
  status: "positive" | "warning" | "negative";
  detail: string;
}

export interface VMLetter {
  to: string;
  from: string;
  date: string;
  subject: string;
  paragraphs: string[];
  closing: string;
}

export interface ResultsViewModel {
  header: {
    documentType: string;
    sender: string;
    dateIssued: string;
    jurisdiction: string;
    claimsReviewed: number;
    statutesReferenced: number;
    processingTime: number;
  };
  urgency: UrgencyLevel;
  overallAssessment: string;
  referralNeeded: boolean;
  referralReason: string | null;
  confidence: {
    level: "High" | "Moderate" | "Low";
    score: number;
    factors: VMFactor[];
    disclaimers: string[];
  };
  summary: {
    text: string;
    emotionalReassurance: string;
  };
  deadlines: VMDeadline[];
  claims: VMClaim[];
  rights: string[];
  redFlags: VMRedFlag[];
  options: VMOption[];
  letter: VMLetter;
  resources: VMResource[];
  glossary: VMGlossaryTerm[];
  safetyFlags: string[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  eviction_notice: "Eviction Notice",
  insurance_denial: "Insurance Denial",
  benefits_termination: "Benefits Termination",
  court_summons: "Court Summons",
  medical_bill: "Medical Bill",
  other: "Document",
};

const STATUS_LABELS: Record<LegalStatus, string> = {
  valid: "Valid",
  potentially_invalid: "Potentially Invalid",
  requires_review: "Requires Review",
  standard_procedure: "Standard",
};

const CONF_LEVEL: Record<ConfidenceReport["overall"], "High" | "Moderate" | "Low"> =
  {
    high: "High",
    medium: "Moderate",
    low: "Low",
  };

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

/** Build a friendly "when" label from a timeline entry. */
function deadlineWhen(
  date: string | null,
  daysRemaining: number | null
): string {
  if (date) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) return formatDate(date);
    return date;
  }
  if (daysRemaining != null) {
    return `In ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;
  }
  return "Timing varies";
}

/** Split a red-flag sentence into a short title + remaining text. */
function splitFlag(s: string): VMRedFlag {
  const trimmed = s.trim();
  const m = trimmed.match(/^(.{0,90}?[.!?])\s+([\s\S]*\S[\s\S]*)$/);
  if (m && m[2].trim().length > 0) {
    return { title: m[1].trim(), text: m[2].trim() };
  }
  return { title: trimmed, text: "" };
}

/* ------------------------------------------------------------------ */
/* Adapter                                                            */
/* ------------------------------------------------------------------ */

/**
 * Maps our real {@link ResultsPayload} + {@link ConfidenceReport} into a flat,
 * presentation-ready view-model so the results components never have to do
 * data gymnastics inline.
 */
export function toViewModel(
  payload: ResultsPayload,
  confidence: ConfidenceReport
): ResultsViewModel {
  const { extraction, analysis, explanation, actionPlan, meta } = payload;

  return {
    header: {
      documentType:
        DOC_TYPE_LABELS[extraction.document_type] ?? extraction.document_type,
      sender: senderLabel(extraction),
      dateIssued: formatDate(extraction.date_issued),
      jurisdiction: jurisdictionLabel(extraction),
      claimsReviewed: analysis.claim_analysis?.length ?? 0,
      statutesReferenced: meta.statutesReferenced,
      processingTime: meta.processingTime,
    },

    urgency: analysis.urgency,
    overallAssessment: analysis.overall_assessment,
    referralNeeded: analysis.referral_needed,
    referralReason: analysis.referral_reason,

    confidence: {
      level: CONF_LEVEL[confidence.overall],
      score: confidence.overallScore,
      factors: confidence.factors.map((f) => ({
        name: f.factor,
        status: f.status,
        detail: f.detail,
      })),
      disclaimers: confidence.disclaimers,
    },

    summary: {
      text: explanation.document_summary,
      emotionalReassurance: explanation.emotional_reassurance,
    },

    deadlines: (actionPlan.timeline ?? []).map((d) => ({
      date: deadlineWhen(d.date, d.days_remaining),
      urgency: d.urgency,
      action: d.action,
      detail: d.detail,
      statute: d.statute_basis,
    })),

    claims: (analysis.claim_analysis ?? []).map((c) => ({
      id: c.claim_id,
      claim: c.original_claim,
      status: c.legal_status,
      statusLabel: STATUS_LABELS[c.legal_status] ?? c.legal_status,
      analysis: c.analysis,
      statutes: (c.relevant_statutes ?? []).map((s) => ({
        num: s.statute_number,
        relevance: s.relevance,
        supports: s.supports_claim ? "sender" : "you",
      })),
      action: c.user_action,
    })),

    rights: analysis.rights_summary ?? [],
    redFlags: (analysis.red_flags ?? []).map(splitFlag),

    options: (actionPlan.options ?? []).map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      likelihood: o.likelihood_of_success,
      statute: o.statute_basis,
      recommended: o.recommended,
    })),

    letter: {
      to: actionPlan.response_letter.to,
      from: actionPlan.response_letter.from,
      date: actionPlan.response_letter.date,
      subject: actionPlan.response_letter.subject,
      paragraphs: (actionPlan.response_letter.body ?? "")
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean),
      closing: actionPlan.response_letter.closing,
    },

    resources: (actionPlan.resources ?? []).map((r) => ({
      name: r.name,
      description: r.description,
      type: r.type,
      contact: r.contact,
      local: r.jurisdiction_specific,
    })),

    glossary: (explanation.key_terms ?? []).map((t) => ({
      term: t.term,
      def: t.definition,
    })),

    safetyFlags: extraction.safety_flags ?? [],
  };
}
