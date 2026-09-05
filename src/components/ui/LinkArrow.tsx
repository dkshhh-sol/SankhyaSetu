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
        "group inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700",
        size === "sm" ? "text-sm" : "text-base",
        className,
      )}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
