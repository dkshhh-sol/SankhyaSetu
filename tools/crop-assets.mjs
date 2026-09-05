import sharp from "sharp";
import path from "node:path";

const UI = "D:/SIH 26/UI/";
const OUT = "D:/SankhyaSetu/public/images/";
const src = {
  login: UI + "ChatGPT Image Sep 5, 2026, 06_12_35 AM.png",
  dashboard: UI + "ChatGPT Image Sep 5, 2026, 06_30_28 AM.png",
  competency: UI + "ChatGPT Image Sep 5, 2026, 06_30_46 AM.png",
  learning: UI + "ChatGPT Image Sep 5, 2026, 06_31_04 AM.png",
  course: UI + "ChatGPT Image Sep 5, 2026, 06_31_14 AM.png",
  attempt: UI + "ChatGPT Image Sep 5, 2026, 06_31_25 AM.png",
};

async function crop(file, { left, top, width, height }, out, opts = {}) {
  let img = sharp(file).extract({ left, top, width, height });
  if (opts.scale) img = img.resize(Math.round(width * opts.scale), Math.round(height * opts.scale), { kernel: "lanczos3" });
  if (out.endsWith(".jpg")) img = img.jpeg({ quality: 90, mozjpeg: true });
  else img = img.png();
  await img.toFile(OUT + out);
  console.log("wrote", out);
}

// Login hero: building + sky + baked "PEOPLE DATA PROGRESS" label (left panel bottom)
await crop(src.login, { left: 0, top: 645, width: 827, height: 379 }, "login-hero.jpg");
// Page-header building (fades to white on the left). Take from competency page (cleanest).
await crop(src.competency, { left: 1196, top: 76, width: 340, height: 142 }, "header-building.png");
// Course thumbnails (Learning Path recommended cards)
await crop(src.learning, { left: 258, top: 502, width: 188, height: 74 }, "course-python-viz.jpg");
await crop(src.learning, { left: 490, top: 502, width: 188, height: 74 }, "course-governance.jpg");
await crop(src.learning, { left: 722, top: 502, width: 188, height: 74 }, "course-ml.jpg");
await crop(src.learning, { left: 962, top: 502, width: 208, height: 74 }, "course-report.jpg");
// Catalogue thumbnails
await crop(src.learning, { left: 255, top: 964, width: 202, height: 50 }, "course-intro-stats.jpg");
await crop(src.learning, { left: 491, top: 964, width: 202, height: 50 }, "course-excel.jpg");
await crop(src.learning, { left: 727, top: 964, width: 202, height: 50 }, "course-data-quality.jpg");
await crop(src.learning, { left: 962, top: 964, width: 204, height: 50 }, "course-comm-policy.jpg");
// Course detail hero (python)
await crop(src.course, { left: 824, top: 164, width: 220, height: 160 }, "course-python-large.png");
// Proctoring fallback still (used only when the webcam is unavailable)
await crop(src.attempt, { left: 1056, top: 379, width: 242, height: 190 }, "proctor-fallback.jpg");

// India map silhouette: key out the pale sidebar background -> single-colour alpha PNG
{
  const region = { left: 22, top: 632, width: 196, height: 226 };
  const { data, info } = await sharp(src.competency).extract(region).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  // bg ≈ #f5f8fc (lum ~247), map ≈ #d9e5f5 (lum ~226)
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let a = (247 - lum) / (247 - 226);
    a = Math.max(0, Math.min(1, a));
    out[i * 4] = 0x1d; out[i * 4 + 1] = 0x5f; out[i * 4 + 2] = 0xc4; // brand-600, tinted via CSS opacity
    out[i * 4 + 3] = Math.round(a * 255);
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(OUT + "india-map.png");
  console.log("wrote india-map.png");
}
