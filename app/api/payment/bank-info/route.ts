import { NextResponse } from "next/server";

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
export async function GET() {
  const beneficiary = process.env.HM_BANK_BENEFICIARY;
  const iban        = process.env.HM_BANK_IBAN;
  const bic         = process.env.HM_BANK_BIC;

  if (!beneficiary || !iban || !bic) {
    return NextResponse.json(
      { error: "Coordonnées bancaires non configurées" },
      { status: 500 }
    );
  }

  return NextResponse.json({ beneficiary, iban, bic });
}
