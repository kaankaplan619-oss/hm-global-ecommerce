import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/reviews
 * Returns approved reviews from DB.
 * Returns empty array until reviews table is created and populated.
 *
 * POST /api/reviews
 * Submit a review — requires authenticated session + completed order ownership.
 */

export async function GET(_req: NextRequest) {
  // TODO: once `reviews` table exists in Supabase, replace with:
  // const supabase = await createSupabaseServerClient();
  // const { data } = await supabase
  //   .from("reviews")
  //   .select("id, user_name, company, rating, comment, created_at")
  //   .eq("status", "approved")
  //   .order("created_at", { ascending: false })
  //   .limit(20);
  // return NextResponse.json({ reviews: data ?? [] });

  return NextResponse.json({ reviews: [] });
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

    // TODO: once `reviews` table exists, uncomment:
    // const { error: dupError } = await supabase
    //   .from("reviews")
    //   .select("id")
    //   .eq("order_id", orderId)
    //   .single();
    // if (!dupError) {
    //   return NextResponse.json({ error: "Avis déjà soumis pour cette commande." }, { status: 409 });
    // }
    // await supabase.from("reviews").insert({
    //   order_id: orderId,
    //   user_id: user.id,
    //   rating,
    //   comment: comment?.trim() ?? "",
    //   status: "pending",
    // });

    console.log(`[Review] user=${user.id} order=${orderId} rating=${rating}`);

    return NextResponse.json({
      success: true,
      message: "Avis soumis, en attente de modération.",
    });
  } catch (err) {
    console.error("[Reviews POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
