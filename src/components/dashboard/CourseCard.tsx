import Link from "next/link";
import { ArrowRight, BarChart2, Clock } from "lucide-react";
import { Badge, PriorityBadge, ProviderBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import type { Course } from "@/lib/data/courses";
import { cn } from "@/lib/cn";

interface CourseCardProps {
  course: Course;
  /** "rich" = image + priority (Learning Path); "compact" = dashboard tile; "catalogue" = image on top, outline CTA. */
  variant?: "rich" | "compact" | "catalogue";
  className?: string;
}

export function CourseCard({ course, variant = "rich", className }: CourseCardProps) {
  const href = `/learning/${course.id}`;

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-col rounded-2xl border border-line bg-surface/60 p-4", className)}>
        <div className="flex items-start gap-3">
          <ProviderBadge provider={course.provider} />
        </div>
        <div className="mt-3 flex gap-3">
          <img src={course.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" draggable={false} />
          <div className="min-w-0">
            <Link href={href} className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink hover:text-brand-700">
              {course.title}
            </Link>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{course.description}</p>
          </div>
        </div>
        <Meta course={course} className="mt-3" />
        <ButtonLink href={href} variant="navy" size="sm" className="mt-4 w-full">
          Start Learning
        </ButtonLink>
      </div>
    );
  }

  if (variant === "catalogue") {
    return (
      <div className={cn("flex flex-col rounded-2xl border border-line bg-white p-3", className)}>
        <img src={course.image} alt="" className="h-24 w-full rounded-xl object-cover" draggable={false} />
        <div className="mt-3">
          <ProviderBadge provider={course.provider} />
        </div>
        <Link href={href} className="mt-2 line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink hover:text-brand-700">
          {course.title}
        </Link>
        <Meta course={course} className="mt-3" />
        <ButtonLink href={href} variant="outline" size="sm" className="mt-4 w-full">
          View Course
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col rounded-2xl border border-line bg-white p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <ProviderBadge provider={course.provider} />
        {course.priority && (
          <PriorityBadge priority={course.priority} className="gap-1" />
        )}
      </div>
      <img src={course.image} alt="" className="mt-3 h-[88px] w-full rounded-xl object-cover" draggable={false} />
      <Link href={href} className="mt-3 line-clamp-2 font-display text-[17px] font-bold leading-snug text-ink hover:text-brand-700">
        {course.title}
      </Link>
      <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">{course.description}</p>
      <Meta course={course} className="mt-auto pt-4" />
      <ButtonLink href={href} size="sm" className="mt-3 w-full" rightIcon={<ArrowRight className="size-4" />}>
        Start Learning
      </ButtonLink>
    </div>
  );
}

function Meta({ course, className }: { course: Course; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft", className)}>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5 text-ink-muted" aria-hidden /> {course.duration}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <BarChart2 className="size-3.5 text-ink-muted" aria-hidden /> {course.level}
      </span>
    </div>
  );
}

export function PriorityPill({ priority }: { priority: "High" | "Medium" | "Low" }) {
  return (
    <Badge tone={priority === "High" ? "red" : priority === "Medium" ? "amber" : "emerald"} dot>
      {priority} Priority
    </Badge>
  );
}
