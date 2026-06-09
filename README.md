# [Project Name]

### Upload the document you don't understand. Get back the rights you didn't know you had.

[![Built for STEMINATE Hacks 2026](https://img.shields.io/badge/Built_for-STEMINATE_Hacks_2026-f59e0b?style=for-the-badge)](https://github.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-8b5cf6?style=for-the-badge)](https://groq.com/)
[![Open Source](https://img.shields.io/badge/Open-Source-22c55e?style=for-the-badge)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](#license)

---

## The Problem

Every day, people receive documents that quietly decide the course of their lives — an eviction notice, an insurance denial, a benefits termination letter — written in language engineered to be understood by lawyers, not by the people it affects. Roughly **90% of tenants facing eviction go to court without a lawyer**, while their landlords almost never do. More than **half of denied health-insurance claims are overturned on appeal** — but only when someone appeals, and most people never do. Over **$60 billion in government benefits goes unclaimed every year**, much of it because a single confusing letter went unanswered.

The system isn't broken — it's working exactly as designed, against the people who can least afford it.

---

## The Solution

**[Project Name]** turns an intimidating legal or bureaucratic document into a plain-language explanation, a statute-grounded analysis of every claim made against you, and a ready-to-send draft response — in seconds, for free.

Capabilities:

- **Document parsing** — accepts PDFs, photos and scans (via OCR), and plain text
- **Plain-language explanation** — what the document actually says, in everyday words
- **Statute-grounded analysis** — every claim checked, one by one, against real law
- **Deadline extraction** — key dates surfaced with urgency indicators
- **Draft response letter** — a personalized first draft with inline statute citations
- **Confidence scoring & safety routing** — the tool tells you how much to trust it, and when to find a human
- **Multilingual support** — explanations available in multiple languages

---

## Design Philosophy

### Document-Grounded, Not Knowledge-Dependent

Most legal chatbots answer from the model's training data — a black box of half-remembered, jurisdiction-blind, possibly-outdated "knowledge." [Project Name] inverts this. The model is never asked what it *knows*; it is asked to reason over exactly two inputs: the text of *your* document and a set of statutes retrieved from a curated database. The document is the ground truth for the facts, and the statute store is the ground truth for the law. This makes the system auditable: every conclusion can be traced back to a specific sentence in your document and a specific section of code.

### Cited or Silent

A claim about your legal rights with no citation is just a guess wearing a suit. The analysis engine is held to a hard rule: **every statement about your rights must cite a specific statute from the retrieved context, or it must not be made.** When no statute in the database addresses a point, the model is instructed to say so verbatim — *"No statute found in our database addressing this. Consult a local attorney."* — rather than improvise. Silence is a valid, honest answer. Confident fabrication is not.

### Refusal as a Feature

The most dangerous thing a legal tool can do is sound certain about a life-altering matter it doesn't understand. [Project Name] treats refusal as a first-class outcome, not a failure. When confidence is low, the interface says so prominently and routes the user toward real legal aid. High-stakes matters that fall outside the tool's scope — criminal charges, child custody, immigration detention — are designed to trigger a hard stop and a referral, never an answer. A tool that knows what it doesn't know is safer than one that always has something to say.

---

## Screenshots

> [Screenshots of landing page, upload flow, and results dashboard will be added before submission]

---

## Architecture

The pipeline is a linear sequence of specialized stages. Each stage has one job, a typed contract, and a clear failure mode — so the system degrades gracefully and every step is independently testable.

```
            ┌──────────────┐
            │    Upload    │   PDF · image · text (≤10MB, in-memory)
            └──────┬───────┘
                   ▼
            ┌──────────────┐
            │    Parse     │   pdf-parse · Tesseract OCR · direct text
            └──────┬───────┘   →  raw text
                   ▼
            ┌──────────────┐
            │   Extract    │   LLM → structured JSON
            └──────┬───────┘   →  claims, deadlines, amounts, parties
                   ▼
            ┌──────────────┐
            │ RAG Statute  │   keyword retrieval over curated statutes
            │    Search    │   →  top-ranked relevant statutes
            └──────┬───────┘
                   ▼
            ┌──────────────┐
            │   Analyze    │   LLM (document + statutes)
            └──────┬───────┘   →  claim-by-claim grounded analysis
                   ▼
            ┌──────────────┐
            │  Explain +   │   2 parallel LLM calls
            │ Action Plan  │   →  plain-language explanation + response letter
            └──────┬───────┘
                   ▼
            ┌──────────────┐
            │   Results    │   confidence-scored dashboard
            │  Dashboard   │
            └──────────────┘
```

**Stage by stage:**

1. **Upload** — The document is read into memory and never written to disk or a database.
2. **Parse** — Based on file type, text is extracted directly (`.txt`), via `pdf-parse` (PDFs), or via Tesseract OCR (images/scans).
3. **Extract** — An LLM converts unstructured text into a strict JSON schema: parties, claims, deadlines, dollar amounts, and legal references.
4. **RAG Statute Search** — The extracted claims and document type drive a keyword search over a curated statute store, returning the most relevant laws.
5. **Analyze** — A second LLM call reasons over the document *and* the retrieved statutes, producing a claim-by-claim analysis where every right is cited.
6. **Explain + Action Plan** — Two LLM calls run in parallel: one writes the plain-language explanation, the other builds the action plan and draft response letter.
7. **Results Dashboard** — Everything is assembled, confidence-scored, and rendered as an interactive report.

### Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, React, Tailwind CSS, Framer Motion |
| LLM | Groq (Llama 3.3 70B) |
| Statute Store | Custom keyword-based RAG over curated California statutes |
| OCR | Tesseract.js |
| PDF Parsing | pdf-parse |
| Deployment | Vercel |

---

## Supported Document Types

- **Eviction Notices** (California)
- **Health Insurance Claim Denials**
- **Benefits Termination Letters**

The architecture is document-type-agnostic — the same pipeline handles all types. Adding a new category is primarily a matter of extending the curated statute store and the document-type taxonomy; the parse → extract → retrieve → analyze → explain flow is unchanged.

---

## Example: What It Catches

To show the analysis in action, here is what the tool surfaces from a real-world California **3-Day Notice to Pay Rent or Quit** (shipped as a one-click sample document):

- **Bundled fees.** The notice demands a "$150 administrative fee" alongside rent. A 3-day pay-or-quit notice may demand *only* rent — folding in extra charges can render the entire notice defective. *(Cited: California Code of Civil Procedure §1161.)*
- **Miscounted deadline.** The three-day window appears to count a Saturday and Sunday, but weekends and judicial holidays must be excluded. A miscounted deadline invalidates the notice.
- **Improper service.** Posting the notice on the door alone may not satisfy the statute's service requirements — a commonly overlooked defect.
- **Right to cure.** After twelve months of tenancy, just-cause protections apply, and a curable lease violation (such as an unauthorized pet) requires its own separate notice and an opportunity to fix the issue.

Each finding is tied to a specific statute, assigned a status (for example, *potentially invalid*), and paired with a concrete next step — culminating in a draft response letter the tenant can review and send. A document that looked like an eviction becomes a list of the sender's mistakes and the tenant's options.

---

## Getting Started

### Prerequisites

- **Node.js 18+** (20 LTS recommended)
- A **Groq API key** — free from [console.groq.com](https://console.groq.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/your-repo.git
cd your-repo

# 2. Install dependencies
npm install

# 3. Configure your environment
#    Create .env.local in the project root:
echo "GROQ_API_KEY=your_key_here" > .env.local

# 4. Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). Prefer not to upload anything? The upload page ships with one-click **sample documents** so you can run the full pipeline end-to-end immediately.

### Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Yes | API key for Groq LLM inference. Without it, parsing works but every analysis step fails. |

The key is read server-side only (`process.env.GROQ_API_KEY`) and is never bundled into client code. Keep `.env.local` out of version control.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

### Deployment

The app is designed for [Vercel](https://vercel.com/):

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add `GROQ_API_KEY` as an environment variable in the project settings.
4. Deploy — Vercel detects Next.js automatically.

The parse route relies on Node.js APIs (Tesseract, `pdf-parse`) and is pinned to the Node.js runtime, so it runs on Vercel's serverless functions rather than the Edge runtime.

### Troubleshooting

- **Analysis fails immediately** — `GROQ_API_KEY` is missing or invalid. Confirm `.env.local` exists and the key is active.
- **OCR feels slow** — image documents are processed with Tesseract.js, which is CPU-bound; large scans take longer than text or PDFs. Plain text and PDFs are near-instant.
- **`429` / rate-limit errors** — Groq's free tier is rate-limited. Wait a moment and retry, or upgrade your Groq plan for heavier use.

---

## Project Structure

```
.
├── public/
│   └── samples/                    # One-click demo documents
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── parse/route.ts       # Stage 1 — text extraction (PDF/OCR/txt)
│   │   │   ├── extract/route.ts     # Stage 2 — structured extraction (LLM)
│   │   │   ├── analyze/route.ts     # Stage 3 — statute-grounded analysis (RAG + LLM)
│   │   │   └── explain/route.ts     # Stage 4 — explanation + action plan (parallel LLM)
│   │   ├── page.tsx                 # Landing page
│   │   ├── upload/page.tsx          # Upload + live processing flow
│   │   ├── results/page.tsx         # Results dashboard
│   │   ├── error/page.tsx           # Generic error page
│   │   ├── layout.tsx               # Root layout + metadata
│   │   └── template.tsx             # Page-transition wrapper
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── results/                 # Dashboard sections (summary, claims, timeline, …)
│   ├── lib/
│   │   ├── pipeline.ts              # Client-side pipeline orchestrator
│   │   ├── confidence.ts            # Confidence scoring engine
│   │   ├── groq.ts                  # Groq client + chat wrapper
│   │   ├── llm-json.ts              # Robust LLM JSON parsing
│   │   ├── types.ts                 # Shared TypeScript types
│   │   ├── mock-data.ts             # Demo fallback dataset
│   │   ├── prompts/                 # System prompts (extraction, analysis, explain, action plan)
│   │   └── rag/
│   │       └── statute-store.ts     # Keyword RAG over curated statutes
│   └── data/
│       └── statutes/                # Curated California statute JSON
│           ├── california-tenant.json
│           ├── california-insurance.json
│           └── california-benefits.json
└── package.json
```

---

## How It Works — Technical Deep Dive

### Document Parsing

The `/api/parse` route runs on the Node.js runtime and selects an extraction strategy by file type. Plain text is read directly, PDFs are parsed with `pdf-parse`, and images or scanned documents are passed through Tesseract.js OCR. The route enforces a 10MB ceiling, rejects empty or unreadable files with precise error codes, and returns clean, trimmed text — never persisting the file. This means a blurry phone photo of a notice taped to a door is a valid input.

### Structured Extraction

Raw text is messy; downstream reasoning needs structure. The `/api/extract` route sends the text to the LLM under a strict system prompt that forbids inference and demands a single JSON object matching a fixed schema. The model breaks the document into **individual, granular claims** — each distinct demand, fee, deadline, and threatened consequence becomes its own entry — alongside parties, dollar amounts, and any legal references. Anything not explicitly stated is returned as `null` rather than guessed.

### Statute Retrieval (RAG)

Retrieval is deliberately transparent: a custom keyword-based scorer, not an opaque embedding model. The store tokenizes statute titles, summaries, topics, and full text, then ranks each statute against queries derived from the document's claims and type. Matches are weighted by field — a document-type match or a title hit counts far more than an incidental word in the body — and results are deduplicated and score-ranked. Because it's lexical, every retrieval decision is inspectable and reproducible, with no vector database to operate.

### Grounded Analysis

The `/api/analyze` route is where the legal reasoning happens. It assembles the structured extraction, the retrieved statutes, and the original text into a single prompt, then instructs the model to analyze each claim and deadline **strictly against the provided statutes** — citing each by ID and number. The model is explicitly barred from inventing statutes or using hedge words like "typically" without a citation, and is told to declare when no relevant law was found. The output is a claim-by-claim verdict, a rights summary, red flags, and a referral decision.

### Explanation Generation

The final `/api/explain` route fans out into two concurrent LLM calls for speed. One produces the human-facing explanation — a document summary, sectioned breakdown, glossary of legal terms, and a reassuring "what this means for you." The other produces the action plan: a prioritized timeline, ranked options with likelihood-of-success, curated local resources, and a draft response letter with inline citations. Running them in parallel keeps end-to-end latency down despite two large generations.

### API Reference

All routes are `POST`, run on the Node.js runtime, and respond with either `{ success: true, data }` or `{ success: false, error }`. The client-side orchestrator in `src/lib/pipeline.ts` chains the four calls in sequence, reports per-step progress to the UI, and assembles the final results payload.

| Endpoint | Purpose | Key Input | Key Output |
| --- | --- | --- | --- |
| `POST /api/parse` | Extract text from the uploaded file | `multipart/form-data` (file) | `rawText` |
| `POST /api/extract` | Structure the text into typed JSON | `rawText`, `documentType` | `extraction` |
| `POST /api/analyze` | Ground each claim in retrieved statutes | `rawText`, `extraction` | `analysis`, statute counts |
| `POST /api/explain` | Generate explanation + action plan | `rawText`, `extraction`, `analysis` | `explanation`, `actionPlan` |

Because each route enforces a typed contract and a single responsibility, any stage can be exercised, tested, or replaced in isolation.

---

## Confidence & Safety System

Trust should be earned and displayed, not assumed. After analysis, a dedicated scoring engine grades the result and surfaces the grade prominently at the top of the dashboard.

- **High confidence** — claims are well-matched to statutes, the jurisdiction is fully covered (California), and no referral is flagged. The analysis can be relied on as a strong starting point.
- **Moderate confidence** — some claims need review, a professional referral is recommended, or coverage is partial. The dashboard explicitly notes that parts of the document could not be fully verified.
- **Low confidence** — significant gaps: unmatched claims, an out-of-coverage jurisdiction, or missing document details. The tool states plainly that the analysis has gaps and urges consulting a licensed attorney before acting.

The score starts at 100 and is adjusted by concrete, inspectable factors before being mapped to a level (80+ high, 50–79 moderate, below 50 low):

| Factor | Effect | Why |
| --- | --- | --- |
| Claim with no matching statute | −15 each | The law behind the claim could not be verified |
| Claim requiring review | −10 each | The model flagged it for a closer human look |
| Potentially-invalid claim | −5 each | A small cost, but good news — a likely defect in your favor |
| Out-of-coverage jurisdiction | −25 | The statute store is California-focused |
| Professional referral recommended | −15 | The matter is complex enough to warrant a lawyer |
| High volume of red flags | −10 | Many issues warrant extra caution |
| Missing sender/identity details | −10 | Less to verify the document against |

Each factor that fires is shown to the user with a plain-language explanation, and the disclaimers escalate with the resulting level — so the score is never an opaque number.

Beyond scoring, the safety architecture treats certain matters as **hard refusals**. Situations where a wrong answer could be catastrophic — criminal charges, child custody disputes, immigration detention — are designed to stop the pipeline and route the user to professional or emergency legal help rather than produce an analysis. The goal is simple: never let a confident-sounding machine stand between a person and the lawyer they actually need.

---

## Ethical Considerations

- **Legal information, not legal advice.** [Project Name] explains documents and surfaces relevant law. It is not a lawyer and does not establish an attorney–client relationship. Every output reinforces this.
- **Data privacy.** Documents are processed entirely in memory and are never written to disk or stored in a database. When the request ends, the document is gone.
- **Transparency.** Every system prompt that shapes the model's behavior lives in the repository under `src/lib/prompts/`. There are no hidden instructions — anyone can audit exactly what the model is told.
- **Refusal architecture.** The system is built to decline rather than guess. Low confidence and out-of-scope matters route to human help by design.
- **Statute currency.** The curated statute store is a snapshot in time and is California-focused. Laws change, and coverage is finite — the tool flags its own limits, and users should verify against current, official sources.

---

## Future Vision

- **More jurisdictions** — open the statute store to community-contributed law beyond California, so coverage grows where the need is greatest.
- **Court e-filing integration** — move from drafting a response to actually filing it, closing the gap between understanding and action.
- **Legal aid partnerships** — integrate directly with legal aid organizations so a low-confidence result becomes a warm handoff to a real advocate.
- **Mobile document scanning** — a dedicated mobile app so a photo of a notice becomes an analysis on the spot.

---

## Contributing

The highest-impact contribution is **legal coverage**. The statute store lives in `src/data/statutes/` as plain JSON, so expanding it requires no machine-learning expertise — only care and a citation.

To add or extend coverage:

1. Add or edit a statute entry in the relevant JSON file (e.g. `california-tenant.json`), following the existing shape: `id`, `statute_number`, `title`, `text`, `summary`, `topics`, `document_types`, and `jurisdiction`.
2. Keep `text` faithful to the official statutory language, and write a `summary` a non-lawyer can understand.
3. Tag `topics` and `document_types` accurately — these drive retrieval relevance.
4. Open a pull request describing the source and jurisdiction of each addition.

Because retrieval is transparent keyword matching, you can predict and test exactly how a new statute will surface. Bug reports, prompt improvements, and UI refinements are equally welcome — please open an issue to discuss larger changes first.

---

## Team

> [Team name and members]

---

## License

Released under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## Acknowledgments

- **STEMINATE Hacks 2026** — for the challenge and the platform.
- **Groq** — for fast, affordable LLM inference that makes a free tool viable.
- **The legal aid organizations** whose tireless work inspired this project — and whose mission this tool exists to support, never to replace.
