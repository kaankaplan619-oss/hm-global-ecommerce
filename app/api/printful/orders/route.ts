import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { createPrintfulDraft, getFilesForPlacement } from "@/lib/printful";
import { getPrintfulVariantId, isPrintfulProduct } from "@/lib/printfulVariantMap";
import type { PrintfulOrderItem, PrintfulRecipient } from "@/lib/printful";

/**
 * POST /api/printful/orders
 * Admin-only. Crée un brouillon Printful (confirm: false) pour une commande HM Global.
 * Ne lance PAS la production. À confirmer via POST /api/printful/orders/[id]/confirm.
 *
 * Body: { orderId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Admin check
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const { orderId } = body as { orderId: string };
    if (!orderId) {
      return NextResponse.json({ error: "orderId requis" }, { status: 400 });
    }

    // Fetch order + items
    const supabaseService = await createSupabaseServiceClient();
    const { data: order, error: fetchError } = await supabaseService
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.printful_order_id) {
      return NextResponse.json(
        { error: "Un brouillon Printful existe déjà pour cette commande", printfulOrderId: order.printful_order_id },
        { status: 409 }
      );
    }

    // Build recipient from shipping_address
    const addr = order.shipping_address as Record<string, string>;
    const recipient: PrintfulRecipient = {
      name:         `${addr.firstName ?? ""} ${addr.lastName ?? ""}`.trim(),
      address1:     addr.street ?? "",
      address2:     addr.complement ?? undefined,
      city:         addr.city ?? "",
      country_code: addr.country === "France" ? "FR" : (addr.country ?? "FR"),
      zip:          addr.postalCode ?? "",
      email:        order.billing_address?.email ?? undefined,
      phone:        addr.phone ?? undefined,
    };

    // Build Printful items
    const items: PrintfulOrderItem[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of (order.order_items ?? []) as any[]) {
      if (!isPrintfulProduct(item.product_id)) {
        return NextResponse.json(
          { error: `Produit ${item.product_id} non géré par Printful. Commande mixte non supportée.` },
          { status: 422 }
        );
      }

      const variantId = getPrintfulVariantId(item.product_id, item.color_id, item.size);
      if (!variantId) {
        return NextResponse.json(
          { error: `Variant Printful introuvable : produit=${item.product_id}, couleur=${item.color_id}, taille=${item.size}` },
          { status: 422 }
        );
      }

      const logoUrl = item.logo_file_url;
      if (!logoUrl) {
        return NextResponse.json(
          { error: `Fichier logo manquant pour l'article ${item.id}` },
          { status: 422 }
        );
      }

      items.push({
        variant_id: variantId,
        quantity:   item.quantity,
        files:      getFilesForPlacement(item.placement, logoUrl),
      });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "Aucun article Printful dans la commande" }, { status: 422 });
    }

    // Create Printful draft (confirm: false — NEVER triggers production)
    const printfulOrder = await createPrintfulDraft({
      external_id: order.order_number,
      recipient,
      items,
      confirm: false,
    });

    // Update DB: store printful_order_id, supplier_provider, status
    const { error: updateError } = await supabaseService
      .from("orders")
      .update({
        printful_order_id:  printfulOrder.id,
        printful_status:    printfulOrder.status,
        supplier_provider:  "printful",
        status:             "commande_fournisseur_passee",
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[Printful] DB update failed after draft creation:", updateError);
      // Order was created in Printful — return the ID so admin can track it
      return NextResponse.json(
        { warning: "Brouillon Printful créé mais mise à jour DB échouée", printfulOrderId: printfulOrder.id },
        { status: 500 }
      );
    }

    // Store printful_variant_id on each order_item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of (order.order_items ?? []) as any[]) {
      const variantId = getPrintfulVariantId(item.product_id, item.color_id, item.size);
      if (variantId) {
        await supabaseService
          .from("order_items")
          .update({ printful_variant_id: variantId })
          .eq("id", item.id);
      }
    }

    return NextResponse.json({
      success: true,
      printfulOrderId: printfulOrder.id,
      printfulStatus:  printfulOrder.status,
      costs:           printfulOrder.costs,
    });
  } catch (err) {
    console.error("[POST /api/printful/orders]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
