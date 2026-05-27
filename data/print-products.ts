/**
 * data/print-products.ts
 *
 * Source de vérité pour les produits d'impression print HM Global.
 * Séparé de data/products.ts — ne pas mélanger textile et print.
 *
 * Tarification print :
 *   Le prix correspond au lot complet, PAS à un prix unitaire par exemplaire.
 *   Ex : 250 cartes à 34,90 € → total_ttc = 34,90 € (pas 34,90 × 250 = 8 725 €)
 *
 * Dans create-payment-intent :
 *   - order_items.quantity   = 1  (1 lot commandé)
 *   - order_items.total_ttc  = lotPriceTTC (ex: 34,90 €)
 *   - printConfig.quantity   = 250 (nombre d'exemplaires — affiché client + admin)
 */

// ─── Types print ──────────────────────────────────────────────────────────────

export type PrintFinish       = "mat" | "brillant" | "premium";
export type PrintFaces        = "recto" | "recto-verso";
export type PrintOrientation  = "landscape" | "portrait";
export type PrintCorners      = "standard" | "rounded";
// V1.1 (2026-05-27) : retrait 100 ex. (pas assez de marge sur petits volumes),
// ajout 2500 ex. (volume B2B utile pour les opés commerciales / agences /
// salons). 4 paliers cohérents avec les standards Pixartprinting / Print&Stat.
export type BusinessCardQty   = 250 | 500 | 1000 | 2500;

export interface PrintProductConfig {
  id:          string;
  name:        string;
  shortName:   string;
  format:      string;       // "85x55mm"
  description: string;
  gelatoProductUidBase: string; // préfixe UID Gelato — suffixe ajouté selon options
}

// ─── Tarifs cartes de visite — prix du LOT TTC ───────────────────────────────
// TVA 20 % incluse. Frais d'expédition confirmés au devis selon adresse.

// V1.1 (2026-05-27) — matrice tarifaire HM Global cartes de visite TTC.
// Dégressivité calée sur le marché B2B (Pixartprinting / Print&Stat / Vistaprint
// haute volumétrie) avec marge HM Global maintenue à chaque palier :
//   - Mat 250 → 1000 : -34% prix/unité (palier classique)
//   - 1000 → 2500   : -25% prix/unité (volume agence)
//   - Premium reste premium-only (350g→400g satiné velours, marge plus haute)
//
// Côté production V1, ces prix sont en mode "devis HM Global" (production
// après validation BAT manuel). En V2 quand Gelato API sera branché sur le
// checkout direct, le coût Gelato fournira un plancher → si Gelato < HM Global
// prix manuel, on garde HM Global (marge supérieure). Sinon on bascule sur
// Gelato pour rester compétitif.
const BASE_LOT_PRICES: Record<PrintFinish, Record<BusinessCardQty, number>> = {
  mat: {
    250:   34.90,   //  0.140 €/u
    500:   52.90,   //  0.106 €/u (-24%)
    1000:  79.90,   //  0.080 €/u (-25%)
    2500: 159.90,   //  0.064 €/u (-20%) — palier B2B volume
  },
  brillant: {
    250:   39.90,
    500:   58.90,
    1000:  89.90,
    2500: 179.90,
  },
  premium: {
    250:   49.90,
    500:   69.90,
    1000: 109.90,
    2500: 219.90,
  },
};

const FACES_SURCHARGE: Record<PrintFaces, number> = {
  "recto":       0,
  "recto-verso": 9.00,
};

const CORNERS_SURCHARGE: Record<PrintCorners, number> = {
  standard: 0,
  rounded:  5.00,
};

/**
 * Calcule le prix TTC du lot de cartes de visite.
 * Ce montant est le total de la commande — il n'est PAS multiplié par la quantité.
 */
export function getBusinessCardLotPrice(params: {
  finish:   PrintFinish;
  quantity: BusinessCardQty;
  faces:    PrintFaces;
  corners:  PrintCorners;
}): number {
  const base    = BASE_LOT_PRICES[params.finish][params.quantity];
  const faces   = FACES_SURCHARGE[params.faces];
  const corners = CORNERS_SURCHARGE[params.corners];
  return Math.round((base + faces + corners) * 100) / 100;
}

// ─── Config produit cartes de visite ─────────────────────────────────────────

export const BUSINESS_CARD_PRODUCT: PrintProductConfig = {
  id:          "business-card-85x55",
  name:        "Carte de visite 85×55 mm",
  shortName:   "Carte de visite",
  format:      "85x55mm",
  description: "Papier 350 g/m², finition mate, brillante ou premium. Coins standards ou arrondis. Recto seul ou recto-verso.",
  gelatoProductUidBase: "business_cards_85x55mm",
};

// Options disponibles pour le configurateur client
export const BUSINESS_CARD_OPTIONS = {
  orientations: [
    { value: "landscape" as PrintOrientation, label: "Paysage (horizontal)" },
    { value: "portrait"  as PrintOrientation, label: "Portrait (vertical)" },
  ],
  faces: [
    { value: "recto"        as PrintFaces, label: "Recto seul",    surcharge: 0 },
    { value: "recto-verso"  as PrintFaces, label: "Recto-verso",   surcharge: 9 },
  ],
  finishes: [
    { value: "mat"      as PrintFinish, label: "Mat",     description: "Surface douce, anti-reflet. Idéal pour l'écriture." },
    { value: "brillant" as PrintFinish, label: "Brillant", description: "Couleurs vives, finition lustrée." },
    { value: "premium"  as PrintFinish, label: "Premium",  description: "Satiné velours 400 g/m². Toucher haut de gamme." },
  ],
  corners: [
    { value: "standard" as PrintCorners, label: "Angles droits", surcharge: 0 },
    { value: "rounded"  as PrintCorners, label: "Coins arrondis", surcharge: 5 },
  ],
  quantities: [
    { value: 250  as BusinessCardQty, label: "250 ex." },
    { value: 500  as BusinessCardQty, label: "500 ex." },
    { value: 1000 as BusinessCardQty, label: "1 000 ex." },
    { value: 2500 as BusinessCardQty, label: "2 500 ex.", badge: "Volume B2B" },
  ],
} as const;

// Labels pour affichage admin et recap
export const PRINT_FINISH_LABELS: Record<PrintFinish, string> = {
  mat:      "Mat",
  brillant: "Brillant",
  premium:  "Premium (satiné velours)",
};

export const PRINT_FACES_LABELS: Record<PrintFaces, string> = {
  "recto":       "Recto seul",
  "recto-verso": "Recto-verso",
};

export const PRINT_CORNERS_LABELS: Record<PrintCorners, string> = {
  standard: "Angles droits",
  rounded:  "Coins arrondis",
};

export const PRINT_ORIENTATION_LABELS: Record<PrintOrientation, string> = {
  landscape: "Paysage",
  portrait:  "Portrait",
};

// ─── Lookup serveur — utilisé dans create-payment-intent ─────────────────────
// Clé = product.id envoyé depuis le panier.

export const PRINT_PRODUCTS_LOOKUP: Record<string, PrintProductConfig> = {
  [BUSINESS_CARD_PRODUCT.id]: BUSINESS_CARD_PRODUCT,
};
