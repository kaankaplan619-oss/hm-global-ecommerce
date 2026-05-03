"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { LogoUploadResult } from "@/lib/uploadLogo";
import type { LogoPlacementTransform } from "@/lib/bat-utils";
import dynamic from "next/dynamic";
import type { MockupViewerProps } from "@/components/product/MockupViewer";
import Link from "next/link";
import { Info } from "lucide-react";
import ProductConfigurator from "@/components/product/ProductConfigurator";
import ProductGallery from "@/components/product/ProductGallery";
import LightMockupPreview from "@/components/product/LightMockupPreview";
import BATModal from "@/components/product/BATModal";
import TopTexStockBadge from "@/components/product/TopTexStockBadge";
import { useTopTexMedias } from "@/hooks/useTopTexMedias";
import { isColorDark } from "@/lib/color-utils";
import { buildBATData } from "@/lib/bat-utils";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { getHMMockupPath, getVisualMode } from "@/lib/hm-visual-utils";
import HMProductVisual from "@/components/product/HMProductVisual";
import { formatPrice } from "@/data/pricing";
import type { Product, ProductColor, Placement, Technique } from "@/types";
import type { LogoEffect } from "@/lib/color-utils";

// Chargé uniquement côté client — Fabric.js accède à `window.location`
// et ne peut pas s'exécuter dans le contexte SSR de Next.js.
const MockupViewer = dynamic<MockupViewerProps>(
  () => import("@/components/product/MockupViewer"),
  { ssr: false }
);

const BatPreviewStudio = dynamic(
  () => import("@/components/product/BatPreviewStudio"),
  { ssr: false }
);

type Props = {
  product: Product;
};

export default function ProductDetailClient({ product }: Props) {
  const searchParams = useSearchParams();

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

  // ── URL Supabase remontée depuis ProductConfigurator dès l'upload ─────────
  // Priorité dans BATData : logoSupabaseUrl > logoUrl (blob local)
  const [logoSupabaseUrl, setLogoSupabaseUrl] = useState<string | null>(null);
  const handleLogoUploadResult = useCallback((result: LogoUploadResult | null) => {
    setLogoSupabaseUrl(result?.logoFileUrl ?? null);
  }, []);

  // ── Logo pré-uploadé depuis le Studio (restauré via sessionStorage) ────────
  type StudioLogoPreset = {
    url: string; path: string; name: string; size: number; type: string;
    logoPlacementTransform?: LogoPlacementTransform | null;
  };
  const [studioLogoPreset, setStudioLogoPreset] = useState<StudioLogoPreset | null>(null);

  // ── Blob URL du logo pour l'aperçu (créé/révoqué ici) ────────────────────
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!logoFile) { setLogoUrl(null); return; }
    const url = URL.createObjectURL(logoFile);
    setLogoUrl(url);
    return () => {
      // Révocation différée d'un tick pour éviter l'image cassée dans BATModal
      // si React n'a pas encore commité le nouveau logoUrl avant la révocation.
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    };
  }, [logoFile]);

  // ── Position Fabric.js du logo (MockupViewer uniquement) ─────────────────
  // Resetée quand le fichier change ; mise à jour après placement initial
  // et après chaque drag/resize dans le canvas Fabric.
  const [logoPlacementTransform, setLogoPlacementTransform] =
    useState<LogoPlacementTransform | null>(null);
  const handleLogoPositionChange = useCallback(
    (t: LogoPlacementTransform) => setLogoPlacementTransform(t),
    []
  );
  // Reset when logoFile changes (new file = new initial position)
  useEffect(() => {
    setLogoPlacementTransform(null);
  }, [logoFile]);

  // ── BAT modal ────────────────────────────────────────────────────────────
  const [showBAT,    setShowBAT]    = useState(false);
  const [showStudio, setShowStudio] = useState(false);

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

  // ── Lecture résultat studio (paramètre studio=1) ──────────────────────────
  useEffect(() => {
    if (searchParams.get("studio") !== "1") return;
    try {
      const raw = sessionStorage.getItem("hm-studio-result");
      if (!raw) return;
      const result = JSON.parse(raw) as {
        colorId?:      string;
        size?:         string;
        technique?:    string;
        quantity?:     number;
        placement?:    string;
        logoFileUrl?:  string;
        logoFileName?: string;
        logoFilePath?: string;
        logoFileSize?: number;
        logoFileType?: string;
        logoPlacementTransform?: LogoPlacementTransform | null;
      };
      if (result.colorId) {
        const color = product.colors.find((c) => c.id === result.colorId && c.available);
        if (color) setSelectedColor(color);
      }
      if (result.size)      setSize(result.size);
      if (result.technique && (product.techniques as string[]).includes(result.technique)) {
        setTechnique(result.technique as Technique);
      }
      if (typeof result.quantity === "number" && result.quantity > 0) setQuantity(result.quantity);
      if (result.placement && (product.placements as string[]).includes(result.placement as string)) {
        setPlacement(result.placement as Placement);
      }
      if (result.logoFileUrl && result.logoFileName) {
        setStudioLogoPreset({
          url:  result.logoFileUrl,
          path: result.logoFilePath ?? "",
          name: result.logoFileName,
          size: result.logoFileSize ?? 0,
          type: result.logoFileType ?? "image/png",
          logoPlacementTransform: result.logoPlacementTransform ?? null,
        });
        setLogoSupabaseUrl(result.logoFileUrl);
      }
      sessionStorage.removeItem("hm-studio-result");
    } catch {
      // sessionStorage indisponible ou JSON invalide
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // ── Restauration sessionStorage au montage ────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`hm_config_${product.id}`);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        colorId?:   string;
        placement?: string;
        technique?: string;
        size?:      string;
        quantity?:  number;
      };

      if (saved.colorId) {
        const color = product.colors.find((c) => c.id === saved.colorId && c.available);
        if (color) setSelectedColor(color);
      }
      if (saved.placement && (product.placements as string[]).includes(saved.placement)) {
        setPlacement(saved.placement as Placement);
      }
      if (saved.technique && (product.techniques as string[]).includes(saved.technique)) {
        setTechnique(saved.technique as Technique);
      }
      if (typeof saved.size === "string") setSize(saved.size);
      if (typeof saved.quantity === "number" && saved.quantity > 0) setQuantity(saved.quantity);
    } catch {
      // sessionStorage indisponible ou JSON invalide
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]); // intentionnellement limité au montage/changement de produit

  // ── Sauvegarde sessionStorage à chaque changement de configuration ────────
  useEffect(() => {
    try {
      sessionStorage.setItem(
        `hm_config_${product.id}`,
        JSON.stringify({
          colorId:   selectedColor?.id ?? null,
          placement,
          technique,
          size,
          quantity,
        })
      );
    } catch {
      // sessionStorage indisponible
    }
  }, [product.id, selectedColor?.id, placement, technique, size, quantity]);

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

  // Image produit actuelle (utilisée par MockupViewer, LightMockupPreview + BAT)
  // Priorité (B2) : mockup HM → packshot TopTex couleur → packshot catalogue → photo mannequin
  const currentImageUrl = useMemo(() => {
    const cid = selectedColor?.id ?? "";
    const hmMockup = getHMMockupPath(product, cid);
    if (hmMockup) return hmMockup;
    if (cid && colorImages[cid]?.[0]) return colorImages[cid][0];
    return getProductCatalogImage(product, cid);
  }, [selectedColor, colorImages, product]);

  // MockupViewer actif pour t-shirts, hoodies et softshells dès qu'on a une image.
  const showMockup =
    (product.category === "tshirts" || product.category === "hoodies" || product.category === "softshells") &&
    !!currentImageUrl;

  // Mode visuel premium HM Global ou fournisseur
  const visualMode = getVisualMode(product);

  // ── Condition BAT visible ─────────────────────────────────────────────────
  // Exige au minimum : couleur sélectionnée + logo uploadé
  const batReady = !!selectedColor && !!logoFile;

  // ── Construction des données BAT ──────────────────────────────────────────
  // Priorité d'URL logo : URL Supabase (persistante) > blob local (fragile)
  const batLogoUrl = logoSupabaseUrl ?? logoUrl;

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
      batLogoUrl,
      logoPlacementTransform,
    );
  }, [
    batReady, product, selectedColor, size, quantity,
    technique, placement, logoFile, logoEffect, currentImageUrl,
    batLogoUrl, logoPlacementTransform,
  ]);

  return (
    <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        {showMockup ? (
          /* ── T-shirts B&C : MockupViewer Fabric.js (inchangé) ── */
          <MockupViewer
            colorId={selectedColor?.id ?? ""}
            placement={placement}
            logoFile={logoFile}
            logoUrl={logoSupabaseUrl ?? logoUrl}
            badge={product.badge}
            onLogoPositionChange={handleLogoPositionChange}
            onPlacementChange={setPlacement}
            packshot={currentImageUrl}
            productCategory={product.category}
          />
        ) : (
          <>
            {/* ── Hero visuel (B2) : mockup HM Global prioritaire ── */}
            <div className="relative overflow-hidden rounded-[28px] shadow-[0_20px_56px_rgba(12,14,20,0.18)]">
              <HMProductVisual
                src={currentImageUrl}
                alt={product.name}
                mode={visualMode}
                fill={false}
                width={720}
                height={720}
                priority
                showBadge
                className="w-full"
                imageClassName={`object-contain w-full transition-opacity duration-300${visualMode === "hm" ? " p-4 relative z-10" : " p-6"}`}
              />
            </div>

            {/* ── Aperçu logo (LightMockupPreview) ── */}
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

            {/* ── Galerie fournisseur (TopTex) — section secondaire ── */}
            <details className="group rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hm-text-soft)]">
                  Photos fournisseur
                </span>
                <svg
                  className="h-3 w-3 shrink-0 text-[var(--hm-text-muted)] transition-transform group-open:rotate-180"
                  viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="border-t border-[var(--hm-line)] px-3 pb-3 pt-2">
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
              </div>
            </details>
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
          onLogoUploadResult={handleLogoUploadResult}
          onTechniqueChange={setTechnique}
          onSizeChange={setSize}
          onQuantityChange={setQuantity}
          hidePreview={showMockup || !!logoFile}
          colorImages={colorImages}
          technique={technique}
          placement={placement}
          size={size}
          quantity={quantity}
          logoEffect={logoEffect}
          logoPlacementTransform={logoPlacementTransform}
          batRef={batData?.batRef}
          studioLogoPreset={studioLogoPreset ?? undefined}
          hideLogoUpload={true}
          requirePersonalization={product.supplierName === "printful"}
        />

        {/* ── Bouton Studio personnalisation ──────────────────────────────── */}
        <div className="mt-4">
          {size ? (
            <Link
              href={`/studio/${product.slug}?couleur=${selectedColor?.id ?? ""}&taille=${size}&technique=${technique}&quantite=${quantity}&placement=${placement}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--hm-primary)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(177,63,116,0.30)] transition-all hover:bg-[var(--hm-primary)]/90 hover:shadow-[0_6px_20px_rgba(177,63,116,0.40)] active:scale-[0.98]"
            >
              🎨 Personnaliser mon article →
            </Link>
          ) : (
            <div title="Sélectionnez d'abord une taille">
              <span
                aria-disabled="true"
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-[var(--hm-primary)]/40 px-5 py-3.5 text-sm font-bold text-white/70 select-none"
              >
                🎨 Personnaliser mon article →
              </span>
              <p className="mt-1.5 text-center text-[11px] text-[var(--hm-text-soft)]">
                Sélectionnez d&apos;abord une taille
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── BAT Preview Studio (portal body) — t-shirts B&C uniquement ── */}
      {showStudio && showMockup && (
        <BatPreviewStudio
          colorId={selectedColor?.id ?? ""}
          placement={placement}
          logoFile={logoFile}
          logoUrl={logoSupabaseUrl ?? logoUrl}
          product={product}
          selectedColor={selectedColor}
          size={size}
          technique={technique}
          quantity={quantity}
          onClose={() => setShowStudio(false)}
          onShowBAT={() => { setShowStudio(false); setShowBAT(true); }}
          onLogoTransformChange={handleLogoPositionChange}
          packshot={currentImageUrl}
          productCategory={product.category}
        />
      )}

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
