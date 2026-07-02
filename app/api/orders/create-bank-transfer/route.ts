import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { syncBrevoContact } from "@/lib/brevo";
import { generateOrderNumber } from "@/lib/utils";
import { computeUnitPriceWithVolume, computeCartTotals, ttcToHt } from "@/data/pricing";
import { ALL_PRODUCTS as PRODUCTS } from "@/data/products";
import { PRINT_PRODUCTS_LOOKUP, getBusinessCardLotPrice } from "@/data/print-products";
import { getPrintDirectPrice } from "@/data/print-pricing";
import { getPrintProduct } from "@/data/print-catalogue";
import { checkPrintfulAvailability } from "@/lib/printful-stock";
import { mapDbOrderToOrder } from "@/lib/mappers";
import { sendInstructionsVirement } from "@/lib/email";
import { notifyNewOrder } from "@/lib/notify";
import { rateLimit } from "@/lib/security/rate-limit";
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
  logoFileName: string | null;
  logoFileUrl:  string | null;
  logoFilePath: string | null;
  logoFileType: string | null;
  logoFileSize: number | null;
  logoEffect:             string | null;
  logoPlacementTransform: Record<string, unknown> | null;
  batRef:                 string | null;
  composedPreviewUrl:  string | null;
  composedPreviewBack: string | null;
  printConfig: PrintConfig | null;
}

/**
 * POST /api/orders/create-bank-transfer
 *
 * Crée une commande en `awaiting_bank_transfer` sans appeler Stripe.
 * Logique de prix identique à /api/stripe/create-payment-intent — recompute
 * server-side, jamais faire confiance aux montants client.
 *
 * V1 manuel : aucune réconciliation banque, l'admin marque la commande payée
 * via PATCH /api/orders/[id]/admin-update une fois le virement reçu.
 */
export async function POST(req: NextRequest) {
  try {
    // ── Rate-limit (anti commandes-fantômes) ─────────────────────────────────
    const limited = rateLimit(req, { key: "checkout-bt", limit: 12, windowMs: 60_000 });
    if (limited) return limited;

    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
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

    // ── Consentement prospection → profil (si connecté) ──────────────────────
    if (user && marketingConsent) {
      await supabase
        .from("profiles")
        .update({ marketing_consent: true, marketing_consent_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    // Sync Brevo (opt-in commande, invité ou connecté) — non bloquant
    if (marketingConsent) {
      await syncBrevoContact({
        email:     user?.email ?? guestEmail ?? "",
        firstName: billingAddress?.firstName ?? null,
        lastName:  billingAddress?.lastName ?? null,
        source:    "commande",
      });
    }

    // ── Garde stock Printful — même protection que le paiement CB ─────────────
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
            "Choisissez une autre taille ou couleur, ou réessayez plus tard.",
          unavailableItems: stockCheck.unavailable,
        },
        { status: 409 },
      );
    }

    const effectiveEmail =
      user?.email ??
      guestEmail ??
      billingAddress?.email ??
      "";

    if (!user && !effectiveEmail) {
      return NextResponse.json(
        { error: "Un email est requis pour passer commande sans compte." },
        { status: 400 }
      );
    }

    // Profile upsert — même garde-fou que create-payment-intent
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

    // ── Recompute prices server-side (copie de create-payment-intent) ─────────
    const computedItems = items.map((item) => {
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
          quantity:         1,
          size:             "—",
          colorId:          "print",
          colorLabel:       "Impression",
          colorHex:         "#000000",
          technique:        "print" as Technique,
          placement:        "coeur" as Placement,
          unitPriceHT:      lotPriceHT,
          unitPriceTTC:     lotPriceTTC,
          totalHT:          lotPriceHT,
          totalTTC:         lotPriceTTC,
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

      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Produit inconnu: ${item.productId}`);

      // Prix unitaire AVEC remise de volume (palier de quantité) — cohérent
      // avec la vitrine, le panier et l'autre route de paiement.
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

    const orderNumber = generateOrderNumber();

    // ── Insert order — pas de Stripe, statut awaiting_bank_transfer ───────────
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number:     orderNumber,
        user_id:          user?.id ?? null,
        guest_email:      user ? null : effectiveEmail,
        status:           "awaiting_bank_transfer",
        payment_method:   "bank_transfer",
        subtotal_ht:      totals.subtotalHT,
        tva:              totals.tva,
        subtotal_ttc:     totals.subtotalTTC,
        shipping:         totals.shipping,
        total_ttc:        totals.totalTTC,
        free_shipping:    totals.freeShipping,
        marketing_consent: Boolean(marketingConsent),
        billing_address:  billingAddress,
        shipping_address: shippingAddress ?? billingAddress,
      })
      .select("id, order_number")
      .single();

    if (orderError || !orderRow) {
      console.error("[CreateBankTransfer] Order insert:", orderError);
      return NextResponse.json({ error: "Erreur création commande" }, { status: 500 });
    }

    const itemRows = computedItems.map((item) => {
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
        composed_preview_url:       item.composedPreviewUrl      ?? null,
        composed_preview_back:      item.composedPreviewBack     ?? null,
      };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
    if (itemsError) {
      console.error("[CreateBankTransfer] Items insert:", itemsError);
    }

    // ── Email instructions de virement (non bloquant) ─────────────────────────
    // Le client a besoin d'une trace écrite (IBAN + référence) pour payer.
    try {
      const beneficiary = process.env.HM_BANK_BENEFICIARY;
      const iban        = process.env.HM_BANK_IBAN;
      const bic         = process.env.HM_BANK_BIC;
      if (beneficiary && iban && bic) {
        const { data: full } = await supabase
          .from("orders")
          .select("*, profiles(*), order_items(*)")
          .eq("id", orderRow.id)
          .single();
        if (full) {
          const mapped = mapDbOrderToOrder(full);
          if (mapped.user?.email) {
            await sendInstructionsVirement(mapped, { beneficiary, iban, bic });
          }
        }
      } else {
        console.warn("[CreateBankTransfer] HM_BANK_* manquants — email virement non envoyé");
      }
    } catch (emailErr) {
      console.error("[CreateBankTransfer] email virement:", emailErr);
    }

    // ── Notif admin (Discord, best-effort) ────────────────────────────────────
    await notifyNewOrder({
      orderNumber:   orderRow.order_number,
      totalTTC:      totals.totalTTC,
      paymentMethod: "bank_transfer",
      email:         effectiveEmail || null,
      itemCount:     computedItems.length,
    });

    return NextResponse.json({
      orderId:     orderRow.id,
      orderNumber: orderRow.order_number,
      totalTTC:    totals.totalTTC,
    });
  } catch (err) {
    console.error("[CreateBankTransfer]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
