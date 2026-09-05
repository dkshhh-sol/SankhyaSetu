"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { CompetencyRow } from "@/components/onboarding/CompetencyRow";
import { HowCalculated } from "@/components/onboarding/HowCalculated";
import { Button } from "@/components/ui/Button";
import { proficiencyBand } from "@/lib/onboarding/engine";
import { useOnboardingGuard, onboardingLoadingClass } from "@/lib/onboarding/useOnboardingGuard";

/** Step 5 — the generated competency profile: current against required. */
export default function OnboardingCompetencyProfilePage() {
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
  const met = result.competencies.filter((c) => c.gap === 0).length;

  return (
    <OnboardingFrame
      step={5}
      wide
      title="Your Competency Profile"
      subtitle={`${onboarding.profile?.fullName} · ${result.roleName}`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />} onClick={() => router.back()}>
            Back
          </Button>
          <Button
            onClick={() => router.push("/onboarding/gaps")}
            rightIcon={<ArrowRight className="size-4" />}
          >
            View Skill Gap Analysis
          </Button>
        </div>
      }
    >
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {(
          [
            ["Overall", `${result.overallLevel.toFixed(1)} / 5.0`, proficiencyBand(result.overallLevel)],
            ["Assessment", `${result.overallPct}%`, `${result.correct} of ${result.total} correct`],
            ["Requirements met", `${met} / ${result.competencies.length}`, "At or above required"],
            ["Gaps identified", `${result.gaps.length}`, "Below required level"],
          ] as const
        ).map(([label, value, caption]) => (
          <div key={label} className="rounded-xl border border-line bg-surface px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</p>
            <p className="mt-0.5 font-display text-[17px] font-bold text-ink tabular-nums">{value}</p>
            <p className="text-[11px] text-ink-muted">{caption}</p>
          </div>
        ))}
      </div>

      {/* Current vs required per competency */}
      <div className="mt-3 rounded-xl border border-line px-3.5">
        <ul className="divide-y divide-line">
          {result.competencies.map((c) => (
            <CompetencyRow key={c.competencyId} score={c} />
          ))}
        </ul>
      </div>

      <HowCalculated className="mt-3" />
    </OnboardingFrame>
  );
}
