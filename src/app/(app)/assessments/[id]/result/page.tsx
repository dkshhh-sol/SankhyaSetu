"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, BarChart3, BookOpen, CalendarDays, CheckCircle2, Clock, FileText, Hash, Info, ShieldAlert, ShieldCheck, TrendingUp, UserCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Donut } from "@/components/ui/Donut";
import { IconTile } from "@/components/ui/IconTile";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getAssessment } from "@/lib/data/assessments";
import { EVIDENCE } from "@/lib/data/evidence";
import { PROVIDER_FULL } from "@/lib/data/courses";
import { formatDuration, hardCount, MAX_VIOLATIONS, VIOLATION_META } from "@/lib/assessment/scoring";
import { useAppStore } from "@/lib/store/AppStore";
import { formatDate, pct } from "@/lib/utils";
import { cn } from "@/lib/cn";

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const { state, hydrated } = useAppStore();
  const assessment = getAssessment(id, state.customAssessments);
  const result = state.results[id];

  if (!hydrated) return null;
  if (!assessment || !result) {
    return (
      <div className="rounded-xl bg-white p-10 text-center">
        <p className="text-lg font-semibold text-ink">No result found for this assessment.</p>
        <Link href="/assessments" className="mt-3 inline-block text-brand-600 hover:underline">Back to assessments</Link>
      </div>
    );
  }

  const evidence = EVIDENCE.find((e) => e.assessmentId === id);
  const valid = result.integrity !== "invalid";
  const updated = result.passed && valid;
  const primary = result.impact[0];
  const hard = hardCount(result.violations);
  const providerName = PROVIDER_FULL[assessment.provider];

  const integrityChecks = [
    { label: "Identity Verified", ok: true },
    { label: "Face Monitoring", ok: !result.violations.some((v) => v.type === "face-missing" || v.type === "camera-lost") },
    { label: "No Phone Detected", ok: true },
    { label: "No Tab Switching", ok: !result.violations.some((v) => v.type === "tab-switch" || v.type === "window-blur") },
    { label: "Full-screen Maintained", ok: !result.violations.some((v) => v.type === "fullscreen-exit") },
    { label: "Behavioural Pattern", ok: !result.violations.some((v) => v.type === "copy-paste" || v.type === "shortcut" || v.type === "devtools") },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assessments", href: "/assessments" }, { label: "Assessment Result" }]}
        title="Assessment Result"
        subtitle={
          result.autoSubmitted === "integrity"
            ? "The assessment was ended automatically because the integrity limit was reached."
            : result.autoSubmitted === "time"
              ? "Time ran out and your answers were submitted automatically. Here are your results and competency impact."
              : "You have successfully completed the assessment. Here are your results and competency impact."
        }
        building={false}
        aside={
          <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-3 pr-5 shadow-card">
            <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-brand-50 font-display text-base font-bold text-brand-700">{assessment.provider}</span>
            <div>
              <p className="font-display text-sm font-semibold text-ink">{assessment.linkedCourseTitle}</p>
              <p className="text-xs text-ink-muted">{providerName}{evidence ? ` - Completed on ${evidence.date}` : ""}</p>
            </div>
          </div>
        }
      />

      {/* Score / integrity / evidence */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className={cn("p-5", result.passed ? "border-emerald-100 bg-emerald-50/40" : "border-amber-100 bg-amber-50/40")}>
          <CardHeader icon={<IconTile icon={BarChart3} tone={result.passed ? "emerald" : "amber"} size="sm" rounded="full" />} title="Your Score" />
          <div className="mt-4 flex items-center gap-5">
            <Donut value={result.scorePct / 100} size={104} stroke={10} color={result.passed ? "#16a34a" : "#f59e0b"} track="#e5e7eb">
              <span className="font-display text-2xl font-bold leading-none text-ink">{result.scorePct}%</span>
            </Donut>
            <div className={cn("flex-1 rounded-xl p-4", result.passed ? "bg-emerald-100/70" : "bg-amber-100/70")}>
              <p className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
                {result.passed ? <CheckCircle2 className="size-5 text-emerald-600" /> : <XCircle className="size-5 text-amber-600" />}
                {result.passed ? "Pass" : "Not Passed"}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {result.passed ? "You have met the required proficiency level." : `The passing score is ${assessment.passingPct}%. Review the topics below and retake after further learning.`}
              </p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 divide-x divide-line border-t border-line pt-4 text-center">
            {[
              { k: "Total Questions", v: result.total },
              { k: "Correct Answers", v: result.correct },
              { k: "Time Taken", v: formatDuration(result.timeTakenSec) },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-xs text-ink-muted">{s.k}</dt>
                <dd className="mt-1 font-display text-lg font-bold text-ink">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className={cn("p-5", valid ? "border-emerald-100 bg-emerald-50/40" : "border-red-100 bg-red-50/40")}>
          <CardHeader icon={<IconTile icon={UserCheck} tone={valid ? "emerald" : "red"} size="sm" rounded="full" />} title="Assessment Integrity" />
          <div className="mt-4 grid grid-cols-[1fr_auto] gap-4">
            <ul className="space-y-2">
              {integrityChecks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-sm text-ink-soft">
                  {c.ok ? <CheckCircle2 className="size-4.5 shrink-0 text-emerald-500" aria-hidden /> : <XCircle className="size-4.5 shrink-0 text-red-500" aria-hidden />}
                  {c.label}
                </li>
              ))}
            </ul>
            <div className="flex flex-col items-center justify-center border-l border-line pl-4 text-center">
              {valid ? <ShieldCheck className="size-14 text-emerald-500" strokeWidth={1.6} aria-hidden /> : <ShieldAlert className="size-14 text-red-500" strokeWidth={1.6} aria-hidden />}
              <p className={cn("mt-1 font-display text-xl font-bold", valid ? "text-emerald-600" : "text-red-600")}>
                {result.integrity === "valid" ? "Valid" : result.integrity === "review" ? "Review" : "Invalid"}
              </p>
              <p className="mt-1 max-w-[130px] text-xs text-ink-soft">
                {result.integrity === "valid"
                  ? "No suspicious activity detected. Assessment integrity is valid."
                  : result.integrity === "review"
                    ? `${result.violations.length} event${result.violations.length > 1 ? "s" : ""} recorded; result accepted with a note.`
                    : `${hard} of ${MAX_VIOLATIONS} critical events. Result cannot update competency.`}
              </p>
            </div>
          </div>
          {result.violations.length > 0 && (
            <details className="mt-3 rounded-xl bg-white/70 p-3 text-xs">
              <summary className="cursor-pointer font-semibold text-ink">Integrity events ({result.violations.length})</summary>
              <ul className="mt-2 space-y-1.5">
                {result.violations.map((v, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 text-ink-soft">
                    <span>
                      <Badge tone={v.severity === "hard" ? "red" : "amber"} className="mr-2">{v.severity === "hard" ? "Critical" : "Minor"}</Badge>
                      {VIOLATION_META[v.type].label}
                    </span>
                    <span className="shrink-0 tabular-nums text-ink-muted">{new Date(v.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Card>

        <Card className="p-5">
          <CardHeader icon={<IconTile icon={BookOpen} tone="violet" size="sm" rounded="full" />} title="Learning Evidence" />
          <dl className="mt-4 space-y-2.5 text-sm">
            {[
              { icon: CheckCircle2, k: "Course Completion", v: <Badge tone="emerald"><CheckCircle2 className="size-3.5" /> Verified</Badge> },
              { icon: BookOpen, k: "Source", v: providerName },
              { icon: CalendarDays, k: "Completion Date", v: evidence?.date ?? formatDate(result.submittedAt) },
              { icon: Clock, k: "Course Duration", v: evidence?.duration ?? "-" },
              { icon: Hash, k: "Evidence ID", v: <span className="font-mono text-xs">{evidence?.evidenceId ?? `SS-${id.toUpperCase().slice(0, 12)}`}</span> },
            ].map((r) => (
              <div key={r.k} className="grid grid-cols-[1fr_1fr] items-center gap-2">
                <dt className="flex items-center gap-2 text-ink-soft">
                  <span className="flex size-6 items-center justify-center rounded-full bg-slate-700 text-white"><r.icon className="size-3.5" aria-hidden /></span>
                  {r.k}
                </dt>
                <dd className="font-medium text-ink">{r.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex gap-2.5 rounded-xl bg-emerald-50 p-3 text-xs text-ink-soft">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
            Your course completion has been verified through authorized {assessment.provider} integration.
          </div>
        </Card>
      </div>

      {/* Question-wise + topic-wise */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Card className="p-4 sm:p-5">
          <CardHeader icon={<IconTile icon={FileText} tone="blue" size="sm" rounded="full" />} title="Question-wise Performance" />
          <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {result.perQuestion.map((p, i) => (
              <span
                key={p.id}
                title={p.answered ? (p.correct ? "Correct" : "Incorrect") : "Not answered"}
                className={cn(
                  "flex h-10 items-center justify-center rounded-lg text-sm font-bold",
                  p.correct ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : p.answered ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-slate-100 text-ink-muted ring-1 ring-slate-200",
                )}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-5 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-emerald-500" /> Correct ({result.correct})</span>
            <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-red-400" /> Incorrect ({result.perQuestion.filter((p) => p.answered && !p.correct).length})</span>
            <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full bg-slate-300" /> Unanswered ({result.perQuestion.filter((p) => !p.answered).length})</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <CardHeader icon={<IconTile icon={BarChart3} tone="blue" size="sm" rounded="full" />} title="Topic-wise Performance" />
          <ul className="mt-4 space-y-3">
            {result.topics.map((t) => {
              const p = pct(t.correct, t.total);
              return (
                <li key={t.topic} className="grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,190px)_1fr_auto_auto]">
                  <span className="truncate text-sm text-ink-soft">{t.topic}</span>
                  <span className="text-sm font-bold text-ink sm:order-3">{p}%</span>
                  <ProgressBar value={p} tone={p >= 75 ? "emerald" : p >= 50 ? "amber" : "red"} className="col-span-2 sm:col-span-1 sm:order-2" />
                  <span className="hidden text-xs text-ink-muted sm:order-4 sm:block">{t.correct}/{t.total}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* What's next + impact */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Card className="p-4 sm:p-5">
          <CardHeader icon={<IconTile icon={UserCheck} tone="blue" size="sm" rounded="full" />} title="What's Next?" />
          <ol className="mt-4 space-y-4">
            {[
              { t: "Competency Update", d: updated ? "Your assessment result and verified learning have been used to update your competency profile." : valid ? "Your competency will update once you pass the assessment. Revisit the recommended course and retake." : "Your competency profile has not been updated because the attempt was marked invalid." },
              { t: "View Updated Profile", d: "See how your skills have changed and explore the next recommendations." },
              { t: "Continue Learning", d: "Take the next recommended course or programme to further strengthen your competencies." },
            ].map((s, i) => (
              <li key={s.t} className="relative flex gap-4">
                {i < 2 && <span aria-hidden className="absolute left-4 top-9 h-[calc(100%-8px)] w-px bg-brand-100" />}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <p className="font-semibold text-ink">{s.t}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-4 sm:p-5">
          <CardHeader icon={<IconTile icon={TrendingUp} tone="blue" size="sm" rounded="full" />} title="Competency Impact (Estimated)" />
          <div className={cn("mt-4 rounded-xl p-4", updated ? "bg-brand-50/60" : "bg-slate-50")}>
            <p className="font-display text-sm font-semibold text-ink">{primary.skillName}</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="space-y-2.5">
                {[
                  { k: "Before", v: primary.before, tone: "brand-light" as const },
                  { k: "After", v: primary.after, tone: "blue" as const },
                ].map((r) => (
                  <div key={r.k} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 text-sm">
                    <span className="text-ink-soft">{r.k}</span>
                    <ProgressBar value={r.v} max={5} tone={r.tone} size="md" />
                    <span className="font-semibold text-ink">{r.v.toFixed(1)} <span className="font-normal text-ink-muted">/ 5</span></span>
                  </div>
                ))}
              </div>
              <div className={cn("rounded-xl px-6 py-4 text-center", updated ? "bg-emerald-50" : "bg-slate-100")}>
                <p className={cn("flex items-center justify-center gap-1.5 font-display text-xl font-bold", updated ? "text-emerald-600" : "text-ink-muted")}>
                  <TrendingUp className="size-6" aria-hidden /> {primary.delta > 0 ? "+" : ""}{primary.delta.toFixed(1)}
                </p>
                <p className="text-xs text-ink-soft">{updated ? "Improvement" : "No change"}</p>
              </div>
            </div>
          </div>
          {result.impact.length > 1 && (
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {result.impact.slice(1).map((i) => (
                <li key={i.skillId} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm">
                  <span className="text-ink-soft">{i.skillName}</span>
                  <span className={cn("font-semibold", i.delta > 0 ? "text-emerald-600" : "text-ink-muted")}>{i.delta > 0 ? `+${i.delta.toFixed(1)}` : "0.0"}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            {updated
              ? "Your competency profile has been updated based on assessment performance and role requirements."
              : "Competency only moves when a course is completed, the assessment is passed and integrity is valid. One of these conditions was not met."}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <ButtonLink href={updated ? "/progress" : "/competency"} variant="outline" rightIcon={<ArrowRight className="size-4" />}>
              View Competency Profile
            </ButtonLink>
            <ButtonLink href="/learning" rightIcon={<ArrowRight className="size-4" />}>
              Next Recommendation
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
