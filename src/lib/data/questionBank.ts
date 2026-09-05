/**
 * Predefined question banks.
 *
 * The prototype's "RAG pipeline" is SIMULATED: instead of retrieving passages
 * from uploaded material and generating items, it selects from these curated
 * banks keyed by topic. The interface (bank -> topic -> items) is shaped so a
 * genuine retrieval-based generator could replace it without changing the UI.
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Question {
  id: string;
  topic: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  /** Index into `options` of the correct answer. */
  answer: number;
  explanation?: string;
}

export const DATA_VIZ_BANK: Question[] = [
  // Python Basics (4)
  {
    id: "dv-01",
    topic: "Python Basics",
    difficulty: "Easy",
    prompt: "Which of the following Python libraries is most commonly used for data visualization?",
    options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
    answer: 2,
  },
  {
    id: "dv-02",
    topic: "Python Basics",
    difficulty: "Easy",
    prompt: "What does the statement `import matplotlib.pyplot as plt` do?",
    options: [
      "Installs Matplotlib from PyPI",
      "Imports the pyplot module and aliases it as plt",
      "Creates an empty figure named plt",
      "Converts a DataFrame into a plot",
    ],
    answer: 1,
  },
  {
    id: "dv-03",
    topic: "Python Basics",
    difficulty: "Medium",
    prompt: "Which Python data type is most appropriate for storing a labelled, two-dimensional table of survey responses?",
    options: ["A list of lists", "A dictionary of tuples", "A Pandas DataFrame", "A NumPy scalar"],
    answer: 2,
  },
  {
    id: "dv-04",
    topic: "Python Basics",
    difficulty: "Medium",
    prompt: "In Python, what will `len(df.columns)` return for a DataFrame `df`?",
    options: ["The number of rows", "The number of columns", "The total number of cells", "The number of missing values"],
    answer: 1,
  },
  // Data Structures (3)
  {
    id: "dv-05",
    topic: "Data Structures",
    difficulty: "Easy",
    prompt: "Which Pandas method returns the first five rows of a DataFrame?",
    options: ["df.top()", "df.first(5)", "df.head()", "df.preview()"],
    answer: 2,
  },
  {
    id: "dv-06",
    topic: "Data Structures",
    difficulty: "Medium",
    prompt: "To summarise total employment by state from a district-level DataFrame, which operation is most appropriate?",
    options: ["df.sort_values('state')", "df.groupby('state').sum()", "df.drop_duplicates('state')", "df.pivot(index='district')"],
    answer: 1,
  },
  {
    id: "dv-07",
    topic: "Data Structures",
    difficulty: "Hard",
    prompt: "Which reshaping operation converts a wide table (one column per year) into a long table (one row per state-year)?",
    options: ["df.pivot()", "df.melt()", "df.transpose()", "df.stack(level=0)"],
    answer: 1,
  },
  // Data Visualization (5)
  {
    id: "dv-08",
    topic: "Data Visualization",
    difficulty: "Medium",
    prompt: "Which of the following is the most appropriate chart to show the distribution of a continuous variable?",
    options: ["Bar chart", "Line chart", "Histogram", "Pie chart"],
    answer: 2,
  },
  {
    id: "dv-09",
    topic: "Data Visualization",
    difficulty: "Easy",
    prompt: "Which chart type is best suited to show how a monthly indicator such as CPI changes over time?",
    options: ["Line chart", "Pie chart", "Scatter plot", "Treemap"],
    answer: 0,
  },
  {
    id: "dv-10",
    topic: "Data Visualization",
    difficulty: "Medium",
    prompt: "A box plot is primarily used to show:",
    options: [
      "The relationship between two categorical variables",
      "The median, quartiles and outliers of a variable",
      "The share of each category in a whole",
      "Geographic variation across states",
    ],
    answer: 1,
  },
  {
    id: "dv-11",
    topic: "Data Visualization",
    difficulty: "Hard",
    prompt: "Why are pie charts generally discouraged for comparing more than a handful of categories?",
    options: [
      "They cannot be coloured",
      "Readers judge angles and areas less accurately than lengths",
      "They cannot show percentages",
      "They only work with time-series data",
    ],
    answer: 1,
  },
  {
    id: "dv-12",
    topic: "Data Visualization",
    difficulty: "Medium",
    prompt: "Which visual encoding should be used for a sequential variable such as literacy rate on a choropleth map?",
    options: [
      "A rainbow palette",
      "A single-hue sequential colour scale",
      "Random categorical colours",
      "A diverging scale centred at zero",
    ],
    answer: 1,
  },
  // Libraries (5)
  {
    id: "dv-13",
    topic: "Libraries (Matplotlib, Seaborn)",
    difficulty: "Easy",
    prompt: "Which Seaborn function draws a histogram with an optional kernel density estimate?",
    options: ["sns.barplot()", "sns.histplot()", "sns.lineplot()", "sns.pairgrid()"],
    answer: 1,
  },
  {
    id: "dv-14",
    topic: "Libraries (Matplotlib, Seaborn)",
    difficulty: "Medium",
    prompt: "In Matplotlib, what does `fig, ax = plt.subplots(2, 2)` create?",
    options: [
      "A single axes with two lines",
      "A figure with a 2x2 grid of axes",
      "Two figures with two axes each",
      "A 3D axes object",
    ],
    answer: 1,
  },
  {
    id: "dv-15",
    topic: "Libraries (Matplotlib, Seaborn)",
    difficulty: "Medium",
    prompt: "Which Seaborn function is designed to compare the distribution of a numeric variable across categories?",
    options: ["sns.boxplot()", "sns.heatmap()", "sns.regplot()", "sns.jointplot()"],
    answer: 0,
  },
  {
    id: "dv-16",
    topic: "Libraries (Matplotlib, Seaborn)",
    difficulty: "Hard",
    prompt: "Which Plotly module provides high-level, one-line functions such as `px.scatter()`?",
    options: ["plotly.graph_objects", "plotly.express", "plotly.figure_factory", "plotly.io"],
    answer: 1,
  },
  {
    id: "dv-17",
    topic: "Libraries (Matplotlib, Seaborn)",
    difficulty: "Easy",
    prompt: "Which Matplotlib call saves the current figure to a file?",
    options: ["plt.export()", "plt.savefig()", "plt.write()", "plt.dump()"],
    answer: 1,
  },
  // Application & Interpretation (3)
  {
    id: "dv-18",
    topic: "Application & Interpretation",
    difficulty: "Medium",
    prompt: "A chart of unemployment rate starts its y-axis at 5% rather than 0%. What is the main risk?",
    options: [
      "The chart cannot be exported",
      "Small changes are visually exaggerated",
      "The x-axis becomes unreadable",
      "The legend will be missing",
    ],
    answer: 1,
  },
  {
    id: "dv-19",
    topic: "Application & Interpretation",
    difficulty: "Hard",
    prompt: "You must show the relationship between household size and monthly expenditure across 40,000 survey records. The clearest choice is:",
    options: [
      "A scatter plot with transparency or a hexbin plot",
      "A pie chart per household size",
      "A stacked bar chart",
      "A radar chart",
    ],
    answer: 0,
  },
  {
    id: "dv-20",
    topic: "Application & Interpretation",
    difficulty: "Medium",
    prompt: "For a statistical release intended for policymakers, which practice best supports accurate interpretation?",
    options: [
      "Using 3D effects for emphasis",
      "Labelling axes with units and stating the data source",
      "Removing gridlines and axis labels",
      "Using as many colours as possible",
    ],
    answer: 1,
  },
];

export const DATA_GOVERNANCE_BANK: Question[] = [
  {
    id: "dg-01",
    topic: "Statistical Confidentiality",
    difficulty: "Easy",
    prompt: "Under the Collection of Statistics Act, 2008, information collected from individual respondents must be:",
    options: [
      "Published with names for transparency",
      "Kept confidential and used only for statistical purposes",
      "Shared with any government department on request",
      "Deleted after tabulation",
    ],
    answer: 1,
  },
  {
    id: "dg-02",
    topic: "Statistical Confidentiality",
    difficulty: "Medium",
    prompt: "Which technique reduces the risk of identifying a respondent in a published table?",
    options: ["Cell suppression", "Adding more columns", "Publishing raw microdata", "Using a bar chart"],
    answer: 0,
  },
  {
    id: "dg-03",
    topic: "Data Quality",
    difficulty: "Easy",
    prompt: "Which of these is NOT a standard data quality dimension?",
    options: ["Accuracy", "Timeliness", "Popularity", "Coherence"],
    answer: 2,
  },
  {
    id: "dg-04",
    topic: "Data Quality",
    difficulty: "Medium",
    prompt: "Metadata describing definitions, classifications and methodology primarily improves which quality dimension?",
    options: ["Interpretability", "Timeliness", "Cost", "Accessibility"],
    answer: 0,
  },
  {
    id: "dg-05",
    topic: "Data Sharing",
    difficulty: "Medium",
    prompt: "The National Data Sharing and Accessibility Policy (NDSAP) primarily aims to:",
    options: [
      "Restrict all government data",
      "Enable proactive sharing of non-sensitive government data",
      "Replace the Census",
      "Set tariffs on data exports",
    ],
    answer: 1,
  },
  {
    id: "dg-06",
    topic: "Data Sharing",
    difficulty: "Hard",
    prompt: "Before sharing administrative data with another ministry, which document should define purpose, security and retention?",
    options: ["A press release", "A data sharing agreement", "A tabulation plan", "A sample design note"],
    answer: 1,
  },
  {
    id: "dg-07",
    topic: "Privacy",
    difficulty: "Medium",
    prompt: "Which of the following is an example of a direct identifier?",
    options: ["Age band", "District", "Aadhaar number", "Occupation code"],
    answer: 2,
  },
  {
    id: "dg-08",
    topic: "Privacy",
    difficulty: "Hard",
    prompt: "k-anonymity ensures that each released record is indistinguishable from at least:",
    options: ["One other record", "k-1 other records", "k squared records", "All records"],
    answer: 1,
  },
  {
    id: "dg-09",
    topic: "Stewardship",
    difficulty: "Easy",
    prompt: "A data steward is primarily responsible for:",
    options: [
      "Writing press releases",
      "Defining and enforcing data standards for a dataset",
      "Approving travel claims",
      "Printing questionnaires",
    ],
    answer: 1,
  },
  {
    id: "dg-10",
    topic: "Stewardship",
    difficulty: "Medium",
    prompt: "Which classification level is most appropriate for unit-level household survey microdata?",
    options: ["Public", "Restricted / confidential", "Open by default", "Marketing"],
    answer: 1,
  },
];

export const ML_BASICS_BANK: Question[] = [
  {
    id: "ml-01",
    topic: "Foundations",
    difficulty: "Easy",
    prompt: "Supervised learning requires training data that includes:",
    options: ["Only input features", "Input features and known target labels", "No data at all", "Only images"],
    answer: 1,
  },
  {
    id: "ml-02",
    topic: "Foundations",
    difficulty: "Easy",
    prompt: "Clustering survey respondents into groups without predefined labels is an example of:",
    options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Regression"],
    answer: 1,
  },
  {
    id: "ml-03",
    topic: "Evaluation",
    difficulty: "Medium",
    prompt: "Which metric is most informative for a classifier when the positive class is rare?",
    options: ["Accuracy", "Precision and recall", "Mean squared error", "R-squared"],
    answer: 1,
  },
  {
    id: "ml-04",
    topic: "Evaluation",
    difficulty: "Medium",
    prompt: "Why is a held-out test set used?",
    options: [
      "To increase training speed",
      "To estimate performance on unseen data",
      "To remove outliers",
      "To label the data",
    ],
    answer: 1,
  },
  {
    id: "ml-05",
    topic: "Evaluation",
    difficulty: "Hard",
    prompt: "A model performs well on training data but poorly on new data. This is called:",
    options: ["Underfitting", "Overfitting", "Regularisation", "Normalisation"],
    answer: 1,
  },
  {
    id: "ml-06",
    topic: "Applications",
    difficulty: "Medium",
    prompt: "Automatically assigning industry codes (NIC) to free-text business descriptions is an example of:",
    options: ["Text classification", "Time-series forecasting", "Image segmentation", "Anomaly detection"],
    answer: 0,
  },
  {
    id: "ml-07",
    topic: "Applications",
    difficulty: "Medium",
    prompt: "Which ML task is most relevant for filling in missing survey responses?",
    options: ["Imputation", "Tokenisation", "Compression", "Encryption"],
    answer: 0,
  },
  {
    id: "ml-08",
    topic: "Responsible Use",
    difficulty: "Hard",
    prompt: "Which practice best supports responsible use of ML in official statistics?",
    options: [
      "Never documenting the model",
      "Documenting methodology and validating against traditional estimates",
      "Replacing all surveys with models",
      "Using the model without human review",
    ],
    answer: 1,
  },
  {
    id: "ml-09",
    topic: "Foundations",
    difficulty: "Easy",
    prompt: "In linear regression the target variable is:",
    options: ["Categorical", "Continuous", "Binary only", "A date"],
    answer: 1,
  },
  {
    id: "ml-10",
    topic: "Responsible Use",
    difficulty: "Medium",
    prompt: "Bias in training data can cause a model to:",
    options: ["Run faster", "Systematically disadvantage certain groups", "Use less memory", "Need fewer features"],
    answer: 1,
  },
];

/** Generic bank used when the Assessment Studio "generates" an assessment. */
export const OFFICIAL_STATS_BANK: Question[] = [
  {
    id: "os-01",
    topic: "Statistical System",
    difficulty: "Easy",
    prompt: "Which office under MoSPI is responsible for conducting large-scale household surveys in India?",
    options: ["National Statistical Office (NSO)", "Election Commission", "NITI Aayog", "RBI"],
    answer: 0,
  },
  {
    id: "os-02",
    topic: "Statistical System",
    difficulty: "Medium",
    prompt: "The Periodic Labour Force Survey (PLFS) primarily measures:",
    options: ["Inflation", "Employment and unemployment", "Industrial output", "Rainfall"],
    answer: 1,
  },
  {
    id: "os-03",
    topic: "Indicators",
    difficulty: "Easy",
    prompt: "GDP measured at constant prices is used to estimate:",
    options: ["Nominal growth", "Real growth", "Population", "Tax revenue"],
    answer: 1,
  },
  {
    id: "os-04",
    topic: "Indicators",
    difficulty: "Medium",
    prompt: "The Consumer Price Index tracks changes in:",
    options: ["Wholesale prices", "Retail prices paid by households", "Export prices", "Interest rates"],
    answer: 1,
  },
  {
    id: "os-05",
    topic: "Survey Methods",
    difficulty: "Medium",
    prompt: "In a stratified sample, the population is first divided into:",
    options: ["Random clusters", "Homogeneous sub-groups (strata)", "Time periods", "Equal-sized blocks"],
    answer: 1,
  },
  {
    id: "os-06",
    topic: "Survey Methods",
    difficulty: "Hard",
    prompt: "Survey weights are applied primarily to:",
    options: [
      "Reduce the file size",
      "Make the sample representative of the population",
      "Remove outliers",
      "Encrypt responses",
    ],
    answer: 1,
  },
  {
    id: "os-07",
    topic: "Survey Methods",
    difficulty: "Medium",
    prompt: "Non-response bias occurs when:",
    options: [
      "Respondents answer too quickly",
      "Those who do not respond differ systematically from those who do",
      "The questionnaire is too short",
      "The sample is too large",
    ],
    answer: 1,
  },
  {
    id: "os-08",
    topic: "Dissemination",
    difficulty: "Easy",
    prompt: "An advance release calendar improves which quality dimension of official statistics?",
    options: ["Timeliness and punctuality", "Accuracy", "Cost", "Sample size"],
    answer: 0,
  },
  {
    id: "os-09",
    topic: "Dissemination",
    difficulty: "Medium",
    prompt: "Which practice supports comparability of statistics across states and over time?",
    options: ["Changing definitions frequently", "Using standard classifications and concepts", "Publishing without metadata", "Rounding to whole numbers"],
    answer: 1,
  },
  {
    id: "os-10",
    topic: "Indicators",
    difficulty: "Hard",
    prompt: "The Index of Industrial Production (IIP) is released with what frequency?",
    options: ["Daily", "Monthly", "Annually", "Once a decade"],
    answer: 1,
  },
];

export const BANKS: Record<string, Question[]> = {
  "data-viz": DATA_VIZ_BANK,
  "data-governance": DATA_GOVERNANCE_BANK,
  "ml-basics": ML_BASICS_BANK,
  "official-stats": OFFICIAL_STATS_BANK,
};
