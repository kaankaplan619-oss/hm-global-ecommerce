import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getTopTexInventory } from "@/lib/toptex";

/**
 * GET /api/toptex/inventory/{sku}
 *
 * Admin-only. Stock brut TopTex pour un SKU.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { sku } = await params;
    const inventory = await getTopTexInventory(sku);

    if (!inventory) {
      return NextResponse.json(
        { error: `Stock introuvable pour "${sku}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({ sku, inventory });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[API /toptex/inventory]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
