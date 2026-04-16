import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncPennylaneInvoice } from "@/lib/pennylane";
import { sendFactureDisponible } from "@/lib/email";
import { mapDbOrderToOrder } from "@/lib/mappers";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/generate-invoice
 * Admin triggers Pennylane invoice generation after validation.
 * Updates order with invoice ID + URL, sends email to customer.
 */
export async function POST(req: NextRequest, { params }: Params) {
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

    // Fetch full order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*, profiles(*), order_items(*)")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.invoice_id) {
      return NextResponse.json({
        invoiceId:  order.invoice_id,
        invoiceUrl: order.invoice_url,
        invoiceNumber: order.pennylane_invoice_number,
        invoiceStatus: order.pennylane_invoice_status,
        message:    "Facture déjà générée",
      });
    }

    const mappedOrder = mapDbOrderToOrder(order);
    const pennylaneInvoice = await syncPennylaneInvoice(mappedOrder);

    // Save invoice info to DB
    const { error: updateError } = await supabase
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

    if (updateError) {
      console.error("[GenerateInvoice] DB update:", updateError);
      return NextResponse.json({ error: "Facture créée mais sauvegarde locale échouée" }, { status: 500 });
    }

    // Send email to customer
    try {
      await sendFactureDisponible({
        ...mappedOrder,
        invoiceId: pennylaneInvoice.invoiceId,
        invoiceUrl: pennylaneInvoice.invoiceUrl ?? undefined,
        pennylaneCustomerId: pennylaneInvoice.customerId,
        invoiceNumber: pennylaneInvoice.invoiceNumber,
        invoiceStatus: pennylaneInvoice.invoiceStatus,
        invoiceGeneratedAt: pennylaneInvoice.invoiceGeneratedAt,
        invoiceSyncedAt: pennylaneInvoice.invoiceSyncedAt,
      });
    } catch (emailErr) {
      console.error("[GenerateInvoice] Email error:", emailErr);
    }

    return NextResponse.json({
      invoiceId: pennylaneInvoice.invoiceId,
      invoiceUrl: pennylaneInvoice.invoiceUrl,
      invoiceNumber: pennylaneInvoice.invoiceNumber,
      invoiceStatus: pennylaneInvoice.invoiceStatus,
    });
  } catch (err) {
    console.error("[GenerateInvoice]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
