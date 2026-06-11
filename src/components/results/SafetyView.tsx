import type { ResultsViewModel } from "@/lib/results-adapter";
import { AlertIcon, LockIcon } from "./shared";
import { ResourceList } from "./ResourcesSection";

/**
 * Referral-only view shown when the document trips a safety flag. No claim
 * analysis, no confidence score, no draft letter — just a prominent referral
 * and a curated list of where to get real help.
 */
export function SafetyView({ vm }: { vm: ResultsViewModel }) {
  return (
    <div className="safety">
      <div className="safety-banner">
        <div className="sb-ic">
          <AlertIcon />
        </div>
        <div>
          <div className="sb-eyebrow">We are not analyzing this in detail</div>
          <h1>This needs a real person, today.</h1>
        </div>
      </div>

      <div className="safety-why">
        <h2>Why</h2>
        <p>{vm.overallAssessment}</p>
      </div>

      {vm.summary.emotionalReassurance ? (
        <div className="safety-reassure">{vm.summary.emotionalReassurance}</div>
      ) : null}

      {vm.resources.length > 0 ? (
        <div className="block" style={{ borderTop: "none" }}>
          <div className="block-head">
            <span className="b-ix">01</span>
            <h2>Where to get help, now</h2>
          </div>
          <ResourceList resources={vm.resources} />
        </div>
      ) : null}

      <div className="res-footer">
        <LockIcon />
        <p>
          FairNotice processes documents in memory and never stores them. This
          refusal is intentional. For matters like this, a qualified
          professional is the right next step.
        </p>
      </div>
    </div>
  );
}
