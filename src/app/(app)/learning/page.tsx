"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronRight, GraduationCap, Info, Landmark, LayoutGrid, Search, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { IconTile } from "@/components/ui/IconTile";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { Select, TextInput } from "@/components/ui/Fields";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { COURSES, LEARNING_JOURNEY, RECOMMENDED_COURSES, type Provider } from "@/lib/data/courses";
import { cn } from "@/lib/cn";

type Tab = Provider | "All";

const TABS: Array<{ id: Tab; label: string; icon: typeof BookOpen; title: string; blurb: string }> = [
  { id: "iGOT", label: "iGOT Courses", icon: BookOpen, title: "iGOT Course Catalogue", blurb: "Government-wide online courses to build future-ready skills." },
  { id: "NSSTA", label: "NSSTA Programmes", icon: Landmark, title: "NSSTA Programmes", blurb: "Residential and hybrid programmes from the National Statistical Systems Training Academy." },
  { id: "TPAC", label: "TPAC Training", icon: Users, title: "TPAC Training", blurb: "Training Policy and Advisory Committee programmes for statistical cadres." },
  { id: "All", label: "All Programmes", icon: LayoutGrid, title: "All Programmes", blurb: "Everything available across iGOT, NSSTA and TPAC." },
];

export default function LearningPage() {
  const [tab, setTab] = useState<Tab>("iGOT");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [duration, setDuration] = useState("All");
  const [q, setQ] = useState("");
  const [why, setWhy] = useState(false);

  const categories = useMemo(() => Array.from(new Set(COURSES.map((c) => c.category))).sort(), []);
  const levels = useMemo(() => Array.from(new Set(COURSES.map((c) => c.level))).sort(), []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (tab !== "All" && c.provider !== tab) return false;
      if (category !== "All" && c.category !== category) return false;
      if (level !== "All" && c.level !== level) return false;
      if (duration === "short" && !/Day|2 Weeks/.test(c.duration)) return false;
      if (duration === "medium" && !/3 Weeks|4 Weeks/.test(c.duration)) return false;
      if (duration === "long" && !/5 Weeks|6 Weeks/.test(c.duration)) return false;
      if (s && !(c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s))) return false;
      return true;
    });
  }, [tab, category, level, duration, q]);

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Learning Path" }]}
        title={
          <>
            Your Personalized <span className="text-brand-600">Learning Path</span>
          </>
        }
        subtitle="Curated recommendations to help you bridge skill gaps and grow in your career."
        quote="Investing in people's capabilities today, builds a stronger statistical tomorrow."
      />

      {/* Journey */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <IconTile icon={TrendingUp} tone="blue" size="lg" rounded="full" />
            <div>
              <h2 className="font-display text-base font-semibold text-ink">From Assessment to Impact</h2>
              <p className="text-sm text-ink-soft">Build the skills you need. Earn verifiable evidence. Contribute to a data-driven India.</p>
            </div>
          </div>
          <ButtonLink href="/evidence" variant="outline" size="sm" rightIcon={<ChevronRight className="size-4" />}>
            View Full Path
          </ButtonLink>
        </div>
        <div className="mt-4 overflow-x-auto scrollbar-thin">
          <Stepper className="min-w-[560px]" steps={LEARNING_JOURNEY.map((s) => ({ title: s.title, subtitle: s.subtitle }))} current={2} />
        </div>
      </Card>

      {/* Recommended */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <IconTile icon={GraduationCap} tone="blue" size="lg" rounded="full" />
            <div>
              <h2 className="font-display text-base font-semibold text-ink">Recommended for You</h2>
              <p className="text-sm text-ink-soft">Based on your competency profile and role requirements</p>
            </div>
          </div>
          <button type="button" onClick={() => setWhy((w) => !w)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <Info className="size-4" aria-hidden /> Why these recommendations?
          </button>
        </div>
        {why && (
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm leading-relaxed text-ink-soft">
            Recommendations are ranked by the size of your skill gap against your role&rsquo;s required level, then filtered
            to programmes from iGOT Karmayogi, NSSTA and TPAC that address that skill. High-priority gaps (1.4 or more below
            the requirement) surface first. Completing a programme unlocks its assessment; only a valid, passed assessment
            updates your competency.
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {RECOMMENDED_COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </Card>

      {/* Catalogue */}
      <Card className="overflow-hidden">
        <div role="tablist" className="no-scrollbar flex overflow-x-auto border-b border-line">
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors sm:flex-1 sm:justify-center",
                  on ? "bg-brand-50/70 text-brand-700 after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-brand-600" : "text-ink-soft hover:bg-slate-50",
                )}
              >
                <t.icon className="size-4.5" aria-hidden /> {t.label}
              </button>
            );
          })}
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-ink">{active.title}</h2>
              <p className="text-sm text-ink-soft">{active.blurb}</p>
            </div>
            <LinkArrow href={tab === "All" ? "/learning" : `/learning?provider=${tab}`}>View All {tab === "All" ? "Programmes" : `${tab} Courses`}</LinkArrow>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
            <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
              <option value="All">All Levels</option>
              {levels.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Select>
            <Select value={duration} onChange={(e) => setDuration(e.target.value)} aria-label="Duration">
              <option value="All">All Durations</option>
              <option value="short">Up to 2 weeks</option>
              <option value="medium">3-4 weeks</option>
              <option value="long">5+ weeks</option>
            </Select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
              <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${tab === "All" ? "all" : tab} courses...`} className="pl-10" aria-label="Search courses" />
            </div>
          </div>

          {list.length === 0 ? (
            <p className="mt-8 rounded-xl bg-surface p-8 text-center text-sm text-ink-muted">No programmes match these filters.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {list.map((course) => (
                <CourseCard key={course.id} course={course} variant="catalogue" />
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <IconTile icon={GraduationCap} tone="blue" size="lg" rounded="full" />
          <div>
            <p className="font-display text-sm font-semibold text-ink">Looking for a specific skill or programme?</p>
            <p className="text-sm text-ink-soft">Explore our full catalogue of iGOT, NSSTA and TPAC programmes.</p>
          </div>
        </div>
        <button type="button" onClick={() => { setTab("All"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 text-sm font-semibold text-white hover:bg-brand-800">
          Browse All Programmes <ArrowRight className="size-4" aria-hidden />
        </button>
      </Card>
    </div>
  );
}
