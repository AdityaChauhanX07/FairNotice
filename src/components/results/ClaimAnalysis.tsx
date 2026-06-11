"use client";

import { useState } from "react";
import type { ResultsViewModel, VMClaim } from "@/lib/results-adapter";
import {
  ArrowRIcon,
  Block,
  ChevIcon,
  InfoIcon,
  Statute,
  STATUS_CLASS,
} from "./shared";

function ClaimCard({
  claim,
  open,
  onToggle,
}: {
  claim: VMClaim;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`claim${open ? " open" : ""}`}>
      <button
        type="button"
        className="claim-bar"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className={`badge ${STATUS_CLASS[claim.status]}`}>
          {claim.statusLabel}
        </span>
        <span className="c-q">{claim.claim}</span>
        <span className="c-chev">
          <ChevIcon />
        </span>
      </button>
      <div className="claim-body">
        <div>
          <div className="claim-inner">
            <div className="ci-label">What the document says</div>
            <div className="ci-doc">{claim.claim}</div>

            <div className="ci-label">What this means for you</div>
            <div className="ci-analysis">{claim.analysis}</div>

            <div className="ci-label">What the law says</div>
            {claim.statutes.length > 0 ? (
              <div className="claim-statutes">
                {claim.statutes.map((s, i) => (
                  <div className="claim-statute" key={i}>
                    <div className="cs-top">
                      <Statute num={s.num} supports={s.supports} />
                    </div>
                    <div className="cs-rel">{s.relevance}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="statute-none">
                <InfoIcon />
                No statute found in our database addressing this. Consult a local
                attorney.
              </div>
            )}

            <div className="claim-action">
              <ArrowRIcon />
              <div>
                <div className="ca-l">What you should do</div>
                <p>{claim.action}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClaimAnalysis({
  index,
  claims,
}: {
  index: number;
  claims: ResultsViewModel["claims"];
}) {
  // First claim open by default to invite interaction.
  const [openId, setOpenId] = useState<number | null>(claims[0]?.id ?? null);

  if (claims.length === 0) return null;

  return (
    <Block
      index={index}
      id="claims"
      title="Claim by claim"
      sub="Tap any claim to expand"
    >
      <div className="claims">
        {claims.map((c) => (
          <ClaimCard
            key={c.id}
            claim={c}
            open={openId === c.id}
            onToggle={() =>
              setOpenId((prev) => (prev === c.id ? null : c.id))
            }
          />
        ))}
      </div>
    </Block>
  );
}
