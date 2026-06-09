"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { UrgencyLevel } from "@/lib/types";

export interface AlertBannerProps {
  urgency: UrgencyLevel;
  assessment: string;
  referralNeeded: boolean;
}

/**
 * Prominent banner shown only for critical/high urgency. Critical reads red;
 * high reads amber.
 */
export function AlertBanner({
  urgency,
  assessment,
  referralNeeded,
}: AlertBannerProps) {
  if (urgency !== "critical" && urgency !== "high") return null;

  const isCritical = urgency === "critical";
  const tint = isCritical
    ? "border-red-500/40 bg-red-500/10"
    : "border-accent/40 bg-accent/10";
  const iconColor = isCritical ? "text-red-400" : "text-accent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
      className={`flex gap-4 rounded-2xl border p-5 ${tint}`}
      role="alert"
    >
      <AlertTriangle className={`mt-0.5 h-6 w-6 shrink-0 ${iconColor}`} />
      <div className="space-y-2">
        <p className="text-sm leading-relaxed text-foreground sm:text-base">
          {assessment}
        </p>
        {referralNeeded ? (
          <p className="text-sm font-semibold text-foreground">
            ⚠ We recommend consulting a legal professional for this matter.
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
