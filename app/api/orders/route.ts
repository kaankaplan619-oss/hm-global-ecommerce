import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/orders
 * Returns orders for the current authenticated user.
 * Admins: pass ?admin=true to get all orders.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isAdminRequest = searchParams.get("admin") === "true";

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
        order_items (
          id,
          product_id,
          product_name,
          product_reference,
          quantity,
          size,
          color_label,
          technique,
          placement,
          total_ttc,
          logo_file_status
        )
      `)
      .order("created_at", { ascending: false });

    if (isAdminRequest) {
      // Check admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
      // No filter — RLS allows admin to see all
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("[Orders GET]", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ orders: orders ?? [] });
  } catch (err) {
    console.error("[Orders GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Creates a new order in the DB.
 * Called internally from create-payment-intent — not directly by the client.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const {
      orderNumber,
      subtotalHT,
      tva,
      subtotalTTC,
      shipping,
      totalTTC,
      freeShipping,
      billingAddress,
      shippingAddress,
      items,
      stripePaymentIntentId,
    } = body;

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number:             orderNumber,
        user_id:                  user.id,
        status:                   "paiement_recu",
        subtotal_ht:              subtotalHT,
        tva:                      tva,
        subtotal_ttc:             subtotalTTC,
        shipping:                 shipping,
        total_ttc:                totalTTC,
        free_shipping:            freeShipping,
        billing_address:          billingAddress,
        shipping_address:         shippingAddress ?? billingAddress,
        stripe_payment_intent_id: stripePaymentIntentId,
        stripe_payment_status:    "pending",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[Orders POST] order insert:", orderError);
      return NextResponse.json({ error: "Erreur création commande" }, { status: 500 });
    }

    // Insert order items
    if (items?.length) {
      const itemRows = items.map((item: {
        productId: string;
        productReference: string;
        productName: string;
        productSnapshot: object;
        quantity: number;
        size: string;
        colorId: string;
        colorLabel: string;
        colorHex: string;
        technique: string;
        placement: string;
        unitPriceHT: number;
        unitPriceTTC: number;
        totalHT: number;
        totalTTC: number;
      }) => ({
        order_id:          order.id,
        product_id:        item.productId,
        product_reference: item.productReference,
        product_name:      item.productName,
        product_snapshot:  item.productSnapshot,
        quantity:          item.quantity,
        size:              item.size,
        color_id:          item.colorId,
        color_label:       item.colorLabel,
        color_hex:         item.colorHex,
        technique:         item.technique,
        placement:         item.placement,
        unit_price_ht:     item.unitPriceHT,
        unit_price_ttc:    item.unitPriceTTC,
        total_ht:          item.totalHT,
        total_ttc:         item.totalTTC,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
      if (itemsError) {
        console.error("[Orders POST] items insert:", itemsError);
        // Order exists but items failed — log and continue (items can be re-inserted)
      }
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("[Orders POST]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
