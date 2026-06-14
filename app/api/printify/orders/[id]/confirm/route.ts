import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendPrintifyOrderToProduction } from "@/lib/suppliers/printify/client";

/**
 * POST /api/printify/orders/[id]/confirm
 * Admin-only. Envoie la commande Printify (brouillon) EN PRODUCTION.
 * ⚠️ IRRÉVERSIBLE et PAYANT — n'appeler qu'après validation admin explicite.
 *
 * [id] = id de la commande HM Global (pas l'id Printify).
 * Met à jour `printify_status` uniquement (statut Printify libre) — le statut
 * principal de la commande reste piloté par le flux HM/webhook.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

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

    const supabaseService = await createSupabaseServiceClient();
    const { data: order, error } = await supabaseService
      .from("orders")
      .select("printify_order_id")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    if (!order.printify_order_id) {
      return NextResponse.json(
        { error: "Aucun brouillon Printify pour cette commande — créer d'abord le brouillon." },
        { status: 422 }
      );
    }

    const result = await sendPrintifyOrderToProduction(String(order.printify_order_id));

    await supabaseService
      .from("orders")
      .update({ printify_status: result.status ?? "in-production" })
      .eq("id", orderId);

    return NextResponse.json({
      success:        true,
      printifyStatus: result.status ?? "in-production",
    });
  } catch (err) {
    console.error("[POST /api/printify/orders/[id]/confirm]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
