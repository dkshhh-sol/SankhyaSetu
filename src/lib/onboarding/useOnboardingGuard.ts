"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/AppStore";

export type OnboardingStage = "profile" | "role" | "result";

/**
 * Keeps the onboarding steps in order.
 *
 * If someone lands on a later step directly (or reloads after the session
 * state was cleared), they are sent back to the earliest step that still has
 * missing input rather than rendering a half-empty screen.
 */
export function useOnboardingGuard(need: OnboardingStage) {
  const { state, hydrated } = useAppStore();
  const router = useRouter();
  const onboarding = state.onboarding;

  const hasProfile = Boolean(onboarding.profile);
  const hasRole = Boolean(onboarding.roleId);
  const hasResult = Boolean(onboarding.result);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasProfile) {
      router.replace("/onboarding/profile");
    } else if (need !== "profile" && !hasRole) {
      router.replace("/onboarding/role");
    } else if (need === "result" && !hasResult) {
      router.replace("/onboarding/assessment");
    }
  }, [hydrated, hasProfile, hasRole, hasResult, need, router]);

  const ready =
    hydrated &&
    hasProfile &&
    (need === "profile" || hasRole) &&
    (need !== "result" || hasResult);

  return { ready, onboarding };
}

/** Full-screen spinner shown while the guard resolves. */
export function onboardingLoadingClass() {
  return "flex min-h-screen items-center justify-center";
}
