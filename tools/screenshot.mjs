/**
 * Visual smoke test: signs in with a demo account and screenshots every
 * screen at desktop and mobile widths. Also runs a full proctored attempt
 * with a fake camera to exercise the assessment engine end to end.
 *
 *   node tools/screenshot.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.argv[3] ?? "tools/shots";
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ["dashboard", "/dashboard"],
  ["competency", "/competency"],
  ["learning", "/learning"],
  ["course", "/learning/adv-data-viz-python"],
  ["evidence", "/evidence"],
  ["assessments", "/assessments"],
  ["studio", "/assessments/studio"],
  ["preflight", "/assessments/data-viz-assessment"],
  ["progress", "/progress"],
  ["progress-update", "/progress/update"],
  ["help", "/help"],
  ["settings", "/settings"],
];

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});

async function run(viewport, tag) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, permissions: ["camera", "microphone"] });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`${tag}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${tag} console: ${m.text().slice(0, 200)}`));

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT, `${tag}-login.png`), fullPage: true });
  await page.getByRole("button", { name: /Use account data\.analyst/ }).click();
  await page.waitForURL("**/dashboard");
  await page.waitForTimeout(900);

  for (const [name, url] of PAGES) {
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, `${tag}-${name}.png`), fullPage: true });
  }

  // ---- Proctored attempt (desktop only) ----
  if (tag === "desktop") {
    await page.goto(BASE + "/assessments/data-viz-assessment", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Test camera/ }).click();
    await page.waitForTimeout(800);
    await page.getByText(/I confirm I will attempt/).click();
    await page.screenshot({ path: path.join(OUT, `${tag}-preflight-ready.png`), fullPage: true });
    await page.getByRole("button", { name: "Start Assessment" }).click();
    await page.waitForURL("**/attempt");
    await page.screenshot({ path: path.join(OUT, `${tag}-attempt-gate.png`) });
    await page.getByRole("button", { name: /Enter full screen/ }).click();
    await page.waitForTimeout(1200);
    // Answer the first question, flag the second, then go on.
    await page.getByRole("radio").first().click();
    await page.screenshot({ path: path.join(OUT, `${tag}-attempt.png`), fullPage: true });
    await page.getByRole("button", { name: "Next Question" }).click();
    await page.getByRole("button", { name: /Flag for review/ }).click();
    // Simulate a tab switch -> hard violation dialog.
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${tag}-attempt-violation.png`) });
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.getByRole("button", { name: /Return to full screen/ }).click();
    await page.waitForTimeout(300);
    // Answer every question with the first option via the navigator.
    const total = await page.getByRole("button", { name: /^Question \d+/ }).count();
    for (let i = 0; i < total; i++) {
      await page.getByRole("button", { name: new RegExp(`^Question ${i + 1}(,|$)`) }).click();
      await page.getByRole("radio").first().click();
    }
    await page.getByRole("button", { name: "End Assessment" }).click();
    await page.screenshot({ path: path.join(OUT, `${tag}-attempt-confirm.png`) });
    await page.getByRole("button", { name: "Submit now" }).click();
    await page.waitForURL("**/result", { timeout: 15000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, `${tag}-result.png`), fullPage: true });
    await page.goto(BASE + "/progress", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, `${tag}-progress-live.png`), fullPage: true });
    await page.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, `${tag}-dashboard-after.png`), fullPage: true });
  }

  await ctx.close();
  return errors;
}

const errors = [...(await run({ width: 1440, height: 1000 }, "desktop")), ...(await run({ width: 390, height: 844 }, "mobile"))];
await browser.close();
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "No page errors.");
console.log("Screenshots in", OUT);
