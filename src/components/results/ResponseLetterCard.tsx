"use client";

import { useState } from "react";
import { FileEdit, Copy, Check, Download } from "lucide-react";
import type { ResponseLetter } from "@/lib/types";
import { Card, Section, SectionHeading, highlightStatutes } from "./shared";

/** Flattens the structured letter into plain text for copy/download. */
function letterToText(letter: ResponseLetter): string {
  return [
    `To: ${letter.to}`,
    `From: ${letter.from}`,
    `Date: ${letter.date}`,
    `Subject: ${letter.subject}`,
    "",
    letter.body,
    "",
    letter.closing,
  ].join("\n");
}

export interface ResponseLetterCardProps {
  letter: ResponseLetter;
}

export function ResponseLetterCard({ letter }: ResponseLetterCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letterToText(letter));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([letterToText(letter)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "response-letter.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Section id="letter">
      <SectionHeading icon={<FileEdit className="h-5 w-5" />}>
        Your Draft Response Letter
      </SectionHeading>

      <Card className="mt-6 overflow-hidden">
        {/* Header block */}
        <div className="grid grid-cols-1 gap-y-2 border-b border-border bg-surface-hover/40 p-5 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
          <span className="font-semibold text-muted">To</span>
          <span className="text-foreground">{letter.to}</span>
          <span className="font-semibold text-muted">From</span>
          <span className="text-foreground">{letter.from}</span>
          <span className="font-semibold text-muted">Date</span>
          <span className="text-foreground">{letter.date}</span>
          <span className="font-semibold text-muted">Subject</span>
          <span className="font-medium text-foreground">{letter.subject}</span>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5 sm:p-6">
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {highlightStatutes(letter.body)}
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {letter.closing}
          </p>
        </div>
      </Card>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background shadow-lg shadow-accent/20 transition-colors hover:bg-accent-hover"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-surface-hover"
        >
          <Download className="h-4 w-4" />
          Download as TXT
        </button>
      </div>

      <p className="mt-3 text-xs text-muted">
        This is a starting point. Review and personalize before sending.
      </p>
    </Section>
  );
}
