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
 * "previews/" pour distinguer des vrais uploads logo client.
 *
 * Le bucket est public → URL accessible sans token (cohérent avec logos
 * actuels qui sont eux aussi en bucket public).
 *
 * Format JPEG/PNG accepté selon ce que Fabric génère (data:image/png ou
 * data:image/jpeg). PNG par défaut (Studio génère du PNG).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const BUCKET = "customer-logos";

export type ComposedPreviewUploadError =
  | "INVALID_DATA_URL"
  | "FETCH_BLOB_ERROR"
  | "NOT_AUTHENTICATED"
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

  // 2. Vérifier l'auth (cohérent avec uploadLogo)
  const supabase = getSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "NOT_AUTHENTICATED" };
  }

  // 3. Build path stable
  // Format : previews/{sessionId}/{timestamp}-{side}.{ext}
  // L'extension dépend du MIME type du blob (jpeg ou png).
  const ext = blob.type === "image/jpeg" ? "jpg" : "png";
  const timestamp = Date.now();
  const path = `previews/${sessionId}/${timestamp}-${side}.${ext}`;

  // 4. Upload
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: blob.type || "image/png",
      upsert:      false,
      // cacheControl 1 jour → l'admin va le revoir, le client peut revoir,
      // mais l'image est unique par order donc pas besoin de cache long.
      cacheControl: "86400",
    });

  if (uploadError) {
    console.error("[uploadComposedPreview] Supabase upload error:", uploadError);
    return { data: null, error: "SUPABASE_UPLOAD_ERROR" };
  }

  // 5. Public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!urlData?.publicUrl) {
    return { data: null, error: "PUBLIC_URL_ERROR" };
  }

  return {
    data: { url: urlData.publicUrl, path },
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
