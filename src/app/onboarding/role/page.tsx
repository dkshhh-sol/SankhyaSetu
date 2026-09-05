"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ClipboardList } from "lucide-react";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Fields";
import { cn } from "@/lib/cn";
import { ASSIGNMENTS, BASELINE_COMPETENCIES, ROLES, getRole } from "@/lib/data/onboarding";
import { useAppStore } from "@/lib/store/AppStore";
import { useOnboardingGuard, onboardingLoadingClass } from "@/lib/onboarding/useOnboardingGuard";

/**
 * Step 2 — role and current assignment.
 *
 * The selected role determines which competency levels are *required*, so the
 * required column is previewed live as soon as a role is picked.
 */
export default function OnboardingRolePage() {
  const { ready, onboarding } = useOnboardingGuard("profile");

  // Defer mounting the picker until the guard has resolved, so a reload
  // restores the previously chosen role rather than an empty selection.
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
  return <RolePicker savedRoleId={onboarding.roleId} savedAssignment={onboarding.assignment} />;
}

function RolePicker({
  savedRoleId,
  savedAssignment,
}: {
  savedRoleId?: string;
  savedAssignment?: string;
}) {
  const router = useRouter();
  const { dispatch } = useAppStore();

  const [roleId, setRoleId] = useState<string>(savedRoleId ?? "");
  const [assignment, setAssignment] = useState<string>(savedAssignment ?? "");

  const valid = Boolean(roleId && assignment);
  const preview = roleId ? getRole(roleId) : null;

  function handleStart() {
    if (!valid) return;
    dispatch({ type: "onboarding/role", roleId, assignment });
    router.push("/onboarding/assessment");
  }

  return (
    <OnboardingFrame
      step={2}
      title="Your role and responsibility"
      subtitle="Your role sets the competency levels you are assessed against."
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />} onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={handleStart} disabled={!valid} rightIcon={<ArrowRight className="size-4" />}>
            Start Competency Assessment
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div>
          {/* Role */}
          <Label>Current Role</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ROLES.map((r) => {
              const active = roleId === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoleId(r.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-2.5 text-left transition-colors",
                    active
                      ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200"
                      : "border-line bg-white hover:border-brand-200 hover:bg-brand-50/50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                      active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white",
                    )}
                    aria-hidden
                  >
                    {active && <Check className="size-2.5" strokeWidth={3.5} />}
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-[13px] font-semibold", active ? "text-brand-800" : "text-ink")}>
                      {r.name}
                    </span>
                    <span className="block text-[11px] leading-snug text-ink-muted">{r.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Assignment */}
          <Label className="mt-4">Current Assignment / Primary Responsibility</Label>
          <div className="flex flex-wrap gap-1.5">
            {ASSIGNMENTS.map((a) => {
              const active = assignment === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAssignment(a)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                    active
                      ? "border-brand-400 bg-brand-600 text-white"
                      : "border-line bg-white text-ink-soft hover:border-brand-200 hover:bg-brand-50",
                  )}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live preview of what this role requires */}
        <aside className="rounded-xl border border-line bg-surface p-3.5">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-brand-600" aria-hidden />
            <p className="text-[13px] font-semibold text-ink">Required competencies</p>
          </div>

          {preview ? (
            <>
              <p className="mt-0.5 text-[11px] text-ink-muted">
                Levels expected for a <span className="font-semibold text-ink-soft">{preview.name}</span>
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {BASELINE_COMPETENCIES.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 text-[12.5px]">
                    <span className="truncate text-ink-soft">{c.name}</span>
                    <span className="shrink-0 font-semibold text-ink tabular-nums">
                      {(preview.required[c.id] ?? 3).toFixed(1)}
                      <span className="font-normal text-ink-muted"> / 5.0</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-2.5 text-[11px] leading-relaxed text-ink-muted">
                The baseline assessment estimates your current level for each of these. The
                difference becomes your skill gap.
              </p>
            </>
          ) : (
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              Select a role to see the competency levels it requires.
            </p>
          )}
        </aside>
      </div>
    </OnboardingFrame>
  );
}
