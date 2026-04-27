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

  const isInStock = stock.inStock;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
      style={{
        borderColor: isInStock ? "rgb(187 247 208)" : "rgb(254 202 202)",
        background: isInStock ? "rgb(240 253 244)" : "rgb(254 242 242)",
        color:      isInStock ? "rgb(22 101 52)"   : "rgb(153 27 27)",
      }}
    >
      <span
        className={`h-2 w-2 rounded-full ${isInStock ? "bg-green-500" : "bg-red-500"}`}
      />
      {isInStock ? "En stock" : "Rupture de stock"}
      {showPrice && stock.basePriceHT != null && (
        <span className="ml-1 font-normal opacity-70">
          · {stock.basePriceHT.toFixed(2)} € HT
        </span>
      )}
    </span>
  );
}
