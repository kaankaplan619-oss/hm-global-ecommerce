import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  sendCommandeExpediee,
  sendFactureDisponible,
  sendCommandeValidee,
  sendDemandeAvis,
} from "@/lib/email";
import { mapDbOrderToOrder } from "@/lib/mappers";
import { syncPennylaneInvoice } from "@/lib/pennylane";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/orders/[id]/admin-update
 * Admin updates order status, tracking, admin note, supplier mode.
 * Sends relevant emails on status change.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const { status, adminNote, trackingNumber, supplierMode, supplierNote } = body;

    // Fetch current order to detect status change
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status, order_number, order_items(product_name, quantity, technique, placement)")
      .eq("id", id)
      .single();

    const previousStatus = currentOrder?.status;

    // Build update object — only set fields that are provided
    const updatePayload: Record<string, unknown> = {};
    if (status !== undefined)        updatePayload.status         = status;
    if (adminNote !== undefined)     updatePayload.admin_note     = adminNote;
    if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber;
    if (supplierMode !== undefined)  updatePayload.supplier_mode  = supplierMode;
    if (supplierNote !== undefined)  updatePayload.supplier_note  = supplierNote;

    // Status-specific timestamps
    if (status === "validee")   updatePayload.validated_at = new Date().toISOString();
    if (status === "expediee")  updatePayload.shipped_at   = new Date().toISOString();
    if (status === "terminee")  updatePayload.delivered_at = new Date().toISOString();

    const { error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("[AdminUpdate]", error);
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
    }

    let invoiceError: string | null = null;

    // ── Send emails on status transition ──────────────────────────────────────
    if (status && status !== previousStatus) {
      try {
        const { data: fullOrder } = await supabase
          .from("orders")
        .select("*, profiles(*), order_items(*)")
        .eq("id", id)
        .single();

        if (fullOrder) {
          let mappedOrder = mapDbOrderToOrder(fullOrder);

          if (status === "validee" && !fullOrder.invoice_id) {
            try {
              const pennylaneInvoice = await syncPennylaneInvoice(mappedOrder);
              const { error: invoiceUpdateError } = await supabase
                .from("orders")
                .update({
                  invoice_id:                   pennylaneInvoice.invoiceId,
                  invoice_url:                  pennylaneInvoice.invoiceUrl,
                  invoice_generated_at:         pennylaneInvoice.invoiceGeneratedAt,
                  pennylane_customer_id:        pennylaneInvoice.customerId,
                  pennylane_invoice_number:     pennylaneInvoice.invoiceNumber,
                  pennylane_invoice_status:     pennylaneInvoice.invoiceStatus,
                  pennylane_invoice_synced_at:  pennylaneInvoice.invoiceSyncedAt,
                })
                .eq("id", id);

              if (invoiceUpdateError) {
                throw invoiceUpdateError;
              }

              mappedOrder = {
                ...mappedOrder,
                invoiceId: pennylaneInvoice.invoiceId,
                invoiceUrl: pennylaneInvoice.invoiceUrl ?? undefined,
                pennylaneCustomerId: pennylaneInvoice.customerId,
                invoiceNumber: pennylaneInvoice.invoiceNumber,
                invoiceStatus: pennylaneInvoice.invoiceStatus,
                invoiceGeneratedAt: pennylaneInvoice.invoiceGeneratedAt,
                invoiceSyncedAt: pennylaneInvoice.invoiceSyncedAt,
              };
            } catch (pennylaneErr) {
              console.error("[AdminUpdate] Pennylane error:", pennylaneErr);
              invoiceError = "Facture Pennylane non générée";
            }
          }

          if (status === "validee") {
            await sendCommandeValidee(mappedOrder);
            if (mappedOrder.invoiceId) {
              await sendFactureDisponible(mappedOrder);
            }
          }
          if (status === "expediee") {
            await sendCommandeExpediee(mappedOrder);
          }
          if (status === "terminee") {
            await sendDemandeAvis(mappedOrder);
          }
        }
      } catch (emailErr) {
        console.error("[AdminUpdate] Email error:", emailErr);
        // Non-blocking
      }
    }

    return NextResponse.json({ success: true, invoiceError });
  } catch (err) {
    console.error("[AdminUpdate]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
