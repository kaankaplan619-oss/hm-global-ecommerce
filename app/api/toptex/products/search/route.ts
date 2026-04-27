import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getTopTexProductBySku, USAGE_RIGHT } from "@/lib/toptex";

/**
 * GET /api/toptex/products/search?q=SKU
 *
 * Admin-only. Recherche un produit TopTex par SKU ou référence catalogue.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json(
        { error: "Paramètre ?q= manquant (SKU ou référence catalogue)" },
        { status: 400 }
      );
    }

    const usageRight = (searchParams.get("usage_right") ?? USAGE_RIGHT) as
      "b2b_uniquement" | "b2c_uniquement" | "b2b_b2c";

    const product = await getTopTexProductBySku(q, usageRight);

    if (!product) {
      return NextResponse.json(
        { error: `Produit "${q}" introuvable dans le catalogue TopTex` },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[API /toptex/products/search]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
