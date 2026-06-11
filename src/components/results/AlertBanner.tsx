import type { UrgencyLevel } from "@/lib/types";
import { AlertIcon, Block, ScaleIcon } from "./shared";

export function AlertBanner({
  index,
  urgency,
  assessment,
  referralNeeded,
  referralReason,
}: {
  index: number;
  urgency: UrgencyLevel;
  assessment: string;
  referralNeeded: boolean;
  referralReason: string | null;
}) {
  if (urgency !== "critical" && urgency !== "high") return null;
  const crit = urgency === "critical";

  return (
    <Block index={index} id="assessment" title="Overall assessment">
      <div className={`alert${crit ? " crit" : ""}`} role="alert">
        <div className="a-ic">
          <AlertIcon />
        </div>
        <div>
          <div className="a-title">{crit ? "Urgent" : "Action needed"}</div>
          <div className="a-text">{assessment}</div>
          {referralNeeded ? (
            <div className="a-ref">
              <ScaleIcon />
              {referralReason ??
                "We recommend consulting a legal professional for this matter."}
            </div>
          ) : null}
        </div>
      </div>
    </Block>
  );
}
