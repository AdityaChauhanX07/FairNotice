"use client";

import { useState } from "react";
import type { ResultsViewModel } from "@/lib/results-adapter";
import { Block, ChevIcon } from "./shared";

function GlossItem({ term, def }: { term: string; def: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`gloss${open ? " open" : ""}`}>
      <button
        type="button"
        className="gloss-bar"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="g-term">{term}</span>
        <span className="g-chev">
          <ChevIcon />
        </span>
      </button>
      <div className="gloss-def">
        <div>
          <p>{def}</p>
        </div>
      </div>
    </div>
  );
}

export function GlossarySection({
  index,
  glossary,
}: {
  index: number;
  glossary: ResultsViewModel["glossary"];
}) {
  if (glossary.length === 0) return null;
  return (
    <Block index={index} id="glossary" title="Legal terms, explained">
      <div className="glossary">
        {glossary.map((g) => (
          <GlossItem key={g.term} term={g.term} def={g.def} />
        ))}
      </div>
    </Block>
  );
}
