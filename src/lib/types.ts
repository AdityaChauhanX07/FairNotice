/* ------------------------------------------------------------------ */
/* Document extraction schema                                         */
/* ------------------------------------------------------------------ */

export type DocumentType =
  | "eviction_notice"
  | "insurance_denial"
  | "benefits_termination"
  | "court_summons"
  | "medical_bill"
  | "other";

export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export interface ExtractionSender {
  name: string | null;
  role: string | null;
  organization: string | null;
}

export interface ExtractionRecipient {
  name: string | null;
}

export interface ExtractionJurisdiction {
  state: string | null;
  city: string | null;
  county: string | null;
}

export interface ExtractionClaim {
  id: number;
  claim: string;
  legal_basis_cited: string | null;
}

export interface ExtractionDeadline {
  date: string | null;
  days_from_notice: number | null;
  action_required: string;
  consequence: string;
}

export interface ExtractionDollarAmount {
  amount: number;
  context: string;
}

export interface ExtractionLegalReference {
  reference: string;
  context: string;
}

/**
 * Structured information extracted from a legal/official document by the LLM.
 * Mirrors the JSON schema enforced by the extraction system prompt.
 */
export interface DocumentExtraction {
  document_type: DocumentType;
  sender: ExtractionSender;
  recipient: ExtractionRecipient;
  date_issued: string | null;
  jurisdiction: ExtractionJurisdiction;
  claims: ExtractionClaim[];
  deadlines: ExtractionDeadline[];
  dollar_amounts: ExtractionDollarAmount[];
  legal_references: ExtractionLegalReference[];
  key_demands: string[];
  urgency_level: UrgencyLevel;
  raw_text_length: number;
}

/* ------------------------------------------------------------------ */
/* API response shapes                                                */
/* ------------------------------------------------------------------ */

export type ExtractionMethod = "direct" | "pdf-parse" | "tesseract-ocr";

/** Successful payload from `POST /api/parse`. */
export interface ParseData {
  rawText: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  jurisdiction: string;
  language: string;
  extractionMethod: ExtractionMethod;
  charCount: number;
  timestamp: string;
}

/** Response from `POST /api/parse`. */
export type ParseResult =
  | { success: true; data: ParseData }
  | { success: false; error: string };

/** Successful payload from `POST /api/extract`. */
export interface ExtractionData {
  extraction: DocumentExtraction;
  model: string;
  processingTime: number;
}

/** Response from `POST /api/extract`. */
export type ExtractionResult =
  | { success: true; data: ExtractionData }
  | { success: false; error: string };

/* ------------------------------------------------------------------ */
/* Analysis schema                                                    */
/* ------------------------------------------------------------------ */

export type LegalStatus =
  | "valid"
  | "potentially_invalid"
  | "requires_review"
  | "standard_procedure";

export interface ClaimAnalysisStatute {
  statute_id: string;
  statute_number: string;
  relevance: string;
  supports_claim: boolean;
}

export interface ClaimAnalysis {
  claim_id: number;
  original_claim: string;
  analysis: string;
  legal_status: LegalStatus;
  relevant_statutes: ClaimAnalysisStatute[];
  user_action: string;
}

export interface DeadlineAnalysis {
  deadline: string;
  action_required: string;
  is_legally_compliant: boolean | null;
  statute_basis: string | null;
  recommendation: string;
}

/** Full statute-grounded analysis produced by the LLM. */
export interface DocumentAnalysis {
  overall_assessment: string;
  urgency: UrgencyLevel;
  claim_analysis: ClaimAnalysis[];
  deadline_analysis: DeadlineAnalysis[];
  rights_summary: string[];
  red_flags: string[];
  referral_needed: boolean;
  referral_reason: string | null;
}

/** Successful payload from `POST /api/analyze`. */
export interface AnalysisData {
  analysis: DocumentAnalysis;
  statutesSearched: number;
  statutesMatched: number;
  model: string;
  processingTime: number;
}

/** Response from `POST /api/analyze`. */
export type AnalysisResult =
  | { success: true; data: AnalysisData }
  | { success: false; error: string };

/* ------------------------------------------------------------------ */
/* Explanation schema                                                 */
/* ------------------------------------------------------------------ */

export interface ExplanationSection {
  heading: string;
  content: string;
  statute_references: string[];
}

export interface KeyTerm {
  term: string;
  definition: string;
}

/** Plain-language, optionally-translated explanation of the document. */
export interface DocumentExplanation {
  document_summary: string;
  sections: ExplanationSection[];
  key_terms: KeyTerm[];
  what_this_means_for_you: string;
  emotional_reassurance: string;
}

/* ------------------------------------------------------------------ */
/* Action plan schema                                                 */
/* ------------------------------------------------------------------ */

export type Likelihood = "high" | "medium" | "low" | "unknown";

export type ResourceType =
  | "legal_aid"
  | "hotline"
  | "government"
  | "nonprofit";

export interface TimelineEntry {
  date: string | null;
  days_remaining: number | null;
  urgency: UrgencyLevel;
  action: string;
  detail: string;
  statute_basis: string | null;
}

export interface UserOption {
  id: number;
  title: string;
  description: string;
  likelihood_of_success: Likelihood;
  statute_basis: string | null;
  recommended: boolean;
}

export interface ResponseLetter {
  to: string;
  from: string;
  date: string;
  subject: string;
  body: string;
  closing: string;
}

export interface Resource {
  name: string;
  description: string;
  type: ResourceType;
  contact: string;
  jurisdiction_specific: boolean;
}

/** Concrete, statute-grounded plan of action for the user. */
export interface ActionPlan {
  timeline: TimelineEntry[];
  options: UserOption[];
  response_letter: ResponseLetter;
  resources: Resource[];
}

/** Successful payload from `POST /api/explain`. */
export interface ExplainData {
  explanation: DocumentExplanation;
  actionPlan: ActionPlan;
  model: string;
  processingTime: number;
}

/** Response from `POST /api/explain`. */
export type ExplainResult =
  | { success: true; data: ExplainData }
  | { success: false; error: string };

/* ------------------------------------------------------------------ */
/* Confidence & safety                                                */
/* ------------------------------------------------------------------ */

export type ConfidenceLevel = "high" | "medium" | "low";

export type ConfidenceFactorStatus = "positive" | "warning" | "negative";

/** A single signal that contributed to (or reassured) the confidence score. */
export interface ConfidenceFactor {
  factor: string;
  status: ConfidenceFactorStatus;
  detail: string;
}

/** How much to trust this analysis, and why. Rendered by the ConfidenceBanner. */
export interface ConfidenceReport {
  overall: ConfidenceLevel;
  /** 0-100, clamped. */
  overallScore: number;
  factors: ConfidenceFactor[];
  disclaimers: string[];
}
