import { NextResponse } from "next/server";
import { chatCompletion, GROQ_MODEL } from "@/lib/groq";
import { getAnalysisPrompt } from "@/lib/prompts/analysis";
import { statuteStore, type StatuteResult } from "@/lib/rag/statute-store";
import { parseLLMJson } from "@/lib/llm-json";
import type { DocumentAnalysis, DocumentExtraction } from "@/lib/types";

// The Groq SDK runs on the Node.js runtime.
export const runtime = "nodejs";

const MAX_DOC_TEXT_CHARS = 3000;
const MAX_STATUTES = 10;

interface AnalyzeRequestBody {
  rawText?: unknown;
  extraction?: unknown;
  documentType?: unknown;
  jurisdiction?: unknown;
}

/**
 * Search the statute store using the document's claims, type, and legal
 * references as queries, then merge into a unique, score-ranked set.
 *
 * Returns the deduplicated statutes (capped at MAX_STATUTES) and the number of
 * search queries that were run.
 */
function gatherStatutes(
  extraction: DocumentExtraction,
  documentType: string,
  jurisdiction: string
): { statutes: StatuteResult[]; queriesRun: number } {
  const filters = { jurisdiction, documentType };
  const queries: string[] = [];

  // One query per claim.
  for (const claim of extraction.claims ?? []) {
    if (claim?.claim) queries.push(claim.claim);
  }

  // A query for the document type itself.
  queries.push(documentType.replace(/_/g, " "));

  // One query per cited legal reference.
  for (const ref of extraction.legal_references ?? []) {
    const text = [ref?.reference, ref?.context].filter(Boolean).join(" ");
    if (text) queries.push(text);
  }

  // Run every query and keep the highest score seen per statute id.
  const bestById = new Map<string, StatuteResult>();
  for (const query of queries) {
    for (const result of statuteStore.search(query, filters, MAX_STATUTES)) {
      const existing = bestById.get(result.id);
      if (!existing || result.score > existing.score) {
        bestById.set(result.id, result);
      }
    }
  }

  const statutes = Array.from(bestById.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_STATUTES);

  return { statutes, queriesRun: queries.length };
}

/** Format the retrieved statutes for inclusion in the user message. */
function formatStatutes(statutes: StatuteResult[]): string {
  if (statutes.length === 0) {
    return "No statutes were found in our database for this document.";
  }

  return statutes
    .map(
      (s) =>
        `[${s.id}] ${s.statute_number} — ${s.title}\n` +
        `Summary: ${s.summary}\n` +
        `Text: ${s.text}`
    )
    .join("\n\n");
}

export async function POST(request: Request) {
  try {
    let body: AnalyzeRequestBody;
    try {
      body = (await request.json()) as AnalyzeRequestBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { rawText, extraction, documentType, jurisdiction } = body;

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
    if (typeof documentType !== "string" || documentType.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required field: documentType." },
        { status: 400 }
      );
    }
    if (typeof jurisdiction !== "string" || jurisdiction.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required field: jurisdiction." },
        { status: 400 }
      );
    }

    const typedExtraction = extraction as DocumentExtraction;

    // 1. Retrieve relevant statutes.
    const { statutes, queriesRun } = gatherStatutes(
      typedExtraction,
      documentType,
      jurisdiction
    );

    // 2. Build the combined user message.
    const truncatedText =
      rawText.length > MAX_DOC_TEXT_CHARS
        ? rawText.slice(0, MAX_DOC_TEXT_CHARS)
        : rawText;

    const userMessage =
      `## Document Extraction\n${JSON.stringify(typedExtraction)}\n\n` +
      `## Relevant Statutes\n${formatStatutes(statutes)}\n\n` +
      `## Original Document Text\n${truncatedText}`;

    const systemPrompt = getAnalysisPrompt(jurisdiction, documentType);

    // 3. Call the model.
    const startTime = Date.now();
    let llmResponse: string;
    try {
      llmResponse = await chatCompletion(systemPrompt, userMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error.";
      return NextResponse.json(
        { success: false, error: message },
        { status: 502 }
      );
    }
    const processingTime = Date.now() - startTime;

    // 4. Parse the model response.
    let analysis: DocumentAnalysis;
    try {
      analysis = parseLLMJson<DocumentAnalysis>(llmResponse);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse the model response as JSON.",
        },
        { status: 502 }
      );
    }

    // 5. Return the analysis.
    return NextResponse.json({
      success: true,
      data: {
        analysis,
        statutesSearched: queriesRun,
        statutesMatched: statutes.length,
        model: GROQ_MODEL,
        processingTime,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { success: false, error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
