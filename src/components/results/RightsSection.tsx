import type { ResultsViewModel } from "@/lib/results-adapter";
import { Block, CheckIcon, FlagIcon } from "./shared";

export function RightsSection({
  index,
  rights,
}: {
  index: number;
  rights: string[];
}) {
  if (rights.length === 0) return null;
  return (
    <Block index={index} id="rights" title="Rights you may have">
      <div className="rights">
        {rights.map((r, i) => (
          <div className="right-item" key={i}>
            <span className="ri-ic">
              <CheckIcon />
            </span>
            <div className="ri-text">{r}</div>
          </div>
        ))}
      </div>
    </Block>
  );
}

export function RedFlags({
  index,
  flags,
}: {
  index: number;
  flags: ResultsViewModel["redFlags"];
}) {
  if (flags.length === 0) return null;
  return (
    <Block index={index} id="flags" title="What looks wrong">
      <div className="flags">
        {flags.map((f, i) => (
          <div className="flag-row" key={i}>
            <span className="fl-ic">
              <FlagIcon />
            </span>
            <div>
              <div className="fl-title">{f.title}</div>
              {f.text ? <div className="fl-text">{f.text}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </Block>
  );
}
