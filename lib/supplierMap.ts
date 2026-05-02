/**
 * lib/supplierMap.ts
 *
 * Résout les infos fournisseur d'un article à partir du snapshot produit
 * stocké dans order_items. Pas de DB, pas de réseau : logique pure.
 *
 * Priorité :
 *   1. product.supplierName + product.toptexRef / supplierRef du snapshot
 *   2. Lookup statique par référence produit (fallback)
 */

import type { SupplierInfo, SupplierName } from "@/types";

// ─── Lookup statique (fallback si snapshot incomplet) ─────────────────────────
// Clé = fragment de la référence produit (ex. "TU01T", "IB320", "WU620")
const STATIC_MAP: Record<string, Omit<SupplierInfo, "stockStatus">> = {
  // ── B&C via Falk & Ross ────────────────────────────────────────────────────
  TU01T: { supplier: "falkross", supplierLabel: "Falk & Ross", supplierReference: "CG-TU01T", supplierUrl: "https://www.falk-ross.eu/fr/" },
  TW02T: { supplier: "falkross", supplierLabel: "Falk & Ross", supplierReference: "CG-TW02T", supplierUrl: "https://www.falk-ross.eu/fr/" },
  TU03T: { supplier: "falkross", supplierLabel: "Falk & Ross", supplierReference: "CG-TU03T", supplierUrl: "https://www.falk-ross.eu/fr/" },
  WG004: { supplier: "falkross", supplierLabel: "Falk & Ross", supplierReference: "CG-WG004", supplierUrl: "https://www.falk-ross.eu/fr/" },
  WU620: { supplier: "falkross", supplierLabel: "Falk & Ross", supplierReference: "CG-WU620", supplierUrl: "https://www.falk-ross.eu/fr/" },
  JUI62: { supplier: "falkross", supplierLabel: "Falk & Ross", supplierReference: "CG-JUI62", supplierUrl: "https://www.falk-ross.eu/fr/" },
  JWI63: { supplier: "falkross", supplierLabel: "Falk & Ross", supplierReference: "CG-JWI63", supplierUrl: "https://www.falk-ross.eu/fr/" },
  // ── iDéal via TopTex ──────────────────────────────────────────────────────
  IB320: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB320", supplierUrl: "https://www.toptex.fr/ib320-t-shirt-homme-ideal190.html", estimatedPurchasePrice: 2.54 },
  IB321: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB321", supplierUrl: "https://www.toptex.fr/ib321-t-shirt-femme-ideal190.html", estimatedPurchasePrice: 2.54 },
  IB322: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB322", supplierUrl: "https://www.toptex.fr/", estimatedPurchasePrice: 2.54 },
  IB323: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB323", supplierUrl: "https://www.toptex.fr/ib323-t-shirt-lsl-unisexe-ideal190.html", estimatedPurchasePrice: 4.14 },
  IB400: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB400", supplierUrl: "https://www.toptex.fr/", estimatedPurchasePrice: 11.90 },
  IB401: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB401", supplierUrl: "https://www.toptex.fr/", estimatedPurchasePrice: 11.90 },
  IB402: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB402", supplierUrl: "https://www.toptex.fr/", estimatedPurchasePrice: 14.50 },
  IB403: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB403", supplierUrl: "https://www.toptex.fr/", estimatedPurchasePrice: 14.50 },
  // ── Kariban / polos TopTex ─────────────────────────────────────────────────
  K262:  { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "K262",  supplierUrl: "https://www.toptex.fr/k262-polo-jersey-mc-homme.html",  estimatedPurchasePrice: 6.90 },
  K256:  { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "K256",  supplierUrl: "https://www.toptex.fr/", estimatedPurchasePrice: 6.90 },
  K239:  { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "K239",  supplierUrl: "https://www.toptex.fr/", estimatedPurchasePrice: 7.50 },
  K240:  { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "K240",  supplierUrl: "https://www.toptex.fr/", estimatedPurchasePrice: 7.50 },
  // ── Native Spirit TopTex ───────────────────────────────────────────────────
  NS400: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "NS400", supplierUrl: "https://www.toptex.fr/" },
  NS401: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "NS401", supplierUrl: "https://www.toptex.fr/" },
  NS408: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "NS408", supplierUrl: "https://www.toptex.fr/" },
  // ── B&C softshells TopTex ─────────────────────────────────────────────────
  JUI62_toptex: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "CGJUI62", supplierUrl: "https://www.toptex.fr/" },
  // ── Polaires / doudounes TopTex ────────────────────────────────────────────
  IB900:  { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB900",  supplierUrl: "https://www.toptex.fr/" },
  IB6175: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB6175", supplierUrl: "https://www.toptex.fr/" },
  IB6176: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "IB6176", supplierUrl: "https://www.toptex.fr/" },
  WK904:  { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "WK904",  supplierUrl: "https://www.toptex.fr/" },
  // ── Casquettes K-up TopTex ────────────────────────────────────────────────
  KP157: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "KP157", supplierUrl: "https://www.toptex.fr/" },
  KP162: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "KP162", supplierUrl: "https://www.toptex.fr/" },
  KP165: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "KP165", supplierUrl: "https://www.toptex.fr/" },
  KP185: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "KP185", supplierUrl: "https://www.toptex.fr/" },
  // ── Kimood sacs TopTex ────────────────────────────────────────────────────
  KI0262: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "KI0262", supplierUrl: "https://www.toptex.fr/" },
  KI0252: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "KI0252", supplierUrl: "https://www.toptex.fr/" },
  KI0275: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "KI0275", supplierUrl: "https://www.toptex.fr/" },
  KI0274: { supplier: "toptex", supplierLabel: "TopTex", supplierReference: "KI0274", supplierUrl: "https://www.toptex.fr/" },
};

// ─── Résolution fournisseur ───────────────────────────────────────────────────

/**
 * Retourne les infos fournisseur pour un article commande.
 * Utilise en priorité les données du snapshot produit, puis le lookup statique.
 */
export function getSupplierInfo(product: {
  supplierName?: string;
  toptexRef?: string;
  toptexUrl?: string;
  supplierRef?: string;
  prixAchatHT?: number;
  reference?: string;
  shortName?: string;
}): SupplierInfo {
  const { supplierName, toptexRef, toptexUrl, supplierRef, prixAchatHT, reference } = product;

  // ── Via snapshot du produit ──────────────────────────────────────────────
  if (supplierName === "toptex") {
    const ref = toptexRef ?? supplierRef ?? "";
    return {
      supplier: "toptex",
      supplierLabel: "TopTex",
      supplierReference: ref,
      supplierUrl: toptexUrl ?? (ref ? `https://www.toptex.fr/search?q=${ref}` : "https://www.toptex.fr/"),
      estimatedPurchasePrice: prixAchatHT,
      stockStatus: "unknown",
    };
  }

  if (supplierName === "falk-ross") {
    const ref = supplierRef ?? toptexRef ?? "";
    return {
      supplier: "falkross",
      supplierLabel: "Falk & Ross",
      supplierReference: ref ? `CG-${ref}` : ref,
      supplierUrl: "https://www.falk-ross.eu/fr/",
      estimatedPurchasePrice: prixAchatHT,
      stockStatus: "unknown",
    };
  }

  // ── Lookup statique par fragment de référence ────────────────────────────
  if (reference) {
    // Extrait le code modèle depuis la référence (ex. "B&C WU620" → "WU620")
    const parts = reference.trim().split(/\s+/);
    const modelCode = parts[parts.length - 1].toUpperCase();
    const staticEntry = STATIC_MAP[modelCode];
    if (staticEntry) {
      return {
        ...staticEntry,
        estimatedPurchasePrice: staticEntry.estimatedPurchasePrice ?? prixAchatHT,
        stockStatus: "unknown",
      };
    }
  }

  // ── Fallback ─────────────────────────────────────────────────────────────
  return {
    supplier: "autre",
    supplierLabel: "Fournisseur non identifié",
    supplierReference: toptexRef ?? supplierRef ?? reference ?? "—",
    stockStatus: "unknown",
  };
}

// ─── Label fournisseur court (pour badges) ────────────────────────────────────
export function supplierBadge(supplier: SupplierName): string {
  switch (supplier) {
    case "toptex":     return "TopTex";
    case "falkross":   return "Falk&Ross";
    case "newwave":    return "New Wave";
    case "pixartprint":return "Pixart";
    case "interne":    return "Interne";
    default:           return "Autre";
  }
}
