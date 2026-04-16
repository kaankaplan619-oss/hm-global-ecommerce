import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { refundPayment } from "@/lib/stripe";
import { canCancelOrder } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/cancel
 * Customer cancels their order within the 30-minute window.
 * Triggers a full Stripe refund and sends a cancellation email.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Fetch order (RLS ensures user owns it)
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, user_id, status, created_at, stripe_payment_intent_id, order_number")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.status === "annulee") {
      return NextResponse.json({ error: "Déjà annulée" }, { status: 400 });
    }

    if (!["paiement_recu", "fichier_a_verifier"].includes(order.status)) {
      return NextResponse.json(
        { error: "Cette commande ne peut plus être annulée (déjà en traitement)" },
        { status: 403 }
      );
    }

    // 30-minute window check
    if (!canCancelOrder(order.created_at)) {
      return NextResponse.json(
        { error: "Le délai d'annulation de 30 minutes est dépassé" },
        { status: 403 }
      );
    }

    // Stripe refund
    if (order.stripe_payment_intent_id) {
      try {
        await refundPayment({ paymentIntentId: order.stripe_payment_intent_id });
      } catch (stripeErr) {
        console.error("[Cancel] Stripe refund failed:", stripeErr);
        return NextResponse.json(
          { error: "Remboursement Stripe échoué. Contactez le support." },
          { status: 500 }
        );
      }
    }

    // Update order in DB
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status:              "annulee",
        cancelled_at:        new Date().toISOString(),
        cancellation_reason: "Annulation client (30 min)",
      })
      .eq("id", id);

    if (updateError) {
      console.error("[Cancel] DB update failed:", updateError);
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
    }

    // Email d'annulation intentionnellement absent ici.
    // refundPayment() déclenche un remboursement Stripe qui génère l'événement
    // charge.refunded → le webhook /api/stripe/webhook l'intercepte et envoie
    // sendCommandeAnnulee() via mapDbOrderToOrder(). Gérer l'email ici en plus
    // provoquerait un doublon systématique.

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Cancel Order]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
