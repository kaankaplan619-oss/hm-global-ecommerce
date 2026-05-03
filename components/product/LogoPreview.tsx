"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Product, ProductColor, Placement } from "@/types";

interface Props {
  product: Product;
  color: ProductColor | null;
  logoFile: File | null;
  placement: Placement;
}

export default function LogoPreview({ product, color, logoFile, placement }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const previewImage =
    color && product.previewImages ? (product.previewImages[color.id] ?? null) : null;

  const showPreview = !!previewImage && (placement === "coeur" || placement === "coeur-dos");

  useEffect(() => {
    if (!logoFile) {
      setLogoUrl(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  if (!showPreview) return null;

  return (
    <div>
      <label className="label">Aperçu emplacement cœur</label>
      <div className="relative aspect-[4/3] bg-[#111111] rounded-xl overflow-hidden border border-[#1e1e1e]">
        <Image
          src={previewImage!}
          alt="Aperçu emplacement cœur"
          fill
          className="object-cover"
        />

        {logoUrl ? (
          /* Logo overlay — centered on chest area */
          <div
            className="absolute"
            style={{
              top: "38%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "20%",
              maxWidth: "110px",
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Votre logo"
              className="w-full h-auto object-contain"
            />
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <span className="text-[10px] text-[#8a8a8a] bg-[#0a0a0aaa] px-3 py-1.5 rounded-full">
              Ajoutez votre logo pour visualiser le rendu
            </span>
          </div>
        )}
      </div>
      <p className="text-[10px] text-[#555555] mt-2">
        Aperçu indicatif — le positionnement final est défini lors de la validation de votre fichier.
      </p>
    </div>
  );
}
