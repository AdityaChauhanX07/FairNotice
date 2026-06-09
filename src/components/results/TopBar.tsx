"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { DocumentType } from "@/lib/types";
import { Pill } from "./shared";

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  eviction_notice: "Eviction Notice",
  insurance_denial: "Insurance Denial",
  benefits_termination: "Benefits Termination",
  court_summons: "Court Summons",
  medical_bill: "Medical Bill",
  other: "Document",
};

export interface TopBarProps {
  documentType: DocumentType;
  processingTime: number;
  statutesReferenced: number;
}

export function TopBar({
  documentType,
  processingTime,
  statutesReferenced,
}: TopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href="/upload"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to upload
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Pill className="border-accent/30 bg-accent/10 text-accent">
          {DOC_TYPE_LABELS[documentType]}
        </Pill>
        <p className="text-sm text-muted">
          Analyzed in {processingTime.toFixed(1)}s
          <span className="mx-1.5 text-border">•</span>
          {statutesReferenced} statutes referenced
        </p>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Your Analysis
      </h1>
    </motion.div>
  );
}
