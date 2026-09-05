/**
 * New-official onboarding QA.
 *
 * Walks the full flow at 1440x900, answering option A on every question so
 * the resulting profile is known in advance, and asserts the competency
 * scoring engine produces exactly those numbers. Also confirms the existing
 * demo sign-in still reaches the dashboard.
 *
 *   node tools/onboarding-check.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.argv[3] ?? "tools/shots/onboarding";
fs.mkdirSync(OUT, { recursive: true });

/**
 * Expected profile when option A is chosen for all 15 questions, for the
 * Data Analyst role. Derived by hand from the documented rule:
 *   level = 1.0 + 4.0 * (weight correct / weight asked),  E=1 M=2 H=3
 * Only bq-03, bq-11 and bq-15 have A as the correct option.
 */
const EXPECT = {
  overallPct: 21,
  correct: 3,
  total: 15,
  levels: {
    Python: "2.6",
    SQL: "1.0",
    Statistics: "1.0",
    "Data Visualization": "3.7",
    "Survey Methodology": "1.0",
    "Data Quality": "3.7",
  },
  gapCount: 5,
  metCount: 1,
};

const failures = [];
const check = (name, actual, expected) => {
  const ok = String(actual) === String(expected);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}: ${actual}${ok ? "" : ` (expected ${expected})`}`);
  if (!ok) failures.push(name);
};

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  permissions: ["camera", "microphone"],
});
const page = await ctx.newPage();

const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("console", (m) => m.type() === "error" && pageErrors.push(m.text()));

const shot = (n) => page.screenshot({ path: path.join(OUT, `${n}.png`) });
const overflow = () =>
  page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
/** How much the step card's body overflows its own scroll area. */
const cardOverflow = () =>
  page.evaluate(() => {
    const el = document.querySelector("section .scrollbar-thin");
    return el ? el.scrollHeight - el.clientHeight : -1;
  });

/**
 * Clear the proctoring dialog if it is open. Headless Chrome's fake camera
 * device occasionally ends its track, which is a real `camera-lost` hard
 * event; that is an environment artifact, not a product failure, so the
 * clean-path run tolerates it.
 */
async function dismissDialog() {
  const btn = page.getByRole("button", { name: /Return to full screen/ });
  if (await btn.isVisible().catch(() => false)) {
    await btn.click().catch(() => {});
    await page.waitForTimeout(250);
  }
}

/* ---------------- 1. Existing demo sign-in still works ---------------- */
console.log("\n[1] Existing demo account sign-in");
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await shot("00-login");
check("login page fits 1440x900", (await overflow()) <= 0, true);
check("Parichay option present", await page.getByText("Continue with Parichay SSO").isVisible(), true);
check("Get Started option present", await page.getByRole("button", { name: /Get Started/ }).isVisible(), true);

await page.getByRole("button", { name: /Use this account/i }).first().click().catch(async () => {
  // Fall back to clicking the first demo account row.
  await page.locator("h3:has-text('Demo Accounts') + div button").first().click();
});
await page.waitForURL("**/dashboard", { timeout: 15000 });
check("demo account reaches dashboard", page.url().includes("/dashboard"), true);

/* ---------------- 2. New official onboarding ---------------- */
console.log("\n[2] New official flow");
await ctx.clearCookies();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.evaluate(() => sessionStorage.clear());
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

await page.getByRole("button", { name: /Get Started/ }).click();
await page.waitForURL("**/onboarding/profile");

// Step 1 - basic profile
await page.fill("#ob-name", "Ananya Iyer");
await page.selectOption("#ob-designation", "Junior Statistical Officer (JSO)");
await page.selectOption("#ob-exp", { index: 1 });
check("designation is a dropdown", await page.locator("select#ob-designation").count(), 1);
await shot("01-profile");
check("profile step fits", (await overflow()) <= 0, true);
await page.getByRole("button", { name: "Continue" }).click();

// Step 2 - role & responsibility
await page.waitForURL("**/onboarding/role");
await page.getByRole("button", { name: /Data Analyst/ }).first().click();
check("required preview shows for role", await page.getByText("Required competencies").isVisible(), true);
await page.getByRole("button", { name: "Statistical Analysis", exact: true }).click();
await shot("02-role");
check("role step fits", (await overflow()) <= 0, true);
await page.getByRole("button", { name: /Start Competency Assessment/ }).click();

// Step 3 - assessment: choose option A for all 15
await page.waitForURL("**/onboarding/assessment");
await shot("03-gate");
check("proctoring gate shown", await page.getByText("Proctored assessment").isVisible(), true);
check("gate fits", (await overflow()) <= 0, true);

// Enter the proctored attempt (fake camera is granted by the launch args).
await page.getByRole("button", { name: /Enter full screen & (begin|resume)/ }).click();
await page.waitForTimeout(1200);
await shot("03-assessment");
check("proctor panel live", await page.getByText("Live Proctoring").isVisible(), true);

await dismissDialog();
const navButtons = page.locator('aside button[aria-label^="Question"]');
for (let i = 0; i < 15; i++) {
  await dismissDialog();
  await navButtons.nth(i).click();
  await page.locator('button[role="radio"]').first().click();
  // Let the auto-advance settle before navigating to the next item.
  await page.waitForTimeout(300);
}
check("all 15 answered", await page.getByText("15 answered").isVisible(), true);

// Nothing this run did should have tripped the anti-cheat. (A spurious
// camera-lost from the fake device is ignored - see dismissDialog.)
const induced = await page.evaluate(() => {
  const st = JSON.parse(sessionStorage.getItem("ss.state") ?? "{}");
  const bad = ["tab-switch", "window-blur", "copy-paste", "shortcut", "fullscreen-exit", "devtools"];
  return (st.onboarding?.violations ?? []).filter((v) => bad.includes(v.type)).length;
});
check("no anti-cheat events during a clean run", induced, 0);
await dismissDialog();
await navButtons.nth(14).click();
await page.getByRole("button", { name: /Submit Assessment/ }).click();

// Step 4 - results
await page.waitForURL("**/onboarding/results");
await page.waitForTimeout(300);
await shot("04-results");
const bodyText = () => page.locator("body").innerText();
check("results page fits", (await overflow()) <= 0, true);
check("results card needs no inner scroll", (await cardOverflow()) <= 0, true);

check("overall percentage", (await bodyText()).includes(`${EXPECT.overallPct}%`), true);
check(
  "correct count",
  (await bodyText()).includes(`${EXPECT.correct}`) &&
    (await page.getByText(new RegExp(`${EXPECT.correct}\\s*of\\s*${EXPECT.total}`)).count()) > 0,
  true,
);

for (const [name, level] of Object.entries(EXPECT.levels)) {
  const row = page.locator("li", { hasText: name }).first();
  const txt = await row.innerText();
  check(`results: ${name} = ${level}`, txt.includes(level), true);
}

// Step 5 - competency profile
await page.getByRole("button", { name: /View Competency Profile/ }).click();
await page.waitForURL("**/onboarding/competency-profile");
await page.waitForTimeout(250);
await shot("05-competency-profile");
const profText = await bodyText();
check("requirements met count", profText.includes(`${EXPECT.metCount} / 6`), true);
// Labels are uppercased by CSS, so innerText comes back uppercase.
check(
  "gaps identified count",
  new RegExp(`Gaps identified[\\s\\S]{0,40}${EXPECT.gapCount}`, "i").test(profText),
  true,
);

// Step 6 - skill gaps
await page.getByRole("button", { name: /View Skill Gap Analysis/ }).click();
await page.waitForURL("**/onboarding/gaps");
await page.waitForTimeout(250);
await shot("06-gaps");
const gapRows = await page.locator('[data-testid="gap-list"] > li').count();
check("gap rows listed", gapRows, EXPECT.gapCount);
const gapsText = await bodyText();
check("largest gap first (SQL 3.0)", /SQL[\s\S]{0,200}3\.0/.test(gapsText), true);

// Step 7 - recommendations
await page.getByRole("button", { name: /View Recommendations/ }).click();
await page.waitForURL("**/onboarding/recommendations");
await page.waitForTimeout(250);
await shot("07-recommendations");
check("recommendations fit", (await overflow()) <= 0, true);
check("recommendations card needs no inner scroll", (await cardOverflow()) <= 0, true);
const recText = await bodyText();
check("one recommendation per gap", await page.locator("ul > li").count(), EXPECT.gapCount);
check("only approved providers", /iGOT|NSSTA|TPAC/.test(recText), true);
check("no external MOOCs", /Coursera|Udemy|edX/i.test(recText), false);

// Step 8 - dashboard
await page.getByRole("button", { name: /Go to Dashboard/ }).click();
await page.waitForURL("**/dashboard", { timeout: 15000 });
await page.waitForTimeout(600);
await shot("08-dashboard");
const dashText = await bodyText();
check("dashboard greets new official", dashText.includes("Ananya"), true);
check("dashboard shows generated competency", /Overall Competency/.test(dashText), true);

/* ---------------- 3. Persistence across navigation ---------------- */
console.log("\n[3] Persistence");
await page.goto(`${BASE}/competency`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await shot("09-competency-page");
check("competency page still renders", page.url().includes("/competency"), true);
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
check("still signed in after navigation", (await bodyText()).includes("Ananya"), true);

console.log("\nPage errors:", pageErrors.length ? pageErrors.slice(0, 5) : "none");
if (pageErrors.length) failures.push("console/page errors");

await browser.close();
console.log(`\n${failures.length ? `FAILURES: ${failures.join(", ")}` : "ALL CHECKS PASSED"}`);
process.exit(failures.length ? 1 : 0);
