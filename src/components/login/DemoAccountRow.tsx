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
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40 sm:flex-row sm:items-center sm:p-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            avatarStyles[account.accent],
          )}
          aria-hidden
        >
          {account.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{account.email}</p>
          <p className="truncate text-xs text-ink-muted">{account.role}</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        loading={loading}
        disabled={disabled}
        onClick={() => onUse(account)}
        aria-label={`Use account ${account.email}`}
        className="w-full sm:w-auto"
      >
        Use Account
      </Button>
    </div>
  );
}
