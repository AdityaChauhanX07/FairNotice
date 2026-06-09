import {
  RESULTS_STORAGE_KEY,
  type ResultsPayload,
} from "@/lib/mock-data";
import type {
  ActionPlan,
  DocumentAnalysis,
  DocumentExplanation,
  DocumentExtraction,
  Resource,
  SafetyFlag,
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
/* Hard refusal (safety routing)                                      */
/* ------------------------------------------------------------------ */

const KNOWN_SAFETY_FLAGS: readonly SafetyFlag[] = [
  "criminal_charges",
  "child_custody",
  "restraining_order",
  "immigration",
  "imminent_danger",
];

const SAFETY_FLAG_LABELS: Record<SafetyFlag, string> = {
  criminal_charges: "criminal charges",
  child_custody: "a child custody or family court matter",
  restraining_order: "a restraining or protective order",
  immigration: "an immigration matter",
  imminent_danger: "a possible threat to someone's safety",
};

/** Join a list of phrases into "a", "a and b", or "a, b and c". */
function joinPhrases(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Curated referral resources, tailored to the detected safety categories. */
function buildSafetyResources(flags: SafetyFlag[]): Resource[] {
  const resources: Resource[] = [
    {
      name: "Find Local Legal Aid (LawHelp.org)",
      description:
        "Free directory connecting you with legal aid organizations and pro bono attorneys in your area by topic and location.",
      type: "legal_aid",
      contact: "lawhelp.org",
      jurisdiction_specific: false,
    },
    {
      name: "211",
      description:
        "Free, confidential 24/7 line that connects you to local legal, housing, and emergency support services.",
      type: "hotline",
      contact: "Dial 211 • 211.org",
      jurisdiction_specific: false,
    },
  ];

  if (flags.includes("imminent_danger") || flags.includes("restraining_order")) {
    resources.push(
      {
        name: "911 — Emergency Services",
        description:
          "If you or anyone else is in immediate danger, call 911 right away.",
        type: "hotline",
        contact: "Dial 911",
        jurisdiction_specific: false,
      },
      {
        name: "National Domestic Violence Hotline",
        description:
          "24/7 confidential support, safety planning, and referrals to local resources.",
        type: "hotline",
        contact: "1-800-799-7233 • thehotline.org",
        jurisdiction_specific: false,
      }
    );
  }
  if (flags.includes("criminal_charges")) {
    resources.push({
      name: "Public Defender's Office",
      description:
        "If you are facing criminal charges and cannot afford a lawyer, you have the right to a court-appointed public defender. Contact the court handling your case immediately.",
      type: "government",
      contact: "Contact your county court or public defender",
      jurisdiction_specific: false,
    });
  }
  if (flags.includes("immigration")) {
    resources.push({
      name: "Immigration Legal Help (immigrationlawhelp.org)",
      description:
        "Directory of nonprofit organizations offering free or low-cost immigration legal assistance.",
      type: "nonprofit",
      contact: "immigrationlawhelp.org",
      jurisdiction_specific: false,
    });
  }
  if (flags.includes("child_custody")) {
    resources.push({
      name: "Family Court Self-Help Center",
      description:
        "Most courts offer a self-help center with free guidance and forms for custody and family law matters. Ask the court that issued this document.",
      type: "government",
      contact: "Contact your local family court",
      jurisdiction_specific: false,
    });
  }

  return resources;
}

/**
 * Build a minimal, referral-only results bundle for documents that trip a
 * safety flag. Detailed analysis is intentionally skipped; the payload exists
 * to render a prominent referral banner and a curated list of where to get
 * real help.
 */
function buildSafetyPayload(
  extraction: DocumentExtraction,
  flags: SafetyFlag[],
  model: string
): ResultsPayload {
  const human = joinPhrases(flags.map((f) => SAFETY_FLAG_LABELS[f]));

  const analysis: DocumentAnalysis = {
    overall_assessment: `This document appears to involve ${human}. Matters like this carry serious, potentially life-altering consequences and strict legal deadlines, so we are not attempting a detailed automated analysis. The most important thing you can do right now is speak with a qualified attorney or the appropriate emergency service.`,
    urgency: "critical",
    claim_analysis: [],
    deadline_analysis: [],
    rights_summary: [
      "You have the right to professional legal representation — and in some matters, to a court-appointed attorney if you cannot afford one.",
      "You have the right to respond to and contest this document. Do not ignore any deadlines it states.",
    ],
    red_flags: [],
    referral_needed: true,
    referral_reason: `Documents involving ${human} require professional legal help. Please contact an attorney or the relevant service listed below as soon as possible.`,
  };

  const explanation: DocumentExplanation = {
    document_summary: `This appears to be a document involving ${human}. Because of what is at stake, this tool will not attempt a detailed legal analysis — instead, it is directing you to people who can help.`,
    sections: [
      {
        heading: "Why we're not analyzing this in detail",
        content:
          "This tool explains routine legal and bureaucratic documents and checks them against statutes. This matter is too serious and fact-specific for automated analysis — a mistake here could have severe consequences. A qualified professional needs to review your specific situation.",
        statute_references: [],
      },
      {
        heading: "What to do now",
        content:
          "Reach out to one of the resources below as soon as possible. If anyone is in immediate danger, call 911. Do not miss any deadlines stated in the document, and bring the document with you when you get help.",
        statute_references: [],
      },
    ],
    key_terms: [],
    what_this_means_for_you:
      "This is a situation where you should not rely on an automated tool. Please contact a qualified attorney or the appropriate service right away — the resources below are a starting point.",
    emotional_reassurance:
      "This is a frightening situation, but you do not have to face it alone. There are people whose job is to help with exactly this — reaching out is the strongest next step you can take.",
  };

  const actionPlan: ActionPlan = {
    timeline: [],
    options: [],
    // Empty letter — the results page hides the letter card when there is no
    // body, so only the resources section renders.
    response_letter: { to: "", from: "", date: "", subject: "", body: "", closing: "" },
    resources: buildSafetyResources(flags),
  };

  return {
    extraction,
    analysis,
    explanation,
    actionPlan,
    meta: { processingTime: 0, statutesReferenced: 0, model },
  };
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

  // Hard refusal: if the document touches a high-stakes category, skip the
  // remaining analysis and route the user straight to professional help.
  const safetyFlags = (extraction.safety_flags ?? []).filter(
    (flag): flag is SafetyFlag =>
      (KNOWN_SAFETY_FLAGS as readonly string[]).includes(flag)
  );
  if (safetyFlags.length > 0) {
    // Resolve the remaining progress steps so the overlay completes cleanly.
    emit(3, "complete");
    emit(4, "complete");

    const payload = buildSafetyPayload(extraction, safetyFlags, model);
    try {
      sessionStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* non-fatal — results page falls back to its mock dataset */
    }
    return payload;
  }

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
