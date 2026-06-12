/**
 * gen-bat-home-image.ts — Image BAT de la section accueil (HomeProcessBAT).
 *
 * Montage 100 % programmatique (zéro IA), reproductible :
 *   1. Aperçu produit : mockup Gildan 5000 noir + symbole HM placé AU CŒUR
 *      (mêmes fractions que la zone studio tshirts de lib/textile-zones.ts).
 *   2. BAT officiel généré VIERGE par lib/bat-pdf.ts (template exact de
 *      l'agence), rasterisé en haute résolution via qlmanage (macOS).
 *   3. Remplissage façon « document signé à la main » : valeurs en
 *      Bradley Hand encre bleue, « Bon pour accord » en Snell Roundhand,
 *      paraphe = symbole HM. (Retour Kaan 2026-06-12 : les valeurs tapées
 *      en Helvetica faisaient « bof ».)
 *   4. Feuille inclinée + ombre portée, posée sur le fond atelier flouté.
 *
 * Usage : npx tsx scripts/gen-bat-home-image.ts
 * Sortie : public/images/home/hm-bat-validation-v4.jpg (2240×1680)
 * ⚠️ Polices Bradley Hand / Snell Roundhand = macOS uniquement (génération
 *    locale, jamais exécuté sur Vercel).
 */

import { execFileSync } from "child_process";
import { writeFile, rm } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { generateBatPdf } from "../lib/bat-pdf";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/images/home/hm-bat-validation-v4.jpg");

// Encre « stylo bleu »
const INK = "#1f3d8c";

// Valeurs d'exemple affichées sur le BAT (cohérentes avec la légende du site)
const FILL = {
  client: "Votre entreprise",
  projet: "25 t-shirts équipe",
  support: "Gildan 5000 · noir",
  format: "logo cœur · 9 cm",
  date: "12/06/2026",
};

// ── 1. Aperçu t-shirt : symbole HM au cœur ────────────────────────────────────
async function buildTeeVisual(): Promise<Buffer> {
  const MOCKUP = 1000; // noir-front.png est en 1000×1000
  // Zone cœur studio tshirts (lib/textile-zones.ts) : [x, y, w, h] en fractions
  const ZONE = { x: 0.55, y: 0.27, w: 0.13, h: 0.13 };
  const box = {
    x: Math.round(ZONE.x * MOCKUP),
    y: Math.round(ZONE.y * MOCKUP),
    w: Math.round(ZONE.w * MOCKUP),
    h: Math.round(ZONE.h * MOCKUP),
  };

  const symbol = await sharp(path.join(ROOT, "public/logo/hm-global-symbol.png"))
    .resize(box.w, box.h, { fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(symbol).metadata();

  return sharp(path.join(ROOT, "public/mockups/gildan-5000/noir-front.png"))
    .composite([
      {
        input: symbol,
        left: box.x + Math.round((box.w - (meta.width ?? box.w)) / 2),
        top: box.y + Math.round((box.h - (meta.height ?? box.h)) / 2),
      },
    ])
    .png()
    .toBuffer();
}

// ── 2+3. BAT vierge rasterisé puis rempli « à la main » ──────────────────────
async function buildFilledSheet(teePng: Buffer): Promise<Buffer> {
  // BAT vierge : labels seuls, valeurs vides — on remplit nous-mêmes après
  const pdfBytes = await generateBatPdf([
    {
      clientName: "",
      projet: "",
      support: "",
      formatDimensions: "",
      dateStr: "",
      visuals: [{ bytes: new Uint8Array(teePng) }],
    },
  ]);

  const tmpPdf = "/tmp/hm-bat-home.pdf";
  await writeFile(tmpPdf, pdfBytes);
  await rm(`${tmpPdf}.png`, { force: true });
  execFileSync("qlmanage", ["-t", "-s", "2400", "-o", "/tmp", tmpPdf], { stdio: "ignore" });
  const sheet = sharp(`${tmpPdf}.png`);
  const { width: W = 1696, height: H = 2400 } = await sheet.metadata();

  // Échelle points PDF → pixels raster (A4 : 595.28 × 841.89 pt)
  const S = H / 841.89;

  // Largeurs Helvetica pour caler les valeurs juste après les labels
  const measure = await PDFDocument.create();
  const helv = await measure.embedFont(StandardFonts.Helvetica);
  const w = (text: string, size: number) => helv.widthOfTextAtSize(text, size);

  // Positions des labels dans lib/bat-pdf.ts (topY = baseline depuis le haut)
  const fields = [
    { label: "Projet :", topY: 138, value: FILL.projet },
    { label: "Support :", topY: 172, value: FILL.support },
    { label: "Format / dimensions :", topY: 206, value: FILL.format },
    { label: "Date :", topY: 240, value: FILL.date },
  ];

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const texts: string[] = [];
  // En-tête : « Client : » (x 112, baseline 47, taille 17 — cf lib/bat-pdf.ts)
  texts.push(
    `<text x="${(112 + w("Client : ", 17) + 4) * S}" y="${47 * S}" font-family="Bradley Hand" font-weight="bold" font-size="${19 * S}" fill="${INK}">${esc(FILL.client)}</text>`,
  );
  // Bloc BON À TIRER (labels x 23, taille 15)
  for (const f of fields) {
    texts.push(
      `<text x="${(23 + w(f.label, 15) + 7) * S}" y="${f.topY * S}" font-family="Bradley Hand" font-weight="bold" font-size="${17 * S}" fill="${INK}">${esc(f.value)}</text>`,
    );
  }
  // Encadré VALIDATION (labels x 298, taille 10)
  texts.push(
    `<text x="${(298 + w("Nom / Société :", 10) + 5) * S}" y="${622 * S}" font-family="Bradley Hand" font-weight="bold" font-size="${11.5 * S}" fill="${INK}">${esc(FILL.client)}</text>`,
    `<text x="${(298 + w("Date :", 10) + 5) * S}" y="${637 * S}" font-family="Bradley Hand" font-weight="bold" font-size="${11.5 * S}" fill="${INK}">${esc(FILL.date)}</text>`,
    // Signature manuscrite sous la mention « Bon pour accord » — décalée à
    // gauche pour ne pas se perdre dans les ondes décoratives du bas droit
    `<text x="${300 * S}" y="${682 * S}" font-family="Snell Roundhand" font-weight="bold" font-size="${28 * S}" fill="${INK}">Bon pour accord</text>`,
  );

  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${texts.join("")}</svg>`,
  );

  return sharp(`${tmpPdf}.png`)
    .composite([{ input: overlay }])
    .png()
    .toBuffer();
}

// ── 4. Montage final : feuille inclinée + ombre sur fond atelier ─────────────
async function buildScene(sheetPng: Buffer): Promise<void> {
  const CANVAS = { w: 2240, h: 1680 };
  const TILT = 2.4;

  const sheetH = 1480;
  const sheet = await sharp(sheetPng)
    .resize({ height: sheetH })
    .rotate(TILT, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const sMeta = await sharp(sheet).metadata();
  const sw = sMeta.width ?? 0;
  const sh = sMeta.height ?? 0;

  // Ombre portée : silhouette noire floutée de la feuille
  const shadow = await sharp(sheet)
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from([20, 16, 24, 200]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: "in",
      },
    ])
    .blur(16)
    .png()
    .toBuffer();

  const background = await sharp(path.join(ROOT, "public/images/home/hm-hero-atelier-v2.jpg"))
    .resize(CANVAS.w, CANVAS.h, { fit: "cover" })
    .blur(6)
    .modulate({ brightness: 0.88, saturation: 0.92 })
    .toBuffer();

  const left = Math.round((CANVAS.w - sw) / 2);
  const top = Math.round((CANVAS.h - sh) / 2);

  await sharp(background)
    .composite([
      { input: shadow, left: left + 18, top: top + 26 },
      { input: sheet, left, top },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(OUT);

  console.log(`✅ ${OUT}`);
}

async function main(): Promise<void> {
  const tee = await buildTeeVisual();
  const sheet = await buildFilledSheet(tee);
  await buildScene(sheet);
}

void main();
