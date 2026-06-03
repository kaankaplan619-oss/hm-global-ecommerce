#!/usr/bin/env node
/**
 * scripts/crop-printify-mockups.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Crop automatique des mockups Printify : retire la marge blanche autour
 * du textile pour donner plus de présence visuelle dans les cards.
 *
 * Diagnostic : les JPG Printify originaux ont 17-31 % de marge blanche
 * (le produit n'occupe que 69-83 % de la zone). Aucun scale CSS ne peut
 * compenser sans risque de couper. La solution propre est de cropper
 * les JPG à la source et de servir les versions cropped.
 *
 * Pipeline :
 *   1. Scan /public/mockups/printify/{slug}/*.jpg
 *   2. Détecte la bounding box du produit (pixels non-blancs, seuil 245)
 *   3. Ajoute une marge sécurité (3 % de la taille du produit) — évite
 *      de couper manches/capuches/cols/bas
 *   4. Recadre en carré centré (garde le ratio 1:1 attendu par les cards)
 *   5. Sauvegarde dans /public/mockups/printify-cropped/{slug}/{color}-{view}.jpg
 *      JAMAIS dans /public/mockups/printify/ — originaux préservés
 *   6. Génère /public/mockups/printify-cropped/manifest.json
 *
 * Sécurité :
 *   - Aucun fichier original touché
 *   - Marge sécurité 3 % évite tout crop agressif
 *   - Fallback automatique si la détection échoue : copie intacte
 *
 * Usage :
 *   node scripts/crop-printify-mockups.mjs
 *   node scripts/crop-printify-mockups.mjs --slug gildan-18500
 *   node scripts/crop-printify-mockups.mjs --margin 5
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const cwd = process.cwd();
const args = process.argv.slice(2);
const ONLY = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
const MARGIN_PCT = args.includes("--margin")
  ? Number(args[args.indexOf("--margin") + 1])
  : 3; // 3 % marge sécurité par défaut

// Seuil "blanc" — pixel considéré comme fond si R/G/B >= 245
const WHITE_THRESHOLD = 245;

const V1_PRODUCTS = [
  "gildan-5000",
  "bella-3001",
  "comfort-colors-1717",
  "gildan-18000",
  "gildan-18500",
];

const KEEP_VIEWS = ["front", "back", "back-2", "folded", "front-collar-closeup"];

const INPUT_ROOT  = path.join(cwd, "public", "mockups", "printify");
const OUTPUT_ROOT = path.join(cwd, "public", "mockups", "printify-cropped");

// ─── Détection bounding box via sharp.raw + analyse pixels ──────────────────

async function detectProductBBox(imgPath) {
  const { data, info } = await sharp(imgPath)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let top = height, bot = 0, left = width, right = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r < WHITE_THRESHOLD || g < WHITE_THRESHOLD || b < WHITE_THRESHOLD) {
        if (y < top) top = y;
        if (y > bot) bot = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  if (top >= bot || left >= right) {
    // Image entièrement blanche — pas de crop possible
    return null;
  }

  return { top, bot, left, right, width, height };
}

// ─── Crop avec marge sécurité + recadrage carré centré ──────────────────────

function computeCropBox(bbox, marginPct) {
  const { top, bot, left, right, width, height } = bbox;
  const contentW = right - left;
  const contentH = bot - top;

  // Marge en pixels : pourcentage de la dimension la plus grande du produit
  const baseSize = Math.max(contentW, contentH);
  const margin = Math.round((baseSize * marginPct) / 100);

  // Bbox avec marge appliquée
  let cropTop    = Math.max(0, top - margin);
  let cropBot    = Math.min(height, bot + margin);
  let cropLeft   = Math.max(0, left - margin);
  let cropRight  = Math.min(width, right + margin);

  let cropW = cropRight - cropLeft;
  let cropH = cropBot - cropTop;

  // Recadrage en carré centré : on prend la dimension max pour ne pas couper
  const square = Math.max(cropW, cropH);

  // Centre horizontal du produit (avec marge)
  const cx = (cropLeft + cropRight) / 2;
  const cy = (cropTop + cropBot) / 2;

  let newLeft = Math.round(cx - square / 2);
  let newTop  = Math.round(cy - square / 2);

  // Clamping aux bords du canvas original
  newLeft = Math.max(0, Math.min(newLeft, width - square));
  newTop  = Math.max(0, Math.min(newTop, height - square));

  const sqClamped = Math.min(square, Math.min(width - newLeft, height - newTop));

  return {
    left:   newLeft,
    top:    newTop,
    width:  sqClamped,
    height: sqClamped,
  };
}

// ─── Crop un fichier + sauvegarde ───────────────────────────────────────────

async function cropOne(inputPath, outputPath) {
  const bbox = await detectProductBBox(inputPath);
  if (!bbox) {
    // Image entièrement blanche : copie directe
    await fs.copyFile(inputPath, outputPath);
    return { fallback: "all-white", crop: null };
  }

  const cropBox = computeCropBox(bbox, MARGIN_PCT);

  // Sortie : on garde le côté carré + on resize à 1200x1200 pour homogénéité
  await sharp(inputPath)
    .extract(cropBox)
    .resize(1200, 1200, { fit: "contain", background: "#ffffff" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath);

  const before = `${bbox.right - bbox.left}x${bbox.bot - bbox.top}`;
  const after  = `${cropBox.width}x${cropBox.height}`;
  return { before, after, crop: cropBox };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  Crop Printify Mockups V1 — retire les marges blanches      ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`  Marge sécurité : ${MARGIN_PCT} %`);
  console.log(`  Seuil blanc    : ${WHITE_THRESHOLD}/255\n`);

  const slugs = ONLY ? [ONLY] : V1_PRODUCTS;
  if (ONLY && !V1_PRODUCTS.includes(ONLY)) {
    console.error(`❌ Slug "${ONLY}" pas dans V1.`);
    process.exit(1);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    marginPct:   MARGIN_PCT,
    whiteThreshold: WHITE_THRESHOLD,
    products: {},
  };

  for (const slug of slugs) {
    const inDir  = path.join(INPUT_ROOT, slug);
    const outDir = path.join(OUTPUT_ROOT, slug);
    await fs.mkdir(outDir, { recursive: true });

    let files;
    try {
      files = await fs.readdir(inDir);
    } catch {
      console.log(`  ⚠️  ${slug} : pas de dossier source`);
      continue;
    }

    const jpgs = files.filter((f) => /\.jpg$/i.test(f));
    if (jpgs.length === 0) {
      console.log(`  ⚠️  ${slug} : aucun JPG`);
      continue;
    }

    console.log(`\n─── ${slug} (${jpgs.length} fichiers) ───`);
    manifest.products[slug] = { mockups: {} };

    for (const file of jpgs) {
      // Parse nom : {color}-{view}.jpg
      const m = file.match(/^([a-z0-9-]+)-(front|back|back-2|folded|front-collar-closeup)\.jpg$/i);
      if (!m) continue;
      const color = m[1];
      const view  = m[2];
      if (!KEEP_VIEWS.includes(view)) continue;

      const inputPath  = path.join(inDir, file);
      const outputPath = path.join(outDir, file);
      try {
        const r = await cropOne(inputPath, outputPath);
        if (r.fallback) {
          console.log(`  ⚠️  ${file} : ${r.fallback} → copie intacte`);
        } else {
          console.log(`  ✅ ${file.padEnd(40)} crop ${r.crop.width}×${r.crop.height} (produit ${r.before})`);
        }
        manifest.products[slug].mockups[color] ??= {};
        manifest.products[slug].mockups[color][view] = `/mockups/printify-cropped/${slug}/${file}`;
      } catch (err) {
        console.error(`  ❌ ${file} : ${err.message}`);
      }
    }
  }

  // Manifest cropped
  const manifestPath = path.join(OUTPUT_ROOT, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Manifest cropped : ${manifestPath}`);
  console.log("\nNouveau pipeline image :");
  console.log("  1. /mockups/printify-cropped/{slug}/{color}-{view}.jpg  ← prioritaire");
  console.log("  2. /mockups/printify/{slug}/{color}-{view}.jpg          ← fallback");
}

main().catch((err) => {
  console.error("\n❌ Erreur fatale :", err.message);
  console.error(err.stack);
  process.exit(1);
});
