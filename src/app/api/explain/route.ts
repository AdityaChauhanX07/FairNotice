import { NextResponse } from "next/server";
import { chatCompletion, GROQ_MODEL } from "@/lib/groq";
import { getExplanationPrompt } from "@/lib/prompts/explain";
import { getActionPlanPrompt } from "@/lib/prompts/action-plan";
import type {
  ActionPlan,
  DocumentAnalysis,
  DocumentExplanation,
  DocumentExtraction,
} from "@/lib/types";

// The Groq SDK runs on the Node.js runtime.
export const runtime = "nodejs";

const MAX_DOC_TEXT_CHARS = 2000;

interface ExplainRequestBody {
  rawText?: unknown;
  extraction?: unknown;
  analysis?: unknown;
  documentType?: unknown;
  jurisdiction?: unknown;
  language?: unknown;
}

/**
 * Strip Markdown code fences (```json ... ``` or ``` ... ```) that the model
 * may wrap around its JSON, returning the bare JSON string.
 */
function stripCodeFences(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*\n?/, "");
    cleaned = cleaned.replace(/\n?```\s*$/, "");
  }

  return cleaned.trim();
}

export async function POST(request: Request) {
  try {
    let body: ExplainRequestBody;
    try {
      body = (await request.json()) as ExplainRequestBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { rawText, extraction, analysis, jurisdiction, language } = body;

    if (typeof rawText !== "string" || rawText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required field: rawText." },
        { status: 400 }
      );
    }
    if (!extraction || typeof extraction !== "object") {
      return NextResponse.json(
        { success: false, error: "Missing required field: extraction." },
        { status: 400 }
      );
    }
    if (!analysis || typeof analysis !== "object") {
      return NextResponse.json(
        { success: false, error: "Missing required field: analysis." },
        { status: 400 }
      );
    }
    if (typeof jurisdiction !== "string" || jurisdiction.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required field: jurisdiction." },
        { status: 400 }
      );
    }
    if (typeof language !== "string" || language.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required field: language." },
        { status: 400 }
      );
    }

    const typedExtraction = extraction as DocumentExtraction;
    const typedAnalysis = analysis as DocumentAnalysis;

    const truncatedText =
      rawText.length > MAX_DOC_TEXT_CHARS
        ? rawText.slice(0, MAX_DOC_TEXT_CHARS)
        : rawText;

    const userMessage =
      `## Legal Analysis\n${JSON.stringify(typedAnalysis)}\n\n` +
      `## Document Extraction\n${JSON.stringify(typedExtraction)}\n\n` +
      `## Original Document Text\n${truncatedText}`;

    // Two independent LLM calls, run concurrently.
    const startTime = Date.now();
    let explanationRaw: string;
    let actionPlanRaw: string;
    try {
      [explanationRaw, actionPlanRaw] = await Promise.all([
        chatCompletion(getExplanationPrompt(language), userMessage),
        chatCompletion(getActionPlanPrompt(), userMessage),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error.";
      return NextResponse.json(
        { success: false, error: message },
        { status: 502 }
      );
    }
    const processingTime = Date.now() - startTime;

    let explanation: DocumentExplanation;
    let actionPlan: ActionPlan;
    try {
      explanation = JSON.parse(
        stripCodeFences(explanationRaw)
      ) as DocumentExplanation;
      actionPlan = JSON.parse(stripCodeFences(actionPlanRaw)) as ActionPlan;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse the model response as JSON.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        explanation,
        actionPlan,
        model: GROQ_MODEL,
        processingTime,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { success: false, error: `Explanation failed: ${message}` },
      { status: 500 }
    );
  }
}
