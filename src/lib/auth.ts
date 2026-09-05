/**
 * Mock authentication for the prototype.
 *
 * Parichay SSO is SIMULATED for the demo — there is no real single sign-on.
 * "Signing in" just records the chosen demo identity in sessionStorage so the
 * rest of the app can read who is exploring. This module is intentionally
 * shaped like a real session service so a genuine Parichay integration could
 * replace it later without touching UI components.
 */

import type { DemoAccount } from "@/lib/demoAccounts";

const SESSION_KEY = "ss.session";

export type SignInMethod = "parichay-sso" | "demo-account";

export interface Session {
  accountId: string;
  email: string;
  name: string;
  firstName: string;
  role: string;
  initials: string;
  division: string;
  method: SignInMethod;
  /** ISO timestamp the session was created. */
  signedInAt: string;
}

export function signInWithAccount(
  account: DemoAccount,
  method: SignInMethod = "demo-account",
): Session {
  const session: Session = {
    accountId: account.id,
    email: account.email,
    name: account.name,
    firstName: account.firstName,
    role: account.role,
    initials: account.initials,
    division: account.division,
    method,
    signedInAt: new Date().toISOString(),
  };
  persist(session);
  return session;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}

function persist(session: Session): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
