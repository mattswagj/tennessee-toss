/**
 * Generate the Tennessee Toss favicon set from the simplified salad-bowl mark.
 *
 * Source of truth: the SVG below mirrors src/components/brand/SaladBowlIconSimple.tsx
 * (bold, low-detail so it stays legible at 16x16). Keep the two in sync.
 *
 * Run:  node scripts/generate-favicon.js
 * Output (all in public/):
 *   favicon.ico (16/32/48 packed), favicon-16x16.png, favicon-32x32.png,
 *   favicon-48x48.png, apple-touch-icon.png (180), icon-192.png, icon-512.png,
 *   safari-pinned-tab.svg (monochrome, brand brown)
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const toIco = require("to-ico");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const ICONS_DIR = path.join(PUBLIC_DIR, "icons");
const BRAND_BROWN = "#6B4C2A";

// Full-color simplified salad bowl (mirrors SaladBowlIconSimple.tsx).
const COLOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <path d="M14 56 Q14 102 60 102 Q106 102 106 56 Z" fill="#6B4C2A"/>
  <ellipse cx="60" cy="56" rx="46" ry="13" fill="#8a6640"/>
  <ellipse cx="38" cy="42" rx="21" ry="15" fill="#8FAF6E" transform="rotate(-20 38 42)"/>
  <ellipse cx="62" cy="34" rx="23" ry="15" fill="#a3c47e"/>
  <ellipse cx="84" cy="44" rx="19" ry="14" fill="#6fa050" transform="rotate(22 84 44)"/>
  <circle cx="56" cy="48" r="11" fill="#e05454"/>
</svg>`;

// Monochrome silhouette for Safari pinned tabs (single brand-brown layer).
const MASK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <path d="M14 56 Q14 102 60 102 Q106 102 106 56 Z" fill="${BRAND_BROWN}"/>
  <path d="M16 50 Q24 28 42 32 Q52 20 70 28 Q92 26 96 48 Z" fill="${BRAND_BROWN}"/>
</svg>`;

const PNG_TARGETS = [
  { file: path.join(PUBLIC_DIR, "favicon-16x16.png"), size: 16 },
  { file: path.join(PUBLIC_DIR, "favicon-32x32.png"), size: 32 },
  { file: path.join(PUBLIC_DIR, "favicon-48x48.png"), size: 48 },
  { file: path.join(PUBLIC_DIR, "apple-touch-icon.png"), size: 180 },
  { file: path.join(ICONS_DIR, "apple-touch-icon.png"), size: 180 },
  { file: path.join(PUBLIC_DIR, "icon-192.png"), size: 192 },
  { file: path.join(PUBLIC_DIR, "icon-512.png"), size: 512 },
  { file: path.join(ICONS_DIR, "icon-192.png"), size: 192 },
  { file: path.join(ICONS_DIR, "icon-512.png"), size: 512 },
];

async function renderPng(size) {
  return sharp(Buffer.from(COLOR_SVG))
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.mkdirSync(ICONS_DIR, { recursive: true });

  // PNGs
  for (const { file, size } of PNG_TARGETS) {
    const buf = await renderPng(size);
    fs.writeFileSync(file, buf);
    console.log(`✓ ${path.relative(PUBLIC_DIR, file)} (${size}x${size})`);
  }

  // Multi-resolution favicon.ico (16/32/48)
  const icoBuffers = await Promise.all([16, 32, 48].map(renderPng));
  const ico = await toIco(icoBuffers);
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.ico"), ico);
  console.log("✓ favicon.ico (16/32/48 packed)");

  // Safari pinned tab (monochrome SVG)
  fs.writeFileSync(path.join(PUBLIC_DIR, "safari-pinned-tab.svg"), MASK_SVG.trim() + "\n");
  console.log("✓ safari-pinned-tab.svg");

  console.log("\nFavicon set generated in public/.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
