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
 * Body (mode recommandé — l'item est résolu côté serveur) : {
 *   orderId:     string  — ID commande HM Global
 *   itemId:      string  — ID de l'order_item print : fichiers recto/verso,
 *                          quantité d'exemplaires et UID Gelato sont lus depuis
 *                          son product_snapshot.printConfig (source de vérité).
 *   productUid?: string  — override manuel de l'UID (sinon printConfig.gelatoUid)
 * }
 *
 * Body (mode legacy, conservé pour compat) : {
 *   orderId, productUid, fileUrl, fileType? — un seul fichier, quantité 1.
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
    const { orderId, itemId, productUid, fileUrl, fileType = "default" } = body as {
      orderId:     string;
      itemId?:     string;
      productUid?: string;
      fileUrl?:    string;
      fileType?:   "default" | "front" | "back";
    };

    if (!orderId || (!itemId && (!productUid || !fileUrl))) {
      return NextResponse.json(
        { error: "orderId + itemId requis (ou orderId + productUid + fileUrl en mode legacy)" },
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

    // ── Construction de l'item Gelato ───────────────────────────────────────
    // Mode recommandé (itemId) : tout est lu depuis le printConfig persisté à
    // la commande — fichiers recto/verso, quantité d'exemplaires (250/500/…),
    // UID produit. Évite les 3 pièges du mode legacy : verso perdu, quantité
    // forcée à 1, UID collé à la main.
    let resolvedUid:   string;
    let files:         GelatoOrderItem["files"];
    let printQuantity: number;

    if (itemId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = ((order.order_items ?? []) as any[]).find((i) => i.id === itemId);
      if (!item) {
        return NextResponse.json({ error: "Article introuvable dans la commande" }, { status: 404 });
      }
      const cfg = item.product_snapshot?.printConfig as {
        gelatoUid?:    string;
        frontFileUrl?: string;
        backFileUrl?:  string | null;
        quantity?:     number;
      } | undefined;
      if (!cfg?.frontFileUrl) {
        return NextResponse.json({ error: "Aucun fichier d'impression sur cet article" }, { status: 422 });
      }
      resolvedUid = (productUid ?? cfg.gelatoUid ?? "").trim();
      if (!resolvedUid) {
        return NextResponse.json(
          { error: "UID produit Gelato manquant (printConfig.gelatoUid absent — ancienne commande ? renseignez-le manuellement)" },
          { status: 422 }
        );
      }
      // Recto-verso : deux fichiers typés front/back. Recto seul : un fichier
      // "default" (Gelato imprime le verso vierge — la couleur est toujours 4-4).
      files = cfg.backFileUrl
        ? [
            { type: "front", url: cfg.frontFileUrl },
            { type: "back",  url: cfg.backFileUrl },
          ]
        : [{ type: "default", url: cfg.frontFileUrl }];
      printQuantity = cfg.quantity && cfg.quantity > 0 ? cfg.quantity : 1;
    } else {
      // Mode legacy : un seul fichier, quantité 1 (à éviter pour les lots).
      resolvedUid   = productUid!.trim();
      files         = [{ type: fileType, url: fileUrl! }];
      printQuantity = 1;
    }

    const items: GelatoOrderItem[] = [
      {
        itemReferenceId: itemId ? `${orderId}-${itemId}` : `${orderId}-item-1`,
        productUid: resolvedUid,
        files,
        quantity: printQuantity,
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
