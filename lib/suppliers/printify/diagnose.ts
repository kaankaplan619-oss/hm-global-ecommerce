/**
 * lib/suppliers/printify/diagnose.ts
 *
 * Helper de diagnostic — pour un CartItem (ou ses champs essentiels),
 * retourne tout le mapping Printify nécessaire à une future création de commande,
 * sans rien créer côté Printify.
 *
 * Utilisé par /api/printify/diagnose (route de test) et — plus tard — par la
 * route admin "Envoyer chez Printify" (V2).
 *
 * Aucune dépendance Stripe / Supabase / réseau Printify.
 */

import { getPrintifyVariantId } from "./printify-v1-map";
import {
  isPrintifyV1Product,
  getPrintifyColorIdForHM,
  HM_TO_PRINTIFY_COLOR,
} from "./printify-colors";

// ─── Type d'entrée minimal (subset d'un CartItem) ────────────────────────────

export interface DiagnoseInput {
  productSlug: string;       // ex "hoodie-gildan-18500" (slug HM) OU "gildan-18500" (id HM)
  productId?:  string;        // ex "gildan-18500" (alternative au slug)
  colorId:     string;        // HM colorId, ex "noir"
  size:        string;        // ex "L"
  technique?:  string;        // ex "dtf" | "dtflex" | "broderie" | "broderie_illimitee"
  placement?:  string;        // ex "coeur" | "dos" | "coeur-dos"
  quantity?:   number;        // ex 1
  logoFile?: {
    name?: string;
    url?:  string;            // URL Supabase publique du fichier d'impression
    path?: string;
    type?: string;
  };
}

// ─── Sortie ──────────────────────────────────────────────────────────────────

export interface DiagnoseResult {
  status: "ready" | "incomplete";
  /** Vrai si tous les champs nécessaires à une commande Printify sont présents */
  readyForPrintify: boolean;
  /** Détails de la résolution Printify */
  printify: {
    productId:           string | null;     // id HM
    isPrintifyV1Product: boolean;
    blueprintId:         number | null;
    preferredProviderId: number | null;
    fallbackProviders:   number[];
    printifyColorId:     string | null;     // ex "noir" (mapping HM → Printify)
    printifyColorName:   string | null;     // ex "Black" (libellé Printify)
    variantId:           number | null;
  };
  /** Données panier d'origine */
  cartItem: {
    productSlug: string;
    productId:   string | null;
    colorId:     string;
    size:        string;
    technique:   string | null;
    placement:   string | null;
    quantity:    number;
    logoFileUrl: string | null;
    logoFileName: string | null;
  };
  /** Liste des champs manquants pour passer à "ready" */
  missing: string[];
  /** Note explicative humainement lisible */
  notes: string[];
}

// ─── Résolution slug → productId HM ──────────────────────────────────────────
//
// Le mapping Printify utilise les IDs HM (gildan-5000, bella-3001, etc.),
// pas les slugs (tshirt-gildan-heavy-cotton). On accepte les deux en entrée.

const SLUG_TO_ID: Record<string, string> = {
  "tshirt-gildan-heavy-cotton":        "gildan-5000",
  "tshirt-bella-canvas-3001":          "bella-3001",
  "tshirt-comfort-colors-heavyweight": "comfort-colors-1717",
  "tshirt-gildan-long-sleeve":         "gildan-2400-ls",
  "sweat-gildan-18000":                "gildan-18000",
  "hoodie-gildan-18500":               "gildan-18500",
};

function resolveProductId(input: DiagnoseInput): string | null {
  if (input.productId) return input.productId;
  if (HM_TO_PRINTIFY_COLOR[input.productSlug]) return input.productSlug;
  return SLUG_TO_ID[input.productSlug] ?? null;
}

// ─── API publique ────────────────────────────────────────────────────────────

export function diagnoseCartItem(input: DiagnoseInput): DiagnoseResult {
  const missing: string[] = [];
  const notes:   string[] = [];

  // Champs panier essentiels
  if (!input.colorId)  missing.push("colorId");
  if (!input.size)     missing.push("size");
  if (!input.technique) missing.push("technique");
  if (!input.placement) missing.push("placement");
  if (!input.quantity || input.quantity < 1) missing.push("quantity");
  if (!input.logoFile?.url) missing.push("logoFile.url (URL publique du fichier d'impression)");

  const productId = resolveProductId(input);
  if (!productId) {
    missing.push("productId résoluble depuis productSlug");
    notes.push(`Slug "${input.productSlug}" inconnu — ajouter au mapping SLUG_TO_ID dans diagnose.ts.`);
  }

  const isPrintifyV1 = productId ? isPrintifyV1Product(productId) : false;
  if (productId && !isPrintifyV1) {
    notes.push(`Produit "${productId}" n'est pas dans le périmètre Printify V1 (lib/suppliers/printify/printify-v1-map.ts). Pas de commande automatique possible — passer par devis ou Printful manuel.`);
  }

  const printifyColorId = productId ? getPrintifyColorIdForHM(productId, input.colorId) : null;
  if (productId && isPrintifyV1 && !printifyColorId) {
    missing.push("printifyColorId (alias HM colorId → Printify)");
    notes.push(`Couleur "${input.colorId}" non mappée pour ce produit dans printify-colors.ts.`);
  }

  // Lookup variant_id
  let variantId: number | null = null;
  let blueprintId: number | null = null;
  let preferredProviderId: number | null = null;
  let fallbackProviders: number[] = [];
  let printifyColorName: string | null = null;

  if (productId && isPrintifyV1 && printifyColorId && input.size) {
    const lookup = getPrintifyVariantId({
      productSlug: productId,     // dans printify-v1-map, la clé est l'id HM
      colorId:     printifyColorId,
      size:        input.size,
    });
    if (lookup.ok) {
      variantId           = lookup.variantId;
      blueprintId         = lookup.blueprintId;
      preferredProviderId = lookup.preferredProvider;
      fallbackProviders   = lookup.fallbackProviders;
      printifyColorName   = lookup.printifyColorName;
    } else {
      missing.push(`variant_id Printify (${lookup.error})`);
      notes.push(`getPrintifyVariantId a échoué : ${lookup.message}`);
    }
  }

  const ready = missing.length === 0;
  if (ready) {
    notes.push("Toutes les données sont prêtes pour créer une commande Printify (draft, confirm: false).");
  }

  return {
    status: ready ? "ready" : "incomplete",
    readyForPrintify: ready,
    printify: {
      productId,
      isPrintifyV1Product: isPrintifyV1,
      blueprintId,
      preferredProviderId,
      fallbackProviders,
      printifyColorId,
      printifyColorName,
      variantId,
    },
    cartItem: {
      productSlug: input.productSlug,
      productId,
      colorId:     input.colorId,
      size:        input.size,
      technique:   input.technique ?? null,
      placement:   input.placement ?? null,
      quantity:    input.quantity ?? 0,
      logoFileUrl:  input.logoFile?.url  ?? null,
      logoFileName: input.logoFile?.name ?? null,
    },
    missing,
    notes,
  };
}

// ─── Helper : diagnostic en batch (pour une commande multi-items) ───────────

export function diagnoseOrder(items: DiagnoseInput[]): {
  itemsCount:   number;
  readyCount:   number;
  incompleteCount: number;
  results:      DiagnoseResult[];
  globalStatus: "ready" | "partial" | "incomplete";
} {
  const results = items.map(diagnoseCartItem);
  const readyCount = results.filter((r) => r.status === "ready").length;
  const incompleteCount = results.length - readyCount;
  let globalStatus: "ready" | "partial" | "incomplete";
  if (readyCount === results.length) globalStatus = "ready";
  else if (readyCount === 0)         globalStatus = "incomplete";
  else                                globalStatus = "partial";

  return {
    itemsCount:   results.length,
    readyCount,
    incompleteCount,
    results,
    globalStatus,
  };
}
