"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Home,
  ShieldX,
  FileWarning,
  FileQuestion,
  Lock,
  ChevronDown,
  Loader2,
  CheckCircle,
  XCircle,
  Circle,
  type LucideIcon,
} from "lucide-react";
import {
  runAnalysisPipeline,
  INITIAL_PIPELINE_STAGES,
  type PipelineStage,
} from "@/lib/pipeline";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "text/plain": [".txt"],
};

const DOC_TYPES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "eviction", label: "Eviction Notice", icon: Home },
  { id: "insurance", label: "Insurance Denial", icon: ShieldX },
  { id: "benefits", label: "Benefits Letter", icon: FileWarning },
  { id: "other", label: "Other", icon: FileQuestion },
];

/** Maps the upload page's docType ids to the values the API expects. */
const DOC_TYPE_API_MAP: Record<string, string> = {
  eviction: "eviction_notice",
  insurance: "insurance_denial",
  benefits: "benefits_letter",
  other: "other",
};

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

const LANGUAGES = ["English", "Spanish", "Mandarin", "Vietnamese", "Arabic"];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/* ------------------------------------------------------------------ */
/* Processing overlay                                                 */
/* ------------------------------------------------------------------ */

function StageIcon({ status }: { status: PipelineStage["status"] }) {
  switch (status) {
    case "active":
      return <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" />;
    case "complete":
      return <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />;
    case "error":
      return <XCircle className="h-5 w-5 shrink-0 text-red-500" />;
    default:
      return <Circle className="h-5 w-5 shrink-0 text-muted" />;
  }
}

function ProcessingOverlay({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-5 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Analyzing your document
        </h2>

        <ul className="mt-6 space-y-4">
          {stages.map((stage) => {
            const muted =
              stage.status === "pending" || stage.status === "complete";
            return (
              <li key={stage.step} className="flex items-start gap-3">
                <StageIcon status={stage.status} />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      stage.status === "error"
                        ? "text-red-500"
                        : muted && stage.status === "pending"
                          ? "text-muted"
                          : "text-foreground"
                    }`}
                  >
                    {stage.label}
                  </p>
                  {stage.detail ? (
                    <p className="mt-0.5 text-xs text-muted">{stage.detail}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-7 text-center text-xs text-muted">
          This usually takes 15-30 seconds
        </p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string | null>(null);
  const [jurisdiction, setJurisdiction] = useState("California");
  const [language, setLanguage] = useState("English");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(
    INITIAL_PIPELINE_STAGES
  );

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
    }
  }, []);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const error = rejections[0]?.errors[0];
    if (error?.code === "file-too-large") {
      toast.error("File is too large. Maximum size is 10MB.");
    } else if (error?.code === "file-invalid-type") {
      toast.error("Unsupported file type. Use PDF, JPG, PNG, or TXT.");
    } else {
      toast.error(error?.message ?? "Could not accept that file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const canSubmit = file !== null && docType !== null;

  const handleSubmit = async () => {
    if (!file || !docType || isProcessing) return;

    setPipelineStages(INITIAL_PIPELINE_STAGES);
    setIsProcessing(true);

    try {
      await runAnalysisPipeline({
        file,
        documentType: DOC_TYPE_API_MAP[docType] ?? "other",
        jurisdiction,
        language,
        onProgress: (stage) => {
          setPipelineStages((prev) =>
            prev.map((s) => (s.step === stage.step ? stage : s))
          );
        },
      });
      // Keep the overlay up through the navigation to the results dashboard.
      router.push("/results");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing your document.";
      toast.error(message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-glow-amber min-h-screen px-5 py-12 sm:px-8 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`mx-auto w-full max-w-2xl transition-opacity ${
          isProcessing ? "pointer-events-none opacity-40" : ""
        }`}
        aria-hidden={isProcessing}
      >
        {/* ------------------------------------------------------ */}
        {/* HEADER                                                 */}
        {/* ------------------------------------------------------ */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Upload Your Document
        </h1>
        <p className="mt-3 text-base text-muted">
          Upload the document you received. We&apos;ll explain it, check it
          against real law, and help you respond.
        </p>

        {/* ------------------------------------------------------ */}
        {/* UPLOAD ZONE                                            */}
        {/* ------------------------------------------------------ */}
        <div className="mt-8">
          {!file ? (
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
                isDragActive
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface/40 hover:border-accent/50 hover:bg-surface-hover"
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud
                className={`h-12 w-12 ${
                  isDragActive ? "text-accent" : "text-muted"
                }`}
              />
              <p className="mt-4 text-base font-semibold text-foreground">
                Drag &amp; drop your document here
              </p>
              <p className="mt-1 text-sm text-muted">or click to browse</p>
              <p className="mt-4 text-xs text-muted">
                Supports PDF, JPG, PNG, or TXT — max 10MB
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                {isImageFile(file) ? (
                  <ImageIcon className="h-6 w-6" />
                ) : (
                  <FileText className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {file.name}
                </p>
                <p className="text-xs text-muted">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------ */}
        {/* CONFIGURATION                                          */}
        {/* ------------------------------------------------------ */}
        <div className="mt-10 space-y-8">
          {/* Document type */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Document Type
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DOC_TYPES.map((type) => {
                const selected = docType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setDocType(type.id)}
                    aria-pressed={selected}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                      selected
                        ? "border-accent bg-accent/10"
                        : "border-border bg-surface/40 hover:border-accent/40 hover:bg-surface-hover"
                    }`}
                  >
                    <type.icon
                      className={`h-6 w-6 ${
                        selected ? "text-accent" : "text-muted"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        selected ? "text-foreground" : "text-muted"
                      }`}
                    >
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jurisdiction */}
          <div>
            <label
              htmlFor="jurisdiction"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              State / Jurisdiction
            </label>
            <div className="relative">
              <select
                id="jurisdiction"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-surface px-4 py-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-accent"
              >
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
            <p className="mt-2 text-xs text-muted">
              We currently have deepest coverage for California
            </p>
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Explain results in
            </label>
            <div className="relative">
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-surface px-4 py-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-accent"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
            <p className="mt-2 text-xs text-muted">
              Response letters are always generated in English
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* SUBMIT                                                 */}
        {/* ------------------------------------------------------ */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isProcessing}
          className={`group mt-10 inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold transition-all ${
            canSubmit && !isProcessing
              ? "bg-accent text-background shadow-lg shadow-accent/20 hover:bg-accent-hover hover:shadow-accent/30"
              : "cursor-not-allowed bg-surface text-muted"
          }`}
        >
          Analyze My Document
          <ArrowRight
            className={`h-5 w-5 transition-transform ${
              canSubmit ? "group-hover:translate-x-0.5" : ""
            }`}
          />
        </button>

        {/* ------------------------------------------------------ */}
        {/* TRUST REMINDER                                         */}
        {/* ------------------------------------------------------ */}
        <div className="mt-5 flex items-start justify-center gap-2 text-center">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
          <p className="text-xs text-muted">
            Your document is processed in-memory and never stored. All analysis
            cites real statutes.
          </p>
        </div>
      </motion.div>

      {isProcessing ? <ProcessingOverlay stages={pipelineStages} /> : null}
    </div>
  );
}
