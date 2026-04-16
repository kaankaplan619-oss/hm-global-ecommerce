import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/orders/admin
 * Returns all orders with customer info, sorted by date desc.
 * Supports ?status=xxx filter.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    let query = supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        total_ttc,
        free_shipping,
        shipping,
        created_at,
        tracking_number,
        invoice_url,
        admin_note,
        profiles (
          id, first_name, last_name, phone, type, company
        ),
        order_items (
          id,
          product_name,
          quantity,
          technique,
          logo_file_status
        )
      `)
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("[Admin Orders]", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ orders: orders ?? [] });
  } catch (err) {
    console.error("[Admin Orders]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
