import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STATUSES = ["nouveau", "en_cours", "traite", "refuse"] as const;
type Status = (typeof STATUSES)[number];

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || (profile as { role?: string }).role !== "admin") {
    return { supabase, response: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }
  return { supabase, response: null };
}

/** GET /api/order-requests/admin — liste les dossiers (facture/remboursement). */
export async function GET(req: NextRequest) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const status = new URL(req.url).searchParams.get("status");

  let query = supabase
    .from("order_requests")
    .select(
      "*, orders(order_number, total_ttc, status, profiles(first_name, last_name, email, phone))",
    )
    .order("created_at", { ascending: false });

  if (status && STATUSES.includes(status as Status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[order-requests admin GET]", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
  return NextResponse.json({ requests: data ?? [] });
}

/** PATCH /api/order-requests/admin — met à jour statut / note interne. */
export async function PATCH(req: NextRequest) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = (await req.json().catch(() => null)) as
    | { id?: string; status?: string; internalNote?: string }
    | null;
  const id = body?.id;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body?.status) {
    if (!STATUSES.includes(body.status as Status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    update.status = body.status;
    if (body.status === "traite" || body.status === "refuse") {
      update.handled_at = new Date().toISOString();
    }
  }
  if (typeof body?.internalNote === "string") {
    update.internal_note = body.internalNote.slice(0, 2000);
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  const { error } = await supabase.from("order_requests").update(update).eq("id", id);
  if (error) {
    console.error("[order-requests admin PATCH]", error);
    return NextResponse.json({ error: "Mise à jour impossible" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
