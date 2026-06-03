import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = [
  "new",
  "pricing",
  "bat_to_prepare",
  "quote_sent",
  "validated",
  "refused",
  "archived",
] as const;

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { supabase, response: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }

  return { supabase, response: null };
}

export async function GET(req: NextRequest) {
  try {
    const { supabase, response } = await requireAdmin();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Admin quote requests GET]", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ quoteRequests: data ?? [] });
  } catch (err) {
    console.error("[Admin quote requests GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { supabase, response } = await requireAdmin();
    if (response) return response;

    const body = (await req.json()) as { id?: string; status?: string; internalNote?: string };
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";

    if (!id || !ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])) {
      return NextResponse.json({ error: "Demande ou statut invalide." }, { status: 400 });
    }

    const updatePayload: Record<string, string> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (typeof body.internalNote === "string") {
      updatePayload.internal_note = body.internalNote;
    }

    const { data, error } = await supabase
      .from("quote_requests")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[Admin quote requests PATCH]", error);
      return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
    }

    return NextResponse.json({ quoteRequest: data });
  } catch (err) {
    console.error("[Admin quote requests PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
