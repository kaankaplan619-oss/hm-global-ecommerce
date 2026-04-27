import { NextRequest, NextResponse } from "next/server";
import { getTopTexStockSummary } from "@/lib/toptex";

/**
 * GET /api/toptex/stock/{sku}
 *
 * Public (pas d'auth requise — seulement un résumé, pas de données sensibles).
 * Retourne un résumé simplifié du stock TopTex pour affichage sur les fiches produit.
 *
 * Cache : 5 minutes (revalidate: 300).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;

    if (!sku || sku.length < 2) {
      return NextResponse.json({ error: "SKU invalide" }, { status: 400 });
    }

    const summary = await getTopTexStockSummary(sku);
    return NextResponse.json(summary, {
      headers: {
        // Cache CDN 5 min, stale-while-revalidate 10 min
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[API /toptex/stock]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
