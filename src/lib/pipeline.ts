import {
  RESULTS_STORAGE_KEY,
  type ResultsPayload,
} from "@/lib/mock-data";
import type {
  ActionPlan,
  DocumentAnalysis,
  DocumentExplanation,
  DocumentExtraction,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface PipelineStage {
  /** 1-based step index (1 = parse, 2 = extract, 3 = analyze, 4 = explain). */
  step: number;
  label: string;
  status: "active" | "complete" | "pending" | "error";
  detail?: string;
  /** Wall-clock duration of the step in milliseconds, set on completion. */
  time?: number;
}

/** Human-facing label for each pipeline step, keyed by step number. */
export const PIPELINE_STAGE_LABELS: Record<number, string> = {
  1: "Reading your document...",
  2: "Extracting key information...",
  3: "Checking against real statutes...",
  4: "Generating your explanation & action plan...",
};

/** Fresh set of stages (all pending) for initialising the progress UI. */
export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [1, 2, 3, 4].map(
  (step) => ({
    step,
    label: PIPELINE_STAGE_LABELS[step],
    status: "pending" as const,
  })
);

interface RunPipelineArgs {
  file: File;
  documentType: string;
  jurisdiction: string;
  language: string;
  onProgress: (stage: PipelineStage) => void;
}

/* Shapes of the `data` payloads returned by each API route. */
interface ParseData {
  rawText: string;
}
interface ExtractData {
  extraction: DocumentExtraction;
  model: string;
  processingTime: number;
}
interface AnalyzeData {
  analysis: DocumentAnalysis;
  statutesMatched: number;
  model: string;
  processingTime: number;
}
interface ExplainData {
  explanation: DocumentExplanation;
  actionPlan: ActionPlan;
  model: string;
  processingTime: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Orchestrator                                                       */
/* ------------------------------------------------------------------ */

/**
 * Run the full client-side analysis flow: parse → extract → analyze →
 * explain. Reports progress through `onProgress` (one update per status
 * transition), stashes the assembled bundle in `sessionStorage` under
 * {@link RESULTS_STORAGE_KEY}, and returns it.
 *
 * If any step fails, the failing stage is marked `error` and an Error is
 * thrown whose message names the step that failed.
 */
export async function runAnalysisPipeline({
  file,
  documentType,
  jurisdiction,
  language,
  onProgress,
}: RunPipelineArgs): Promise<ResultsPayload> {
  const emit = (
    step: number,
    status: PipelineStage["status"],
    detail?: string,
    time?: number
  ) =>
    onProgress({ step, label: PIPELINE_STAGE_LABELS[step], status, detail, time });

  /** Fetch a step, enforce the `{ success, data }` contract, and emit status. */
  async function callStep<T>(
    step: number,
    url: string,
    init: RequestInit
  ): Promise<T> {
    emit(step, "active");
    const startedAt = Date.now();

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Network request failed.";
      emit(step, "error", message);
      throw new Error(
        `Step ${step} (${PIPELINE_STAGE_LABELS[step]}) failed: ${message}`
      );
    }

    let json: ApiResponse<T> | null = null;
    try {
      json = (await response.json()) as ApiResponse<T>;
    } catch {
      /* leave json null; handled below */
    }

    if (!response.ok || !json?.success || !json.data) {
      const message =
        json?.error ?? `Request failed with status ${response.status}.`;
      emit(step, "error", message);
      throw new Error(
        `Step ${step} (${PIPELINE_STAGE_LABELS[step]}) failed: ${message}`
      );
    }

    // Report the step's wall-clock time so the UI can show "Done in N.Ns".
    emit(step, "complete", undefined, Date.now() - startedAt);
    return json.data;
  }

  let totalMs = 0;
  let model = "";
  let statutesReferenced = 0;

  // Step 1 — Parse the document into raw text.
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  formData.append("jurisdiction", jurisdiction);
  formData.append("language", language);

  const { rawText } = await callStep<ParseData>(1, "/api/parse", {
    method: "POST",
    body: formData,
  });

  // Step 2 — Extract structured data from the raw text.
  const extractData = await callStep<ExtractData>(2, "/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawText, documentType, jurisdiction }),
  });
  const { extraction } = extractData;
  totalMs += extractData.processingTime ?? 0;
  model = extractData.model || model;

  // Step 3 — Analyse the document against retrieved statutes.
  const analyzeData = await callStep<AnalyzeData>(3, "/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawText, extraction, documentType, jurisdiction }),
  });
  const { analysis } = analyzeData;
  totalMs += analyzeData.processingTime ?? 0;
  model = analyzeData.model || model;
  statutesReferenced = analyzeData.statutesMatched ?? 0;

  // Step 4 — Generate the plain-language explanation and action plan.
  const explainData = await callStep<ExplainData>(4, "/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rawText,
      extraction,
      analysis,
      documentType,
      jurisdiction,
      language,
    }),
  });
  const { explanation, actionPlan } = explainData;
  totalMs += explainData.processingTime ?? 0;
  model = explainData.model || model;

  // Assemble the bundle the results dashboard renders.
  const payload: ResultsPayload = {
    extraction,
    analysis,
    explanation,
    actionPlan,
    meta: {
      // ResultsPayload.meta.processingTime is in seconds.
      processingTime: Math.round((totalMs / 1000) * 10) / 10,
      statutesReferenced,
      model,
    },
  };

  try {
    sessionStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* sessionStorage may be unavailable (private mode, quota) — the results
       page falls back to its mock dataset, so this is non-fatal. */
  }

  return payload;
}
