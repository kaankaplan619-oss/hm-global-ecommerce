/**
 * lib/fulfillment.ts — Circuit de production d'une commande.
 *
 * Détermine, pour une commande, par quel circuit chaque article est produit :
 *   - "printful" : POD automatisé Printful (imprime ET expédie au client).
 *                  Gildan 5000/18000/18500, Bella 3001, casquettes flexfit/yupoong.
 *   - "gelato"   : POD automatisé Gelato (print : cartes de visite, flyers…).
 *   - "interne"  : produit à l'atelier HM Global (stock interne WG004,
 *                  Falk&Ross, TopTex) — Kaan imprime et expédie lui-même.
 *
 * Pur / sans dépendance serveur → importable côté client (admin).
 * Source de vérité unique pour l'affichage admin et la décision d'automatisation.
 */

import { isPrintfulProduct, getPrintfulVariantId } from "@/lib/printfulVariantMap";
import type { OrderItem } from "@/types";

export type FulfillmentCircuit = "printful" | "gelato" | "interne" | "mixte";

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
  /** Au moins un article Printful. */
  hasPrintful: boolean;
  /** Au moins un article Gelato (print). */
  hasGelato: boolean;
  /** Au moins un article produit à l'atelier. */
  hasInterne: boolean;
  /** Commande entièrement automatisée (Printful et/ou Gelato, rien à l'atelier). */
  automated: boolean;
  printfulCount: number;
  interneCount: number;
  gelatoCount: number;
  /**
   * Articles Printful dont le variant (couleur+taille) n'est pas mappé
   * dans printfulVariantMap → la création du brouillon échouerait (422).
   * Sert à prévenir l'admin AVANT de cliquer.
   */
  missingVariants: MissingVariant[];
  /** Article Printful sans fichier logo uploadé. */
  printfulMissingLogo: boolean;
  /**
   * La commande peut être envoyée automatiquement à Printful :
   * tous les articles sont Printful, chacun a un variant mappé et un logo.
   */
  printfulReady: boolean;
}

/** Circuit d'un article isolé. */
function itemCircuit(item: OrderItem): "printful" | "gelato" | "interne" {
  // Les articles print (cartes de visite…) portent un printConfig → Gelato.
  if (item.printConfig) return "gelato";
  if (isPrintfulProduct(item.product.id)) return "printful";
  return "interne";
}

// ── Classement depuis les lignes brutes DB (liste admin / dashboard) ─────────

export interface RawOrderItemRow {
  product_id?: string | null;
  product_snapshot?: { printConfig?: unknown } | null;
}

export interface CircuitSummary {
  circuit: FulfillmentCircuit;
  /** Libellé court avec emoji pour badges admin. */
  badge: string;
  hasInterne: boolean;
  hasPrintful: boolean;
  hasGelato: boolean;
  /** Tout est POD automatisé (rien à produire à l'atelier). */
  automated: boolean;
}

/**
 * Variante légère de getFulfillmentInfo pour les lignes order_items brutes
 * (API admin) — même logique de circuit, sans exiger les objets mappés.
 */
export function classifyOrderRows(items: RawOrderItemRow[]): CircuitSummary {
  let hasPrintful = false;
  let hasGelato = false;
  let hasInterne = false;
  for (const it of items) {
    if (it.product_snapshot?.printConfig) hasGelato = true;
    else if (it.product_id && isPrintfulProduct(it.product_id)) hasPrintful = true;
    else hasInterne = true;
  }
  const distinct = [hasPrintful, hasGelato, hasInterne].filter(Boolean).length;
  const circuit: FulfillmentCircuit =
    distinct > 1 ? "mixte" : hasPrintful ? "printful" : hasGelato ? "gelato" : "interne";
  const BADGES: Record<FulfillmentCircuit, string> = {
    printful: "🤖 Printful",
    gelato:   "🤖 Gelato",
    interne:  "🖨️ Atelier",
    mixte:    "🖨️+🤖 Mixte",
  };
  return {
    circuit,
    badge: BADGES[circuit],
    hasInterne,
    hasPrintful,
    hasGelato,
    automated: (hasPrintful || hasGelato) && !hasInterne,
  };
}

const CIRCUIT_LABELS: Record<FulfillmentCircuit, string> = {
  printful: "Printful · POD automatisé",
  gelato:   "Gelato · POD automatisé",
  interne:  "Atelier HM Global",
  mixte:    "Mixte (atelier + automatisé)",
};

export function getFulfillmentInfo(items: OrderItem[]): FulfillmentInfo {
  let printfulCount = 0;
  let interneCount = 0;
  let gelatoCount = 0;
  const missingVariants: MissingVariant[] = [];
  let printfulMissingLogo = false;

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
    } else if (circuit === "gelato") {
      gelatoCount += 1;
    } else {
      interneCount += 1;
    }
  }

  const hasPrintful = printfulCount > 0;
  const hasGelato = gelatoCount > 0;
  const hasInterne = interneCount > 0;
  const distinct = [hasPrintful, hasGelato, hasInterne].filter(Boolean).length;

  let circuit: FulfillmentCircuit;
  if (distinct > 1) circuit = "mixte";
  else if (hasPrintful) circuit = "printful";
  else if (hasGelato) circuit = "gelato";
  else circuit = "interne";

  const allPrintful = hasPrintful && !hasGelato && !hasInterne;

  return {
    circuit,
    label: CIRCUIT_LABELS[circuit],
    allPrintful,
    hasPrintful,
    hasGelato,
    hasInterne,
    automated: (hasPrintful || hasGelato) && !hasInterne,
    printfulCount,
    interneCount,
    gelatoCount,
    missingVariants,
    printfulMissingLogo,
    printfulReady: allPrintful && missingVariants.length === 0 && !printfulMissingLogo,
  };
}
