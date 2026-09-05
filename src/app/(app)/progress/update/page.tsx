"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, FileText, Lightbulb, Target, Trophy, TrendingUp, UserCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getCourse, PROVIDER_FULL } from "@/lib/data/courses";
import { round1 } from "@/lib/data/competencies";
import { useLatestUpdate } from "@/lib/hooks/useLatestUpdate";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/cn";

export default function CompetencyUpdatePage() {
  const u = useLatestUpdate();
  const p = u.primary;
  const next = getCourse("python-for-data-analysis")!;
  const providerName = u.assessment ? PROVIDER_FULL[u.assessment.provider] : "iGOT Karmayogi";

  const statusOf = (gap: number, delta: number) => {
    if (delta > 0 && gap <= 0.6) return { label: "On Track", tone: "emerald" as const, gapTone: "blue" as const };
    if (gap >= 1.0) return { label: "Needs Focus", tone: "red" as const, gapTone: "red" as const };
    return { label: "In Progress", tone: "amber" as const, gapTone: "amber" as const };
  };

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Progress", href: "/progress" }, { label: "Competency Update" }]}
        title="Competency Update"
        subtitle="Your verified learning and assessment has contributed to your competency growth."
        quote="Investing in people's capabilities builds a stronger, more data-driven India."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <IconTile icon={BarChart3} tone="blue" size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-base font-semibold text-ink">{p.skillName}</h2>
                  <Badge tone={u.applied ? "emerald" : "amber"} size="md">{u.applied ? "Competency Improved" : "No Change Applied"}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {u.applied ? "Your competency has been updated based on verified learning evidence and assessment performance." : "The assessment did not meet the pass and integrity conditions required to update this competency."}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr_1fr] sm:items-center">
              <div className="rounded-xl bg-surface p-4">
                <p className="text-sm font-semibold text-ink">Before</p>
                <p className="mt-1 font-display text-2xl font-bold text-ink">{p.before.toFixed(1)} <span className="text-base font-semibold text-ink-muted">/ 5</span></p>
                <ProgressBar value={p.before} max={5} tone="red" className="mt-3" />
              </div>
              <ArrowRight className="mx-auto hidden size-7 text-brand-600 sm:block" aria-hidden />
              <div className="rounded-xl bg-surface p-4">
                <p className="text-sm font-semibold text-ink">After</p>
                <p className="mt-1 font-display text-2xl font-bold text-ink">{p.after.toFixed(1)} <span className="text-base font-semibold text-ink-muted">/ 5</span></p>
                <ProgressBar value={p.after} max={5} tone="blue" className="mt-3" />
              </div>
              <div className={cn("rounded-xl p-4 text-center", u.applied ? "bg-emerald-50" : "bg-slate-100")}>
                <p className={cn("flex items-center justify-center gap-2 font-display text-2xl font-bold", u.applied ? "text-emerald-600" : "text-ink-muted")}>
                  <TrendingUp className="size-6" aria-hidden /> {p.delta > 0 ? "+" : ""}{p.delta.toFixed(1)}
                </p>
                <p className="text-xs text-ink-soft">Competency Improvement</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeader icon={<IconTile icon={UserCircle} tone="blue" rounded="full" />} title="Competency Profile" subtitle="See how your overall competencies look after this update." />
            <div className="mt-4 overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-ink-muted">
                    <th className="pb-2">Competency</th>
                    <th className="pb-2 text-center">Previous Score</th>
                    <th className="pb-2 text-center">Updated Score</th>
                    <th className="pb-2 text-center">Gap (to required)</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {u.rows.slice(0, 4).map((r) => {
                    const gap = round1(Math.max(0, r.required - r.after));
                    const st = statusOf(gap, r.delta);
                    return (
                      <tr key={r.skillId}>
                        <td className="py-2.5 font-medium text-ink">{r.name}</td>
                        <td className="py-2.5 text-center text-ink-soft">{r.before.toFixed(1)}</td>
                        <td className="py-2.5 text-center">
                          <span className={cn("inline-block rounded-md px-3 py-1 font-semibold", r.delta > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-ink")}>{r.after.toFixed(1)}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={cn("inline-block rounded-md px-3 py-1 font-semibold", st.gapTone === "red" ? "bg-red-50 text-red-600" : st.gapTone === "amber" ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-700")}>{gap.toFixed(1)}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <Badge tone={st.tone} size="md">{st.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeader icon={<IconTile icon={Lightbulb} tone="blue" rounded="full" />} title="What This Means" />
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:divide-x sm:divide-line">
              {[
                { icon: Trophy, t: "Stronger Competency", d: "You are now closer to the required proficiency level." },
                { icon: Target, t: "Greater Opportunities", d: "Enhanced skills help you contribute to higher impact projects." },
                { icon: BarChart3, t: "Continue Your Journey", d: "Keep learning to further strengthen your competencies and support a data-driven India." },
              ].map((m) => (
                <div key={m.t} className="flex gap-3 sm:px-4 sm:first:pl-0 sm:last:pr-0">
                  <m.icon className="size-4.5 shrink-0 text-brand-600" aria-hidden />
                  <div>
                    <p className="font-semibold text-ink">{m.t}</p>
                    <p className="mt-1 text-sm text-ink-soft">{m.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <CardHeader icon={<IconTile icon={FileText} tone="blue" rounded="full" />} title="Evidence Used for Update" />
            <ol className="mt-4 space-y-4">
              {[
                { t: `${u.assessment?.provider ?? "iGOT"} Course Completed`, d: u.assessment?.linkedCourseTitle ?? "", meta: u.evidence?.date ?? "", tag: "Verified", ok: true },
                { t: "Assessment Completed", d: `Score: ${u.scorePct}%`, meta: formatDate(u.updatedAt), tag: u.scorePct >= (u.assessment?.passingPct ?? 70) ? "Valid" : "Below pass", ok: u.scorePct >= (u.assessment?.passingPct ?? 70) },
                { t: "Assessment Integrity", d: u.integrity === "valid" ? "No suspicious activity detected" : u.integrity === "review" ? "Minor events recorded" : "Critical events recorded", meta: "", tag: u.integrity === "invalid" ? "Invalid" : "Valid", ok: u.integrity !== "invalid" },
              ].map((e, i) => (
                <li key={e.t} className="relative flex gap-3">
                  {i < 2 && <span aria-hidden className="absolute left-[11px] top-7 h-[calc(100%-4px)] w-0.5 bg-emerald-200" />}
                  <CheckCircle2 className={cn("mt-0.5 size-6 shrink-0", e.ok ? "text-emerald-500" : "text-red-500")} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-ink">{e.t}</p>
                      <Badge tone={e.ok ? "emerald" : "red"}>{e.tag}</Badge>
                    </div>
                    <p className="text-sm text-ink-soft">{e.d}</p>
                    {e.meta && <p className="text-xs text-ink-muted">{e.meta}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeader
              icon={<IconTile icon={Target} tone="blue" rounded="full" />}
              title="Skill Gap Reduction"
              subtitle={`You have reduced the skill gap in ${p.skillName} from ${u.gapBefore.toFixed(1)} to ${u.gapAfter.toFixed(1)}.`}
            />
            <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-4">
              <div className="flex h-32 items-end justify-around gap-6 border-b border-line px-4">
                {[
                  { k: "Before", v: u.gapBefore, cls: "bg-red-200" },
                  { k: "After", v: u.gapAfter, cls: "bg-brand-300" },
                ].map((b) => (
                  <div key={b.k} className="flex w-16 flex-col items-center justify-end self-stretch">
                    <span className="font-display text-sm font-semibold text-ink">{b.v.toFixed(1)}</span>
                    <span className={cn("mt-1 w-full rounded-t-md", b.cls)} style={{ height: `${Math.max(8, (b.v / Math.max(u.gapBefore, 0.1)) * 70)}%` }} />
                    <span className="mt-2 text-xs text-ink-soft">{b.k}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-emerald-50 px-5 py-4 text-center">
                <p className="font-display text-2xl font-bold text-emerald-600">{u.reduction}%</p>
                <p className="text-xs text-ink-soft">reduction in skill gap</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeader icon={<IconTile icon={BookOpen} tone="blue" rounded="full" />} title="Next Recommended Action" subtitle="Based on your updated profile, we recommend the next learning opportunity to further strengthen your skills." />
            <div className="mt-4 flex flex-col gap-3 rounded-xl bg-surface p-4 sm:flex-row sm:items-center">
              <img src="/images/course-python-large.png" alt="" className="size-11 shrink-0 rounded-xl object-cover" draggable={false} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-ink">{next.title}</p>
                <p className="text-xs text-ink-muted">{providerName}</p>
                <p className="mt-0.5 text-xs text-ink-soft">Addresses: Python Programming Gap</p>
              </div>
              <ButtonLink href={`/learning/${next.id}`} size="sm" rightIcon={<ArrowRight className="size-4" />}>View Details</ButtonLink>
            </div>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <ButtonLink href="/progress" variant="outline">View Updated Profile</ButtonLink>
            <ButtonLink href="/learning" rightIcon={<ArrowRight className="size-4" />}>Explore More Recommendations</ButtonLink>
          </div>
          <Link href="/competency" className="sr-only">My Competency</Link>
        </div>
      </div>
    </div>
  );
}
