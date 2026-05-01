/**
 * lib/mappers.ts
 *
 * Shared mapper: Supabase DB row (snake_case, joined) → frontend Order type (camelCase).
 *
 * Used by:
 *   - app/api/orders/[id]/route.ts        (GET single order)
 *   - app/api/stripe/webhook/route.ts     (before sending emails)
 *   - app/api/orders/[id]/admin-update    (before sending emails on status change)
 *   - app/api/orders/[id]/reject-file     (before sending email)
 *   - app/api/orders/[id]/cancel          (before sending email)
 *
 * Expected input shape:
 *   supabase.from("orders").select("*, profiles(*), order_items(*)")
 *
 * The profiles join is available as row.profiles (object, not array).
 * The order_items join is available as row.order_items (array).
 */

import type { Order } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbOrderToOrder(row: any): Order {
  const p = row.profiles ?? {};

  return {
    id:           row.id,
    orderNumber:  row.order_number,
    userId:       row.user_id,

    user: {
      id:          p.id          ?? row.user_id ?? "guest",
      // For guest orders: fall back to billing_address.email or guest_email column
      email:       p.email       ?? row.billing_address?.email ?? row.guest_email ?? "",
      firstName:   p.first_name  ?? row.billing_address?.firstName ?? "",
      lastName:    p.last_name   ?? "",
      phone:       p.phone       ?? "",
      role:        p.role        ?? "client",
      type:        p.type        ?? "particulier",
      company:     p.company     ?? undefined,
      siret:       p.siret       ?? undefined,
      tvaIntracom: p.tva_intracom ?? undefined,
      addresses:   [],
      createdAt:   p.created_at  ?? "",
      updatedAt:   p.updated_at  ?? "",
    },

    status: row.status,

    // Pricing
    subtotalHT:  row.subtotal_ht,
    tva:         row.tva,
    subtotalTTC: row.subtotal_ttc,
    shipping:    row.shipping,
    totalTTC:    row.total_ttc,
    freeShipping: row.free_shipping,

    // Payment
    stripePaymentIntentId: row.stripe_payment_intent_id  ?? undefined,
    stripePaymentStatus:   row.stripe_payment_status     ?? undefined,
    paidAt:                row.paid_at                   ?? undefined,

    // Addresses (stored as JSON snapshots)
    shippingAddress: row.shipping_address ?? {},
    billingAddress:  row.billing_address  ?? {},

    // Shipping
    trackingNumber: row.tracking_number ?? undefined,
    shippedAt:      row.shipped_at      ?? undefined,
    deliveredAt:    row.delivered_at    ?? undefined,

    // Admin
    supplierMode: row.supplier_mode ?? undefined,
    supplierNote: row.supplier_note ?? undefined,
    adminNote:    row.admin_note    ?? undefined,
    validatedAt:  row.validated_at  ?? undefined,

    // Invoice
    invoiceId:           row.invoice_id           ?? undefined,
    invoiceUrl:          row.invoice_url           ?? undefined,
    pennylaneCustomerId: row.pennylane_customer_id ?? undefined,
    invoiceNumber:       row.pennylane_invoice_number ?? undefined,
    invoiceStatus:       row.pennylane_invoice_status ?? undefined,
    invoiceGeneratedAt:  row.invoice_generated_at  ?? undefined,
    invoiceSyncedAt:     row.pennylane_invoice_synced_at ?? undefined,

    // Cancellation
    cancelledAt:         row.cancelled_at         ?? undefined,
    cancellationReason:  row.cancellation_reason  ?? undefined,
    refundedAt:          row.refunded_at          ?? undefined,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    // Items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (row.order_items ?? []).map((item: any) => ({
      id: item.id,

      product: {
        id:        item.product_id,
        reference: item.product_reference,
        shortName: item.product_name,
        // Spread the snapshot for any extra fields (category, slug, etc.)
        ...(item.product_snapshot && typeof item.product_snapshot === "object"
          ? item.product_snapshot
          : {}),
      },

      quantity:  item.quantity,
      size:      item.size,

      color: {
        id:        item.color_id,
        label:     item.color_label,
        hex:       item.color_hex,
        available: true,
      },

      technique: item.technique,
      placement: item.placement,

      unitPriceHT:  item.unit_price_ht,
      unitPriceTTC: item.unit_price_ttc,
      totalHT:      item.total_ht,
      totalTTC:     item.total_ttc,

      logoFile: item.logo_file_url
        ? {
            id:              item.id,
            name:            item.logo_file_name      ?? "",
            url:             item.logo_file_url,
            path:            item.logo_file_path      ?? undefined,
            type:            item.logo_file_type      ?? "",
            size:            item.logo_file_size      ?? 0,
            status:          item.logo_file_status    ?? "en_attente",
            uploadedAt:      item.logo_uploaded_at    ?? "",
            rejectionReason: item.logo_rejection_reason ?? undefined,
          }
        : undefined,

      logoEffect:             item.logo_effect              ?? undefined,
      batRef:                 item.bat_ref                  ?? undefined,
      logoPlacementTransform: item.logo_placement_transform ?? undefined,
    })),
  };
}
