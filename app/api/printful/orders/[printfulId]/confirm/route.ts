import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { confirmPrintfulOrder } from "@/lib/printful";

type Params = { params: Promise<{ printfulId: string }> };

/**
 * POST /api/printful/orders/[printfulId]/confirm
 * Admin-only. ⚠️ IRRÉVERSIBLE ET PAYANT.
 * Confirme un brouillon Printful → lance la production réelle.
 * N'appeler qu'après validation explicite de l'admin via l'interface.
 */
export async function POST(req: NextRequest, { params }: Params) {
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

    // ⚠️ Déclenche la production et le paiement Printful
    const result = await confirmPrintfulOrder(id);

    // Mise à jour du statut Printful en DB
    const supabaseService = await createSupabaseServiceClient();
    await supabaseService
      .from("orders")
      .update({ printful_status: result.status })
      .eq("printful_order_id", String(id));

    return NextResponse.json({
      success: true,
      printfulOrderId: result.id,
      printfulStatus:  result.status,
    });
  } catch (err) {
    console.error("[POST /api/printful/orders/[id]/confirm]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
