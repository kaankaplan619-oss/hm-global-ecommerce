import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";

/**
 * GET /api/payment/bank-info
 *
 * Renvoie les coordonnées bancaires HM Global pour la page de confirmation
 * "virement bancaire". Source = variables d'environnement uniquement, jamais
 * codées en dur dans le repo.
 *
 * Variables attendues :
 *   HM_BANK_BENEFICIARY  ex : "HM Global Agence"
 *   HM_BANK_IBAN         ex : "FR76 XXXX XXXX XXXX XXXX XXXX XXX"
 *   HM_BANK_BIC          ex : "XXXXFRPPXXX"
 *
 * En cas de variable manquante, on renvoie 500 — un faux IBAN partiel
 * n'aiderait personne et risquerait de pousser un client à virer ailleurs.
 */
export async function GET(req: NextRequest) {
  // Rate-limit (l'endpoint expose l'IBAN — accessible aux invités pour le
  // virement, mais sans raison d'être martelé/aspiré).
  const limited = rateLimit(req, { key: "bank-info", limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const beneficiary = process.env.HM_BANK_BENEFICIARY;
  const iban        = process.env.HM_BANK_IBAN;
  const bic         = process.env.HM_BANK_BIC;

  if (!beneficiary || !iban || !bic) {
    return NextResponse.json(
      { error: "Coordonnées bancaires non configurées" },
      { status: 500 }
    );
  }

  // Jamais mis en cache CDN ni indexé.
  return NextResponse.json(
    { beneficiary, iban, bic },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } }
  );
}
