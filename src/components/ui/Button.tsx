import { cn } from "@/lib/cn";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger" | "soft" | "navy";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap " +
  "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
  navy: "bg-brand-900 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900",
  outline:
    "border border-brand-200 bg-white text-brand-700 hover:bg-brand-50 active:bg-brand-100",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  ghost: "text-ink-soft hover:bg-slate-100 active:bg-slate-200",
  danger: "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, CommonProps {
  /** Renders a spinner and disables the button. */
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, CommonProps {
  href: string;
  external?: boolean;
}

/** Same visual language as Button, rendered as a Next link (or plain anchor for external URLs). */
export function ButtonLink({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  children,
  href,
  external,
  ...props
}: ButtonLinkProps) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
