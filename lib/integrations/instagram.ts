/**
 * lib/integrations/instagram.ts
 *
 * Pipeline de préparation de posts Instagram à partir d'un mockup de commande.
 *
 * ÉTAT : STUB / SQUELETTE (volontaire pour cette itération).
 *   Les formats, dimensions et le contrat de retour sont définis et stables,
 *   mais le redimensionnement réel n'est pas encore branché.
 *
 * ⚠️ Contrainte Vercel à respecter lors de l'implémentation réelle :
 *   le système de fichiers est en LECTURE SEULE en runtime serverless.
 *   Il ne faut donc PAS écrire dans `/public/instagram-exports/`.
 *   → Les exports devront être générés avec `sharp` (déjà installé) puis
 *     uploadés vers Supabase Storage (ex. bucket `instagram-exports`), et ce
 *     sont les URLs publiques Supabase qui seront retournées.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Formats Instagram supportés. */
export type InstagramFormat = "feed" | "carousel" | "story";

/** Dimensions cibles par format (en pixels). */
export const INSTAGRAM_DIMENSIONS: Record<InstagramFormat, { width: number; height: number }> = {
  feed:     { width: 1080, height: 1080 }, // carré
  carousel: { width: 1080, height: 1350 }, // portrait 4:5
  story:    { width: 1080, height: 1920 }, // 9:16
};

export interface InstagramAsset {
  format: InstagramFormat;
  width: number;
  height: number;
  /** URL publique de l'asset généré, ou null tant que non implémenté. */
  url: string | null;
}

export interface InstagramPostResult {
  orderId: string;
  /** true tant que la génération réelle n'est pas branchée. */
  pending: boolean;
  assets: InstagramAsset[];
}

// ─── API publique (stub) ──────────────────────────────────────────────────────

/**
 * Prépare les 3 formats Instagram à partir du mockup d'une commande.
 *
 * STUB : retourne pour l'instant les descripteurs des 3 formats avec `url: null`
 * et `pending: true`. Aucun fichier n'est généré ni écrit.
 *
 * Implémentation future (voir avertissement en tête de fichier) :
 *   1. Récupérer l'URL du mockup de la commande.
 *   2. Pour chaque format, `sharp(buffer).resize(w, h, { fit: "cover" })`.
 *   3. Upload vers Supabase Storage : `{date}_{productType}_{orderId}_{format}.jpg`.
 *   4. Retourner les URLs publiques Supabase.
 *
 * @param orderId Identifiant interne de la commande.
 * @returns       Descripteurs des 3 formats (stub, `pending: true`).
 */
export async function prepareInstagramPost(orderId: string): Promise<InstagramPostResult> {
  const assets: InstagramAsset[] = (Object.keys(INSTAGRAM_DIMENSIONS) as InstagramFormat[]).map(
    (format) => ({
      format,
      width: INSTAGRAM_DIMENSIONS[format].width,
      height: INSTAGRAM_DIMENSIONS[format].height,
      url: null,
    }),
  );

  return { orderId, pending: true, assets };
}
