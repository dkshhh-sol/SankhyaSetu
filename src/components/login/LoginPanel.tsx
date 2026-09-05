"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Fingerprint, Info, Lock } from "lucide-react";
import { MinistryEmblem } from "@/components/brand/MinistryEmblem";
import { DemoAccountRow } from "@/components/login/DemoAccountRow";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/lib/demoAccounts";
import { signInWithAccount } from "@/lib/auth";
import { announceSessionChange } from "@/lib/store/AppStore";

const FOOTER_LINKS = [
  { label: "About SankhyaSetu", href: "/help" },
  { label: "Privacy Policy", href: "/help#privacy" },
  { label: "Support", href: "/help" },
];

/** Simulated latency so the mocked Parichay redirect reads as a real handoff. */
const SSO_DELAY_MS = 1100;

export function LoginPanel() {
  const router = useRouter();
  // Which action is mid-flight: "sso" | account id | null
  const [pending, setPending] = useState<string | null>(null);

  function enterApp() {
    announceSessionChange();
    router.push("/dashboard");
  }

  function handleParichay() {
    if (pending) return;
    setPending("sso");
    // Parichay SSO is simulated for the prototype; land on a default identity.
    window.setTimeout(() => {
      signInWithAccount(DEMO_ACCOUNTS[0], "parichay-sso");
      enterApp();
    }, SSO_DELAY_MS);
  }

  function handleUseAccount(account: DemoAccount) {
    if (pending) return;
    setPending(account.id);
    signInWithAccount(account, "demo-account");
    enterApp();
  }

  const busy = pending !== null;

  return (
    <section className="flex flex-col bg-surface px-5 py-6 sm:px-8 lg:h-full lg:min-h-0 lg:px-10 lg:py-5">
      {/* Ministry lockup */}
      <div className="flex shrink-0 justify-center sm:justify-end">
        <MinistryEmblem />
      </div>

      {/* Login card — the middle region flexes and, on short screens, scrolls
          inside the panel (thin bar) instead of pushing the page taller. */}
      <div className="flex flex-1 items-center justify-center py-5 lg:min-h-0">
        <div className="scrollbar-thin flex w-full max-w-[560px] flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-pop sm:p-7 lg:max-h-full lg:overflow-y-auto">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Welcome to <span className="text-brand-600">SankhyaSetu</span>
          </h2>
          <p className="mt-1 text-base text-ink-muted">
            Sign in with your Government credentials
          </p>

          {/* Parichay SSO */}
          <button
            type="button"
            onClick={handleParichay}
            disabled={busy}
            aria-busy={pending === "sso" || undefined}
            className="group mt-5 flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              {pending === "sso" ? (
                <span className="size-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-hidden />
              ) : (
                <Fingerprint className="size-6 text-[#e07b1a]" aria-hidden />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold text-brand-700">
                {pending === "sso" ? "Connecting to Parichay..." : "Continue with Parichay SSO"}
              </span>
              <span className="block text-sm text-ink-muted">Government of India Single Sign-On</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>

          {/* Divider */}
          <div className="my-4 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Prototype notice */}
          <div className="flex gap-3 rounded-2xl bg-brand-50 p-3.5 text-sm text-ink-soft">
            <Info className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <p>For the prototype, use one of the demo accounts below to explore the platform.</p>
          </div>

          {/* Demo accounts */}
          <h3 className="mt-5 text-sm font-bold text-ink">Demo Accounts</h3>
          <div className="mt-2.5 space-y-2.5">
            {DEMO_ACCOUNTS.map((account) => (
              <DemoAccountRow
                key={account.id}
                account={account}
                onUse={handleUseAccount}
                loading={pending === account.id}
                disabled={busy && pending !== account.id}
              />
            ))}
          </div>

          {/* Card footer */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-ink-soft">
              <Lock className="size-4 text-ink-muted" aria-hidden />
              Secure. Official. Trusted.
            </p>
            <p className="mt-1 text-xs text-ink-muted">Powered by Parichay | Government of India</p>
          </div>
        </div>
      </div>

      {/* Page footer links */}
      <nav className="flex shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
        {FOOTER_LINKS.map((l, i) => (
          <span key={l.label} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-300">|</span>}
            <a href={l.href} className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
              {l.label}
            </a>
          </span>
        ))}
      </nav>
    </section>
  );
}
