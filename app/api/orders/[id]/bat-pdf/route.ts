import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapDbOrderToOrder } from "@/lib/mappers";
import { buildBatPagesForOrder, generateBatPdf } from "@/lib/bat-pdf";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/[id]/bat-pdf
 * Génère le BAT officiel HM Global (PDF, template agence) pré-rempli depuis
 * la commande : client, produit + couleur, technique + placement + dimensions,
 * date du jour, visuels composites persistés (migration 013).
 * Réservé admin — le PDF est ensuite joint à l'email/WhatsApp de validation.
 */
export async function GET(_req: NextRequest, { params }: Params) {
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

    const { data: dbOrder } = await supabase
      .from("orders")
      .select("*, profiles(*), order_items(*)")
      .eq("id", id)
      .single();
    if (!dbOrder) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const order = mapDbOrderToOrder(dbOrder);
    const pages = await buildBatPagesForOrder(order);
    if (pages.length === 0) {
      return NextResponse.json(
        { error: "Aucun aperçu BAT composite sur cette commande — le client doit passer par le Studio (ou commande pré-migration 013)." },
        { status: 422 },
      );
    }

    const pdfBytes = await generateBatPdf(pages);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="BAT-${order.orderNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[BatPdf]", err);
    return NextResponse.json({ error: "Erreur génération BAT PDF" }, { status: 500 });
  }
}
