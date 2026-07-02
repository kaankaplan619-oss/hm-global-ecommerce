import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rate-limit";

/**
 * POST /api/gelato/webhook
 * Reçoit les événements Gelato (mise à jour statut commande, tracking, etc.)
 * À configurer sur dashboard.gelato.com/webhooks
 *
 * Auth : si GELATO_WEBHOOK_SECRET est défini (Vercel env + secret dans l'URL
 * du webhook côté Gelato : ?secret=… ou header x-webhook-secret), on l'EXIGE →
 * bloque la falsification anonyme du statut des commandes. Tant qu'il n'est pas
 * configuré, on laisse passer pour ne pas casser le webhook existant.
 */
export async function POST(req: NextRequest) {
  // Rate-limit best-effort (les bursts webhook légitimes sont faibles).
  const limited = rateLimit(req, { key: "gelato-webhook", limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const expectedSecret = process.env.GELATO_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided =
      req.nextUrl.searchParams.get("secret") ?? req.headers.get("x-webhook-secret");
    if (provided !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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

    // Map statut Gelato → statut HM Global.
    // Fix 2026-06-11 : "delivered" pointait vers "livree" qui n'existe pas
    // dans l'enum OrderStatus (rejeté par orders_status_check) → "terminee",
    // même convention que le webhook Printful (order fulfilled → terminee).
    const STATUS_MAP: Record<string, string> = {
      created:     "commande_fournisseur_passee",
      printed:     "en_production",
      shipped:     "expediee",
      delivered:   "terminee",
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
