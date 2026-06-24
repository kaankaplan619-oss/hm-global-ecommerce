"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, getProductCardPrice } from "@/data/pricing";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { getVisualMode } from "@/lib/hm-visual-utils";
import { getDisplayedColors } from "@/lib/suppliers/printify/printify-colors";
import HMProductVisual from "@/components/product/HMProductVisual";
import ProductImageStage from "@/components/product/ProductImageStage";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * FeaturedProductCard — carte produit textile pour le carrousel d'accueil.
 * Utilise le VRAI packshot catalogue (getProductCatalogImage + HMProductVisual /
 * ProductImageStage, identique à BestSellers / ProductCard) — pas une photo de
 * chantier. Prix d'appel réel via getProductCardPrice.
 */
export default function FeaturedProductCard({ product }: { product: Product }) {
  const t = useT();
  const isPrintful = product.supplierName === "printful";
  const displayedColors = getDisplayedColors(product.id, product.colors);
  const defaultColor =
    displayedColors.find((c) => c.available) ?? displayedColors[0] ?? product.colors[0];
  const catalogImage = getProductCatalogImage(product, defaultColor?.id);
  const visualMode = isPrintful ? "supplier" : getVisualMode(product);
  const card = getProductCardPrice(product);

  return (
    <Link
      href={`/produits/${product.slug}`}
      data-card
      className="group flex w-[270px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.4rem] border border-[var(--hm-line)] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(63,45,88,0.08)] sm:w-[290px]"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {isPrintful ? (
          <div className="absolute inset-0">
            <ProductImageStage
              src={catalogImage || "/mockups/tshirt/blanc-front.webp"}
              alt={product.name}
              category={product.category}
              variant="best-sellers"
              sizes="290px"
            />
          </div>
        ) : (
          <HMProductVisual
            src={catalogImage}
            alt={product.name}
            mode={visualMode}
            fill
            sizes="290px"
            bgColor={product.id === "wg004" ? "#ffffff" : undefined}
            imageClassName={`object-contain transition duration-500 group-hover:scale-[1.04]${
              product.id === "wg004" ? "" : visualMode === "hm" ? " p-5 relative z-10" : " p-4"
            }`}
            showBadge={false}
          />
        )}
        <span className="absolute left-3 top-3 z-20 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--hm-primary)] shadow-sm">
          {t("home.featured.badgeTextile")}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold text-[var(--hm-text)] transition group-hover:text-[var(--hm-primary)]">
          {product.shortName}
        </h3>
        <div className="mt-auto pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-muted)]">
            {t("home.bestsellers.priceFrom")}
          </p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <div>
              <p className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[var(--hm-primary)]">
                {formatPrice(card.price)}
              </p>
              <p className="text-[11px] text-[var(--hm-text-soft)]">
                {t("home.bestsellers.priceTaxIncl")}
                {card.qty ? ` · ${t("home.bestsellers.priceFromQty").replace("{qty}", String(card.qty))}` : ""}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--hm-text)] transition group-hover:text-[var(--hm-primary)]">
              {t("home.bestsellers.view")}
              <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
