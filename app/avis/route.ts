import { NextResponse } from "next/server";

/**
 * GET /avis — Redirige vers la page d'avis Google de HM Global.
 *
 * Lien court, mémorable et trackable, à utiliser dans les emails post-commande,
 * le QR code sur les colis, la signature email et les cartes « avis ».
 *
 * Cible configurable via la variable d'environnement GOOGLE_REVIEW_URL : y coller
 * le lien « Obtenir plus d'avis » fourni par Google Business Profile
 * (business.google.com → Avis → Obtenir plus d'avis), qui ouvre directement le
 * formulaire « Écrire un avis ». Tant qu'elle n'est pas renseignée, on retombe
 * sur une recherche Maps de l'établissement (qui mène à la fiche + ses avis).
 *
 * Redirection 307 (temporaire) pour pouvoir changer la cible sans casser le cache.
 */
const GOOGLE_REVIEW_URL =
  process.env.GOOGLE_REVIEW_URL ??
  "https://www.google.com/maps/search/?api=1&query=HM%20Global%20Agence%20Souffelweyersheim";

export function GET() {
  return NextResponse.redirect(GOOGLE_REVIEW_URL, 307);
}
