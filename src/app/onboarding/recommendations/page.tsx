"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, GraduationCap } from "lucide-react";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { HowCalculated } from "@/components/onboarding/HowCalculated";
import { Button } from "@/components/ui/Button";
import { PriorityBadge, ProviderBadge } from "@/components/ui/Badge";
import { PROVIDER_FULL } from "@/lib/data/courses";
import { recommendationsFor } from "@/lib/onboarding/engine";
import { signInAsNewOfficial } from "@/lib/auth";
import { announceSessionChange, useAppStore } from "@/lib/store/AppStore";
import { useOnboardingGuard, onboardingLoadingClass } from "@/lib/onboarding/useOnboardingGuard";

/**
 * Step 7 — the learning path derived from the gaps.
 *
 * Recommendations are a deterministic mapping from competency gap to a
 * curated iGOT Karmayogi module or NSSTA / TPAC programme. No external
 * platforms are recommended, and no learned ranking model is involved.
 */
export default function OnboardingRecommendationsPage() {
  const router = useRouter();
  const { ready, onboarding } = useOnboardingGuard("result");
  const { state } = useAppStore();
  const [entering, setEntering] = useState(false);

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
  const recommendations = recommendationsFor(result);

  function enterDashboard() {
    if (entering) return;
    setEntering(true);
    const profile = state.onboarding.profile!;
    // Creates the prototype session for the newly onboarded official; the
    // competency profile is already in the store from the submit step.
    signInAsNewOfficial({
      fullName: profile.fullName,
      designation: profile.designation,
      department: profile.department,
    });
    announceSessionChange();
    router.push("/dashboard");
  }

  return (
    <OnboardingFrame
      step={7}
      wide
      title="Your Priority Learning Path"
      subtitle="Recommended from your largest competency gaps, in priority order."
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />} onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={enterDashboard} loading={entering} rightIcon={<ArrowRight className="size-4" />}>
            Go to Dashboard
          </Button>
        </div>
      }
    >
      {recommendations.length > 0 ? (
        <ul className="space-y-1.5">
          {recommendations.map(({ competency, course }) => (
            <li
              key={competency.competencyId}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line bg-white px-3 py-2 transition-colors hover:border-brand-200"
            >
              {/* The gap this addresses */}
              <div className="flex w-[190px] shrink-0 flex-col gap-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-semibold text-ink">{competency.name}</span>
                  <PriorityBadge priority={competency.priority} />
                </span>
                <span className="text-[11px] text-ink-muted tabular-nums">
                  Gap <span className="font-bold text-red-600">{competency.gap.toFixed(1)}</span>
                  {" · "}
                  {competency.level.toFixed(1)} &rarr; {competency.required.toFixed(1)}
                </span>
              </div>

              {/* The recommendation */}
              <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg bg-surface px-2.5 py-1.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-line">
                  <GraduationCap className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{course.title}</p>
                  <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted">
                    <ProviderBadge provider={course.provider} />
                    <span>{PROVIDER_FULL[course.provider]}</span>
                    <span aria-hidden>&middot;</span>
                    <span>{course.duration}</span>
                  </p>
                </div>
                <Link
                  href={`/learning/${course.id}`}
                  className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-2.5 text-[12px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  {course.provider === "iGOT" ? "View Module" : "View Programme"}
                  <ExternalLink className="size-3" aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-[13px] font-semibold text-emerald-800">
            No gaps to close — you meet every requirement for {result.roleName}.
          </p>
          <p className="mt-0.5 text-[12px] text-emerald-700">
            Your dashboard will suggest advanced modules to deepen existing strengths.
          </p>
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
        SankhyaSetu recommends only iGOT Karmayogi modules and NSSTA / TPAC programmes, and never
        hosts course content itself. Links open the corresponding catalogue entry in the platform.
      </p>

      <HowCalculated className="mt-3" />
    </OnboardingFrame>
  );
}
