"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield,
  ShieldAlert,
  ShieldX,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import type {
  ConfidenceFactorStatus,
  ConfidenceLevel,
  ConfidenceReport,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Level + status styling                                              */
/* ------------------------------------------------------------------ */

interface LevelStyle {
  icon: LucideIcon;
  title: string;
  tint: string;
  iconColor: string;
  bar: string;
}

const LEVEL_STYLES: Record<ConfidenceLevel, LevelStyle> = {
  high: {
    icon: Shield,
    title: "High Confidence Analysis",
    tint: "border-emerald-500/40 bg-emerald-500/10",
    iconColor: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  medium: {
    icon: ShieldAlert,
    title: "Moderate Confidence — Review Recommended",
    tint: "border-accent/40 bg-accent/10",
    iconColor: "text-accent",
    bar: "bg-accent",
  },
  low: {
    icon: ShieldX,
    title: "Low Confidence — Professional Help Recommended",
    tint: "border-red-500/40 bg-red-500/10",
    iconColor: "text-red-400",
    bar: "bg-red-500",
  },
};

const FACTOR_ICONS: Record<
  ConfidenceFactorStatus,
  { icon: LucideIcon; color: string }
> = {
  positive: { icon: CheckCircle, color: "text-emerald-400" },
  warning: { icon: AlertTriangle, color: "text-accent" },
  negative: { icon: XCircle, color: "text-red-400" },
};

/* ------------------------------------------------------------------ */
/* Banner                                                              */
/* ------------------------------------------------------------------ */

export function ConfidenceBanner({ report }: { report: ConfidenceReport }) {
  const [open, setOpen] = useState(false);

  const level = LEVEL_STYLES[report.overall];
  const LevelIcon = level.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
      className={`rounded-2xl border ${level.tint}`}
    >
      {/* Header — clickable to toggle the factor breakdown. */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <LevelIcon className={`h-7 w-7 shrink-0 ${level.iconColor}`} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-foreground sm:text-base">
              {level.title}
            </h2>
            <span className="shrink-0 text-sm font-semibold text-muted tabular-nums">
              {report.overallScore}
              <span className="text-xs">/100</span>
            </span>
          </div>

          {/* Score bar. */}
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${report.overallScore}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
              className={`h-full rounded-full ${level.bar}`}
            />
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Collapsible factor breakdown. */}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="factors"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="space-y-3 border-t border-border/60 px-5 py-4">
              {report.factors.map((factor) => {
                const fi = FACTOR_ICONS[factor.status];
                const FactorIcon = fi.icon;
                return (
                  <li key={factor.factor} className="flex items-start gap-3">
                    <FactorIcon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${fi.color}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {factor.factor}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">
                        {factor.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Disclaimers — always visible. */}
      {report.disclaimers.length > 0 ? (
        <div className="space-y-1.5 border-t border-border/60 px-5 py-4">
          {report.disclaimers.map((disclaimer) => (
            <p
              key={disclaimer}
              className="text-xs leading-relaxed text-muted"
            >
              {disclaimer}
            </p>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
