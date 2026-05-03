import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrintfulOrder } from "@/lib/printful";

type Params = { params: Promise<{ printfulId: string }> };

/**
 * GET /api/printful/orders/[printfulId]
 * Admin-only. Récupère le statut live d'une commande Printful depuis l'API.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { printfulId } = await params;
    const id = parseInt(printfulId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "printfulId invalide" }, { status: 400 });
    }

    const order = await getPrintfulOrder(id);
    return NextResponse.json(order);
  } catch (err) {
    console.error("[GET /api/printful/orders/[id]]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
