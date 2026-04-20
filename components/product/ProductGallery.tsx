"use client";

import { useEffect, useMemo, useState } from "react";
import ProductImage from "@/components/product/ProductImage";
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
  "marine":         ["NAVY", "NAVYBLUE", "LIGHTNAVY", "NAVY-NEONGREEN"],
  "rouge":          ["RED", "FIRERED", "DEEPRED", "RED-WARMGREY"],
  "bleu-royal":     ["ROYALBLUE", "COBALTBLUE"],
  "bleu-ciel":      ["SKYBLUE", "AZURE", "LIGHTBLUE"],
  "vert-bouteille": ["BOTTLEGREEN", "KELLYGREEN"],
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
};

// ─── Extraction de la clé couleur depuis un nom de fichier ────────────────────
//
// "PS_CGTU01T_WHITE.avif"          → "WHITE"
// "PS_CGTU01T-B_NAVYBLUE.avif"     → "NAVYBLUE"
// "PS_CGJUI62_NAVY-NEONGREEN.avif" → "NAVY-NEONGREEN"
// "front-blanc.jpg"                → "blanc"  (anciens fichiers IA)

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

// ─── Construction de la galerie pour la couleur sélectionnée ─────────────────

function buildVariantGallery(
  images: string[],
  selectedColor: ProductColor | null
): string[] {
  if (images.length === 0) return [""];
  if (!selectedColor) return images;

  const targetKeys = COLOR_IMAGE_MAP[selectedColor.id] ?? [];

  // Fallback si la couleur n'est pas dans le mapping :
  // essaie une correspondance directe avec l'ID en majuscules
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

  const result = [...fronts, ...backs, ...details];

  // Si aucune image ne correspond exactement → première image disponible
  return result.length > 0 ? result : [images[0]];
}

// ─── Composant ────────────────────────────────────────────────────────────────

type ProductGalleryProps = {
  name: string;
  images: string[];
  colors: ProductColor[];
  selectedColor: ProductColor | null;
  badge?: string;
};

export default function ProductGallery({
  name,
  images,
  selectedColor,
  badge,
}: ProductGalleryProps) {
  const gallery = useMemo(
    () => buildVariantGallery(images, selectedColor),
    [images, selectedColor]
  );

  const [activeImage, setActiveImage] = useState(gallery[0]);

  useEffect(() => {
    setActiveImage(gallery[0]);
  }, [gallery]);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Image principale ── */}
      <div className="relative aspect-square overflow-hidden rounded-[28px] border
        border-[var(--hm-line)] bg-white
        shadow-[0_20px_48px_rgba(63,45,88,0.08)]">
        <ProductImage
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
          label="Visuel produit"
        />

        {badge && (
          <div className="absolute left-4 top-4">
            <span className="badge badge-gold">{badge}</span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 rounded-full border border-[var(--hm-line)]
          bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
          {gallery.length} vue{gallery.length > 1 ? "s" : ""}
        </div>
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
                onClick={() => setActiveImage(img)}
                className={`relative aspect-square overflow-hidden rounded-2xl border
                  transition-all duration-200
                  ${active
                    ? "border-[var(--hm-rose)] shadow-[0_6px_18px_rgba(177,63,116,0.18)]"
                    : "border-[var(--hm-line)] hover:border-[var(--hm-purple)]"
                  }`}
              >
                <ProductImage
                  src={img}
                  alt={`${name} vue ${index + 1}`}
                  fill
                  sizes="120px"
                  className="bg-[var(--hm-surface)] object-contain"
                  iconSize={24}
                  label="Vue"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
