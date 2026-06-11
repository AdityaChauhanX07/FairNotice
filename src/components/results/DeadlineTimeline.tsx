import type { ResultsViewModel } from "@/lib/results-adapter";
import type { UrgencyLevel } from "@/lib/types";
import { Block, Statute } from "./shared";

function urgencyBadge(u: UrgencyLevel): string {
  if (u === "critical") return "b-red";
  if (u === "high") return "b-amber";
  return "b-slate";
}

export function DeadlineTimeline({
  index,
  deadlines,
}: {
  index: number;
  deadlines: ResultsViewModel["deadlines"];
}) {
  if (deadlines.length === 0) return null;

  return (
    <Block index={index} id="deadlines" title="Dates that matter">
      <div className="timeline">
        {deadlines.map((d, i) => (
          <div className={`tl-item ${d.urgency}`} key={i}>
            <div className="tl-top">
              <span className="tl-date">{d.date}</span>
              <span className={`badge ${urgencyBadge(d.urgency)}`}>
                {d.urgency}
              </span>
            </div>
            <div className="tl-action">{d.action}</div>
            <div className="tl-detail">{d.detail}</div>
            {d.statute ? (
              <div className="tl-statute">
                <Statute num={d.statute} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Block>
  );
}
