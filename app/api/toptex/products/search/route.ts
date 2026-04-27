import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getTopTexProductBySku } from "@/lib/toptex";

/**
 * GET /api/toptex/products/search?q=SKU_OU_REFERENCE
 *
 * Admin-only. Recherche un produit TopTex par SKU ou référence catalogue.
 * Retourne 404 si aucun produit trouvé.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json(
        { error: "Paramètre ?q= manquant (SKU ou référence)" },
        { status: 400 }
      );
    }

    const product = await getTopTexProductBySku(q);

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
