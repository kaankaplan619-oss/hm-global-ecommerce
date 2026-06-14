"use client";

/**
 * uploadComposedPreview.ts — Upload des aperçus BAT composés du Studio.
 *
 * Quand le client clique "Confirmer et ajouter au panier" dans la modale
 * BAT du Studio, on prend les data URL base64 (face + dos) générées par
 * Fabric.js et on les uploade dans Supabase Storage. On stocke ensuite
 * uniquement les URLs publiques (légères) dans le cart store + l'order.
 *
 * Avantages vs base64 inline :
 *   - localStorage cart léger (pas 2 MB de base64 par item)
 *   - URLs persistables en DB (text court vs blob)
 *   - Browser cache des images entre cart / checkout / admin
 *   - Admin peut voir l'aperçu sans devoir regénérer le composite
 *
 * Bucket utilisé : "customer-logos" (déjà existant) sous le préfixe
 * "studio-exports/". L'écriture passe par /api/studio/upload-asset avec la
 * clé serveur, validation de type et de taille. Les invités peuvent donc
 * commander sans ouvrir le bucket en écriture anonyme.
 *
 * Le bucket est public → URL accessible sans token (cohérent avec logos
 * actuels qui sont eux aussi en bucket public).
 *
 * Format JPEG/PNG accepté selon ce que Fabric génère (data:image/png ou
 * data:image/jpeg). PNG par défaut (Studio génère du PNG).
 */

import { uploadStudioAsset } from "@/lib/uploadStudioAsset";

export type ComposedPreviewUploadError =
  | "INVALID_DATA_URL"
  | "FETCH_BLOB_ERROR"
  | "SUPABASE_UPLOAD_ERROR"
  | "PUBLIC_URL_ERROR";

export interface ComposedPreviewUploadResult {
  /** URL publique stable, à stocker en DB et passer en src d'<img>. */
  url:  string;
  /** Chemin Supabase (pour suppression future si besoin). */
  path: string;
}

/**
 * Convertit un data URL base64 (ex: "data:image/png;base64,iVBORw0...")
 * en Blob exploitable par l'API Supabase Storage.
 *
 * Pourquoi pas atob() direct → fetch() est plus rapide sur les gros payloads
 * (la conversion native du browser est optimisée) et gère bien le MIME type.
 */
async function dataUrlToBlob(dataUrl: string): Promise<Blob | null> {
  if (!dataUrl.startsWith("data:")) return null;
  try {
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch {
    return null;
  }
}

/**
 * Upload un seul aperçu (face OU dos) vers Supabase Storage et retourne
 * son URL publique.
 *
 * @param dataUrl   data URL base64 généré par Fabric.js (toDataURL())
 * @param sessionId Identifiant de session navigateur (cohérence avec uploadLogo)
 * @param side      "face" | "back" — sert juste à nommer le fichier
 */
export async function uploadComposedPreviewToSupabase(
  dataUrl: string,
  sessionId: string,
  side: "face" | "back",
): Promise<{ data: ComposedPreviewUploadResult | null; error: ComposedPreviewUploadError | null }> {
  // 1. Convertir le data URL en Blob
  const blob = await dataUrlToBlob(dataUrl);
  if (!blob) {
    return { data: null, error: "INVALID_DATA_URL" };
  }

  // 2. La route serveur écrit dans Storage avec validation. Aucun accès
  // anonyme direct au bucket n'est nécessaire pour les commandes invitées.
  const ext = blob.type === "image/jpeg" ? "jpg" : "png";
  let uploaded;
  try {
    uploaded = await uploadStudioAsset(
      blob,
      sessionId,
      side === "face" ? "preview-face" : "preview-back",
      `preview-${side}.${ext}`,
    );
  } catch (error) {
    console.error("[uploadComposedPreview] upload error:", error);
    return { data: null, error: "SUPABASE_UPLOAD_ERROR" };
  }

  if (!uploaded.url) {
    return { data: null, error: "PUBLIC_URL_ERROR" };
  }

  return {
    data: { url: uploaded.url, path: uploaded.path },
    error: null,
  };
}

/**
 * Helper qui upload face + back en parallèle. Retourne les 2 URLs.
 * Si une seule des deux fonctions, on conserve l'URL réussie + on logge
 * l'erreur pour l'autre (l'aperçu partiel vaut mieux qu'aucun aperçu).
 *
 * Appelé depuis StudioSummaryPanel juste avant addItem au cart.
 */
export async function uploadBothComposedPreviews(
  faceDataUrl: string | undefined,
  backDataUrl: string | undefined,
  sessionId: string,
): Promise<{ faceUrl: string | null; backUrl: string | null }> {
  const [face, back] = await Promise.all([
    faceDataUrl
      ? uploadComposedPreviewToSupabase(faceDataUrl, sessionId, "face")
      : Promise.resolve({ data: null, error: null }),
    backDataUrl
      ? uploadComposedPreviewToSupabase(backDataUrl, sessionId, "back")
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (face.error) console.warn("[uploadBothComposedPreviews] face failed:", face.error);
  if (back.error) console.warn("[uploadBothComposedPreviews] back failed:", back.error);

  return {
    faceUrl: face.data?.url ?? null,
    backUrl: back.data?.url ?? null,
  };
}
