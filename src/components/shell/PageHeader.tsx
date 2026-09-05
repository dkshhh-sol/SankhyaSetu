import Link from "next/link";
import { ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  crumbs?: Crumb[];
  title: ReactNode;
  subtitle?: ReactNode;
  /** Quote shown at the right, over the building photo. */
  quote?: string;
  /** Replaces the quote with custom content (e.g. linked-course chip). */
  aside?: ReactNode;
  /** Hide the building photo (assessment pages use the space for context). */
  building?: boolean;
  className?: string;
  children?: ReactNode;
}

export function PageHeader({
  crumbs,
  title,
  subtitle,
  quote = "Better data. Brighter decisions. A stronger India.",
  aside,
  building = true,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("relative", className)}>
      {building && (
        <img
          src="/images/header-building.png"
          alt=""
          aria-hidden
          draggable={false}
          className="header-building pointer-events-none absolute -right-6 -top-6 hidden h-40 w-auto select-none xl:block"
        />
      )}

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {crumbs && crumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-sm text-ink-muted">
              {crumbs.map((c, i) => (
                <span key={c.label} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
                  {c.href ? (
                    <Link href={c.href} className="hover:text-brand-600">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-ink-soft">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[40px] lg:leading-[1.1]">
            {title}
          </h1>
          {subtitle && <p className="mt-2 max-w-2xl text-base text-ink-soft sm:text-lg">{subtitle}</p>}
          {children}
        </div>

        {aside ? (
          <div className="shrink-0 lg:pr-2 xl:pr-52">{aside}</div>
        ) : (
          <figure className="hidden shrink-0 lg:block lg:max-w-[240px] xl:mr-56">
            <Quote className="size-6 -scale-x-100 text-brand-200" aria-hidden />
            <blockquote className="mt-1 font-display text-[15px] font-medium leading-snug text-ink-soft">
              {quote}
            </blockquote>
            <figcaption className="mt-1.5 text-xs text-ink-muted">
              <span className="mr-1 inline-block w-5 border-t border-ink-muted/60 align-middle" />
              MOSPI
            </figcaption>
          </figure>
        )}
      </div>
    </div>
  );
}
