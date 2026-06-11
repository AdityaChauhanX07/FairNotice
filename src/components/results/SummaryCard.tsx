import type { ResultsViewModel } from "@/lib/results-adapter";
import { Block, ShieldIcon } from "./shared";

function Cell({ l, v }: { l: string; v: string }) {
  return (
    <div className="meta-cell">
      <div className="l">{l}</div>
      <div className="v">{v}</div>
    </div>
  );
}

export function SummaryCard({
  index,
  header,
  summary,
}: {
  index: number;
  header: ResultsViewModel["header"];
  summary: ResultsViewModel["summary"];
}) {
  return (
    <Block index={index} id="summary" title="What you received">
      <p className="summary-text">{summary.text}</p>
      <div className="meta-grid">
        <Cell l="Document" v={header.documentType} />
        <Cell l="From" v={header.sender} />
        <Cell l="Date issued" v={header.dateIssued} />
        <Cell l="Jurisdiction" v={header.jurisdiction} />
      </div>
      {summary.emotionalReassurance ? (
        <div className="reassure-note">
          <ShieldIcon />
          <p>{summary.emotionalReassurance}</p>
        </div>
      ) : null}
    </Block>
  );
}
