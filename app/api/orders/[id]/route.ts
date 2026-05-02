import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapDbOrderToOrder } from "@/lib/mappers";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/[id]
 * Returns a single order with all items.
 * RLS ensures only the owner or admin can read it.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        profiles (
          id, first_name, last_name, email, phone, type, company, siret
        ),
        order_items (*)
      `)
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ order: null }, { status: 404 });
    }

    const mapped = mapDbOrderToOrder(order);
    return NextResponse.json({ order: mapped });
  } catch (err) {
    console.error("[Orders GET id]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/[id]
 * Used by client to update logo file URL after upload.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    // Only allow updating logo fields on an item
    const { itemId, logoFileUrl, logoFileName } = body;

    if (!itemId || !logoFileUrl) {
      return NextResponse.json({ error: "itemId et logoFileUrl requis" }, { status: 400 });
    }

    const { error } = await supabase
      .from("order_items")
      .update({
        logo_file_url:    logoFileUrl,
        logo_file_name:   logoFileName ?? null,
        logo_file_status: "en_attente",
        logo_uploaded_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .eq("order_id", id); // ensures ownership via RLS

    if (error) {
      return NextResponse.json({ error: "Mise à jour impossible" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Orders PATCH id]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
