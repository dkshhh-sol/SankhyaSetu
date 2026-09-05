"use client";

import { BarChart3, BookOpen, CheckCircle2, ClipboardList, GraduationCap, ShieldCheck, TrendingUp, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Donut, MultiDonut } from "@/components/ui/Donut";
import { ProgressBar, toneForLevel } from "@/components/ui/ProgressBar";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { IconTile, type TileTone } from "@/components/ui/IconTile";
import { PriorityBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { DomainIcon } from "@/components/dashboard/DomainIcon";
import { RECOMMENDED_COURSES } from "@/lib/data/courses";
import { RECENT_ACTIVITY, type ActivityKind } from "@/lib/data/activity";
import { overallLabel } from "@/lib/data/competencies";
import { useCompetency } from "@/lib/hooks/useCompetency";
import { useAppStore } from "@/lib/store/AppStore";
import { greeting } from "@/lib/utils";

const ACTIVITY_ICON: Record<ActivityKind, { icon: typeof CheckCircle2; tone: TileTone }> = {
  assessment: { icon: CheckCircle2, tone: "emerald" },
  course: { icon: BookOpen, tone: "blue" },
  badge: { icon: Trophy, tone: "amber" },
  competency: { icon: BarChart3, tone: "sky" },
};

export default function DashboardPage() {
  const { session, state } = useAppStore();
  const c = useCompetency();

  /**
   * An official who just completed onboarding has no platform history, so the
   * seeded demo activity and evidence counts would contradict the account.
   * Their dashboard is driven entirely by the baseline they just produced.
   */
  const onboarded = session?.method === "onboarding" ? state.onboarding.result : undefined;

  const activity = onboarded
    ? [
        {
          id: "baseline",
          kind: "assessment" as const,
          title: "Completed Baseline Assessment",
          detail: `${onboarded.overallPct}% - ${onboarded.correct} of ${onboarded.total} correct`,
          when: "Just now",
        },
        {
          id: "profile",
          kind: "competency" as const,
          title: "Competency Profile Created",
          detail: `${onboarded.competencies.length} competencies estimated for ${onboarded.roleName}`,
          when: "Just now",
        },
      ]
    : [
        ...Object.values(state.results)
          .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
          .slice(0, 1)
          .map((r) => ({
            id: r.assessmentId,
            kind: "assessment" as const,
            title: r.passed && r.integrity !== "invalid" ? "Completed Assessment" : "Assessment Attempted",
            detail: `${r.scorePct}% - ${r.integrity === "invalid" ? "integrity flagged" : r.passed ? "passed" : "not passed"}`,
            when: "Just now",
          })),
        ...RECENT_ACTIVITY,
      ].slice(0, 4);

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <>
            {greeting()}, <span className="text-brand-600">{session?.firstName}!</span>
          </>
        }
        subtitle="Keep learning, keep growing. Your work strengthens India's statistical ecosystem."
      />

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BarChart3} tone="blue" title="Overall Competency">
          <div className="mt-2 flex items-center gap-3">
            <Donut value={c.overall / 5} size={64} stroke={7} color="#16a34a" track="#e5e7eb">
              <span className="font-display text-lg font-bold leading-none text-ink">{c.overall.toFixed(1)}</span>
              <span className="text-[10px] text-ink-muted">/ 5.0</span>
            </Donut>
            <div>
              <p className="font-display text-[15px] font-semibold text-ink">{overallLabel(c.overall)}</p>
              {onboarded ? (
                <>
                  <p className="mt-0.5 text-[13px] font-semibold text-brand-600">Baseline</p>
                  <p className="text-[11px] text-ink-muted">from onboarding assessment</p>
                </>
              ) : (
                <>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600">
                    <TrendingUp className="size-4" aria-hidden /> +{c.overallDelta.toFixed(1)}
                  </p>
                  <p className="text-[11px] text-ink-muted">since last assessment</p>
                </>
              )}
            </div>
          </div>
        </StatCard>
        <StatCard
          icon={GraduationCap}
          tone="blue"
          title="Active Learning"
          value={c.activeLearning}
          caption={onboarded ? "Recommended for You" : "Courses in Progress"}
          link={{ href: "/learning", label: "View Courses" }}
        />
        <StatCard
          icon={ClipboardList}
          tone="violet"
          title="Pending Assessments"
          value={c.pendingAssessments.length}
          caption="Scheduled / Recommended"
          link={{ href: "/assessments", label: "View Assessments" }}
        />
        <StatCard
          icon={ShieldCheck}
          tone="emerald"
          title="Verified Evidence"
          value={onboarded ? 0 : c.verifiedEvidence}
          caption={onboarded ? "Complete a course to add evidence" : "Completed & Verified"}
          link={{ href: "/evidence", label: "View Evidence" }}
        />
      </div>

      {/* Competency overview + skill gaps */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card className="p-4 sm:p-5">
          <CardHeader title="Competency Overview" action={<LinkArrow href="/competency">View Detailed Profile</LinkArrow>} />
          <ul className="mt-3 space-y-2">
            {c.domains.map((d) => (
              <li key={d.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:grid-cols-[auto_minmax(0,220px)_1fr_auto] sm:gap-4">
                <DomainIcon icon={d.icon} accent={d.accent} size="sm" />
                <span className="text-sm font-medium text-ink-soft sm:col-span-1">{d.name}</span>
                <ProgressBar value={d.level} max={5} tone={toneForLevel(d.level, d.required)} className="col-span-3 sm:col-span-1" size="sm" />
                <span className="hidden text-sm font-semibold text-ink sm:block">
                  {d.level.toFixed(1)} <span className="font-normal text-ink-muted">/ 5.0</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 sm:p-5">
          <CardHeader title="Skill Gap Summary" action={<LinkArrow href="/competency">View All Gaps</LinkArrow>} />
          <div className="mt-3 flex flex-wrap items-center gap-5">
            <MultiDonut
              size={96}
              stroke={12}
              segments={[
                { value: c.gapCounts.High, color: "#ef4444" },
                { value: c.gapCounts.Medium, color: "#f59e0b" },
                { value: c.gapCounts.Low, color: "#7fb8b0" },
              ]}
            >
              <span className="font-display text-xl font-bold leading-none text-ink">{c.gaps.length}</span>
              <span className="mt-1 text-xs text-ink-muted">Skill Gaps</span>
            </MultiDonut>
            <ul className="flex-1 space-y-2.5 text-sm">
              {(
                [
                  ["High Priority", c.gapCounts.High, "bg-red-500"],
                  ["Medium Priority", c.gapCounts.Medium, "bg-amber-400"],
                  ["Low Priority", c.gapCounts.Low, "bg-[#7fb8b0]"],
                ] as const
              ).map(([label, n, dot]) => (
                <li key={label} className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-ink-soft">
                    <span className={`size-2.5 rounded-full ${dot}`} aria-hidden /> {label}
                  </span>
                  <span className="font-bold text-ink">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 rounded-xl bg-surface p-3">
            <p className="font-display text-sm font-semibold text-ink">Top Skill Gaps</p>
            <ol className="mt-2 space-y-2">
              {c.gaps.slice(0, 3).map((g, i) => (
                <li key={g.skillId} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2.5 text-ink-soft">
                    <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-bold text-ink-muted ring-1 ring-line">{i + 1}</span>
                    {g.name}
                  </span>
                  <PriorityBadge priority={g.priority} />
                </li>
              ))}
            </ol>
          </div>
        </Card>
      </div>

      {/* Recommendations + activity */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.75fr_1fr]">
        <Card className="p-4 sm:p-5">
          <CardHeader title="Recommended for You" action={<LinkArrow href="/learning">View All Recommendations</LinkArrow>} />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RECOMMENDED_COURSES.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} variant="compact" />
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <CardHeader title="Recent Activity" action={<LinkArrow href="/evidence">View All</LinkArrow>} />
          <ul className="mt-4 divide-y divide-line">
            {activity.map((a) => {
              const meta = ACTIVITY_ICON[a.kind];
              return (
                <li key={a.id} className="flex items-start gap-3 py-3 first:pt-1 last:pb-0">
                  <IconTile icon={meta.icon} tone={meta.tone} rounded="full" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{a.title}</p>
                    <p className="text-sm text-ink-soft">{a.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-muted">{a.when}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
