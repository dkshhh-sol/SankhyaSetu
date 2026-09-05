/**
 * Onboarding proctoring QA.
 *
 * Drives the baseline assessment and deliberately trips the integrity rules,
 * asserting that violations are recorded, that the hard-event budget
 * auto-submits, that the result is marked invalid, and — most importantly —
 * that an invalid baseline never writes a competency level.
 *
 *   node tools/onboarding-integrity-check.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.argv[3] ?? "tools/shots/onboarding";
fs.mkdirSync(OUT, { recursive: true });

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
  permissions: ["camera", "microphone"],
});
const page = await ctx.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

/** Simulate the tab being hidden and shown again (a hard violation each time). */
async function fakeTabSwitch() {
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(250);
}

/** Read the persisted onboarding slice out of sessionStorage. */
const readState = () =>
  page.evaluate(() => {
    try {
      return JSON.parse(sessionStorage.getItem("ss.state") ?? "{}");
    } catch {
      return {};
    }
  });

const hardCountNow = async () =>
  ((await readState()).onboarding?.violations ?? []).filter((v) => v.severity === "hard").length;

/**
 * Clear the blocking dialog if one is open. The fake camera device in
 * headless Chrome occasionally ends its track, which is a genuine
 * `camera-lost` hard event — so the test must tolerate extra events rather
 * than assume an exact count.
 */
async function dismissDialog() {
  const btn = page.getByRole("button", { name: /Return to full screen/ });
  if (await btn.isVisible().catch(() => false)) {
    await btn.click().catch(() => {});
    await page.waitForTimeout(300);
  }
}

/* ---------------- Reach the assessment ---------------- */
console.log("\n[1] Reach the proctored assessment");
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.evaluate(() => sessionStorage.clear());
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Get Started/ }).click();
await page.waitForURL("**/onboarding/profile");
await page.fill("#ob-name", "Integrity Tester");
await page.getByRole("button", { name: "Continue" }).click();
await page.waitForURL("**/onboarding/role");
await page.getByRole("button", { name: /Data Analyst/ }).first().click();
await page.getByRole("button", { name: "Statistical Analysis", exact: true }).click();
await page.getByRole("button", { name: /Start Competency Assessment/ }).click();
await page.waitForURL("**/onboarding/assessment");
await page.getByRole("button", { name: /Enter full screen & (begin|resume)/ }).click();
await page.waitForTimeout(1200);
check("attempt running", await page.getByText("Live Proctoring").isVisible(), true);

await dismissDialog();

// Answer a few so there is something to score.
const navButtons = page.locator('aside button[aria-label^="Question"]');
for (let i = 0; i < 3; i++) {
  await dismissDialog();
  await navButtons.nth(i).click();
  await page.locator('button[role="radio"]').first().click();
  await page.waitForTimeout(250);
}

/* ---------------- Soft violation ---------------- */
console.log("\n[2] Soft violation (copy) is recorded, not blocking");
await dismissDialog();
await page.evaluate(() => document.dispatchEvent(new ClipboardEvent("copy", { bubbles: true })));
await page.waitForTimeout(400);
let st = await readState();
check(
  "copy recorded as soft violation",
  (st.onboarding?.violations ?? []).some((v) => v.type === "copy-paste" && v.severity === "soft"),
  true,
);
check("still on the assessment", page.url().includes("/onboarding/assessment"), true);

/* ---------------- Hard violations ---------------- */
console.log("\n[3] Hard violations trip the budget and auto-submit");
const before = await hardCountNow();
await fakeTabSwitch();
check("tab switch adds a hard violation", (await hardCountNow()) > before, true);
await shotSafe("10-integrity-warning");
check(
  "blocking dialog shown",
  await page.getByText("Integrity event recorded").isVisible().catch(() => false),
  true,
);

// Keep tripping the budget until the engine auto-submits.
for (let i = 0; i < 6 && page.url().includes("/onboarding/assessment"); i++) {
  await dismissDialog();
  await fakeTabSwitch();
  await page.waitForTimeout(600);
}

await page.waitForURL("**/onboarding/results", { timeout: 25000 });
await page.waitForTimeout(500);
await shotSafe("11-invalidated");

/* ---------------- Outcome ---------------- */
console.log("\n[4] Invalid baseline is not recorded");
const body = await page.locator("body").innerText();
check("results marked invalidated", body.includes("Assessment Invalidated"), true);
check("retake offered", await page.getByRole("button", { name: /Retake Assessment/ }).isVisible(), true);
check("no 'View Competency Profile' path", await page.getByRole("button", { name: /View Competency Profile/ }).count(), 0);

st = await readState();
check("result integrity is invalid", st.onboarding?.result?.integrity, "invalid");
check("auto-submitted for integrity", st.onboarding?.result?.autoSubmitted, "integrity");
check("NO competency levels written", Object.keys(st.skillLevels ?? {}).length, 0);

/* ---------------- Retake clears the attempt ---------------- */
console.log("\n[5] Retake starts clean");
await page.getByRole("button", { name: /Retake Assessment/ }).click();
await page.waitForURL("**/onboarding/assessment", { timeout: 15000 });
await page.waitForTimeout(500);
st = await readState();
check("answers cleared", Object.keys(st.onboarding?.answers ?? {}).length, 0);
check("violations cleared", (st.onboarding?.violations ?? []).length, 0);
check("result cleared", st.onboarding?.result ?? null, "null");
check("profile and role kept", Boolean(st.onboarding?.profile && st.onboarding?.roleId), true);

console.log("\nPage errors:", pageErrors.length ? pageErrors.slice(0, 5) : "none");
if (pageErrors.length) failures.push("page errors");

await browser.close();
console.log(`\n${failures.length ? `FAILURES: ${failures.join(", ")}` : "ALL CHECKS PASSED"}`);
process.exit(failures.length ? 1 : 0);

async function shotSafe(name) {
  try {
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  } catch {
    /* a blocking dialog can race the screenshot; not a failure */
  }
}
