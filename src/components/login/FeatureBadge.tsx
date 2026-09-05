import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

type Accent = "blue" | "emerald" | "violet" | "amber";

const accentStyles: Record<Accent, string> = {
  blue: "bg-brand-100 text-accent-blue",
  emerald: "bg-emerald-100 text-accent-emerald",
  violet: "bg-violet-100 text-accent-violet",
  amber: "bg-amber-100 text-accent-amber",
};

export interface FeatureBadgeProps {
  icon: LucideIcon;
  label: string;
  accent: Accent;
}

/** Icon-in-a-circle with a wrapped caption. Used across the hero feature row. */
export function FeatureBadge({ icon: Icon, label, accent }: FeatureBadgeProps) {
  return (
    <div className="flex w-24 flex-col items-center text-center sm:w-28">
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          accentStyles[accent],
        )}
      >
        <Icon className="size-5" strokeWidth={2} aria-hidden />
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-snug text-ink-soft">
        {label}
      </p>
    </div>
  );
}
