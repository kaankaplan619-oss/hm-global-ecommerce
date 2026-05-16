import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isPrintoclockConfigured, listPaymentMethods } from "@/lib/printoclock";

/**
 * GET /api/printoclock/status
 * Admin-only. Vérifie la connexion PrintoClock et retourne les méthodes de paiement.
 * Utile pour valider que les credentials fonctionnent après la configuration.
 *
 * Réponse :
 *   { configured: true, connected: true, paymentMethods: [...] }
 *   { configured: false, connected: false, error: "..." }
 */
export async function GET(req: NextRequest) {
  try {
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

    const configured = isPrintoclockConfigured();

    if (!configured) {
      return NextResponse.json({
        configured: false,
        connected:  false,
        message:    "Variables d'environnement manquantes : PRINTOCLOCK_USERNAME et/ou PRINTOCLOCK_PASSWORD",
        nextSteps: [
          "1. Appelez PrintoClock au 01 83 35 30 45 pour obtenir vos credentials",
          "2. Ajoutez PRINTOCLOCK_USERNAME et PRINTOCLOCK_PASSWORD dans Vercel → Settings → Environment Variables",
          "3. Redéployez l'application",
          "4. Rappellez cette route pour vérifier la connexion",
        ],
      });
    }

    // Test réel de connexion
    const paymentMethods = await listPaymentMethods();

    return NextResponse.json({
      configured:     true,
      connected:      true,
      message:        "Connexion PrintoClock opérationnelle ✓",
      paymentMethods: paymentMethods.map((m) => ({
        code:        m.code,
        name:        m.name,
        description: m.description,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      configured: isPrintoclockConfigured(),
      connected:  false,
      error:      msg,
    }, { status: 500 });
  }
}
