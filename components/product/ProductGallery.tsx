"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import type { ProductColor } from "@/types";

// ─── Mapping couleur ID → clés anglaises dans les noms de fichiers ────────────
//
// Les photos officielles B&C (Top Tex) utilisent des noms anglais :
//   PS_CGTU01T_WHITE.avif, PS_CGWU620_BLACK.avif, PS_CGJUI62_NAVY-NEONGREEN.avif
//
// Ce tableau fait le lien entre les IDs français du catalogue et les
// fragments présents dans les noms de fichiers.

const COLOR_IMAGE_MAP: Record<string, string[]> = {
  // ── T-shirts ──────────────────────────────────────────────────────
  "blanc":          ["WHITE"],
  "noir":           ["BLACK", "BLACKPURE", "USEDBLACK", "BLACK-BLACK"],
  "gris":           ["SPORTGREY", "ASH", "DARKGREY"],
  "gris-melange":   ["HEATHERGREY", "SPORTGREY", "ASH"],
  "gris-acier":     ["STEELGREY", "DARKGREY", "DARKGREY-NEONORANGE"],
  "gris-anthracite":["ANTHRACITE", "DARKGREY", "STEELGREY"],
  "anthracite":     ["ANTHRACITE", "DARKGREY", "STEELGREY"],
  "marine":         ["NAVY", "NAVYBLUE", "LIGHTNAVY", "NAVY-NEONGREEN"],
  "rouge":          ["RED", "FIRERED", "DEEPRED", "RED-WARMGREY"],
  "bleu-royal":     ["ROYALBLUE", "COBALTBLUE"],
  "bleu-ciel":      ["SKYBLUE", "AZURE", "LIGHTBLUE"],
  "vert-bouteille": ["BOTTLEGREEN", "KELLYGREEN"],
  "vert-kelly":     ["KELLYGREEN", "BOTTLEGREEN"],
  "vert-foret":     ["BOTTLEGREEN", "KELLYGREEN", "ORCHIDGREEN"],
  "bordeaux":       ["BURGUNDY", "DEEPRED"],
  "turquoise":      ["TURQUOISE", "REALTURQUOISE", "ATOLL", "ATOLL-GHOSTGREY"],
  "denim":          ["DENIM", "DIVABLUE"],
  "or":             ["GOLD"],
  "orange":         ["ORANGE", "FIRERED"],
  "jaune":          ["SOLARYELLOW", "GOLD"],
  "rose":           ["MILLENNIALPINK", "APRICOT", "FUCHSIA"],
  "fuchsia":        ["FUCHSIA", "RADIANTPURPLE"],
  "violet":         ["RADIANTPURPLE", "URBANPURPLE"],
  "kaki":           ["URBANKHAKI", "MILLENNIALKHAKI", "BEARBROWN"],
  "naturel":        ["NATURAL", "SAND"],
  "blanc-casse":    ["WHITE", "NATURAL"],
  "beige":          ["SAND", "NATURAL", "BEIGE"],
  "caramel":        ["CARAMEL", "BEARBROWN", "TAN"],
  "chocolat":       ["CHOCOLATE", "BEARBROWN", "BROWN"],
};

// ─── Extraction de la clé couleur depuis un nom de fichier ────────────────────
function extractImageColor(src: string): string {
  // Format officiel Top Tex : PS_CG{REF}[-B|-S]_{COLOR}.{ext}
  const official = src.match(/_([A-Z][A-Z0-9]+(?:-[A-Z0-9]+)*)\.(?:avif|png)$/i);
  if (official) return official[1].toUpperCase();
  // Ancien format IA : front-blanc.jpg / back-noir.jpg / detail-col.jpg
  const legacy = src.match(/(?:front|back|detail)-([^/.]+)\./i);
  if (legacy) return legacy[1].toLowerCase();
  return "";
}

function isBackView(src: string): boolean {
  return /-B_/.test(src) || /back-/.test(src);
}
function isSideOrDetail(src: string): boolean {
  return /-S_/.test(src) || /detail-/.test(src);
}

// ─── Résolution images TopTex (clés EN) → ID couleur site ────────────────────
//
// Le hook useTopTexMedias retourne colorImages dont les clés sont les noms
// TopTex EN en minuscules ("white", "navy"…).
// Cette table permet de trouver les images depuis l'ID produit ("blanc", "marine"…).

const TOPTEX_NAME_TO_COLOR_ID: Record<string, string> = {
  "white":                "blanc",
  "natural":              "blanc-casse",
  "raw natural":          "blanc-casse",
  "sand":                 "beige",
  "beige":                "beige",
  "ash":                  "gris",
  "ash heather":          "gris",
  "pacific grey":         "gris",
  "black":                "noir",
  "black pure":           "noir",
  "used black":           "noir",
  "navy":                 "marine",
  "navy blue":            "marine",
  "light navy":           "marine",
  "french navy heather":  "marine",
  "navy heather":         "marine",
  "sport grey":           "gris",
  "grey":                 "gris",
  "oxford grey":          "gris",
  "grey heather":         "gris-melange",
  "dark grey":            "gris-anthracite",
  "anthracite":           "anthracite",
  "burgundy":             "bordeaux",
  "wine":                 "bordeaux",
  "deep red":             "bordeaux",
  "red":                  "rouge",
  "fire red":             "rouge",
  "light royal blue":     "bleu-royal",
  "royal blue":           "bleu-royal",
  "cobalt blue":          "bleu-royal",
  "electric blue":        "bleu-royal",
  "sky blue":             "bleu-ciel",
  "azure":                "bleu-ciel",
  "light blue":           "bleu-ciel",
  "bottle green":         "vert-bouteille",
  "forest green":         "vert-bouteille",
  "kelly green":          "vert-kelly",
  "orchid green":         "vert-kelly",
  "pistachio":            "vert-kelly",
  "orange":               "orange",
  "apricot":              "rose",
  "solar yellow":         "jaune",
  "gold":                 "or",
  "real turquoise":       "turquoise",
  "turquoise":            "turquoise",
  "atoll":                "turquoise",
  "atoll blue":           "turquoise",
  "diva blue":            "turquoise",
  "fuchsia":              "fuchsia",
  "millennial pink":      "rose",
  "radiant purple":       "violet",
  "urban purple":         "violet",
  "urban khaki":          "kaki",
  "millennial khaki":     "kaki",
  "light khaki":          "kaki",
  "khaki":                "kaki",
  "sage":                 "sauge",
  "bear brown":           "kaki",
  "denim":                "denim",
};

/**
 * Cherche dans les images TopTex (clés EN minuscules) celles qui correspondent
 * à notre ID couleur produit.
 * Retourne [] si aucune image n'est disponible.
 */
function resolveTopTexImages(
  colorId: string,
  colorImages: Record<string, string[]>
): string[] {
  // 1. Correspondance directe (cas où la clé coïnciderait)
  if (colorImages[colorId]?.length) return colorImages[colorId];

  // 2. Chercher toutes les clés TopTex qui correspondent à notre colorId
  for (const [toptexName, mappedId] of Object.entries(TOPTEX_NAME_TO_COLOR_ID)) {
    if (mappedId === colorId && colorImages[toptexName]?.length) {
      return colorImages[toptexName];
    }
  }
  return [];
}

// ─── Construction de la galerie pour la couleur sélectionnée ─────────────────

function buildVariantGallery(
  images: string[],
  selectedColor: ProductColor | null,
  colorImages?: Record<string, string[]>
): string[] {
  if (images.length === 0) return [""];

  // Priorité 1 : images TopTex per-color si disponibles via API
  if (selectedColor && colorImages && Object.keys(colorImages).length > 0) {
    const topTexUrls = resolveTopTexImages(selectedColor.id, colorImages);
    if (topTexUrls.length > 0) return topTexUrls;
  }

  // Priorité 2 : images CDN (https://) → toutes les vues, peu importe la couleur
  // Les packshots Toptex sont valables pour n'importe quelle couleur sélectionnée.
  const cdnImages = images.filter((img) => img.startsWith("https://"));
  if (cdnImages.length > 0) return cdnImages;

  // Priorité 3 : correspondance par nom de fichier (ancien format local)
  if (!selectedColor) return images;

  const targetKeys = COLOR_IMAGE_MAP[selectedColor.id] ?? [];
  const keys =
    targetKeys.length > 0
      ? targetKeys
      : [selectedColor.id.toUpperCase(), selectedColor.label.toUpperCase()];

  const matchesColor = (src: string): boolean => {
    const imageColor = extractImageColor(src);
    return keys.some((key) => imageColor === key);
  };

  const fronts  = images.filter((src) => matchesColor(src) && !isBackView(src) && !isSideOrDetail(src));
  const backs   = images.filter((src) => matchesColor(src) && isBackView(src));
  const details = images.filter((src) => isSideOrDetail(src));
  const result  = [...fronts, ...backs, ...details];

  // Fallback → première image disponible
  return result.length > 0 ? result : [images[0]];
}

// ─── Utilitaire exporté ───────────────────────────────────────────────────────

export function colorHasImages(
  images: string[],
  color: ProductColor,
  colorImages?: Record<string, string[]>
): boolean {
  if (images.length === 0) return false;

  // CDN packshots (https://) sont toujours valides — visuel disponible pour toute couleur
  if (images.some((img) => img.startsWith("https://"))) return true;

  // Images TopTex per-color disponibles via API
  if (colorImages && Object.keys(colorImages).length > 0) {
    if (resolveTopTexImages(color.id, colorImages).length > 0) return true;
  }

  // Fallback : correspondance par nom de fichier local
  const targetKeys = COLOR_IMAGE_MAP[color.id] ?? [];
  const keys =
    targetKeys.length > 0
      ? targetKeys
      : [color.id.toUpperCase(), color.label.toUpperCase()];
  return images.some((src) => {
    const imageColor = extractImageColor(src);
    return keys.some((key) => imageColor === key);
  });
}

// ─── Image avec fade ──────────────────────────────────────────────────────────

function GalleryImage({
  src,
  alt,
  fill,
  priority,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Placeholder uniquement si pas de src ou erreur réelle de chargement
  if (!src || error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,var(--hm-accent-soft-blue),var(--hm-accent-soft-purple))]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white bg-white/80 shadow-sm">
          <Package size={36} className="text-[var(--hm-purple)]" />
        </div>
        <p className="px-4 text-center text-[11px] font-medium text-[var(--hm-text-soft)]">
          Visuel produit à venir
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Skeleton pendant le chargement de l'image */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[var(--hm-accent-soft-blue)] to-[var(--hm-accent-soft-purple)]" />
      )}
      <Image
        key={src}
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={[
          className,
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        ]
          .filter(Boolean)
          .join(" ")}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        unoptimized={src.startsWith("https://cdn.toptex.com")}
      />
    </>
  );
}
// ─── Composant principal ──────────────────────────────────────────────────────

type ProductGalleryProps = {
  name: string;
  images: string[];
  colors: ProductColor[];
  selectedColor: ProductColor | null;
  badge?: string;
  /**
   * Map colorId → imageUrls chargée depuis l'API TopTex.
   * Prioritaire sur le fallback filename-based.
   */
  colorImages?: Record<string, string[]>;
  /** True pendant le chargement des medias TopTex */
  mediasLoading?: boolean;
};

export default function ProductGallery({
  name,
  images,
  selectedColor,
  badge,
  colorImages,
  mediasLoading,
}: ProductGalleryProps) {
  const gallery = useMemo(
    () => buildVariantGallery(images, selectedColor, colorImages),
    [images, selectedColor, colorImages]
  );

  const [activeImage, setActiveImage] = useState(gallery[0]);

  useEffect(() => {
    setActiveImage(gallery[0]);
  }, [gallery]);

  const handleThumb = useCallback((img: string) => {
    setActiveImage(img);
  }, []);

  // Indique si ce produit supporte le changement d'image par couleur
  const hasColorVariants =
    (colorImages && Object.keys(colorImages).length > 0) ||
    images.some((img) => extractImageColor(img) !== "");

  return (
    <div className="flex flex-col gap-4">
      {/* ── Image principale ── */}
      <div
        className="relative aspect-square overflow-hidden rounded-[28px] border
          border-[var(--hm-line)] bg-white
          shadow-[0_20px_48px_rgba(63,45,88,0.08)]"
      >
        <GalleryImage
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />

        {badge && (
          <div className="absolute left-4 top-4">
            <span className="badge badge-gold">{badge}</span>
          </div>
        )}

        {/* Compteur de vues */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
            {gallery.length} vue{gallery.length > 1 ? "s" : ""}
          </span>
          {/* Indicateur chargement medias */}
          {mediasLoading && (
            <span className="rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] text-[var(--hm-text-soft)]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--hm-purple)]" />
            </span>
          )}
        </div>

        {/* Badge "vues par couleur" */}
        {hasColorVariants && !mediasLoading && (
          <div className="absolute bottom-4 right-4">
            <span className="rounded-full bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] px-2.5 py-1 text-[10px] font-semibold text-[var(--hm-purple)]">
              Photos par coloris
            </span>
          </div>
        )}
      </div>

      {/* ── Miniatures ── */}
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((img, index) => {
            const active = img === activeImage;
            return (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => handleThumb(img)}
                className={`relative aspect-square overflow-hidden rounded-2xl border
                  transition-all duration-200
                  ${
                    active
                      ? "border-[var(--hm-rose)] shadow-[0_6px_18px_rgba(177,63,116,0.18)]"
                      : "border-[var(--hm-line)] hover:border-[var(--hm-purple)]"
                  }`}
              >
                <GalleryImage
                  src={img}
                  alt={`${name} vue ${index + 1}`}
                  fill
                  sizes="120px"
                  className="bg-[var(--hm-surface)] object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
