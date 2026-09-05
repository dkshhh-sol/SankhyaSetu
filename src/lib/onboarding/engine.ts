/**
 * Competency scoring engine for the baseline onboarding assessment.
 *
 * This is a DETERMINISTIC, rule-based engine — not a trained model. The same
 * answers always produce the same profile, and every number on the results,
 * profile and gap screens can be traced back to individual tagged questions.
 *
 * The rule, in full:
 *
 *   1. Every question is tagged with the competency it measures and a
 *      difficulty. Difficulty sets the question's weight:
 *          Easy = 1, Medium = 2, Hard = 3
 *   2. For a competency, performance is the share of weight answered
 *      correctly:
 *          performance = sum(weight of correct items) / sum(weight of items)
 *   3. Performance maps linearly onto the 1.0 - 5.0 proficiency scale:
 *          proficiency = 1.0 + 4.0 * performance
 *      so 0% -> 1.0, 50% -> 3.0 and 100% -> 5.0.
 *   4. The gap against the role is `required - proficiency` (floored at 0),
 *      and priority uses the platform-wide banding in `data/competencies`.
 *
 * Weighting by difficulty (rather than a flat count) means a correct answer
 * on a Hard item moves a competency further than an Easy one, which keeps the
 * estimate closer to demonstrated ability while staying fully explainable.
 */

import {
  BASELINE_COMPETENCIES,
  BASELINE_QUESTIONS,
  getRole,
  type BaselineQuestion,
} from "@/lib/data/onboarding";
import { gapPriority, round1, type Priority } from "@/lib/data/competencies";
import { COURSES, type Course } from "@/lib/data/courses";
import type { Difficulty } from "@/lib/data/questionBank";

/** Difficulty -> weight. Documented in the "How this was calculated" panel. */
export const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

/** Bottom and top of the proficiency scale the engine maps onto. */
export const MIN_PROFICIENCY = 1.0;
export const MAX_PROFICIENCY = 5.0;

export interface CompetencyScore {
  competencyId: string;
  name: string;
  domain: string;
  skillId: string;
  /** Items asked for this competency. */
  asked: number;
  correct: number;
  /** Weight earned and weight available. */
  weightEarned: number;
  weightTotal: number;
  /** 0 - 1 share of weight answered correctly. */
  performance: number;
  /** Estimated current level on the 1.0 - 5.0 scale. */
  level: number;
  /** Level this role requires. */
  required: number;
  /** max(0, required - level). */
  gap: number;
  priority: Priority;
}

export interface BaselineResult {
  roleId: string;
  roleName: string;
  /** Overall weighted score as a percentage. */
  overallPct: number;
  correct: number;
  total: number;
  weightEarned: number;
  weightTotal: number;
  /** Mean estimated level across all competencies. */
  overallLevel: number;
  competencies: CompetencyScore[];
  /** Competencies with a gap > 0, largest first. */
  gaps: CompetencyScore[];
  completedAt: string;
}

/** True when the answer recorded for a question is the correct option. */
export function isCorrect(q: BaselineQuestion, answers: Record<string, number>): boolean {
  return answers[q.id] === q.answer;
}

/**
 * Score a completed baseline assessment against the required levels of the
 * selected role. Pure: same inputs always give the same result.
 */
export function scoreBaseline(
  roleId: string,
  answers: Record<string, number>,
  questions: BaselineQuestion[] = BASELINE_QUESTIONS,
): BaselineResult {
  const role = getRole(roleId);

  const competencies: CompetencyScore[] = BASELINE_COMPETENCIES.map((c) => {
    const items = questions.filter((q) => q.competencyId === c.id);
    const weightTotal = items.reduce((sum, q) => sum + DIFFICULTY_WEIGHT[q.difficulty], 0);
    const weightEarned = items.reduce(
      (sum, q) => sum + (isCorrect(q, answers) ? DIFFICULTY_WEIGHT[q.difficulty] : 0),
      0,
    );
    const performance = weightTotal ? weightEarned / weightTotal : 0;
    const level = round1(MIN_PROFICIENCY + (MAX_PROFICIENCY - MIN_PROFICIENCY) * performance);
    const required = role.required[c.id] ?? 3.0;
    const gap = round1(Math.max(0, required - level));

    return {
      competencyId: c.id,
      name: c.name,
      domain: c.domain,
      skillId: c.skillId,
      asked: items.length,
      correct: items.filter((q) => isCorrect(q, answers)).length,
      weightEarned,
      weightTotal,
      performance,
      level,
      required,
      gap,
      priority: gapPriority(gap),
    };
  });

  const weightTotal = competencies.reduce((s, c) => s + c.weightTotal, 0);
  const weightEarned = competencies.reduce((s, c) => s + c.weightEarned, 0);
  const correct = competencies.reduce((s, c) => s + c.correct, 0);
  const total = competencies.reduce((s, c) => s + c.asked, 0);

  return {
    roleId: role.id,
    roleName: role.name,
    overallPct: weightTotal ? Math.round((weightEarned / weightTotal) * 100) : 0,
    correct,
    total,
    weightEarned,
    weightTotal,
    overallLevel: round1(
      competencies.reduce((s, c) => s + c.level, 0) / (competencies.length || 1),
    ),
    competencies,
    gaps: competencies.filter((c) => c.gap > 0).sort((a, b) => b.gap - a.gap),
    completedAt: new Date().toISOString(),
  };
}

/**
 * Levels to write into the shared competency store, keyed by the skill id
 * each baseline competency feeds. This is what makes the generated profile
 * show up on the existing dashboard and competency pages.
 */
export function skillLevelsFrom(result: BaselineResult): Record<string, number> {
  const levels: Record<string, number> = {};
  for (const c of result.competencies) levels[c.skillId] = c.level;
  return levels;
}

/* ------------------------------------------------------------------ *
 * Recommendations
 * ------------------------------------------------------------------ */

/**
 * Preferred course per baseline competency. Deterministic, curated mapping —
 * NOT a learned recommender. Only iGOT Karmayogi modules and NSSTA / TPAC
 * programmes are offered; the platform never recommends external MOOCs.
 *
 * A semantic retrieval layer could replace this map later without changing
 * the surrounding screens.
 */
const COURSE_FOR_COMPETENCY: Record<string, string> = {
  python: "python-for-data-analysis",
  sql: "data-analysis-excel",
  statistics: "advanced-statistical-methods",
  "data-viz": "adv-data-viz-python",
  "survey-methodology": "advanced-survey-sampling",
  "data-quality": "data-quality-validation",
};

export interface Recommendation {
  competency: CompetencyScore;
  course: Course;
}

/**
 * One recommendation per gap, largest gap first. Competencies already at or
 * above the required level produce no recommendation.
 */
export function recommendationsFor(result: BaselineResult): Recommendation[] {
  const out: Recommendation[] = [];
  for (const c of result.gaps) {
    const preferred = COURSE_FOR_COMPETENCY[c.competencyId];
    const course =
      COURSES.find((x) => x.id === preferred) ?? COURSES.find((x) => x.skillId === c.skillId);
    if (course) out.push({ competency: c, course });
  }
  return out;
}

/** Human-readable band for an estimated level. */
export function proficiencyBand(level: number): string {
  if (level >= 4.5) return "Expert";
  if (level >= 3.5) return "Advanced";
  if (level >= 2.5) return "Proficient";
  if (level >= 1.5) return "Developing";
  return "Foundational";
}
