import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export type TileTone = "blue" | "emerald" | "amber" | "rose" | "violet" | "sky" | "slate" | "red";

const tones: Record<TileTone, string> = {
  blue: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
  sky: "bg-sky-50 text-sky-600",
  slate: "bg-slate-100 text-slate-600",
  red: "bg-red-50 text-red-600",
};

interface IconTileProps {
  icon: LucideIcon;
  tone?: TileTone;
  size?: "sm" | "md" | "lg";
  className?: string;
  rounded?: "full" | "xl";
}

const sizes = {
  sm: { box: "size-8", icon: "size-4" },
  md: { box: "size-10", icon: "size-5" },
  lg: { box: "size-12", icon: "size-6" },
};

/** Soft-tinted square/circle behind an icon; used on stat cards and list rows. */
export function IconTile({ icon: Icon, tone = "blue", size = "md", className, rounded = "xl" }: IconTileProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        rounded === "full" ? "rounded-full" : "rounded-xl",
        sizes[size].box,
        tones[tone],
        className,
      )}
    >
      <Icon className={sizes[size].icon} strokeWidth={2} aria-hidden />
    </span>
  );
}
