"use client";

import { PriorityBadge } from "@/components/ui/Badge";
import { ProgressBar, toneForLevel } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import type { CompetencyScore } from "@/lib/onboarding/engine";

/**
 * One competency in the generated profile: current level against the level
 * the selected role requires, with the resulting gap and priority.
 *
 * Two stacked bars rather than one so the shortfall is visible at a glance
 * instead of having to compare two numbers.
 */
export function CompetencyRow({
  score,
  className,
  showPriority = true,
}: {
  score: CompetencyScore;
  className?: string;
  showPriority?: boolean;
}) {
  return (
    <li className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-1.5", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[13px] font-semibold text-ink">{score.name}</span>
        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-px text-[10px] font-medium text-ink-muted">
          {score.domain}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <span className="text-[13px] font-semibold text-ink tabular-nums">
          {score.level.toFixed(1)}
          <span className="font-normal text-ink-muted"> / {score.required.toFixed(1)}</span>
        </span>
        {score.gap > 0 ? (
          <span className="rounded bg-red-50 px-1.5 py-px text-[11px] font-bold text-red-600 tabular-nums">
            -{score.gap.toFixed(1)}
          </span>
        ) : (
          <span className="rounded bg-emerald-50 px-1.5 py-px text-[11px] font-bold text-emerald-600">
            Met
          </span>
        )}
        {showPriority && score.gap > 0 && <PriorityBadge priority={score.priority} />}
      </div>

      {/* Current vs required */}
      <div className="col-span-2 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
            Current
          </span>
          <ProgressBar
            value={score.level}
            max={5}
            size="xs"
            tone={toneForLevel(score.level, score.required)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
            Required
          </span>
          <ProgressBar value={score.required} max={5} size="xs" tone="brand-light" animated={false} />
        </div>
      </div>
    </li>
  );
}
