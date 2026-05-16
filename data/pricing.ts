import type { PricingConfig, VolumePricingTier } from "@/types";

// ─── Global Config ────────────────────────────────────────────────────────────
export const PRICING_CONFIG: PricingConfig = {
  tvaRate: 0.20,
  freeShippingThreshold: 10, // nb pièces
  shippingCost: 8.90,
  bulkThreshold: 10,
  bulkLabel: "Livraison offerte dès 10 pièces",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function htToTtc(ht: number): number {
  return Math.round(ht * (1 + PRICING_CONFIG.tvaRate) * 100) / 100;
}

export function ttcToHt(ttc: number): number {
  return Math.round((ttc / (1 + PRICING_CONFIG.tvaRate)) * 100) / 100;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(price);
}

// ─── Pricing matrix ───────────────────────────────────────────────────────────
// Tous les prix sont en TTC

// Gildan 5000 — Printful POD (DTF uniquement)
// V1 lancement : prix d'acquisition marché — marge ~4,72 € HT / cœur seul
// V2 après test marché : dtf → 22.49 (cœur), surcharge coeur-dos → 7.41 (→ 29.90)
export const GILDAN_5000_PRICES = {
  dtf:                19.90,  // cœur seul TTC — coût Printful 7.50 € → marge ~10.33 € HT
  dtflex:             21.90,  // coût Printful 9.00 €
  flex:               0,
  broderie:           24.90,  // coût Printful 9.90 € → marge ~12.50 € HT
  broderie_illimitee: 28.90,  // coût Printful 13.80 € → marge ~12.58 € HT
} as const;

// ─── Gildan 5000 — Volume pricing tiers (Printful remises progressives) ───────
// Remises Printful : 25 pcs → -8% | 50 pcs → -18% | 100 pcs → -22%
//                   200 pcs → -27% | 500 pcs → -29%
// Prix HM (TTC) = coût Printful × multiplicateur → prix arrondi au centime

export const GILDAN_5000_DTF_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 19.90 },
  { from: 25,  to: 49,  unitPrice: 18.30 }, // -8%
  { from: 50,  to: 99,  unitPrice: 16.30 }, // -18%
  { from: 100, to: 199, unitPrice: 15.50 }, // -22%
  { from: 200, to: 499, unitPrice: 14.50 }, // -27%
  { from: 500,          unitPrice: 14.10 }, // -29%
];

export const GILDAN_5000_DTFLEX_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 21.90 },
  { from: 25,  to: 49,  unitPrice: 20.10 }, // -8%
  { from: 50,  to: 99,  unitPrice: 17.90 }, // -18%
  { from: 100, to: 199, unitPrice: 17.10 }, // -22%
  { from: 200, to: 499, unitPrice: 16.00 }, // -27%
  { from: 500,          unitPrice: 15.50 }, // -29%
];

export const GILDAN_5000_BRODERIE_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 24.90 },
  { from: 25,  to: 49,  unitPrice: 22.90 }, // -8%
  { from: 50,  to: 99,  unitPrice: 20.40 }, // -18%
  { from: 100, to: 199, unitPrice: 19.40 }, // -22%
  { from: 200, to: 499, unitPrice: 18.20 }, // -27%
  { from: 500,          unitPrice: 17.70 }, // -29%
];

export const GILDAN_5000_BRODERIE_ILLIMITEE_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 28.90 },
  { from: 25,  to: 49,  unitPrice: 26.60 }, // -8%
  { from: 50,  to: 99,  unitPrice: 23.70 }, // -18%
  { from: 100, to: 199, unitPrice: 22.50 }, // -22%
  { from: 200, to: 499, unitPrice: 21.10 }, // -27%
  { from: 500,          unitPrice: 20.50 }, // -29%
];

// Surcharges placement spécifiques Gildan 5000 (différentes de la table globale)
// cœur seul : +0 → 19.90 TTC (DTF) / 24.90 TTC (broderie)
// cœur + dos : DTF +10.00 → 29.90 TTC · broderie : surcharge globale (+14.00)
export const GILDAN_5000_PLACEMENT_SURCHARGES = {
  coeur:       0,
  dos:         0,
  "coeur-dos": 10.00,  // 19.90 + 10.00 = 29.90 TTC (DTF)
} as const;

// T-shirts base prices TTC
export const TSHIRT_PRICES = {
  // B&C TU01T / TW02T — produit d'appel
  appel: {
    dtf:      16.99,
    dtflex:   18.49,
    flex:     17.49,
    broderie: 22.99,
  },
  // B&C TU03T — meilleur rapport qualité/prix
  standard: {
    dtf:      24.90,
    dtflex:   26.90,
    flex:     24.90,
    broderie: 30.90,
  },
} as const;

// Hoodies base prices TTC
export const HOODIE_PRICES = {
  // B&C WG004 — sweat col rond
  sweat: {
    dtf:      44.90,
    dtflex:   46.90,
    flex:     44.90,
    broderie: 52.90, // +10€
  },
  // B&C WU620 — hoodie
  hoodie: {
    dtf:      49.90,
    dtflex:   51.90,
    flex:     49.90,
    broderie: 57.90,
  },
} as const;

// Softshells base prices TTC
export const SOFTSHELL_PRICES = {
  // B&C JUI62 / JWI63
  standard: {
    dtf:      79.90,
    dtflex:   81.90,
    flex:     79.90,
    broderie: 91.90, // +12€
  },
} as const;

// Polos base prices TTC — flex & broderie only (no DTF on piqué)
export const POLO_PRICES = {
  // Kariban K262 — polo jersey entrée de gamme
  jersey: {
    dtf:      0,      // non disponible
    dtflex:   0,
    flex:     24.90,
    broderie: 27.90,
  },
  // Kariban K256 — polo manches longues
  longues: {
    dtf:      0,
    dtflex:   0,
    flex:     27.90,
    broderie: 32.90,
  },
  // Kariban K239 / K240 — polo piqué classique
  pique: {
    dtf:      0,
    dtflex:   0,
    flex:     24.90,
    broderie: 29.90,
  },
} as const;

// Polaires / doudounes base prices TTC — flex & broderie only
export const POLAIRE_PRICES = {
  // iDeal IB900 — polaire légère
  legere: {
    dtf:      0,
    dtflex:   0,
    flex:     32.90,
    broderie: 37.90,
  },
  // iDeal IB6175 / IB6176 — doudoune
  doudoune: {
    dtf:      0,
    dtflex:   0,
    flex:     52.90,
    broderie: 62.90,
  },
  // WK WK904 — micropolaire éco
  eco: {
    dtf:      0,
    dtflex:   0,
    flex:     47.90,
    broderie: 57.90,
  },
} as const;

// Sweats iDeal / Native Spirit prices TTC
export const SWEAT_IDEAL_PRICES = {
  // iDeal IB400 — sweat col rond
  colRond: {
    dtf:      34.90,
    dtflex:   36.90,
    flex:     32.90,
    broderie: 42.90,
  },
  // iDeal IB402 — hoodie
  hoodie: {
    dtf:      39.90,
    dtflex:   41.90,
    flex:     37.90,
    broderie: 47.90,
  },
  // Native Spirit NS400 — sweat éco
  ecoSweat: {
    dtf:      34.90,
    dtflex:   36.90,
    flex:     29.90,
    broderie: 42.90,
  },
  // Native Spirit NS401 — hoodie éco
  ecoHoodie: {
    dtf:      44.90,
    dtflex:   46.90,
    flex:     38.90,
    broderie: 52.90,
  },
  // Native Spirit NS408 — hoodie oversize
  oversize: {
    dtf:      64.90,
    dtflex:   66.90,
    flex:     59.90,
    broderie: 0, // non disponible
  },
} as const;

// T-shirts iDeal Basic Brand prices TTC
export const TSHIRT_IDEAL_PRICES = {
  // IB320/321/322 — 190g
  base: {
    dtf:      19.90,
    dtflex:   21.90,
    flex:     19.90,
    broderie: 19.90,
  },
  // IB323 — manches longues
  longues: {
    dtf:      19.90,
    dtflex:   21.90,
    flex:     17.90,
    broderie: 24.90,
  },
} as const;

// Casquettes base prices TTC — broderie uniquement
export const CASQUETTE_PRICES = {
  // KP157 — entrée de gamme
  entreeGamme: {
    dtf:      0,
    dtflex:   0,
    flex:     0,
    broderie: 12.90,
  },
  // KP162 — coton épais
  standard: {
    dtf:      0,
    dtflex:   0,
    flex:     0,
    broderie: 13.90,
  },
  // KP165 — vintage
  vintage: {
    dtf:      0,
    dtflex:   0,
    flex:     0,
    broderie: 17.90,
  },
  // KP185 — sandwich contrasté
  sandwich: {
    dtf:      0,
    dtflex:   0,
    flex:     0,
    broderie: 14.90,
  },
} as const;

// Sacs & tote bags base prices TTC — DTF & flex uniquement
export const SAC_PRICES = {
  // KI0262 — tote bag coton bio
  toteBio: {
    dtf:      10.90,
    dtflex:   11.90,
    flex:     9.90,
    broderie: 0, // non disponible
  },
  // KI0252 — sac cabas coton bio
  cabasBio: {
    dtf:      10.90,
    dtflex:   11.90,
    flex:     9.90,
    broderie: 0,
  },
  // KI0275 — sac bicolore
  bicolore: {
    dtf:      11.90,
    dtflex:   12.90,
    flex:     10.90,
    broderie: 0,
  },
  // KI0274 — sac jute
  jute: {
    dtf:      11.90,
    dtflex:   12.90,
    flex:     10.90,
    broderie: 0,
  },
} as const;

// ─── Placement surcharges TTC ─────────────────────────────────────────────────
// Pour DTF / Flex : le cœur+dos est une vraie valeur ajoutée → prix additionnel
// Pour broderie : pas d'avantage, prix croissants

export const PLACEMENT_SURCHARGES: Record<
  "dtf" | "dtflex" | "flex" | "broderie" | "broderie_illimitee",
  Record<"coeur" | "dos" | "coeur-dos", number>
> = {
  dtf: {
    coeur:     0,
    dos:       0,
    "coeur-dos": 6.00,  // +6€ pour coeur+dos
  },
  dtflex: {
    coeur:     0,
    dos:       0,
    "coeur-dos": 6.00,
  },
  flex: {
    coeur:     0,
    dos:       0,
    "coeur-dos": 6.00,
  },
  broderie: {
    coeur:     0,
    dos:       4.00,   // dos = +4€
    "coeur-dos": 14.00, // coeur+dos = +14€
  },
  broderie_illimitee: {
    coeur:     0,
    dos:       4.00,
    "coeur-dos": 14.00,
  },
};

// ─── Bella+Canvas 3001 — Printful POD ────────────────────────────────────────
// T-shirt premium jersey 145 g/m² — ring-spun peigné, coupe fashion, 84 couleurs
// Coûts Printful RÉELS TTC (audit) :
//   DTG 12.30 € | DTFlex 13.80 € | Broderie 13.80 € | Broderie illim. 17.70 € (+3.90)
// V2 — prix abaissés de 7 € : 10 pcs = 229 € (vs 299 € avant)
// Marge HT : DTG ~8.83 € | DTFlex ~9.25 € | Broderie ~11.75 € | Illim. ~11.83 €
export const BELLA_3001_PRICES = {
  dtf:                22.90,  // coût Printful 12.30 € → marge 8.83 € HT
  dtflex:             24.90,  // coût Printful 13.80 € → marge 9.25 € HT
  flex:               0,      // non disponible via Printful
  broderie:           27.90,  // coût Printful 13.80 € (même que DTFlex) → 11.75 € HT
  broderie_illimitee: 31.90,  // coût Printful 17.70 € (+3.90) → 11.83 € HT
} as const;

export const BELLA_3001_PLACEMENT_SURCHARGES = {
  coeur:       0,
  dos:         0,
  "coeur-dos": 5.00,  // cœur+dos : +5 € (ex. DTG cœur 22.90 → cœur+dos 27.90)
} as const;

// Bella+Canvas 3001 — Volume pricing tiers CORRIGÉS (remises Printful réelles)
// Remises Printful Bella+Canvas : 25 pcs -13% | 50 pcs -21% | 100 pcs -27% | 200 pcs -30% | 500 pcs -32%
export const BELLA_3001_DTF_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 22.90 }, // Printful 12.30 €
  { from: 25,  to: 49,  unitPrice: 19.90 }, // -13% Printful → 10.70 €
  { from: 50,  to: 99,  unitPrice: 17.90 }, // -21% Printful →  9.72 €
  { from: 100, to: 199, unitPrice: 16.90 }, // -27% Printful →  8.98 €
  { from: 200, to: 499, unitPrice: 15.90 }, // -30% Printful →  8.62 €
  { from: 500,          unitPrice: 14.90 }, // -32% Printful →  8.36 €
];

export const BELLA_3001_DTFLEX_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 24.90 }, // Printful 13.80 €
  { from: 25,  to: 49,  unitPrice: 21.90 }, // -13% Printful → 12.00 €
  { from: 50,  to: 99,  unitPrice: 19.90 }, // -21% Printful → 10.91 €
  { from: 100, to: 199, unitPrice: 18.90 }, // -27% Printful → 10.07 €
  { from: 200, to: 499, unitPrice: 17.90 }, // -30% Printful →  9.66 €
  { from: 500,          unitPrice: 16.90 }, // -32% Printful →  9.38 €
];

export const BELLA_3001_BRODERIE_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 27.90 }, // Printful 13.80 €
  { from: 25,  to: 49,  unitPrice: 25.90 }, // -13% Printful → 12.00 €
  { from: 50,  to: 99,  unitPrice: 23.90 }, // -21% Printful → 10.91 €
  { from: 100, to: 199, unitPrice: 21.90 }, // -27% Printful → 10.07 €
  { from: 200, to: 499, unitPrice: 20.90 }, // -30% Printful →  9.66 €
  { from: 500,          unitPrice: 19.90 }, // -32% Printful →  9.38 €
];

export const BELLA_3001_BRODERIE_ILLIMITEE_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 31.90 }, // Printful 17.70 €
  { from: 25,  to: 49,  unitPrice: 29.90 }, // -13% Printful → 15.90 €
  { from: 50,  to: 99,  unitPrice: 27.90 }, // -21% Printful → 14.81 €
  { from: 100, to: 199, unitPrice: 25.90 }, // -27% Printful → 13.97 €
  { from: 200, to: 499, unitPrice: 24.90 }, // -30% Printful → 13.56 €
  { from: 500,          unitPrice: 23.90 }, // -32% Printful → 13.28 €
];

// ─── Gildan 18000 — Printful POD (DTG + DTFlex + Broderie) ───────────────────
// Sweatshirt col rond 271 g/m² — 25 couleurs — S à 5XL
// Coûts Printful TTC : DTG 17.40 € | DTFlex 18.90 € | Broderie 19.80 € | Illim. 23.70 €
// Remises : 25 pcs -8% | 50 pcs -16% | 100 pcs -23% | 200 pcs -32% | 500 pcs -38%
export const GILDAN_18000_PRICES = {
  dtf:                39.90,  // coût 17.40 € → marge 18.75 € HT
  dtflex:             41.90,  // coût 18.90 € → marge 19.17 € HT
  flex:               0,
  broderie:           46.90,  // coût 19.80 € → marge 22.58 € HT
  broderie_illimitee: 50.90,  // coût 23.70 € → marge 22.67 € HT
} as const;

export const GILDAN_18000_PLACEMENT_SURCHARGES = {
  coeur:       0,
  dos:         0,
  "coeur-dos": 6.00,  // 39.90 + 6.00 = 45.90 TTC (DTG)
} as const;

export const GILDAN_18000_DTG_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 39.90 }, // Printful 17.40 €
  { from: 25,  to: 49,  unitPrice: 36.90 }, // -8%  Printful 16.01 €
  { from: 50,  to: 99,  unitPrice: 33.90 }, // -16% Printful 14.62 €
  { from: 100, to: 199, unitPrice: 30.90 }, // -23% Printful 13.39 €
  { from: 200, to: 499, unitPrice: 27.90 }, // -32% Printful 11.83 €
  { from: 500,          unitPrice: 24.90 }, // -38% Printful 10.79 €
];

export const GILDAN_18000_DTFLEX_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 41.90 }, // Printful 18.90 €
  { from: 25,  to: 49,  unitPrice: 38.90 }, // -8%  Printful 17.39 €
  { from: 50,  to: 99,  unitPrice: 35.90 }, // -16% Printful 15.88 €
  { from: 100, to: 199, unitPrice: 32.90 }, // -23% Printful 14.56 €
  { from: 200, to: 499, unitPrice: 28.90 }, // -32% Printful 12.85 €
  { from: 500,          unitPrice: 25.90 }, // -38% Printful 11.72 €
];

export const GILDAN_18000_BRODERIE_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 46.90 }, // Printful 19.80 €
  { from: 25,  to: 49,  unitPrice: 43.90 }, // -8%  Printful 18.22 €
  { from: 50,  to: 99,  unitPrice: 39.90 }, // -16% Printful 16.63 €
  { from: 100, to: 199, unitPrice: 36.90 }, // -23% Printful 15.25 €
  { from: 200, to: 499, unitPrice: 31.90 }, // -32% Printful 13.46 €
  { from: 500,          unitPrice: 28.90 }, // -38% Printful 12.28 €
];

export const GILDAN_18000_BRODERIE_ILLIMITEE_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 50.90 }, // Printful 23.70 €
  { from: 25,  to: 49,  unitPrice: 46.90 }, // -8%  Printful 21.80 €
  { from: 50,  to: 99,  unitPrice: 42.90 }, // -16% Printful 19.91 €
  { from: 100, to: 199, unitPrice: 39.90 }, // -23% Printful 18.25 €
  { from: 200, to: 499, unitPrice: 34.90 }, // -32% Printful 16.12 €
  { from: 500,          unitPrice: 31.90 }, // -38% Printful 14.69 €
];

// ─── Gildan 18500 — Printful POD (DTG + DTFlex + Broderie) ───────────────────
// Hoodie à capuche 271 g/m² — 26 couleurs — S à 5XL
// Coûts Printful TTC : DTG 22.74 € | DTFlex 24.24 € | Broderie 25.14 € | Illim. 29.04 €
// Remises : 25 pcs -9% | 50 pcs -16% | 100 pcs -23% | 200 pcs -34% | 500 pcs -38%
export const GILDAN_18500_PRICES = {
  dtf:                49.90,  // coût 22.74 € → marge 22.63 € HT
  dtflex:             51.90,  // coût 24.24 € → marge 23.05 € HT
  flex:               0,
  broderie:           56.90,  // coût 25.14 € → marge 26.47 € HT
  broderie_illimitee: 60.90,  // coût 29.04 € → marge 26.55 € HT
} as const;

export const GILDAN_18500_PLACEMENT_SURCHARGES = {
  coeur:       0,
  dos:         0,
  "coeur-dos": 6.00,  // 49.90 + 6.00 = 55.90 TTC (DTG)
} as const;

export const GILDAN_18500_DTG_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 49.90 }, // Printful 22.74 €
  { from: 25,  to: 49,  unitPrice: 45.90 }, // -9%  Printful 20.69 €
  { from: 50,  to: 99,  unitPrice: 41.90 }, // -16% Printful 19.10 €
  { from: 100, to: 199, unitPrice: 38.90 }, // -23% Printful 17.51 €
  { from: 200, to: 499, unitPrice: 32.90 }, // -34% Printful 15.01 €
  { from: 500,          unitPrice: 30.90 }, // -38% Printful 14.10 €
];

export const GILDAN_18500_DTFLEX_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 51.90 }, // Printful 24.24 €
  { from: 25,  to: 49,  unitPrice: 47.90 }, // -9%  Printful 22.06 €
  { from: 50,  to: 99,  unitPrice: 43.90 }, // -16% Printful 20.36 €
  { from: 100, to: 199, unitPrice: 39.90 }, // -23% Printful 18.66 €
  { from: 200, to: 499, unitPrice: 34.90 }, // -34% Printful 16.00 €
  { from: 500,          unitPrice: 31.90 }, // -38% Printful 15.02 €
];

export const GILDAN_18500_BRODERIE_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 56.90 }, // Printful 25.14 €
  { from: 25,  to: 49,  unitPrice: 51.90 }, // -9%  Printful 22.87 €
  { from: 50,  to: 99,  unitPrice: 47.90 }, // -16% Printful 21.12 €
  { from: 100, to: 199, unitPrice: 43.90 }, // -23% Printful 19.36 €
  { from: 200, to: 499, unitPrice: 37.90 }, // -34% Printful 16.60 €
  { from: 500,          unitPrice: 34.90 }, // -38% Printful 15.59 €
];

export const GILDAN_18500_BRODERIE_ILLIMITEE_VOLUME: VolumePricingTier[] = [
  { from: 1,   to: 24,  unitPrice: 60.90 }, // Printful 29.04 €
  { from: 25,  to: 49,  unitPrice: 55.90 }, // -9%  Printful 26.43 €
  { from: 50,  to: 99,  unitPrice: 51.90 }, // -16% Printful 24.39 €
  { from: 100, to: 199, unitPrice: 46.90 }, // -23% Printful 22.36 €
  { from: 200, to: 499, unitPrice: 39.90 }, // -34% Printful 19.17 €
  { from: 500,          unitPrice: 37.90 }, // -38% Printful 17.95 €
];

// ─── Compute item price TTC ───────────────────────────────────────────────────
export function computeUnitPrice(params: {
  basePrice: number;      // base TTC selon technique
  technique: "dtf" | "dtflex" | "flex" | "broderie" | "broderie_illimitee";
  placement: "coeur" | "dos" | "coeur-dos";
}): number {
  const { basePrice, technique, placement } = params;
  const surcharge = PLACEMENT_SURCHARGES[technique][placement];
  return Math.round((basePrice + surcharge) * 100) / 100;
}

export function computeCartTotals(params: {
  items: { unitPrice: number; quantity: number }[];
}) {
  const subtotalTTC = params.items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const totalQty = params.items.reduce((acc, item) => acc + item.quantity, 0);
  const freeShipping = totalQty >= PRICING_CONFIG.freeShippingThreshold;
  const shipping = freeShipping ? 0 : PRICING_CONFIG.shippingCost;
  const totalTTC = subtotalTTC + shipping;
  // TVA is calculated on product subtotal only — shipping is not subject to TVA display
  const subtotalHT = Math.round((subtotalTTC / (1 + PRICING_CONFIG.tvaRate)) * 100) / 100;
  const tva = Math.round((subtotalTTC - subtotalHT) * 100) / 100;

  return {
    subtotalTTC: Math.round(subtotalTTC * 100) / 100,
    subtotalHT,
    tva,
    shipping,
    totalTTC: Math.round(totalTTC * 100) / 100,
    freeShipping,
    totalItems: totalQty,
  };
}

// ─── Spreadshirt — Tarification dégressive ────────────────────────────────────
// Prix de base Spreadshirt (coût interne) :
//   Gildan T-shirt classique : 10,99 € HT
//   Sweat à capuche unisexe AWDis : 30,99 €
// Marge HM appliquée sur palier — prix TTC client final.

export const SPREADSHIRT_GILDAN_TSHIRT_VOLUME: VolumePricingTier[] = [
  { from: 10, to: 24,  unitPrice: 19.90 },
  { from: 25, to: 49,  unitPrice: 17.90 },
  { from: 50, to: 99,  unitPrice: 15.90 },
  { from: 100,         unitPrice: 13.90 },
];

// Broderie volume — coût Spreadshirt broderie ~14 € HT, marge progressive
// +5 € TTC par palier vs DTF pour finition premium
export const SPREADSHIRT_GILDAN_TSHIRT_BRODERIE_VOLUME: VolumePricingTier[] = [
  { from: 10, to: 24,  unitPrice: 24.90 },
  { from: 25, to: 49,  unitPrice: 22.90 },
  { from: 50, to: 99,  unitPrice: 20.90 },
  { from: 100,         unitPrice: 18.90 },
];

export const SPREADSHIRT_HOODIE_VOLUME: VolumePricingTier[] = [
  { from: 10, to: 24,  unitPrice: 44.90 },
  { from: 25, to: 49,  unitPrice: 41.90 },
  { from: 50, to: 99,  unitPrice: 38.90 },
  { from: 100,         unitPrice: 35.90 },
];

// ─── Mug blanc 11 oz — Printful sublimation ──────────────────────────────────
// Coût Printful TTC : ~5.50 € | Marge HT cible : 12–14 €
export const MUG_11OZ_PRICES = {
  dtf:    19.90,  // sublimation pleine couleur (mapped to dtf)
  dtflex: 0,
  flex:   0,
  broderie: 0,
} as const;

export const MUG_11OZ_PLACEMENT_SURCHARGES = {
  coeur:        0,
  dos:          0,
  "coeur-dos":  0,
} as const;

// Remises Printful mugs : -15% à 10 pcs, -25% à 25 pcs
export const MUG_11OZ_DTF_VOLUME: VolumePricingTier[] = [
  { from: 1,  to: 9,  unitPrice: 19.90 },
  { from: 10, to: 24, unitPrice: 16.90 }, // -15%
  { from: 25,         unitPrice: 14.90 }, // -25%
];

/**
 * Retourne le prix unitaire TTC selon le palier de quantité.
 * Renvoie le prix du premier palier si quantité inférieure au minimum.
 */
export function getVolumePricedRate(
  volumePricing: VolumePricingTier[],
  quantity: number
): number {
  const sorted = [...volumePricing].sort((a, b) => a.from - b.from);
  let active = sorted[0];
  for (const tier of sorted) {
    if (quantity >= tier.from) active = tier;
  }
  return active.unitPrice;
}
