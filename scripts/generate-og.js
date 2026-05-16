#!/usr/bin/env node
// Re-run to regenerate: node scripts/generate-og.js
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#8FAF6E"/>

  <!-- Subtle texture dots -->
  <circle cx="60" cy="60" r="3" fill="#7a9a5a" opacity="0.4"/>
  <circle cx="180" cy="120" r="2" fill="#7a9a5a" opacity="0.3"/>
  <circle cx="300" cy="50" r="4" fill="#7a9a5a" opacity="0.2"/>
  <circle cx="1100" cy="80" r="3" fill="#7a9a5a" opacity="0.3"/>
  <circle cx="1050" cy="180" r="5" fill="#7a9a5a" opacity="0.2"/>

  <!-- Decorative leaf left -->
  <g transform="translate(80, 250) rotate(-20)">
    <path d="M0 100 C10 50 60 10 100 0 C80 50 40 80 0 100Z" fill="#F5F0E8" opacity="0.15"/>
  </g>
  <!-- Decorative leaf right -->
  <g transform="translate(1050, 400) rotate(30)">
    <path d="M0 80 C10 40 50 8 80 0 C60 40 30 65 0 80Z" fill="#F5F0E8" opacity="0.15"/>
  </g>

  <!-- Salad bowl illustration (right side) -->
  <g transform="translate(820, 120)">
    <!-- Bowl shadow -->
    <ellipse cx="160" cy="370" rx="120" ry="20" fill="#6B4C2A" opacity="0.18"/>
    <!-- Bowl body -->
    <path d="M60 190 Q60 320 160 320 Q260 320 260 190" fill="#8a6640"/>
    <!-- Bowl inner -->
    <path d="M80 200 Q80 300 160 300 Q240 300 240 200" fill="#a07848"/>
    <!-- Bowl highlight -->
    <ellipse cx="160" cy="200" rx="80" ry="15" fill="#b88c5a" opacity="0.5"/>
    <!-- Bowl rim -->
    <ellipse cx="160" cy="190" rx="100" ry="24" fill="#8a6640"/>
    <ellipse cx="160" cy="190" rx="80" ry="18" fill="#9e7a52"/>
    <!-- Greens -->
    <ellipse cx="140" cy="175" rx="50" ry="18" fill="#8FAF6E" opacity="0.9"/>
    <ellipse cx="170" cy="170" rx="40" ry="14" fill="#7a9a5a" opacity="0.8"/>
    <ellipse cx="120" cy="170" rx="35" ry="12" fill="#a8c882" opacity="0.7"/>
    <!-- Cherry tomatoes -->
    <circle cx="150" cy="162" r="10" fill="#e05454" opacity="0.85"/>
    <circle cx="175" cy="158" r="8" fill="#e05454" opacity="0.75"/>
    <!-- Cucumber slice -->
    <ellipse cx="130" cy="163" rx="12" ry="9" fill="#5a8a3a" opacity="0.7"/>
    <ellipse cx="130" cy="163" rx="8" ry="6" fill="#7ab050" opacity="0.5"/>
  </g>

  <!-- Wordmark: Tennessee Toss -->
  <text
    x="120"
    y="250"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="96"
    font-style="italic"
    font-weight="400"
    fill="#F5F0E8"
    opacity="0.97"
  >Tennessee Toss</text>

  <!-- Tagline badge -->
  <rect x="118" y="282" width="370" height="52" rx="26" fill="#6B4C2A" opacity="0.85"/>
  <text
    x="303"
    y="315"
    font-family="Georgia, serif"
    font-size="22"
    fill="#F5F0E8"
    text-anchor="middle"
    letter-spacing="3"
  >CRAFTED FRESH DAILY</text>

  <!-- Location tag -->
  <text
    x="120"
    y="380"
    font-family="Georgia, serif"
    font-size="26"
    fill="#F5F0E8"
    opacity="0.75"
    letter-spacing="1"
  >Lebanon, TN</text>

  <!-- Instagram handle -->
  <text
    x="120"
    y="430"
    font-family="Georgia, serif"
    font-size="20"
    fill="#F5F0E8"
    opacity="0.6"
  >@tennesseetoss</text>
</svg>`;

const outputPath = path.join(__dirname, "../public/og-image.png");

// Ensure public dir exists
if (!fs.existsSync(path.join(__dirname, "../public"))) {
  fs.mkdirSync(path.join(__dirname, "../public"), { recursive: true });
}

sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log(`OG image written to ${outputPath}`);
  })
  .catch((err) => {
    console.error("Failed to generate OG image:", err.message);
    process.exit(1);
  });
