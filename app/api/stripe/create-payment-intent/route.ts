import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { createPaymentIntent, getStripe } from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/utils";
import { computeUnitPriceWithVolume, computeCartTotals, ttcToHt, PRICING_CONFIG } from "@/data/pricing";
import { ALL_PRODUCTS as PRODUCTS } from "@/data/products";
import { PRINT_PRODUCTS_LOOKUP, getBusinessCardLotPrice } from "@/data/print-products";
import { getPrintDirectPrice } from "@/data/print-pricing";
import { getPrintProduct } from "@/data/print-catalogue";
import { checkPrintfulAvailability } from "@/lib/printful-stock";
import type { Technique, Placement, PrintConfig } from "@/types";

interface CartItemInput {
  productId:    string;
  quantity:     number;
  size:         string;
  colorId:      string;
  colorLabel:   string;
  colorHex:     string;
  technique:    Technique;
  placement:    Placement;
  // Logo — optionnel, transmis depuis le panier si l'utilisateur a uploadé un fichier
  logoFileName: string | null;
  logoFileUrl:  string | null;
  logoFilePath: string | null;
  logoFileType: string | null;
  logoFileSize: number | null;
  // BAT config — effet visuel, position Fabric.js, référence BAT
  logoEffect:             string | null;
  logoPlacementTransform: Record<string, unknown> | null;
  batRef:                 string | null;
  // Aperçus BAT composés (face + dos) — URLs publiques Supabase Storage
  // uploadées par lib/uploadComposedPreview.ts au moment du ajout au panier.
  // Persistés en DB (migration 013) pour que l'admin puisse les revoir et
  // que le client retrouve son aperçu après refresh / dans le récap commande.
  composedPreviewUrl:  string | null;
  composedPreviewBack: string | null;
  /**
   * Print — présent uniquement pour les articles impression.
   * Si renseigné, le prix est lu depuis printConfig.lotPriceTTC (recomputed server-side).
   * quantity = 1 (1 lot). Ne jamais multiplier par la quantité d'exemplaires.
   */
  printConfig: PrintConfig | null;
}

/**
 * POST /api/stripe/create-payment-intent
 *
 * Supports both authenticated and guest checkout.
 * 1. Gets optional session (guests are allowed)
 * 2. Recomputes prices server-side (never trust client amounts)
 * 3. Creates order + items in DB via service role (bypasses RLS for guests)
 * 4. Creates Stripe PaymentIntent
 * 5. Returns clientSecret + orderId + orderNumber
 */
export async function POST(req: NextRequest) {
  try {
    // ── Session (optional — guests have no session) ───────────────────────────
    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    // Service role client — bypasses RLS for both auth and guest orders
    const supabase = await createSupabaseServiceClient();

    const body = await req.json();
    const { items, billingAddress, shippingAddress, guestEmail, marketingConsent }: {
      items:            CartItemInput[];
      billingAddress:   Record<string, string>;
      shippingAddress?: Record<string, string>;
      guestEmail?:      string;
      /** Opt-in prospection (#88) — case non pré-cochée au checkout. */
      marketingConsent?: boolean;
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // ── Garde stock Printful — AVANT tout encaissement ────────────────────────
    // Vérifie en direct (cache 15 min) que chaque article POD est en stock EU.
    // Bloque le paiement avec un message clair plutôt que d'encaisser un
    // produit non livrable (→ sinon email d'excuse + remboursement).
    const stockCheck = await checkPrintfulAvailability(
      items.map((i) => ({
        productId:  i.productId,
        colorId:    i.colorId,
        colorLabel: i.colorLabel,
        size:       i.size,
      })),
    );
    if (!stockCheck.ok) {
      const labels = stockCheck.unavailable.map((u) => {
        const name = PRODUCTS.find((p) => p.id === u.productId)?.shortName ?? u.productId;
        return `${name} ${u.colorLabel} taille ${u.size}`;
      });
      return NextResponse.json(
        {
          error:
            `Article momentanément en rupture de stock : ${labels.join(", ")}. ` +
            "Choisissez une autre taille ou couleur, ou réessayez plus tard — votre carte n'a pas été débitée.",
          unavailableItems: stockCheck.unavailable,
        },
        { status: 409 },
      );
    }

    // Determine effective email for receipts and notifications
    const effectiveEmail =
      user?.email ??
      guestEmail ??
      billingAddress?.email ??
      "";

    // Guest orders require at least an email for follow-up
    if (!user && !effectiveEmail) {
      return NextResponse.json(
        { error: "Un email est requis pour passer commande sans compte." },
        { status: 400 }
      );
    }

    // ── Ensure profile exists for authenticated users ─────────────────────────
    // Edge case: user signed up before migrations were applied → no profile row.
    // Upsert guarantees the FK constraint on orders.user_id is satisfied.
    if (user) {
      await supabase.from("profiles").upsert(
        {
          id:         user.id,
          email:      user.email ?? "",
          first_name: billingAddress?.firstName ?? "",
          last_name:  billingAddress?.lastName  ?? "",
          role:       "client",
          type:       "particulier",
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
    }

    // ── Consentement prospection → profil (si connecté) ──────────────────────
    if (user && marketingConsent) {
      await supabase
        .from("profiles")
        .update({ marketing_consent: true, marketing_consent_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    // ── Recompute prices server-side ──────────────────────────────────────────
    const computedItems = items.map((item) => {

      // ── Branche PRINT ────────────────────────────────────────────────────────
      // Technique "print" : prix = lot TTC recomputed depuis printConfig.
      // quantity = 1 (1 lot). Ne jamais multiplier par le nombre d'exemplaires.
      if (item.technique === "print" || item.printConfig) {
        const cfg = item.printConfig;
        if (!cfg) throw new Error(`printConfig manquant pour l'item print: ${item.productId}`);

        // Recompute server-side — ne jamais faire confiance au lotPriceTTC client.
        let lotPriceTTC: number;
        let productRef:  string;
        let productName: string;

        if (cfg.productType === "business_card") {
          const printProduct = PRINT_PRODUCTS_LOOKUP[item.productId];
          if (!printProduct) throw new Error(`Produit print inconnu: ${item.productId}`);
          lotPriceTTC = getBusinessCardLotPrice({
            finish:   cfg.finish ?? "mat",
            quantity: (cfg.quantity as 250 | 500 | 1000 | 2500),
            faces:    cfg.faces,
            corners:  cfg.corners ?? "standard",
          });
          productRef  = printProduct.id;
          productName = printProduct.shortName;
        } else {
          // Flyers / posters / toiles / invitations : prix baké Gelato × 2,2 (data/print-pricing).
          // Le prix flyer dépend des faces → on passe cfg.faces.
          // getPrintDirectPrice rejette toute combinaison non autorisée → anti-tampering.
          const price = getPrintDirectPrice(item.productId, cfg.quantity, cfg.faces);
          if (price == null) {
            throw new Error(`Combinaison prix print invalide : ${item.productId} ×${cfg.quantity} (${cfg.faces})`);
          }
          lotPriceTTC = price;
          const found = getPrintProduct(item.productId);
          productRef  = item.productId;
          productName = found?.product.name ?? item.productId;
        }
        const lotPriceHT = ttcToHt(lotPriceTTC);

        return {
          productId:        productRef,
          productReference: productRef,
          productName:      productName,
          productSnapshot:  { id: productRef, shortName: productName, printConfig: cfg },
          quantity:         1,       // toujours 1 lot en DB
          size:             "—",     // non applicable pour l'impression
          colorId:          "print",
          colorLabel:       "Impression",
          colorHex:         "#000000",
          technique:        "print" as Technique,
          placement:        "coeur" as Placement, // placeholder non affiché pour les print
          unitPriceHT:      lotPriceHT,
          unitPriceTTC:     lotPriceTTC,
          totalHT:          lotPriceHT,
          totalTTC:         lotPriceTTC,
          // Fichier print mappé sur les champs logo pour compatibilité avec le
          // workflow admin (filtre "Fichier en attente", validate-file, reject-file).
          // Source métier reste printConfig.frontFileUrl dans product_snapshot.
          logoFileName:            "Fichier recto carte de visite",
          logoFileUrl:             cfg.frontFileUrl ?? null,
          logoFilePath:            null,
          logoFileType:            null,
          logoFileSize:            null,
          logoEffect:              null,
          logoPlacementTransform:  null,
          batRef:                  null,
          composedPreviewUrl:      null,
          composedPreviewBack:     null,
          printConfig:             cfg,
        };
      }

      // ── Branche TEXTILE ──────────────────────────────────────────────────────
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Produit inconnu: ${item.productId}`);

      // Prix unitaire AVEC remise de volume (palier de quantité) — même calcul
      // que la vitrine et le panier → prix affiché = prix facturé.
      const unitPriceTTC = computeUnitPriceWithVolume({
        product,
        technique: item.technique,
        placement: item.placement,
        quantity:  item.quantity,
      });
      const unitPriceHT  = ttcToHt(unitPriceTTC);
      const totalTTC     = Math.round(unitPriceTTC * item.quantity * 100) / 100;
      const totalHT      = Math.round(unitPriceHT  * item.quantity * 100) / 100;

      const color = product.colors.find((c) => c.id === item.colorId);

      return {
        productId:        product.id,
        productReference: product.reference,
        productName:      product.shortName,
        productSnapshot:  { ...product, images: [] },
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
        // Propagate logo + BAT fields — never recomputed, passed through as-is
        logoFileName:            item.logoFileName            ?? null,
        logoFileUrl:             item.logoFileUrl             ?? null,
        logoFilePath:            item.logoFilePath            ?? null,
        logoFileType:            item.logoFileType            ?? null,
        logoFileSize:            item.logoFileSize            ?? null,
        logoEffect:              item.logoEffect              ?? null,
        logoPlacementTransform:  item.logoPlacementTransform  ?? null,
        batRef:                  item.batRef                  ?? null,
        composedPreviewUrl:      item.composedPreviewUrl      ?? null,
        composedPreviewBack:     item.composedPreviewBack     ?? null,
        printConfig:             null,
      };
    });

    const totals = computeCartTotals({
      items: computedItems.map((i) => ({ unitPrice: i.unitPriceTTC, quantity: i.quantity })),
    });

    // ── Generate order number ─────────────────────────────────────────────────
    const orderNumber = generateOrderNumber();

    // ── Create Stripe PaymentIntent ───────────────────────────────────────────
    const paymentIntent = await createPaymentIntent({
      amountTTC: totals.totalTTC,
      orderNumber,
      userEmail: effectiveEmail,
      metadata: {
        orderNumber,
        userId:    user?.id ?? "guest",
        itemCount: String(computedItems.length),
        guestEmail: effectiveEmail,
      },
    });

    // ── Insert order in DB (service role bypasses RLS) ────────────────────────
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number:             orderNumber,
        user_id:                  user?.id ?? null,
        guest_email:              user ? null : effectiveEmail,
        status:                   "paiement_recu",
        subtotal_ht:              totals.subtotalHT,
        tva:                      totals.tva,
        subtotal_ttc:             totals.subtotalTTC,
        shipping:                 totals.shipping,
        total_ttc:                totals.totalTTC,
        free_shipping:            totals.freeShipping,
        billing_address:          billingAddress,
        shipping_address:         shippingAddress ?? billingAddress,
        marketing_consent:        Boolean(marketingConsent),
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status:    "pending",
      })
      .select("id")
      .single();

    if (orderError || !orderRow) {
      console.error("[CreatePaymentIntent] Order insert:", orderError);
      return NextResponse.json({ error: "Erreur création commande" }, { status: 500 });
    }

    // ── Insert order items ────────────────────────────────────────────────────
    const itemRows = computedItems.map((item) => {
      // Pour les items print, product_snapshot contient printConfig.
      // printConfig n'est PAS une colonne séparée — il vit dans le JSONB product_snapshot.
      const productSnapshot = item.printConfig
        ? { ...item.productSnapshot, printConfig: item.printConfig }
        : item.productSnapshot;

      return {
        order_id:          orderRow.id,
        product_id:        item.productId,
        product_reference: item.productReference,
        product_name:      item.productName,
        product_snapshot:  productSnapshot,
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
        // Logo + BAT config — transmis depuis le panier (null pour les items print)
        logo_file_name:             item.logoFileName            ?? null,
        logo_file_url:              item.logoFileUrl             ?? null,
        logo_file_path:             item.logoFilePath            ?? null,
        logo_file_type:             item.logoFileType            ?? null,
        logo_file_size:             item.logoFileSize            ?? null,
        logo_file_status:           item.logoFileUrl             ? "en_attente" : null,
        logo_uploaded_at:           item.logoFileUrl             ? new Date().toISOString() : null,
        logo_effect:                item.logoEffect              ?? null,
        logo_placement_transform:   item.logoPlacementTransform  ?? null,
        bat_ref:                    item.batRef                  ?? null,
        // Aperçus BAT composés (face + dos) — URLs Supabase Storage
        // (cf migration 013_order_items_composed_preview.sql)
        composed_preview_url:       item.composedPreviewUrl      ?? null,
        composed_preview_back:      item.composedPreviewBack     ?? null,
      };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
    if (itemsError) {
      console.error("[CreatePaymentIntent] Items insert:", itemsError);
      // Garde-fou (bug E2E 2026-06-12) : sans articles, la commande est
      // inutilisable (ex. contrainte technique obsolète → commande fantôme
      // payable à 0 article). On annule l'intent et la commande plutôt que
      // de laisser le client payer dans le vide.
      await getStripe().paymentIntents.cancel(paymentIntent.id).catch(() => {});
      await supabase.from("orders").delete().eq("id", orderRow.id);
      return NextResponse.json(
        { error: "Impossible d'enregistrer les articles de la commande. Réessayez ou contactez-nous." },
        { status: 500 }
      );
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
