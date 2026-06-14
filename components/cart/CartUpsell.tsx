"use client";

/**
 * CartUpsell.tsx — Bloc « Complétez votre commande » du panier (#89).
 *
 * Pattern « UberEats » (GO Kaan 2026-06-12) : suggérer des GOODIES à forte
 * marge et petit ticket (stickers ~72 %, dessous de verre ~58 %, mugs ~55 %,
 * tote ~52 %) plutôt que d'autres textiles — ET réutiliser le logo déjà
 * uploadé par le client pour un ajout en 1 clic (« Ajouter avec votre logo »).
 *
 * Règles :
 *   - Pool = produits UPSELL_IDS visibles, jamais quoteOnly, pas déjà au
 *     panier (ni un autre mug si un mug y est déjà).
 *   - Logo réutilisé = celui du dernier article textile du panier qui possède
 *     une URL Supabase. On copie UNIQUEMENT logoFile (jamais logoEffect /
 *     logoPlacementTransform / composedPreview* — calibrés pour le textile).
 *   - Tri prix croissant (petit ticket d'abord), max 3 suggestions.
 */

import Image from "next/image";
import { ArrowRight, Paperclip } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import { ALL_PRODUCTS } from "@/data/products";
import { computeUnitPriceWithVolume, formatPrice } from "@/data/pricing";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import type { CartItem, Product } from "@/types";

// Goodies/petits tickets à suggérer, par ordre de préférence métier.
const UPSELL_IDS = [
  "stickers-logo",        // 9,90 € — marge ~72 %
  "dessous-verre-liege",  // 12,90 € — marge ~58 %
  "tote-bagbase-w101",    // 16,90 € imprimé — marge ~52 %
  "mug-ceramique-eu",     // 19,90 € — l'objet bureau classique
  "mug-noir-brillant",    // 16,90 € — logos clairs
  "planche-stickers",     // 14,90 €
];

function quickDefaults(product: Product) {
  const color = product.colors.find((c) => c.available);
  const size = product.sizes.find((s) => s.available)?.label;
  const technique = product.techniques[0];
  const placement = product.placements[0];
  if (!color || !size || !technique || !placement) return null;
  return { color, size, technique, placement };
}

export function getUpsellSuggestions(items: CartItem[], max = 3): Product[] {
  if (items.length === 0) return [];
  const cartIds = new Set(items.map((i) => i.productId));
  const cartHasMug = items.some((i) => i.productId.includes("mug"));

  return UPSELL_IDS
    .map((id) => ALL_PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))
    .filter((p) => p.visible === true && !p.quoteOnly)
    .filter((p) => !cartIds.has(p.id))
    .filter((p) => !(cartHasMug && p.id.includes("mug")))
    .filter((p) => Boolean(quickDefaults(p)))
    .sort((a, b) => {
      const pa = computeUnitPriceWithVolume({ product: a, technique: a.techniques[0], placement: a.placements[0], quantity: 1 });
      const pb = computeUnitPriceWithVolume({ product: b, technique: b.techniques[0], placement: b.placements[0], quantity: 1 });
      return pa - pb;
    })
    .slice(0, max);
}

/** Logo réutilisable : dernier article NON-print du panier avec une URL Supabase. */
export function findReusableLogo(items: CartItem[]): CartItem["logoFile"] | null {
  const source = [...items].reverse().find((i) => !i.printConfig && i.logoFile?.url);
  return source?.logoFile ?? null;
}

export default function CartUpsell({
  items,
  onAdd,
}: {
  items: CartItem[];
  // Signature identique à useCartStore().addItem — on ne passe que le strict nécessaire.
  onAdd: (params: {
    product: Product;
    quantity: number;
    size: string;
    color: Product["colors"][number];
    technique: Product["techniques"][number];
    placement: Product["placements"][number];
    logoFile?: CartItem["logoFile"];
  }) => void;
}) {
  const t = useT();
  const suggestions = getUpsellSuggestions(items);
  const reusableLogo = findReusableLogo(items);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-[1.7rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,#ffffff_0%,#f9f7fb_100%)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
            {t("upsell.eyebrow")}
          </p>
          <h3 className="mt-1 text-base font-semibold text-[var(--hm-text)]">
            {reusableLogo ? t("upsell.title.withLogo") : t("upsell.title.default")}
          </h3>
          {reusableLogo && (
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[var(--hm-text-muted)]">
              <Paperclip size={10} /> {reusableLogo.name} {t("upsell.logoReady")}
            </p>
          )}
        </div>
        <span className="badge badge-gold">{t("upsell.badge")}</span>
      </div>

      {/* Carrousel horizontal petit-ticket-d'abord */}
      <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-1">
        {suggestions.map((product) => {
          const defaults = quickDefaults(product);
          if (!defaults) return null;
          const unitPrice = computeUnitPriceWithVolume({
            product,
            technique: defaults.technique,
            placement: defaults.placement,
            quantity: 1,
          });
          const thumbSrc = getProductCatalogImage(product, defaults.color.id) || product.images?.[0];

          return (
            <div
              key={product.id}
              className="w-44 shrink-0 snap-start rounded-[1.3rem] border border-[var(--hm-line)] bg-white p-3 shadow-[0_10px_24px_rgba(63,45,88,0.05)]"
            >
              <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl border border-[var(--hm-line)] bg-white">
                {thumbSrc ? (
                  <Image
                    src={thumbSrc}
                    alt={product.shortName}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>
              <p className="mt-2 truncate text-[12.5px] font-semibold text-[var(--hm-text)]">
                {product.shortName}
              </p>
              <p className="text-[11px] font-bold text-[var(--hm-primary)]">{formatPrice(unitPrice)}</p>
              <button
                type="button"
                onClick={() =>
                  onAdd({
                    product,
                    quantity: 1,
                    color: defaults.color,
                    size: defaults.size,
                    technique: defaults.technique,
                    placement: defaults.placement,
                    // Copie du CartFile seul — jamais l'effet/transform textile.
                    ...(reusableLogo ? { logoFile: { ...reusableLogo } } : {}),
                  })
                }
                className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-full border border-[var(--hm-primary)]/18 bg-[var(--hm-accent-soft-rose)] px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--hm-primary)] transition hover:border-[var(--hm-primary)]/35 hover:bg-white"
              >
                {reusableLogo ? t("upsell.cta.withLogo") : t("upsell.cta.default")}
                <ArrowRight size={11} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
