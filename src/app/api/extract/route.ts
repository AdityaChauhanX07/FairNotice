import { NextResponse } from "next/server";
import { chatCompletion, GROQ_MODEL } from "@/lib/groq";
import { getExtractionPrompt } from "@/lib/prompts/extraction";
import type { DocumentExtraction } from "@/lib/types";

// The Groq SDK runs on the Node.js runtime.
export const runtime = "nodejs";

interface ExtractRequestBody {
  rawText?: unknown;
  documentType?: unknown;
  jurisdiction?: unknown;
}

/**
 * Strip Markdown code fences (```json ... ``` or ``` ... ```) that the model
 * may wrap around its JSON, returning the bare JSON string.
 */
function stripCodeFences(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    // Remove the opening fence (with an optional language tag) and the closing fence.
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*\n?/, "");
    cleaned = cleaned.replace(/\n?```\s*$/, "");
  }

  return cleaned.trim();
}

export async function POST(request: Request) {
  try {
    let body: ExtractRequestBody;
    try {
      body = (await request.json()) as ExtractRequestBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { rawText } = body;

    if (typeof rawText !== "string" || rawText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required field: rawText." },
        { status: 400 }
      );
    }

    const systemPrompt = getExtractionPrompt();

    const startTime = Date.now();
    let llmResponse: string;
    try {
      llmResponse = await chatCompletion(systemPrompt, rawText);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error.";
      return NextResponse.json(
        { success: false, error: message },
        { status: 502 }
      );
    }
    const processingTime = Date.now() - startTime;

    let extraction: DocumentExtraction;
    try {
      extraction = JSON.parse(stripCodeFences(llmResponse)) as DocumentExtraction;
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
        extraction,
        model: GROQ_MODEL,
        processingTime,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { success: false, error: `Extraction failed: ${message}` },
      { status: 500 }
    );
  }
}
