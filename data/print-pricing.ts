/**
 * data/print-pricing.ts
 *
 * Source de vérité UNIQUE des prix "commande directe" print (posters, toiles,
 * invitations). Utilisée à la fois :
 *   - côté client (configurateur) pour AFFICHER le prix selon la quantité ;
 *   - côté serveur (create-payment-intent) pour REVALIDER le prix — on ne fait
 *     jamais confiance au montant envoyé par le navigateur (Stripe LIVE).
 *
 * Modèle de prix (validé avec Kaan 2026-06-08) :
 *   prix TTC = coût Gelato réel × 2,2, arrondi à X,90 €.
 *   Le port Gelato est ajouté au checkout (pas inclus ici).
 *
 * Périmètre direct = uniquement les formats à correspondance EXACTE dans le
 * catalogue Gelato (POD à l'unité, compétitif). Les flyers et formats sans
 * équivalent Gelato exact restent "sur devis" (cf data/print-catalogue).
 *
 * Coûts Gelato relevés le 2026-06-08 (FR / EUR, hors port). Si Gelato change
 * ses tarifs, re-sonder et réajuster (ces prix sont volontairement "bakés" et
 * non live, pour la sécurité et la stabilité d'un store en production).
 */

export interface PrintQtyPrice {
  quantity: number;
  priceTTC: number;
}

interface DirectPrintPricing {
  gelatoUid:     string;
  /** Prix unitaire TTC (posters/toiles : prix = unitaire × quantité). */
  unitPriceTTC?: number;
  /** Paliers explicites (invitations : tarif non linéaire). */
  tiers?:        PrintQtyPrice[];
  /** Quantités proposées dans le sélecteur. */
  quantities:    number[];
}

export const DIRECT_PRINT_PRICING: Record<string, DirectPrintPricing> = {
  // ── Posters (POD à l'unité, prix linéaire) ──
  "poster-50x70": {
    gelatoUid: "large-posters_pf_500x700-mm_pt_170-gsm-coated-silk_cl_4-0_ver",
    unitPriceTTC: 18.90,           // coût 8,51 € × 2,2
    quantities: [1, 2, 3, 5, 10],
  },
  // ── Toiles canvas (POD à l'unité, prix linéaire) ──
  "canvas-30x40": {
    gelatoUid: "canvas_300x400-mm-12x16-inch_canvas_wood-fsc-thick_4-0_hor",
    unitPriceTTC: 67.90,           // coût 30,49 € × 2,2
    quantities: [1, 2, 3],
  },
  "canvas-40x60": {
    gelatoUid: "canvas_s_product_cf_400x600-mm_cm_canvas_cthck_wood-fsc-slim_cl_4-0_hor",
    unitPriceTTC: 75.90,           // coût 34,09 € × 2,2
    quantities: [1, 2, 3],
  },
  "canvas-50x50": {
    gelatoUid: "canvas_s_product_cf_500x500-mm_cm_canvas_cthck_wood-fsc-slim_cl_4-0_hor",
    unitPriceTTC: 76.90,           // coût 34,79 € × 2,2
    quantities: [1, 2, 3],
  },
  // ── Invitations A6 (paliers Gelato non linéaires) ──
  "card-a6": {
    gelatoUid: "cards_pf_a6_pt_350-gsm-coated-silk_cl_4-4_ver",
    quantities: [50, 100, 250],
    tiers: [
      { quantity: 50,  priceTTC: 23.90 },   // coût 10,80 € × 2,2
      { quantity: 100, priceTTC: 42.90 },   // coût 19,44 € × 2,2
      { quantity: 250, priceTTC: 106.90 },  // coût 48,60 € × 2,2
    ],
  },
};

/** true si ce produit a la commande directe activée (prix Gelato baké). */
export function isPrintDirect(productId: string): boolean {
  return productId in DIRECT_PRINT_PRICING;
}

/**
 * Prix TTC pour (produit, quantité). Retourne null si la combinaison n'est pas
 * autorisée — le serveur DOIT rejeter dans ce cas (anti-tampering).
 */
export function getPrintDirectPrice(productId: string, quantity: number): number | null {
  const p = DIRECT_PRINT_PRICING[productId];
  if (!p) return null;
  if (p.tiers) {
    const tier = p.tiers.find((t) => t.quantity === quantity);
    return tier ? tier.priceTTC : null;
  }
  if (p.unitPriceTTC != null && p.quantities.includes(quantity)) {
    return Math.round(p.unitPriceTTC * quantity * 100) / 100;
  }
  return null;
}

/** Liste { quantité, prix } proposée dans le sélecteur du configurateur. */
export function getPrintQtyOptions(productId: string): PrintQtyPrice[] {
  const p = DIRECT_PRINT_PRICING[productId];
  if (!p) return [];
  return p.quantities.map((q) => ({ quantity: q, priceTTC: getPrintDirectPrice(productId, q) ?? 0 }));
}

/** UID Gelato pour la production (stocké dans printConfig pour le fulfillment). */
export function getPrintGelatoUid(productId: string): string | null {
  return DIRECT_PRINT_PRICING[productId]?.gelatoUid ?? null;
}
