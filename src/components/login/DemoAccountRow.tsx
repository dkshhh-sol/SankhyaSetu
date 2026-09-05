import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { AccentColor, DemoAccount } from "@/lib/demoAccounts";

const avatarStyles: Record<AccentColor, string> = {
  blue: "bg-brand-100 text-brand-700",
  emerald: "bg-emerald-100 text-emerald-700",
  violet: "bg-violet-100 text-violet-700",
};

export interface DemoAccountRowProps {
  account: DemoAccount;
  onUse: (account: DemoAccount) => void;
  loading?: boolean;
  disabled?: boolean;
}

/** A single selectable demo identity with avatar, email, role and CTA. */
export function DemoAccountRow({
  account,
  onUse,
  loading = false,
  disabled = false,
}: DemoAccountRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-1.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40 sm:flex-row sm:items-center sm:gap-2.5 sm:p-2">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            avatarStyles[account.accent],
          )}
          aria-hidden
        >
          {account.initials}
        </span>
        {/* Email and role share a line so three accounts stay inside the
            sign-in card on short laptop screens. */}
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
          <p className="truncate text-[13px] font-semibold text-ink">{account.email}</p>
          <p className="truncate text-[11px] text-ink-muted">{account.role}</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        loading={loading}
        disabled={disabled}
        onClick={() => onUse(account)}
        aria-label={`Use account ${account.email}`}
        className="h-7 w-full px-2.5 text-[12px] sm:w-auto"
      >
        Use Account
      </Button>
    </div>
  );
}
