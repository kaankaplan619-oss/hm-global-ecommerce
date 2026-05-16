import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  createGelatoOrder,
  mapHMAddressToGelato,
  isGelatoConfigured,
  type GelatoOrderItem,
} from "@/lib/gelato";

/**
 * POST /api/gelato/orders
 * Admin-only. Crée une commande Gelato depuis une commande HM Global.
 * Utilisé pour les produits print : cartes de visite, flyers, affiches…
 *
 * Body: {
 *   orderId:     string  — ID commande HM Global
 *   productUid:  string  — UID produit Gelato (ex: "business_cards_pf_bb_pt_350-gsm-coated-silk_cl_4-4_hor")
 *   fileUrl:     string  — URL publique du fichier PDF/PNG
 *   fileType?:   "default" | "front" | "back"  (défaut: "default")
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // ── Auth + admin check ─────────────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (!isGelatoConfigured()) {
      return NextResponse.json(
        { error: "Gelato non configuré. Ajoutez GELATO_API_KEY dans les variables d'environnement." },
        { status: 503 }
      );
    }

    // ── Body ───────────────────────────────────────────────────────────────
    const body = await req.json();
    const { orderId, productUid, fileUrl, fileType = "default" } = body as {
      orderId:    string;
      productUid: string;
      fileUrl:    string;
      fileType?:  "default" | "front" | "back";
    };

    if (!orderId || !productUid || !fileUrl) {
      return NextResponse.json(
        { error: "orderId, productUid et fileUrl sont requis" },
        { status: 400 }
      );
    }

    // ── Fetch commande HM Global ───────────────────────────────────────────
    const supabaseService = await createSupabaseServiceClient();
    const { data: order, error: fetchError } = await supabaseService
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.gelato_order_id) {
      return NextResponse.json(
        { error: "Une commande Gelato existe déjà", gelatoOrderId: order.gelato_order_id },
        { status: 409 }
      );
    }

    // ── Adresse livraison ──────────────────────────────────────────────────
    const addr       = order.shipping_address as Record<string, string>;
    const email      = order.billing_address?.email ?? addr.email ?? "";
    const shippingAddress = mapHMAddressToGelato(addr, email);

    // ── Items Gelato ───────────────────────────────────────────────────────
    const items: GelatoOrderItem[] = [
      {
        itemReferenceId: `${orderId}-item-1`,
        productUid,
        files: [{ type: fileType, url: fileUrl }],
        quantity: 1,
      },
    ];

    // ── Création commande Gelato ───────────────────────────────────────────
    const gelatoOrder = await createGelatoOrder({
      orderReferenceId:   order.order_number ?? orderId,
      customerReferenceId: order.user_id ?? undefined,
      currency:           "EUR",
      items,
      shippingAddress,
    });

    // ── Mise à jour Supabase ───────────────────────────────────────────────
    await supabaseService
      .from("orders")
      .update({
        gelato_order_id:     gelatoOrder.id,
        gelato_status:       gelatoOrder.fulfillmentStatus,
        supplier_provider:   "gelato",
        status:              "commande_fournisseur_passee",
      })
      .eq("id", orderId);

    return NextResponse.json({
      success:        true,
      gelatoOrderId:  gelatoOrder.id,
      status:         gelatoOrder.fulfillmentStatus,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Gelato] createOrder error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
