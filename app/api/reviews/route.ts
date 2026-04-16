import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reviews
 * Submit a customer review after order completion
 * Reviews are stored with status "pending" — visible only after admin approval
 *
 * GET /api/reviews
 * Returns approved reviews (public)
 */

export async function GET(_req: NextRequest) {
  // TODO: Fetch approved reviews from DB
  // const reviews = await db.reviews.findMany({ where: { status: "approved" }, orderBy: { createdAt: "desc" } });

  // Demo data for V1
  const reviews = [
    {
      id: "1",
      userName: "Thomas M.",
      company: "BTP — Strasbourg",
      rating: 5,
      comment: "Commande de 50 t-shirts pour notre équipe. Qualité irréprochable, livraison rapide.",
      createdAt: "2025-03-15T10:00:00Z",
    },
    {
      id: "2",
      userName: "Sophie L.",
      company: "Restaurant — Colmar",
      rating: 5,
      comment: "Hoodies brodés superbes. Nos clients nous en parlent !",
      createdAt: "2025-02-10T10:00:00Z",
    },
    {
      id: "3",
      userName: "Marc D.",
      company: "Association sportive — Mulhouse",
      rating: 5,
      comment: "20 softshells parfaites. Service impeccable du début à la fin.",
      createdAt: "2025-01-20T10:00:00Z",
    },
  ];

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, rating, comment } = await req.json();

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "orderId and rating (1-5) required" }, { status: 400 });
    }

    // TODO: Verify user session + order ownership
    // TODO: Check order is "terminee" before allowing review
    // TODO: Check no duplicate review for this order
    // TODO: Save review with status "pending" (awaits admin approval)
    // await db.reviews.create({ data: { orderId, rating, comment, status: "pending" } });

    console.log(`[Review] Order ${orderId}: rating=${rating}`);

    return NextResponse.json({ success: true, message: "Avis soumis, en attente de modération" });
  } catch (err) {
    console.error("[Reviews POST]", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
