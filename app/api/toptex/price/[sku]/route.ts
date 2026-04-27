import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getTopTexPrice } from "@/lib/toptex";

/**
 * GET /api/toptex/price/{sku}
 *
 * Admin-only. Prix catalogue HT TopTex pour un SKU.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { sku } = await params;
    const price = await getTopTexPrice(sku);

    if (!price) {
      return NextResponse.json(
        { error: `Prix introuvable pour "${sku}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({ sku, price });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[API /toptex/price]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
