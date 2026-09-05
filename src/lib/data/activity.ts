/** Recent activity feed + notifications (SIMULATED). */

export type ActivityKind = "assessment" | "course" | "badge" | "competency";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  when: string;
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", kind: "assessment", title: "Completed Assessment", detail: "Statistical Foundations", when: "2 days ago" },
  { id: "a2", kind: "course", title: "Progressed in Course", detail: "Data Analysis with Python", when: "4 days ago" },
  { id: "a3", kind: "badge", title: "Earned Competency Badge", detail: "Data Visualization", when: "1 week ago" },
  { id: "a4", kind: "competency", title: "Updated Competency Level", detail: "Statistical Methods (2.8 -> 3.2)", when: "1 week ago" },
];

export interface Notification {
  id: string;
  title: string;
  body: string;
  when: string;
  href: string;
  unread?: boolean;
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Assessment unlocked",
    body: "Your iGOT completion for Advanced Data Visualization with Python has been verified. The competency assessment is now available.",
    when: "Today, 09:12",
    href: "/assessments",
    unread: true,
  },
  {
    id: "n2",
    title: "Verification pending",
    body: "Machine Learning Basics for Official Statistics is awaiting confirmation from iGOT Karmayogi.",
    when: "Yesterday",
    href: "/evidence",
    unread: true,
  },
  {
    id: "n3",
    title: "New NSSTA programme",
    body: "Data Governance and Privacy (3 weeks, hybrid) matches a high-priority skill gap in your profile.",
    when: "2 days ago",
    href: "/learning/data-governance-privacy",
  },
];

export interface AssessmentHistoryRow {
  id: string;
  date: string;
  name: string;
  type: "Quiz" | "Assessment";
  score: number;
  level: number;
  improved?: boolean;
}

export const ASSESSMENT_HISTORY: AssessmentHistoryRow[] = [
  { id: "h1", date: "15 Aug 2024", name: "Data Analysis Fundamentals", type: "Quiz", score: 87, level: 3.1, improved: true },
  { id: "h2", date: "12 Jul 2024", name: "Official Statistics Systems", type: "Assessment", score: 72, level: 2.8 },
  { id: "h3", date: "20 May 2024", name: "Data Governance", type: "Assessment", score: 65, level: 2.4 },
];
