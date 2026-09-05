"use client";

import { cn } from "@/lib/cn";
import { Check, ChevronDown } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Label({ children, className, htmlFor }: { children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1 block text-xs font-medium text-ink", className)}>
      {children}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
    </div>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, className, disabled }: CheckboxProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft select-none", disabled && "opacity-60", className)}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-md border transition-colors",
          checked ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2",
        )}
        aria-hidden
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </label>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-3 text-sm text-ink-soft select-none", className)}>
      <input type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2",
          checked ? "bg-brand-600" : "bg-slate-300",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
