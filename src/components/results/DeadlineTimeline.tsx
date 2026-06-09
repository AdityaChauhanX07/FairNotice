"use client";

import { Clock } from "lucide-react";
import type { TimelineEntry } from "@/lib/types";
import {
  Card,
  Pill,
  Section,
  SectionHeading,
  URGENCY_STYLES,
} from "./shared";

function whenLabel(entry: TimelineEntry): string {
  if (entry.date) {
    const parsed = new Date(entry.date);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    }
  }
  if (entry.days_remaining != null) {
    return `${entry.days_remaining} day${
      entry.days_remaining === 1 ? "" : "s"
    } from notice`;
  }
  return "Timing varies";
}

export interface DeadlineTimelineProps {
  timeline: TimelineEntry[];
}

export function DeadlineTimeline({ timeline }: DeadlineTimelineProps) {
  if (timeline.length === 0) return null;

  return (
    <Section id="deadlines">
      <SectionHeading icon={<Clock className="h-5 w-5" />}>
        Your Deadlines
      </SectionHeading>

      <div className="relative mt-6 pl-2">
        {/* Vertical rail */}
        <div className="absolute bottom-2 left-[11px] top-2 w-px bg-border" />

        <ol className="space-y-5">
          {timeline.map((entry, i) => {
            const style = URGENCY_STYLES[entry.urgency];
            return (
              <li key={i} className="relative pl-8">
                {/* Node */}
                <span
                  className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full border-2 border-background"
                  style={{ backgroundColor: style.dot }}
                />
                <Card className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {whenLabel(entry)}
                    </span>
                    <Pill className={style.className}>{style.label}</Pill>
                  </div>
                  <p className="mt-2 font-semibold text-foreground">
                    {entry.action}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {entry.detail}
                  </p>
                  {entry.statute_basis ? (
                    <p className="mt-2 text-xs text-muted/80">
                      Basis:{" "}
                      <span className="text-accent/90">
                        {entry.statute_basis}
                      </span>
                    </p>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
