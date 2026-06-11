import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

// pdf-parse and tesseract.js rely on Node.js APIs, so this route must run on
// the Node.js runtime rather than the Edge runtime.
export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type ExtractionMethod = "direct" | "pdf-parse" | "tesseract-ocr";

interface SupportedType {
  extensions: string[];
  mimeTypes: string[];
  method: ExtractionMethod;
}

const SUPPORTED_TYPES: SupportedType[] = [
  { extensions: [".txt"], mimeTypes: ["text/plain"], method: "direct" },
  { extensions: [".pdf"], mimeTypes: ["application/pdf"], method: "pdf-parse" },
  {
    extensions: [".jpg", ".jpeg", ".png"],
    mimeTypes: ["image/jpeg", "image/png"],
    method: "tesseract-ocr",
  },
];

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

/**
 * Resolve which extraction method to use based on the file's extension first,
 * falling back to its MIME type. Returns null for unsupported files.
 */
function resolveExtractionMethod(file: File): ExtractionMethod | null {
  const ext = getExtension(file.name);
  const mime = file.type.toLowerCase();

  for (const type of SUPPORTED_TYPES) {
    if (type.extensions.includes(ext)) return type.method;
  }
  for (const type of SUPPORTED_TYPES) {
    if (mime && type.mimeTypes.includes(mime)) return type.method;
  }
  return null;
}

async function extractDirect(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8");
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text;
}

async function extractImage(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const documentType = (formData.get("documentType") as string) ?? "";
    const jurisdiction = (formData.get("jurisdiction") as string) ?? "";
    const language = (formData.get("language") as string) ?? "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file was provided in the request." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "The uploaded file is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File is too large. Maximum size is 10MB.",
        },
        { status: 413 }
      );
    }

    const extractionMethod = resolveExtractionMethod(file);
    if (!extractionMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Use PDF, JPG, PNG, or TXT.",
        },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let rawText: string;
    switch (extractionMethod) {
      case "direct":
        rawText = await extractDirect(buffer);
        break;
      case "pdf-parse":
        rawText = await extractPdf(buffer);
        break;
      case "tesseract-ocr":
        rawText = await extractImage(buffer);
        break;
    }

    rawText = rawText.trim();

    if (rawText.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No readable text could be extracted from the document. It may be empty, image-only, or corrupted.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        rawText,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentType,
        jurisdiction,
        language,
        extractionMethod,
        charCount: rawText.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { success: false, error: `Failed to parse document: ${message}` },
      { status: 500 }
    );
  }
}
