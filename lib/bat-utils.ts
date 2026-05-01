/**
 * bat-utils.ts — Types, labels et buildBATData pour le Bon À Tirer V1.
 *
 * Aucune dépendance externe. Tout ce fichier est isomorphique (pas de `window`).
 * Le rendu et l'impression sont gérés côté client dans BATModal.tsx.
 */

import type { Technique, Placement, ProductColor, ProductCategory, Product, LogoEffect, LogoPlacementTransform } from "@/types";

// ── Re-export for backward compatibility ───────────────────────────────────────
export type { LogoPlacementTransform } from "@/types";

export interface BATData {
  // Produit
  productId:        string;
  productName:      string;
  productReference: string;
  productCategory:  ProductCategory;
  supplierName?:    string;
  composition:      string;
  weight:           string;
  // Configuration choisie
  color:            ProductColor | null;
  size:             string;
  quantity:         number;
  technique:        Technique;
  placement:        Placement;
  // Logo
  logoFileName:     string | null;
  logoEffect:       LogoEffect;
  logoTransform:    LogoPlacementTransform | null; // position Fabric.js au moment du BAT
  // Visuels (URLs pour le rendu React)
  imageUrl:         string;
  logoUrl:          string | null;   // URL Supabase (prioritaire) ou blob URL local, ou null
  // Méta
  batRef:           string;          // ex. "BAT-IB320-20260429"
  generatedAt:      string;          // date formatée "29/04/2026"
}

// ── Labels ────────────────────────────────────────────────────────────────────

export const TECHNIQUE_LABELS: Record<Technique, string> = {
  dtf:      "Impression DTF",
  flex:     "Flocage Flex",
  broderie: "Broderie",
};

export const PLACEMENT_LABELS: Record<Placement, string> = {
  coeur:      "Cœur (poitrine gauche)",
  dos:        "Dos (centré haut)",
  "coeur-dos":"Cœur + Dos",
};

export const LOGO_EFFECT_LABELS: Record<LogoEffect, string> = {
  none:           "Aucun",
  "white-outline":"Contour blanc",
  "white-bg":     "Fond blanc",
};

export const CATEGORY_LABELS: Partial<Record<ProductCategory, string>> = {
  tshirts:    "T-shirt",
  hoodies:    "Hoodie / Sweat",
  softshells: "Softshell",
  polos:      "Polo",
  polaires:   "Polaire",
  casquettes: "Casquette",
  sacs:       "Sac",
  enfants:    "Enfant",
};

export const SUPPLIER_LABELS: Record<string, string> = {
  "falk-ross": "B&C Collection",
  "toptex":    "iDeal / Toptex",
};

// ── Fonctions utilitaires ─────────────────────────────────────────────────────

export function formatDate(d: Date = new Date()): string {
  return d.toLocaleDateString("fr-FR", {
    day:   "2-digit",
    month: "2-digit",
    year:  "numeric",
  });
}

function buildBATRef(productRef: string, date: Date = new Date()): string {
  const ref = productRef.replace(/\s+/g, "-").toUpperCase();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `BAT-${ref}-${ymd}`;
}

// ── buildBATData ──────────────────────────────────────────────────────────────

export function buildBATData(
  product:       Product,
  color:         ProductColor | null,
  size:          string,
  quantity:      number,
  technique:     Technique,
  placement:     Placement,
  logoFile:      File | null,
  logoEffect:    LogoEffect,
  imageUrl:      string,
  logoUrl:       string | null,
  logoTransform: LogoPlacementTransform | null,
): BATData {
  const now = new Date();
  return {
    productId:        product.id,
    productName:      product.name,
    productReference: product.reference,
    productCategory:  product.category,
    supplierName:     product.supplierName,
    composition:      product.composition,
    weight:           product.weight,
    color,
    size,
    quantity,
    technique,
    placement,
    logoFileName:     logoFile?.name ?? null,
    logoEffect,
    logoTransform,
    imageUrl,
    logoUrl,
    batRef:           buildBATRef(product.reference, now),
    generatedAt:      formatDate(now),
  };
}
