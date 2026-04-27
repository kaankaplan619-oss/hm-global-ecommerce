"use client";

import { useEffect, useState } from "react";
import type { ProductColor } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

interface EnrichmentResult {
  /** colorId → array of image URLs from TopTex medias */
  colorImages: Record<string, string[]>;
  status: Status;
}

/**
 * Hook client — charge les images TopTex par couleur pour un produit.
 *
 * Usage :
 *   const { colorImages } = useTopTexMedias(product.toptexRef, product.colors);
 *
 * Si toptexRef est undefined, le hook reste en état "idle" et retourne {}.
 */
export function useTopTexMedias(
  toptexRef: string | undefined | null,
  colors: ProductColor[]
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

    const colorsParam = encodeURIComponent(
      JSON.stringify(colors.map((c) => ({ id: c.id, label: c.label })))
    );

    fetch(`/api/toptex/enrichment/${encodeURIComponent(toptexRef)}?colors=${colorsParam}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<{ colorImages: Record<string, string[]> }>;
      })
      .then((data) => {
        if (!cancelled) {
          setColorImages(data.colorImages ?? {});
          setStatus("success");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toptexRef]);

  return { colorImages, status };
}
