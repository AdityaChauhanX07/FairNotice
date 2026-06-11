"use client";

import toast from "react-hot-toast";
import type { ResultsViewModel, VMLetter } from "@/lib/results-adapter";
import {
  Block,
  CopyIcon,
  DownloadIcon,
  InfoIcon,
  highlightCitations,
} from "./shared";

function letterToText(L: VMLetter): string {
  return [
    `TO:   ${L.to}`,
    `FROM: ${L.from}`,
    `DATE: ${L.date}`,
    `RE:   ${L.subject}`,
    "",
    L.paragraphs.join("\n\n"),
    "",
    L.closing,
  ].join("\n");
}

export function ResponseLetter({
  index,
  letter,
}: {
  index: number;
  letter: ResultsViewModel["letter"];
}) {
  // Hidden entirely for safety-routed (referral-only) results.
  if (letter.paragraphs.length === 0) return null;

  const text = letterToText(letter);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      ta.remove();
    }
    toast.success("Letter copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fairnotice-response-letter.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Letter downloaded");
  };

  return (
    <Block index={index} id="letter" title="Your draft response">
      <div className="letter">
        <div className="letter-toolbar">
          <span className="lt-label">Draft · English</span>
          <div className="letter-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopy}>
              <CopyIcon /> Copy
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleDownload}>
              <DownloadIcon /> Download .txt
            </button>
          </div>
        </div>
        <div className="letter-body">
          <div className="lh">
            <div>
              <span className="k">TO</span> {letter.to}
            </div>
            <div>
              <span className="k">FROM</span> {letter.from}
            </div>
            <div>
              <span className="k">DATE</span> {letter.date}
            </div>
            <div>
              <span className="k">RE</span> {letter.subject}
            </div>
          </div>
          {letter.paragraphs.map((p, i) => (
            <p key={i}>{highlightCitations(p)}</p>
          ))}
          <p>{letter.closing}</p>
        </div>
        <div className="letter-note">
          <InfoIcon />
          This is a starting point. Read it, fill in the brackets, and review it
          before sending. It is not legal advice.
        </div>
      </div>
    </Block>
  );
}
