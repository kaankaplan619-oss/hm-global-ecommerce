import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { refundPayment } from "@/lib/stripe";
import { mapDbOrderToOrder } from "@/lib/mappers";
import { sendCommandeAnnulee } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/refund — ADMIN : rembourse et annule une commande.
 *
 * - Commande payée par CARTE (stripe_payment_intent_id présent) → remboursement
 *   Stripe. L'événement charge.refunded déclenche l'email d'annulation via le
 *   webhook → on n'envoie PAS d'email ici (évite le doublon).
 * - Commande payée par VIREMENT (pas de PaymentIntent) → on marque annulée + on
 *   envoie l'email d'annulation ici (aucun webhook ne le fera). Le remboursement
 *   bancaire reste à effectuer manuellement.
 *
 * Body optionnel { amountTTC } pour un remboursement partiel (défaut = total).
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // ── Garde admin ──────────────────────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || (profile as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const service = await createSupabaseServiceClient();
    const { data: order, error } = await service
      .from("orders")
      .select("*, profiles(*), order_items(*)")
      .eq("id", id)
      .single();
    if (error || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    if (order.status === "annulee") {
      return NextResponse.json({ error: "Commande déjà annulée" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) as { amountTTC?: number } | null;
    const amountTTC =
      typeof body?.amountTTC === "number" && body.amountTTC > 0 ? body.amountTTC : undefined;

    const paymentIntentId = (order as { stripe_payment_intent_id?: string | null })
      .stripe_payment_intent_id;
    let refundMode: "stripe" | "manuel" = "manuel";

    // ── Remboursement Stripe (paiement carte) ────────────────────────────────
    if (paymentIntentId) {
      try {
        await refundPayment({ paymentIntentId, amountTTC });
        refundMode = "stripe";
      } catch (stripeErr) {
        console.error("[Refund] Stripe refund failed:", stripeErr);
        return NextResponse.json(
          { error: "Remboursement Stripe échoué. Vérifiez le dashboard Stripe." },
          { status: 500 },
        );
      }
    }

    // ── Maj commande ─────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    const { error: updateError } = await service
      .from("orders")
      .update({
        status:              "annulee",
        refunded_at:         now,
        cancelled_at:        now,
        cancellation_reason:
          refundMode === "stripe"
            ? "Remboursement admin (Stripe)"
            : "Annulation admin — remboursement virement à effectuer manuellement",
      })
      .eq("id", id);

    if (updateError) {
      console.error("[Refund] DB update failed:", updateError);
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
    }

    // ── Email d'annulation ───────────────────────────────────────────────────
    // CARTE : déjà géré par le webhook charge.refunded (pas de doublon).
    // VIREMENT : aucun webhook → on l'envoie ici (non bloquant).
    if (refundMode === "manuel") {
      try {
        const mapped = mapDbOrderToOrder({ ...order, status: "annulee", cancelled_at: now });
        if (mapped.user?.email) await sendCommandeAnnulee(mapped);
      } catch (emailErr) {
        console.error("[Refund] Cancellation email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true, refundMode });
  } catch (err) {
    console.error("[Refund]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
