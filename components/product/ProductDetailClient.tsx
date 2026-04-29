"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Info, FileCheck } from "lucide-react";
import ProductConfigurator from "@/components/product/ProductConfigurator";
import ProductGallery from "@/components/product/ProductGallery";
import LightMockupPreview from "@/components/product/LightMockupPreview";
import BATModal from "@/components/product/BATModal";
import TopTexStockBadge from "@/components/product/TopTexStockBadge";
import { useTopTexMedias } from "@/hooks/useTopTexMedias";
import { hasMockup } from "@/lib/mockup-utils";
import { isColorDark } from "@/lib/color-utils";
import { buildBATData } from "@/lib/bat-utils";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { formatPrice } from "@/data/pricing";
import type { Product, ProductColor, Placement, Technique } from "@/types";
import type { LogoEffect } from "@/lib/color-utils";

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
  const [placement, setPlacement]   = useState<Placement>(product.placements[0]);
  const [logoFile, setLogoFile]     = useState<File | null>(null);

  // ── État remonté depuis ProductConfigurator (pour le BAT) ─────────────────
  const [technique, setTechnique]   = useState<Technique>(product.techniques[0]);
  const [size, setSize]             = useState<string>("");
  const [quantity, setQuantity]     = useState<number>(1);

  // ── logoEffect : suivi depuis LightMockupPreview (pour le BAT) ───────────
  const [logoEffect, setLogoEffect] = useState<LogoEffect>(() =>
    isColorDark(defaultColor?.id ?? "") ? "white-outline" : "none"
  );

  // Reset logoEffect quand la couleur change (en phase avec LightMockupPreview)
  useEffect(() => {
    setLogoEffect(isColorDark(selectedColor?.id ?? "") ? "white-outline" : "none");
  }, [selectedColor?.id]);

  // ── Blob URL du logo pour le BAT (créé/révoqué ici pour éviter la dépendance
  //    sur l'URL interne de LightMockupPreview) ──────────────────────────────
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!logoFile) { setLogoUrl(null); return; }
    const url = URL.createObjectURL(logoFile);
    setLogoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  // ── BAT modal ────────────────────────────────────────────────────────────
  const [showBAT, setShowBAT] = useState(false);

  // ── TopTex media enrichment ───────────────────────────────────────────────
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

  // MockupViewer uniquement pour les t-shirts B&C (supplierName: "falk-ross").
  const showMockup =
    product.category === "tshirts" &&
    product.supplierName === "falk-ross" &&
    hasMockup(selectedColor?.id ?? "");

  // Image produit actuelle (utilisée par LightMockupPreview + BAT)
  // Priorité : packshot couleur sélectionnée → packshot catalogue → photo mannequin (dernier recours)
  const currentImageUrl = useMemo(() => {
    const cid = selectedColor?.id ?? "";
    if (cid && colorImages[cid]?.[0]) return colorImages[cid][0];
    // Fallback : meilleur packshot disponible pour ce produit (évite la photo mannequin)
    return getProductCatalogImage(product);
  }, [selectedColor, colorImages, product]);

  // ── Condition BAT visible ─────────────────────────────────────────────────
  // Exige au minimum : couleur sélectionnée + logo uploadé
  const batReady = !!selectedColor && !!logoFile;

  // ── Construction des données BAT ──────────────────────────────────────────
  const batData = useMemo(() => {
    if (!batReady) return null;
    return buildBATData(
      product,
      selectedColor,
      size,
      quantity,
      technique,
      placement,
      logoFile,
      logoEffect,
      currentImageUrl,
      logoUrl,
    );
  }, [
    batReady, product, selectedColor, size, quantity,
    technique, placement, logoFile, logoEffect, currentImageUrl, logoUrl,
  ]);

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
          <>
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
            {logoFile && (
              <LightMockupPreview
                imageUrl={currentImageUrl}
                logoFile={logoFile}
                placement={placement}
                colorId={selectedColor?.id ?? ""}
                productName={product.name}
                category={product.category}
                onLogoEffectChange={setLogoEffect}
              />
            )}
          </>
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
          onTechniqueChange={setTechnique}
          onSizeChange={setSize}
          onQuantityChange={setQuantity}
          hidePreview={showMockup || !!logoFile}
          colorImages={colorImages}
        />

        {/* ── Bouton Prévisualiser le BAT ─────────────────────────────────── */}
        {batReady && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowBAT(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] px-5 py-3.5 text-sm font-bold text-[var(--hm-primary)] transition-all hover:bg-[var(--hm-primary)] hover:text-white active:scale-[0.98]"
            >
              <FileCheck size={16} />
              Prévisualiser le BAT
            </button>
            {!size && (
              <p className="mt-1.5 text-center text-[11px] text-[var(--hm-text-soft)]">
                💡 Sélectionnez une taille pour un BAT complet
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Modal BAT (portal body) ──────────────────────────────────────── */}
      {showBAT && batData && (
        <BATModal
          bat={batData}
          onClose={() => setShowBAT(false)}
        />
      )}
    </div>
  );
}
