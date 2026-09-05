"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BarChart3, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Clock, Hourglass, Info, Landmark } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { ButtonLink } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { EVIDENCE, VERIFICATION_STEPS, type EvidenceRecord, type EvidenceStatus } from "@/lib/data/evidence";
import { useAppStore } from "@/lib/store/AppStore";
import { cn } from "@/lib/cn";

type Filter = "all" | "igot" | "nssta" | "pending";

const STATUS: Record<EvidenceStatus, { label: string; tone: "emerald" | "amber" | "slate"; icon: typeof CheckCircle2 }> = {
  verified: { label: "Verified", tone: "emerald", icon: CheckCircle2 },
  "in-progress": { label: "In Progress", tone: "amber", icon: Clock },
  pending: { label: "Pending Verification", tone: "slate", icon: Hourglass },
};

export default function EvidencePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { state } = useAppStore();

  const igot = EVIDENCE.filter((e) => e.provider === "iGOT");
  const programmes = EVIDENCE.filter((e) => e.provider !== "iGOT");
  const pending = EVIDENCE.filter((e) => e.status === "pending");
  const list = filter === "igot" ? igot : filter === "nssta" ? programmes : filter === "pending" ? pending : EVIDENCE;

  const verified = EVIDENCE.filter((e) => e.status === "verified").length;
  const inProgress = EVIDENCE.filter((e) => e.status === "in-progress").length;
  const pendingAssessments = EVIDENCE.filter((e) => e.status === "verified" && e.assessmentId && !state.results[e.assessmentId]).length;

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning Evidence" }]}
        title="Learning Evidence"
        subtitle="Track your completed learning and see how it contributes to your competency growth."
        quote="Evidence-based learning drives better governance."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div>
          <Tabs
            value={filter}
            onChange={setFilter}
            items={[
              { id: "all", label: "All Learning" },
              { id: "igot", label: `iGOT Courses (${igot.length})` },
              { id: "nssta", label: `NSSTA / TPAC Programmes (${programmes.length})` },
              { id: "pending", label: `Pending Verification (${pending.length})` },
            ]}
          />
          <ul className="mt-4 space-y-3">
            {list.map((e) => (
              <EvidenceRow key={e.id} record={e} completedAssessment={!!(e.assessmentId && state.results[e.assessmentId])} />
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckCircle2 className="size-8" strokeWidth={2.2} aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Verified Learning Evidence</h2>
                <p className="mt-1 text-sm text-ink-soft">Your completed learning is automatically verified through iGOT Karmayogi and NSSTA/TPAC integrations.</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-3 divide-x divide-line border-t border-line pt-4">
              {[
                { icon: BookOpen, n: verified, k: "Verified" },
                { icon: Clock, n: inProgress, k: "In Progress" },
                { icon: Hourglass, n: pending.length, k: "Pending" },
              ].map((s) => (
                <div key={s.k} className="flex items-center justify-center gap-2.5 px-2">
                  <s.icon className="size-6 text-brand-600" aria-hidden />
                  <div>
                    <dd className="font-display text-2xl font-extrabold leading-none text-ink">{s.n}</dd>
                    <dt className="text-xs text-ink-muted">{s.k}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <IconTile icon={Info} tone="blue" size="sm" rounded="full" />
              <h2 className="font-display text-base font-bold text-ink">How verification works?</h2>
            </div>
            <ol className="mt-4 space-y-4">
              {VERIFICATION_STEPS.map((s, i) => (
                <li key={s} className="relative flex gap-4 pl-1">
                  {i < VERIFICATION_STEPS.length - 1 && <span aria-hidden className="absolute left-[19px] top-9 h-[calc(100%-14px)] w-px bg-brand-100" />}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{i + 1}</span>
                  <p className="pt-1 text-sm leading-relaxed text-ink-soft">{s}</p>
                </li>
              ))}
            </ol>
            <Link href="/help#verification" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Learn more about verification <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50/60 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <BarChart3 className="size-6" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Next Step</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {pendingAssessments > 0
                    ? `You have ${pendingAssessments} verified ${pendingAssessments === 1 ? "learning" : "learnings"} with pending assessments. Take the assessment to update your competency profile.`
                    : "All your verified learning has been assessed. Explore new recommendations to keep growing."}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/assessments" rightIcon={<ArrowRight className="size-4" />} className="flex-1">
                Go to Assessments
              </ButtonLink>
              <ButtonLink href="/competency" variant="outline" className="flex-1">
                View Competency Profile
              </ButtonLink>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EvidenceRow({ record, completedAssessment }: { record: EvidenceRecord; completedAssessment: boolean }) {
  const st = STATUS[record.status];
  const href =
    record.status === "verified" && record.assessmentId
      ? completedAssessment
        ? `/assessments/${record.assessmentId}/result`
        : `/assessments/${record.assessmentId}`
      : `/learning/${record.courseId}`;
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card transition-colors hover:border-brand-200",
          record.status === "in-progress" && "border-amber-100",
        )}
      >
        <ProviderTile record={record} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-bold leading-snug text-ink sm:text-base">{record.title}</p>
          <p className="text-sm text-ink-muted">{record.providerLabel}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-ink-muted" aria-hidden />
              {record.status === "in-progress" ? "Started on" : "Completed on"} {record.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-ink-muted" aria-hidden /> {record.duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {record.provider === "iGOT" ? <BarChart3 className="size-3.5 text-ink-muted" aria-hidden /> : <Landmark className="size-3.5 text-ink-muted" aria-hidden />}
              {record.level}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={st.tone} size="md" className="hidden sm:inline-flex">
            <st.icon className="size-4" aria-hidden /> {st.label}
          </Badge>
          <Badge tone={st.tone} className="sm:hidden">
            <st.icon className="size-3.5" aria-hidden />
          </Badge>
          <ChevronRight className="size-5 text-ink-muted" aria-hidden />
        </div>
      </Link>
    </li>
  );
}

function ProviderTile({ record }: { record: EvidenceRecord }) {
  if (record.tile === "python") {
    return <img src="/images/course-python-large.png" alt="" className="size-[72px] shrink-0 rounded-xl object-cover" draggable={false} />;
  }
  const tone =
    record.provider === "iGOT"
      ? "bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700"
      : record.provider === "NSSTA"
        ? "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700"
        : "bg-gradient-to-br from-violet-50 to-violet-100 text-violet-700";
  return (
    <span className={cn("flex size-[72px] shrink-0 items-center justify-center rounded-xl font-display text-lg font-extrabold", tone)} aria-hidden>
      {record.provider}
    </span>
  );
}
