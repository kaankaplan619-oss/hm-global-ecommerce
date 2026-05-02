import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/orders/admin
 * Retourne toutes les commandes avec infos client et articles (vue production).
 * Supporte ?status=xxx pour filtrer par statut.
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
        subtotal_ht,
        shipping,
        free_shipping,
        stripe_payment_status,
        paid_at,
        created_at,
        tracking_number,
        invoice_url,
        admin_note,
        supplier_mode,
        profiles (
          id, first_name, last_name, email, phone, type, company
        ),
        order_items (
          id,
          product_name,
          product_reference,
          quantity,
          size,
          color_label,
          color_hex,
          technique,
          placement,
          unit_price_ttc,
          total_ttc,
          logo_file_url,
          logo_file_status,
          logo_effect,
          bat_ref,
          product_snapshot
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
