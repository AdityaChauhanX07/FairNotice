"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LifeBuoy, BookOpen, ChevronDown, MapPin } from "lucide-react";
import type { KeyTerm, Resource, ResourceType } from "@/lib/types";
import { Card, Pill, Section, SectionHeading } from "./shared";

/* ------------------------------------------------------------------ */
/* Resources                                                           */
/* ------------------------------------------------------------------ */

const RESOURCE_TYPE_STYLES: Record<
  ResourceType,
  { label: string; className: string }
> = {
  legal_aid: {
    label: "Legal Aid",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  hotline: {
    label: "Hotline",
    className: "border-red-500/30 bg-red-500/10 text-red-300",
  },
  government: {
    label: "Government",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  nonprofit: {
    label: "Nonprofit",
    className: "border-accent/30 bg-accent/10 text-accent",
  },
};

export function Resources({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) return null;

  return (
    <Section id="resources">
      <SectionHeading icon={<LifeBuoy className="h-5 w-5" />}>
        Where To Get Help
      </SectionHeading>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {resources.map((resource) => {
          const type = RESOURCE_TYPE_STYLES[resource.type];
          return (
            <Card key={resource.name} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground">
                  {resource.name}
                </h3>
                <Pill className={type.className}>{type.label}</Pill>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {resource.description}
              </p>
              <p className="mt-3 text-sm font-medium text-foreground/90">
                {resource.contact}
              </p>
              {resource.jurisdiction_specific ? (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  <MapPin className="h-3 w-3" />
                  California-specific
                </span>
              ) : null}
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Glossary                                                            */
/* ------------------------------------------------------------------ */

export function Glossary({ terms }: { terms: KeyTerm[] }) {
  const [open, setOpen] = useState(false);

  if (terms.length === 0) return null;

  return (
    <Section id="glossary">
      <Card className="overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 p-5 text-left"
        >
          <SectionHeading icon={<BookOpen className="h-5 w-5" />}>
            Legal Terms Explained
          </SectionHeading>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="terms"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <dl className="divide-y divide-border border-t border-border">
                {terms.map((term) => (
                  <div key={term.term} className="px-5 py-4">
                    <dt className="text-sm font-semibold text-accent">
                      {term.term}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted">
                      {term.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>
    </Section>
  );
}
