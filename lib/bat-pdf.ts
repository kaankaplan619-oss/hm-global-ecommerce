/**
 * bat-pdf.ts — Génération du BAT officiel HM Global au format PDF (pdf-lib).
 *
 * La mise en page reproduit le template BAT officiel de l'agence (document
 * source conservé hors repo). Tout est redessiné en vectoriel :
 *   - en-tête « BAT — Client : X » + logo HM Global + barres tricolores
 *   - bloc « BON À TIRER » : Projet / Support / Format-dimensions / Date
 *   - décors « ondes » de la charte (arcs à bouts arrondis, digitalisés
 *     depuis le template) en haut droit et bas droit
 *   - zone centrale : visuel(s) BAT composite(s) de la commande
 *   - encadré VALIDATION (laissé vierge — rempli à la main par le client)
 *   - checklist des éléments vérifiés + mentions légales en pied de page
 *
 * Choix pdf-lib plutôt que SVG→sharp : le texte SVG rasterisé par sharp
 * dépend des polices système, absentes en environnement serverless.
 * pdf-lib embarque les 14 polices standard (Helvetica) — rendu identique
 * en local et sur Vercel, texte vectoriel sélectionnable.
 */

import {
  LineCapStyle,
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";
import type { Order, OrderItem, LogoPlacementTransform } from "@/types";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS, formatDate } from "./bat-utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BatPdfVisual {
  /** PNG ou JPEG (détection par magic bytes) */
  bytes: Uint8Array;
  caption?: string;
}

export interface BatPdfPage {
  clientName: string;
  projet: string;
  support: string;
  formatDimensions: string;
  dateStr: string;
  visuals: BatPdfVisual[]; // 1 ou 2 visuels par page
}

// ── Constantes layout (points PDF, A4 portrait, repère haut de page) ───────────
// Coordonnées et couleurs relevées sur le template officiel rasterisé.

const PAGE_W = 595.28;
const PAGE_H = 841.89;

type RGB255 = { r: number; g: number; b: number };

const TEAL_LIGHT: RGB255 = { r: 0x65, g: 0xb4, b: 0xc3 };
const TEAL_DARK:  RGB255 = { r: 0x31, g: 0x68, b: 0x8b };
const MAGENTA:    RGB255 = { r: 0x89, g: 0x3f, b: 0x60 };
const PURPLE:     RGB255 = { r: 0x33, g: 0x25, b: 0x44 };

const COL_MAGENTA = rgb(MAGENTA.r / 255, MAGENTA.g / 255, MAGENTA.b / 255);
const COL_PURPLE  = rgb(PURPLE.r / 255, PURPLE.g / 255, PURPLE.b / 255);
const COL_TEXT    = rgb(0x1d / 255, 0x1d / 255, 0x1b / 255);
const COL_MUTED   = rgb(0x6a / 255, 0x6a / 255, 0x6a / 255);

const BARS_END_X = 374;
const FIELD_VALUE_MAX_X = 415; // bord droit autorisé des valeurs (décor à droite)

const CHECKLIST = [
  "orthographe et contenu du texte",
  "dimensions et format",
  "couleurs et mise en page",
  "emplacement des logos, textes et visuels",
  "finitions et options demandées",
];

const LEGAL_LINES = [
  "Toute validation du présent BAT vaut accord définitif pour lancement en production.",
  "Après validation, HM Global Agence ne pourra être tenue responsable des erreurs non signalées.",
];

// ── Décors « ondes » de la charte ──────────────────────────────────────────────
// Chaque arc = courbe de Bézier cubique [x0,y0, cx1,cy1, cx2,cy2, x1,y1]
// en points PDF, repère HAUT de page. Tracés par segments à bouts arrondis,
// avec interpolation de couleur le long de l'arc pour les dégradés teal.

interface ArcStroke {
  p: [number, number, number, number, number, number, number, number];
  w: number;
  from: RGB255;
  to?: RGB255;
}

const TOP_DECOR_ARCS: ArcStroke[] = [
  { p: [430, 136, 468, 135, 497, 165, 499, 216], w: 13,   from: TEAL_LIGHT, to: TEAL_DARK },
  { p: [524, 106, 538, 130, 557, 160, 562, 190], w: 10,   from: TEAL_LIGHT, to: TEAL_DARK },
  { p: [552, 101, 556, 111, 560, 120, 563, 129], w: 10,   from: MAGENTA },
  { p: [523, 137, 539, 175, 549, 222, 533, 253], w: 10.5, from: MAGENTA },
  { p: [516, 167, 522, 190, 523, 220, 513, 240], w: 12,   from: PURPLE },
  { p: [563, 219, 562, 230, 559, 242, 556, 252], w: 11,   from: PURPLE },
];

const BOTTOM_DECOR_ARCS: ArcStroke[] = [
  { p: [468, 681, 460, 689, 450, 697, 443, 705], w: 10,   from: PURPLE },
  { p: [485, 680, 476, 706, 477, 742, 494, 768], w: 10.5, from: MAGENTA },
  { p: [501, 684, 494, 702, 493, 726, 500, 742], w: 9.5,  from: PURPLE },
  { p: [512, 706, 513, 740, 531, 766, 566, 771], w: 11,   from: TEAL_DARK, to: TEAL_LIGHT },
  { p: [464, 728, 467, 756, 477, 777, 493, 789], w: 11,   from: TEAL_DARK, to: TEAL_LIGHT },
  { p: [463, 775, 466, 781, 469, 786, 472, 790], w: 10,   from: MAGENTA },
];

function lerpColor(a: RGB255, b: RGB255, t: number) {
  return rgb(
    (a.r + (b.r - a.r) * t) / 255,
    (a.g + (b.g - a.g) * t) / 255,
    (a.b + (b.b - a.b) * t) / 255,
  );
}

function drawArcStrokes(page: PDFPage, arcs: ArcStroke[]): void {
  const SEGMENTS = 24;
  for (const arc of arcs) {
    const [x0, y0, cx1, cy1, cx2, cy2, x1, y1] = arc.p;
    const bezier = (t: number) => {
      const u = 1 - t;
      return {
        x: u * u * u * x0 + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t * t * t * x1,
        y: u * u * u * y0 + 3 * u * u * t * cy1 + 3 * u * t * t * cy2 + t * t * t * y1,
      };
    };
    let prev = bezier(0);
    for (let i = 1; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const cur = bezier(t);
      page.drawLine({
        start: { x: prev.x, y: PAGE_H - prev.y },
        end:   { x: cur.x,  y: PAGE_H - cur.y },
        thickness: arc.w,
        color: arc.to ? lerpColor(arc.from, arc.to, t) : lerpColor(arc.from, arc.from, 0),
        lineCap: LineCapStyle.Round,
      });
      prev = cur;
    }
  }
}

// ── Helpers texte / images ─────────────────────────────────────────────────────

/** Caractères hors WinAnsi (Helvetica standard) → remplacés pour éviter un throw pdf-lib. */
function sanitizeWinAnsi(s: string): string {
  return s
    .replace(/≈/g, "env.")
    .replace(/[^\x00-\xFFŒœ€‘’“”–—…•]/g, "?");
}

interface DrawTextOpts {
  x: number;
  topY: number; // baseline mesurée depuis le HAUT de la page
  size: number;
  font: PDFFont;
  color?: ReturnType<typeof rgb>;
  maxWidth?: number;  // réduit la taille (jusqu'à -30 %) puis tronque avec …
  alignRight?: boolean; // x devient alors le bord DROIT du texte
}

function drawText(page: PDFPage, text: string, opts: DrawTextOpts): void {
  const { font, color = COL_TEXT, maxWidth, alignRight } = opts;
  let { size } = opts;
  let str = sanitizeWinAnsi(text);

  if (maxWidth) {
    const minSize = size * 0.7;
    while (font.widthOfTextAtSize(str, size) > maxWidth && size > minSize) size -= 0.5;
    while (font.widthOfTextAtSize(str, size) > maxWidth && str.length > 1) {
      str = str.slice(0, -2) + "…";
    }
  }

  const x = alignRight ? opts.x - font.widthOfTextAtSize(str, size) : opts.x;
  page.drawText(str, { x, y: PAGE_H - opts.topY, size, font, color });
}

function detectIsPng(bytes: Uint8Array): boolean {
  return bytes.length > 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e;
}

async function embedImage(doc: PDFDocument, bytes: Uint8Array): Promise<PDFImage> {
  return detectIsPng(bytes) ? doc.embedPng(bytes) : doc.embedJpg(bytes);
}

/** Rect dont x/y sont exprimés depuis le haut de la page. */
function drawRectTop(
  page: PDFPage,
  x: number, topY: number, w: number, h: number,
  color: ReturnType<typeof rgb>,
): void {
  page.drawRectangle({ x, y: PAGE_H - topY - h, width: w, height: h, color });
}

/** Dégradé horizontal approximé par segments (pdf-lib n'a pas de shading natif). */
function drawGradientBar(
  page: PDFPage,
  x: number, topY: number, w: number, h: number,
  from: RGB255, to: RGB255,
): void {
  const SEGMENTS = 48;
  const segW = w / SEGMENTS;
  for (let i = 0; i < SEGMENTS; i++) {
    const t = i / (SEGMENTS - 1);
    // +0.6pt de recouvrement pour éviter les liserés blancs entre segments
    drawRectTop(page, x + i * segW, topY, segW + 0.6, h, lerpColor(from, to, t));
  }
}

/** Insère une image en "contain" dans une boîte (coordonnées depuis le haut). */
function drawImageContain(
  page: PDFPage, img: PDFImage,
  box: { x: number; topY: number; w: number; h: number },
): { bottomTopY: number; centerX: number } {
  const scale = Math.min(box.w / img.width, box.h / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = box.x + (box.w - w) / 2;
  const topY = box.topY + (box.h - h) / 2;
  page.drawImage(img, { x, y: PAGE_H - topY - h, width: w, height: h });
  return { bottomTopY: topY + h, centerX: x + w / 2 };
}

// ── Rendu d'une page ───────────────────────────────────────────────────────────

interface PageAssets {
  logo: PDFImage;
  font: PDFFont;
}

function drawBatPage(
  doc: PDFDocument,
  assets: PageAssets,
  data: BatPdfPage,
  visualImages: PDFImage[],
): void {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { font } = assets;

  // ── En-tête ─────────────────────────────────────────────────────────────────
  drawText(page, "BAT", { x: 15, topY: 53, size: 42, font });
  // x 112 : laisse une vraie respiration après « BAT » (le T s'arrête vers x 103)
  drawText(page, `Client : ${data.clientName}`, {
    x: 112, topY: 47, size: 17, font, maxWidth: 275,
  });

  // Logo HM Global haut droit (ratio 2286×904)
  const logoW = 172;
  const logoH = logoW * (904 / 2286);
  page.drawImage(assets.logo, {
    x: PAGE_W - logoW - 21, y: PAGE_H - 12 - logoH, width: logoW, height: logoH,
  });

  // Barres tricolores
  drawRectTop(page, 0, 63, BARS_END_X, 6, COL_MAGENTA);
  drawGradientBar(page, 0, 69, BARS_END_X, 4.5, TEAL_LIGHT, TEAL_DARK);
  drawRectTop(page, 0, 73.5, BARS_END_X, 7.5, COL_PURPLE);

  // Décors « ondes »
  drawArcStrokes(page, TOP_DECOR_ARCS);
  drawArcStrokes(page, BOTTOM_DECOR_ARCS);

  // ── Bloc BON À TIRER ────────────────────────────────────────────────────────
  drawText(page, "BON À TIRER", { x: 20, topY: 110, size: 20, font });

  const fields: Array<[string, string]> = [
    ["Projet :", data.projet],
    ["Support :", data.support],
    ["Format / dimensions :", data.formatDimensions],
    ["Date :", data.dateStr],
  ];
  let fieldTop = 138;
  for (const [label, value] of fields) {
    drawText(page, label, { x: 23, topY: fieldTop, size: 15, font });
    const valueX = 23 + font.widthOfTextAtSize(sanitizeWinAnsi(label), 15) + 6;
    const maxW = FIELD_VALUE_MAX_X - valueX;
    // Valeur trop longue → coupée en 2 lignes sur un séparateur « – »
    // (le pas de 34 pt entre champs laisse la place d'une 2e ligne à +15 pt)
    if (font.widthOfTextAtSize(sanitizeWinAnsi(value), 13) > maxW && value.includes(" – ")) {
      const parts = value.split(" – ");
      let line1 = parts[0];
      while (
        parts.length > 1 &&
        font.widthOfTextAtSize(sanitizeWinAnsi(`${line1} – ${parts[1]}`), 13) <= maxW
      ) {
        line1 = `${line1} – ${parts.splice(1, 1)[0]}`;
      }
      drawText(page, line1, { x: valueX, topY: fieldTop, size: 13, font, maxWidth: maxW });
      drawText(page, parts.slice(1).join(" – "), {
        x: valueX, topY: fieldTop + 15, size: 13, font, maxWidth: maxW,
      });
    } else {
      drawText(page, value, { x: valueX, topY: fieldTop, size: 13, font, maxWidth: maxW });
    }
    fieldTop += 34;
  }

  // ── Zone centrale : visuel(s) BAT composite ────────────────────────────────
  const zone = { x: 40, topY: 280, w: PAGE_W - 80, h: 295 };
  if (visualImages.length === 1) {
    // Hauteur réduite : la légende sous le visuel doit rester au-dessus
    // de l'encadré VALIDATION (topY 594)
    const r = drawImageContain(page, visualImages[0], {
      x: (PAGE_W - 340) / 2, topY: zone.topY, w: 340, h: 270,
    });
    const caption = data.visuals[0]?.caption;
    if (caption) {
      drawText(page, caption, {
        x: r.centerX - font.widthOfTextAtSize(sanitizeWinAnsi(caption), 9) / 2,
        topY: r.bottomTopY + 12, size: 9, font, color: COL_MUTED,
      });
    }
  } else if (visualImages.length >= 2) {
    const boxW = (zone.w - 30) / 2;
    visualImages.slice(0, 2).forEach((img, i) => {
      const r = drawImageContain(page, img, {
        x: zone.x + i * (boxW + 30), topY: zone.topY, w: boxW, h: zone.h - 14,
      });
      const caption = data.visuals[i]?.caption;
      if (caption) {
        drawText(page, caption, {
          x: r.centerX - font.widthOfTextAtSize(sanitizeWinAnsi(caption), 9) / 2,
          topY: r.bottomTopY + 12, size: 9, font, color: COL_MUTED,
        });
      }
    });
  }

  // ── Encadré VALIDATION (vierge — rempli à la main par le client) ──────────
  drawText(page, "VALIDATION", { x: 298, topY: 594, size: 11, font });
  drawText(page, "Nom / Société :", { x: 298, topY: 622, size: 10, font });
  drawText(page, "Date :", { x: 298, topY: 637, size: 10, font });
  drawText(page, "Signature précédée de la mention “Bon pour accord” :", {
    x: 298, topY: 652, size: 10, font,
  });

  // ── Checklist ──────────────────────────────────────────────────────────────
  drawText(page, "VISUEL VALIDÉ POUR IMPRESSION", { x: 13, topY: 690, size: 10, font });
  drawText(page, "Le client reconnaît avoir vérifié et validé les éléments suivants :", {
    x: 13, topY: 713, size: 9.5, font,
  });
  let bulletTop = 728;
  for (const item of CHECKLIST) {
    drawText(page, "•", { x: 50, topY: bulletTop, size: 9.5, font });
    drawText(page, item, { x: 84, topY: bulletTop, size: 9.5, font });
    bulletTop += 13.5;
  }

  // ── Pied de page ───────────────────────────────────────────────────────────
  drawText(page, LEGAL_LINES[0], { x: 13, topY: 810, size: 9.5, font });
  drawText(page, LEGAL_LINES[1], { x: 13, topY: 824, size: 9.5, font });

  drawText(page, "HM Global Agence", { x: PAGE_W - 21, topY: 807, size: 10.5, font, alignRight: true });
  drawText(page, "contact@hmga.fr", { x: PAGE_W - 21, topY: 822, size: 10.5, font, alignRight: true });
}

// ── API principale ─────────────────────────────────────────────────────────────

export async function generateBatPdf(pages: BatPdfPage[]): Promise<Uint8Array> {
  if (pages.length === 0) throw new Error("generateBatPdf: aucune page à générer");

  const doc = await PDFDocument.create();
  doc.setTitle("BAT — HM Global Agence");
  doc.setAuthor("HM Global Agence");

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const logoBytes = await readFile(
    path.join(process.cwd(), "public", "logo", "hm-global-logo.png"),
  );
  const assets: PageAssets = {
    logo: await doc.embedPng(new Uint8Array(logoBytes)),
    font,
  };

  for (const pageData of pages) {
    const visualImages = await Promise.all(
      pageData.visuals.map((v) => embedImage(doc, v.bytes)),
    );
    drawBatPage(doc, assets, pageData, visualImages);
  }

  return doc.save();
}

// ── Construction des pages depuis une commande ─────────────────────────────────

// Conversion px Fabric → cm — mêmes constantes que scripts/test-render-bat.ts
// (calibrées sur les zones hoodies, canvas studio 544 px).
const STUDIO_CANVAS_SIZE = 544;
const CM_PER_PX_COEUR = 1 / 6.97;
const CM_PER_PX_DOS   = 1 / 7.16;

function logoWidthCm(t: LogoPlacementTransform, zone: "coeur" | "dos"): number | null {
  if (!t?.width || !t?.scaleX) return null;
  const canvasSize = t.canvasSize || STUDIO_CANVAS_SIZE;
  const pxAt544 = t.width * t.scaleX * (STUDIO_CANVAS_SIZE / canvasSize);
  const cm = pxAt544 * (zone === "dos" ? CM_PER_PX_DOS : CM_PER_PX_COEUR);
  return Math.round(cm * 10) / 10;
}

function formatDimensionsLine(item: OrderItem): string {
  const parts: string[] = [];
  if (item.technique) parts.push(TECHNIQUE_LABELS[item.technique] ?? item.technique);
  if (item.placement) parts.push(PLACEMENT_LABELS[item.placement] ?? item.placement);
  if (item.logoPlacementTransform) {
    const zone = item.placement === "dos" ? "dos" : "coeur";
    const cm = logoWidthCm(item.logoPlacementTransform, zone);
    if (cm) parts.push(`largeur logo env. ${String(cm).replace(".", ",")} cm`);
  }
  return parts.join(" – ") || "—";
}

async function fetchVisualBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Visuel BAT inaccessible: ${res.status} ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Construit les pages du BAT officiel depuis une commande mappée.
 * Une page par article textile disposant d'un aperçu composite persisté
 * (composed_preview_url / composed_preview_back — migration 013).
 * Les articles print (printConfig) ont leur propre flux de fichiers : exclus.
 */
export async function buildBatPagesForOrder(order: Order): Promise<BatPdfPage[]> {
  const items = (order.items ?? []).filter(
    (i) => !i.printConfig && (i.composedPreviewUrl || i.composedPreviewBack),
  );

  const clientName =
    order.user?.company?.trim() ||
    [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ").trim() ||
    "—";
  const dateStr = formatDate(new Date());

  const pages: BatPdfPage[] = [];
  for (const [idx, item] of items.entries()) {
    const visuals: BatPdfVisual[] = [];
    try {
      if (item.composedPreviewUrl) {
        visuals.push({
          bytes: await fetchVisualBytes(item.composedPreviewUrl),
          caption: item.placement === "dos" ? "Dos" : "Face avant",
        });
      }
      if (item.composedPreviewBack) {
        visuals.push({
          bytes: await fetchVisualBytes(item.composedPreviewBack),
          caption: "Dos",
        });
      }
    } catch (err) {
      console.error("[bat-pdf] Visuel illisible, article ignoré:", err);
    }
    if (visuals.length === 0) continue;

    const articleSuffix = items.length > 1 ? ` – article ${idx + 1}/${items.length}` : "";
    pages.push({
      clientName,
      projet: `Commande ${order.orderNumber} – ${item.quantity} × ${item.product?.name ?? "textile personnalisé"}${articleSuffix}`,
      support: `${item.product?.name ?? "—"}${item.color?.label ? ` – ${item.color.label}` : ""}${item.size ? ` – taille ${item.size}` : ""}`,
      formatDimensions: formatDimensionsLine(item),
      dateStr,
      visuals,
    });
  }
  return pages;
}
