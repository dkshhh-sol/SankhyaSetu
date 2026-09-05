import { cn } from "@/lib/cn";

interface MinistryEmblemProps {
  className?: string;
  /** Compact single-line variant used in the app header. */
  compact?: boolean;
}

/**
 * Ministry of Statistics & Programme Implementation lockup with the State
 * Emblem (public-domain SVG from Wikimedia Commons, served from /public).
 */
export function MinistryEmblem({ className, compact }: MinistryEmblemProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/images/emblem.svg"
        alt="State Emblem of India"
        className={cn("shrink-0 object-contain", compact ? "h-10 w-auto" : "h-14 w-auto")}
        draggable={false}
      />
      {compact ? (
        <div className="leading-tight whitespace-nowrap">
          <p className="text-[11px] font-semibold text-ink sm:text-xs">
            Ministry of Statistics and Programme Implementation
          </p>
          <p className="text-[10px] font-medium text-ink-muted sm:text-[11px]">Government of India</p>
        </div>
      ) : (
        <div className="leading-tight">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink sm:text-xs">
            Ministry of Statistics
            <br />
            and Programme Implementation
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted sm:text-[11px]">
            Government of India
          </p>
        </div>
      )}
    </div>
  );
}
