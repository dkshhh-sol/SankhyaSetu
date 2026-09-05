"use client";

import { useState } from "react";
import { BarChart3, CalendarDays, FileText, Sparkles, Target, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Donut } from "@/components/ui/Donut";
import { Badge, PriorityBadge, ProviderBadge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { ButtonLink } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { StatCard } from "@/components/dashboard/StatCard";
import { CompetencyBarChart } from "@/components/charts/CompetencyBarChart";
import { ASSESSMENT_HISTORY } from "@/lib/data/activity";
import { LAST_UPDATED, overallLabel, type Priority } from "@/lib/data/competencies";
import { RECOMMENDED_COURSES } from "@/lib/data/courses";
import { useCompetency } from "@/lib/hooks/useCompetency";
import { useAppStore } from "@/lib/store/AppStore";
import { formatDate } from "@/lib/utils";

type Filter = "All" | Priority;

export default function CompetencyPage() {
  const c = useCompetency();
  const { state, assessments } = useAppStore();
  const [filter, setFilter] = useState<Filter>("All");

  const rows = filter === "All" ? c.gaps : c.gaps.filter((g) => g.priority === filter);

  const history = [
    ...Object.values(state.results)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .map((r) => ({
        id: r.assessmentId,
        date: formatDate(r.submittedAt),
        name: assessments.find((a) => a.id === r.assessmentId)?.primarySkillName ?? r.assessmentId,
        type: "Assessment" as const,
        score: r.scorePct,
        level: r.impact[0]?.after ?? 0,
        improved: r.impact[0]?.delta > 0,
      })),
    ...ASSESSMENT_HISTORY,
  ].slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Competency" }]}
        title="My Competency Profile"
        subtitle="Understand your current strengths, identify skill gaps, and build your growth path."
        quote="Continuous learning builds a stronger, more data-driven India."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BarChart3} tone="blue" title="Overall Competency Level">
          <div className="mt-3 flex items-center gap-4">
            <Donut value={c.overall / 5} size={96} stroke={10}>
              <span className="font-display text-2xl font-extrabold leading-none text-ink">{c.overall.toFixed(1)}</span>
              <span className="text-[11px] text-ink-muted">/ 5.0</span>
            </Donut>
            <div>
              <p className="font-display text-lg font-bold text-ink">{overallLabel(c.overall)}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                <TrendingUp className="size-4" aria-hidden /> +{c.overallDelta.toFixed(1)}
              </p>
              <p className="text-xs text-ink-muted">since last assessment</p>
            </div>
          </div>
        </StatCard>
        <StatCard icon={Sparkles} tone="emerald" title="Strengths" value={c.strengths} caption="Domains above 3.5" />
        <StatCard icon={Target} tone="rose" title="Focus Areas" value={c.gapCounts.High} caption="High-priority skill gaps" />
        <StatCard icon={CalendarDays} tone="blue" title="Last Updated">
          <div className="mt-3">
            <p className="font-display text-[26px] font-extrabold leading-none text-ink">
              {c.lastUpdated ? formatDate(c.lastUpdated) : LAST_UPDATED}
            </p>
            <p className="mt-2 text-sm text-ink-soft">Based on latest assessments and learning activity</p>
          </div>
        </StatCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="p-5 sm:p-6">
          <CardHeader title="Competency by Domain" action={<LinkArrow href="/learning">View Role Requirements</LinkArrow>} />
          <div className="mt-4">
            <CompetencyBarChart domains={c.domains} />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader title="Skill Gap Analysis" action={<LinkArrow href="/learning">View All Gaps</LinkArrow>} />
          <Tabs
            variant="pills"
            className="mt-4"
            value={filter}
            onChange={setFilter}
            items={[
              { id: "All", label: `All (${c.gaps.length})` },
              { id: "High", label: `High (${c.gapCounts.High})`, icon: <span className="size-2 rounded-full bg-red-500" /> },
              { id: "Medium", label: `Medium (${c.gapCounts.Medium})` },
              { id: "Low", label: `Low (${c.gapCounts.Low})` },
            ]}
          />
          <div className="mt-4 overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[440px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-ink-muted">
                  <th className="pb-2 font-semibold">Skill / Competency</th>
                  <th className="pb-2 text-center font-semibold">Current Level</th>
                  <th className="pb-2 text-center font-semibold">Required Level</th>
                  <th className="pb-2 text-center font-semibold">Gap</th>
                  <th className="pb-2 text-right font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((g) => (
                  <tr key={g.skillId}>
                    <td className="py-2.5 pr-2 font-medium text-ink">{g.name}</td>
                    <td className="py-2.5 text-center text-ink-soft">{g.level.toFixed(1)}</td>
                    <td className="py-2.5 text-center text-ink-soft">{g.required.toFixed(1)}</td>
                    <td className={`py-2.5 text-center font-bold ${g.priority === "High" ? "text-red-500" : g.priority === "Medium" ? "text-amber-500" : "text-ink"}`}>
                      {g.gap.toFixed(1)}
                    </td>
                    <td className="py-2.5 text-right">
                      <PriorityBadge priority={g.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card className="p-5 sm:p-6">
          <CardHeader title="Assessment History" action={<LinkArrow href="/assessments">View All Assessments</LinkArrow>} />
          <div className="mt-4 overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="rounded-xl bg-surface text-left text-xs font-semibold text-ink-muted">
                  <th className="rounded-l-xl px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Assessment</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Score</th>
                  <th className="rounded-r-xl px-3 py-2.5">Competency Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="px-3 py-3 text-ink-soft">{h.date}</td>
                    <td className="px-3 py-3 font-medium text-ink">{h.name}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-2 text-ink-soft">
                        <IconTile icon={FileText} tone={h.type === "Quiz" ? "blue" : "emerald"} size="sm" /> {h.type}
                      </span>
                    </td>
                    <td className={`px-3 py-3 font-bold ${h.score >= 80 ? "text-emerald-600" : h.score >= 70 ? "text-amber-500" : "text-orange-500"}`}>{h.score}%</td>
                    <td className="px-3 py-3 font-semibold text-ink">
                      {h.improved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <TrendingUp className="size-4" aria-hidden /> {h.level.toFixed(1)}
                        </span>
                      ) : (
                        h.level.toFixed(1)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader title="Recommended Next Steps" action={<LinkArrow href="/learning">View Learning Path</LinkArrow>} />
          <ul className="mt-4 space-y-3">
            {RECOMMENDED_COURSES.slice(0, 3).map((course) => (
              <li key={course.id} className="flex flex-col gap-3 rounded-2xl border border-line p-3.5 sm:flex-row sm:items-center">
                <img src={course.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" draggable={false} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15px] font-bold leading-snug text-ink">{course.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
                    <ProviderBadge provider={course.provider} />
                    <span>{course.duration}</span>
                    <span aria-hidden>&bull;</span>
                    <span>{course.level}</span>
                  </p>
                </div>
                <ButtonLink href={`/learning/${course.id}`} size="sm" className="sm:shrink-0">
                  Start Learning
                </ButtonLink>
              </li>
            ))}
          </ul>
          <Badge tone="slate" className="mt-4">
            Recommendations sourced from iGOT Karmayogi, NSSTA and TPAC only
          </Badge>
        </Card>
      </div>
    </div>
  );
}
