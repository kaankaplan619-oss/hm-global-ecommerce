import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { createPrintfulDraft, getFilesForPlacement } from "@/lib/printful";
import { getPrintfulVariantId, isPrintfulProduct, getPrintfulFrontFileType } from "@/lib/printfulVariantMap";
import { buildPrintfulPosition } from "@/lib/printful-placement";
import { ATELIER_QTY_THRESHOLD } from "@/data/pricing";
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

    // Build recipient from shipping_address.
    // Le checkout stocke la rue sous "address" (formulaire FR) — fallbacks
    // pour la compat avec d'anciens formats ("address1"/"street").
    const addr = order.shipping_address as Record<string, string>;
    const street = addr.address ?? addr.address1 ?? addr.street ?? "";
    if (!street) {
      return NextResponse.json(
        { error: "Adresse de livraison incomplète (rue manquante) — corriger la commande avant l'envoi Printful." },
        { status: 422 }
      );
    }
    const recipient: PrintfulRecipient = {
      name:         `${addr.firstName ?? ""} ${addr.lastName ?? ""}`.trim(),
      address1:     street,
      address2:     addr.complement ?? undefined,
      city:         addr.city ?? "",
      country_code: addr.country === "France" ? "FR" : (addr.country ?? "FR"),
      zip:          addr.postalCode ?? "",
      email:        order.billing_address?.email ?? order.guest_email ?? undefined,
      phone:        addr.phone ?? undefined,
    };

    // Build Printful items — commande MIXTE supportée : seuls les articles du
    // circuit Printful partent chez Printful ; les articles atelier (volume
    // DTF ≥ seuil, produits TopTex/Falk&Ross) sont ignorés ici et restent à
    // produire en interne (même logique que lib/fulfillment.ts).
    const items: PrintfulOrderItem[] = [];
    let skippedAtelier = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of (order.order_items ?? []) as any[]) {
      const atelierTech =
        item.technique === "dtf" || item.technique === "dtflex" || item.technique === "flex";
      const isAtelierItem =
        !isPrintfulProduct(item.product_id) ||
        (item.quantity >= ATELIER_QTY_THRESHOLD && atelierTech);
      if (isAtelierItem) {
        skippedAtelier += 1;
        continue;
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

      // Placement exact du Studio → position Printful (aperçu = imprimé).
      // null si transform absent/rotation/produit hors map → Printful place
      // le fichier par défaut, comme avant.
      const position = buildPrintfulPosition(item.product_id, item.logo_placement_transform);

      // Type de fichier EXACT exigé par ce produit (broderie/impression) —
      // un mauvais type (ex "front" sur une casquette) → 400 Printful.
      const frontType = getPrintfulFrontFileType(item.product_id, item.technique);

      items.push({
        variant_id: variantId,
        quantity:   item.quantity,
        files:      getFilesForPlacement(item.placement, logoUrl, position ?? undefined, frontType),
      });
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Aucun article du circuit Printful dans cette commande (tout part à l'atelier)." },
        { status: 422 }
      );
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
        printful_order_id:  String(printfulOrder.id),
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
      itemsSent:       items.length,
      skippedAtelier,
    });
  } catch (err) {
    console.error("[POST /api/printful/orders]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
