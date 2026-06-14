/**
 * lib/fulfillment.ts — Circuit de production d'une commande.
 *
 * Détermine, pour une commande, par quel circuit chaque article est produit :
 *   - "printful"  : POD automatisé Printful (imprime ET expédie au client).
 *                   Gildan 5000/18000/18500, Bella 3001, casquettes flexfit/yupoong.
 *   - "printify"  : POD automatisé Printify (Textildruck Europa DE & co).
 *                   Produits présents UNIQUEMENT chez Printify (Comfort Colors
 *                   1717, Gildan 2400 LS, mug céramique EU…). ⚠️ certains
 *                   produits (gildan-5000…) sont dans le mapping Printify pour
 *                   les MOCKUPS mais restent fulfillés par Printful → exclusion
 *                   via isPrintfulProduct.
 *   - "gelato"    : POD automatisé Gelato (print : cartes de visite, flyers…).
 *   - "interne"   : produit à l'atelier HM Global (stock interne WG004,
 *                   Falk&Ross, TopTex) — Kaan imprime et expédie lui-même.
 *
 * Pur / sans dépendance serveur → importable côté client (admin).
 * Source de vérité unique pour l'affichage admin et la décision d'automatisation.
 */

import { isPrintfulProduct, getPrintfulVariantId } from "@/lib/printfulVariantMap";
import { PRINTIFY_V1_MAP, getPrintifyVariantId } from "@/lib/suppliers/printify/printify-v1-map";
import { ATELIER_QTY_THRESHOLD } from "@/data/pricing";
import type { OrderItem } from "@/types";

export type FulfillmentCircuit = "printful" | "printify" | "gelato" | "interne" | "mixte";

/**
 * Vrai si le produit est PRODUIT par Printify (POD automatisé Printify).
 * = présent dans le mapping Printify V1 ET non géré par Printful.
 * (gildan-5000 & co sont dans le mapping Printify pour les mockups mais
 * fulfillés par Printful — d'où l'exclusion isPrintfulProduct.)
 */
export function isPrintifyFulfilledProduct(productId: string | null | undefined): boolean {
  if (!productId) return false;
  return Boolean(PRINTIFY_V1_MAP[productId]) && !isPrintfulProduct(productId);
}

export interface MissingVariant {
  product: string;
  color: string;
  size: string;
}

export interface FulfillmentInfo {
  /** Circuit dominant de la commande (mixte si plusieurs). */
  circuit: FulfillmentCircuit;
  /** Libellé court FR du circuit. */
  label: string;
  /** Tous les articles passent par Printful. */
  allPrintful: boolean;
  /** Tous les articles passent par Printify. */
  allPrintify: boolean;
  /** Au moins un article Printful. */
  hasPrintful: boolean;
  /** Au moins un article Printify. */
  hasPrintify: boolean;
  /** Au moins un article Gelato (print). */
  hasGelato: boolean;
  /** Au moins un article produit à l'atelier. */
  hasInterne: boolean;
  /** Commande entièrement automatisée (Printful/Printify/Gelato, rien à l'atelier). */
  automated: boolean;
  printfulCount: number;
  printifyCount: number;
  interneCount: number;
  gelatoCount: number;
  /**
   * Articles Printful dont le variant (couleur+taille) n'est pas mappé
   * dans printfulVariantMap → la création du brouillon échouerait (422).
   */
  missingVariants: MissingVariant[];
  /** Articles Printify dont le variant n'est pas mappé. */
  printifyMissingVariants: MissingVariant[];
  /** Article Printful sans fichier logo uploadé. */
  printfulMissingLogo: boolean;
  /** Article Printify sans fichier logo uploadé. */
  printifyMissingLogo: boolean;
  /** La commande peut être envoyée automatiquement à Printful. */
  printfulReady: boolean;
  /** La commande peut être envoyée automatiquement à Printify. */
  printifyReady: boolean;
}

/** Circuit d'un article isolé. */
export function itemCircuit(item: OrderItem): "printful" | "printify" | "gelato" | "interne" {
  // Les articles print (cartes de visite…) portent un printConfig → Gelato.
  if (item.printConfig) return "gelato";
  // Produits Printify-only (Comfort Colors, Gildan 2400…) → Printify.
  if (isPrintifyFulfilledProduct(item.product.id)) return "printify";
  if (isPrintfulProduct(item.product.id)) {
    // Bascule atelier : à partir du seuil, le volume est produit en interne
    // (presse DTF HM Global) → coût plus bas, marge protégée sur le prix volume.
    // UNIQUEMENT pour les techniques que l'atelier sait faire (DTF/DTFlex/flex) :
    // la broderie reste chez Printful (pas de machine à broder en interne).
    const atelierTech =
      item.technique === "dtf" || item.technique === "dtflex" || item.technique === "flex";
    return item.quantity >= ATELIER_QTY_THRESHOLD && atelierTech ? "interne" : "printful";
  }
  return "interne";
}

// ── Classement depuis les lignes brutes DB (liste admin / dashboard) ─────────

export interface RawOrderItemRow {
  product_id?: string | null;
  product_snapshot?: { printConfig?: unknown } | null;
  quantity?: number | null;
  technique?: string | null;
}

export interface CircuitSummary {
  circuit: FulfillmentCircuit;
  /** Libellé court avec emoji pour badges admin. */
  badge: string;
  hasInterne: boolean;
  hasPrintful: boolean;
  hasPrintify: boolean;
  hasGelato: boolean;
  /** Tout est POD automatisé (rien à produire à l'atelier). */
  automated: boolean;
}

const BADGES: Record<FulfillmentCircuit, string> = {
  printful: "🤖 Printful",
  printify: "🤖 Printify",
  gelato:   "🤖 Gelato",
  interne:  "🖨️ Atelier",
  mixte:    "🖨️+🤖 Mixte",
};

function pickCircuit(flags: {
  hasPrintful: boolean;
  hasPrintify: boolean;
  hasGelato: boolean;
  hasInterne: boolean;
}): FulfillmentCircuit {
  const distinct = [flags.hasPrintful, flags.hasPrintify, flags.hasGelato, flags.hasInterne].filter(Boolean).length;
  if (distinct > 1) return "mixte";
  if (flags.hasPrintful) return "printful";
  if (flags.hasPrintify) return "printify";
  if (flags.hasGelato) return "gelato";
  return "interne";
}

/**
 * Variante légère de getFulfillmentInfo pour les lignes order_items brutes
 * (API admin) — même logique de circuit, sans exiger les objets mappés.
 */
export function classifyOrderRows(items: RawOrderItemRow[]): CircuitSummary {
  let hasPrintful = false;
  let hasPrintify = false;
  let hasGelato = false;
  let hasInterne = false;
  for (const it of items) {
    if (it.product_snapshot?.printConfig) hasGelato = true;
    else if (isPrintifyFulfilledProduct(it.product_id)) hasPrintify = true;
    else if (it.product_id && isPrintfulProduct(it.product_id)) {
      // Bascule atelier : gros volume DTF/DTFlex → produit en interne (cf itemCircuit).
      const atelierTech =
        it.technique === "dtf" || it.technique === "dtflex" || it.technique === "flex";
      if ((it.quantity ?? 1) >= ATELIER_QTY_THRESHOLD && atelierTech) hasInterne = true;
      else hasPrintful = true;
    } else hasInterne = true;
  }
  const circuit = pickCircuit({ hasPrintful, hasPrintify, hasGelato, hasInterne });
  return {
    circuit,
    badge: BADGES[circuit],
    hasInterne,
    hasPrintful,
    hasPrintify,
    hasGelato,
    automated: (hasPrintful || hasPrintify || hasGelato) && !hasInterne,
  };
}

const CIRCUIT_LABELS: Record<FulfillmentCircuit, string> = {
  printful: "Printful · POD automatisé",
  printify: "Printify · POD automatisé",
  gelato:   "Gelato · POD automatisé",
  interne:  "Atelier HM Global",
  mixte:    "Mixte (atelier + automatisé)",
};

export function getFulfillmentInfo(items: OrderItem[]): FulfillmentInfo {
  let printfulCount = 0;
  let printifyCount = 0;
  let interneCount = 0;
  let gelatoCount = 0;
  const missingVariants: MissingVariant[] = [];
  const printifyMissingVariants: MissingVariant[] = [];
  let printfulMissingLogo = false;
  let printifyMissingLogo = false;

  for (const item of items) {
    const circuit = itemCircuit(item);
    if (circuit === "printful") {
      printfulCount += 1;
      const variantId = getPrintfulVariantId(item.product.id, item.color.id, item.size);
      if (!variantId) {
        missingVariants.push({
          product: item.product.name ?? item.product.id,
          color:   item.color.label ?? item.color.id,
          size:    item.size,
        });
      }
      if (!item.logoFile?.url) printfulMissingLogo = true;
    } else if (circuit === "printify") {
      printifyCount += 1;
      const lookup = getPrintifyVariantId({
        productSlug: item.product.id,
        colorId:     item.color.id,
        size:        item.size,
      });
      if (!lookup.ok) {
        printifyMissingVariants.push({
          product: item.product.name ?? item.product.id,
          color:   item.color.label ?? item.color.id,
          size:    item.size,
        });
      }
      if (!item.logoFile?.url) printifyMissingLogo = true;
    } else if (circuit === "gelato") {
      gelatoCount += 1;
    } else {
      interneCount += 1;
    }
  }

  const hasPrintful = printfulCount > 0;
  const hasPrintify = printifyCount > 0;
  const hasGelato = gelatoCount > 0;
  const hasInterne = interneCount > 0;

  const circuit = pickCircuit({ hasPrintful, hasPrintify, hasGelato, hasInterne });
  const allPrintful = hasPrintful && !hasPrintify && !hasGelato && !hasInterne;
  const allPrintify = hasPrintify && !hasPrintful && !hasGelato && !hasInterne;

  return {
    circuit,
    label: CIRCUIT_LABELS[circuit],
    allPrintful,
    allPrintify,
    hasPrintful,
    hasPrintify,
    hasGelato,
    hasInterne,
    automated: (hasPrintful || hasPrintify || hasGelato) && !hasInterne,
    printfulCount,
    printifyCount,
    interneCount,
    gelatoCount,
    missingVariants,
    printifyMissingVariants,
    printfulMissingLogo,
    printifyMissingLogo,
    printfulReady: allPrintful && missingVariants.length === 0 && !printfulMissingLogo,
    printifyReady: allPrintify && printifyMissingVariants.length === 0 && !printifyMissingLogo,
  };
}
