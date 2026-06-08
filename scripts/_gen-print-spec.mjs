/**
 * scripts/_gen-print-spec.mjs
 *
 * Génère les "spec mockups" cohérents de la grille /impression :
 * support à plat sur fond studio neutre identique, ombre douce, placeholder
 * "votre design ici", cote (dimension) annotée. Aspect réel respecté.
 *
 * Le manifest ci-dessous est aligné sur les `id` de data/print-catalogue.ts.
 * Sortie : public/mockups/print/spec/{id}.webp
 *
 * Lancer :  node scripts/_gen-print-spec.mjs   (depuis la racine hm-global)
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "public/mockups/print/spec";
mkdirSync(OUT, { recursive: true });

const CYAN = "#54b6d2", MAGENTA = "#b13f74", VIOLET = "#7c5cbf",
      TEAL = "#2fa39b", AMBER = "#d08a52", INK = "#2d2340", MUTED = "#8b8597";

const W = 1200, H = 900;

function spec({ aspectW, aspectH, label, accent, kind, round = false, fold = false }) {
  const ratio = aspectW / aspectH;
  const maxW = W * 0.46, maxH = H * 0.52;
  let w = maxW, h = w / ratio;
  if (h > maxH) { h = maxH; w = h * ratio; }
  const cx = W / 2, cy = H * 0.46;
  const x = cx - w / 2, y = cy - h / 2;
  const r = round ? Math.min(w, h) * 0.10 : Math.min(14, w * 0.03);

  const pad = Math.min(w, h) * 0.12;
  const logo = Math.min(w, h) * 0.16;
  const lx = x + pad, ly = y + pad;
  const lineW = w - pad * 2;

  const design =
    kind === "frame"
      ? `<rect x="${x + w * 0.12}" y="${y + h * 0.12}" width="${w * 0.76}" height="${h * 0.76}" rx="4" fill="#eef0f3"/>
         <rect x="${x + w * 0.12}" y="${y + h * 0.12}" width="${w * 0.76}" height="${h * 0.76}" rx="4" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="2"/>
         <circle cx="${x + w * 0.34}" cy="${y + h * 0.40}" r="${Math.min(w, h) * 0.10}" fill="${accent}" fill-opacity="0.20"/>
         <path d="M ${x + w * 0.16} ${y + h * 0.82} L ${x + w * 0.40} ${y + h * 0.54} L ${x + w * 0.58} ${y + h * 0.70} L ${x + w * 0.84} ${y + h * 0.44} L ${x + w * 0.84} ${y + h * 0.86} L ${x + w * 0.16} ${y + h * 0.86} Z" fill="${accent}" fill-opacity="0.22"/>`
      : `<rect x="${lx}" y="${ly}" width="${logo}" height="${logo}" rx="3" fill="${accent}" fill-opacity="0.88"/>
         <rect x="${lx + logo + pad * 0.5}" y="${ly + logo * 0.18}" width="${lineW * 0.42}" height="${logo * 0.15}" rx="3" fill="${INK}" fill-opacity="0.55"/>
         <rect x="${lx + logo + pad * 0.5}" y="${ly + logo * 0.5}" width="${lineW * 0.30}" height="${logo * 0.12}" rx="3" fill="${MUTED}" fill-opacity="0.6"/>
         <rect x="${lx}" y="${y + h - pad - logo * 0.45}" width="${lineW * 0.5}" height="${logo * 0.11}" rx="3" fill="${MUTED}" fill-opacity="0.45"/>
         <rect x="${lx}" y="${y + h - pad - logo * 0.45 + logo * 0.26}" width="${lineW * 0.36}" height="${logo * 0.11}" rx="3" fill="${MUTED}" fill-opacity="0.35"/>`;

  const foldLine = fold
    ? `<line x1="${cx}" y1="${y + 6}" x2="${cx}" y2="${y + h - 6}" stroke="${INK}" stroke-opacity="0.10" stroke-width="2" stroke-dasharray="5 6"/>`
    : "";

  const dimY = y + h + 46, tick = 9;
  const fs = 20;
  const pillW = Math.max(150, label.length * 10.5 + 30);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fcfcfd"/>
        <stop offset="0.55" stop-color="#f4f5f7"/>
        <stop offset="1" stop-color="#eceef1"/>
      </linearGradient>
      <filter id="sh" x="-40%" y="-40%" width="180%" height="200%">
        <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#2d2340" flood-opacity="0.16"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#ffffff"/></g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#000" stroke-opacity="0.06" stroke-width="1"/>
    ${design}
    ${foldLine}
    <g stroke="${MUTED}" stroke-width="1.4" opacity="0.85">
      <line x1="${x}" y1="${dimY}" x2="${x + w}" y2="${dimY}"/>
      <line x1="${x}" y1="${dimY - tick}" x2="${x}" y2="${dimY + tick}"/>
      <line x1="${x + w}" y1="${dimY - tick}" x2="${x + w}" y2="${dimY + tick}"/>
    </g>
    <rect x="${cx - pillW / 2}" y="${dimY - 17}" width="${pillW}" height="34" rx="17" fill="#ffffff"/>
    <text x="${cx}" y="${dimY + 6}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" font-weight="700" fill="${INK}" letter-spacing="0.3">${label}</text>
  </svg>`;
  return Buffer.from(svg);
}

const MANIFEST = [
  // business-cards (sheet, cyan)
  { id: "bc-standard", aspectW: 85, aspectH: 55, label: "85 × 55 mm", accent: CYAN, kind: "sheet" },
  { id: "bc-rounded",  aspectW: 85, aspectH: 55, label: "85 × 55 mm", accent: CYAN, kind: "sheet", round: true },
  { id: "bc-square",   aspectW: 55, aspectH: 55, label: "55 × 55 mm", accent: CYAN, kind: "sheet" },
  { id: "bc-folded",   aspectW: 85, aspectH: 55, label: "85 × 55 mm", accent: CYAN, kind: "sheet", fold: true },
  // flyer (sheet, magenta)
  { id: "flyer-a6", aspectW: 105, aspectH: 148, label: "A6 · 10,5 × 14,8 cm", accent: MAGENTA, kind: "sheet" },
  { id: "flyer-a5", aspectW: 148, aspectH: 210, label: "A5 · 14,8 × 21 cm",   accent: MAGENTA, kind: "sheet" },
  { id: "flyer-a4", aspectW: 210, aspectH: 297, label: "A4 · 21 × 29,7 cm",   accent: MAGENTA, kind: "sheet" },
  // poster (frame, violet)
  { id: "poster-a3",     aspectW: 297, aspectH: 420, label: "A3 · 29,7 × 42 cm", accent: VIOLET, kind: "frame" },
  { id: "poster-40x60",  aspectW: 40,  aspectH: 60,  label: "40 × 60 cm",        accent: VIOLET, kind: "frame" },
  { id: "poster-50x70",  aspectW: 50,  aspectH: 70,  label: "50 × 70 cm",        accent: VIOLET, kind: "frame" },
  { id: "poster-a2",     aspectW: 420, aspectH: 594, label: "A2 · 42 × 59,4 cm", accent: VIOLET, kind: "frame" },
  // canvas (frame, teal)
  { id: "canvas-30x40", aspectW: 30, aspectH: 40, label: "30 × 40 cm", accent: TEAL, kind: "frame" },
  { id: "canvas-40x60", aspectW: 40, aspectH: 60, label: "40 × 60 cm", accent: TEAL, kind: "frame" },
  { id: "canvas-50x50", aspectW: 50, aspectH: 50, label: "50 × 50 cm", accent: TEAL, kind: "frame" },
  { id: "canvas-60x90", aspectW: 60, aspectH: 90, label: "60 × 90 cm", accent: TEAL, kind: "frame" },
  // cards & invitations (sheet, amber)
  { id: "card-a6",     aspectW: 105, aspectH: 148, label: "A6 · 10,5 × 14,8 cm", accent: AMBER, kind: "sheet" },
  { id: "card-square", aspectW: 140, aspectH: 140, label: "14 × 14 cm",          accent: AMBER, kind: "sheet" },
  { id: "card-folded", aspectW: 105, aspectH: 148, label: "A6 pliée",            accent: AMBER, kind: "sheet", fold: true },
];

for (const m of MANIFEST) {
  const buf = spec(m);
  await sharp(buf).webp({ quality: 90 }).toFile(`${OUT}/${m.id}.webp`);
}
console.log(`✓ ${MANIFEST.length} spec mockups générés dans ${OUT}`);
