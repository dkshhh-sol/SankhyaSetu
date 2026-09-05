"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { DIFFICULTY_WEIGHT } from "@/lib/onboarding/engine";

/** The chain from role to recommendation, shown as compact chips. */
const CHAIN = [
  "Role",
  "Required competencies",
  "Competency-tagged questions",
  "Assessment performance",
  "Current competency",
  "Skill gap",
  "Recommendation",
];

/**
 * "How your competency was calculated" — the explainability panel.
 *
 * Exists because competency numbers shown without their derivation are not
 * defensible. Collapsed by default so it never dominates a step.
 */
export function HowCalculated({
  className,
  defaultOpen = false,
}: {
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("rounded-xl border border-brand-100 bg-brand-50/60", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left"
      >
        <Info className="size-4 shrink-0 text-brand-600" aria-hidden />
        <span className="flex-1 text-[13px] font-semibold text-brand-800">
          How your competency was calculated
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-brand-600 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div className="border-t border-brand-100 px-3 py-3">
          {/* Role -> ... -> Recommendation */}
          <ol className="flex flex-wrap items-center gap-1.5">
            {CHAIN.map((c, i) => (
              <li key={c} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-xs text-brand-300" aria-hidden>&rarr;</span>}
                <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100">
                  {c}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-3 space-y-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            <p>
              Every question in the baseline assessment is tagged with the competency it measures
              and a difficulty. Difficulty sets the question&apos;s weight:{" "}
              <span className="font-semibold text-ink">Easy {DIFFICULTY_WEIGHT.Easy}</span>,{" "}
              <span className="font-semibold text-ink">Medium {DIFFICULTY_WEIGHT.Medium}</span>,{" "}
              <span className="font-semibold text-ink">Hard {DIFFICULTY_WEIGHT.Hard}</span>.
            </p>
            <p>
              Performance for a competency is the share of that weight you answered correctly, and
              it maps linearly onto the 1.0 - 5.0 proficiency scale:
            </p>
            <p className="rounded-lg bg-white px-2.5 py-1.5 font-mono text-[11.5px] text-ink ring-1 ring-brand-100">
              level = 1.0 + 4.0 x (weight correct / weight asked)
            </p>
            <p>
              Your role sets the required level for each competency. The gap is{" "}
              <span className="font-medium text-ink">required - current</span>, and the largest gaps
              drive the learning recommendations.
            </p>
            <p className="pt-0.5 text-[12px] text-ink-muted">
              This is a deterministic competency scoring engine — the same answers always produce
              the same profile. No predictive model is involved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
