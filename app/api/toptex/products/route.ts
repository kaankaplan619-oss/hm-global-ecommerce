import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getTopTexProducts, USAGE_RIGHT } from "@/lib/toptex";

/**
 * GET /api/toptex/products
 *
 * Admin-only. Retourne le catalogue TopTex.
 * Query params :
 *   ?usage_right=b2b_b2c   (défaut)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const usageRight = (searchParams.get("usage_right") ?? USAGE_RIGHT) as
      "b2b_uniquement" | "b2c_uniquement" | "b2b_b2c";

    const products = await getTopTexProducts(usageRight);
    return NextResponse.json({ products, count: products.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[API /toptex/products]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
