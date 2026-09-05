"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Clock, FileQuestion, Lock, PlayCircle, ShieldAlert, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, ProviderBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAppStore } from "@/lib/store/AppStore";
import type { Assessment } from "@/lib/data/assessments";
import { formatDate } from "@/lib/utils";

export default function AssessmentsPage() {
  const { assessments, state, dispatch } = useAppStore();

  const completed = assessments.filter((a) => state.results[a.id]);
  const available = assessments.filter((a) => a.status === "available" && !state.results[a.id]);
  const locked = assessments.filter((a) => a.status === "locked");
  const inProgress = Object.keys(state.attempts);

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assessments" }]}
        title="Assessments"
        subtitle="Verify what you learned. Only a passed, integrity-valid assessment updates your competency profile."
        quote="Completion shows effort. Assessment shows competence."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={ClipboardList} tone="violet" title="Available" value={available.length} caption="Unlocked by verified learning" />
        <StatCard icon={CheckCircle2} tone="emerald" title="Completed" value={completed.length} caption="Results on record" />
        <StatCard icon={Lock} tone="slate" title="Locked" value={locked.length} caption="Awaiting evidence verification" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <CardHeader
              icon={<IconTile icon={PlayCircle} tone="blue" rounded="full" />}
              title="Ready to Take"
              subtitle="Assessments linked to learning that has been verified."
            />
            {available.length === 0 ? (
              <p className="mt-4 rounded-xl bg-surface p-6 text-center text-sm text-ink-muted">No assessments are waiting. Complete a recommended course to unlock one.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {available.map((a) => (
                  <AssessmentRow
                    key={a.id}
                    a={a}
                    resumable={inProgress.includes(a.id)}
                    onDiscard={a.createdAt ? () => dispatch({ type: "attempt/discard", id: a.id }) : undefined}
                  />
                ))}
              </ul>
            )}
          </Card>

          {completed.length > 0 && (
            <Card className="p-4 sm:p-5">
              <CardHeader icon={<IconTile icon={CheckCircle2} tone="emerald" rounded="full" />} title="Completed" subtitle="Your results and their competency impact." />
              <ul className="mt-4 divide-y divide-line">
                {completed.map((a) => {
                  const r = state.results[a.id];
                  const valid = r.integrity !== "invalid";
                  return (
                    <li key={a.id} className="flex flex-col gap-3 py-3 first:pt-1 last:pb-0 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold text-ink">{a.title}</p>
                        <p className="mt-0.5 text-xs text-ink-muted">Submitted {formatDate(r.submittedAt, true)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={r.passed ? "emerald" : "amber"} size="md">{r.scorePct}% {r.passed ? "Pass" : "Below passing"}</Badge>
                        <Badge tone={valid ? (r.integrity === "valid" ? "emerald" : "amber") : "red"} size="md">
                          {valid ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
                          Integrity {r.integrity === "valid" ? "Valid" : r.integrity === "review" ? "Under Review" : "Invalid"}
                        </Badge>
                        <ButtonLink href={`/assessments/${a.id}/result`} variant="outline" size="sm" rightIcon={<ArrowRight className="size-4" />}>
                          View Result
                        </ButtonLink>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <Card className="p-4 sm:p-5">
            <CardHeader icon={<IconTile icon={Lock} tone="slate" rounded="full" />} title="Locked" subtitle="Unlocked automatically once the linked learning is verified." />
            <ul className="mt-4 space-y-3">
              {locked.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 rounded-xl border border-dashed border-line bg-surface/60 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ProviderBadge provider={a.provider} />
                      <p className="font-display text-sm font-semibold text-ink">{a.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{a.lockedReason}</p>
                  </div>
                  <Link href="/evidence" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
                    Check evidence status <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white sm:p-6">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-white/15">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold">Assessment Studio</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85">
              Create a competency assessment from learning material. The retrieval pipeline extracts key concepts and assembles a question pool for review.
            </p>
            <ButtonLink href="/assessments/studio" variant="outline" className="mt-4 w-full border-white bg-white text-brand-700 hover:bg-brand-50" rightIcon={<ArrowRight className="size-4" />}>
              Open Studio
            </ButtonLink>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeader icon={<IconTile icon={ShieldCheck} tone="emerald" size="sm" rounded="full" />} title="How integrity works" />
            <ul className="mt-3 space-y-2.5 text-sm text-ink-soft">
              {[
                "Assessments run full-screen with live, on-device proctoring.",
                "Tab switches, focus loss, copy/paste and shortcuts are recorded as integrity events.",
                "Three events end the attempt and mark it invalid.",
                "Only a passed attempt with valid integrity updates your competency.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeader icon={<IconTile icon={FileQuestion} tone="blue" size="sm" rounded="full" />} title="Question source" />
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Items are drawn from curated, topic-tagged question banks behind a retrieval-shaped interface. Question order and option order are randomised per attempt.
            </p>
            <Badge tone="slate" className="mt-3">Prototype: generation simulated</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AssessmentRow({ a, resumable, onDiscard }: { a: Assessment; resumable: boolean; onDiscard?: () => void }) {
  return (
    <li className="flex flex-col gap-4 rounded-xl border border-line p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <ProviderBadge provider={a.provider} />
          {a.createdAt && <Badge tone="violet">Studio</Badge>}
          {resumable && <Badge tone="amber" dot>In progress</Badge>}
        </div>
        <p className="mt-2 font-display text-base font-bold leading-snug text-ink">{a.title}</p>
        <p className="mt-0.5 text-sm text-ink-soft">Linked course: {a.linkedCourseTitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5"><FileQuestion className="size-3.5 text-ink-muted" /> {a.questions.length} questions</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5 text-ink-muted" /> {a.timeLimitMin} minutes</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-ink-muted" /> Pass at {a.passingPct}%</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onDiscard && resumable && (
          <Button variant="ghost" size="sm" onClick={onDiscard} leftIcon={<Trash2 className="size-4" />}>
            Discard
          </Button>
        )}
        <ButtonLink href={`/assessments/${a.id}`} size="md" rightIcon={<ArrowRight className="size-4" />}>
          {resumable ? "Resume" : "Start"}
        </ButtonLink>
      </div>
    </li>
  );
}
