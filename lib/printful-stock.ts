/**
 * lib/printful-stock.ts — Vérification de disponibilité Printful en temps réel.
 *
 * Problème résolu (Kaan, 2026-06-11) : le mapping variants est un instantané —
 * si un article passe en rupture chez Printful APRÈS l'audit, le client
 * pourrait payer un produit non livrable (→ email d'excuse + remboursement).
 * Ce helper interroge l'API catalogue Printful (endpoint public, pas de clé)
 * juste avant l'encaissement et bloque le paiement si un article du panier
 * est en rupture région EU.
 *
 * - Cache serveur 15 min (Next fetch revalidate) : un seul appel Printful
 *   par produit par quart d'heure, quel que soit le trafic.
 * - FAIL-OPEN : si l'API Printful est injoignable (panne, timeout), on ne
 *   bloque PAS la vente — le brouillon admin détectera le problème ensuite.
 *   Bloquer tout le checkout sur une panne tierce serait pire que le risque.
 *
 * Server-only (fetch + revalidate) — ne pas importer côté client.
 */

import {
  getPrintfulVariantId,
  isPrintfulProduct,
  PRINTFUL_PRODUCT_IDS,
} from "@/lib/printfulVariantMap";

export interface StockCheckItem {
  productId:  string;
  colorId:    string;
  colorLabel: string;
  size:       string;
}

export interface UnavailableItem {
  productId:  string;
  colorLabel: string;
  size:       string;
  reason:     "variant_inconnu" | "rupture_eu";
}

interface PrintfulCatalogVariant {
  id: number;
  availability_status?: { region: string; status: string }[];
}

/** Un variant est livrable si au moins une région EU est in_stock. */
function isEuInStock(variant: PrintfulCatalogVariant): boolean {
  return (variant.availability_status ?? []).some(
    (a) => a.region.startsWith("EU") && a.status === "in_stock",
  );
}

/** Fetch catalogue Printful avec cache 15 min. Lève en cas d'échec réseau. */
async function fetchCatalogVariants(catalogId: number): Promise<Map<number, PrintfulCatalogVariant>> {
  const res = await fetch(`https://api.printful.com/products/${catalogId}`, {
    headers: { "User-Agent": "hm-global-agence/1.0" },
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`Printful catalog ${catalogId}: HTTP ${res.status}`);
  const data = await res.json();
  const variants: PrintfulCatalogVariant[] = data?.result?.variants ?? [];
  return new Map(variants.map((v) => [v.id, v]));
}

/**
 * Vérifie la disponibilité EU des articles Printful d'un panier.
 * Les articles non-Printful (atelier interne, print Gelato) sont ignorés.
 *
 * @returns ok=true si tout est livrable (ou si l'API Printful est en panne —
 *          fail-open). `unavailable` liste les articles à retirer du panier.
 */
export async function checkPrintfulAvailability(
  items: StockCheckItem[],
): Promise<{ ok: boolean; unavailable: UnavailableItem[] }> {
  const printfulItems = items.filter((i) => isPrintfulProduct(i.productId));
  if (printfulItems.length === 0) return { ok: true, unavailable: [] };

  const unavailable: UnavailableItem[] = [];

  // Un fetch par produit catalogue distinct (déduplication + cache 15 min).
  const catalogIds = [...new Set(printfulItems.map((i) => PRINTFUL_PRODUCT_IDS[i.productId]))];
  let catalogs: Map<number, Map<number, PrintfulCatalogVariant>>;
  try {
    const fetched = await Promise.all(catalogIds.map(async (cid) => [cid, await fetchCatalogVariants(cid)] as const));
    catalogs = new Map(fetched);
  } catch (err) {
    console.error("[printful-stock] API catalogue injoignable — fail-open:", err);
    return { ok: true, unavailable: [] };
  }

  for (const item of printfulItems) {
    const variantId = getPrintfulVariantId(item.productId, item.colorId, item.size);
    if (!variantId) {
      // Combinaison hors mapping = jamais vendable (ne devrait pas arriver si
      // data/products.ts est aligné, mais on couvre les paniers persistés
      // d'avant un changement de gamme).
      unavailable.push({ productId: item.productId, colorLabel: item.colorLabel, size: item.size, reason: "variant_inconnu" });
      continue;
    }
    const catalog = catalogs.get(PRINTFUL_PRODUCT_IDS[item.productId]);
    const variant = catalog?.get(variantId);
    if (!variant || !isEuInStock(variant)) {
      unavailable.push({ productId: item.productId, colorLabel: item.colorLabel, size: item.size, reason: "rupture_eu" });
    }
  }

  return { ok: unavailable.length === 0, unavailable };
}
