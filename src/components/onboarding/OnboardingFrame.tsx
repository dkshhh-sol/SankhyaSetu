"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { MinistryEmblem } from "@/components/brand/MinistryEmblem";
import { Stepper } from "@/components/ui/Stepper";
import { cn } from "@/lib/cn";

/** The seven onboarding steps, in order. Step 8 is the existing dashboard. */
export const ONBOARDING_STEPS = [
  { title: "Profile" },
  { title: "Role" },
  { title: "Assessment" },
  { title: "Results" },
  { title: "Competency" },
  { title: "Skill Gaps" },
  { title: "Learning Path" },
];

interface OnboardingFrameProps {
  /** 1-based step index. */
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Sticky action row pinned to the bottom of the card. */
  footer?: ReactNode;
  /** Widen the card for the result / profile screens. */
  wide?: boolean;
}

/**
 * Shared chrome for the new-official onboarding journey.
 *
 * Deliberately outside the authenticated AppShell — the official has no
 * session until the flow completes. Sized so each step fits a 1440x900
 * viewport without the page itself scrolling; long content scrolls inside
 * the card body instead.
 */
export function OnboardingFrame({
  step,
  title,
  subtitle,
  children,
  footer,
  wide,
}: OnboardingFrameProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface lg:h-screen lg:overflow-hidden">
      {/* Slim top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-line bg-white px-4 py-2.5 sm:px-6">
        <Logo showTagline={false} wordmarkClassName="text-lg" />
        <div className="flex items-center gap-4">
          <MinistryEmblem compact className="hidden md:flex" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <X className="size-3.5" aria-hidden />
            Exit
          </Link>
        </div>
      </header>

      <div className="flex flex-1 justify-center px-4 py-4 sm:px-6 lg:min-h-0">
        <div className={cn("flex w-full flex-col lg:min-h-0", wide ? "max-w-[1040px]" : "max-w-[860px]")}>
          {/* Journey stepper */}
          <Stepper steps={ONBOARDING_STEPS} current={step} compact className="shrink-0 px-2" />

          {/* Step card — sized to its content, capped at the viewport so a
              short step does not stretch into empty space and a long one
              scrolls internally rather than growing the page. */}
          <section className="mt-3 flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card lg:max-h-full lg:min-h-0">
            <div className="shrink-0 border-b border-line px-5 py-3">
              <h1 className="font-display text-lg font-bold tracking-tight text-ink">{title}</h1>
              {subtitle && <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p>}
            </div>

            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4 lg:min-h-0">{children}</div>

            {footer && (
              <div className="shrink-0 border-t border-line bg-white px-5 py-3">{footer}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
