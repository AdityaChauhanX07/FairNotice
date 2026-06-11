"use client";

import { useEffect, useState } from "react";
import type { ResultsViewModel } from "@/lib/results-adapter";
import { Block, ChevIcon } from "./shared";

const LEVEL_BADGE: Record<"High" | "Moderate" | "Low", string> = {
  High: "b-teal",
  Moderate: "b-amber",
  Low: "b-red",
};
const LEVEL_COLOR: Record<"High" | "Moderate" | "Low", string> = {
  High: "var(--accent)",
  Moderate: "var(--amber)",
  Low: "var(--red)",
};
const CONF_SUMMARY: Record<"High" | "Moderate" | "Low", string> = {
  High: "Your claims matched well to specific statutes and no out-of-scope issues were found. You can rely on this as a strong starting point.",
  Moderate:
    "Some aspects of this document could not be fully verified against our statute store. Treat this as guidance and confirm the details that matter.",
  Low: "This analysis has significant gaps. Speak with a licensed attorney before acting on it.",
};

const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;

export function ConfidenceSection({
  index,
  confidence,
}: {
  index: number;
  confidence: ResultsViewModel["confidence"];
}) {
  const [open, setOpen] = useState(false);
  const target = CIRC * (1 - confidence.score / 100);
  const [ringOffset, setRingOffset] = useState(CIRC);

  useEffect(() => {
    const id = requestAnimationFrame(() => setRingOffset(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <Block index={index} id="confidence" title="How much to trust this">
      <div className="conf">
        <div className="conf-ring">
          <svg width="116" height="116" viewBox="0 0 116 116">
            <circle cx="58" cy="58" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="9" />
            <circle
              className="ring-fg"
              cx="58"
              cy="58"
              r={RADIUS}
              fill="none"
              stroke={LEVEL_COLOR[confidence.level]}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={CIRC.toFixed(1)}
              strokeDashoffset={ringOffset.toFixed(1)}
              transform="rotate(-90 58 58)"
            />
          </svg>
          <div className="cscore">
            <b>{confidence.score}</b>
            <span>/ 100</span>
          </div>
        </div>

        <div className="conf-body">
          <div className="c-level">
            <span className="lv">{confidence.level} confidence</span>
            <span className={`badge ${LEVEL_BADGE[confidence.level]} no-dot`}>
              {confidence.level}
            </span>
          </div>
          <p>{CONF_SUMMARY[confidence.level]}</p>
          <button
            type="button"
            className={`conf-toggle${open ? " open" : ""}`}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Hide the breakdown " : "Show the breakdown "}
            <ChevIcon />
          </button>
        </div>

        <div className={`conf-factors${open ? " open" : ""}`}>
          {confidence.factors.map((f, i) => (
            <div className={`factor ${f.status}`} key={i}>
              <span className="f-dot" />
              <div>
                <div className="f-name">{f.name}</div>
                <div className="f-detail">{f.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {confidence.disclaimers.length > 0 ? (
          <div className="conf-disclaimers">
            {confidence.disclaimers.map((d, i) => (
              <div className="cd" key={i}>
                {d}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Block>
  );
}
