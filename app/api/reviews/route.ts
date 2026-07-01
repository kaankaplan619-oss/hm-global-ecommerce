import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/reviews
 * Renvoie les avis approuvés (affichage public). Dégrade en liste vide si la
 * table `reviews` n'existe pas encore (migration 022 non appliquée).
 *
 * POST /api/reviews
 * Soumission d'un avis — nécessite une session authentifiée + une commande
 * livrée appartenant à l'utilisateur. L'avis est créé en statut 'pending'
 * (modération avant affichage public).
 */

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, user_name, company, rating, comment, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ reviews: [] });
    return NextResponse.json({ reviews: data ?? [] });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ───────────────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour laisser un avis." },
        { status: 401 }
      );
    }

    // ── Validation ───────────────────────────────────────────────────
    const { orderId, rating, comment } = await req.json();

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "orderId et rating (1-5) requis." },
        { status: 400 }
      );
    }

    // ── Order ownership check ────────────────────────────────────────
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, user_id")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable ou accès refusé." },
        { status: 403 }
      );
    }

    if (order.status !== "terminee") {
      return NextResponse.json(
        { error: "Vous ne pouvez laisser un avis que sur une commande livrée." },
        { status: 403 }
      );
    }

    // ── Anti-doublon (un avis par commande) ──────────────────────────
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Un avis a déjà été soumis pour cette commande." },
        { status: 409 }
      );
    }

    // ── Enregistrement (statut 'pending' → modération) ───────────────
    const { error: insertError } = await supabase.from("reviews").insert({
      order_id: orderId,
      user_id: user.id,
      rating,
      comment: typeof comment === "string" ? comment.trim().slice(0, 500) : "",
      status: "pending",
    });

    if (insertError) {
      console.error("[Reviews POST] insert", insertError);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement de l'avis." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Avis soumis, en attente de modération.",
    });
  } catch (err) {
    console.error("[Reviews POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
