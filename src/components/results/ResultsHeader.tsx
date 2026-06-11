import Link from "next/link";
import type { ResultsViewModel } from "@/lib/results-adapter";
import { ArrowRIcon } from "./shared";

export function ResultsHeader({
  header,
}: {
  header: ResultsViewModel["header"];
}) {
  return (
    <div className="res-header">
      <div>
        <div className="rh-top">
          <span className="rh-type">{header.documentType}</span>
        </div>
        <div className="rh-sender">
          {header.sender} · {header.dateIssued}
        </div>
        <div className="rh-meta">
          <div className="m">
            <div className="v">{header.claimsReviewed}</div>
            <div className="l">Claims reviewed</div>
          </div>
          <div className="m">
            <div className="v">{header.statutesReferenced}</div>
            <div className="l">Statutes referenced</div>
          </div>
          <div className="m">
            <div className="v">{header.processingTime}s</div>
            <div className="l">Analysis time</div>
          </div>
        </div>
      </div>
      <Link className="btn btn-ghost btn-sm" href="/upload">
        <ArrowRIcon /> New document
      </Link>
    </div>
  );
}
