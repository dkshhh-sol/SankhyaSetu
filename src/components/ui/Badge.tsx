import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type BadgeTone =
  | "blue"
  | "emerald"
  | "amber"
  | "red"
  | "violet"
  | "slate"
  | "sky"
  | "rose";

const tones: Record<BadgeTone, string> = {
  blue: "bg-brand-50 text-brand-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  violet: "bg-violet-50 text-violet-700",
  slate: "bg-slate-100 text-slate-600",
  sky: "bg-sky-50 text-sky-700",
  rose: "bg-rose-50 text-rose-600",
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({ tone = "slate", className, children, size = "sm", dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export const PRIORITY_TONE = { High: "red", Medium: "amber", Low: "emerald" } as const;

export function PriorityBadge({
  priority,
  className,
  children,
}: {
  priority: "High" | "Medium" | "Low";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Badge tone={PRIORITY_TONE[priority]} className={className}>
      {children ?? priority}
    </Badge>
  );
}

const providerTone = { iGOT: "blue", NSSTA: "emerald", TPAC: "violet" } as const;

export function ProviderBadge({ provider, className }: { provider: "iGOT" | "NSSTA" | "TPAC"; className?: string }) {
  return (
    <Badge tone={providerTone[provider]} className={cn("px-2.5", className)}>
      {provider}
    </Badge>
  );
}
