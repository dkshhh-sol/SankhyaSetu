/**
 * Above-the-fold density check: signs in and captures the FIRST VIEWPORT of
 * key screens at the requested desktop/tablet/mobile sizes (no full-page
 * stitching), so what you see is what a user sees before scrolling.
 *
 *   node tools/viewports.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.argv[3] ?? "tools/shots/viewports";
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  [1440, 900],
  [1366, 768],
  [1280, 800],
  [1024, 768],
  [390, 844],
];
const PAGES = [
  ["dashboard", "/dashboard"],
  ["competency", "/competency"],
  ["learning", "/learning"],
  ["evidence", "/evidence"],
  ["assessments", "/assessments"],
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Use account data\.analyst/ }).click();
  await page.waitForURL("**/dashboard");
  for (const [name, url] of PAGES) {
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, `${w}x${h}-${name}.png`) });
  }
  await ctx.close();
}
await browser.close();
console.log("Viewport shots in", OUT);
