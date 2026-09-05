/**
 * Learning catalogue (SIMULATED).
 *
 * SankhyaSetu never hosts course content. Every entry links out to its
 * provider (iGOT Karmayogi, NSSTA or TPAC). The URLs below are the public
 * portals; deep links would come from the provider's catalogue API once an
 * authorised integration is in place.
 */

export type Provider = "iGOT" | "NSSTA" | "TPAC";
export type Level = "Beginner" | "Intermediate" | "Advanced" | "Beginner to Intermediate";
export type Priority = "High" | "Medium" | "Low";
export type Mode = "Self-paced" | "Instructor-led" | "Hybrid";

export interface Course {
  id: string;
  title: string;
  provider: Provider;
  description: string;
  longDescription: string;
  duration: string;
  level: Level;
  mode: Mode;
  effort: string;
  language: string;
  category: string;
  /** Path under /public. */
  image: string;
  /** Skill this course primarily addresses (see data/competencies). */
  skillId: string;
  skillName: string;
  priority?: Priority;
  recommended?: boolean;
  outcomes: string[];
  prerequisites: string[];
  relatedSkillIds: string[];
  /** Assessment unlocked after verified completion. */
  assessmentId?: string;
  providerUrl: string;
}

export const PROVIDER_URLS: Record<Provider, string> = {
  iGOT: "https://igotkarmayogi.gov.in/",
  NSSTA: "https://mospi.gov.in/nssta",
  TPAC: "https://mospi.gov.in/",
};

export const PROVIDER_FULL: Record<Provider, string> = {
  iGOT: "iGOT Karmayogi",
  NSSTA: "NSSTA",
  TPAC: "TPAC",
};

export const COURSES: Course[] = [
  {
    id: "adv-data-viz-python",
    title: "Advanced Data Visualization with Python",
    provider: "iGOT",
    description:
      "Build advanced visualization skills for statistical data using Python libraries like Matplotlib and Seaborn.",
    longDescription:
      "This course helps government officials build advanced data visualization skills using Python. You will learn to create insightful charts and interactive visualizations using popular Python libraries such as Matplotlib, Seaborn and Plotly, with real-world examples relevant to data-driven decision making.",
    duration: "4 Weeks",
    level: "Intermediate",
    mode: "Self-paced",
    effort: "3-4 hours per week",
    language: "English",
    category: "Data Analysis",
    image: "/images/course-python-viz.jpg",
    skillId: "data-viz",
    skillName: "Data Visualization",
    priority: "High",
    recommended: true,
    outcomes: [
      "Create effective static and interactive visualizations",
      "Use Matplotlib, Seaborn and Plotly for data analysis",
      "Apply visualization techniques to real government datasets",
      "Build dashboards for data-driven decision making",
    ],
    prerequisites: [
      "Basic knowledge of Python",
      "Understanding of data structures (e.g., Pandas)",
      "Familiarity with statistical concepts is helpful but not mandatory",
    ],
    relatedSkillIds: ["data-viz", "python", "stat-analysis", "data-tools"],
    assessmentId: "data-viz-assessment",
    providerUrl: PROVIDER_URLS.iGOT,
  },
  {
    id: "data-governance-privacy",
    title: "Data Governance and Privacy",
    provider: "NSSTA",
    description: "Standards, privacy and data management for official statistics.",
    longDescription:
      "An NSSTA programme covering the statistical data governance framework, confidentiality obligations under the Collection of Statistics Act, privacy-preserving release practices and metadata standards for official statistics.",
    duration: "3 Weeks",
    level: "Intermediate",
    mode: "Hybrid",
    effort: "4 hours per week",
    language: "English / Hindi",
    category: "Data Governance",
    image: "/images/course-governance.jpg",
    skillId: "gov-privacy",
    skillName: "Data Governance & Privacy",
    priority: "High",
    recommended: true,
    outcomes: [
      "Apply the statistical confidentiality framework",
      "Design privacy-preserving data release workflows",
      "Maintain metadata to national standards",
    ],
    prerequisites: ["Familiarity with official statistical processes"],
    relatedSkillIds: ["gov-privacy", "stats-framework"],
    assessmentId: "data-governance-assessment",
    providerUrl: PROVIDER_URLS.NSSTA,
  },
  {
    id: "ml-basics-official-stats",
    title: "Machine Learning Basics for Official Statistics",
    provider: "TPAC",
    description: "Foundations of ML and its applications in government data.",
    longDescription:
      "A TPAC training that introduces supervised and unsupervised learning, model evaluation and the responsible use of machine learning in the production of official statistics, including imputation and classification of survey responses.",
    duration: "6 Weeks",
    level: "Beginner",
    mode: "Instructor-led",
    effort: "3 hours per week",
    language: "English",
    category: "AI & Emerging Technologies",
    image: "/images/course-ml.jpg",
    skillId: "ml-basics",
    skillName: "Machine Learning Basics",
    priority: "Medium",
    recommended: true,
    outcomes: [
      "Explain core ML concepts and terminology",
      "Evaluate model quality with appropriate metrics",
      "Identify suitable ML use cases in statistical production",
    ],
    prerequisites: ["Basic statistics", "Comfort with spreadsheets or Python"],
    relatedSkillIds: ["ml-basics", "python", "stat-analysis"],
    assessmentId: "ml-basics-assessment",
    providerUrl: PROVIDER_URLS.TPAC,
  },
  {
    id: "statistical-report-writing",
    title: "Statistical Report Writing and Storytelling",
    provider: "iGOT",
    description: "Learn to communicate insights effectively through data-driven reports.",
    longDescription:
      "Learn to structure statistical releases, write plain-language summaries and choose the right narrative and visual devices to communicate findings to policy audiences.",
    duration: "3 Weeks",
    level: "Beginner",
    mode: "Self-paced",
    effort: "2 hours per week",
    language: "English",
    category: "Communication",
    image: "/images/course-report.jpg",
    skillId: "report-writing",
    skillName: "Report Writing & Storytelling",
    priority: "Medium",
    recommended: true,
    outcomes: [
      "Structure a statistical release",
      "Write for policy audiences",
      "Pair narrative with visuals",
    ],
    prerequisites: ["None"],
    relatedSkillIds: ["report-writing", "data-viz"],
    providerUrl: PROVIDER_URLS.iGOT,
  },
  // ---- iGOT catalogue ----
  {
    id: "intro-official-statistics",
    title: "Introduction to Official Statistics",
    provider: "iGOT",
    description: "The Indian statistical system, its institutions and core outputs.",
    longDescription:
      "An overview of the national statistical system, the role of MoSPI and NSO, key surveys and how official statistics are produced and disseminated.",
    duration: "2 Weeks",
    level: "Beginner",
    mode: "Self-paced",
    effort: "2 hours per week",
    language: "English / Hindi",
    category: "Official Statistics",
    image: "/images/course-intro-stats.jpg",
    skillId: "stats-framework",
    skillName: "Official Statistics Framework",
    outcomes: ["Describe the national statistical system", "Identify major statistical products"],
    prerequisites: ["None"],
    relatedSkillIds: ["stats-framework"],
    providerUrl: PROVIDER_URLS.iGOT,
  },
  {
    id: "data-analysis-excel",
    title: "Data Analysis with Excel",
    provider: "iGOT",
    description: "Pivot tables, lookups and charts for everyday statistical work.",
    longDescription:
      "Hands-on Excel for statistical officers: cleaning data, pivot analysis, lookups, basic charts and reproducible workbooks.",
    duration: "3 Weeks",
    level: "Beginner",
    mode: "Self-paced",
    effort: "2 hours per week",
    language: "English",
    category: "Data Analysis",
    image: "/images/course-excel.jpg",
    skillId: "data-tools",
    skillName: "Data Analysis Tools",
    outcomes: ["Build pivot-table analyses", "Create clear charts in Excel"],
    prerequisites: ["Basic computer literacy"],
    relatedSkillIds: ["data-tools"],
    providerUrl: PROVIDER_URLS.iGOT,
  },
  {
    id: "data-quality-validation",
    title: "Data Quality and Validation",
    provider: "iGOT",
    description: "Validation rules, edit checks and quality frameworks for survey data.",
    longDescription:
      "Learn to design edit and imputation rules, apply data quality dimensions and document validation for survey and administrative data.",
    duration: "3 Weeks",
    level: "Intermediate",
    mode: "Self-paced",
    effort: "3 hours per week",
    language: "English",
    category: "Data Governance",
    image: "/images/course-data-quality.jpg",
    skillId: "gov-privacy",
    skillName: "Data Governance & Privacy",
    outcomes: ["Design validation rules", "Apply quality frameworks"],
    prerequisites: ["Introduction to Official Statistics"],
    relatedSkillIds: ["gov-privacy", "stat-analysis"],
    providerUrl: PROVIDER_URLS.iGOT,
  },
  {
    id: "communication-policy-impact",
    title: "Communication for Policy Impact",
    provider: "iGOT",
    description: "Presenting statistical evidence to decision makers.",
    longDescription:
      "Techniques for briefing senior officers and ministers with statistical evidence: framing, summarising uncertainty and presenting with impact.",
    duration: "2 Weeks",
    level: "Beginner",
    mode: "Self-paced",
    effort: "2 hours per week",
    language: "English",
    category: "Communication",
    image: "/images/course-comm-policy.jpg",
    skillId: "report-writing",
    skillName: "Report Writing & Storytelling",
    outcomes: ["Brief decision makers effectively", "Communicate uncertainty"],
    prerequisites: ["None"],
    relatedSkillIds: ["report-writing"],
    providerUrl: PROVIDER_URLS.iGOT,
  },
  {
    id: "python-for-data-analysis",
    title: "Python for Data Analysis",
    provider: "iGOT",
    description: "Pandas, NumPy and reproducible analysis pipelines.",
    longDescription:
      "Move from spreadsheets to Python: load, clean and analyse survey data with Pandas and NumPy, and build reproducible analysis scripts.",
    duration: "5 Weeks",
    level: "Beginner to Intermediate",
    mode: "Self-paced",
    effort: "3 hours per week",
    language: "English",
    category: "Data Analysis",
    image: "/images/course-python-viz.jpg",
    skillId: "python",
    skillName: "Python Programming",
    outcomes: ["Analyse data with Pandas", "Write reproducible pipelines"],
    prerequisites: ["Basic programming concepts"],
    relatedSkillIds: ["python", "data-tools"],
    providerUrl: PROVIDER_URLS.iGOT,
  },
  // ---- NSSTA / TPAC programmes ----
  {
    id: "advanced-survey-sampling",
    title: "Advanced Survey Sampling Techniques",
    provider: "NSSTA",
    description: "Stratified, multi-stage and calibrated sampling for national surveys.",
    longDescription:
      "An instructor-led NSSTA programme on multi-stage sample design, weighting, calibration and variance estimation for large-scale household surveys.",
    duration: "5 Days",
    level: "Advanced",
    mode: "Instructor-led",
    effort: "Full-time residential",
    language: "English",
    category: "Statistical Methods",
    image: "/images/course-governance.jpg",
    skillId: "survey-design",
    skillName: "Survey Design & Methodology",
    outcomes: ["Design multi-stage samples", "Compute survey weights and variances"],
    prerequisites: ["Working knowledge of sampling theory"],
    relatedSkillIds: ["survey-design", "stat-analysis"],
    providerUrl: PROVIDER_URLS.NSSTA,
  },
  {
    id: "data-governance-govt-data",
    title: "Data Governance for Government Data",
    provider: "TPAC",
    description: "Stewardship, classification and sharing of administrative data.",
    longDescription:
      "A TPAC hybrid programme on stewardship roles, data classification, inter-departmental sharing agreements and the National Data Sharing and Accessibility Policy.",
    duration: "3 Days",
    level: "Intermediate",
    mode: "Hybrid",
    effort: "Workshop",
    language: "English",
    category: "Data Governance",
    image: "/images/course-data-quality.jpg",
    skillId: "gov-privacy",
    skillName: "Data Governance & Privacy",
    outcomes: ["Define stewardship roles", "Draft data sharing agreements"],
    prerequisites: ["None"],
    relatedSkillIds: ["gov-privacy", "stats-framework"],
    providerUrl: PROVIDER_URLS.TPAC,
  },
  {
    id: "advanced-statistical-methods",
    title: "Advanced Statistical Methods",
    provider: "NSSTA",
    description: "Regression, time-series and small-area estimation for official statistics.",
    longDescription:
      "Advanced methods for statistical production: regression modelling, seasonal adjustment, time-series analysis and small-area estimation.",
    duration: "4 Weeks",
    level: "Advanced",
    mode: "Hybrid",
    effort: "4 hours per week",
    language: "English",
    category: "Statistical Methods",
    image: "/images/course-intro-stats.jpg",
    skillId: "stat-analysis",
    skillName: "Statistical Analysis",
    outcomes: ["Apply regression and time-series methods", "Produce small-area estimates"],
    prerequisites: ["Advanced Survey Sampling Techniques"],
    relatedSkillIds: ["stat-analysis", "survey-design"],
    providerUrl: PROVIDER_URLS.NSSTA,
  },
];

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export const RECOMMENDED_COURSES = COURSES.filter((c) => c.recommended);

export const LEARNING_JOURNEY = [
  { step: 1, title: "Identify", subtitle: "Skill Gaps" },
  { step: 2, title: "Learn through", subtitle: "Curated Programmes" },
  { step: 3, title: "Assess", subtitle: "and Validate" },
  { step: 4, title: "Update", subtitle: "Your Competency" },
  { step: 5, title: "Apply Learning", subtitle: "to Real Work" },
];
