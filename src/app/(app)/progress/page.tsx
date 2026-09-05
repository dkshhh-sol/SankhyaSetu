"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, ClipboardCheck, Compass, Minus, Target, TrendingDown, TrendingUp, Trophy, UserCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkillRadar } from "@/components/charts/SkillRadar";
import { COMPETENCY_LEVELS } from "@/lib/data/competencies";
import { PROVIDER_FULL } from "@/lib/data/courses";
import { useLatestUpdate } from "@/lib/hooks/useLatestUpdate";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/cn";

export default function ProgressPage() {
  const u = useLatestUpdate();
  const providerName = u.assessment ? PROVIDER_FULL[u.assessment.provider] : "iGOT Karmayogi";

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Competency", href: "/competency" }, { label: "Updated Profile" }]}
        title="Updated Competency Profile"
        subtitle="Your learning and assessment results have been incorporated into your competency profile."
        quote="Continuous learning enables a more capable, evidence-driven India."
      />

      <Card className={cn("flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between", u.applied ? "border-emerald-100 bg-emerald-50/60" : "border-amber-100 bg-amber-50/60")}>
        <div className="flex items-center gap-4">
          <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-full text-white", u.applied ? "bg-emerald-500" : "bg-amber-500")}>
            <CheckCircle2 className="size-8" aria-hidden />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-ink">{u.applied ? "Your competency profile has been updated!" : "Your latest attempt did not update your profile."}</p>
            <p className="text-sm text-ink-soft">
              {u.applied
                ? "Based on your verified learning and assessment performance, the following competencies have been updated."
                : "Competency only moves after a passed assessment with valid integrity. The comparison below shows the unchanged profile."}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-sm text-ink-soft sm:text-right">
          Updated on
          <br />
          <span className="font-semibold text-ink">{formatDate(u.updatedAt, true)}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card className="p-5 sm:p-6">
            <CardHeader
              icon={<IconTile icon={BarChart3} tone="blue" rounded="full" />}
              title="Competency Comparison"
              subtitle="See how your competencies have improved."
              action={<Legend />}
            />
            <ul className="mt-5 space-y-4">
              {u.rows.slice(0, 4).map((r) => (
                <li key={r.skillId} className="grid grid-cols-1 gap-2 sm:grid-cols-[170px_1fr_90px] sm:items-center sm:gap-4">
                  <span className="text-sm font-medium text-ink">{r.name}</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={r.before} max={5} tone="brand-light" size="sm" />
                      <span className="w-8 text-xs text-ink-soft">{r.before.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={r.after} max={5} tone="blue" size="md" />
                      <span className="w-8 text-xs font-semibold text-ink">{r.after.toFixed(1)}</span>
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1.5 font-display text-base font-bold sm:justify-end", r.delta > 0 ? "text-emerald-600" : r.delta < 0 ? "text-red-500" : "text-ink-muted")}>
                    {r.delta > 0 ? <TrendingUp className="size-5" /> : r.delta < 0 ? <TrendingDown className="size-5" /> : <Minus className="size-5" />}
                    {r.delta > 0 ? "+" : ""}{r.delta.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader
              icon={<IconTile icon={UserCircle} tone="blue" rounded="full" />}
              title="Your Competency Profile"
              subtitle="Updated scores across key competencies."
              action={<Legend />}
            />
            <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <SkillRadar data={u.rows.map((r) => ({ name: r.name.replace(" & Methodology", ""), before: r.before, after: r.after }))} />
              <div className="rounded-2xl bg-surface p-4">
                <p className="font-display text-sm font-bold text-ink">Competency Levels</p>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {COMPETENCY_LEVELS.map((l) => (
                    <li key={l.label} className="flex items-center gap-3">
                      <span className={cn("size-3 rounded-full", l.color)} aria-hidden />
                      <span className="w-20 font-semibold text-ink">{l.range}</span>
                      <span className="text-ink-soft">{l.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 sm:p-6">
            <CardHeader icon={<IconTile icon={Trophy} tone="amber" rounded="full" />} title="Key Highlights" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: TrendingUp, tone: "emerald" as const, v: u.improved, k: "Competency", s: "Improved" },
                { icon: TrendingDown, tone: "red" as const, v: 0, k: "Competency", s: "Declined" },
                { icon: Target, tone: "blue" as const, v: u.overallAfter.toFixed(1), k: "Overall Competency", s: `Score (${u.overallAfter >= u.overallBefore ? "+" : ""}${(u.overallAfter - u.overallBefore).toFixed(1)})` },
                { icon: ClipboardCheck, tone: "violet" as const, v: `${u.scorePct}%`, k: "Assessment", s: "Score" },
              ].map((h) => (
                <div key={h.k + h.s} className="rounded-2xl border border-line p-3.5">
                  <div className="flex items-center gap-3">
                    <IconTile icon={h.icon} tone={h.tone} size="sm" rounded="full" />
                    <p className="font-display text-2xl font-extrabold leading-none text-ink">{h.v}</p>
                  </div>
                  <p className="mt-2 text-xs text-ink-soft">{h.k}</p>
                  <p className="text-xs text-ink-muted">{h.s}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader icon={<IconTile icon={BookOpen} tone="blue" rounded="full" />} title="Verified Learning Used" />
            <div className="mt-4 flex gap-4 rounded-2xl border border-line p-4">
              <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-brand-50 font-display text-lg font-extrabold text-brand-700">{u.assessment?.provider ?? "iGOT"}</span>
              <div className="min-w-0">
                <p className="font-display text-[15px] font-bold leading-snug text-ink">{u.assessment?.linkedCourseTitle}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{u.evidence ? `Completed on ${u.evidence.date}` : providerName}</p>
                <ul className="mt-2 space-y-1 text-xs text-ink-soft">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-500" /> Course completion verified (via {u.assessment?.provider ?? "iGOT"})</li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className={cn("size-3.5", u.integrity === "invalid" ? "text-red-500" : "text-emerald-500")} /> Assessment score: {u.scorePct}% ({u.integrity === "valid" ? "Valid" : u.integrity === "review" ? "Under review" : "Invalid"})
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader icon={<IconTile icon={Compass} tone="blue" rounded="full" />} title="Next Steps" subtitle="Keep building your skills! Here are your next recommended actions." />
            <ul className="mt-4 space-y-2.5">
              {[
                { icon: BarChart3, t: "Explore Advanced Statistical Methods", d: "Addresses your next key skill gap", href: "/learning/advanced-statistical-methods" },
                { icon: BookOpen, t: "View Personalized Learning Recommendations", d: "Find relevant iGOT and NSSTA/TPAC programmes", href: "/learning" },
              ].map((n) => (
                <li key={n.t}>
                  <Link href={n.href} className="flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
                    <IconTile icon={n.icon} tone="blue" size="sm" rounded="full" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{n.t}</span>
                      <span className="block text-xs text-ink-muted">{n.d}</span>
                    </span>
                    <ArrowRight className="size-4 text-brand-600" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href="/learning" className="mt-4 w-full" rightIcon={<ArrowRight className="size-4" />}>
              Go to Learning Recommendations
            </ButtonLink>
            <Link href="/progress/update" className="mt-3 block text-center text-sm font-semibold text-brand-600 hover:text-brand-700">
              See the detailed competency update
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <span className="flex items-center gap-4 text-sm text-ink-soft">
      <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-brand-300" /> Before</span>
      <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-brand-600" /> After</span>
    </span>
  );
}
