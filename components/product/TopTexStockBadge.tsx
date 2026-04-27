"use client";

import { useTopTexStock } from "@/hooks/useTopTexStock";

interface Props {
  toptexRef: string;
  /** Afficher le prix d'achat HT (réservé admin) */
  showPrice?: boolean;
}

/**
 * Badge de disponibilité TopTex en temps réel.
 * S'affiche sur les fiches produit et en admin.
 *
 * - Chargement : pulse gris
 * - En stock    : pastille verte + "En stock"
 * - Rupture     : pastille rouge + "Rupture de stock"
 * - Erreur      : affiché silencieusement (rien)
 */
export default function TopTexStockBadge({ toptexRef, showPrice = false }: Props) {
  const { stock, status } = useTopTexStock(toptexRef);

  if (status === "idle" || status === "error") return null;

  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-1 text-[11px] font-medium text-[var(--hm-text-soft)]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
        Vérification stock…
      </span>
    );
  }

  if (!stock) return null;

  // Three states:
  // 1. inStock = true                        → "En stock" (green)
  // 2. inStock = false + basePriceHT = null  → "Stock à confirmer" (amber) — partial/unreliable data
  // 3. inStock = false + basePriceHT != null → "Rupture de stock" (red) — confirmed 0 units
  const isInStock  = stock.inStock;
  const isUnknown  = !stock.inStock && stock.basePriceHT === null;

  const styles = isInStock
    ? { borderColor: "rgb(187 247 208)", background: "rgb(240 253 244)", color: "rgb(22 101 52)" }
    : isUnknown
    ? { borderColor: "rgb(253 230 138)", background: "rgb(255 251 235)", color: "rgb(146 64 14)" }
    : { borderColor: "rgb(254 202 202)", background: "rgb(254 242 242)", color: "rgb(153 27 27)" };

  const dotClass = isInStock ? "bg-green-500" : isUnknown ? "bg-amber-400" : "bg-red-500";
  const label    = isInStock ? "En stock" : isUnknown ? "Stock à confirmer" : "Rupture de stock";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
      style={styles}
    >
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      {label}
      {showPrice && stock.basePriceHT != null && (
        <span className="ml-1 font-normal opacity-70">
          · {stock.basePriceHT.toFixed(2)} € HT
        </span>
      )}
    </span>
  );
}
