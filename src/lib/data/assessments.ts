/**
 * Assessment definitions.
 *
 * An assessment is unlocked by verified learning evidence and, once passed
 * with valid integrity, feeds the competency update. That gate is the core
 * product argument: course completion alone never raises competency.
 */

import type { Provider } from "@/lib/data/courses";
import { DATA_GOVERNANCE_BANK, DATA_VIZ_BANK, ML_BASICS_BANK, type Question } from "@/lib/data/questionBank";

export type AssessmentStatus = "available" | "locked" | "completed";

export interface SecondaryImpact {
  skillId: string;
  /** Topics whose accuracy drives this skill's delta. */
  topics: string[];
  /** Fraction of the remaining gap closed at 100% topic accuracy. */
  weight: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  linkedCourseTitle: string;
  provider: Provider;
  /** Competency the assessment primarily verifies. */
  primarySkillId: string;
  primarySkillName: string;
  secondary: SecondaryImpact[];
  questions: Question[];
  timeLimitMin: number;
  passingPct: number;
  status: AssessmentStatus;
  lockedReason?: string;
  /** Set when created in the Assessment Studio. */
  createdAt?: string;
  sourceFiles?: string[];
}

export const ASSESSMENTS: Assessment[] = [
  {
    id: "data-viz-assessment",
    title: "Data Visualization - Competency Assessment",
    description: "Answer the questions to verify your learning and demonstrate your competency.",
    courseId: "adv-data-viz-python",
    linkedCourseTitle: "Advanced Data Visualization with Python",
    provider: "iGOT",
    primarySkillId: "data-viz",
    primarySkillName: "Data Visualization",
    secondary: [
      { skillId: "python", topics: ["Python Basics", "Libraries (Matplotlib, Seaborn)"], weight: 0.35 },
      { skillId: "stat-analysis", topics: ["Application & Interpretation"], weight: 0.35 },
    ],
    questions: DATA_VIZ_BANK,
    timeLimitMin: 30,
    passingPct: 70,
    status: "available",
  },
  {
    id: "data-governance-assessment",
    title: "Data Governance & Privacy - Competency Assessment",
    description: "Verify your understanding of confidentiality, quality and stewardship for official statistics.",
    courseId: "data-governance-govt-data",
    linkedCourseTitle: "Data Governance for Government Data",
    provider: "TPAC",
    primarySkillId: "gov-privacy",
    primarySkillName: "Data Governance & Privacy",
    secondary: [{ skillId: "stats-framework", topics: ["Data Sharing", "Stewardship"], weight: 0.3 }],
    questions: DATA_GOVERNANCE_BANK,
    timeLimitMin: 15,
    passingPct: 70,
    status: "available",
  },
  {
    id: "ml-basics-assessment",
    title: "Machine Learning Basics - Competency Assessment",
    description: "Foundations, evaluation and responsible use of ML in official statistics.",
    courseId: "ml-basics-official-stats",
    linkedCourseTitle: "Machine Learning Basics for Official Statistics",
    provider: "iGOT",
    primarySkillId: "ml-basics",
    primarySkillName: "Machine Learning Basics",
    secondary: [{ skillId: "stat-analysis", topics: ["Evaluation"], weight: 0.2 }],
    questions: ML_BASICS_BANK,
    timeLimitMin: 15,
    passingPct: 70,
    status: "locked",
    lockedReason: "Course completion is pending verification from iGOT Karmayogi.",
  },
];

export function getAssessment(id: string, extra: Assessment[] = []): Assessment | undefined {
  return [...ASSESSMENTS, ...extra].find((a) => a.id === id);
}

export const ASSESSMENT_RULES = [
  "The assessment runs in full-screen mode. Leaving full screen is recorded as an integrity event.",
  "Switching tabs, windows or applications is detected and recorded.",
  "Copy, paste, printing and right-click are disabled for the duration of the assessment.",
  "Your camera and microphone remain active for live proctoring; the video is analysed on-device and never uploaded.",
  "Three integrity events end the assessment automatically and mark it as invalid.",
  "The timer continues if you reload the page; your answers are preserved.",
];
