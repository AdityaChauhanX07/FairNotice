"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Search,
  FileText,
  Home,
  ShieldX,
  FileWarning,
  CheckCircle,
  AlertTriangle,
  Lock,
} from "lucide-react";

/* lucide v1 dropped the GitHub brand mark, so we inline it. */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({
  end,
  prefix = "",
  suffix = "",
  duration = 1.6,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * end));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { end: 90, suffix: "%", label: "of tenants face eviction without a lawyer" },
  {
    end: 50,
    suffix: "%+",
    label: "of denied insurance claims are overturned on appeal",
  },
  {
    end: 60,
    prefix: "$",
    suffix: "B+",
    label: "in government benefits go unclaimed annually",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Upload Your Document",
    desc: "PDF, image, or photo of any legal notice, denial letter, or government document.",
  },
  {
    icon: Search,
    title: "AI Analyzes & Cites",
    desc: "Every claim is checked against real statutes. No guesses — citations or silence.",
  },
  {
    icon: FileText,
    title: "Get Your Action Plan",
    desc: "Plain-language explanation, deadline alerts, and a draft response letter you can send.",
  },
];

const documents = [
  {
    icon: Home,
    title: "Eviction Notices",
    desc: "Understand your rights, verify notice periods, and respond with legal backing.",
  },
  {
    icon: ShieldX,
    title: "Insurance Denials",
    desc: "Decode denial reasons, check appeal rights, and draft your appeal letter.",
  },
  {
    icon: FileWarning,
    title: "Benefits Terminations",
    desc: "Verify termination grounds, find unclaimed eligibility, and fight back.",
  },
];

const principles = [
  {
    icon: CheckCircle,
    text: "Every claim cites a specific statute. No citation, no claim.",
  },
  {
    icon: AlertTriangle,
    text: "When confidence is low, the AI says so — and connects you to real help.",
  },
  {
    icon: Lock,
    text: "Your documents are processed in-memory and never stored.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="bg-glow-amber">
      {/* ---------------------------------------------------------- */}
      {/* HERO                                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pb-28 sm:pt-28">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
        >
          Every document you don&apos;t understand is a right you can&apos;t
          defend.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted sm:text-xl"
        >
          Upload the legal document you received. Get a plain-language
          explanation, statute-backed analysis, and a draft response — in
          seconds.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.24 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <Link
            href="/upload"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-background shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-accent/30"
          >
            Upload Your Document
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-sm text-muted">
            Free. Open source. No data stored.
          </p>
        </motion.div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* PROBLEM STATS                                              */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
          {stats.map((stat, i) => (
            <FadeUp key={stat.label} delay={i * 0.1} className="text-center">
              <div className="text-4xl font-bold text-accent sm:text-5xl">
                <CountUp
                  end={stat.end}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted">
                {stat.label}
              </p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* HOW IT WORKS                                               */}
      {/* ---------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <FadeUp className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <FadeUp key={step.title} delay={i * 0.12}>
              <div className="relative h-full">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-accent">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {step.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* SUPPORTED DOCUMENTS                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="border-t border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <FadeUp className="mb-14 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Built for the documents that change your life
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {documents.map((doc, i) => (
              <FadeUp key={doc.title} delay={i * 0.12}>
                <div className="group h-full rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-accent/40 hover:bg-surface-hover">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <doc.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{doc.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {doc.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* TRUST / PHILOSOPHY                                         */}
      {/* ---------------------------------------------------------- */}
      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
        <FadeUp className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            AI that knows what it doesn&apos;t know
          </h2>
        </FadeUp>

        <div className="space-y-6">
          {principles.map((p, i) => (
            <FadeUp key={p.text} delay={i * 0.1}>
              <div className="flex items-start gap-4 rounded-xl border border-border bg-surface/50 p-5">
                <div className="mt-0.5 shrink-0 text-accent">
                  <p.icon className="h-6 w-6" />
                </div>
                <p className="text-base leading-relaxed text-foreground/90">
                  {p.text}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FOOTER                                                     */}
      {/* ---------------------------------------------------------- */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-10 text-center sm:px-8">
          <p className="text-sm text-muted">Built for STEMINATE Hacks 2026</p>
          <a
            href="https://github.com/AdityaChauhanX07/steminate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            <GithubIcon className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
