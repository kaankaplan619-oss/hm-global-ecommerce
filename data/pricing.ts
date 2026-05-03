import type { PricingConfig } from "@/types";

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

// Gildan 5000 — Printful POD (DTF uniquement, 24.90€ TTC coeur)
export const GILDAN_5000_PRICES = {
  dtf:      24.90,
  flex:     0,
  broderie: 0,
} as const;

// T-shirts base prices TTC
export const TSHIRT_PRICES = {
  // B&C TU01T / TW02T — produit d'appel
  appel: {
    dtf:      16.99,
    flex:     17.49,
    broderie: 22.99,
  },
  // B&C TU03T — meilleur rapport qualité/prix
  standard: {
    dtf:      24.90,
    flex:     24.90,
    broderie: 30.90,
  },
} as const;

// Hoodies base prices TTC
export const HOODIE_PRICES = {
  // B&C WG004 — sweat col rond
  sweat: {
    dtf:      44.90,
    flex:     44.90,
    broderie: 52.90, // +10€
  },
  // B&C WU620 — hoodie
  hoodie: {
    dtf:      49.90,
    flex:     49.90,
    broderie: 57.90,
  },
} as const;

// Softshells base prices TTC
export const SOFTSHELL_PRICES = {
  // B&C JUI62 / JWI63
  standard: {
    dtf:      79.90,
    flex:     79.90,
    broderie: 91.90, // +12€
  },
} as const;

// Polos base prices TTC — flex & broderie only (no DTF on piqué)
export const POLO_PRICES = {
  // Kariban K262 — polo jersey entrée de gamme
  jersey: {
    dtf:      0,      // non disponible
    flex:     24.90,
    broderie: 27.90,
  },
  // Kariban K256 — polo manches longues
  longues: {
    dtf:      0,
    flex:     27.90,
    broderie: 32.90,
  },
  // Kariban K239 / K240 — polo piqué classique
  pique: {
    dtf:      0,
    flex:     24.90,
    broderie: 29.90,
  },
} as const;

// Polaires / doudounes base prices TTC — flex & broderie only
export const POLAIRE_PRICES = {
  // iDeal IB900 — polaire légère
  legere: {
    dtf:      0,
    flex:     32.90,
    broderie: 37.90,
  },
  // iDeal IB6175 / IB6176 — doudoune
  doudoune: {
    dtf:      0,
    flex:     52.90,
    broderie: 62.90,
  },
  // WK WK904 — micropolaire éco
  eco: {
    dtf:      0,
    flex:     47.90,
    broderie: 57.90,
  },
} as const;

// Sweats iDeal / Native Spirit prices TTC
export const SWEAT_IDEAL_PRICES = {
  // iDeal IB400 — sweat col rond
  colRond: {
    dtf:      34.90,
    flex:     32.90,
    broderie: 42.90,
  },
  // iDeal IB402 — hoodie
  hoodie: {
    dtf:      39.90,
    flex:     37.90,
    broderie: 47.90,
  },
  // Native Spirit NS400 — sweat éco
  ecoSweat: {
    dtf:      34.90,
    flex:     29.90,
    broderie: 42.90,
  },
  // Native Spirit NS401 — hoodie éco
  ecoHoodie: {
    dtf:      44.90,
    flex:     38.90,
    broderie: 52.90,
  },
  // Native Spirit NS408 — hoodie oversize
  oversize: {
    dtf:      64.90,
    flex:     59.90,
    broderie: 0, // non disponible
  },
} as const;

// T-shirts iDeal Basic Brand prices TTC
export const TSHIRT_IDEAL_PRICES = {
  // IB320/321/322 — 190g
  base: {
    dtf:      19.90,
    flex:     19.90,
    broderie: 19.90,
  },
  // IB323 — manches longues
  longues: {
    dtf:      19.90,
    flex:     17.90,
    broderie: 24.90,
  },
} as const;

// Casquettes base prices TTC — broderie uniquement
export const CASQUETTE_PRICES = {
  // KP157 — entrée de gamme
  entreeGamme: {
    dtf:      0,
    flex:     0,
    broderie: 12.90,
  },
  // KP162 — coton épais
  standard: {
    dtf:      0,
    flex:     0,
    broderie: 13.90,
  },
  // KP165 — vintage
  vintage: {
    dtf:      0,
    flex:     0,
    broderie: 17.90,
  },
  // KP185 — sandwich contrasté
  sandwich: {
    dtf:      0,
    flex:     0,
    broderie: 14.90,
  },
} as const;

// Sacs & tote bags base prices TTC — DTF & flex uniquement
export const SAC_PRICES = {
  // KI0262 — tote bag coton bio
  toteBio: {
    dtf:      10.90,
    flex:     9.90,
    broderie: 0, // non disponible
  },
  // KI0252 — sac cabas coton bio
  cabasBio: {
    dtf:      10.90,
    flex:     9.90,
    broderie: 0,
  },
  // KI0275 — sac bicolore
  bicolore: {
    dtf:      11.90,
    flex:     10.90,
    broderie: 0,
  },
  // KI0274 — sac jute
  jute: {
    dtf:      11.90,
    flex:     10.90,
    broderie: 0,
  },
} as const;

// ─── Placement surcharges TTC ─────────────────────────────────────────────────
// Pour DTF / Flex : le cœur+dos est une vraie valeur ajoutée → prix additionnel
// Pour broderie : pas d'avantage, prix croissants

export const PLACEMENT_SURCHARGES: Record<
  "dtf" | "flex" | "broderie",
  Record<"coeur" | "dos" | "coeur-dos", number>
> = {
  dtf: {
    coeur:     0,
    dos:       0,
    "coeur-dos": 6.00,  // +6€ pour coeur+dos
  },
  flex: {
    coeur:     0,
    dos:       0,
    "coeur-dos": 6.00,
  },
  broderie: {
    coeur:     0,
    dos:       4.00,   // dos = +4€
    "coeur-dos": 14.00, // coeur+dos = +14€ (pas d'avantage)
  },
};

// ─── Compute item price TTC ───────────────────────────────────────────────────
export function computeUnitPrice(params: {
  basePrice: number;      // base TTC selon technique
  technique: "dtf" | "flex" | "broderie";
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
