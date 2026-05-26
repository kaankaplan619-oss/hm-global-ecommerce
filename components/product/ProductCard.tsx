"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Layers3 } from "lucide-react";
import { formatPrice } from "@/data/pricing";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { getVisualMode } from "@/lib/hm-visual-utils";
import { getDisplayedColors, isPrintifyV1Product } from "@/lib/suppliers/printify/printify-colors";
import { getV1PrintifyImage } from "@/lib/suppliers/printify/v1-image";
import type { Product } from "@/types";
import HMProductVisual from "@/components/product/HMProductVisual";
import ProductImageStage from "@/components/product/ProductImageStage";

// Three.js chargé uniquement côté client — jamais en SSR
const TShirt3DViewer = dynamic(
  () => import("@/components/product/TShirt3DViewer"),
  { ssr: false }
);

interface ProductCardProps {
  product: Product;
}

const CATEGORY_LABEL: Record<string, string> = {
  tshirts:    "T-shirt",
  hoodies:    "Hoodie / Sweat",
  softshells: "Softshell",
  polos:      "Polo",
  polaires:   "Polaire / Doudoune",
  casquettes: "Casquette",
  sacs:       "Sac & Tote",
  goodies:    "Mug & Goodie",
  enfants:    "Enfant",
};

const CATEGORY_USAGE: Record<string, string> = {
  tshirts:    "Équipes, événements, associations",
  hoodies:    "Marque, équipe, merch premium",
  softshells: "Terrain, chantier, nettoyage",
  polos:      "Entreprise, restaurant, accueil",
  polaires:   "Extérieur, logistique, équipe terrain",
  casquettes: "Événement, club, staff",
  sacs:       "Goodies, boutique, événement",
  goodies:    "Cadeaux clients, séminaires",
  enfants:    "Écoles, clubs, sorties",
};

const TECHNIQUE_LABEL: Record<string, string> = {
  dtf:                "DTF",
  dtflex:             "DTFlex",
  flex:               "Flex",
  broderie:           "Broderie",
  broderie_illimitee: "Broderie",
  print:              "Print",
};

function recommendedTechnique(product: Product): string {
  const preferred = product.techniqueRecommandee ?? product.techniques[0];
  return TECHNIQUE_LABEL[preferred] ?? preferred.toUpperCase();
}

function recommendedMinimum(product: Product): string {
  if (product.quoteOnly) return "Sur devis";
  return `${product.minOrderQty ?? 10} pcs`;
}

function indicativeDelay(product: Product): string {
  if (product.category === "goodies") return "3-7 j ouvrés";
  if (product.techniques.includes("broderie") || product.techniques.includes("broderie_illimitee")) {
    return "7-12 j ouvrés";
  }
  return "5-10 j ouvrés";
}

export default function ProductCard({ product }: ProductCardProps) {
  // Filtre les techniques à 0 (= non disponibles) avant de prendre le min
  const prices = [
    product.pricing.dtf,
    product.pricing.flex,
    product.pricing.broderie,
  ].filter((p) => p > 0);
  const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

  // Couleurs affichées : pour les produits Printify V1, on filtre strictement
  // sur les couleurs réellement disponibles (manifest + mapping variant_id).
  // Pour les autres produits : liste complète inchangée.
  const displayedColors = getDisplayedColors(product.id, product.colors);

  // Coloris par défaut pour sélectionner le bon mockup / packshot
  const defaultColor =
    displayedColors.find((c) => c.available) ?? displayedColors[0] ?? product.colors[0];

  // Pour les 6 produits Printify V1 : image STRICTEMENT issue de /mockups/printify/.
  const isPrintifyV1 = isPrintifyV1Product(product.id);
  const v1Image      = isPrintifyV1 ? getV1PrintifyImage(product.id, defaultColor?.id, "front") : null;
  // Sinon : pipeline historique (TopTex, autres Printful, packshots)
  const catalogImage = v1Image ?? getProductCatalogImage(product, defaultColor?.id);

  // Mode visuel : Printful + Spreadshirt → rendu simple fond blanc (pas HMProductVisual)
  const isPrintful = product.supplierName === "printful" || product.supplierName === "spreadshirt";
  const visualMode = isPrintful ? "supplier" : getVisualMode(product);

  // 3D hover uniquement pour les t-shirts NON V1 (les V1 ont des mockups réels obligatoires).
  const is3DCapable = isPrintful && product.category === "tshirts" && !isPrintifyV1;

  // ── Hover 3D ─────────────────────────────────────────────────────────────────
  const [show3D, setShow3D] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (!is3DCapable) return;
    // Délai 180ms pour éviter les faux positifs (scroll rapide)
    timerRef.current = setTimeout(() => setShow3D(true), 180);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow3D(false);
  };

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="hm-card-enter group card card-hover block overflow-hidden"
    >
      {/* ── Zone image (plus haute pour donner plus d'impact au produit) ─── */}
      <div
        className="relative aspect-[4/4.4] overflow-hidden rounded-t-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        {isPrintful ? (
          /* Scène image premium unifiée — produit valorisé par scale + ombre + gradient */
          show3D ? (
            /* 3D viewer (hover) — uniquement t-shirts NON-V1 (gate dans is3DCapable) */
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.72) 38%, rgba(244,241,234,1) 100%)",
                borderBottom: "1px solid rgba(60,45,75,0.06)",
              }}
            >
              <TShirt3DViewer
                color={defaultColor?.hex ?? "#111111"}
                autoRotate
                hideLabel
                className="absolute inset-0 w-full h-full"
              />
            </div>
          ) : catalogImage || product.category !== "goodies" ? (
            <div className="absolute inset-0">
              <ProductImageStage
                src={catalogImage || "/mockups/tshirt/blanc-front.webp"}
                alt={product.name}
                category={product.category}
                variant="catalog"
                sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          ) : (
            /* Placeholder goodies */
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-30 select-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.72) 38%, rgba(244,241,234,1) 100%)",
              }}
            >
              <span className="text-6xl leading-none">☕</span>
              <span className="text-[10px] font-medium text-[var(--hm-text-soft)] tracking-wide">Visuel à venir</span>
            </div>
          )
        ) : (
          /* Autres produits (TopTex, etc.) : HMProductVisual avec mode hm/supplier */
          <HMProductVisual
            src={catalogImage}
            alt={product.name}
            mode={visualMode}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
            imageClassName={`object-contain transition-transform duration-500${
              // WG004 — exception ciblée : le packshot TopTex CDN (PS_CGWG004_*.png)
              // a ~67% de marge blanche (produit centré dans une bbox de 1270×1044
              // sur 2000×2000), ce qui rend l'image visuellement trop petite dans
              // la card vs les sweats Printify cropped (fill 83%).
              //
              // Iter 2 (2026-05-26) : passage de scale 1.15 → 1.40 pour harmoniser
              // visuellement avec les Gildan 18000/18500. Fill apparent ~33% × 1.40²
              // ≈ 65%, proche du 83% Gildan sans risque de couper les manches
              // (produit occupe 89% de la largeur après scale, marge edge 11%).
              // Ne s'applique qu'à WG004 ; les autres sweats Falk&Ross actuellement
              // invisibles ne sont pas affectés.
              product.id === "wg004"
                ? " scale-[1.40] group-hover:scale-[1.47]"
                : " group-hover:scale-105"
            }${visualMode === "hm" ? " p-5 relative z-10" : " p-2"}`}
            showBadge={false}
          />
        )}

        {/* Rupture de stock */}
        {displayedColors.length > 0 && displayedColors.every((c) => !c.available) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="badge badge-neutral text-base">Rupture de stock</span>
          </div>
        )}

        {/* Badge premium (overlay top-right) — affiché uniquement si product.badge est défini.
            Ex. "En stock agence", "Bestseller", "Nouveau". Style cohérent avec
            `.badge .badge-gold` (globals.css) + ombre légère pour lisibilité sur image. */}
        {product.badge && (
          <div className="pointer-events-none absolute right-2.5 top-2.5 z-20">
            <span className="badge badge-gold bg-white/95 shadow-sm backdrop-blur-sm">
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* ── Bande swatches — barre dédiée avec border-top, jamais sur l'image ── */}
      {!show3D && displayedColors.length > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 min-h-[36px]"
          style={{
            borderTop: "1px solid rgba(60,45,75,0.06)",
            background: "rgba(255,255,255,0.55)",
          }}
        >
          {displayedColors.slice(0, 6).map((color) => (
            <div
              key={color.id}
              className="h-4 w-4 rounded-full border border-black/15 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              style={{ backgroundColor: color.hex }}
              title={color.label}
            />
          ))}
          {displayedColors.length > 6 && (
            <span className="text-[10px] font-medium text-[var(--hm-text-muted)]">
              +{displayedColors.length - 6}
            </span>
          )}
        </div>
      )}

      {/* ── Infos produit ─────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-[10px] text-[var(--hm-text-soft)] font-mono">{product.reference}</p>
          <span className="text-[10px] text-[var(--hm-text-soft)] inline-flex items-center gap-1">
            <Layers3 size={11} />
            {CATEGORY_LABEL[product.category] ?? product.category}
          </span>
        </div>

        <h3 className="text-sm font-bold text-[var(--hm-text)] mb-2 group-hover:text-[var(--hm-rose)] transition-colors">
          {product.shortName}
        </h3>

        <div className="mb-3 grid gap-1.5 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-3">
          <p className="line-clamp-1 text-[11px] text-[var(--hm-text-soft)]">
            <span className="font-semibold text-[var(--hm-text)]">Usage :</span>{" "}
            {product.ideaPour?.[0] ?? CATEGORY_USAGE[product.category] ?? "Projet textile"}
          </p>
          <p className="text-[11px] text-[var(--hm-text-soft)]">
            <span className="font-semibold text-[var(--hm-text)]">Technique :</span>{" "}
            {recommendedTechnique(product)}
          </p>
          <p className="text-[11px] text-[var(--hm-text-soft)]">
            <span className="font-semibold text-[var(--hm-text)]">Min. :</span>{" "}
            {recommendedMinimum(product)} · {indicativeDelay(product)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[var(--hm-text-soft)]">Dès </span>
            <span className="text-base font-black text-[var(--hm-rose)]">
              {formatPrice(basePrice)}
            </span>
            <span className="text-[10px] text-[var(--hm-text-soft)]"> TTC</span>
          </div>
          <span className="text-[10px] text-[var(--hm-text-soft)]">
            {formatPrice(basePrice / 1.2)} HT
          </span>
        </div>

        <span className="mt-3 flex w-full items-center justify-center rounded-xl bg-[var(--hm-primary)] px-3 py-2 text-[11px] font-bold text-white transition group-hover:bg-[var(--hm-rose-dark)]">
          Voir la fiche
        </span>
      </div>
    </Link>
  );
}
