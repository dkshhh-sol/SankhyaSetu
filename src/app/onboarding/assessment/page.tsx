"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LogOut,
  Maximize2,
  ShieldAlert,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { ProctorPanel } from "@/components/assessment/ProctorPanel";
import { QuestionNavigator } from "@/components/assessment/QuestionNavigator";
import { enterFullscreen, exitFullscreen, useAntiCheat } from "@/components/assessment/useAntiCheat";
import { useProctoring } from "@/components/assessment/useProctoring";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Fields";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import { BASELINE_QUESTIONS, getCompetency } from "@/lib/data/onboarding";
import {
  hardCount,
  makeViolation,
  MAX_VIOLATIONS,
  type Violation,
  type ViolationType,
} from "@/lib/assessment/scoring";
import { scoreBaseline } from "@/lib/onboarding/engine";
import { useAppStore } from "@/lib/store/AppStore";
import { useOnboardingGuard, onboardingLoadingClass } from "@/lib/onboarding/useOnboardingGuard";

type Phase = "gate" | "running" | "submitting";

const LETTERS = ["A", "B", "C", "D"];

/**
 * Step 3 — the baseline competency assessment, under the same proctoring as
 * the platform's other assessments.
 *
 * The baseline determines the official's whole competency profile, so it runs
 * full screen with camera proctoring and the shared integrity rules: three
 * hard events auto-submit, and an invalid attempt never writes a competency
 * level (see the `onboarding/submit` reducer).
 *
 * Items are tagged with the competency they score; the tags stay hidden by
 * default and can be revealed with the "Show question tags" switch.
 */
export default function OnboardingAssessmentPage() {
  const router = useRouter();
  const { state, dispatch } = useAppStore();
  const { ready, onboarding } = useOnboardingGuard("role");

  const questions = BASELINE_QUESTIONS;
  const [phase, setPhase] = useState<Phase>("gate");
  const [index, setIndex] = useState(0);
  const [showTags, setShowTags] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Browsers that refuse full screen still get a monitored attempt.
  const [fsSupported, setFsSupported] = useState(true);
  const [alert, setAlert] = useState<Violation | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);

  const answers = state.onboarding.answers;
  const violations = state.onboarding.violations;
  const hard = hardCount(violations);

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [questions, answers],
  );
  const answeredSet = useMemo(
    () =>
      new Set(
        questions.map((q, i) => (answers[q.id] !== undefined ? i : -1)).filter((i) => i >= 0),
      ),
    [questions, answers],
  );

  // A reload mid-attempt is recorded once as a soft event, then the attempt
  // resumes from the answers already stored.
  useEffect(() => {
    if (!ready || mountedRef.current) return;
    mountedRef.current = true;
    if (Object.keys(answers).length > 0 && !onboarding.result) {
      dispatch({ type: "onboarding/violation", violation: makeViolation("page-reload") });
      dispatch({ type: "onboarding/load" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // ---- Submit --------------------------------------------------------
  const submit = useCallback(
    async (auto?: "integrity") => {
      if (submittingRef.current || !onboarding.roleId) return;
      submittingRef.current = true;
      setPhase("submitting");
      const result = scoreBaseline(onboarding.roleId, answers, questions, violations, auto);
      await exitFullscreen();
      dispatch({ type: "onboarding/submit", result });
      window.setTimeout(() => router.replace("/onboarding/results"), 700);
    },
    [onboarding.roleId, answers, questions, violations, dispatch, router],
  );

  // ---- Integrity -----------------------------------------------------
  const recordViolation = useCallback(
    (type: ViolationType, message?: string) => {
      if (submittingRef.current) return;
      const v = makeViolation(type, message);
      dispatch({ type: "onboarding/violation", violation: v });
      if (v.severity === "hard") setAlert(v);
      else {
        setToast(v.message);
        window.setTimeout(() => setToast(null), 3200);
      }
    },
    [dispatch],
  );

  useAntiCheat({
    active: phase === "running",
    onViolation: recordViolation,
    onFullscreenChange: setIsFullscreen,
  });

  const proctor = useProctoring({
    active: phase === "running",
    videoRef,
    onCameraLost: () => recordViolation("camera-lost"),
    onFaceMissing: () => recordViolation("face-missing"),
  });

  // Auto-submit once the hard-violation budget is exhausted.
  useEffect(() => {
    if (phase === "running" && hard >= MAX_VIOLATIONS) {
      const t = window.setTimeout(() => submit("integrity"), 1800);
      return () => window.clearTimeout(t);
    }
  }, [phase, hard, submit]);

  // Leave full screen if the official navigates away.
  useEffect(() => () => void exitFullscreen(), []);

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
  const resuming = answeredCount > 0;

  async function begin() {
    const ok = await enterFullscreen();
    setIsFullscreen(ok);
    if (!ok) setFsSupported(false);
    setPhase("running");
  }

  function choose(option: number) {
    dispatch({ type: "onboarding/answer", questionId: q.id, option });
    if (isLast) return;
    // Advance automatically, but only if the official has not moved on.
    const from = index;
    window.setTimeout(
      () => setIndex((i) => (i === from ? Math.min(i + 1, questions.length - 1) : i)),
      180,
    );
  }

  /* ---------------- Gate ---------------- */
  if (phase === "gate") {
    return (
      <OnboardingFrame
        step={3}
        title="Baseline Competency Assessment"
        subtitle="This assessment is proctored. Please read before you begin."
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft className="size-4" />}
              onClick={() => router.push("/onboarding/role")}
            >
              Back
            </Button>
            <Button onClick={begin} rightIcon={<Maximize2 className="size-4" />}>
              {resuming ? "Enter full screen & resume" : "Enter full screen & begin"}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 rounded-xl bg-surface p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <ShieldCheck className="size-[18px]" aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-ink">Proctored assessment</p>
            <p className="text-xs text-ink-muted">
              This baseline determines your competency profile, so it is monitored the same way as
              every other assessment on the platform.
            </p>
          </div>
        </div>

        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ["Full screen is required", "Leaving full screen is recorded as a critical event."],
            ["Camera and microphone", "Presence is checked on-device. Nothing is uploaded."],
            ["Stay on this tab", "Switching tabs or applications is recorded."],
            ["Copy, paste and shortcuts", "These are blocked for the duration of the assessment."],
            [
              `${MAX_VIOLATIONS} critical events end it`,
              "The attempt is submitted automatically and marked invalid.",
            ],
            [`${questions.length} questions`, "No time limit. Every question must be answered."],
          ].map(([title, detail]) => (
            <li key={title} className="flex items-start gap-2 rounded-lg border border-line px-2.5 py-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
              <span>
                <span className="block text-[12.5px] font-semibold text-ink">{title}</span>
                <span className="block text-[11px] leading-snug text-ink-muted">{detail}</span>
              </span>
            </li>
          ))}
        </ul>

        {resuming && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
            You have {answeredCount} of {questions.length} answers saved. Resuming keeps them.
          </p>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
          Prototype notice: proctoring analysis runs entirely in your browser. No video, audio or
          personal data is transmitted or stored.
        </p>
      </OnboardingFrame>
    );
  }

  /* ---------------- Running / submitting ---------------- */
  const progress = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="no-select min-h-screen bg-surface">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark className="h-7 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-ink">
                Baseline Competency Assessment
              </p>
              <p className="hidden truncate text-xs text-ink-muted sm:block">
                Step 3 of 7 &middot; establishes your competency profile
              </p>
            </div>
          </div>

          <div className="order-last flex w-full items-center gap-4 sm:order-none sm:ml-auto sm:w-auto">
            <div className="hidden min-w-[180px] md:block">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">
                  Question {index + 1} of {questions.length}
                </span>
                <span className="text-ink-muted">{answeredCount} answered</span>
              </div>
              <ProgressBar value={progress} size="xs" className="mt-1" />
            </div>

            <div
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-1.5",
                hard > 0 ? "bg-red-50 text-red-600" : "bg-surface text-ink",
              )}
            >
              <ShieldCheck className="size-[18px]" aria-hidden />
              <div className="leading-tight">
                <p className="text-[10px] font-medium uppercase tracking-wide text-current/70">
                  Integrity
                </p>
                <p className="font-display text-sm font-bold tabular-nums">
                  {hard} / {MAX_VIOLATIONS}
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmEnd(true)}
              rightIcon={<LogOut className="size-4" />}
              className="ml-auto sm:ml-0"
            >
              End Assessment
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        {/* Question */}
        <section className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-card" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone="blue" size="md">
              Multiple Choice
            </Badge>
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
                  <span className="text-brand-500">{k}:</span>{" "}
                  <span className="font-semibold">{v}</span>
                </span>
              ))}
            </div>
          )}

          <h2 className="mt-4 flex gap-4 font-display text-lg font-bold leading-snug text-ink">
            <span className="shrink-0 text-ink-muted">Q{index + 1}.</span>
            <span>{q.prompt}</span>
          </h2>

          <ul className="mt-4 space-y-2.5" role="radiogroup" aria-label={`Options for question ${index + 1}`}>
            {q.options.map((opt, i) => {
              const on = selected === i;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => choose(i)}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-lg border px-4 py-3 text-left text-[15px] transition-colors",
                      on
                        ? "border-brand-500 bg-brand-50 text-ink"
                        : "border-line bg-white text-ink-soft hover:border-brand-200 hover:bg-brand-50/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                        on ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-muted",
                      )}
                      aria-hidden
                    >
                      {LETTERS[i]}
                    </span>
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft className="size-4" />}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
            >
              Previous
            </Button>
            {isLast ? (
              <Button
                onClick={() => submit()}
                disabled={!allAnswered}
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
        </section>

        {/* Proctoring + navigator */}
        <aside className="space-y-4">
          <ProctorPanel
            videoRef={videoRef}
            proctor={proctor}
            violations={violations}
            isFullscreen={isFullscreen}
            compact
          />
          <QuestionNavigator
            total={questions.length}
            current={index}
            answered={answeredSet}
            flagged={new Set()}
            onJump={setIndex}
          />
        </aside>
      </div>

      {/* Soft-event toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop"
        >
          <AlertTriangle className="size-4 text-amber-400" aria-hidden /> {toast}
        </div>
      )}

      {/* Hard-event / fullscreen-lost blocking dialog */}
      <Modal
        open={(!!alert || (fsSupported && !isFullscreen)) && phase === "running"}
        dismissible={false}
        tone="danger"
        title={
          <span className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="size-6" /> Integrity event recorded
          </span>
        }
        footer={
          <Button
            onClick={async () => {
              const ok = await enterFullscreen();
              setIsFullscreen(ok);
              if (!ok) setFsSupported(false);
              setAlert(null);
            }}
            rightIcon={<Maximize2 className="size-4" />}
          >
            Return to full screen
          </Button>
        }
      >
        <p className="text-base font-semibold text-ink">
          {alert?.message ?? "You left full-screen mode."}
        </p>
        <p className="mt-2">
          {hard >= MAX_VIOLATIONS
            ? "The maximum number of critical events has been reached. Your baseline is being submitted and will be marked invalid — you will be asked to retake it."
            : `This is critical event ${hard} of ${MAX_VIOLATIONS}. ${MAX_VIOLATIONS - hard} more will end the assessment automatically and invalidate your baseline.`}
        </p>
        <div className="mt-4 rounded-xl bg-surface p-3">
          <ProgressBar value={hard} max={MAX_VIOLATIONS} tone={hard >= 2 ? "red" : "amber"} />
        </div>
      </Modal>

      {/* End confirmation */}
      <Modal
        open={confirmEnd && phase === "running"}
        onClose={() => setConfirmEnd(false)}
        title="Submit assessment?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmEnd(false)}>
              Continue answering
            </Button>
            <Button variant="danger" onClick={() => submit()}>
              Submit now
            </Button>
          </>
        }
      >
        <p>
          You have answered{" "}
          <span className="font-semibold text-ink">
            {answeredCount} of {questions.length}
          </span>{" "}
          questions. Unanswered questions score zero for their competency. This cannot be undone.
        </p>
      </Modal>

      {/* Submitting overlay */}
      {phase === "submitting" && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur">
          <span
            className="size-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600"
            aria-hidden
          />
          <p className="font-display text-[15px] font-semibold text-ink">
            Scoring your baseline assessment...
          </p>
          <p className="text-sm text-ink-muted">Evaluating answers and verifying integrity.</p>
        </div>
      )}
    </div>
  );
}
