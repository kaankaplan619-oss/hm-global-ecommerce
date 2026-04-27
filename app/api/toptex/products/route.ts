import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getTopTexProducts, getTopTexProductsPaginated } from "@/lib/toptex";

/**
 * GET /api/toptex/products
 *
 * Admin-only — la clé API TopTex n'est jamais exposée au frontend.
 *
 * Query params :
 *   ?mode=all          → /v3/produits/tous (catalogue complet, peut être lent)
 *   ?page=1&limit=50   → /v3/produits paginé (défaut)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode  = searchParams.get("mode");
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

    const products = mode === "all"
      ? await getTopTexProducts()
      : await getTopTexProductsPaginated(page, limit);

    return NextResponse.json({ products, count: products.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[API /toptex/products]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
