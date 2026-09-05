"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, TrendingDown } from "lucide-react";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { Button } from "@/components/ui/Button";
import { PriorityBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getRole } from "@/lib/data/onboarding";
import { useOnboardingGuard, onboardingLoadingClass } from "@/lib/onboarding/useOnboardingGuard";

/** Step 6 — the gaps, largest first, with the arithmetic shown per row. */
export default function OnboardingGapsPage() {
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
  const role = getRole(result.roleId);
  const met = result.competencies.filter((c) => c.gap === 0);

  return (
    <OnboardingFrame
      step={6}
      wide
      title="Skill Gap Analysis"
      subtitle={`Your estimated competency compared against what ${role.name} requires.`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />} onClick={() => router.back()}>
            Back
          </Button>
          <Button
            onClick={() => router.push("/onboarding/recommendations")}
            rightIcon={<ArrowRight className="size-4" />}
          >
            View Recommendations
          </Button>
        </div>
      }
    >
      <p className="rounded-lg bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-ink-soft">
        Skill gaps are calculated by comparing your estimated competency against the level required
        for the selected role. Gaps of 1.4 or more are High priority, 0.8 or more are Medium.
      </p>

      {result.gaps.length > 0 ? (
        <>
          <h2 className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <TrendingDown className="size-4 text-red-500" aria-hidden />
            Priority Skill Gaps
          </h2>

          <ol className="mt-2 space-y-1.5" data-testid="gap-list">
            {result.gaps.map((c, i) => (
              <li
                key={c.competencyId}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl border border-line bg-white px-3 py-2"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-surface text-[12px] font-bold text-ink-muted ring-1 ring-line">
                  {i + 1}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{c.name}</p>
                  <p className="text-[11px] text-ink-muted tabular-nums">
                    Current {c.level.toFixed(1)} &middot; Required {c.required.toFixed(1)} &middot;{" "}
                    {c.correct} of {c.asked} questions correct
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <div className="text-right">
                    <p className="font-display text-[16px] font-bold text-red-600 tabular-nums">
                      {c.gap.toFixed(1)}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Gap</p>
                  </div>
                  <PriorityBadge priority={c.priority} />
                </div>

                {/* Shortfall as a bar: filled = attained, hollow = the gap */}
                <div className="col-span-3 flex items-center gap-2">
                  <ProgressBar value={c.level} max={5} size="xs" tone="red" className="flex-1" />
                  <span className="w-24 shrink-0 text-right text-[10px] text-ink-muted tabular-nums">
                    {c.level.toFixed(1)} of {c.required.toFixed(1)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <ShieldCheck className="mx-auto size-6 text-emerald-600" aria-hidden />
          <p className="mt-1.5 text-[13px] font-semibold text-emerald-800">
            You meet every competency requirement for this role.
          </p>
          <p className="text-[12px] text-emerald-700">
            Recommendations will focus on maintaining and deepening your strengths.
          </p>
        </div>
      )}

      {met.length > 0 && (
        <>
          <h2 className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <ShieldCheck className="size-4 text-emerald-600" aria-hidden />
            Requirements already met
          </h2>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {met.map((c) => (
              <li
                key={c.competencyId}
                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700 tabular-nums"
              >
                {c.name} {c.level.toFixed(1)} / {c.required.toFixed(1)}
              </li>
            ))}
          </ul>
        </>
      )}
    </OnboardingFrame>
  );
}
