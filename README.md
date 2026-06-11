# FairNotice

**Upload the document you don't understand. Get back the rights you didn't know you had.**

---

## What is this?

FairNotice reads legal and bureaucratic documents so you don't have to.

Upload an eviction notice, insurance denial, or benefits termination letter. The app parses it, pulls out every claim and deadline, checks each one against real California statutes, and gives you back a plain-language breakdown with a draft response letter. Every claim is cited. When the AI can't find a relevant statute, it says so instead of guessing.

## Why we built this

The numbers are rough:

- ~90% of tenants show up to eviction court without a lawyer. Their landlords almost always have one.
- Over half of denied health insurance claims get overturned on appeal. Most people never appeal.
- $60B+ in government benefits go unclaimed every year because the paperwork is confusing.

These aren't edge cases. Millions of people get documents that change their lives and have no idea what they actually say or what they can do about it. We wanted to build something that helps with that.

## What it does

- **Parses documents** - PDFs, scanned images (OCR via Tesseract.js), or plain text
- **Extracts claims, deadlines, and demands** into structured data
- **Checks every claim against real statutes** using a retrieval pipeline over curated California law
- **Explains everything in plain language** - short sentences, no jargon, defines legal terms inline
- **Generates a draft response letter** with statute citations baked in
- **Scores its own confidence** and tells you when to talk to a real lawyer instead
- **Supports multiple languages** for the explanation (response letters stay in English)

## How it actually works

The pipeline is four API calls chained together:

```
Upload file
  -> /api/parse     (extract raw text from PDF/image/txt)
  -> /api/extract   (LLM turns raw text into structured JSON: claims, deadlines, parties, amounts)
  -> /api/analyze   (search statute store + LLM analyzes each claim against retrieved statutes)
  -> /api/explain   (two LLM calls: plain-language explanation + action plan with response letter)
  -> Results dashboard
```

Each step has a typed contract. If one fails, the pipeline tells you which step broke and why.

### The statute store

This is the core of the "cited or silent" rule. We curated 39 California statutes across three areas:

- **Tenant law** (17 statutes) - Civil Code 1946.2, CCP 1161, security deposits, habitability, retaliation protections, etc.
- **Insurance law** (12 statutes) - IMR appeal rights, denial notice requirements, bad faith rules, ACA protections
- **Benefits law** (10 statutes) - CalFresh/SNAP procedures, Medi-Cal notice requirements, fair hearing rights

Retrieval is keyword-based, not vector embeddings. Intentional choice. With a small curated set, keyword matching is more predictable and every retrieval decision is inspectable. No black-box similarity scores.

### What it catches

From the sample eviction notice we ship with the app, the analysis flags:

- **Bundled fees** - the notice demands a $150 "admin fee" alongside rent. A 3-day pay-or-quit can only demand rent. Bundling fees can void the entire notice. (CCP 1161)
- **Miscounted deadline** - the 3-day window counts weekends, but weekends and judicial holidays must be excluded
- **Improper service** - posting on the door alone may not satisfy service requirements
- **Right to cure** - after 12 months of tenancy, just-cause protections kick in and curable violations need their own notice

Each finding links to a specific statute and comes with a concrete next step.

## Design decisions that matter

**Document-grounded, not knowledge-dependent.** The AI never answers from general legal knowledge. It reads the specific document you uploaded and reasons about it against the statutes we retrieved. No document uploaded = nothing to say. This isn't a legal chatbot.

**Cited or silent.** Every statement about your rights must cite a statute from the retrieval context. If no statute is found, the model says "No statute found in our database addressing this. Consult a local attorney." We literally put that sentence in the prompt.

**Refusal is a feature.** Criminal charges, child custody, immigration cases, restraining orders: the system refuses to analyze these and routes you to professional help. A tool that knows what it doesn't know is safer than one that always has an answer.

## Confidence scoring

After analysis, a scoring engine grades the result:

| Level | Score | What it means |
|---|---|---|
| High | 80-100 | Claims well-matched to statutes, California jurisdiction, no referral needed |
| Moderate | 50-79 | Some gaps, partial matches, or professional referral recommended |
| Low | 0-49 | Significant gaps. Talk to an attorney before acting on this |

The score is transparent. Every deduction (no statute match: -15, out-of-state jurisdiction: -25, referral needed: -15, etc.) is shown to the user with an explanation.

## Tech stack

| Layer | What |
|---|---|
| Frontend | Next.js 16, React, Tailwind CSS |
| LLM | Groq SDK + Llama 3.3 70B Versatile |
| Statute retrieval | Custom keyword RAG over curated JSON |
| OCR | Tesseract.js |
| PDF parsing | pdf-parse |
| Deployment | Vercel |

## Getting started

You need Node.js 20+ and a [Groq API key](https://console.groq.com) (free tier works).

```bash
git clone https://github.com/AdityaChauhanX07/steminate.git
cd steminate
npm install
echo "GROQ_API_KEY=your_key_here" > .env.local
npm run dev
```

Open `http://localhost:3000`. The upload page has one-click sample documents so you can run the full pipeline without uploading anything.

## Project structure

```
src/
  app/
    page.tsx                        # Landing page
    (app)/
      layout.tsx                    # App shell (topbar, light theme)
      upload/page.tsx               # Upload + processing flow
      results/page.tsx              # Results dashboard
      error/page.tsx                # Error page
    api/
      parse/route.ts                # Stage 1: text extraction (PDF/OCR/txt)
      extract/route.ts              # Stage 2: structured extraction (LLM)
      analyze/route.ts              # Stage 3: statute-grounded analysis (RAG + LLM)
      explain/route.ts              # Stage 4: explanation + action plan (LLM)
  components/results/               # Dashboard section components
  lib/
    pipeline.ts                     # Client-side pipeline orchestrator
    confidence.ts                   # Confidence scoring engine
    results-adapter.ts              # Maps pipeline output to view-model
    groq.ts                         # Groq client wrapper with retry logic
    prompts/                        # All system prompts (visible, auditable)
    rag/statute-store.ts            # Statute retrieval engine
  data/statutes/                    # Curated statute JSON files
public/samples/                     # One-click demo documents
```

## Privacy

Documents are processed in memory. Nothing is written to disk or stored in a database. When the request ends, the document is gone. The Groq API key is server-side only, never exposed to the client.

## Limitations

We're upfront about these:

- **California only** for statute coverage right now. Other states will get analyzed but with lower confidence and fewer statute matches.
- **Legal information, not legal advice.** This is not a lawyer. It does not create an attorney-client relationship.
- **Statutes are a snapshot.** Laws change. The store reflects law as of June 2026. Users should verify against official sources.
- **LLM latency.** The full pipeline takes 30-90 seconds depending on document complexity. Most of that is the explanation + action plan generation step.
- **Free tier rate limits.** Groq's free tier has daily token caps. Heavy testing can exhaust them.

## What's next

- More jurisdictions through community-contributed statute files (the store is plain JSON, no ML needed to contribute)
- Court e-filing integration
- Mobile app for scanning documents with your phone camera
- Partnerships with legal aid organizations for warm handoffs

## License

MIT. See [LICENSE](LICENSE).

## Acknowledgments

Built for [STEMINATE Hacks 2026](https://steminate-hacks-2026.devpost.com/). LLM inference by [Groq](https://groq.com). Inspired by the legal aid organizations doing this work for real, every day.

Built by **Aditya Chauhan** and **Vladimir Khegai**.