/**
 * Competency model (SIMULATED for the prototype).
 *
 * In production these values would come from the MoSPI competency framework
 * service, seeded from iGOT Karmayogi's FRAC (Framework for Roles, Activities
 * and Competencies). Here they are a static, role-shaped snapshot for the
 * demo identity so that every screen renders consistently.
 */

export type Priority = "High" | "Medium" | "Low";

export type DomainIcon =
  | "sigma"
  | "bar-chart"
  | "file-check"
  | "cpu"
  | "presentation"
  | "landmark";

export type Accent = "blue" | "emerald" | "amber" | "rose" | "violet" | "sky";

export interface CompetencyDomain {
  id: string;
  name: string;
  /** Icon key resolved in the UI layer. */
  icon: DomainIcon;
  accent: Accent;
  level: number;
  required: number;
}

export const COMPETENCY_DOMAINS: CompetencyDomain[] = [
  { id: "stat-methods", name: "Statistical Methods", icon: "sigma", accent: "blue", level: 3.8, required: 4.0 },
  { id: "data-analysis", name: "Data Analysis & Tools", icon: "bar-chart", accent: "emerald", level: 3.1, required: 4.0 },
  { id: "governance", name: "Data Governance", icon: "file-check", accent: "amber", level: 2.4, required: 4.0 },
  { id: "ai-emerging", name: "AI & Emerging Technologies", icon: "cpu", accent: "rose", level: 2.0, required: 3.5 },
  { id: "communication", name: "Communication & Reporting", icon: "presentation", accent: "violet", level: 3.6, required: 4.0 },
  { id: "policy", name: "Policy & Domain Knowledge", icon: "landmark", accent: "sky", level: 3.2, required: 4.0 },
];

/** Fine-grained skills that roll up into the domains above. */
export interface Skill {
  id: string;
  name: string;
  domainId: string;
  level: number;
  required: number;
}

export const SKILLS: Skill[] = [
  { id: "data-viz", name: "Advanced Data Visualization", domainId: "data-analysis", level: 2.6, required: 4.0 },
  { id: "ml-basics", name: "Machine Learning Basics", domainId: "ai-emerging", level: 1.8, required: 3.5 },
  { id: "gov-privacy", name: "Data Governance & Privacy", domainId: "governance", level: 2.4, required: 4.0 },
  { id: "python", name: "Python Programming", domainId: "data-analysis", level: 2.8, required: 4.0 },
  { id: "stats-framework", name: "Official Statistics Framework", domainId: "policy", level: 3.2, required: 4.0 },
  { id: "report-writing", name: "Report Writing & Storytelling", domainId: "communication", level: 3.6, required: 4.0 },
  { id: "stat-analysis", name: "Statistical Analysis", domainId: "stat-methods", level: 3.4, required: 4.0 },
  { id: "data-tools", name: "Data Analysis Tools", domainId: "data-analysis", level: 3.1, required: 4.0 },
  { id: "survey-design", name: "Survey Design & Methodology", domainId: "stat-methods", level: 3.3, required: 4.0 },
];

/** Skills shown in the "Skill Gap Analysis" table, in display order. */
export const GAP_SKILL_IDS = [
  "data-viz",
  "ml-basics",
  "gov-privacy",
  "python",
  "stats-framework",
  "report-writing",
];

/** Skills plotted on the radar / before-after comparison. */
export const PROFILE_SKILL_IDS = ["data-viz", "python", "stat-analysis", "data-tools", "survey-design"];

export function getSkill(id: string): Skill {
  const s = SKILLS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown skill ${id}`);
  return s;
}

export function gapPriority(gap: number): Priority {
  if (gap >= 1.4) return "High";
  if (gap >= 0.8) return "Medium";
  return "Low";
}

export function levelLabel(score: number): string {
  if (score >= 4.0) return "Advanced";
  if (score >= 3.0) return "Proficient";
  if (score >= 2.0) return "Developing";
  return "Foundational";
}

/** Overall band used on the dashboard. */
export function overallLabel(score: number): string {
  if (score >= 4.0) return "Advanced";
  if (score >= 3.0) return "Intermediate";
  if (score >= 2.0) return "Developing";
  return "Beginner";
}

export const COMPETENCY_LEVELS = [
  { range: "4.0 - 5.0", label: "Advanced", color: "bg-emerald-500" },
  { range: "3.0 - 3.9", label: "Proficient", color: "bg-brand-600" },
  { range: "2.0 - 2.9", label: "Developing", color: "bg-amber-400" },
  { range: "1.0 - 1.9", label: "Foundational", color: "bg-red-500" },
];

export const LAST_UPDATED = "15 Aug 2024";
export const OVERALL_DELTA = 0.4;

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function average(values: number[]): number {
  if (!values.length) return 0;
  return round1(values.reduce((a, b) => a + b, 0) / values.length);
}
