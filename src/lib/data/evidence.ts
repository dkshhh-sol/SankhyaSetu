/**
 * Learning evidence ledger (SIMULATED).
 *
 * Each record represents a completion signal that would be fetched from the
 * provider through an authorised integration. For the prototype the ledger is
 * static; the verification status is what gates access to assessments.
 */

import type { Provider } from "@/lib/data/courses";

export type EvidenceStatus = "verified" | "in-progress" | "pending";

export interface EvidenceRecord {
  id: string;
  courseId: string;
  title: string;
  provider: Provider;
  providerLabel: string;
  status: EvidenceStatus;
  /** "Completed on" / "Started on" date label. */
  date: string;
  duration: string;
  level: string;
  /** Evidence identifier assigned by the provider integration. */
  evidenceId: string;
  /** Assessment unlocked by this evidence, if any. */
  assessmentId?: string;
  /** Uses the Python logo tile in place of a provider tile. */
  tile?: "python";
}

export const EVIDENCE: EvidenceRecord[] = [
  {
    id: "ev-1",
    courseId: "adv-data-viz-python",
    title: "Advanced Data Visualization with Python",
    provider: "iGOT",
    providerLabel: "iGOT Karmayogi",
    status: "verified",
    date: "02 Sep 2024",
    duration: "4 Weeks",
    level: "Intermediate",
    evidenceId: "IGOT-2024-DA-11872",
    assessmentId: "data-viz-assessment",
  },
  {
    id: "ev-2",
    courseId: "data-analysis-excel",
    title: "Data Analysis with Excel",
    provider: "iGOT",
    providerLabel: "iGOT Karmayogi",
    status: "verified",
    date: "15 Jul 2024",
    duration: "3 Weeks",
    level: "Beginner",
    evidenceId: "IGOT-2024-DA-09341",
  },
  {
    id: "ev-3",
    courseId: "python-for-data-analysis",
    title: "Python for Official Statistics",
    provider: "iGOT",
    providerLabel: "iGOT Karmayogi",
    status: "in-progress",
    date: "28 Aug 2024",
    duration: "6 Weeks",
    level: "Beginner to Intermediate",
    evidenceId: "IGOT-2024-DA-12210",
    tile: "python",
  },
  {
    id: "ev-4",
    courseId: "advanced-survey-sampling",
    title: "Advanced Survey Sampling Techniques",
    provider: "NSSTA",
    providerLabel: "NSSTA",
    status: "verified",
    date: "10 Jun 2024",
    duration: "5 Days",
    level: "Instructor-led",
    evidenceId: "NSSTA-2024-SS-00417",
  },
  {
    id: "ev-5",
    courseId: "data-governance-govt-data",
    title: "Data Governance for Government Data",
    provider: "TPAC",
    providerLabel: "TPAC",
    status: "verified",
    date: "22 May 2024",
    duration: "3 Days",
    level: "Hybrid",
    evidenceId: "TPAC-2024-DG-00088",
    assessmentId: "data-governance-assessment",
  },
  {
    id: "ev-6",
    courseId: "ml-basics-official-stats",
    title: "Machine Learning Basics for Official Statistics",
    provider: "iGOT",
    providerLabel: "iGOT Karmayogi",
    status: "pending",
    date: "01 Sep 2024",
    duration: "6 Weeks",
    level: "Beginner",
    evidenceId: "IGOT-2024-DA-12655",
    assessmentId: "ml-basics-assessment",
  },
];

export const VERIFICATION_STEPS = [
  "You complete the course on iGOT Karmayogi or attend an NSSTA/TPAC programme.",
  "Your completion status is fetched through authorized integration (API).",
  "Once verified, the course appears here and you can access the related competency assessment.",
];
