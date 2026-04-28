"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Info } from "lucide-react";
import ProductConfigurator from "@/components/product/ProductConfigurator";
import ProductGallery from "@/components/product/ProductGallery";
import TopTexStockBadge from "@/components/product/TopTexStockBadge";
import { useTopTexMedias } from "@/hooks/useTopTexMedias";
import { hasMockup } from "@/lib/mockup-utils";
import { formatPrice } from "@/data/pricing";
import type { Product, ProductColor, Placement } from "@/types";

// Chargé uniquement côté client — Fabric.js accède à `window.location`
// et ne peut pas s'exécuter dans le contexte SSR de Next.js.
const MockupViewer = dynamic(
  () => import("@/components/product/MockupViewer"),
  { ssr: false }
);

type Props = {
  product: Product;
};

export default function ProductDetailClient({ product }: Props) {
  const defaultColor = useMemo(
    () => product.colors.find((c) => c.available) ?? null,
    [product]
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(defaultColor);
  const [placement, setPlacement] = useState<Placement>(product.placements[0]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // ── TopTex media enrichment (couleurs → images) ────────────────────────────
  // Se charge en arrière-plan après l'hydratation.
  // Produits sans toptexRef → hook reste en "idle", colorImages reste {}
  const { colorImages, status: mediasStatus } = useTopTexMedias(
    product.toptexRef,
    product.colors,
    product.id
  );

  const minPrice = useMemo(() => {
    const prices = [
      product.pricing.dtf,
      product.pricing.flex,
      product.pricing.broderie,
    ].filter((p) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [product]);

  useEffect(() => {
    setSelectedColor(defaultColor);
  }, [product.id, defaultColor]);

  const handleColorChange = useCallback(
    (nextColor: ProductColor | null) => {
      if (!nextColor) {
        setSelectedColor(defaultColor);
        return;
      }
      const canonicalColor = product.colors.find(
        (color) => color.id === nextColor.id && color.available
      );
      setSelectedColor(canonicalColor ?? defaultColor);
    },
    [defaultColor, product.colors]
  );

  const showMockup =
    product.category === "tshirts" && hasMockup(selectedColor?.id ?? "");

  return (
    <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        {showMockup ? (
          <MockupViewer
            colorId={selectedColor?.id ?? ""}
            placement={placement}
            logoFile={logoFile}
            badge={product.badge}
          />
        ) : (
          <ProductGallery
            name={product.name}
            images={product.images}
            colors={product.colors}
            selectedColor={selectedColor}
            badge={product.badge}
            colorImages={colorImages}
            mediasLoading={mediasStatus === "loading"}
            productId={product.id}
          />
        )}

        <div className="rounded-[28px] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                Référence
              </p>
              <p className="font-mono text-sm text-[var(--hm-text)]">{product.reference}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                Composition
              </p>
              <p className="text-sm text-[var(--hm-text-soft)]">{product.composition}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                Grammage
              </p>
              <p className="text-sm text-[var(--hm-text-soft)]">{product.weight}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                Prix dès
              </p>
              <p className="text-sm font-semibold text-[var(--hm-primary)]">
                {formatPrice(minPrice)} TTC
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--hm-line)] pt-4">
            <p className="text-xs leading-relaxed text-[var(--hm-text-soft)]">
              {product.description}
            </p>
          </div>
        </div>

        {product.category === "softshells" && (
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-purple)] p-4">
            <Info size={14} className="mt-0.5 shrink-0 text-[var(--hm-purple)]" />
            <p className="text-xs text-[var(--hm-purple)]">
              La broderie est recommandée pour ce type de vêtement premium. DTF et flex sont
              disponibles mais à utiliser avec prudence selon le visuel.
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="mb-6">
          <p className="mb-1 font-mono text-[10px] text-[var(--hm-text-soft)]">{product.reference}</p>
          <h1 className="mb-2 text-2xl font-black text-[var(--hm-text)] md:text-3xl">
            {product.name}
          </h1>
          <p className="mb-1 text-sm text-[var(--hm-text-soft)]">
            {product.composition} · {product.weight}
          </p>
          {product.toptexRef && (
            <div className="mb-3">
              <TopTexStockBadge toptexRef={product.toptexRef} />
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--hm-primary)]">
              {formatPrice(minPrice)}
            </span>
            <span className="text-sm text-[var(--hm-text-soft)]">TTC</span>
            <span className="text-xs text-[var(--hm-text-soft)]">
              ({formatPrice(minPrice / 1.2)} HT)
            </span>
          </div>
        </div>

        <ProductConfigurator
          product={product}
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
          onPlacementChange={setPlacement}
          onLogoChange={setLogoFile}
          hidePreview={showMockup}
          colorImages={colorImages}
        />
      </div>
    </div>
  );
}
