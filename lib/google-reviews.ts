/**
 * lib/google-reviews.ts — Récupération des avis Google (server-only).
 *
 * Utilise la **Places API (New)** de Google :
 *   - resolvePlaceId : retrouve le Place ID de HM Global (env ou Text Search)
 *   - getGoogleReviews : note, nombre d'avis, et jusqu'à 6 avis (auteur + photo)
 *
 * Clé requise (server-only, JAMAIS NEXT_PUBLIC_) :
 *   GOOGLE_PLACES_API_KEY   → clé Google Cloud avec "Places API (New)" activée
 * Optionnel :
 *   GOOGLE_PLACES_PLACE_ID  → si absent, résolu automatiquement via Text Search
 *   GOOGLE_PLACES_QUERY     → requête de résolution (défaut ci-dessous)
 *
 * Sans clé → retourne null → le composant conserve uniquement un lien vers la
 * fiche Google, sans afficher de note ou nombre d'avis non vérifié.
 *
 * Cache : revalidate 24 h (évite de payer un appel API à chaque rendu).
 */

const PLACES_BASE = "https://places.googleapis.com/v1";
const DEFAULT_QUERY = "HM Global Agence Souffelweyersheim 67460";
const REVALIDATE_SECONDS = 86_400;

export interface GoogleReview {
  author:       string;
  authorUrl?:   string;
  photo?:       string;
  rating:       number;
  text:         string;
  relativeTime: string;
}

export interface GoogleReviewsData {
  rating:  number;
  total:   number;
  mapsUri: string;
  reviews: GoogleReview[];
}

interface RawAuthor { displayName?: string; uri?: string; photoUri?: string }
interface RawReview {
  rating?: number;
  text?:   { text?: string };
  authorAttribution?: RawAuthor;
  relativePublishTimeDescription?: string;
}
interface RawPlace {
  rating?:         number;
  userRatingCount?: number;
  googleMapsUri?:  string;
  reviews?:        RawReview[];
}

async function resolvePlaceId(key: string): Promise<string | null> {
  const fromEnv = process.env.GOOGLE_PLACES_PLACE_ID;
  if (fromEnv) return fromEnv;
  try {
    const res = await fetch(`${PLACES_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type":     "application/json",
        "X-Goog-Api-Key":   key,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({
        textQuery:    process.env.GOOGLE_PLACES_QUERY ?? DEFAULT_QUERY,
        languageCode: "fr",
        regionCode:   "FR",
      }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { places?: { id?: string }[] };
    return json.places?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  const placeId = await resolvePlaceId(key);
  if (!placeId) return null;

  try {
    const res = await fetch(`${PLACES_BASE}/places/${placeId}?languageCode=fr`, {
      headers: {
        "X-Goog-Api-Key":   key,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const p = (await res.json()) as RawPlace;

    const reviews: GoogleReview[] = (p.reviews ?? [])
      .filter((r) => Boolean(r.text?.text))
      .slice(0, 6)
      .map((r) => ({
        author:       r.authorAttribution?.displayName ?? "Client",
        authorUrl:    r.authorAttribution?.uri,
        photo:        r.authorAttribution?.photoUri,
        rating:       r.rating ?? 5,
        text:         r.text?.text ?? "",
        relativeTime: r.relativePublishTimeDescription ?? "",
      }));

    if (typeof p.rating !== "number" || typeof p.userRatingCount !== "number") {
      return null;
    }

    return {
      rating: p.rating,
      total: p.userRatingCount,
      mapsUri: p.googleMapsUri ?? FALLBACK_MAPS_URI,
      reviews,
    };
  } catch {
    return null;
  }
}

/** Lien public vers la fiche (fallback quand l'API n'est pas branchée). */
export const FALLBACK_MAPS_URI =
  "https://www.google.com/maps/search/?api=1&query=HM%20Global%20Agence%20Souffelweyersheim";
