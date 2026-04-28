"use client";

import { useEffect, useState } from "react";
import { COLOR_PACKSHOTS } from "@/data/colorPackshots";
import type { ProductColor } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

interface EnrichmentResult {
  /**
   * Mapping couleur → URLs d'images packshot.
   *
   * Les clés sont soit :
   *  - Des colorIds produit ("noir", "marine", "bordeaux"…) — données statiques COLOR_PACKSHOTS
   *  - Des noms TopTex EN minuscules ("white", "navy"…) — données API live
   *
   * resolveTopTexImages() dans ProductGallery gère les deux formes.
   * Les données statiques ont priorité sur les données API (elles se substituent à un API bloquée).
   */
  colorImages: Record<string, string[]>;
  status: Status;
}

/**
 * Hook client — charge les images TopTex par couleur pour un produit.
 *
 * 1. Charge immédiatement les packshots statiques depuis COLOR_PACKSHOTS
 *    (fiables, pas d'auth, pas de latence réseau).
 * 2. En parallèle, tente l'API enrichment (bloquée si charte Photo Library non acceptée).
 *    Si l'API retourne des données, elles enrichissent les données statiques.
 */
export function useTopTexMedias(
  toptexRef: string | undefined | null,
  _colors: ProductColor[],
  productId?: string
): EnrichmentResult {
  const [colorImages, setColorImages] = useState<Record<string, string[]>>(() => {
    // Initialisation synchrone avec les données statiques
    if (productId && COLOR_PACKSHOTS[productId]) {
      return Object.fromEntries(
        Object.entries(COLOR_PACKSHOTS[productId]).map(([k, v]) => [k, [v]])
      );
    }
    return {};
  });

  const [status, setStatus] = useState<Status>(() =>
    productId && COLOR_PACKSHOTS[productId] ? "success" : "idle"
  );

  useEffect(() => {
    // Données statiques — synchrones
    const staticData: Record<string, string[]> =
      productId && COLOR_PACKSHOTS[productId]
        ? Object.fromEntries(
            Object.entries(COLOR_PACKSHOTS[productId]).map(([k, v]) => [k, [v]])
          )
        : {};

    if (Object.keys(staticData).length > 0) {
      setColorImages(staticData);
      setStatus("success");
    }

    // Données API — asynchrones (peuvent enrichir les données statiques)
    if (!toptexRef) return;

    let cancelled = false;
    if (Object.keys(staticData).length === 0) {
      setStatus("loading");
    }

    fetch(`/api/toptex/enrichment/${encodeURIComponent(toptexRef)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ colorImages: Record<string, string[]> }>;
      })
      .then((data) => {
        if (cancelled) return;
        const apiData = data.colorImages ?? {};
        if (Object.keys(apiData).length > 0) {
          // Fusionner : données statiques (colorId comme clé) en priorité,
          // données API (nom TopTex EN comme clé) en complément
          setColorImages({ ...apiData, ...staticData });
        }
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[useTopTexMedias]", err);
        // Ne pas rétrograder en "error" si on a déjà des données statiques
        if (Object.keys(staticData).length === 0) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [toptexRef, productId]);

  return { colorImages, status };
}
