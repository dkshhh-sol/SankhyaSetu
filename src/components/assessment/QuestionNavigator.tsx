"use client";

import { Flag } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  total: number;
  current: number;
  answered: Set<number>;
  flagged: Set<number>;
  onJump: (index: number) => void;
}

export function QuestionNavigator({ total, current, answered, flagged, onJump }: Props) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <h2 className="font-display text-base font-bold text-ink">Question Navigator</h2>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        <li className="inline-flex items-center gap-1.5"><span className="size-3.5 rounded border-2 border-brand-600 bg-white" /> Current</li>
        <li className="inline-flex items-center gap-1.5"><span className="size-3.5 rounded bg-emerald-100 ring-1 ring-emerald-300" /> Answered</li>
        <li className="inline-flex items-center gap-1.5"><Flag className="size-3.5 text-amber-500" /> Flagged</li>
        <li className="inline-flex items-center gap-1.5"><span className="size-3.5 rounded bg-slate-100 ring-1 ring-slate-200" /> Not Answered</li>
      </ul>
      <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5 xl:grid-cols-10">
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === current;
          const isAnswered = answered.has(i);
          const isFlagged = flagged.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Question ${i + 1}${isAnswered ? ", answered" : ""}${isFlagged ? ", flagged" : ""}`}
              className={cn(
                "relative flex h-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                isCurrent
                  ? "border-2 border-brand-600 bg-white text-brand-700"
                  : isAnswered
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-50 text-ink-soft ring-1 ring-slate-200 hover:bg-slate-100",
              )}
            >
              {i + 1}
              {isFlagged && <Flag className="absolute -right-1 -top-1 size-3.5 fill-amber-400 text-amber-500" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
