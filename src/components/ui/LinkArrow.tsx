import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface LinkArrowProps {
  href: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md";
}

/** "View all ->" style inline link used in card headers. */
export function LinkArrow({ href, children, className, size = "sm" }: LinkArrowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700",
        size === "sm" ? "text-[13px]" : "text-sm",
        className,
      )}
    >
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
