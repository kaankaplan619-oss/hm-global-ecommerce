"use client";

import { useState } from "react";
import ProductImage from "@/components/product/ProductImage";

type ProductGalleryProps = {
  name: string;
  images: string[];
  badge?: string;
};

export default function ProductGallery({ name, images, badge }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : [""];
  const [activeImage, setActiveImage] = useState(gallery[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square bg-white rounded-[28px] overflow-hidden border border-[var(--hm-line)] shadow-[0_20px_48px_rgba(63,45,88,0.08)]">
        <ProductImage
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
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
                  className="object-cover"
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
