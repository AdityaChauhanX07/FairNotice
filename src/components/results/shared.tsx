"use client";

import { Fragment, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LegalStatus, Likelihood, UrgencyLevel } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Animated section wrapper                                            */
/* ------------------------------------------------------------------ */

export interface SectionProps {
  /** Anchor id, used by the sticky sidebar nav. */
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * A section that fades/slides up the first time it scrolls into view.
 * `scroll-mt-24` keeps anchored sections clear of the sticky navbar.
 */
export function Section({ id, className = "", children }: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`scroll-mt-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Section heading                                                     */
/* ------------------------------------------------------------------ */

export interface SectionHeadingProps {
  icon?: ReactNode;
  children: ReactNode;
}

export function SectionHeading({ icon, children }: SectionHeadingProps) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight sm:text-2xl">
      {icon ? <span className="text-accent">{icon}</span> : null}
      {children}
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status + urgency styling                                            */
/* ------------------------------------------------------------------ */

export interface BadgeStyle {
  label: string;
  /** Tailwind classes for text / background / border tints. */
  className: string;
  /** Bare hex for timeline dots and accent rails. */
  dot: string;
}

export const STATUS_STYLES: Record<LegalStatus, BadgeStyle> = {
  valid: {
    label: "Valid",
    className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
    dot: "#34d399",
  },
  potentially_invalid: {
    label: "Potentially Invalid",
    className: "text-red-300 bg-red-500/10 border-red-500/30",
    dot: "#f87171",
  },
  requires_review: {
    label: "Requires Review",
    className: "text-accent bg-accent/10 border-accent/30",
    dot: "#f59e0b",
  },
  standard_procedure: {
    label: "Standard",
    className: "text-sky-300 bg-sky-500/10 border-sky-500/30",
    dot: "#38bdf8",
  },
};

export const URGENCY_STYLES: Record<UrgencyLevel, BadgeStyle> = {
  critical: {
    label: "Critical",
    className: "text-red-300 bg-red-500/10 border-red-500/30",
    dot: "#f87171",
  },
  high: {
    label: "High",
    className: "text-accent bg-accent/10 border-accent/30",
    dot: "#f59e0b",
  },
  medium: {
    label: "Medium",
    className: "text-sky-300 bg-sky-500/10 border-sky-500/30",
    dot: "#38bdf8",
  },
  low: {
    label: "Low",
    className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
    dot: "#34d399",
  },
};

export const LIKELIHOOD_STYLES: Record<Likelihood, BadgeStyle> = {
  high: {
    label: "High",
    className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
    dot: "#34d399",
  },
  medium: {
    label: "Medium",
    className: "text-accent bg-accent/10 border-accent/30",
    dot: "#f59e0b",
  },
  low: {
    label: "Low",
    className: "text-red-300 bg-red-500/10 border-red-500/30",
    dot: "#f87171",
  },
  unknown: {
    label: "Unknown",
    className: "text-muted bg-surface-hover border-border",
    dot: "#94a3b8",
  },
};

/* ------------------------------------------------------------------ */
/* Pill                                                                */
/* ------------------------------------------------------------------ */

export interface PillProps {
  className?: string;
  children: ReactNode;
}

export function Pill({ className = "", children }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Statute citation highlighting                                       */
/* ------------------------------------------------------------------ */

// Matches "California Civil Code §1946.2(d)", "Code of Civil Procedure §1161",
// or a bare "§1161" — longest alternative first so full citations win.
const CITATION_RE =
  /((?:(?:California|Cal\.?)\s+)?(?:Civil Code|Code of Civil Procedure)\s+§\s?\d+(?:\.\d+)*(?:\([a-z0-9]+\))?|§\s?\d+(?:\.\d+)*(?:\([a-z0-9]+\))?)/gi;

/**
 * Splits `text` on statute citations and renders the citations in amber.
 * Relies on `String.split` with a single capturing group, where matched
 * delimiters land on odd indices of the resulting array.
 */
export function highlightStatutes(text: string): ReactNode[] {
  return text.split(CITATION_RE).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold text-accent">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}
