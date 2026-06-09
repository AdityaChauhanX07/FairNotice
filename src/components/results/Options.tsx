"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import type { UserOption } from "@/lib/types";
import {
  LIKELIHOOD_STYLES,
  Pill,
  Section,
  SectionHeading,
} from "./shared";

export interface OptionsProps {
  options: UserOption[];
}

export function Options({ options }: OptionsProps) {
  if (options.length === 0) return null;

  return (
    <Section id="options">
      <SectionHeading icon={<ArrowRight className="h-5 w-5" />}>
        What You Can Do
      </SectionHeading>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const likelihood = LIKELIHOOD_STYLES[option.likelihood_of_success];
          return (
            <motion.div
              key={option.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`group flex cursor-pointer flex-col rounded-2xl border bg-surface p-5 transition-colors ${
                option.recommended
                  ? "border-accent/40"
                  : "border-border hover:border-accent/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground">
                  {option.title}
                </h3>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {option.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {option.recommended ? (
                  <Pill className="border-accent/40 bg-accent/15 text-accent">
                    <Star className="h-3 w-3 fill-current" />
                    Recommended
                  </Pill>
                ) : null}
                <Pill className={likelihood.className}>
                  {likelihood.label} likelihood
                </Pill>
                {option.statute_basis ? (
                  <span className="text-xs text-muted/80">
                    {option.statute_basis}
                  </span>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
