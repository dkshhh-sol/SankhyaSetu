import { cn } from "@/lib/cn";

export type BarTone = "blue" | "emerald" | "amber" | "red" | "sky" | "violet" | "brand-light";

const fills: Record<BarTone, string> = {
  blue: "bg-brand-600",
  emerald: "bg-emerald-500",
  amber: "bg-amber-400",
  red: "bg-red-500",
  sky: "bg-sky-400",
  violet: "bg-violet-500",
  "brand-light": "bg-brand-300",
};

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: BarTone;
  className?: string;
  /** Bar thickness. */
  size?: "xs" | "sm" | "md";
  animated?: boolean;
}

/** Tone that reads well for a level on the 0-5 competency scale. */
export function toneForLevel(level: number, required = 4): BarTone {
  const gap = required - level;
  if (gap >= 1.4) return "red";
  if (gap >= 0.8) return "amber";
  return "blue";
}

export function ProgressBar({ value, max = 100, tone = "blue", className, size = "sm", animated = true }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-slate-200/70",
        size === "xs" ? "h-1.5" : size === "sm" ? "h-2.5" : "h-3.5",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full", fills[tone], animated && "transition-[width] duration-700 ease-out")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
