import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getTopTexAttributes } from "@/lib/toptex";

/**
 * GET /api/toptex/attributes
 *
 * Admin-only. Retourne les attributs produits TopTex (couleurs, tailles, matières…).
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const attributes = await getTopTexAttributes();
    return NextResponse.json({ attributes, count: attributes.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[API /toptex/attributes]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
