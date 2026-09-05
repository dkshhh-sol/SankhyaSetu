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

export type SignInMethod = "parichay-sso" | "demo-account" | "onboarding";

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

/**
 * Create a session for an official who has just completed onboarding.
 *
 * Same simulation as the demo accounts — no real credential is issued. The
 * identity is built from what the official entered in the onboarding form.
 */
export function signInAsNewOfficial(input: {
  fullName: string;
  designation: string;
  department: string;
}): Session {
  const name = input.fullName.trim() || "New Official";
  const parts = name.split(/\s+/);
  const initials = (
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2)
  ).toUpperCase();

  const session: Session = {
    accountId: "onboarded-official",
    email: `${parts[0].toLowerCase()}@demo.gov.in`,
    name,
    firstName: parts[0],
    role: input.designation,
    initials,
    division: input.department,
    method: "onboarding",
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
