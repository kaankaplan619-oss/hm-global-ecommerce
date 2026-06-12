/**
 * scripts/test-bat-pdf.ts
 *
 * Test visuel du BAT officiel PDF — 100 % local, aucun env requis.
 * Compose deux visuels (face cœur 9 cm + dos 25 cm) via renderBat sur
 * gildan-18000/noir avec le logo HM Global, puis génère :
 *   /tmp/bat-pdf-test-2faces.pdf  (page à 2 visuels)
 *   /tmp/bat-pdf-test-1face.pdf   (page à 1 visuel)
 *
 * Lance avec : npm run test:bat-pdf
 */

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { renderBat } from "../lib/bat-renderer";
import { generateBatPdf, type BatPdfPage } from "../lib/bat-pdf";

// Zones hoodies — identiques à scripts/test-render-bat.ts
const ZONES_HOODIES = {
  coeur: [0.40, 0.32, 0.16, 0.16] as const,
  dos:   [0.25, 0.22, 0.50, 0.42] as const,
};
const CANVAS_SIZE = 544;
const PX_PER_CM_COEUR = 6.97;
const PX_PER_CM_DOS   = 7.16;

function buildTransform(
  zone: readonly [number, number, number, number],
  sizeCm: number,
  pxPerCm: number,
  logoW: number,
  logoH: number,
) {
  const [lf, tf, wf, hf] = zone;
  const cx = (lf + wf / 2) * CANVAS_SIZE;
  const cy = (tf + hf / 2) * CANVAS_SIZE;
  const logoWfab = sizeCm * pxPerCm;
  const scale = logoWfab / logoW;
  return {
    left:   Math.round(cx - logoWfab / 2),
    top:    Math.round(cy - (logoH * scale) / 2),
    scaleX: +scale.toFixed(4),
    scaleY: +scale.toFixed(4),
    width:  logoW,
    height: logoH,
    angle:  0,
    canvasSize: CANVAS_SIZE,
  };
}

async function main() {
  // Logo local → data URL (pas de réseau)
  const logoPath = path.join(process.cwd(), "public", "logo", "hm-global-logo.png");
  const logoBuf = await readFile(logoPath);
  const logoUrl = `data:image/png;base64,${logoBuf.toString("base64")}`;

  const sharp = (await import("sharp")).default;
  const meta = await sharp(logoBuf).metadata();
  const logoW = meta.width!;
  const logoH = meta.height!;

  console.log("Rendu composite face (cœur 9 cm)…");
  const face = await renderBat({
    garmentRelativePath: "hm/textile/gildan-18000/noir/front.webp",
    logoUrl,
    placement: "coeur",
    face: "front",
    productCategory: "hoodies",
    transform: buildTransform(ZONES_HOODIES.coeur, 9, PX_PER_CM_COEUR, logoW, logoH),
    outputSize: 1400,
  });

  console.log("Rendu composite dos (25 cm)…");
  const back = await renderBat({
    garmentRelativePath: "hm/textile/gildan-18000/noir/back.webp",
    logoUrl,
    placement: "dos",
    face: "back",
    productCategory: "hoodies",
    transform: buildTransform(ZONES_HOODIES.dos, 25, PX_PER_CM_DOS, logoW, logoH),
    outputSize: 1400,
  });

  const base = {
    clientName: "ALC CARROSSERIE",
    projet: "Commande HM-2026-0042 – 25 × Sweat à capuche Gildan 18000",
    support: "Sweat à capuche Gildan 18000 – Noir – taille L",
    dateStr: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
  };

  const pageTwoVisuals: BatPdfPage = {
    ...base,
    formatDimensions: "Impression DTF  –  Cœur + Dos  –  largeur logo env. 9 cm",
    visuals: [
      { bytes: new Uint8Array(face.buffer), caption: "Face avant" },
      { bytes: new Uint8Array(back.buffer), caption: "Dos" },
    ],
  };

  const pageOneVisual: BatPdfPage = {
    ...base,
    formatDimensions: "Impression DTF  –  Cœur (poitrine gauche)  –  largeur logo env. 9 cm",
    visuals: [{ bytes: new Uint8Array(face.buffer), caption: "Face avant" }],
  };

  console.log("Génération PDF…");
  await writeFile("/tmp/bat-pdf-test-2faces.pdf", await generateBatPdf([pageTwoVisuals]));
  await writeFile("/tmp/bat-pdf-test-1face.pdf", await generateBatPdf([pageOneVisual]));

  console.log("✅  /tmp/bat-pdf-test-2faces.pdf");
  console.log("✅  /tmp/bat-pdf-test-1face.pdf");
}

main().catch((err) => {
  console.error("❌ ", err.message);
  process.exit(1);
});
