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
  try {
    const { sku } = await params;

    if (!sku || sku.length < 2) {
      return NextResponse.json({ error: "Référence invalide" }, { status: 400 });
    }

    let headers: HeadersInit;
    try {
      headers = await getAuthHeaders();
    } catch (authErr) {
      return NextResponse.json(
        { error: "Auth failed", detail: String(authErr) },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const url =
      `https://api.toptex.io/v3/products` +
      `?catalog_reference=${encodeURIComponent(sku)}` +
      `&usage_right=b2b_b2c` +
      `&lang=fr`;

    const res = await fetch(url, { headers, cache: "no-store" });

    let raw: unknown;
    try {
      raw = await res.json();
    } catch {
      const text = await res.text().catch(() => "(non-lisible)");
      return NextResponse.json(
        { error: "Non-JSON response", httpStatus: res.status, body: text },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = raw as Record<string, unknown>;

    // Analyse de structure pour faciliter le débogage
    const analysis: Record<string, unknown> = {
      httpStatus: res.status,
      topLevelKeys: Object.keys(data),
      colorsCount: Array.isArray(data.colors) ? data.colors.length : `N/A — type: ${typeof data.colors}`,
      isArray: Array.isArray(data),
    };

    if (Array.isArray(data.colors) && data.colors.length > 0) {
      const firstColor = data.colors[0] as Record<string, unknown>;
      analysis.firstColorKeys = Object.keys(firstColor);
      analysis.firstColorColorField = firstColor.colors ?? firstColor.colorName ?? "MISSING";
      analysis.firstColorPackshots = firstColor.packshots ?? "MISSING";
      analysis.firstColorMedias = firstColor.medias ?? firstColor.images ?? firstColor.photos ?? "MISSING";
    }

    // Si la réponse est un tableau (certains endpoints retournent [])
    if (Array.isArray(data) || Array.isArray(raw)) {
      const arr = (Array.isArray(raw) ? raw : []) as Array<Record<string, unknown>>;
      analysis.isArrayResponse = true;
      analysis.arrayLength = arr.length;
      if (arr.length > 0) {
        analysis.firstItemKeys = Object.keys(arr[0]);
      }
    }

    return NextResponse.json(
      { sku, url, analysis, raw },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", detail: String(err) },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
