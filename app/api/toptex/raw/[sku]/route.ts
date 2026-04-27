import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/toptex";

/**
 * GET /api/toptex/raw/{sku}
 *
 * Retourne la réponse brute de l'API TopTex pour un produit donné.
 * Endpoint de diagnostic — permet de voir la structure JSON exacte
 * retournée par TopTex afin de corriger le parsing.
 *
 * Exemples :
 *   /api/toptex/raw/CGTU01T  → T-shirt B&C
 *   /api/toptex/raw/K239     → Veste Kariban
 *   /api/toptex/raw/IB320    → T-shirt iDeal
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  const { sku } = await params;

  if (!sku || sku.length < 2) {
    return NextResponse.json({ error: "Référence invalide" }, { status: 400 });
  }

  const headers = await getAuthHeaders();

  const url =
    `https://api.toptex.io/v3/products` +
    `?catalog_reference=${encodeURIComponent(sku)}` +
    `&usage_right=b2b_b2c` +
    `&lang=fr`;

  const res = await fetch(url, { headers, cache: "no-store" });
  const raw = await res.json();

  // Analyse de structure pour faciliter le débogage
  const analysis: Record<string, unknown> = {
    httpStatus: res.status,
    topLevelKeys: Object.keys(raw),
    colorsCount: Array.isArray(raw.colors) ? raw.colors.length : "N/A (not array)",
  };

  if (Array.isArray(raw.colors) && raw.colors.length > 0) {
    const firstColor = raw.colors[0];
    analysis.firstColorKeys = Object.keys(firstColor);
    analysis.firstColorColorField = firstColor.colors ?? firstColor.colorName ?? "MISSING";
    analysis.firstColorPackshots = firstColor.packshots ?? "MISSING";
    analysis.firstColorMedias = firstColor.medias ?? firstColor.images ?? firstColor.photos ?? "MISSING";
  }

  return NextResponse.json(
    { sku, url, analysis, raw },
    { headers: { "Cache-Control": "no-store" } }
  );
}
