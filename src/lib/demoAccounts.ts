/**
 * Demo accounts for the prototype login.
 *
 * These are simulated Parichay identities used only to explore the platform
 * during the demo. They are NOT real government credentials and no real
 * authentication happens — see `lib/auth.ts`.
 */

export type AccentColor = "blue" | "emerald" | "violet";

export interface DemoAccount {
  id: string;
  email: string;
  /** Display name used in greetings and the header. */
  name: string;
  /** Short first name for the dashboard greeting. */
  firstName: string;
  /** Job role / designation shown under the email. */
  role: string;
  /** Two-letter avatar initials. */
  initials: string;
  accent: AccentColor;
  /** Organisational unit (shown in Settings). */
  division: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "data-analyst",
    email: "data.analyst@demo.gov.in",
    name: "Amit Sharma",
    firstName: "Amit",
    role: "Data Analyst",
    initials: "DA",
    accent: "blue",
    division: "National Statistical Office (NSO), Data Informatics & Innovation Division",
  },
  {
    id: "senior-statistician",
    email: "senior.statistician@demo.gov.in",
    name: "Priya Raghavan",
    firstName: "Priya",
    role: "Senior Statistician",
    initials: "SS",
    accent: "emerald",
    division: "National Statistical Office (NSO), Survey Coordination Division",
  },
  {
    id: "programme-officer",
    email: "new.officer@demo.gov.in",
    name: "Rohan Mehta",
    firstName: "Rohan",
    role: "Programme Officer",
    initials: "NO",
    accent: "violet",
    division: "Programme Implementation Wing, Infrastructure & Project Monitoring",
  },
];
