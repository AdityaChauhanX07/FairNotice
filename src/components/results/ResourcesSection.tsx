import type { ResultsViewModel } from "@/lib/results-adapter";
import type { ResourceType } from "@/lib/types";
import { Block, PhoneIcon, PinIcon } from "./shared";

const RES_TYPE: Record<ResourceType, { label: string; cls: string }> = {
  legal_aid: { label: "Legal Aid", cls: "b-teal" },
  hotline: { label: "Hotline", cls: "b-amber" },
  government: { label: "Government", cls: "b-slate" },
  nonprofit: { label: "Nonprofit", cls: "b-teal" },
};

/** The bare resources grid — reused by the safety/refusal view. */
export function ResourceList({
  resources,
}: {
  resources: ResultsViewModel["resources"];
}) {
  return (
    <div className="resources">
      {resources.map((r) => {
        const t = RES_TYPE[r.type] ?? { label: r.type, cls: "b-slate" };
        return (
          <div className="resource" key={r.name}>
            <div className="r-top">
              <h3>{r.name}</h3>
              <span className={`badge ${t.cls} no-dot`}>{t.label}</span>
            </div>
            <p>{r.description}</p>
            <div className="r-contact">
              <PhoneIcon />
              {r.contact}
            </div>
            {r.local ? (
              <div className="r-local">
                <PinIcon />
                Location-specific
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ResourcesSection({
  index,
  resources,
}: {
  index: number;
  resources: ResultsViewModel["resources"];
}) {
  if (resources.length === 0) return null;
  return (
    <Block index={index} id="resources" title="Where to get help">
      <ResourceList resources={resources} />
    </Block>
  );
}
