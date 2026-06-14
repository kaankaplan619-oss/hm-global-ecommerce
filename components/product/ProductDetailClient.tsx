"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useT } from "@/components/i18n/I18nProvider";
import type { LogoUploadResult } from "@/lib/uploadLogo";
import type { LogoPlacementTransform } from "@/lib/bat-utils";
import dynamic from "next/dynamic";
import type { MockupViewerProps } from "@/components/product/MockupViewer";
import Link from "next/link";
import { ArrowRight, Info, ShieldCheck, Truck, MapPin } from "lucide-react";
import ProductConfigurator from "@/components/product/ProductConfigurator";
import ProductGallery from "@/components/product/ProductGallery";
import LightMockupPreview from "@/components/product/LightMockupPreview";
import BATModal from "@/components/product/BATModal";
import TopTexStockBadge from "@/components/product/TopTexStockBadge";
import VolumeQuoteBlock from "@/components/product/VolumeQuoteBlock";
import QuoteOnlyBlock from "@/components/product/QuoteOnlyBlock";
import { useTopTexMedias } from "@/hooks/useTopTexMedias";
import { isColorDark } from "@/lib/color-utils";
import { buildBATData } from "@/lib/bat-utils";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { getHMMockupPath, getVisualMode, resolveMockupAssetUrl } from "@/lib/hm-visual-utils";
import { getPrintifyGallery } from "@/lib/suppliers/printify/mockups-local";
import {
  getDisplayedColors,
  isPrintifyV1Product,
} from "@/lib/suppliers/printify/printify-colors";
import { getV1PrintifyImage, getV1PrintifyGallery } from "@/lib/suppliers/printify/v1-image";
import HMProductVisual from "@/components/product/HMProductVisual";
import { formatPrice, getVolumePricedRate } from "@/data/pricing";
import { isSimpleFlowProduct } from "@/data/products";
import type { Product, ProductColor, Placement, Technique } from "@/types";
import type { LogoEffect } from "@/lib/color-utils";

// Visualiseurs 3D (Three.js — SSR désactivé obligatoire)
const loadingSpinner = () => (
  <div className="flex items-center justify-center w-full aspect-square bg-white rounded-[28px]">
    <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--hm-line)] border-t-[var(--hm-primary)]" />
  </div>
);
const TShirt3DViewer = dynamic(() => import("@/components/product/TShirt3DViewer"), {
  ssr: false,
  loading: loadingSpinner,
});

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

type TFn = (key: string) => string;

function getCategoryUsage(t: TFn, category: string): string | undefined {
  const usage: Record<string, string> = {
    tshirts:    t("productDetail.usage.tshirts"),
    hoodies:    t("productDetail.usage.hoodies"),
    softshells: t("productDetail.usage.softshells"),
    polos:      t("productDetail.usage.polos"),
    polaires:   t("productDetail.usage.polaires"),
    casquettes: t("productDetail.usage.casquettes"),
    sacs:       t("productDetail.usage.sacs"),
    goodies:    t("productDetail.usage.goodies"),
    enfants:    t("productDetail.usage.enfants"),
  };
  return usage[category];
}

function getTechniqueLabelShort(t: TFn, technique: Technique): string {
  const labels: Record<Technique, string> = {
    dtf:                "DTF",
    dtflex:             "DTFlex",
    flex:               "Flex",
    broderie:           t("productDetail.technique.broderie"),
    broderie_illimitee: t("productDetail.technique.broderieIllimitee"),
    print:              "Print",
  };
  return labels[technique];
}

function getRecommendedTechnique(t: TFn, product: Product): string {
  const preferred = product.techniqueRecommandee ?? product.techniques[0];
  return getTechniqueLabelShort(t, preferred) ?? preferred.toUpperCase();
}

function getRecommendedMinimum(t: TFn, product: Product): string {
  if (product.quoteOnly) return t("productDetail.minimum.quote");
  return t("productDetail.minimum.pieces").replace("{count}", String(product.minOrderQty ?? 10));
}

function getIndicativeDelay(t: TFn, product: Product): string {
  if (product.category === "goodies") return t("productDetail.delay.goodies");
  if (product.techniques.includes("broderie") || product.techniques.includes("broderie_illimitee")) {
    return t("productDetail.delay.broderie");
  }
  return t("productDetail.delay.standard");
}

export default function ProductDetailClient({ product }: Props) {
  const t = useT();
  const searchParams = useSearchParams();

  // Couleurs affichées : pour les produits Printify V1, on filtre strictement
  // sur les couleurs réellement disponibles (manifest + mapping variant_id).
  // Pour les autres produits, retourne la liste complète inchangée.
  const displayedColors = useMemo(
    () => getDisplayedColors(product.id, product.colors),
    [product.id, product.colors]
  );

  const defaultColor = useMemo(
    () => displayedColors.find((c) => c.available) ?? displayedColors[0] ?? null,
    [displayedColors]
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(defaultColor);
  const [placement, setPlacement]   = useState<Placement>(product.placements[0]);
  const [logoFile, setLogoFile]     = useState<File | null>(null);

  // ── Images composées retournées par le Studio (shirt+logo, face + dos) ──
  const [studioComposedFront, setStudioComposedFront] = useState<string | null>(null);
  const [studioComposedBack,  setStudioComposedBack]  = useState<string | null>(null);
  // Indice actif du mini-carousel studio (0=face, 1=dos)
  const [studioComposedIdx,   setStudioComposedIdx]   = useState(0);
  // URL affichée (raccourci utilisé dans le JSX)
  const studioComposedImages = [studioComposedFront, studioComposedBack].filter(Boolean) as string[];
  const studioComposedUrl    = studioComposedImages[studioComposedIdx] ?? null;

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

  // ── Prix dynamique selon la technique + placement + quantité ────────────
  const currentPrice = useMemo(() => {
    // Si le produit a des paliers volume par technique, on les utilise
    const activeTiers = product.volumePricingByTechnique?.[technique] ?? product.volumePricing ?? null;
    const basePrice = activeTiers
      ? getVolumePricedRate(activeTiers, quantity)
      : (() => {
          switch (technique) {
            case "dtf":                return product.pricing.dtf;
            case "dtflex":             return product.pricing.dtflex;
            case "flex":               return product.pricing.flex;
            case "broderie":           return product.pricing.broderie;
            case "broderie_illimitee": return product.pricing.broderie_illimitee ?? product.pricing.broderie;
            default:                   return product.pricing.dtf;
          }
        })();
    if (!basePrice || basePrice === 0) return minPrice;
    // Surcharge placement : broderie → broDeriePlacementSurcharge, autres → placements
    const isBroderie = technique === "broderie" || technique === "broderie_illimitee";
    const surchargeMap = isBroderie
      ? product.pricing.broDeriePlacementSurcharge
      : product.pricing.placements;
    const surcharge = surchargeMap[placement] ?? 0;
    return Math.round((basePrice + surcharge) * 100) / 100;
  }, [technique, placement, quantity, product, minPrice]);

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
        colorId?:            string;
        size?:               string;
        technique?:          string;
        quantity?:           number;
        placement?:          string;
        logoFileUrl?:        string;
        logoFileName?:       string;
        logoFilePath?:       string;
        logoFileSize?:       number;
        logoFileType?:       string;
        logoPlacementTransform?: LogoPlacementTransform | null;
        /** Images composées (shirt+logo) exportées depuis le Studio */
        composedFront?: string;
        composedBack?:  string;
        /** Ancien champ (compat) */
        composedPreviewUrl?: string;
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
      // NE PAS afficher les images composées sur la page produit normale :
      // le flux studio ajoute désormais directement au panier (StudioSummaryPanel).
      // On supprime juste la clé sessionStorage si elle traîne encore.
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

  // MockupViewer Fabric.js actif pour t-shirts/hoodies/softshells SAUF :
  // - Produits Printful sans logo → on préfère HMProductVisual (rendu catalogue propre,
  //   pas de zone de marquage, pas d'image portrait Printful dans canvas carré Fabric.js)
  // - Dès qu'un logo est uploadé (local) ou revenu du studio (studioLogoPreset), on
  //   réactive MockupViewer pour montrer l'aperçu logo — mais sans zone de marquage.
  const isPrintful   = product.supplierName === "printful";
  const isPOD        = isPrintful || product.supplierName === "spreadshirt";
  const hasLogoReady = !!logoFile || !!studioLogoPreset;

  // Vue 3D — désactivée pour les produits Printify V1 (mockups réels obligatoires).
  // Reste active pour les autres produits Printful (Cotton Heritage M2480 etc.).
  const isPrintifyV1 = isPrintifyV1Product(product.id);
  const has3DViewer = isPrintful && product.category === "tshirts" && !isPrintifyV1;
  const [show3D, setShow3D] = useState(false);   // V1 : photos par défaut, jamais 3D
  // Index de vue 3D : 0=face, 1=dos, 2=manche
  const [view3DIndex, setView3DIndex] = useState(0);
  const VIEW_3D_COUNT = 3;

  // ── Carousel galerie Printful ─────────────────────────────────────────────
  const [galleryIndex, setGalleryIndex] = useState(0);
  // Reset l'index quand la couleur change
  useEffect(() => { setGalleryIndex(0); }, [selectedColor?.id]);
  const gallery: string[] = useMemo(() => {
    if (!isPrintful) return [];
    const cid = selectedColor?.id ?? "";

    // ⚠️ Pour les 6 produits Printify V1 : galerie STRICTEMENT issue de /mockups/printify/.
    //    Aucun fallback hmMockupGallery, aucune source ancienne autorisée.
    if (isPrintifyV1) {
      return getV1PrintifyGallery(product.id, cid);
    }

    // Pour les autres Printful (Cotton Heritage etc.) : ancien comportement
    const pf = getPrintifyGallery(product.id, cid);
    if (pf.front) {
      return [pf.front, pf.back, pf.folded].filter((s): s is string => Boolean(s));
    }
    return (product.hmMockupGallery?.[cid] ?? []).map(resolveMockupAssetUrl);
  }, [isPrintful, isPrintifyV1, selectedColor?.id, product]);

  // Image produit actuelle (utilisée par MockupViewer, LightMockupPreview + BAT)
  // ⚠️ Pour les 6 produits Printify V1 : URL STRICTEMENT issue de /mockups/printify/.
  //    Aucun fallback colorImages, aucune source ancienne, aucun packshot TopTex.
  const currentImageUrl = useMemo(() => {
    const cid = selectedColor?.id ?? "";

    if (isPrintifyV1) {
      // Galerie Printify uniquement : suivi de galleryIndex sur front/back/folded
      if (gallery.length > 0) return gallery[galleryIndex] ?? gallery[0];
      // Sinon front direct (cas où la galerie n'a pas encore été calculée)
      return getV1PrintifyImage(product.id, cid, "front") ?? "";
    }

    // Comportement historique pour les produits NON-V1
    if (isPrintful && gallery.length > 0) return gallery[galleryIndex] ?? gallery[0];
    const hmMockup = getHMMockupPath(product, cid);
    if (hmMockup) return hmMockup;
    if (cid && colorImages[cid]?.[0]) return colorImages[cid][0];
    return getProductCatalogImage(product, cid);
  }, [selectedColor?.id, colorImages, product, galleryIndex, gallery, isPrintful, isPrintifyV1]);

  const handlePreviewNext = useCallback(() => {
    if (studioComposedUrl) return;
    if (show3D) {
      setView3DIndex((i) => (i + 1) % VIEW_3D_COUNT);
      return;
    }
    if (gallery.length > 1) {
      setGalleryIndex((i) => (i + 1) % gallery.length);
    }
  }, [studioComposedUrl, show3D, gallery.length]);

  // showMockup = on rend MockupViewer Fabric.js (avec zones, drag-resize logo,
  // overlay zone rose pointillée). Désactivé pour les produits "stock agence"
  // qui ne sont pas configurables visuellement par le client (l'équipe HM
  // Global prépare le rendu manuellement) — pour ces produits on rend une
  // image statique propre via HMProductVisual à la place.
  //
  // WG004 stock agence V1 : non configurable côté UI → image simple, pas de
  // canvas Fabric.js, pas de zone rose. L'upload logo reste actif dans le
  // ProductConfigurator (workflow validation manuelle équipe).
  const showMockup =
    (product.category === "tshirts" || product.category === "hoodies" || product.category === "softshells") &&
    !isSimpleFlowProduct(product) && // coupe-vent POD : flow simple, pas de zones calibrées
    !!currentImageUrl &&
    (!isPOD || hasLogoReady) &&
    product.id !== "wg004";

  // Mode visuel premium HM Global ou fournisseur
  // Les produits POD (Printful, Spreadshirt) utilisent le mode "supplier" (fond blanc)
  // pour que les photos flat sans fond sombre soient propres.
  const visualMode = isPOD ? "supplier" : getVisualMode(product);

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
          /* ── T-shirts / hoodies (canvas Fabric.js) ──────────────────────────
             showZone=false sur les produits Printful : la zone de marquage est
             réservée au studio (/studio/[slug]). Sur la fiche produit on affiche
             uniquement le produit + l'aperçu logo sans guide visuel technique. */
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
            showZone={!isPOD}
          />
        ) : (
          <>
            {/* ── Hero visuel (B2) : mockup HM Global prioritaire ── */}
            {/* Si le client revient du Studio, on affiche l'image composée (shirt+logo) */}
            <div
              className={`relative overflow-hidden rounded-[28px] shadow-[0_20px_56px_rgba(12,14,20,0.18)] ${
                isPrintful && !studioComposedUrl && (show3D || gallery.length > 1) ? "cursor-pointer" : ""
              }`}
              role={isPrintful && !studioComposedUrl && (show3D || gallery.length > 1) ? "button" : undefined}
              tabIndex={isPrintful && !studioComposedUrl && (show3D || gallery.length > 1) ? 0 : undefined}
              aria-label={isPrintful && !studioComposedUrl && (show3D || gallery.length > 1) ? t("productDetail.aria.nextView") : undefined}
              onClick={handlePreviewNext}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handlePreviewNext();
                }
              }}
            >
              {/* ── Vue 3D / Photo ── */}
              {show3D && isPrintful && !studioComposedUrl ? (
                <TShirt3DViewer
                  color={selectedColor?.hex ?? "#111111"}
                  viewIndex={view3DIndex}
                  className="w-full aspect-square"
                />
              ) : (
                <HMProductVisual
                  src={studioComposedUrl ?? currentImageUrl}
                  alt={product.name}
                  mode={studioComposedUrl ? "supplier" : visualMode}
                  fill={false}
                  width={720}
                  height={720}
                  priority
                  showBadge={!studioComposedUrl && !isPOD}
                  className="w-full"
                  bgColor={studioComposedUrl ? "#ffffff" : isPOD ? "#ffffff" : product.id === "wg004" ? "#ffffff" : undefined}
                  imageClassName={
                    studioComposedUrl
                      ? "object-contain w-full transition-opacity duration-300"
                      : `object-contain w-full transition-opacity duration-300${
                          visualMode === "hm"
                            ? " p-4 relative z-10"
                            : product.category === "polos"
                              ? " p-6"
                              : isPOD
                                ? " scale-[1.10] p-3"
                                : product.id === "wg004"
                                  ? ""
                                  : " p-6"
                        }`
                  }
                />
              )}

              {/* ── Bouton bascule 3D / Photos (t-shirts uniquement) ── */}
              {has3DViewer && !studioComposedUrl && (
                <button
                  type="button"
                  onClick={() => setShow3D((v) => !v)}
                  className={`absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold backdrop-blur-sm transition-all
                    ${show3D
                      ? "border-[var(--hm-rose)] bg-[var(--hm-rose)] text-white shadow-[0_4px_14px_rgba(177,63,116,0.35)]"
                      : "border-[var(--hm-line)] bg-white/90 text-[var(--hm-text-soft)] hover:border-[var(--hm-rose)] hover:text-[var(--hm-rose)]"
                    }`}
                >
                  {show3D ? (
                    <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 6h14"/><path d="M5 3v10"/></svg>{t("productDetail.view.photos")}</>
                  ) : (
                    <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3"><path d="M8 2L2 5.5v5L8 14l6-3.5v-5L8 2z"/><path d="M2 5.5L8 9l6-3.5M8 9v5"/></svg>{t("productDetail.view.3d")}</>
                  )}
                </button>
              )}

              {/* ── Badge "Votre personnalisation" + reset + navigation face/dos ── */}
              {studioComposedUrl && (
                <div className="absolute left-3 top-3 z-30 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--hm-primary)]/40 bg-[var(--hm-primary)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow">
                    🎨 {t("productDetail.composed.yourCustomization")}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setStudioComposedFront(null); setStudioComposedBack(null); setStudioComposedIdx(0); }}
                    className="rounded-full border border-[var(--hm-line)] bg-white/90 px-2 py-1 text-[9px] font-semibold text-[var(--hm-text-soft)] shadow backdrop-blur-sm transition hover:text-[var(--hm-text)]"
                    title={t("productDetail.composed.resetTitle")}
                  >
                    ✕ {t("productDetail.composed.reset")}
                  </button>
                </div>
              )}

              {/* ── Dots face/dos si les deux faces sont composées ── */}
              {studioComposedImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                  {[t("productDetail.side.front"), t("productDetail.side.back")].slice(0, studioComposedImages.length).map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setStudioComposedIdx(idx)}
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-all border ${
                        idx === studioComposedIdx
                          ? "bg-[var(--hm-primary)] border-[var(--hm-primary)] text-white"
                          : "bg-white/90 border-[var(--hm-line)] text-[var(--hm-text-soft)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Flèches carousel : 3D (vues) ou galerie photo ── */}
              {isPrintful && !studioComposedUrl && (show3D || gallery.length > 1) && (
                <>
                  <button
                    type="button"
                    aria-label={t("productDetail.aria.prevView")}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (show3D) {
                        setView3DIndex((i) => (i - 1 + VIEW_3D_COUNT) % VIEW_3D_COUNT);
                        return;
                      }
                      setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length);
                    }}
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md border border-[var(--hm-line)] text-[var(--hm-text)] transition hover:bg-white hover:shadow-lg"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M10 3L5 8l5 5"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={t("productDetail.aria.nextView")}
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePreviewNext();
                    }}
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md border border-[var(--hm-line)] text-[var(--hm-text)] transition hover:bg-white hover:shadow-lg"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M6 3l5 5-5 5"/>
                    </svg>
                  </button>
                  {/* Dots indicateurs — 3 vues en 3D, galerie en photo */}
                  <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
                    {show3D
                      ? [0, 1, 2].map((idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setView3DIndex(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all ${idx === view3DIndex ? "w-4 bg-[var(--hm-primary)]" : "w-1.5 bg-[var(--hm-line)]"}`}
                          />
                        ))
                      : gallery.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            aria-label={t("productDetail.aria.image").replace("{n}", String(idx + 1))}
                            onClick={(event) => {
                              event.stopPropagation();
                              setGalleryIndex(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all ${idx === galleryIndex ? "w-4 bg-[var(--hm-primary)]" : "w-1.5 bg-[var(--hm-line)]"}`}
                          />
                        ))
                    }
                  </div>
                </>
              )}
            </div>

            {/* ── Miniatures SVG colorées — cohérentes avec la vue 3D ──
                 Affichées uniquement pour les produits TEXTILE (les pictos sont
                 hardcodés en silhouette t-shirt Face/Dos/Manche). Les catégories
                 non-textile (goodies = mugs, sacs si Printify futur, casquettes)
                 utilisent la navigation par dots simples du carousel principal
                 (ligne 629-655). Pour les ajouter aux non-textiles, il faudra
                 introduire des SVG dédiés par famille. */}
            {isPrintful && !studioComposedUrl && (show3D || gallery.length > 0) && !isSimpleFlowProduct(product) && (() => {
              const sc   = selectedColor?.hex ?? "#111111";
              // Contour visible uniquement sur les coloris très clairs
              const lum  = parseInt(sc.replace("#",""), 16);
              const outlineOpacity = lum > 0xbbbbbb ? 0.22 : 0.0;
              const outline = `rgba(0,0,0,${outlineOpacity})`;

              const THUMB_VIEWS = [
                {
                  label: t("productDetail.side.front"),
                  idx: 0,
                  // T-shirt vu de face
                  svg: (
                    <svg viewBox="0 0 100 112" className="h-11 w-11 drop-shadow-sm">
                      <path d="M33 3 Q50 20 67 3 L85 13 L100 48 L77 53 L77 108 L23 108 L23 53 L0 48 L15 13 Z" fill={sc} stroke={outline} strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M33 3 Q50 20 67 3" stroke={lum > 0xbbbbbb ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.18)"} strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                  ),
                },
                {
                  label: t("productDetail.side.back"),
                  idx: 1,
                  // T-shirt vu de dos (col plat + couture centrale)
                  svg: (
                    <svg viewBox="0 0 100 112" className="h-11 w-11 drop-shadow-sm">
                      <path d="M28 5 Q50 11 72 5 L85 13 L100 48 L77 53 L77 108 L23 108 L23 53 L0 48 L15 13 Z" fill={sc} stroke={outline} strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M28 5 Q50 11 72 5" stroke={lum > 0xbbbbbb ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.18)"} strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M50 11 L50 108" stroke={lum > 0xbbbbbb ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" strokeDasharray="5 4"/>
                    </svg>
                  ),
                },
                {
                  label: t("productDetail.side.sleeve"),
                  idx: 2,
                  // T-shirt vu de profil (corps droit + manche gauche au premier plan)
                  svg: (
                    <svg viewBox="0 0 100 112" className="h-11 w-11 drop-shadow-sm">
                      {/* Silhouette profil : manche + corps */}
                      <path
                        d="M80 7 Q62 2 45 7 L45 20 L10 26 L10 54 L45 54 L45 108 L80 108 Z"
                        fill={sc}
                        stroke={outline}
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      {/* Col - arc de détail */}
                      <path
                        d="M80 7 Q62 2 45 7"
                        stroke={lum > 0xbbbbbb ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.18)"}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Couture épaule */}
                      <path
                        d="M45 20 L45 54"
                        stroke={lum > 0xbbbbbb ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.15)"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                  only3D: true,
                },
              ];

              return (
                <div className="flex gap-2 px-1">
                  {THUMB_VIEWS.filter(v => show3D ? true : !v.only3D).map(({ label, idx, svg }) => {
                    const isActive = show3D ? view3DIndex === idx : galleryIndex === idx;
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-label={t("productDetail.aria.showView").replace("{label}", label.toLowerCase())}
                        disabled={!show3D && !gallery[idx]}
                        onClick={() => {
                          if (show3D) {
                            setView3DIndex(idx);
                            return;
                          }
                          if (gallery[idx]) setGalleryIndex(idx);
                        }}
                        className={`relative flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border-2 bg-white transition-all ${
                          isActive
                            ? "border-[var(--hm-primary)] shadow-[0_4px_12px_rgba(177,63,116,0.2)]"
                            : "border-[var(--hm-line)] opacity-75 hover:opacity-100 hover:border-[var(--hm-purple)]"
                        }`}
                        title={label}
                      >
                        {svg}
                        <span className={`text-[8px] font-bold uppercase tracking-wide ${isActive ? "text-[var(--hm-primary)]" : "text-[var(--hm-text-muted)]"}`}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── Aperçu logo (LightMockupPreview) ──
                 LightMockupPreview superpose le logo client sur l'image produit
                 en utilisant les zones cœur/dos textile (fallback automatique
                 sur tshirts pour les catégories non-mappées). Pour le mug et les
                 autres goodies, ce serait visuellement trompeur (logo affiché à
                 la position "poitrine" sur un objet non-textile). On masque donc
                 cet overlay pour goodies — l'image principale (mockup mug blanc
                 Printify) reste affichée telle quelle, et le client comprend que
                 l'équipe HM Global préparera le rendu mug avant production
                 (cf. encart info dans le ProductConfigurator). */}
            {logoFile && !isSimpleFlowProduct(product) && (
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

            {/* ── Galerie fournisseur (TopTex) — section secondaire ──
                 Masqué pour WG004 stock agence : product.images est rempli avec
                 5 URLs CDN TopTex qui sont en réalité la même photo dupliquée
                 (front packshot 180 KB + 4× 20 KB placeholders/thumbs). Le bloc
                 affiche donc 5× le même visuel ce qui donne une impression mal
                 finie. Les autres produits (Bella, Gildan, Kariban etc.) gardent
                 la galerie qui contient de vraies vues alternatives utiles. */}
            {product.id !== "wg004" && (
            <details className="group rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hm-text-soft)]">
                  {t("productDetail.supplierPhotos")}
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
                  colors={displayedColors}
                  selectedColor={selectedColor}
                  badge={product.badge}
                  supplierImages={product.supplierImages}
                  colorImages={colorImages}
                  mediasLoading={mediasStatus === "loading"}
                  productId={product.id}
                />
              </div>
            </details>
            )}
          </>
        )}

        <div className="rounded-[28px] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                {t("productDetail.spec.reference")}
              </p>
              <p className="font-mono text-sm text-[var(--hm-text)]">{product.reference}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                {t("productDetail.spec.composition")}
              </p>
              <p className="text-sm text-[var(--hm-text-soft)]">{product.composition}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                {t("productDetail.spec.weight")}
              </p>
              <p className="text-sm text-[var(--hm-text-soft)]">{product.weight}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                {t("productDetail.spec.priceFrom")}
              </p>
              <p className="text-sm font-semibold text-[var(--hm-primary)]">
                {formatPrice(minPrice)} {t("productDetail.taxIncl")}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--hm-line)] pt-4">
            <p className="text-xs leading-relaxed text-[var(--hm-text-soft)]">
              {product.description}
            </p>
          </div>
        </div>

        {/* Bloc devis volume — affiché pour les catégories textile, hors goodies */}
        {(product.category === "tshirts" ||
          product.category === "hoodies" ||
          product.category === "polos" ||
          product.category === "softshells" ||
          product.category === "polaires") && (
          <VolumeQuoteBlock productSlug={product.slug} />
        )}

        {product.category === "softshells" && (
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-purple)] p-4">
            <Info size={14} className="mt-0.5 shrink-0 text-[var(--hm-purple)]" />
            <p className="text-xs text-[var(--hm-purple)]">
              {product.techniques.includes("dtf") || product.techniques.includes("flex")
                ? t("productDetail.softshell.dtfFlex")
                : t("productDetail.softshell.broderie")}
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
          <div className="mb-5 grid gap-2 rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-muted)]">{t("productDetail.label.recommendedUsage")}</p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--hm-text)]">
                {product.ideaPour?.[0] ?? getCategoryUsage(t, product.category) ?? t("productDetail.usage.fallback")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-muted)]">{t("productDetail.label.recommendedTechnique")}</p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--hm-text)]">{getRecommendedTechnique(t, product)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-muted)]">{t("productDetail.label.recommendedMinimum")}</p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--hm-text)]">{getRecommendedMinimum(t, product)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-muted)]">{t("productDetail.label.indicativeDelay")}</p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--hm-text)]">{getIndicativeDelay(t, product)}</p>
            </div>
          </div>
          {/* CTA principal — comportement par catégorie (2026-06-10) :
               - Goodies (mug) + casquettes + polos : la personnalisation =
                 upload dans le ProductConfigurator → le bouton scroll vers
                 l'ancre id="mug-commander". Wording « Personnaliser » (jamais
                 « Commander » : le produit est toujours personnalisé d'abord).
               - Textile Studio (t-shirts, sweats, hoodies… y compris wg004) :
                 navigation DIRECTE vers /studio/<slug> avec la config courante.
                 La taille peut être vide : le Studio a son propre sélecteur.
                 C'est le SEUL CTA Personnaliser de la fiche (l'ancien doublon
                 en bas du configurateur a été retiré — demande Kaan). */}
          {isSimpleFlowProduct(product) ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("mug-commander")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--hm-primary)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(177,63,116,0.28)] transition hover:bg-[var(--hm-rose-dark)]"
            >
              {product.id.includes("mug")
                ? t("productDetail.cta.customizeMug")
                : t("productDetail.cta.customizeItem")}
              <ArrowRight size={16} />
            </button>
          ) : (
            <Link
              href={`/studio/${product.slug}?couleur=${selectedColor?.id ?? ""}&taille=${size}&technique=${technique}&quantite=${quantity}&placement=${placement}`}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--hm-primary)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(177,63,116,0.28)] transition hover:bg-[var(--hm-rose-dark)]"
            >
              🎨 {t("productDetail.cta.customizeItem")}
              <ArrowRight size={16} />
            </Link>
          )}
          {(() => {
            // Paliers actifs : par technique en priorité, sinon grille globale.
            // Avant : les chips n'apparaissaient que si `volumePricing` (global)
            // existait → les produits à grille PAR TECHNIQUE (Bella, Gildan…)
            // cachaient leur avantage volume. On affiche désormais le prix
            // unitaire courant + les paliers dès qu'une grille existe.
            const activeTiers =
              product.volumePricingByTechnique?.[technique] ?? product.volumePricing ?? null;
            return (
              <div className="space-y-3">
                {/* Prix unitaire courant — suit technique · placement · quantité */}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-2xl font-black text-[var(--hm-primary)] tabular-nums transition-all duration-200">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-sm text-[var(--hm-text-soft)]">{t("productDetail.price.taxInclPerPiece")}</span>
                  <span className="text-xs text-[var(--hm-text-soft)]">
                    ({formatPrice(Math.round((currentPrice / 1.2) * 100) / 100)} {t("productDetail.price.taxExcl")})
                  </span>
                </div>

                {/* Paliers dégressifs — surfacent l'avantage volume, palier courant mis en valeur */}
                {activeTiers && activeTiers.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)]">
                      {t("productDetail.price.moreYouOrder")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeTiers.map((tier) => {
                        const isActive =
                          quantity >= tier.from && (tier.to == null || quantity <= tier.to);
                        return (
                          <span
                            key={tier.from}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold tabular-nums transition ${
                              isActive
                                ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                                : "border-[var(--hm-line)] bg-[var(--hm-surface)] text-[var(--hm-text)]"
                            }`}
                          >
                            {tier.to ? `${tier.from}–${tier.to}` : `${tier.from}+`} {t("productDetail.price.pcs")} → {formatPrice(tier.unitPrice)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Réassurance — arguments toujours vrais, sous le prix (benchmark Sticker Mule / 4imprint) */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[var(--hm-text-soft)]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[var(--hm-primary)]" /> {t("productDetail.reassurance.freeBat")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck size={13} className="text-[var(--hm-primary)]" /> {t("productDetail.reassurance.freeShipping")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-[var(--hm-primary)]" /> {t("productDetail.reassurance.alsace")}
            </span>
          </div>
        </div>

        {/* Bascule devis-only : si product.quoteOnly = true, on remplace
            entièrement le ProductConfigurator (et donc le bouton "Ajouter
            au panier") par un CTA "Demander un devis". Aucune logique
            panier / Stripe / API n'est appelée pour ces produits.

            id="mug-commander" : cible du scroll-anchor depuis le CTA principal
            "Commander mon mug" rendu en haut de la colonne droite (cf. ligne ~911).
            Présent pour tous les produits mais utilisé uniquement par les goodies
            — anodin pour les textile/quoteOnly qui n'ont pas de lien vers cet id. */}
        <div id="mug-commander" className="scroll-mt-24">
        {product.quoteOnly ? (
          <QuoteOnlyBlock product={product} />
        ) : (
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
          /* Upload direct sur la fiche pour TOUS les produits à flow simple.
             Fix 2026-06-12 : les polos étaient exclus → upload introuvable →
             « Ajouter au panier » définitivement désactivé (polo invendable). */
          hideLogoUpload={!isSimpleFlowProduct(product)}
          requirePersonalization={product.supplierName === "printful"}
          studioComposedFront={studioComposedFront}
          studioComposedBack={studioComposedBack}
          /* studioCTA volontairement absent (2026-06-10) : le CTA Personnaliser
             unique est en HAUT de la colonne droite (Link direct vers le
             Studio). Goodies/casquettes gardent leur bouton "Ajouter au
             panier" par défaut du ProductConfigurator (upload sur la fiche). */
        />
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
