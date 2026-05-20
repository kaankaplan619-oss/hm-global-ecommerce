import { formatPrice } from "@/data/pricing";
import { getHeadlineTier } from "@/data/textile-tiers";
import type { Product } from "@/types";

interface PriceTierBadgeProps {
  product: Product;
  /** Style compact pour les cartes catalogue ("Dès 50p · 13,90 €/p"). */
  variant?: "compact" | "block";
}

/**
 * Badge marketing affichant le prix unitaire d'un palier B2B clé.
 *
 * - Lecture seule sur les volume tiers existants (data/pricing.ts).
 * - Si le produit n'a aucun tier dégressif effectif, le badge ne s'affiche pas.
 * - Le prix réel contractuel reste celui du configurateur — ce badge est marketing.
 */
export default function PriceTierBadge({ product, variant = "compact" }: PriceTierBadgeProps) {
  const tier = getHeadlineTier(product);
  if (!tier) return null;

  if (variant === "block") {
    return (
      <div
        className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] px-3 py-2"
        title="Prix dégressif marketing — prix exact calculé par le configurateur"
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
          Tarif volume B2B
        </p>
        <p className="mt-1 text-sm font-bold text-[var(--hm-text)]">
          {formatPrice(tier.unitTTC)}<span className="text-[10px] font-normal text-[var(--hm-text-soft)]"> /pièce {tier.label.toLowerCase()}</span>
        </p>
      </div>
    );
  }

  return (
    <p
      className="inline-flex items-center gap-1 rounded-full bg-[var(--hm-accent-soft-rose)] px-2 py-0.5 text-[10px] font-semibold text-[var(--hm-primary)]"
      title="Prix dégressif marketing — prix exact calculé par le configurateur"
    >
      <span>{tier.label}</span>
      <span className="text-[var(--hm-text-soft)]">·</span>
      <span>{formatPrice(tier.unitTTC)}/p</span>
    </p>
  );
}
