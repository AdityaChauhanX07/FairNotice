"use client";

import { Shield, CheckCircle, AlertOctagon } from "lucide-react";
import { Card, Section, SectionHeading, highlightStatutes } from "./shared";

/* ------------------------------------------------------------------ */
/* Your Rights                                                         */
/* ------------------------------------------------------------------ */

export function Rights({ rights }: { rights: string[] }) {
  if (rights.length === 0) return null;

  return (
    <Section id="rights">
      <SectionHeading icon={<Shield className="h-5 w-5" />}>
        Rights You Should Know About
      </SectionHeading>

      <div className="mt-6 space-y-3">
        {rights.map((right, i) => (
          <Card key={i} className="flex gap-3 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-sm leading-relaxed text-foreground/90">
              {highlightStatutes(right)}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Red Flags                                                           */
/* ------------------------------------------------------------------ */

export function RedFlags({ flags }: { flags: string[] }) {
  if (flags.length === 0) return null;

  return (
    <Section id="red-flags">
      <SectionHeading icon={<AlertOctagon className="h-5 w-5" />}>
        Things That Don&apos;t Look Right
      </SectionHeading>

      <div className="mt-6 space-y-3">
        {flags.map((flag, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-4"
          >
            <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm leading-relaxed text-foreground/90">
              {highlightStatutes(flag)}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
