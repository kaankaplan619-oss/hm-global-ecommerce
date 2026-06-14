import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { getPrintifyVariantId } from "@/lib/suppliers/printify/printify-v1-map";
import { isPrintifyFulfilledProduct } from "@/lib/fulfillment";
import { createPrintifyOrder } from "@/lib/suppliers/printify/client";
import type {
  PrintifyOrderLineItem,
  PrintifyPlacedImage,
  PrintifyAddressTo,
} from "@/lib/suppliers/printify/types";

/**
 * POST /api/printify/orders
 * Admin-only. Crée une commande Printify en BROUILLON (send_to_production NON
 * appelé → ne lance PAS la production) pour une commande HM Global.
 * À confirmer via POST /api/printify/orders/[id]/confirm.
 *
 * Body: { orderId: string }
 *
 * Symétrique de POST /api/printful/orders. Seuls les articles du circuit
 * Printify (isPrintifyV1Product) partent ici ; les autres (Printful/atelier)
 * sont ignorés (commande mixte supportée).
 */

/**
 * Placement par défaut du visuel dans les zones d'impression Printify.
 * V1 : position de départ raisonnable — À AJUSTER par l'admin dans l'éditeur
 * Printify avant l'envoi en production (le brouillon n'imprime rien tant que
 * send_to_production n'est pas appelé). Coords 0..1 (centre), scale relatif.
 */
function buildPrintAreas(placement: string, imageUrl: string): Record<string, PrintifyPlacedImage[]> {
  const img = (x: number, y: number, scale: number): PrintifyPlacedImage[] => [
    { src: imageUrl, x, y, scale, angle: 0 },
  ];
  switch (placement) {
    case "coeur":     return { front: img(0.5, 0.42, 0.42) };
    case "dos":       return { back:  img(0.5, 0.5, 0.92) };
    case "coeur-dos": return { front: img(0.5, 0.42, 0.42), back: img(0.5, 0.5, 0.92) };
    default:          return { front: img(0.5, 0.5, 0.9) };
  }
}

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

    if (order.printify_order_id) {
      return NextResponse.json(
        { error: "Une commande Printify existe déjà pour cette commande", printifyOrderId: order.printify_order_id },
        { status: 409 }
      );
    }

    // Build address_to depuis shipping_address (rue stockée sous "address" en FR).
    const addr = (order.shipping_address ?? {}) as Record<string, string>;
    const street = addr.address ?? addr.address1 ?? addr.street ?? "";
    if (!street) {
      return NextResponse.json(
        { error: "Adresse de livraison incomplète (rue manquante) — corriger la commande avant l'envoi Printify." },
        { status: 422 }
      );
    }
    const billing = (order.billing_address ?? null) as Record<string, string> | null;
    const address_to: PrintifyAddressTo = {
      first_name: addr.firstName ?? "",
      last_name:  addr.lastName ?? "",
      email:      billing?.email ?? order.guest_email ?? undefined,
      phone:      addr.phone ?? undefined,
      country:    addr.country === "France" ? "FR" : (addr.country ?? "FR"),
      address1:   street,
      address2:   addr.complement ?? undefined,
      city:       addr.city ?? "",
      zip:        addr.postalCode ?? "",
    };

    // Build line items — uniquement les articles du circuit Printify.
    const line_items: PrintifyOrderLineItem[] = [];
    let skippedOther = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of (order.order_items ?? []) as any[]) {
      if (!isPrintifyFulfilledProduct(item.product_id)) {
        skippedOther += 1;
        continue;
      }

      const lookup = getPrintifyVariantId({
        productSlug: item.product_id,
        colorId:     item.color_id,
        size:        item.size,
      });
      if (!lookup.ok) {
        return NextResponse.json(
          { error: `Variant Printify introuvable : ${lookup.message}` },
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
      // Printify télécharge le fichier : une data URL base64 ou un chemin relatif
      // ne sont pas exploitables → bloquer ici avec un message actionnable.
      if (!/^https?:\/\//i.test(logoUrl)) {
        return NextResponse.json(
          { error: `URL du logo non publique pour l'article ${item.id} (data: ou chemin relatif) — re-télécharger le logo avant l'envoi Printify.` },
          { status: 422 }
        );
      }

      // Printify télécharge le visuel depuis l'URL publique (champ `src` des
      // print_areas) — pas d'upload préalable nécessaire.
      line_items.push({
        print_provider_id: lookup.preferredProvider,
        blueprint_id:      lookup.blueprintId,
        variant_id:        lookup.variantId,
        quantity:          item.quantity,
        print_areas:       buildPrintAreas(item.placement ?? "coeur", logoUrl),
      });
    }

    if (line_items.length === 0) {
      return NextResponse.json(
        { error: "Aucun article du circuit Printify dans cette commande." },
        { status: 422 }
      );
    }

    // Création du BROUILLON Printify — send_to_production NON appelé → rien en prod.
    const printifyOrder = await createPrintifyOrder({
      external_id:                order.order_number,
      label:                      `HM ${order.order_number}`,
      line_items,
      shipping_method:            1,
      send_shipping_notification: false,
      address_to,
    });

    // Update DB
    const { error: updateError } = await supabaseService
      .from("orders")
      .update({
        printify_order_id: String(printifyOrder.id),
        printify_status:   printifyOrder.status ?? "draft",
        supplier_provider: "printify",
        status:            "commande_fournisseur_passee",
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[Printify] DB update failed after order creation:", updateError);
      return NextResponse.json(
        { warning: "Commande Printify créée mais mise à jour DB échouée", printifyOrderId: printifyOrder.id },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success:         true,
      printifyOrderId: printifyOrder.id,
      printifyStatus:  printifyOrder.status ?? "draft",
      itemsSent:       line_items.length,
      skippedOther,
    });
  } catch (err) {
    console.error("[POST /api/printify/orders]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
