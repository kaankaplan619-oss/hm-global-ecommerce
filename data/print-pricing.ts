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

export type PrintFace = "recto" | "recto-verso";

/** Tarif d'une face donnée (UID Gelato + paliers qty→prix). */
interface FacePricing {
  gelatoUid: string;
  tiers:     PrintQtyPrice[];
}

interface DirectPrintPricing {
  /** UID Gelato (produits sans variante de faces : posters, toiles, invitations). */
  gelatoUid?:    string;
  /** Prix unitaire TTC (posters/toiles : prix = unitaire × quantité). */
  unitPriceTTC?: number;
  /** Paliers explicites (invitations : tarif non linéaire). */
  tiers?:        PrintQtyPrice[];
  /** Quantités proposées dans le sélecteur. */
  quantities?:   number[];
  /**
   * Tarif DÉPENDANT des faces (flyers : recto et recto-verso = UID + coûts
   * Gelato différents). Si présent, il est PRIORITAIRE sur gelatoUid/tiers.
   * Un produit peut ne proposer qu'une face (ex. A4 = recto-verso uniquement).
   */
  byFaces?: Partial<Record<PrintFace, FacePricing>>;
}

export const DIRECT_PRINT_PRICING: Record<string, DirectPrintPricing> = {
  // ── Flyers (Gelato 170 g couché silk · coûts relevés 2026-06-08 · ×2,2) ──
  // recto = 4-0, recto-verso = 4-4 → UID + coûts différents. A4 = R/V only.
  "flyer-a6": {
    byFaces: {
      "recto": {
        gelatoUid: "flyers_pf_a6_pt_170-gsm-coated-silk_cl_4-0_ver",
        tiers: [
          { quantity: 50, priceTTC: 31.90 }, { quantity: 100, priceTTC: 41.90 },
          { quantity: 250, priceTTC: 65.90 }, { quantity: 500, priceTTC: 89.90 },
          { quantity: 1000, priceTTC: 137.90 },
        ],
      },
      "recto-verso": {
        gelatoUid: "flyers_pf_a6_pt_170-gsm-coated-silk_cl_4-4_ver",
        tiers: [
          { quantity: 50, priceTTC: 33.90 }, { quantity: 100, priceTTC: 45.90 },
          { quantity: 250, priceTTC: 74.90 }, { quantity: 500, priceTTC: 104.90 },
          { quantity: 1000, priceTTC: 161.90 },
        ],
      },
    },
  },
  "flyer-a5": {
    byFaces: {
      "recto": {
        gelatoUid: "flyers_pf_a5_pt_170-gsm-coated-silk_cl_4-0_ver",
        tiers: [
          { quantity: 50, priceTTC: 41.90 }, { quantity: 100, priceTTC: 61.90 },
          { quantity: 250, priceTTC: 110.90 }, { quantity: 500, priceTTC: 185.90 },
          { quantity: 1000, priceTTC: 259.90 },
        ],
      },
      "recto-verso": {
        gelatoUid: "flyers_pf_a5_pt_170-gsm-coated-silk_cl_4-4_ver",
        tiers: [
          { quantity: 50, priceTTC: 45.90 }, { quantity: 100, priceTTC: 68.90 },
          { quantity: 250, priceTTC: 127.90 }, { quantity: 500, priceTTC: 218.90 },
          { quantity: 1000, priceTTC: 308.90 },
        ],
      },
    },
  },
  "flyer-a4": {
    byFaces: {
      "recto-verso": {
        gelatoUid: "flyers_pf_a4_pt_170-gsm-coated-silk_cl_4-4_ver",
        tiers: [
          { quantity: 50, priceTTC: 43.90 }, { quantity: 100, priceTTC: 72.90 },
          { quantity: 250, priceTTC: 147.90 }, { quantity: 500, priceTTC: 217.90 },
          { quantity: 1000, priceTTC: 372.90 },
        ],
      },
    },
  },
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
  // ── Invitations (paliers Gelato non linéaires · coûts relevés 2026-06-09) ──
  "card-a6": {
    gelatoUid: "cards_pf_a6_pt_350-gsm-coated-silk_cl_4-4_ver",
    quantities: [50, 100, 250],
    tiers: [
      { quantity: 50,  priceTTC: 23.90 },   // coût 10,80 € × 2,2
      { quantity: 100, priceTTC: 42.90 },   // coût 19,44 € × 2,2
      { quantity: 250, priceTTC: 106.90 },  // coût 48,60 € × 2,2
    ],
  },
  "card-square": {
    gelatoUid: "cards_pf_sq_pt_350-gsm-coated-silk_cl_4-4_hor",
    quantities: [50, 100, 250],
    tiers: [
      { quantity: 50,  priceTTC: 35.90 },   // coût 16,19 € × 2,2
      { quantity: 100, priceTTC: 64.90 },   // coût 29,17 € × 2,2
      { quantity: 250, priceTTC: 160.90 },  // coût 72,89 € × 2,2
    ],
  },
  "card-folded": {
    gelatoUid: "creased-cards_pf_a6_pt_300-gsm-coated-silk_cl_4-4_ft_crease-hor_hor",
    quantities: [50, 100, 250],
    tiers: [
      { quantity: 50,  priceTTC: 24.90 },   // coût 10,91 € × 2,2
      { quantity: 100, priceTTC: 42.90 },   // coût 19,26 € × 2,2
      { quantity: 250, priceTTC: 97.90 },   // coût 44,30 € × 2,2
    ],
  },
};

/** true si ce produit a la commande directe activée (prix Gelato baké). */
export function isPrintDirect(productId: string): boolean {
  return productId in DIRECT_PRINT_PRICING;
}

/** Faces commandables pour ce produit (ex. flyer-a4 = ["recto-verso"] seul). */
export function getPrintFacesAvailable(productId: string): PrintFace[] {
  const p = DIRECT_PRINT_PRICING[productId];
  if (!p?.byFaces) return [];
  return (Object.keys(p.byFaces) as PrintFace[]).filter((f) => p.byFaces![f]);
}

/** Normalise la face demandée vers une face réellement disponible. */
function resolveFace(p: DirectPrintPricing, faces?: PrintFace): FacePricing | null {
  if (!p.byFaces) return null;
  if (faces && p.byFaces[faces]) return p.byFaces[faces]!;
  // Repli : première face disponible (ex. A4 → recto-verso).
  const first = (Object.keys(p.byFaces) as PrintFace[]).find((f) => p.byFaces![f]);
  return first ? p.byFaces[first]! : null;
}

/**
 * Prix TTC pour (produit, quantité, faces). Retourne null si la combinaison
 * n'est pas autorisée — le serveur DOIT rejeter dans ce cas (anti-tampering).
 */
export function getPrintDirectPrice(productId: string, quantity: number, faces?: PrintFace): number | null {
  const p = DIRECT_PRINT_PRICING[productId];
  if (!p) return null;
  // Tarif dépendant des faces (flyers) — prioritaire.
  if (p.byFaces) {
    const fp = resolveFace(p, faces);
    const tier = fp?.tiers.find((t) => t.quantity === quantity);
    return tier ? tier.priceTTC : null;
  }
  if (p.tiers) {
    const tier = p.tiers.find((t) => t.quantity === quantity);
    return tier ? tier.priceTTC : null;
  }
  if (p.unitPriceTTC != null && p.quantities?.includes(quantity)) {
    return Math.round(p.unitPriceTTC * quantity * 100) / 100;
  }
  return null;
}

/** Liste { quantité, prix } proposée dans le sélecteur du configurateur. */
export function getPrintQtyOptions(productId: string, faces?: PrintFace): PrintQtyPrice[] {
  const p = DIRECT_PRINT_PRICING[productId];
  if (!p) return [];
  if (p.byFaces) {
    const fp = resolveFace(p, faces);
    return fp ? fp.tiers.map((t) => ({ quantity: t.quantity, priceTTC: t.priceTTC })) : [];
  }
  return (p.quantities ?? []).map((q) => ({ quantity: q, priceTTC: getPrintDirectPrice(productId, q) ?? 0 }));
}

/** UID Gelato pour la production (stocké dans printConfig pour le fulfillment). */
export function getPrintGelatoUid(productId: string, faces?: PrintFace): string | null {
  const p = DIRECT_PRINT_PRICING[productId];
  if (!p) return null;
  if (p.byFaces) return resolveFace(p, faces)?.gelatoUid ?? null;
  return p.gelatoUid ?? null;
}
