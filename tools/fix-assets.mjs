import sharp from "sharp";
const UI = "D:/SIH 26/UI/";
const OUT = "D:/SankhyaSetu/public/images/";

// 1) Header building: crop from the dashboard mockup (quote sits further left there)
await sharp(UI + "ChatGPT Image Sep 5, 2026, 06_30_28 AM.png")
  .extract({ left: 1236, top: 76, width: 300, height: 140 })
  .png()
  .toFile(OUT + "header-building.png");

// 2) Login hero: feather-blur the baked quote card so a live card can sit over it
const hero = OUT + "login-hero.jpg";
const region = { left: 24, top: 205, width: 262, height: 138 };
const patchRGB = await sharp(hero).extract(region).blur(16).removeAlpha().raw().toBuffer();
const maskSvg = `<svg width="${region.width}" height="${region.height}"><rect x="14" y="14" width="${region.width - 28}" height="${region.height - 28}" rx="22" fill="white"/></svg>`;
const mask = await sharp(Buffer.from(maskSvg)).blur(7).toColourspace("b-w").raw().toBuffer();
const patch = await sharp(patchRGB, { raw: { width: region.width, height: region.height, channels: 3 } })
  .joinChannel(mask, { raw: { width: region.width, height: region.height, channels: 1 } })
  .png().toBuffer();
const base = await sharp(hero).toBuffer();
await sharp(base).composite([{ input: patch, left: region.left, top: region.top }]).jpeg({ quality: 90, mozjpeg: true }).toFile(OUT + "login-hero-clean.jpg");
console.log("done");
