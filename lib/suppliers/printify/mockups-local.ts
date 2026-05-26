/**
 * lib/suppliers/printify/mockups-local.ts
 *
 * Lecture des manifests des mockups Printify locaux.
 *
 * PRIORITÉ IMAGE (mai 2026) :
 *   1. /mockups/printify-cropped/{slug}/{color}-{view}.jpg ← cropped (marges blanches retirées)
 *   2. /mockups/printify/{slug}/{color}-{view}.jpg         ← original Printify
 *
 * Les JPG Printify originaux ont 17-31 % de marge blanche autour du produit
 * (audit visuel confirmé). Le script `scripts/crop-printify-mockups.mjs` crope
 * automatiquement ces marges et stocke dans /mockups/printify-cropped/.
 * Ce fichier privilégie la version cropped si dispo, sinon fallback original.
 *
 * Aucun appel réseau, aucune dépendance Printify.
 */

import manifest from "../../../public/mockups/printify/manifest.json";
import croppedManifest from "../../../public/mockups/printify-cropped/manifest.json";

// ─── Types du manifest ───────────────────────────────────────────────────────

interface ProductMockups {
  blueprintId: number;
  providerId: number;
  providerLabel: string;
  skippedColors: string[];
  mockups: Record<
    string,                                // colorId HM
    Partial<Record<PrintifyView, string>>  // viewId → chemin /mockups/printify/...
  >;
}

interface Manifest {
  generatedAt: string;
  products: Record<string, ProductMockups>;
}

interface CroppedManifest {
  generatedAt: string;
  products: Record<string, { mockups: Record<string, Partial<Record<PrintifyView, string>>> }>;
}

export type PrintifyView =
  | "front"
  | "back"
  | "back-2"
  | "folded"
  | "front-collar-closeup"
  // ── Vues additionnelles pour catégories non-textile (mugs, sacs) ────────
  // Ajoutées 2026-05-26 pour Mug céramique EU bp 441 (4 angles : front,
  // right, left, context). Les produits textile V1 ne renseignent jamais
  // ces vues dans le manifest, donc aucun impact sur leur galerie.
  | "right"
  | "left"
  | "context";

const m = manifest as Manifest;
const mc = croppedManifest as CroppedManifest;

/** Cherche d'abord dans le manifest cropped, sinon fallback sur le manifest original. */
function resolveMockupURL(
  productId: string,
  colorId: string,
  view: PrintifyView,
): string | null {
  // 1. Cropped prioritaire
  const cropped = mc.products?.[productId]?.mockups?.[colorId]?.[view];
  if (cropped) return cropped;
  // 2. Fallback original Printify (avec marges blanches)
  const original = m.products?.[productId]?.mockups?.[colorId]?.[view];
  return original ?? null;
}

// ─── Helpers publics ─────────────────────────────────────────────────────────

/**
 * Vrai si un produit a au moins un mockup Printify local.
 * Utilisé pour décider en amont si on bascule sur les nouveaux assets.
 */
export function hasPrintifyMockups(productId: string): boolean {
  const p = m.products[productId];
  return Boolean(p && Object.keys(p.mockups).length > 0);
}

/**
 * Chemin vers un mockup Printify local précis, ou null si absent.
 *
 * Priorité : cropped → original Printify.
 * Si la vue demandée n'existe pas, fallback sur `front`.
 */
export function getPrintifyLocalMockup(
  productId: string,
  colorId: string | undefined,
  view: PrintifyView = "front",
): string | null {
  if (!colorId) return null;
  const direct = resolveMockupURL(productId, colorId, view);
  if (direct) return direct;
  // Fallback à la vue front si la vue demandée n'existe pas
  if (view !== "front") return resolveMockupURL(productId, colorId, "front");
  return null;
}

/**
 * Liste des colorIds disponibles pour ce produit en mockups Printify locaux.
 */
export function getPrintifyAvailableColors(productId: string): string[] {
  return Object.keys(m.products[productId]?.mockups ?? {});
}

/**
 * Pour la galerie d'une fiche produit : retourne {front, back, folded?} si dispo.
 * Priorité cropped → original Printify pour chaque vue.
 */
export function getPrintifyGallery(
  productId: string,
  colorId: string | undefined,
): { front: string | null; back: string | null; folded: string | null } {
  if (!colorId) return { front: null, back: null, folded: null };
  return {
    front:  resolveMockupURL(productId, colorId, "front"),
    back:   resolveMockupURL(productId, colorId, "back"),
    folded: resolveMockupURL(productId, colorId, "folded"),
  };
}

/** Liste tous les produits couverts par le pipeline Printify (4 V1 en l'occurrence). */
export function getPrintifyMappedProductIds(): string[] {
  return Object.keys(m.products);
}
