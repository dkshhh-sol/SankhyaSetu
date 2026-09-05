import { cn } from "@/lib/cn";

interface LogoProps {
  /** Show the "Skills. Evidence. Impact." tagline beneath the wordmark. */
  showTagline?: boolean;
  className?: string;
  /** Wordmark font size class, e.g. "text-2xl". */
  wordmarkClassName?: string;
}

/**
 * SankhyaSetu brand lockup: an ascending bar-chart mark + wordmark.
 * Purely presentational and reusable across the app header, login, footer, etc.
 */
export function Logo({
  showTagline = true,
  className,
  wordmarkClassName = "text-2xl",
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark className="h-9 w-auto shrink-0" />
      <div className="leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight text-ink",
            wordmarkClassName,
          )}
        >
          Sankhya<span className="text-brand-600">Setu</span>
        </span>
        {showTagline && (
          <p className="mt-1 text-xs font-medium tracking-wide text-ink-muted">
            Skills. Evidence. Impact.
          </p>
        )}
      </div>
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 36"
      role="img"
      aria-label="SankhyaSetu"
      className={className}
    >
      <defs>
        <linearGradient id="ss-bar" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#5a8fe0" />
          <stop offset="1" stopColor="#184e9f" />
        </linearGradient>
      </defs>
      {/* Ascending bars */}
      {[
        { x: 0, h: 12 },
        { x: 10, h: 20 },
        { x: 20, h: 28 },
        { x: 30, h: 36 },
      ].map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y={36 - b.h}
          width="7"
          height={b.h}
          rx="2.2"
          fill="url(#ss-bar)"
        />
      ))}
    </svg>
  );
}
