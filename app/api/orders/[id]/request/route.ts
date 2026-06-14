import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rate-limit";

type Params = { params: Promise<{ id: string }> };

const TYPES = ["facture", "remboursement"] as const;

/**
 * POST /api/orders/[id]/request — le client ouvre un dossier (facture |
 *   remboursement) sur SA commande. Tracé pour traitement admin.
 * GET  /api/orders/[id]/request — liste les dossiers du client pour la commande.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const limited = rateLimit(req, { key: "order-request", limit: 10, windowMs: 10 * 60_000 });
  if (limited) return limited;

  try {
    const { id: orderId } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { type?: string; reason?: string } | null;
    const type = body?.type;
    const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 2000) : null;

    if (!type || !TYPES.includes(type as (typeof TYPES)[number])) {
      return NextResponse.json({ error: "Type de demande invalide." }, { status: 400 });
    }

    // Ownership (défense en profondeur en plus de la RLS).
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();
    if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

    // Anti-doublon : une seule demande ouverte par type et par commande.
    const { data: existing } = await supabase
      .from("order_requests")
      .select("id")
      .eq("order_id", orderId)
      .eq("type", type)
      .in("status", ["nouveau", "en_cours"])
      .limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Une demande de ce type est déjà en cours pour cette commande." },
        { status: 409 },
      );
    }

    const { data: created, error } = await supabase
      .from("order_requests")
      .insert({
        order_id: orderId,
        user_id: user.id,
        type,
        reason,
        contact_email: user.email ?? null,
      })
      .select("id, type, status, reason, created_at")
      .single();

    if (error) {
      console.error("[order-request POST]", error);
      return NextResponse.json({ error: "La demande n'a pas pu être enregistrée." }, { status: 500 });
    }

    return NextResponse.json({ request: created }, { status: 201 });
  } catch (err) {
    console.error("[order-request POST]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: orderId } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data, error } = await supabase
      .from("order_requests")
      .select("id, type, status, reason, created_at")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ requests: [] });
    return NextResponse.json({ requests: data ?? [] });
  } catch {
    return NextResponse.json({ requests: [] });
  }
}
