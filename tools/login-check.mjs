/**
 * Login fit check: at common laptop viewports, confirm the login page needs
 * no page scroll and the sign-in card needs no inner scroll, and save a
 * viewport screenshot of each.
 *
 *   node tools/login-check.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.argv[3] ?? "tools/shots/login";
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  [1920, 892],
  [1536, 730],
  [1440, 900],
  [1366, 768],
  [1280, 720],
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
let ok = true;
for (const [w, h] of VIEWPORTS) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const card = document.querySelector("section:last-of-type .shadow-pop");
    return {
      pageScroll: document.documentElement.scrollHeight - window.innerHeight,
      cardScroll: card ? card.scrollHeight - card.clientHeight : -1,
    };
  });
  const pass = m.pageScroll <= 0 && m.cardScroll <= 0;
  ok &&= pass;
  console.log(`${w}x${h}: page overflow ${m.pageScroll}px, card overflow ${m.cardScroll}px -> ${pass ? "OK" : "SCROLLS"}`);
  await page.screenshot({ path: path.join(OUT, `${w}x${h}.png`) });
  await page.context().close();
}
await browser.close();
process.exit(ok ? 0 : 1);
