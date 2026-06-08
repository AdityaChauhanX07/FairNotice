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
