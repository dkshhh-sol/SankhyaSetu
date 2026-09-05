import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

export interface Step {
  title: string;
  subtitle?: string;
}

interface StepperProps {
  steps: Step[];
  /** 1-based index of the active step; steps before it are complete. */
  current: number;
  className?: string;
  /** Compact variant used inside cards. */
  compact?: boolean;
}

/** Horizontal numbered stepper with connecting rails, matching the journey / studio bars in the design. */
export function Stepper({ steps, current, className, compact }: StepperProps) {
  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={s.title} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2",
                  done || active ? "bg-brand-600" : "bg-slate-200",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-bold ring-4 ring-white",
                done && "bg-brand-600 text-white",
                active && "bg-brand-600 text-white shadow-[0_0_0_4px_rgba(29,95,196,0.15)]",
                !done && !active && "bg-slate-100 text-ink-muted",
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} /> : n}
            </span>
            <p
              className={cn(
                "mt-2 px-1 leading-snug",
                compact ? "text-xs" : "text-xs sm:text-sm",
                active ? "font-semibold text-brand-700" : done ? "font-semibold text-ink" : "font-medium text-ink-soft",
              )}
            >
              {s.title}
              {s.subtitle && (
                <>
                  <br />
                  <span className={cn("font-normal", active ? "text-brand-700/80" : "text-ink-muted")}>{s.subtitle}</span>
                </>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
