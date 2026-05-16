import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  createOrder,
  listOrders,
  uploadDocumentFromUrl,
  mapHMAddressToPOC,
  isPrintoclockConfigured,
} from "@/lib/printoclock";

/**
 * GET /api/printoclock/orders
 * Admin-only. Liste toutes les commandes PrintoClock du compte.
 */
export async function GET(req: NextRequest) {
  try {
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

    if (!isPrintoclockConfigured()) {
      return NextResponse.json(
        { error: "PrintoClock non configuré. Ajoutez PRINTOCLOCK_USERNAME et PRINTOCLOCK_PASSWORD." },
        { status: 503 }
      );
    }

    const orders = await listOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/printoclock/orders
 * Admin-only. Crée une commande PrintoClock depuis une commande HM Global.
 *
 * Body: { orderId: string }
 *
 * Workflow :
 * 1. Récupère la commande HM Global (Supabase)
 * 2. Upload le fichier logo vers PrintoClock → hash du document
 * 3. Crée la commande PrintoClock avec le SKU variante + hash
 * 4. Met à jour la commande HM Global avec poc_order_id
 */
export async function POST(req: NextRequest) {
  try {
    // Auth + admin check
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

    if (!isPrintoclockConfigured()) {
      return NextResponse.json(
        { error: "PrintoClock non configuré. Ajoutez PRINTOCLOCK_USERNAME et PRINTOCLOCK_PASSWORD dans les variables d'environnement Vercel." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { orderId, productVariantCode } = body as {
      orderId:            string;
      productVariantCode?: string; // ex: "TSHIRT-GD5000_BLANC_L_DTF"
    };

    if (!orderId) {
      return NextResponse.json({ error: "orderId requis" }, { status: 400 });
    }

    // Récupère la commande HM Global
    const supabaseService = await createSupabaseServiceClient();
    const { data: order, error: fetchError } = await supabaseService
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // Vérifie si une commande PrintoClock existe déjà
    if (order.poc_order_id) {
      return NextResponse.json(
        {
          error:       "Une commande PrintoClock existe déjà pour cette commande",
          pocOrderId:  order.poc_order_id,
        },
        { status: 409 }
      );
    }

    // Cherche le fichier logo dans les items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstItem = (order.order_items as any[])?.[0];
    if (!firstItem) {
      return NextResponse.json({ error: "Aucun article dans la commande" }, { status: 422 });
    }

    const logoUrl: string | undefined = firstItem.logo_url ?? firstItem.file_url;
    if (!logoUrl) {
      return NextResponse.json(
        { error: "Fichier logo introuvable sur l'article. Assurez-vous que le logo a été uploadé." },
        { status: 422 }
      );
    }

    // Détermine le SKU variante PrintoClock
    // Si non fourni dans le body, on tente de le reconstituer depuis l'article
    const variantCode = productVariantCode ?? buildVariantCode(firstItem);
    if (!variantCode) {
      return NextResponse.json(
        {
          error: "Impossible de déterminer le SKU PrintoClock. Passez productVariantCode dans le body.",
          hint:  "Format : PRODUCTCODE_COULEURCODE_TAILLECODE (ex: TSHIRT-GD5000_BLANC_L)",
        },
        { status: 422 }
      );
    }

    // 1. Upload le fichier logo vers PrintoClock
    const document = await uploadDocumentFromUrl(logoUrl);

    // 2. Adresse de livraison
    const addr = order.shipping_address as Record<string, string>;
    const shippingAddress = mapHMAddressToPOC(addr, order.billing_address?.email);

    // 3. Crée la commande PrintoClock
    const pocOrder = await createOrder({
      productVariantCode:  variantCode,
      documents:           [document.hash],
      shippingAddress,
      externalReference:   order.order_number ?? orderId,
      externalCustomerId:  order.user_id ?? undefined,
      customerEmail:       order.billing_address?.email ?? undefined,
    });

    // 4. Sauvegarde poc_order_id dans Supabase
    await supabaseService
      .from("orders")
      .update({
        poc_order_id:     String(pocOrder.id),
        poc_order_number: pocOrder.number,
        poc_order_state:  pocOrder.state,
      })
      .eq("id", orderId);

    return NextResponse.json({
      success:     true,
      pocOrderId:  pocOrder.id,
      pocNumber:   pocOrder.number,
      state:       pocOrder.state,
      estimatedDeliveryDate: pocOrder.estimatedDeliveryDate,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PrintoClock] createOrder error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── Helper — construit un SKU PrintoClock depuis un order_item HM Global ────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildVariantCode(item: any): string | null {
  // Mapping couleur HM Global → code PrintoClock (à ajuster selon le catalogue)
  const COLOR_MAP: Record<string, string> = {
    blanc:       "BLANC",
    noir:        "NOIR",
    marine:      "MARINE",
    "gris-sport": "GRIS",
    rouge:       "ROUGE",
    bleu:        "BLEU",
  };

  const productId: string = item.product_id ?? "";
  const color:  string = COLOR_MAP[item.color_id ?? ""] ?? item.color_id?.toUpperCase() ?? "";
  const size:   string = (item.size ?? "").toUpperCase();

  if (!productId || !color || !size) return null;

  // Format PrintoClock : PRODUCTCODE_COLOR_SIZE
  // Les codes produits réels seront récupérés via GET /api/printoclock/products
  const PRODUCT_CODE_MAP: Record<string, string> = {
    "gildan-5000":       "GILDAN5000",
    "bella-3001":        "BELLA3001",
    "gildan-18000":      "GILDAN18000",
    "gildan-18500":      "GILDAN18500",
  };

  const productCode = PRODUCT_CODE_MAP[productId];
  if (!productCode) return null;

  return `${productCode}_${color}_${size}`;
}
