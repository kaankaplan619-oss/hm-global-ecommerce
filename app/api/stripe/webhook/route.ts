import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendConfirmationPaiement, sendCommandeAnnulee } from "@/lib/email";
import { mapDbOrderToOrder } from "@/lib/mappers";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe events and updates order status in Supabase.
 * Uses the service role client to bypass RLS.
 *
 * Excluded from proxy.ts matcher — no session cookie overhead.
 */
export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(body, signature);
  } catch (err) {
    console.error("[Stripe Webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createSupabaseServiceClient();

  try {
    switch (event.type) {

      // ── Payment succeeded ─────────────────────────────────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] payment_intent.succeeded: ${pi.id}`);

        // Update order status → fichier_a_verifier and mark as paid
        const { data: updatedRow, error } = await supabase
          .from("orders")
          .update({
            status:                "fichier_a_verifier",
            stripe_payment_status: "succeeded",
            paid_at:               new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", pi.id)
          .select("*, profiles(*), order_items(*)")
          .single();

        if (error || !updatedRow) {
          console.error("[Webhook] DB update failed:", error);
          // Return 200 anyway — Stripe retries on non-2xx
          break;
        }

        // Map DB row → typed Order and send confirmation email
        try {
          const order = mapDbOrderToOrder(updatedRow);
          if (order.user.email) {
            await sendConfirmationPaiement(order);
          }
        } catch (emailErr) {
          // Non-blocking — email failure must not fail the webhook
          console.error("[Webhook] Confirmation email failed:", emailErr);
        }

        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] payment_intent.payment_failed: ${pi.id}`);

        await supabase
          .from("orders")
          .update({
            status:                "annulee",
            stripe_payment_status: "failed",
            cancelled_at:          new Date().toISOString(),
            cancellation_reason:   "Paiement échoué",
          })
          .eq("stripe_payment_intent_id", pi.id);

        break;
      }

      // ── Charge refunded ───────────────────────────────────────────────────
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`[Webhook] charge.refunded: ${charge.id}`);

        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (!paymentIntentId) break;

        const { data: updatedRow } = await supabase
          .from("orders")
          .update({
            status:      "annulee",
            refunded_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntentId)
          .select("*, profiles(*), order_items(*)")
          .single();

        if (updatedRow) {
          try {
            const order = mapDbOrderToOrder(updatedRow);
            if (order.user.email) {
              await sendCommandeAnnulee(order);
            }
          } catch (emailErr) {
            console.error("[Webhook] Cancellation email failed:", emailErr);
          }
        }

        break;
      }

      default:
        console.log(`[Webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
