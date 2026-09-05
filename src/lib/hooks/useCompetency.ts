"use client";

import { useMemo } from "react";
import {
  COMPETENCY_DOMAINS,
  GAP_SKILL_IDS,
  OVERALL_DELTA,
  SKILLS,
  gapPriority,
  round1,
  type Priority,
} from "@/lib/data/competencies";
import { EVIDENCE } from "@/lib/data/evidence";
import { RECOMMENDED_COURSES } from "@/lib/data/courses";
import { useAppStore } from "@/lib/store/AppStore";

/** Baseline overall score for the demo identity (matches the design). */
const OVERALL_BASE = 3.1;

export interface DomainView {
  id: string;
  name: string;
  icon: (typeof COMPETENCY_DOMAINS)[number]["icon"];
  accent: (typeof COMPETENCY_DOMAINS)[number]["accent"];
  level: number;
  base: number;
  required: number;
}

export interface GapView {
  skillId: string;
  name: string;
  level: number;
  required: number;
  gap: number;
  priority: Priority;
}

/**
 * Every competency number shown in the UI derives from here so validated
 * assessment results are reflected consistently across pages.
 */
export function useCompetency() {
  const { currentLevels, state, assessments } = useAppStore();

  return useMemo(() => {
    const domains: DomainView[] = COMPETENCY_DOMAINS.map((d) => {
      const skills = SKILLS.filter((s) => s.domainId === d.id);
      const deltas = skills.map((s) => (currentLevels[s.id] ?? s.level) - s.level);
      const shift = skills.length ? deltas.reduce((a, b) => a + b, 0) / skills.length : 0;
      return { ...d, base: d.level, level: round1(d.level + shift) };
    });

    const domainShift = domains.reduce((a, d) => a + (d.level - d.base), 0) / domains.length;
    const overall = round1(OVERALL_BASE + domainShift);
    const overallDelta = round1(OVERALL_DELTA + domainShift);

    const gaps: GapView[] = GAP_SKILL_IDS.map((id) => {
      const s = SKILLS.find((x) => x.id === id)!;
      const level = currentLevels[id] ?? s.level;
      const gap = round1(Math.max(0, s.required - level));
      return { skillId: id, name: s.name, level, required: s.required, gap, priority: gapPriority(gap) };
    }).sort((a, b) => b.gap - a.gap);

    const gapCounts = {
      High: gaps.filter((g) => g.priority === "High").length,
      Medium: gaps.filter((g) => g.priority === "Medium").length,
      Low: gaps.filter((g) => g.priority === "Low").length,
    };

    const completedIds = new Set(Object.keys(state.results));
    const pendingAssessments = assessments.filter((a) => a.status === "available" && !completedIds.has(a.id));
    const verifiedEvidence = EVIDENCE.filter((e) => e.status === "verified").length;
    const activeLearning = RECOMMENDED_COURSES.filter(
      (c) => !EVIDENCE.some((e) => e.courseId === c.id && e.status === "verified"),
    ).length;
    const strengths = domains.filter((d) => d.level >= 3.5).length;

    return {
      domains,
      overall,
      overallDelta,
      gaps,
      gapCounts,
      pendingAssessments,
      verifiedEvidence,
      activeLearning,
      strengths,
      lastUpdated: state.lastResultId ? state.results[state.lastResultId]?.submittedAt : undefined,
    };
  }, [currentLevels, state.results, state.lastResultId, assessments]);
}
