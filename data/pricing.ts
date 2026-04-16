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

// T-shirts base prices TTC
export const TSHIRT_PRICES = {
  // B&C TU01T / TW02T — produit d'appel
  appel: {
    dtf:      19.90,
    flex:     19.90,
    broderie: 25.90, // +6€ vs dtf
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
    dtf:      42.90,
    flex:     42.90,
    broderie: 52.90, // +10€
  },
  // B&C WU620 — hoodie
  hoodie: {
    dtf:      47.90,
    flex:     47.90,
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
