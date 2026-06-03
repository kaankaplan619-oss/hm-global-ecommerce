/**
 * lib/suppliers/gelato/adapter.ts
 *
 * Adapter Gelato → format pivot HM (à consolider plus tard avec Printify).
 *
 * STATUT : STUB — pour l'audit V1, on garde les types Gelato bruts ;
 * la normalisation HM globale viendra quand le 2e adapter (Printify produits)
 * forcera une convergence du format.
 *
 * Rôle futur :
 *   - Mapper les UIDs Gelato (ex "business_cards_pf_bx_pt_350-gsm-coated-silk_...")
 *     vers des slugs HM ("cartes-visite-premium")
 *   - Filtrer les print providers selon localisation EU/FR
 *   - Sélectionner les meilleurs formats par défaut (A4, A5, 85×55 mm…)
 */

import type { GelatoCatalogProduct } from "./types";

// ─── Catégories HM ↔ Catalogues Gelato ───────────────────────────────────────

export const HM_TO_GELATO_CATALOG: Record<string, string[]> = {
  "cartes-visite":   ["business-cards"],
  "flyers":          ["flyers"],
  "affiches":        ["posters", "wall-art"],   // wall-art si posters insuffisant
  "canvas":          ["canvas"],
  "stickers":        ["stickers"],
  "brochures":       ["accordion-fold-brochures", "folded-brochures"],
  "depliants":       ["folded-brochures"],
};

// ─── Helpers de filtrage ─────────────────────────────────────────────────────

/**
 * Parse un productUid Gelato pour extraire ses attributs lisibles.
 * Format typique : "business_cards_pf_bx_pt_350-gsm-coated-silk_cl_4-4_..."
 */
export function parseProductUid(uid: string): Record<string, string> {
  return { _raw: uid };
}

/**
 * Sélectionne les produits Gelato les plus représentatifs pour HM Global.
 * Privilégie : format A standard (A4/A5), papier 350g pour cartes, mat ou satiné.
 */
export function selectRepresentativeProducts(
  catalogUid: string,
  products: GelatoCatalogProduct[],
): GelatoCatalogProduct[] {
  if (products.length === 0) return [];

  if (catalogUid === "business-cards") {
    // Préférer 350gsm coated silk standard
    return products.filter((p) => {
      const uid = p.productUid.toLowerCase();
      return uid.includes("350-gsm") && !uid.includes("rounded");
    }).slice(0, 5);
  }

  if (catalogUid === "flyers") {
    // Préférer formats A et papier 170g couché
    return products.filter((p) => {
      const uid = p.productUid.toLowerCase();
      return /a4|a5|a6/.test(uid);
    }).slice(0, 8);
  }

  if (catalogUid === "posters") {
    return products.filter((p) => {
      const uid = p.productUid.toLowerCase();
      return /200-gsm|matte|satin/.test(uid);
    }).slice(0, 6);
  }

  return products.slice(0, 5);
}
