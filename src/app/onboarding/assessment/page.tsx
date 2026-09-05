"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Tag } from "lucide-react";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Fields";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import { BASELINE_QUESTIONS, getCompetency } from "@/lib/data/onboarding";
import { scoreBaseline } from "@/lib/onboarding/engine";
import { useAppStore } from "@/lib/store/AppStore";
import { useOnboardingGuard, onboardingLoadingClass } from "@/lib/onboarding/useOnboardingGuard";

const LETTERS = ["A", "B", "C", "D"];

/**
 * Step 3 — the baseline competency assessment.
 *
 * Every item is tagged with the competency it scores; the tags are hidden by
 * default so the experience reads as an assessment rather than a data dump,
 * and can be revealed with the "Show question tags" switch.
 */
export default function OnboardingAssessmentPage() {
  const router = useRouter();
  const { state, dispatch } = useAppStore();
  const { ready, onboarding } = useOnboardingGuard("role");

  const questions = BASELINE_QUESTIONS;
  const [index, setIndex] = useState(0);
  const [showTags, setShowTags] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const answers = state.onboarding.answers;
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [questions, answers],
  );

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

  const q = questions[index];
  const selected = answers[q.id];
  const isLast = index === questions.length - 1;
  const allAnswered = answeredCount === questions.length;

  function choose(option: number) {
    dispatch({ type: "onboarding/answer", questionId: q.id, option });
    if (isLast) return;
    // Advance automatically so the demo keeps moving — but only if the user
    // has not navigated elsewhere in the meantime.
    const from = index;
    window.setTimeout(
      () => setIndex((i) => (i === from ? Math.min(i + 1, questions.length - 1) : i)),
      180,
    );
  }

  function handleSubmit() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    const result = scoreBaseline(onboarding.roleId!, answers, questions);
    dispatch({ type: "onboarding/submit", result });
    router.push("/onboarding/results");
  }

  return (
    <OnboardingFrame
      step={3}
      wide
      title="Baseline Competency Assessment"
      subtitle={`${questions.length} questions across ${new Set(questions.map((x) => x.competencyId)).size} competencies. There is no time limit.`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="size-4" />}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
          >
            Previous
          </Button>

          <p className="hidden text-xs text-ink-muted sm:block">
            {answeredCount} of {questions.length} answered
          </p>

          {isLast ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              loading={submitting}
              rightIcon={<CheckCircle2 className="size-4" />}
            >
              Submit Assessment
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
              rightIcon={<ArrowRight className="size-4" />}
            >
              Next
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_200px]">
        {/* Question */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-brand-700">
              Question {index + 1}
              <span className="font-normal text-ink-muted"> of {questions.length}</span>
            </p>
            <Toggle
              checked={showTags}
              onChange={setShowTags}
              label={
                <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                  <Tag className="size-3" aria-hidden />
                  Show question tags
                </span>
              }
            />
          </div>

          <ProgressBar value={answeredCount} max={questions.length} size="xs" className="mt-2" />

          {/* The competency metadata behind this item */}
          {showTags && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(
                [
                  ["Competency", getCompetency(q.competencyId).name],
                  ["Domain", getCompetency(q.competencyId).domain],
                  ["Level", q.level],
                  ["Difficulty", q.difficulty],
                ] as const
              ).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-brand-100"
                >
                  <span className="text-brand-500">{k}:</span> <span className="font-semibold">{v}</span>
                </span>
              ))}
            </div>
          )}

          <h2 className="mt-3.5 text-[15px] font-semibold leading-snug text-ink">{q.prompt}</h2>

          <ul className="mt-3 space-y-2">
            {q.options.map((opt, i) => {
              const active = selected === i;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors",
                      active
                        ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200"
                        : "border-line bg-white hover:border-brand-200 hover:bg-brand-50/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                        active ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-muted",
                      )}
                      aria-hidden
                    >
                      {LETTERS[i]}
                    </span>
                    <span className={cn("text-[13.5px] leading-snug", active ? "font-medium text-brand-900" : "text-ink-soft")}>
                      {opt}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Navigator */}
        <aside className="lg:border-l lg:border-line lg:pl-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Questions</p>
          <div className="mt-2 grid grid-cols-8 gap-1.5 lg:grid-cols-5">
            {questions.map((item, i) => {
              const done = answers[item.id] !== undefined;
              const here = i === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={here || undefined}
                  aria-label={`Question ${i + 1}${done ? ", answered" : ""}`}
                  className={cn(
                    "flex h-7 items-center justify-center rounded-md text-[11px] font-semibold transition-colors",
                    here
                      ? "bg-brand-600 text-white ring-2 ring-brand-200"
                      : done
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-slate-100 text-ink-muted hover:bg-slate-200",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-[12px]">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Answered</dt>
              <dd className="font-semibold text-ink tabular-nums">
                {answeredCount} / {questions.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Competencies</dt>
              <dd className="font-semibold text-ink tabular-nums">
                {new Set(questions.map((x) => x.competencyId)).size}
              </dd>
            </div>
          </dl>

          {!allAnswered && (
            <p className="mt-3 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-700">
              Answer every question to submit. Each one scores a specific competency.
            </p>
          )}
        </aside>
      </div>
    </OnboardingFrame>
  );
}
