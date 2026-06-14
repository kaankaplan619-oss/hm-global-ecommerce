"use client";

import { uploadStudioAsset } from "@/lib/uploadStudioAsset";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LogoUploadResult {
  logoFileUrl:  string;
  logoFileName: string;
  logoMimeType: string;
  logoPath:     string;
}

export type LogoUploadError =
  | "FILE_TOO_LARGE"
  | "FORMAT_NOT_ALLOWED"
  | "SUPABASE_UPLOAD_ERROR"
  | "PUBLIC_URL_ERROR";

// ─── Constants — must stay in sync with bucket "customer-logos" settings ──────

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — matches bucket file_size_limit

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/svg+xml",
];

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Uploads a logo file to Supabase Storage under:
 *   studio-exports/{sessionId}/{timestamp}-logo-{filename}
 *
 * The sessionId is a stable browser session identifier (not an orderId).
 * Files are later moved / re-referenced when an order is created.
 *
 * Returns the public URL and storage path on success.
 * Passe par une route serveur validée, donc fonctionne aussi en commande invité.
 */
export async function uploadLogoToSupabase(
  file: File,
  sessionId: string,
): Promise<{ data: LogoUploadResult | null; error: LogoUploadError | null }> {
  // 1. Validate size
  if (file.size > MAX_SIZE_BYTES) {
    return { data: null, error: "FILE_TOO_LARGE" };
  }

  // 2. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { data: null, error: "FORMAT_NOT_ALLOWED" };
  }

  // 3. Upload via la route serveur (pas de policy Storage anonyme requise)
  let uploaded;
  try {
    uploaded = await uploadStudioAsset(file, sessionId, "logo", file.name);
  } catch (error) {
    console.error("[uploadLogo] upload error:", error);
    return { data: null, error: "SUPABASE_UPLOAD_ERROR" };
  }

  if (!uploaded.url) {
    return { data: null, error: "PUBLIC_URL_ERROR" };
  }

  return {
    data: {
      logoFileUrl:  uploaded.url,
      logoFileName: file.name,
      logoMimeType: file.type,
      logoPath:     uploaded.path,
    },
    error: null,
  };
}

// ─── Error messages ───────────────────────────────────────────────────────────

export function getUploadErrorMessage(error: LogoUploadError): string {
  switch (error) {
    case "FILE_TOO_LARGE":
      return "Fichier trop lourd. La taille maximale est 10 Mo.";
    case "FORMAT_NOT_ALLOWED":
      return "Format non autorisé. Formats acceptés : PNG, SVG.";
    case "SUPABASE_UPLOAD_ERROR":
      return "Erreur lors de l'envoi du fichier. Veuillez réessayer.";
    case "PUBLIC_URL_ERROR":
      return "Fichier envoyé mais l'URL n'a pas pu être récupérée. Contactez le support.";
  }
}
