"use client";

import { useEffect, useState } from "react";

export interface StockSummary {
  inStock: boolean;
  totalUnits: number;
  basePriceHT: number | null;
  fetchedAt: string;
}

type Status = "idle" | "loading" | "success" | "error";

/**
 * Hook client — fetche le résumé de stock TopTex pour un SKU.
 *
 * Usage :
 *   const { stock, status } = useTopTexStock(product.toptexRef);
 *
 * Si toptexRef est undefined/null, le hook reste en état "idle".
 */
export function useTopTexStock(toptexRef: string | undefined | null) {
  const [stock, setStock] = useState<StockSummary | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!toptexRef) {
      setStatus("idle");
      setStock(null);
      return;
    }

    let cancelled = false;
    setStatus("loading");

    fetch(`/api/toptex/stock/${encodeURIComponent(toptexRef)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<StockSummary>;
      })
      .then((data) => {
        if (!cancelled) {
          setStock(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [toptexRef]);

  return { stock, status };
}
