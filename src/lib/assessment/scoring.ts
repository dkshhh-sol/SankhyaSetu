/**
 * Scoring, integrity and competency-impact rules.
 *
 * Pure functions so the attempt engine, result page and progress pages all
 * derive from the same numbers.
 */

import type { Assessment } from "@/lib/data/assessments";
import type { Question } from "@/lib/data/questionBank";
import { getSkill, round1 } from "@/lib/data/competencies";

export type IntegrityStatus = "valid" | "review" | "invalid";

export type ViolationType =
  | "fullscreen-exit"
  | "tab-switch"
  | "window-blur"
  | "copy-paste"
  | "shortcut"
  | "camera-lost"
  | "face-missing"
  | "page-reload"
  | "devtools";

export type Severity = "hard" | "soft";

export interface Violation {
  type: ViolationType;
  severity: Severity;
  message: string;
  at: number;
}

/** Number of HARD violations after which the attempt is auto-submitted. */
export const MAX_VIOLATIONS = 3;

export const VIOLATION_META: Record<ViolationType, { label: string; severity: Severity }> = {
  "fullscreen-exit": { label: "Left full-screen mode", severity: "hard" },
  "tab-switch": { label: "Switched tab or minimised the window", severity: "hard" },
  "window-blur": { label: "Focus moved to another application", severity: "hard" },
  "camera-lost": { label: "Camera feed interrupted", severity: "hard" },
  devtools: { label: "Developer tools opened", severity: "hard" },
  "copy-paste": { label: "Copy / paste attempted", severity: "soft" },
  shortcut: { label: "Blocked keyboard shortcut used", severity: "soft" },
  "face-missing": { label: "Face not visible to the camera", severity: "soft" },
  "page-reload": { label: "Page reloaded during the assessment", severity: "soft" },
};

export function makeViolation(type: ViolationType, message?: string): Violation {
  const meta = VIOLATION_META[type];
  return { type, severity: meta.severity, message: message ?? meta.label, at: Date.now() };
}

export function hardCount(violations: Violation[]): number {
  return violations.filter((v) => v.severity === "hard").length;
}

export interface TopicScore {
  topic: string;
  correct: number;
  total: number;
}

export interface SkillImpact {
  skillId: string;
  skillName: string;
  before: number;
  after: number;
  delta: number;
  required: number;
}

export interface AssessmentResult {
  assessmentId: string;
  scorePct: number;
  correct: number;
  total: number;
  passed: boolean;
  timeTakenSec: number;
  submittedAt: string;
  integrity: IntegrityStatus;
  violations: Violation[];
  perQuestion: Array<{ id: string; correct: boolean; answered: boolean }>;
  topics: TopicScore[];
  impact: SkillImpact[];
  /** Set when the engine submitted on the user's behalf. */
  autoSubmitted?: "time" | "integrity";
}

export function integrityFromViolations(violations: Violation[]): IntegrityStatus {
  if (hardCount(violations) >= MAX_VIOLATIONS) return "invalid";
  if (violations.length > 0) return "review";
  return "valid";
}

export function scoreAttempt(
  assessment: Assessment,
  questions: Question[],
  answers: Record<string, number>,
  violations: Violation[],
  timeTakenSec: number,
  currentLevels: Record<string, number>,
  autoSubmitted?: "time" | "integrity",
): AssessmentResult {
  const perQuestion = questions.map((q) => {
    const a = answers[q.id];
    return { id: q.id, answered: a !== undefined, correct: a === q.answer };
  });
  const correct = perQuestion.filter((p) => p.correct).length;
  const total = questions.length;
  const scorePct = Math.round((correct / total) * 100);
  const passed = scorePct >= assessment.passingPct;
  const integrity = integrityFromViolations(violations);

  const topicMap = new Map<string, TopicScore>();
  questions.forEach((q, i) => {
    const t = topicMap.get(q.topic) ?? { topic: q.topic, correct: 0, total: 0 };
    t.total += 1;
    if (perQuestion[i].correct) t.correct += 1;
    topicMap.set(q.topic, t);
  });
  const topics = [...topicMap.values()];

  const impact = computeImpact(assessment, topics, scorePct, passed && integrity !== "invalid", currentLevels);

  return {
    assessmentId: assessment.id,
    scorePct,
    correct,
    total,
    passed,
    timeTakenSec,
    submittedAt: new Date().toISOString(),
    integrity,
    violations,
    perQuestion,
    topics,
    impact,
    autoSubmitted,
  };
}

/**
 * Competency update rule. Only a passed assessment with valid (or
 * under-review) integrity moves a competency; otherwise every delta is zero.
 * The "before" and "after" are still reported so the UI can explain why
 * nothing changed.
 */
export function computeImpact(
  assessment: Assessment,
  topics: TopicScore[],
  scorePct: number,
  eligible: boolean,
  currentLevels: Record<string, number>,
): SkillImpact[] {
  const levelOf = (id: string) => currentLevels[id] ?? getSkill(id).level;
  const out: SkillImpact[] = [];

  const primary = getSkill(assessment.primarySkillId);
  const pBefore = levelOf(primary.id);
  const pGap = Math.max(0, primary.required - pBefore);
  const pDelta = eligible ? round1((scorePct / 100) * pGap * 0.75) : 0;
  out.push({
    skillId: primary.id,
    skillName: primary.name,
    before: pBefore,
    after: round1(pBefore + pDelta),
    delta: pDelta,
    required: primary.required,
  });

  for (const s of assessment.secondary) {
    const skill = getSkill(s.skillId);
    const before = levelOf(skill.id);
    const gap = Math.max(0, skill.required - before);
    const relevant = topics.filter((t) => s.topics.includes(t.topic));
    const asked = relevant.reduce((a, t) => a + t.total, 0);
    const got = relevant.reduce((a, t) => a + t.correct, 0);
    const accuracy = asked ? got / asked : 0;
    const delta = eligible ? round1(accuracy * s.weight * gap) : 0;
    out.push({
      skillId: skill.id,
      skillName: skill.name,
      before,
      after: round1(before + delta),
      delta,
      required: skill.required,
    });
  }
  return out;
}

export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Deterministic Fisher-Yates using a seed so a reload keeps the same order. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed >>> 0 || 1;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
