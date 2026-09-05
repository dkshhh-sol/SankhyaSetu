/**
 * Baseline onboarding model: competencies, roles and the competency-tagged
 * question bank used by the new-official flow.
 *
 * SIMULATED for the prototype. In production the role -> required-competency
 * matrix would come from the MoSPI competency framework service (seeded from
 * iGOT Karmayogi's FRAC) and the item bank from a governed assessment store.
 * The shapes below mirror what those services would return.
 *
 * Every baseline competency maps onto an existing skill in
 * `data/competencies.ts` via `skillId`, so a profile generated here feeds the
 * existing dashboard, competency and learning pages without a parallel model.
 */

import type { Difficulty } from "@/lib/data/questionBank";

export type CompetencyDomainName = "Technical" | "Statistical" | "Analytical" | "Governance";
export type ProficiencyLevel = "Basic" | "Intermediate" | "Advanced";

export interface BaselineCompetency {
  id: string;
  name: string;
  domain: CompetencyDomainName;
  /** Skill in the main competency framework this competency feeds. */
  skillId: string;
}

export const BASELINE_COMPETENCIES: BaselineCompetency[] = [
  { id: "python", name: "Python", domain: "Technical", skillId: "python" },
  { id: "sql", name: "SQL", domain: "Technical", skillId: "data-tools" },
  { id: "statistics", name: "Statistics", domain: "Statistical", skillId: "stat-analysis" },
  { id: "data-viz", name: "Data Visualization", domain: "Analytical", skillId: "data-viz" },
  { id: "survey-methodology", name: "Survey Methodology", domain: "Statistical", skillId: "survey-design" },
  { id: "data-quality", name: "Data Quality", domain: "Governance", skillId: "gov-privacy" },
];

export function getCompetency(id: string): BaselineCompetency {
  const c = BASELINE_COMPETENCIES.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown baseline competency ${id}`);
  return c;
}

/* ------------------------------------------------------------------ *
 * Roles and their required competency levels (on the 1.0 - 5.0 scale)
 * ------------------------------------------------------------------ */

export interface Role {
  id: string;
  name: string;
  /** Short line shown under the role in the picker. */
  blurb: string;
  /** Required level per baseline competency id. */
  required: Record<string, number>;
}

export const ROLES: Role[] = [
  {
    id: "data-analyst",
    name: "Data Analyst",
    blurb: "Analyses datasets and builds reporting outputs",
    required: { python: 4.0, sql: 4.0, statistics: 4.0, "data-viz": 4.0, "survey-methodology": 3.0, "data-quality": 3.5 },
  },
  {
    id: "statistical-officer",
    name: "Statistical Officer",
    blurb: "Owns statistical products and survey outputs",
    required: { python: 3.0, sql: 3.0, statistics: 4.5, "data-viz": 3.5, "survey-methodology": 4.5, "data-quality": 4.0 },
  },
  {
    id: "survey-officer",
    name: "Survey Officer",
    blurb: "Plans and runs field surveys and data collection",
    required: { python: 2.5, sql: 3.0, statistics: 4.0, "data-viz": 3.0, "survey-methodology": 4.5, "data-quality": 4.0 },
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    blurb: "Builds models and advanced analytical pipelines",
    required: { python: 4.5, sql: 4.0, statistics: 4.5, "data-viz": 4.0, "survey-methodology": 3.0, "data-quality": 3.5 },
  },
  {
    id: "research-analyst",
    name: "Research / Statistical Analyst",
    blurb: "Conducts statistical research and analytical studies",
    required: { python: 3.5, sql: 3.5, statistics: 4.5, "data-viz": 4.0, "survey-methodology": 4.0, "data-quality": 3.5 },
  },
  {
    id: "administrative",
    name: "Administrative / Managerial",
    blurb: "Oversees statistical programmes and reporting",
    required: { python: 2.0, sql: 2.5, statistics: 3.0, "data-viz": 3.5, "survey-methodology": 3.0, "data-quality": 4.0 },
  },
  {
    id: "other",
    name: "Other",
    blurb: "A general statistical-system baseline",
    required: { python: 3.0, sql: 3.0, statistics: 3.5, "data-viz": 3.5, "survey-methodology": 3.5, "data-quality": 3.5 },
  },
];

export function getRole(id: string): Role {
  const r = ROLES.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown role ${id}`);
  return r;
}

/** Primary responsibility / current assignment options. */
export const ASSIGNMENTS = [
  "Data Collection",
  "Survey Design",
  "Data Processing",
  "Statistical Analysis",
  "Data Visualization",
  "Policy / Reporting",
  "GIS / Spatial Analysis",
  "Management / Administration",
] as const;

export const QUALIFICATIONS = [
  "Bachelor's Degree",
  "Master's Degree (Statistics / Economics)",
  "Master's Degree (Other)",
  "M.Phil / Ph.D.",
  "Professional Certification",
  "Other",
] as const;

export const EXPERIENCE_BANDS = [
  "Less than 1 year",
  "1 - 3 years",
  "4 - 7 years",
  "8 - 15 years",
  "More than 15 years",
] as const;

export const DEPARTMENTS = [
  "National Statistical Office (NSO)",
  "Central Statistics Office (CSO)",
  "National Sample Survey Office (NSSO)",
  "Programme Implementation Wing",
  "State Directorate of Economics & Statistics",
  "Other Ministry / Department",
] as const;

/* ------------------------------------------------------------------ *
 * Competency-tagged baseline item bank
 * ------------------------------------------------------------------ */

export interface BaselineQuestion {
  id: string;
  /** Baseline competency this item scores. */
  competencyId: string;
  level: ProficiencyLevel;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  /** Index into `options` of the correct answer. */
  answer: number;
}

export const BASELINE_QUESTIONS: BaselineQuestion[] = [
  /* ---------------- Python (3) ---------------- */
  {
    id: "bq-01",
    competencyId: "python",
    level: "Basic",
    difficulty: "Easy",
    prompt: "In pandas, which method returns the first five rows of a DataFrame by default?",
    options: ["df.top()", "df.head()", "df.first()", "df.preview()"],
    answer: 1,
  },
  {
    id: "bq-02",
    competencyId: "python",
    level: "Intermediate",
    difficulty: "Medium",
    prompt: "Which pandas operation combines two DataFrames using values in a shared column?",
    options: ["pd.concat()", "pd.merge()", "df.append()", "df.stack()"],
    answer: 1,
  },
  {
    id: "bq-03",
    competencyId: "python",
    level: "Intermediate",
    difficulty: "Medium",
    prompt: "What does the expression [x * 2 for x in range(4)] evaluate to?",
    options: ["[0, 2, 4, 6]", "[2, 4, 6, 8]", "[0, 1, 2, 3]", "[1, 2, 3, 4]"],
    answer: 0,
  },

  /* ---------------- SQL (3) ---------------- */
  {
    id: "bq-04",
    competencyId: "sql",
    level: "Basic",
    difficulty: "Easy",
    prompt: "Which SQL operation is used to combine rows from two tables based on a related column?",
    options: ["UNION", "JOIN", "GROUP BY", "MERGE INTO"],
    answer: 1,
  },
  {
    id: "bq-05",
    competencyId: "sql",
    level: "Intermediate",
    difficulty: "Medium",
    prompt: "Which clause filters groups after aggregation has been applied?",
    options: ["WHERE", "HAVING", "FILTER", "QUALIFY"],
    answer: 1,
  },
  {
    id: "bq-06",
    competencyId: "sql",
    level: "Advanced",
    difficulty: "Hard",
    prompt: "In a window function, what does PARTITION BY district do?",
    options: [
      "Removes duplicate district values from the result",
      "Restricts the query to a single district",
      "Restarts the window calculation separately for each district",
      "Sorts the final result set by district",
    ],
    answer: 2,
  },

  /* ---------------- Statistics (3) ---------------- */
  {
    id: "bq-07",
    competencyId: "statistics",
    level: "Basic",
    difficulty: "Easy",
    prompt: "Which measure of central tendency is least affected by extreme outliers?",
    options: ["Mean", "Median", "Range", "Standard deviation"],
    answer: 1,
  },
  {
    id: "bq-08",
    competencyId: "statistics",
    level: "Intermediate",
    difficulty: "Medium",
    prompt: "A hypothesis test returns p = 0.03 at a significance level of 0.05. What is the correct conclusion?",
    options: [
      "Fail to reject the null hypothesis",
      "Reject the null hypothesis",
      "The null hypothesis is proven true",
      "The test is inconclusive and must be repeated",
    ],
    answer: 1,
  },
  {
    id: "bq-09",
    competencyId: "statistics",
    level: "Advanced",
    difficulty: "Hard",
    prompt: "What does the Central Limit Theorem state about the sampling distribution of the sample mean?",
    options: [
      "It is always identical to the population distribution",
      "It approaches a normal distribution as sample size increases",
      "It becomes uniformly distributed for large samples",
      "Its variance increases with the sample size",
    ],
    answer: 1,
  },

  /* ---------------- Data Visualization (2) ---------------- */
  {
    id: "bq-10",
    competencyId: "data-viz",
    level: "Basic",
    difficulty: "Easy",
    prompt: "Which chart type best shows the distribution of a single continuous variable?",
    options: ["Pie chart", "Histogram", "Scatter plot", "Stacked bar chart"],
    answer: 1,
  },
  {
    id: "bq-11",
    competencyId: "data-viz",
    level: "Intermediate",
    difficulty: "Medium",
    prompt:
      "A district-level indicator is to be compared across all districts of a state on a map. Which visualisation is most appropriate?",
    options: ["Choropleth map", "Line chart", "Box plot", "Treemap"],
    answer: 0,
  },

  /* ---------------- Survey Methodology (2) ---------------- */
  {
    id: "bq-12",
    competencyId: "survey-methodology",
    level: "Intermediate",
    difficulty: "Medium",
    prompt:
      "Which sampling method is appropriate when the population has distinct subgroups and each subgroup must be represented?",
    options: ["Simple random sampling", "Stratified sampling", "Convenience sampling", "Systematic sampling"],
    answer: 1,
  },
  {
    id: "bq-13",
    competencyId: "survey-methodology",
    level: "Advanced",
    difficulty: "Hard",
    prompt: "Non-response bias in a household survey arises when",
    options: [
      "The questionnaire contains too many open-ended questions",
      "Interviewers record answers inconsistently",
      "Non-responding households differ systematically from responding ones",
      "The sample size is smaller than originally planned",
    ],
    answer: 2,
  },

  /* ---------------- Data Quality (2) ---------------- */
  {
    id: "bq-14",
    competencyId: "data-quality",
    level: "Basic",
    difficulty: "Easy",
    prompt: "Which data quality dimension describes whether all required records and fields are present?",
    options: ["Accuracy", "Completeness", "Timeliness", "Consistency"],
    answer: 1,
  },
  {
    id: "bq-15",
    competencyId: "data-quality",
    level: "Intermediate",
    difficulty: "Medium",
    prompt: "A validation rule rejects any age value below 0 or above 120. This is an example of a",
    options: ["Range check", "Referential integrity check", "Deduplication rule", "Imputation rule"],
    answer: 0,
  },
];

/** Items that score a given competency. */
export function questionsFor(competencyId: string): BaselineQuestion[] {
  return BASELINE_QUESTIONS.filter((q) => q.competencyId === competencyId);
}
