"use client";

import { useMemo } from "react";
import { getAssessment } from "@/lib/data/assessments";
import { getSkill, PROFILE_SKILL_IDS, round1 } from "@/lib/data/competencies";
import { EVIDENCE } from "@/lib/data/evidence";
import type { SkillImpact } from "@/lib/assessment/scoring";
import { useAppStore } from "@/lib/store/AppStore";
import { useCompetency } from "@/lib/hooks/useCompetency";

/**
 * Data for the Progress pages. When the user has completed an assessment in
 * this session the real result drives the page; otherwise the design's
 * reference scenario (Data Visualization 2.6 -> 3.5 after an 87% pass) is
 * shown so the screen still demonstrates the update flow.
 */
export function useLatestUpdate() {
  const { state } = useAppStore();
  const c = useCompetency();

  return useMemo(() => {
    const live = state.lastResultId ? state.results[state.lastResultId] : undefined;
    const assessment = live ? getAssessment(live.assessmentId, state.customAssessments) : getAssessment("data-viz-assessment");
    const evidence = EVIDENCE.find((e) => e.assessmentId === assessment?.id);

    const referenceImpact: SkillImpact[] = [
      { skillId: "data-viz", skillName: "Data Visualization", before: 2.6, after: 3.5, delta: 0.9, required: 4.0 },
      { skillId: "python", skillName: "Python Programming", before: 2.8, after: 3.2, delta: 0.4, required: 4.0 },
      { skillId: "stat-analysis", skillName: "Statistical Analysis", before: 3.4, after: 3.6, delta: 0.2, required: 4.0 },
      { skillId: "data-tools", skillName: "Data Analysis Tools", before: 3.1, after: 3.1, delta: 0.0, required: 4.0 },
    ];

    const impact = live ? live.impact : referenceImpact;
    const primary = impact[0];
    const scorePct = live ? live.scorePct : 87;
    const integrity = live ? live.integrity : ("valid" as const);
    const applied = live ? live.passed && live.integrity !== "invalid" : true;
    const updatedAt = live ? live.submittedAt : "2024-09-02T17:30:00+05:30";

    // Radar / comparison rows: profile skills with before/after.
    const rows = PROFILE_SKILL_IDS.map((id) => {
      const s = getSkill(id);
      const hit = impact.find((i) => i.skillId === id);
      const before = hit ? hit.before : s.level;
      const after = hit ? hit.after : (live ? state.skillLevels[id] ?? s.level : s.level);
      return { skillId: id, name: s.name.replace("Advanced Data Visualization", "Data Visualization"), before, after, delta: round1(after - before), required: s.required };
    });

    const gapBefore = round1(Math.max(0, primary.required - primary.before));
    const gapAfter = round1(Math.max(0, primary.required - primary.after));
    const reduction = gapBefore > 0 ? Math.round(((gapBefore - gapAfter) / gapBefore) * 100) : 0;

    const improved = impact.filter((i) => i.delta > 0).length;
    const overallBefore = round1(c.overall - (live ? 0 : 0.2));
    const overallAfter = live ? c.overall : round1(c.overall + 0.2);

    return {
      live: !!live,
      assessment,
      evidence,
      impact,
      primary,
      rows,
      scorePct,
      integrity,
      applied,
      updatedAt,
      gapBefore,
      gapAfter,
      reduction,
      improved,
      overallBefore,
      overallAfter,
    };
  }, [state.lastResultId, state.results, state.customAssessments, state.skillLevels, c.overall]);
}
