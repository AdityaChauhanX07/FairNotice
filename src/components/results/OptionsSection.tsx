import type { ResultsViewModel } from "@/lib/results-adapter";
import type { Likelihood } from "@/lib/types";
import { Block, Statute } from "./shared";

const LIKELIHOOD_LABEL: Record<Likelihood, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  unknown: "Unknown",
};

function LikelihoodBadge({ l }: { l: Likelihood }) {
  return (
    <span className={`likelihood ${l}`}>
      <span className="lk-bars">
        <i />
        <i />
        <i />
      </span>
      {LIKELIHOOD_LABEL[l]} chance
    </span>
  );
}

export function OptionsSection({
  index,
  options,
}: {
  index: number;
  options: ResultsViewModel["options"];
}) {
  if (options.length === 0) return null;

  return (
    <Block index={index} id="options" title="What you can do">
      <div className="options">
        {options.map((o) => (
          <div className={`option${o.recommended ? " rec" : ""}`} key={o.id}>
            {o.recommended ? <span className="o-rec">Recommended</span> : null}
            <div className="o-top">
              <h3>{o.title}</h3>
            </div>
            <p>{o.description}</p>
            <div
              className="o-top"
              style={{ marginTop: 14, marginBottom: 0, alignItems: "center" }}
            >
              <LikelihoodBadge l={o.likelihood} />
              {o.statute ? (
                <span className="o-statute">
                  <Statute num={o.statute} />
                </span>
              ) : (
                <span />
              )}
            </div>
          </div>
        ))}
      </div>
    </Block>
  );
}
