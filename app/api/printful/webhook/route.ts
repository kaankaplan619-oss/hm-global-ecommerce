import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { PrintfulWebhookEvent } from "@/lib/printful";

const PRINTFUL_STORE_ID = 18115629;

/**
 * POST /api/printful/webhook
 * Webhook Printful — exclu du proxy auth (cf. proxy.ts matcher).
 *
 * Événements gérés :
 *   - package_shipped  → status='expediee', tracking_number, shipped_at
 *   - order_updated    → si statut fulfilled → status='terminee', delivered_at
 */
export async function POST(req: NextRequest) {
  let event: PrintfulWebhookEvent;

  try {
    event = await req.json() as PrintfulWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  // Validate store ID
  if (event.store !== PRINTFUL_STORE_ID) {
    console.warn(`[Printful webhook] Store ID inattendu: ${event.store}`);
    return NextResponse.json({ error: "Store ID non reconnu" }, { status: 403 });
  }

  const supabase = await createSupabaseServiceClient();

  try {
    if (event.type === "package_shipped") {
      const data = event.data as {
        order?: { id?: number; external_id?: string };
        shipment?: {
          tracking_number?: string;
          tracking_url?: string;
          ship_date?: string;
          shipped_at?: number;
        };
      };

      const printfulOrderId = data?.order?.id;
      const tracking        = data?.shipment?.tracking_number ?? undefined;
      const trackingUrl     = data?.shipment?.tracking_url    ?? undefined;
      const shippedAt       = data?.shipment?.shipped_at
        ? new Date(data.shipment.shipped_at * 1000).toISOString()
        : new Date().toISOString();

      if (!printfulOrderId) {
        console.warn("[Printful webhook] package_shipped sans order.id");
        return NextResponse.json({ ok: true });
      }

      await supabase
        .from("orders")
        .update({
          status:           "expediee",
          tracking_number:  tracking   ?? null,
          tracking_url:     trackingUrl ?? null,
          shipped_at:       shippedAt,
          printful_status:  "shipped",
        })
        .eq("printful_order_id", printfulOrderId);

      console.log(`[Printful webhook] package_shipped → commande Printful #${printfulOrderId} expédiée, tracking: ${tracking}`);
    }

    else if (event.type === "order_updated") {
      const data = event.data as {
        order?: { id?: number; status?: string };
      };

      const printfulOrderId = data?.order?.id;
      const pfStatus        = data?.order?.status;

      if (printfulOrderId && pfStatus === "fulfilled") {
        await supabase
          .from("orders")
          .update({
            status:          "terminee",
            delivered_at:    new Date().toISOString(),
            printful_status: "fulfilled",
          })
          .eq("printful_order_id", printfulOrderId);

        console.log(`[Printful webhook] order_updated fulfilled → commande Printful #${printfulOrderId} terminée`);
      } else if (printfulOrderId && pfStatus) {
        // Mise à jour du statut Printful sans changer le statut HM Global
        await supabase
          .from("orders")
          .update({ printful_status: pfStatus })
          .eq("printful_order_id", printfulOrderId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Printful webhook] Erreur traitement:", err);
    // Retourner 200 pour éviter les renvois répétés
    return NextResponse.json({ ok: true });
  }
}
