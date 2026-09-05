import { cn } from "@/lib/cn";

const tones = {
  blue: "bg-brand-100 text-brand-700",
  emerald: "bg-emerald-100 text-emerald-700",
  violet: "bg-violet-100 text-violet-700",
} as const;

interface AvatarProps {
  initials: string;
  tone?: keyof typeof tones;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ initials, tone = "blue", size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        size === "sm" ? "size-8 text-xs" : size === "md" ? "size-10 text-sm" : "size-14 text-lg",
        tones[tone],
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
