import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/gelato/webhook
 * Reçoit les événements Gelato (mise à jour statut commande, tracking, etc.)
 * À configurer sur dashboard.gelato.com/webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    console.log("[Gelato Webhook] Event reçu:", JSON.stringify(event, null, 2));

    const { event: eventType, order } = event as {
      event: string;
      order: {
        id:               string;
        orderReferenceId: string;
        fulfillmentStatus: string;
        shipments?:       { trackingCode?: string; trackingUrl?: string }[];
      };
    };

    if (!order?.id) {
      return NextResponse.json({ received: true });
    }

    const supabase = await createSupabaseServiceClient();

    // Mise à jour du statut Gelato dans Supabase
    const updateData: Record<string, unknown> = {
      gelato_status: order.fulfillmentStatus,
    };

    // Récupère le tracking si disponible
    const tracking = order.shipments?.[0];
    if (tracking?.trackingCode) {
      updateData.tracking_number = tracking.trackingCode;
      updateData.tracking_url    = tracking.trackingUrl;
    }

    // Map statut Gelato → statut HM Global
    const STATUS_MAP: Record<string, string> = {
      created:     "commande_fournisseur_passee",
      printed:     "en_production",
      shipped:     "expediee",
      delivered:   "livree",
      canceled:    "annulee",
    };

    const hmStatus = STATUS_MAP[order.fulfillmentStatus];
    if (hmStatus) updateData.status = hmStatus;

    await supabase
      .from("orders")
      .update(updateData)
      .eq("gelato_order_id", order.id);

    console.log(`[Gelato Webhook] ${eventType} — commande ${order.id} → ${order.fulfillmentStatus}`);
    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("[Gelato Webhook] Erreur:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
