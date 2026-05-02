import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/validate-file
 * Admin marks the logo file as valid and advances order to bat_a_preparer.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

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

    // Mark all pending logo files on this order as valid
    await supabase
      .from("order_items")
      .update({ logo_file_status: "valide" })
      .eq("order_id", id)
      .eq("logo_file_status", "en_attente");

    // Advance order status to bat_a_preparer
    const { error } = await supabase
      .from("orders")
      .update({ status: "bat_a_preparer" })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ValidateFile]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
