/**
 * lib/suppliers/printify/v1-image.ts
 *
 * Helper central UNIQUE pour la résolution image des 6 produits V1 Printify.
 *
 * Règle stricte mission "100% Printify V1" :
 *   - Si le produit est V1 (gildan-5000, bella-3001, comfort-colors-1717,
 *     gildan-2400-ls, gildan-18000, gildan-18500) → URL doit OBLIGATOIREMENT
 *     commencer par /mockups/printify/{productId}/
 *     OU /mockups/printify-cropped/{productId}/ (variante mai 2026,
 *     servie en priorité par mockups-local.ts après le pipeline crop
 *     automatique qui retire les marges blanches des JPG Printify).
 *   - Aucune autre source autorisée pour ces produits : pas de 3D, pas de
 *     hmMockupImages, pas de supplierImages, pas de packshot TopTex, pas
 *     d'ancien /mockups/{slug}/.
 *
 * Consommé par :
 *   - components/product/ProductCard.tsx
 *   - components/home/BestSellers.tsx
 *   - components/product/ProductGallery.tsx
 *   - components/product/ProductDetailClient.tsx
 *
 * Isomorphique (lecture manifest JSON statique). Aucun appel réseau.
 */

import {
  isPrintifyV1Product,
  getPrintifyMockupForHMColor,
} from "./printify-colors";
import { getPrintifyGallery } from "./mockups-local";

export type PrintifyV1View = "front" | "back" | "back-2" | "folded" | "front-collar-closeup";

/**
 * URL whitelist : seules ces racines sont autorisées comme source d'image V1.
 * - /mockups/printify/{productId}/         → JPG originaux Printify
 * - /mockups/printify-cropped/{productId}/ → JPG cropped (prioritaires depuis mai 2026)
 *
 * Une URL Printify locale doit commencer par l'un de ces préfixes ; toute autre
 * source est rejetée par la safety net pour garantir la cohérence visuelle V1.
 */
const V1_URL_PREFIXES = ["/mockups/printify/", "/mockups/printify-cropped/"] as const;

function isAllowedV1Url(url: string): boolean {
  return V1_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

/**
 * Retourne l'URL d'un mockup Printify V1 pour un produit + couleur + vue.
 * Renvoie null SI le produit n'est pas V1 ou si la vue n'existe pas.
 *
 * Garantie : si la fonction renvoie une URL non-null, elle commence par
 * /mockups/printify/{productId}/ OU /mockups/printify-cropped/{productId}/
 */
export function getV1PrintifyImage(
  productId: string,
  hmColorId: string | undefined,
  view: PrintifyV1View = "front",
): string | null {
  if (!productId || !isPrintifyV1Product(productId)) return null;
  if (!hmColorId) return null;
  const url = getPrintifyMockupForHMColor(productId, hmColorId, view);
  if (!url) return null;
  if (!isAllowedV1Url(url)) return null; // safety net
  return url;
}

/**
 * Retourne la galerie complète d'un produit V1 (front, back, folded).
 * Pour ProductGallery / ProductDetailClient.
 *
 * Garantie : toutes les URLs commencent par /mockups/printify/ ou
 * /mockups/printify-cropped/ (cf isAllowedV1Url).
 * Renvoie un tableau VIDE si le produit n'est pas V1 (caller doit gérer fallback).
 */
export function getV1PrintifyGallery(
  productId: string,
  hmColorId: string | undefined,
): string[] {
  if (!productId || !isPrintifyV1Product(productId) || !hmColorId) return [];
  const front  = getV1PrintifyImage(productId, hmColorId, "front");
  const back   = getV1PrintifyImage(productId, hmColorId, "back");
  const folded = getV1PrintifyImage(productId, hmColorId, "folded");
  return [front, back, folded].filter((s): s is string => Boolean(s));
}

/**
 * True si le produit est V1 ET qu'au moins un mockup front existe pour cette couleur.
 * Utilisé pour décider de désactiver les fallbacks (3D, anciens chemins).
 */
export function hasV1PrintifyImage(
  productId: string,
  hmColorId: string | undefined,
): boolean {
  return getV1PrintifyImage(productId, hmColorId, "front") !== null;
}

// Re-export pour usage direct dans les composants
export { isPrintifyV1Product, getPrintifyGallery };
