"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Clock, ExternalLink, Flag, HelpCircle, LogOut, Maximize2, ShieldAlert, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProctorPanel } from "@/components/assessment/ProctorPanel";
import { QuestionNavigator } from "@/components/assessment/QuestionNavigator";
import { enterFullscreen, exitFullscreen, useAntiCheat } from "@/components/assessment/useAntiCheat";
import { useProctoring } from "@/components/assessment/useProctoring";
import { getAssessment } from "@/lib/data/assessments";
import { formatDuration, hardCount, makeViolation, MAX_VIOLATIONS, scoreAttempt, seededShuffle, type Violation, type ViolationType } from "@/lib/assessment/scoring";
import { useAppStore, type AttemptState } from "@/lib/store/AppStore";
import { cn } from "@/lib/cn";

type Phase = "gate" | "running" | "submitting";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function AttemptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, hydrated, dispatch, currentLevels } = useAppStore();
  const assessment = getAssessment(id, state.customAssessments);
  const attempt = state.attempts[id];

  const [phase, setPhase] = useState<Phase>("gate");
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Browsers that refuse full screen (embedded previews, some mobiles) still get a monitored attempt.
  const [fsSupported, setFsSupported] = useState(true);
  const [alert, setAlert] = useState<Violation | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const videoRef = useRef<HTMLVideoElement>(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);

  // ---- Guards --------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    if (!assessment) router.replace("/assessments");
    else if (state.results[id]) router.replace(`/assessments/${id}/result`);
  }, [hydrated, assessment, state.results, id, router]);

  // A reload mid-attempt is recorded once (soft event) and the attempt resumes.
  useEffect(() => {
    if (!hydrated || mountedRef.current || !attempt) return;
    mountedRef.current = true;
    if (attempt.loads > 0) {
      dispatch({ type: "attempt/violation", id, violation: makeViolation("page-reload") });
    }
    dispatch({ type: "attempt/update", id, patch: { loads: attempt.loads + 1 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // ---- Questions in this candidate's order ------------------------------
  const questions = useMemo(() => {
    if (!assessment || !attempt) return [];
    const byId = new Map(assessment.questions.map((q) => [q.id, q]));
    return attempt.order.map((qid) => byId.get(qid)!).filter(Boolean);
  }, [assessment, attempt]);

  // ---- Timer ---------------------------------------------------------
  useEffect(() => {
    if (phase !== "running") return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [phase]);

  const remainingSec = attempt ? Math.max(0, Math.floor((attempt.deadline - now) / 1000)) : 0;

  // ---- Submit --------------------------------------------------------
  const submit = useCallback(
    async (auto?: "time" | "integrity") => {
      if (!assessment || !attempt || submittingRef.current) return;
      submittingRef.current = true;
      setPhase("submitting");
      const elapsed = Math.min(assessment.timeLimitMin * 60, Math.round((Date.now() - attempt.startedAt) / 1000));
      const result = scoreAttempt(assessment, questions, attempt.answers, attempt.violations, elapsed, currentLevels, auto);
      await exitFullscreen();
      dispatch({ type: "attempt/finish", result });
      window.setTimeout(() => router.replace(`/assessments/${id}/result`), 700);
    },
    [assessment, attempt, questions, currentLevels, dispatch, router, id],
  );

  useEffect(() => {
    if (phase === "running" && attempt && remainingSec === 0) submit("time");
  }, [phase, attempt, remainingSec, submit]);

  // ---- Integrity -----------------------------------------------------
  const recordViolation = useCallback(
    (type: ViolationType, message?: string) => {
      if (submittingRef.current || !attempt) return;
      const v = makeViolation(type, message);
      dispatch({ type: "attempt/violation", id, violation: v });
      if (v.severity === "hard") setAlert(v);
      else {
        setToast(v.message);
        window.setTimeout(() => setToast(null), 3200);
      }
    },
    [attempt, dispatch, id],
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
  const hard = attempt ? hardCount(attempt.violations) : 0;
  useEffect(() => {
    if (phase === "running" && hard >= MAX_VIOLATIONS) {
      const t = window.setTimeout(() => submit("integrity"), 1800);
      return () => window.clearTimeout(t);
    }
  }, [phase, hard, submit]);

  // Stop everything if the user navigates away.
  useEffect(() => () => void exitFullscreen(), []);

  // ---- Begin / resume ----------------------------------------------------
  async function begin() {
    if (!assessment) return;
    const ok = await enterFullscreen();
    setIsFullscreen(ok);
    if (!ok) setFsSupported(false);
    if (!attempt) {
      const startedAt = Date.now();
      const seed = startedAt & 0xffff;
      const order = seededShuffle(assessment.questions.map((q) => q.id), seed);
      const optionOrder: Record<string, number[]> = {};
      assessment.questions.forEach((q, i) => {
        optionOrder[q.id] = seededShuffle(q.options.map((_, k) => k), seed + i + 1);
      });
      const fresh: AttemptState = {
        assessmentId: assessment.id,
        order,
        optionOrder,
        answers: {},
        flagged: [],
        current: 0,
        startedAt,
        deadline: startedAt + assessment.timeLimitMin * 60 * 1000,
        violations: [],
        loads: 1,
      };
      dispatch({ type: "attempt/start", attempt: fresh });
      mountedRef.current = true;
    }
    setNow(Date.now());
    setPhase("running");
  }

  // ---- Answering -----------------------------------------------------
  const current = attempt?.current ?? 0;
  const q = questions[current];
  const displayOrder = q ? attempt?.optionOrder[q.id] ?? q.options.map((_, i) => i) : [];
  const selected = q ? attempt?.answers[q.id] : undefined;
  const answeredSet = useMemo(() => new Set(questions.map((qq, i) => (attempt?.answers[qq.id] !== undefined ? i : -1)).filter((i) => i >= 0)), [questions, attempt?.answers]);
  const flaggedSet = useMemo(() => new Set(questions.map((qq, i) => (attempt?.flagged.includes(qq.id) ? i : -1)).filter((i) => i >= 0)), [questions, attempt?.flagged]);

  function choose(originalIndex: number) {
    if (!q || !attempt) return;
    dispatch({ type: "attempt/update", id, patch: { answers: { ...attempt.answers, [q.id]: originalIndex } } });
  }
  function go(index: number) {
    if (!attempt) return;
    dispatch({ type: "attempt/update", id, patch: { current: Math.max(0, Math.min(questions.length - 1, index)) } });
  }
  function toggleFlag() {
    if (!q || !attempt) return;
    const flagged = attempt.flagged.includes(q.id) ? attempt.flagged.filter((x) => x !== q.id) : [...attempt.flagged, q.id];
    dispatch({ type: "attempt/update", id, patch: { flagged } });
  }

  if (!hydrated || !assessment) return null;

  // ---- Gate ----------------------------------------------------------
  if (phase === "gate") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6">
        <div className="w-full max-w-lg animate-fade-up rounded-3xl bg-white p-8 text-center shadow-pop">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-50">
            <Maximize2 className="size-8 text-brand-600" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">{attempt ? "Resume your assessment" : "Ready to begin?"}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {assessment.title} will open in full-screen mode with live proctoring. {attempt ? "Your answers and timer have been preserved." : `You have ${assessment.timeLimitMin} minutes for ${assessment.questions.length} questions.`}
          </p>
          <ul className="mt-5 space-y-2 rounded-2xl bg-surface p-4 text-left text-xs text-ink-soft">
            <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" /> Stay in full screen; leaving is recorded.</li>
            <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" /> Do not switch tabs or applications.</li>
            <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {MAX_VIOLATIONS} critical events end the assessment.</li>
          </ul>
          <Button size="lg" className="mt-6 w-full" onClick={begin} rightIcon={<ArrowRight className="size-4" />}>
            {attempt ? "Enter full screen & resume" : "Enter full screen & begin"}
          </Button>
          <button type="button" onClick={() => router.push(`/assessments/${id}`)} className="mt-3 text-sm font-medium text-ink-muted hover:text-ink">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!attempt || !q) return null;

  const progress = Math.round(((current + 1) / questions.length) * 100);
  const lowTime = remainingSec <= 120;

  return (
    <div className="no-select min-h-screen bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark className="h-7 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-ink sm:text-base">{assessment.title}</p>
              <p className="hidden truncate text-xs text-ink-muted sm:block">
                <span className="font-semibold text-brand-700">{assessment.provider}</span> &middot; {assessment.linkedCourseTitle}
              </p>
            </div>
          </div>

          <div className="order-last flex w-full items-center gap-4 sm:order-none sm:ml-auto sm:w-auto">
            <div className="hidden min-w-[180px] md:block">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Question {current + 1} of {questions.length}</span>
                <span className="text-ink-muted">{progress}%</span>
              </div>
              <ProgressBar value={progress} size="xs" className="mt-1" />
            </div>
            <div className={cn("flex items-center gap-2 rounded-xl px-3 py-1.5", lowTime ? "bg-red-50 text-red-600" : "bg-surface text-ink")}>
              <Clock className="size-4.5" aria-hidden />
              <div className="leading-tight">
                <p className="text-[10px] font-medium uppercase tracking-wide text-current/70">Time Remaining</p>
                <p className="font-display text-lg font-extrabold tabular-nums">{formatDuration(remainingSec)}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-xl bg-surface px-3 py-1.5 sm:flex">
              <Flag className="size-4.5 text-red-500" aria-hidden />
              <div className="leading-tight">
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Flagged</p>
                <p className="font-display text-lg font-extrabold text-ink">{flaggedSet.size}</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setConfirmEnd(true)} rightIcon={<LogOut className="size-4" />} className="ml-auto sm:ml-0">
              End Assessment
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        {/* Question card */}
        <section className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone="blue" size="md">Multiple Choice</Badge>
            <span className="text-sm text-ink-soft">
              Difficulty:{" "}
              <Badge tone={q.difficulty === "Easy" ? "emerald" : q.difficulty === "Medium" ? "amber" : "red"} size="md">{q.difficulty}</Badge>
            </span>
          </div>
          <h2 className="mt-5 flex gap-4 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
            <span className="shrink-0 text-ink-muted">Q{current + 1}.</span>
            <span>{q.prompt}</span>
          </h2>

          <ul className="mt-6 space-y-3" role="radiogroup" aria-label={`Answer options for question ${current + 1}`}>
            {displayOrder.map((origIdx, i) => {
              const on = selected === origIdx;
              return (
                <li key={origIdx}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => choose(origIdx)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left text-base transition-colors sm:px-5 sm:py-4",
                      on ? "border-brand-500 bg-brand-50 text-ink" : "border-line bg-white text-ink-soft hover:border-brand-200 hover:bg-brand-50/40",
                    )}
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border-2", on ? "border-brand-600" : "border-slate-300")} aria-hidden>
                      {on && <span className="size-3 rounded-full bg-brand-600" />}
                    </span>
                    <span>
                      <span className="mr-2 font-bold text-ink">{LETTERS[i]}.</span>
                      {q.options[origIdx]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
            <Button variant="outline" onClick={() => go(current - 1)} disabled={current === 0} leftIcon={<ArrowLeft className="size-4" />}>
              Previous
            </Button>
            <Button variant={flaggedSet.has(current) ? "soft" : "ghost"} onClick={toggleFlag} leftIcon={<Flag className={cn("size-4", flaggedSet.has(current) && "fill-amber-400 text-amber-500")} />}>
              {flaggedSet.has(current) ? "Flagged for review" : "Flag for review"}
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => go(current + 1)} rightIcon={<ArrowRight className="size-4" />}>
                Next Question
              </Button>
            ) : (
              <Button onClick={() => setConfirmEnd(true)} rightIcon={<ArrowRight className="size-4" />} variant="navy">
                Review & Submit
              </Button>
            )}
          </div>
        </section>

        {/* Side column */}
        <aside className="space-y-4">
          <ProctorPanel videoRef={videoRef} proctor={proctor} violations={attempt.violations} isFullscreen={isFullscreen} />
          <QuestionNavigator total={questions.length} current={current} answered={answeredSet} flagged={flaggedSet} onJump={go} />
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <HelpCircle className="size-4.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold text-ink">Need Help?</p>
                <p className="mt-0.5 text-xs text-ink-soft">If you face any technical issue during the assessment, please contact support.</p>
                <a href="mailto:support@sankhyasetu.demo.gov.in" className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-brand-200 bg-white px-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  Contact Support <ExternalLink className="size-4" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Soft-event toast */}
      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop">
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
        <p className="text-base font-semibold text-ink">{alert?.message ?? "You left full-screen mode."}</p>
        <p className="mt-2">
          {hard >= MAX_VIOLATIONS
            ? "The maximum number of critical events has been reached. Your assessment is being submitted and will be marked as invalid."
            : `This is critical event ${hard} of ${MAX_VIOLATIONS}. ${MAX_VIOLATIONS - hard} more will end the assessment automatically and invalidate the result.`}
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
            <Button variant="ghost" onClick={() => setConfirmEnd(false)}>Continue answering</Button>
            <Button variant="danger" onClick={() => submit()}>Submit now</Button>
          </>
        }
      >
        <p>
          You have answered <span className="font-semibold text-ink">{answeredSet.size} of {questions.length}</span> questions
          {flaggedSet.size > 0 && (
            <>
              {" "}and flagged <span className="font-semibold text-ink">{flaggedSet.size}</span> for review
            </>
          )}
          . Unanswered questions are marked incorrect. This cannot be undone.
        </p>
      </Modal>

      {/* Submitting overlay */}
      {phase === "submitting" && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur">
          <span className="size-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" aria-hidden />
          <p className="font-display text-lg font-bold text-ink">Scoring your assessment...</p>
          <p className="text-sm text-ink-muted">Evaluating answers and verifying integrity.</p>
        </div>
      )}
    </div>
  );
}
