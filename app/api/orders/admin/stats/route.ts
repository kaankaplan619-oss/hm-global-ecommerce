import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/orders/admin/stats
 * Agrégation rapide pour le dashboard admin :
 *   - count par statut
 *   - CA total TTC (toutes commandes payées)
 *   - CA mois en cours TTC
 */
export async function GET() {
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

    // Toutes les commandes (hors annulées)
    const { data: rows, error } = await supabase
      .from("orders")
      .select("status, total_ttc, created_at, stripe_payment_status, payment_method")
      .neq("status", "annulee");

    if (error) {
      console.error("[Admin Stats]", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Argent réellement ENCAISSÉ :
    //   - CB / Link  → Stripe "succeeded"
    //   - virement   → encaissé dès que l'admin a quitté "awaiting_bank_transfer"
    //                  (= virement reçu et commande validée)
    const isPaid = (row: { stripe_payment_status?: string | null; payment_method?: string | null; status: string }) =>
      row.stripe_payment_status === "succeeded" ||
      (row.payment_method === "bank_transfer" && row.status !== "awaiting_bank_transfer");

    const counts: Record<string, number> = {};
    let encaisseTTC = 0;
    let monthEncaisseTTC = 0;
    let enAttenteTTC = 0;
    let paidCount = 0;
    let pendingCount = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    for (const row of rows ?? []) {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
      const ttc = Number(row.total_ttc ?? 0);
      if (isPaid(row)) {
        paidCount++;
        encaisseTTC += ttc;
        if (row.created_at >= startOfMonth) monthEncaisseTTC += ttc;
      } else {
        pendingCount++;
        enAttenteTTC += ttc;
      }
    }

    const r2 = (n: number) => Math.round(n * 100) / 100;
    return NextResponse.json({
      counts,
      // Trésorerie
      encaisseTTC:      r2(encaisseTTC),
      monthEncaisseTTC: r2(monthEncaisseTTC),
      enAttenteTTC:     r2(enAttenteTTC),
      paidCount,
      pendingCount,
      // Rétro-compat (= encaissé)
      totalRevenueTTC:  r2(encaisseTTC),
      monthRevenueTTC:  r2(monthEncaisseTTC),
      total: (rows ?? []).length,
    });
  } catch (err) {
    console.error("[Admin Stats]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
