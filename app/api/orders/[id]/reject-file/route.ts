import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendFichierNonConforme } from "@/lib/email";
import { mapDbOrderToOrder } from "@/lib/mappers";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/reject-file
 * Admin sets status to en_attente_client with a rejection reason.
 * Sends an email to the customer asking for a new file.
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

    const { reason } = await req.json();
    if (!reason?.trim()) {
      return NextResponse.json({ error: "Motif de rejet requis" }, { status: 400 });
    }

    // Update order
    const { error } = await supabase
      .from("orders")
      .update({
        status:     "en_attente_client",
        admin_note: reason,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
    }

    // Mark order item logo as invalid
    await supabase
      .from("order_items")
      .update({
        logo_file_status:      "invalide",
        logo_rejection_reason: reason,
      })
      .eq("order_id", id);

    // Send email to customer
    try {
      const { data: fullOrder } = await supabase
        .from("orders")
        .select("*, profiles(*), order_items(*)")
        .eq("id", id)
        .single();

      if (fullOrder) {
        await sendFichierNonConforme(mapDbOrderToOrder(fullOrder), reason);
      }
    } catch (emailErr) {
      console.error("[RejectFile] Email error:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[RejectFile]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
