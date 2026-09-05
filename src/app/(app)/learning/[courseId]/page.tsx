"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BarChart2, BookOpen, CheckCircle2, Clock, Compass, ExternalLink, FileText, Info, Landmark, Lightbulb, Monitor, Target } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, PriorityBadge, ProviderBadge } from "@/components/ui/Badge";
import { ProgressBar, toneForLevel } from "@/components/ui/ProgressBar";
import { IconTile } from "@/components/ui/IconTile";
import { getCourse, PROVIDER_FULL } from "@/lib/data/courses";
import { getSkill, gapPriority, round1 } from "@/lib/data/competencies";
import { EVIDENCE } from "@/lib/data/evidence";
import { useAppStore } from "@/lib/store/AppStore";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = getCourse(courseId);
  const { skillLevel } = useAppStore();

  if (!course) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center">
        <p className="text-lg font-semibold text-ink">Course not found.</p>
        <Link href="/learning" className="mt-3 inline-block text-brand-600 hover:underline">
          Back to recommendations
        </Link>
      </div>
    );
  }

  const skill = getSkill(course.skillId);
  const current = skillLevel(skill.id);
  const gap = round1(Math.max(0, skill.required - current));
  const priority = gapPriority(gap);
  const evidence = EVIDENCE.find((e) => e.courseId === course.id);
  const providerName = PROVIDER_FULL[course.provider];

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Learning Recommendations", href: "/learning" }, { label: "Course Details" }]}
        title={course.title}
        building
      >
        <Link href="/learning" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="size-4" aria-hidden /> Back to Recommendations
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.75fr_1fr]">
        {/* Main column */}
        <div className="space-y-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <ProviderBadge provider={course.provider} className="text-sm" />
              <p className="mt-3 text-base leading-relaxed text-ink-soft sm:text-lg">{course.longDescription.split(". ")[0]}.</p>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 2xl:grid-cols-4">
                {[
                  { icon: Clock, v: course.duration, k: "Duration" },
                  { icon: BarChart2, v: course.level, k: "Level" },
                  { icon: Monitor, v: course.mode, k: "Mode" },
                  { icon: Landmark, v: providerName, k: "Provider" },
                ].map((m) => (
                  <div key={m.k} className="flex items-start gap-2.5">
                    <m.icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                    <div>
                      <dd className="text-sm font-bold text-ink">{m.v}</dd>
                      <dt className="text-xs text-ink-muted">{m.k}</dt>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
            <img
              src={course.id === "adv-data-viz-python" ? "/images/course-python-large.png" : course.image}
              alt=""
              className="h-40 w-full shrink-0 rounded-2xl object-cover sm:h-44 sm:w-60"
              draggable={false}
            />
          </div>

          {/* Why recommended */}
          <Card className="bg-brand-50/60 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <IconTile icon={Target} tone="blue" rounded="full" />
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Why is this recommended for you?</h2>
                <p className="text-sm text-ink-soft">This course addresses your skill gap in {course.skillName}.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
              <div>
                <p className="text-sm text-ink-soft">Current Competency</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                  {current.toFixed(1)} <span className="text-base font-semibold text-ink-muted">/ 5</span>
                </p>
                <ProgressBar value={current} max={5} tone={toneForLevel(current, skill.required)} className="mt-2" />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Required Competency</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                  {skill.required.toFixed(1)} <span className="text-base font-semibold text-ink-muted">/ 5</span>
                </p>
                <ProgressBar value={skill.required} max={5} tone="blue" className="mt-2" />
              </div>
              <div className="rounded-2xl bg-red-50 px-5 py-4 sm:min-w-[200px]">
                <p className="text-sm text-ink-soft">Skill Gap</p>
                <p className="mt-1 flex items-center gap-3">
                  <span className="font-display text-2xl font-extrabold text-ink">{gap.toFixed(1)}</span>
                  <PriorityBadge priority={priority} className="text-sm">
                    {priority} Priority
                  </PriorityBadge>
                </p>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <IconTile icon={FileText} tone="blue" rounded="full" />
              <div>
                <h2 className="font-display text-lg font-bold text-ink">About the Course</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft sm:text-[15px]">{course.longDescription}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:divide-x md:divide-line">
              <div>
                <div className="flex items-center gap-3">
                  <IconTile icon={Lightbulb} tone="blue" size="sm" rounded="full" />
                  <h3 className="font-display text-base font-bold text-ink">What you will learn</h3>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {course.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-500" aria-hidden /> {o}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:pl-6">
                <div className="flex items-center gap-3">
                  <IconTile icon={BookOpen} tone="blue" size="sm" rounded="full" />
                  <h3 className="font-display text-base font-bold text-ink">Prerequisites</h3>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {course.prerequisites.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-surface p-5">
              <div className="flex items-center gap-3">
                <IconTile icon={Info} tone="blue" size="sm" rounded="full" />
                <h3 className="font-display text-base font-bold text-ink">Course Information</h3>
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                {[
                  ["Provider", providerName],
                  ["Effort", course.effort],
                  ["Level", course.level],
                  ["Language", course.language],
                  ["Duration", `${course.duration} (${course.mode})`],
                  ["Certificate", `Provided by ${providerName}`],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-b border-line py-1.5 last:border-0 sm:border-0">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <Card className="p-5">
            <a
              href={course.providerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 text-base font-bold text-white shadow-sm hover:bg-brand-700"
            >
              Open on {providerName} <ExternalLink className="size-5" aria-hidden />
            </a>
            <p className="mt-4 rounded-xl bg-surface p-3.5 text-xs leading-relaxed text-ink-soft">
              <span className="mr-1.5 inline-block size-2 rounded-full bg-brand-400 align-middle" aria-hidden />
              You will be redirected to {providerName} to access and complete this course. Your learning progress will be
              automatically verified (subject to authorized integration).
            </p>
            {evidence && (
              <Badge tone={evidence.status === "verified" ? "emerald" : evidence.status === "in-progress" ? "amber" : "slate"} className="mt-3">
                {evidence.status === "verified" ? `Completed on ${evidence.date}` : evidence.status === "in-progress" ? `In progress since ${evidence.date}` : "Pending verification"}
              </Badge>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <IconTile icon={CheckCircle2} tone="emerald" size="sm" rounded="full" />
              <h3 className="font-display text-base font-bold text-ink">After completing this course</h3>
            </div>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-soft">
              {[
                `Completion will be verified through ${course.provider} integration`,
                "A competency assessment will be unlocked on SankhyaSetu",
                "Your competency profile will be updated based on your assessment performance",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-500" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-3 rounded-xl bg-brand-50 p-3.5 text-sm text-ink-soft">
              <Info className="mt-0.5 size-4.5 shrink-0 text-brand-600" aria-hidden />
              <p>
                <span className="font-semibold text-ink">Note</span>
                <br />
                SankhyaSetu does not host the course content. Learning happens on {providerName}.
              </p>
            </div>
            {course.assessmentId && evidence?.status === "verified" && (
              <Link href={`/assessments/${course.assessmentId}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
                Take the linked assessment <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <IconTile icon={FileText} tone="blue" size="sm" rounded="full" />
              <h3 className="font-display text-base font-bold text-ink">Related Competencies</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {course.relatedSkillIds.map((id) => {
                const s = getSkill(id);
                const lvl = skillLevel(id);
                return (
                  <li key={id} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm sm:grid-cols-[130px_1fr_auto]">
                    <span className="text-ink-soft">{s.name}</span>
                    <ProgressBar value={lvl} max={5} tone={toneForLevel(lvl, s.required)} className="col-span-2 sm:col-span-1" />
                    <span className="hidden font-semibold text-ink sm:block">
                      {lvl.toFixed(1)} <span className="font-normal text-ink-muted">/ 5</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <IconTile icon={Compass} tone="blue" size="sm" rounded="full" />
              <h3 className="font-display text-base font-bold text-ink">Explore More</h3>
            </div>
            <ul className="mt-3 divide-y divide-line text-sm">
              <li>
                <Link href="/learning" className="flex items-center justify-between py-2.5 text-brand-600 hover:text-brand-700">
                  View all {course.provider} courses for {course.skillName} <ArrowRight className="size-4" aria-hidden />
                </Link>
              </li>
              <li>
                <Link href="/competency" className="flex items-center justify-between py-2.5 text-brand-600 hover:text-brand-700">
                  See other recommendations for your role <ArrowRight className="size-4" aria-hidden />
                </Link>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
