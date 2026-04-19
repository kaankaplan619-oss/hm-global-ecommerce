import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/generate-invoice
 * Création API Pennylane volontairement désactivée pour la V1.
 * Les factures doivent être créées manuellement dans Pennylane.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await params;
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

    return NextResponse.json(
      {
        error: "Création automatique de facture désactivée pour la V1",
        manual: true,
      },
      { status: 409 }
    );
  } catch (err) {
    console.error("[GenerateInvoice]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
