import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { getOrder, isPrintoclockConfigured } from "@/lib/printoclock";

/**
 * GET /api/printoclock/orders/[id]
 * Admin-only. Récupère le statut live d'une commande PrintoClock.
 * Met à jour poc_order_state dans Supabase si changement.
 *
 * [id] = poc_order_id (numérique, retourné lors de la création)
 */
export async function GET(
  req:     NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (!isPrintoclockConfigured()) {
      return NextResponse.json(
        { error: "PrintoClock non configuré." },
        { status: 503 }
      );
    }

    const { id } = await params;
    const pocOrder = await getOrder(id);

    // Sync le statut dans Supabase si nécessaire
    const supabaseService = await createSupabaseServiceClient();
    await supabaseService
      .from("orders")
      .update({ poc_order_state: pocOrder.state })
      .eq("poc_order_id", id);

    // Extrait le tracking du premier envoi si disponible
    const tracking = pocOrder.shipments?.[0]?.packages?.[0];

    return NextResponse.json({
      id:           pocOrder.id,
      number:       pocOrder.number,
      state:        pocOrder.state,
      paymentState: pocOrder.paymentState,
      shippingState: pocOrder.shippingState,
      total:        pocOrder.total / 100, // centimes → euros
      estimatedDeliveryDate: pocOrder.estimatedDeliveryDate,
      tracking: tracking
        ? {
            number:   tracking.tracking,
            url:      tracking.trackingUrl,
            weight:   tracking.weight,
          }
        : null,
      items: pocOrder.items?.map((item) => ({
        id:                 item.id,
        productName:        item.productName,
        variantName:        item.variantName,
        quantity:           item.quantity,
        documentState:      item.documentState,
        manufacturingState: item.manufacturingState,
        estimatedDelivery:  item.estimatedDeliveryDate,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
