"use client";

import { useEffect, useMemo, useState } from "react";
import ProductImage from "@/components/product/ProductImage";
import type { ProductColor } from "@/types";

type ProductGalleryProps = {
  name: string;
  images: string[];
  colors: ProductColor[];
  selectedColor: ProductColor | null;
  badge?: string;
};

function getColorTokens(color: ProductColor | null) {
  if (!color) return [];

  return Array.from(
    new Set(
      color.id.split("-").flatMap((token) => {
        if (token === "gris" || token === "melange" || token === "acier") return ["gris"];
        if (token === "vert" || token === "foret" || token === "bouteille") return ["vert"];
        if (token === "bleu" || token === "royal") return ["bleu"];
        return [token];
      })
    )
  );
}

function buildVariantGallery(
  images: string[],
  colors: ProductColor[],
  selectedColor: ProductColor | null
) {
  const fallback = images.length > 0 ? images : [""];
  const selectedTokens = getColorTokens(selectedColor);
  if (selectedTokens.length === 0) return fallback;

  const allTokens = Array.from(new Set(colors.flatMap((color) => getColorTokens(color))));
  const isDetail = (src: string) => src.includes("/detail-");
  const isFront = (src: string) => src.includes("/front-");
  const hasSelectedToken = (src: string) => selectedTokens.some((token) => src.includes(token));
  const hasOtherToken = (src: string) =>
    allTokens.some((token) => !selectedTokens.includes(token) && src.includes(token));

  const specific = images.filter((src) => hasSelectedToken(src));
  const details = images.filter((src) => isDetail(src) && !hasOtherToken(src));
  const merged = Array.from(new Set([...specific, ...details]));

  if (merged.length > 0) return merged;

  if (details.length > 0) return details;

  const neutralFront = images.find((src) => isFront(src) && !hasOtherToken(src));
  if (neutralFront) return [neutralFront];

  return [images[0]];
}

export default function ProductGallery({
  name,
  images,
  colors,
  selectedColor,
  badge,
}: ProductGalleryProps) {
  const gallery = useMemo(
    () => buildVariantGallery(images, colors, selectedColor),
    [images, colors, selectedColor]
  );
  const [activeImage, setActiveImage] = useState(gallery[0]);

  useEffect(() => {
    setActiveImage(gallery[0]);
  }, [gallery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square bg-white rounded-[28px] overflow-hidden border border-[var(--hm-line)] shadow-[0_20px_48px_rgba(63,45,88,0.08)]">
        <ProductImage
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
          label="Ajoutez les vues produit dans /public/images/products/"
        />

        {badge && (
          <div className="absolute top-4 left-4">
            <span className="badge badge-gold">{badge}</span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)] border border-[var(--hm-line)]">
          {gallery.length} vue{gallery.length > 1 ? "s" : ""} produit
        </div>
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((img, index) => {
            const active = img === activeImage;

            return (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative aspect-square rounded-2xl overflow-hidden border transition-all ${
                  active
                    ? "border-[var(--hm-rose)] shadow-[0_8px_24px_rgba(177,63,116,0.18)]"
                    : "border-[var(--hm-line)] hover:border-[var(--hm-purple)]"
                }`}
              >
                <ProductImage
                  src={img}
                  alt={`${name} vue ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-contain bg-[var(--hm-surface)]"
                  iconSize={24}
                  label="Image"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
