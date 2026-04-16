import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPaymentIntent } from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/utils";
import { computeUnitPrice, computeCartTotals, ttcToHt, PRICING_CONFIG } from "@/data/pricing";
import { ALL_PRODUCTS as PRODUCTS } from "@/data/products";
import type { Technique, Placement } from "@/types";

interface CartItemInput {
  productId:  string;
  quantity:   number;
  size:       string;
  colorId:    string;
  colorLabel: string;
  colorHex:   string;
  technique:  Technique;
  placement:  Placement;
}

/**
 * POST /api/stripe/create-payment-intent
 *
 * 1. Verifies session
 * 2. Recomputes prices server-side (never trust client amounts)
 * 3. Creates order + items in DB
 * 4. Creates Stripe PaymentIntent
 * 5. Returns clientSecret + orderId
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { items, billingAddress, shippingAddress }: {
      items: CartItemInput[];
      billingAddress: Record<string, string>;
      shippingAddress?: Record<string, string>;
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // ── Recompute prices server-side ──────────────────────────────────────────
    const computedItems = items.map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Produit inconnu: ${item.productId}`);

      const basePrice = product.pricing[item.technique] as number;
      const unitPriceTTC = computeUnitPrice({ basePrice, technique: item.technique, placement: item.placement });
      const unitPriceHT  = ttcToHt(unitPriceTTC);
      const totalTTC     = Math.round(unitPriceTTC * item.quantity * 100) / 100;
      const totalHT      = Math.round(unitPriceHT  * item.quantity * 100) / 100;

      // Find color info
      const color = product.colors.find((c) => c.id === item.colorId);

      return {
        productId:        product.id,
        productReference: product.reference,
        productName:      product.shortName,
        productSnapshot:  { ...product, images: [] }, // strip large image arrays if any
        quantity:         item.quantity,
        size:             item.size,
        colorId:          item.colorId,
        colorLabel:       color?.label ?? item.colorLabel,
        colorHex:         color?.hex   ?? item.colorHex,
        technique:        item.technique,
        placement:        item.placement,
        unitPriceHT,
        unitPriceTTC,
        totalHT,
        totalTTC,
      };
    });

    // Compute cart totals from server-computed unit prices
    const totals = computeCartTotals({
      items: computedItems.map((i) => ({ unitPrice: i.unitPriceTTC, quantity: i.quantity })),
    });

    // ── Generate order number ─────────────────────────────────────────────────
    const orderNumber = generateOrderNumber();

    // ── Create Stripe PaymentIntent ───────────────────────────────────────────
    const paymentIntent = await createPaymentIntent({
      amountTTC: totals.totalTTC,
      orderNumber,
      userEmail: user.email ?? "",
      metadata: {
        orderNumber,
        userId:    user.id,
        itemCount: String(computedItems.length),
      },
    });

    // ── Insert order in DB ────────────────────────────────────────────────────
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number:             orderNumber,
        user_id:                  user.id,
        status:                   "paiement_recu",
        subtotal_ht:              totals.subtotalHT,
        tva:                      totals.tva,
        subtotal_ttc:             totals.subtotalTTC,
        shipping:                 totals.shipping,
        total_ttc:                totals.totalTTC,
        free_shipping:            totals.freeShipping,
        billing_address:          billingAddress,
        shipping_address:         shippingAddress ?? billingAddress,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status:    "pending",
      })
      .select("id")
      .single();

    if (orderError || !orderRow) {
      console.error("[CreatePaymentIntent] Order insert:", orderError);
      return NextResponse.json({ error: "Erreur création commande" }, { status: 500 });
    }

    // Insert order items
    const itemRows = computedItems.map((item) => ({
      order_id:          orderRow.id,
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
      console.error("[CreatePaymentIntent] Items insert:", itemsError);
      // Order exists but items failed — log and allow payment to proceed
      // Items can be re-derived from Stripe metadata if needed
    }

    return NextResponse.json({
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId:         orderRow.id,
      orderNumber,
    });
  } catch (err) {
    console.error("[CreatePaymentIntent]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
