"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import toast from "react-hot-toast";
import {
  runAnalysisPipeline,
  INITIAL_PIPELINE_STAGES,
  type PipelineStage,
} from "@/lib/pipeline";

/* ------------------------------------------------------------------ */
/* Constants (unchanged logic)                                        */
/* ------------------------------------------------------------------ */

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "text/plain": [".txt"],
};

const DOC_TYPES: { id: string; label: string }[] = [
  { id: "eviction", label: "Eviction Notice" },
  { id: "insurance", label: "Insurance Denial" },
  { id: "benefits", label: "Benefits Letter" },
  { id: "other", label: "Other" },
];

/** Maps the upload page's docType ids to the values the API expects. */
const DOC_TYPE_API_MAP: Record<string, string> = {
  eviction: "eviction_notice",
  insurance: "insurance_denial",
  benefits: "benefits_termination",
  other: "other",
};

/** Demo documents served from `public/samples/`. */
const SAMPLE_DOCS: {
  label: string;
  fileName: string;
  docType: string;
  desc: string;
}[] = [
  {
    label: "Eviction Notice",
    fileName: "eviction-notice-ca.txt",
    docType: "eviction",
    desc: "3-day notice to pay rent or quit",
  },
  {
    label: "Insurance Denial",
    fileName: "insurance-denial-ca.txt",
    docType: "insurance",
    desc: "Health claim denied as not necessary",
  },
  {
    label: "Benefits Letter",
    fileName: "benefits-termination-ca.txt",
    docType: "benefits",
    desc: "CalFresh termination notice",
  },
];

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

const STAGE_META: Record<number, { label: string; subtitle: string }> = {
  1: { label: "Reading your document", subtitle: "Extracting the text" },
  2: {
    label: "Extracting key information",
    subtitle: "Claims, deadlines, and demands",
  },
  3: {
    label: "Checking against real statutes",
    subtitle: "Searching the California statute store",
  },
  4: {
    label: "Generating your action plan",
    subtitle: "Plain-language explanation and response letter",
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(file: File | null): string {
  if (!file) return "document";
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "PDF";
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "text/plain" || name.endsWith(".txt")) return "text file";
  return "document";
}

function isSampleFile(file: File): boolean {
  return SAMPLE_DOCS.some((s) => s.fileName === file.name);
}

/* ------------------------------------------------------------------ */
/* Inline icons (match the design)                                    */
/* ------------------------------------------------------------------ */

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const DocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
function SampleIcon({ kind }: { kind: string }) {
  if (kind === "insurance") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "benefits") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 8h14M5 8l1-3h12l1 3M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M10 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 21V9l8-5 8 5v12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Processing overlay (design ring + stages, wired to real data)      */
/* ------------------------------------------------------------------ */

const RING_LEN = 2 * Math.PI * 58; // r = 58

function StageRow({
  stage,
  fileType,
}: {
  stage: PipelineStage;
  fileType: string;
}) {
  const meta = STAGE_META[stage.step];
  const { status } = stage;
  const cls =
    status === "active"
      ? "active"
      : status === "complete"
        ? "done"
        : status === "error"
          ? "error"
          : "";
  const subtitle =
    status === "error"
      ? "Couldn't complete this step"
      : stage.step === 1
        ? `Extracting text from your ${fileType}`
        : meta.subtitle;

  return (
    <div className={`stage ${cls}`.trim()}>
      <div className="stage-ic">
        {status === "active" ? (
          <span className="spin" />
        ) : status === "complete" ? (
          <CheckIcon />
        ) : status === "error" ? (
          <CloseIcon />
        ) : (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "currentColor",
            }}
          />
        )}
      </div>
      <div className="stage-body">
        <div className="stage-title">
          <span>{meta.label}</span>
          <span className="t-time">
            {status === "complete" && stage.time != null
              ? `${(stage.time / 1000).toFixed(1)}s`
              : ""}
          </span>
        </div>
        <div className="stage-sub">{subtitle}</div>
      </div>
    </div>
  );
}

function ProcessingOverlay({
  stages,
  file,
}: {
  stages: PipelineStage[];
  file: File | null;
}) {
  const fileType = fileTypeLabel(file);
  const fileName = file?.name ?? "your document";
  const completed = stages.filter((s) => s.status === "complete").length;
  const pct = completed * 25; // 25% per step
  const offset = RING_LEN * (1 - pct / 100);

  return (
    <div className="proc-overlay" role="status" aria-live="polite">
      <div className="shell shell-narrow">
        <div className="proc">
          <div className="proc-doc">{fileName}</div>
          <h2>Reading it carefully.</h2>
          <div className="proc-ring">
            <svg width="132" height="132" viewBox="0 0 132 132">
              <circle cx="66" cy="66" r="58" fill="none" stroke="var(--line)" strokeWidth="8" />
              <circle
                className="ring-fg"
                cx="66"
                cy="66"
                r="58"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={RING_LEN.toFixed(1)}
                strokeDashoffset={offset.toFixed(1)}
                transform="rotate(-90 66 66)"
              />
            </svg>
            <div className="proc-pct">
              <b>{pct}%</b>
            </div>
          </div>
          <div className="stages">
            {stages.map((stage) => (
              <StageRow key={stage.step} stage={stage} fileType={fileType} />
            ))}
          </div>
          <p className="proc-note">
            This usually takes 30 to 90 seconds depending on document complexity.
          </p>
          <p className="proc-privacy">
            Your document is in memory only. It is never written to disk.
          </p>
        </div>
      </div>
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
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

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

  const loadSample = async (sample: (typeof SAMPLE_DOCS)[number]) => {
    if (isProcessing || loadingSample !== null) return;

    setLoadingSample(sample.fileName);
    try {
      const response = await fetch(`/samples/${sample.fileName}`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const text = await response.text();
      const sampleFile = new File([text], sample.fileName, {
        type: "text/plain",
      });
      setFile(sampleFile);
      setDocType(sample.docType);
      toast.success("Sample document loaded");
    } catch {
      toast.error("Could not load the sample document. Please try again.");
    } finally {
      setLoadingSample(null);
    }
  };

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
      // Dismiss the overlay and surface the failure inline. Form state is
      // preserved so the user can retry immediately.
      setIsProcessing(false);
      toast.error(message);
    }
  };

  const showSafetyInfo = () => {
    toast(
      "For matters like criminal charges, custody, immigration, or safety, FairNotice refuses to analyze and routes you to professional help instead.",
      { icon: "🛟", duration: 6000 }
    );
  };

  return (
    <section className="shell">
      <div className="up-head">
        <span className="eyebrow">Step 1 · Upload</span>
        <h1>
          Upload your <em>document.</em>
        </h1>
        <p>
          Drop the document you received. FairNotice will explain it in plain
          language, check it against real California law, and draft your
          response. Nothing is stored.
        </p>
      </div>

      <div className="up-grid">
        {/* -------------------- LEFT: form -------------------- */}
        <div className="card card-pad">
          {/* dropzone / file chip */}
          <div className="field">
            <span className="field-label">Your document</span>
            {!file ? (
              <div
                {...getRootProps({
                  className: `dropzone${isDragActive ? " drag" : ""}`,
                })}
              >
                <input {...getInputProps()} />
                <span className="dz-ic">
                  <UploadIcon />
                </span>
                <div className="dz-title">
                  Drag &amp; drop, or <b>browse your files</b>
                </div>
                <div className="dz-sub">PDF, JPG, PNG, TXT · up to 10 MB</div>
              </div>
            ) : (
              <div className="file-chip">
                <div className="fc-ic">
                  <DocIcon />
                </div>
                <div className="fc-meta">
                  <div className="fc-name">{file.name}</div>
                  <div className="fc-size">
                    {isSampleFile(file)
                      ? "Sample document"
                      : formatFileSize(file.size)}
                  </div>
                </div>
                <button
                  type="button"
                  className="fc-rm"
                  aria-label="Remove file"
                  onClick={() => setFile(null)}
                >
                  <CloseIcon />
                </button>
              </div>
            )}
          </div>

          {/* samples */}
          <div className="field">
            <span className="field-label">No document handy? Try a sample</span>
            <div className="samples">
              {SAMPLE_DOCS.map((sample) => {
                const picked = file?.name === sample.fileName;
                const loading = loadingSample === sample.fileName;
                return (
                  <button
                    key={sample.fileName}
                    type="button"
                    className={`sample${picked ? " picked" : ""}`}
                    disabled={loadingSample !== null || isProcessing}
                    onClick={() => loadSample(sample)}
                  >
                    <span className="s-ic">
                      <SampleIcon kind={sample.docType} />
                    </span>
                    <span className="s-body">
                      <span className="s-name">{sample.label}</span>
                      <span className="s-desc">{sample.desc}</span>
                    </span>
                    <span className="s-go">
                      {loading ? "LOADING…" : "LOAD →"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* document type — segmented control */}
          <div className="field">
            <span className="field-label">Document type</span>
            <div className="seg">
              {DOC_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={docType === t.id ? "on" : ""}
                  aria-pressed={docType === t.id}
                  onClick={() => setDocType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* jurisdiction + language */}
          <div
            className="up-grid"
            style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}
          >
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label" htmlFor="jurisdiction">
                Jurisdiction
              </label>
              <div className="select-wrap">
                <select
                  id="jurisdiction"
                  className="input"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                >
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
              <div className="field-note">
                <InfoIcon />
                Coverage is deepest for California. Other states work, with lower
                confidence.
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label" htmlFor="language">
                Explain in
              </label>
              <div className="select-wrap">
                <select
                  id="language"
                  className="input"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
              <div className="field-note">
                <InfoIcon />
                The response letter is always written in English.
              </div>
            </div>
          </div>

          {/* submit */}
          <div className="up-submit">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              disabled={!canSubmit || isProcessing}
              onClick={handleSubmit}
            >
              Analyze document <span className="arw">→</span>
            </button>
            <div className="up-reassure">
              <LockIcon />
              <span>Cites real statutes</span>
              <span className="sep">·</span>
              <span>Processed in-memory</span>
              <span className="sep">·</span>
              <span>Never stored</span>
            </div>
          </div>
        </div>

        {/* -------------------- RIGHT: aside -------------------- */}
        <div>
          <div className="card card-pad">
            <div className="aside-title">What happens next</div>
            <ul className="how-mini">
              <li>
                <span className="n">01</span>
                <div>
                  <div className="t">It reads &amp; extracts</div>
                  <div className="d">
                    Pulls out every claim, deadline, and demand.
                  </div>
                </div>
              </li>
              <li>
                <span className="n">02</span>
                <div>
                  <div className="t">It checks the law</div>
                  <div className="d">
                    Matches each claim to real California statutes, or says it
                    found none.
                  </div>
                </div>
              </li>
              <li>
                <span className="n">03</span>
                <div>
                  <div className="t">You get a plan</div>
                  <div className="d">
                    Plain-language breakdown, your rights, and a draft reply.
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <p className="safety-hint">
            Some matters are out of scope.{" "}
            <button type="button" onClick={showSafetyInfo}>
              See what a refusal looks like →
            </button>
          </p>
        </div>
      </div>

      {isProcessing ? (
        <ProcessingOverlay stages={pipelineStages} file={file} />
      ) : null}
    </section>
  );
}
