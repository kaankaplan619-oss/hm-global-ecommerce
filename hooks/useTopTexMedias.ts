"use client";

import { useEffect, useState } from "react";
import type { ProductColor } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

interface EnrichmentResult {
  /**
   * Mapping nom couleur TopTex (minuscules) → URLs d'images packshot.
   * Ex. { "white": ["https://...face.jpg", "https://...back.jpg"] }
   * Vide si les packshots sont bloqués par la charte Photo Library TopTex.
   */
  colorImages: Record<string, string[]>;
  status: Status;
}

/**
 * Hook client — charge les images TopTex par couleur pour un produit.
 *
 * Usage :
 *   const { colorImages, status } = useTopTexMedias(product.toptexRef, product.colors);
 *
 * Si toptexRef est undefined/null, le hook reste en "idle".
 * Les clés de colorImages sont des noms TopTex en minuscules ("white", "navy"…),
 * pas des IDs produit — la correspondance se fait dans ProductGallery.
 */
export function useTopTexMedias(
  toptexRef: string | undefined | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _colors: ProductColor[]
): EnrichmentResult {
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!toptexRef) {
      setStatus("idle");
      setColorImages({});
      return;
    }

    let cancelled = false;
    setStatus("loading");

    fetch(`/api/toptex/enrichment/${encodeURIComponent(toptexRef)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ colorImages: Record<string, string[]> }>;
      })
      .then((data) => {
        if (!cancelled) {
          setColorImages(data.colorImages ?? {});
          setStatus("success");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("[useTopTexMedias]", err);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [toptexRef]);

  return { colorImages, status };
}
