"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  /** "segmented" = joined boxes (Learning Evidence); "pills" = rounded chips (skill gap filter). */
  variant?: "segmented" | "pills";
}

export function Tabs<T extends string>({ items, value, onChange, className, variant = "segmented" }: TabsProps<T>) {
  if (variant === "pills") {
    return (
      <div role="tablist" className={cn("flex flex-wrap gap-1.5", className)}>
        {items.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                active ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-soft hover:bg-slate-200",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div
      role="tablist"
      className={cn(
        "no-scrollbar flex overflow-x-auto rounded-xl border border-line bg-white p-1",
        className,
      )}
    >
      {items.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors sm:flex-1",
              active ? "bg-brand-50 text-brand-700 shadow-[inset_0_0_0_1px_var(--color-brand-200)]" : "text-ink-soft hover:bg-slate-50",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
