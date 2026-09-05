"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { HowCalculated } from "@/components/onboarding/HowCalculated";
import { Button } from "@/components/ui/Button";
import { Donut } from "@/components/ui/Donut";
import { ProgressBar, toneForLevel } from "@/components/ui/ProgressBar";
import { proficiencyBand } from "@/lib/onboarding/engine";
import { useOnboardingGuard, onboardingLoadingClass } from "@/lib/onboarding/useOnboardingGuard";

/**
 * Step 4 — assessment results.
 *
 * Deliberately sits between submitting and the recommendations: the official
 * sees the score and, more importantly, where each competency number came
 * from before anything is recommended to them.
 */
export default function OnboardingResultsPage() {
  const router = useRouter();
  const { ready, onboarding } = useOnboardingGuard("result");

  if (!ready) {
    return (
      <div className={onboardingLoadingClass()}>
        <span
          className="size-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600"
          aria-label="Loading"
        />
      </div>
    );
  }

  const result = onboarding.result!;

  return (
    <OnboardingFrame
      step={4}
      wide
      title="Assessment Complete"
      subtitle={`Scored against the competency requirements for ${result.roleName}.`}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={() => router.push("/onboarding/competency-profile")}
            rightIcon={<ArrowRight className="size-4" />}
          >
            View Competency Profile
          </Button>
        </div>
      }
    >
      {/* Headline */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-3">
        <Donut value={result.overallPct / 100} size={68} stroke={7} color="#16a34a" track="#e5e7eb">
          <span className="font-display text-xl font-bold leading-none text-ink">{result.overallPct}%</span>
        </Donut>
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600">
            <CheckCircle2 className="size-4" aria-hidden /> Baseline assessment complete
          </p>
          <p className="mt-1 text-[13px] text-ink-soft">
            You answered <span className="font-semibold text-ink">{result.correct}</span> of{" "}
            <span className="font-semibold text-ink">{result.total}</span> questions correctly, earning{" "}
            <span className="font-semibold text-ink">{result.weightEarned}</span> of{" "}
            <span className="font-semibold text-ink">{result.weightTotal}</span> difficulty-weighted
            points.
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Estimated overall proficiency{" "}
            <span className="font-semibold text-ink-soft">
              {result.overallLevel.toFixed(1)} / 5.0
            </span>{" "}
            &middot; {proficiencyBand(result.overallLevel)}
          </p>
        </div>
      </div>

      {/* Per-competency breakdown */}
      <h2 className="mt-3 text-[13px] font-semibold text-ink">Competency Breakdown</h2>
      <p className="text-[11px] text-ink-muted">
        Each competency is estimated only from the questions tagged to it.
      </p>

      <ul className="mt-2.5 divide-y divide-line rounded-xl border border-line">
        {result.competencies.map((c) => (
          <li key={c.competencyId} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[13px] font-semibold text-ink">{c.name}</span>
              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-px text-[10px] font-medium text-ink-muted">
                {c.domain}
              </span>
            </div>
            <div className="flex shrink-0 items-baseline gap-1">
              <span className="font-display text-[15px] font-bold text-ink tabular-nums">
                {c.level.toFixed(1)}
              </span>
              <span className="text-[11px] text-ink-muted">/ 5.0</span>
            </div>

            <div className="col-span-2 grid grid-cols-[1fr_auto] items-center gap-3">
              <ProgressBar value={c.level} max={5} size="xs" tone={toneForLevel(c.level, c.required)} />
              <p className="shrink-0 text-[11px] text-ink-muted tabular-nums">
                {c.correct}/{c.asked} correct &middot; {c.weightEarned}/{c.weightTotal} weight &middot;{" "}
                {Math.round(c.performance * 100)}%
              </p>
            </div>
          </li>
        ))}
      </ul>

      <HowCalculated className="mt-3" />
    </OnboardingFrame>
  );
}
