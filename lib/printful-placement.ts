/**
 * lib/printful-placement.ts — Conversion placement Studio → position Printful.
 *
 * Objectif (Kaan, 2026-06-11) : ce que le client voit dans l'atelier = ce que
 * Printful imprime. L'API v1 accepte files[].position en PIXELS de la zone
 * d'impression (origine = coin haut-gauche de la print area) :
 *   { area_width, area_height, width, height, top, left, limit_to_print_area }
 *
 * Chaîne de conversion :
 *   1. Le transform Studio (convention Fabric : left/top px du canvas carré,
 *      taille affichée = width×scaleX, canvasSize) → fractions du canvas.
 *   2. Fractions canvas → centimètres réels via la calibration du Studio
 *      (Gildan M : corps 52 cm ≈ 58 % du canvas) — la même que celle affichée
 *      au client en cm, donc « ce qu'il a vu » est préservé.
 *   3. Centimètres → pixels de la print area Printful (150 dpi).
 *
 * Ancrage de la print area sur le mockup :
 *   - Horizontal : centrée sur l'axe du vêtement (les mockups printify-cropped
 *     sont centrés : axe = 0,50 du canvas — mesuré le 2026-06-11).
 *   - Vertical : le haut de la print area DTG ≈ base du col. La base du col
 *     est estimée à garmentTop + COLLAR_FRAC × garmentHeight (bbox vêtement
 *     mesurée par produit). COLLAR_FRAC calibré visuellement via le Mockup
 *     Generator Printful (cf. scripts de validation, 2026-06-11).
 *
 * Limites assumées V1 :
 *   - Rotation non supportée par l'API position → si angle ≠ 0, on n'envoie
 *     pas de position (Printful place par défaut) et on log un avertissement.
 *   - placement « coeur-dos » : même position relative appliquée aux deux
 *     faces (le Studio ne stocke que le transform du premier logo).
 */

import { PRINTFUL_PRODUCT_IDS } from "@/lib/printfulVariantMap";
import type { LogoPlacementTransform } from "@/types";

// ── Calibration Studio (doit rester aligné avec StudioCanvas.tsx) ─────────────
const SHIRT_BODY_CM   = 52;
const SHIRT_BODY_FILL = 0.58;
/** Largeur physique représentée par toute la largeur du canvas Studio (cm). */
const CM_PER_CANVAS = SHIRT_BODY_CM / SHIRT_BODY_FILL; // ≈ 89,66 cm

// ── Print area Printful DTG (défaut legacy front/back : 12″×16″ @150 dpi) ────
const DEFAULT_AREA = { width: 1800, height: 2400, dpi: 150 };
const PX_PER_CM = DEFAULT_AREA.dpi / 2.54; // ≈ 59,06 px/cm

/** Bbox du vêtement dans le canvas carré (mockups printify-cropped, mesurés
 *  au pixel le 2026-06-11). top/height en fractions du canvas. */
const GARMENT_BBOX: Record<string, { top: number; height: number }> = {
  "gildan-5000":         { top: 0.10,  height: 0.80 },
  "bella-3001":          { top: 0.055, height: 0.89 },
  "comfort-colors-1717": { top: 0.025, height: 0.95 },
  "gildan-18000":        { top: 0.07,  height: 0.86 },
  "gildan-18500":        { top: 0.045, height: 0.91 },
};
const GARMENT_BBOX_DEFAULT = { top: 0.06, height: 0.88 };

/** Base du col ≈ garmentTop + COLLAR_FRAC × garmentHeight.
 *  Valeur calibrée via le Mockup Generator Printful (2026-06-11). */
const COLLAR_FRAC = 0.08;

export interface PrintfulFilePosition {
  area_width:          number;
  area_height:         number;
  width:               number;
  height:              number;
  top:                 number;
  left:                number;
  limit_to_print_area: boolean;
}

/** Dimensions px du fichier d'impression plein-zone (12″×16″ @150 dpi). */
export const PRINT_AREA_PX = { width: DEFAULT_AREA.width, height: DEFAULT_AREA.height };

export interface PrintAreaCanvasRect {
  leftFrac: number;
  topFrac:  number;
  wFrac:    number;
  hFrac:    number;
}

/**
 * Rectangle de la print area DTG dans le canvas Studio (fractions du canvas
 * carré). Source unique partagée entre la conversion de position (ci-dessous)
 * et l'export des fichiers d'impression du Studio (StudioCanvas.exportPrintFiles)
 * — toute dérive entre les deux casserait « aperçu = imprimé ».
 */
export function getPrintAreaCanvasRect(productId: string): PrintAreaCanvasRect {
  const wFrac = (DEFAULT_AREA.width  / PX_PER_CM) / CM_PER_CANVAS; // ≈ 0,340
  const hFrac = (DEFAULT_AREA.height / PX_PER_CM) / CM_PER_CANVAS; // ≈ 0,453
  const bbox  = GARMENT_BBOX[productId] ?? GARMENT_BBOX_DEFAULT;
  return {
    leftFrac: 0.5 - wFrac / 2,                  // centrée sur l'axe
    topFrac:  bbox.top + COLLAR_FRAC * bbox.height, // base du col
    wFrac,
    hFrac,
  };
}

/**
 * Convertit le transform Studio d'un article en position Printful.
 * Retourne null si la conversion n'est pas possible (transform absent/dégénéré,
 * rotation, produit inconnu) → l'appelant n'envoie pas de position et Printful
 * place le fichier par défaut.
 */
export function buildPrintfulPosition(
  productId: string,
  transform: LogoPlacementTransform | null | undefined,
): PrintfulFilePosition | null {
  if (!transform) return null;
  if (!(productId in PRINTFUL_PRODUCT_IDS)) return null;

  const { left, top, scaleX, scaleY, width, height, angle, canvasSize } = transform;
  if (!canvasSize || !width || !height) return null;

  // Rotation : non représentable dans position v1 — fallback placement défaut.
  if (Math.abs(angle ?? 0) > 1) {
    console.warn(`[printful-placement] angle=${angle}° non supporté — position par défaut (${productId})`);
    return null;
  }

  // 1. Transform → fractions du canvas.
  const xFrac = left / canvasSize;
  const yFrac = top / canvasSize;
  const wFrac = (width * scaleX) / canvasSize;
  const hFrac = (height * (scaleY || scaleX)) / canvasSize;
  if (wFrac <= 0 || hFrac <= 0) return null;

  // 2. Ancrage de la print area dans le canvas (fractions) — source unique.
  const rect = getPrintAreaCanvasRect(productId);
  const areaWFrac    = rect.wFrac;
  const areaLeftFrac = rect.leftFrac;
  const areaTopFrac  = rect.topFrac;

  // 3. Fractions canvas → pixels print area (même échelle X/Y, pixels carrés).
  const pxPerFrac = DEFAULT_AREA.width / areaWFrac;

  let posLeft   = Math.round((xFrac - areaLeftFrac) * pxPerFrac);
  let posTop    = Math.round((yFrac - areaTopFrac) * pxPerFrac);
  let posWidth  = Math.round(wFrac * pxPerFrac);
  let posHeight = Math.round(hFrac * pxPerFrac);

  // 4. Clamp dans la zone (limit_to_print_area=true rejette tout dépassement
  //    avec un 400 — on préfère recadrer au bord le plus proche).
  if (posWidth  > DEFAULT_AREA.width)  { posHeight = Math.round(posHeight * DEFAULT_AREA.width  / posWidth);  posWidth  = DEFAULT_AREA.width; }
  if (posHeight > DEFAULT_AREA.height) { posWidth  = Math.round(posWidth  * DEFAULT_AREA.height / posHeight); posHeight = DEFAULT_AREA.height; }
  posLeft = Math.min(Math.max(posLeft, 0), DEFAULT_AREA.width  - posWidth);
  posTop  = Math.min(Math.max(posTop,  0), DEFAULT_AREA.height - posHeight);

  return {
    area_width:          DEFAULT_AREA.width,
    area_height:         DEFAULT_AREA.height,
    width:               posWidth,
    height:              posHeight,
    top:                 posTop,
    left:                posLeft,
    limit_to_print_area: true,
  };
}
