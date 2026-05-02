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

    // Toutes les commandes (status + total_ttc + created_at)
    const { data: rows, error } = await supabase
      .from("orders")
      .select("status, total_ttc, created_at, stripe_payment_status")
      .neq("status", "annulee");

    if (error) {
      console.error("[Admin Stats]", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Count par statut
    const counts: Record<string, number> = {};
    let totalRevenueTTC = 0;
    let monthRevenueTTC = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    for (const row of rows ?? []) {
      counts[row.status] = (counts[row.status] ?? 0) + 1;

      if (row.stripe_payment_status === "succeeded" && row.total_ttc) {
        totalRevenueTTC += Number(row.total_ttc);
        if (row.created_at >= startOfMonth) {
          monthRevenueTTC += Number(row.total_ttc);
        }
      }
    }

    return NextResponse.json({
      counts,
      totalRevenueTTC: Math.round(totalRevenueTTC * 100) / 100,
      monthRevenueTTC: Math.round(monthRevenueTTC * 100) / 100,
      total: (rows ?? []).length,
    });
  } catch (err) {
    console.error("[Admin Stats]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
