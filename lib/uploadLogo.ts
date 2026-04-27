"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

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
  | "NOT_AUTHENTICATED"
  | "SUPABASE_UPLOAD_ERROR"
  | "PUBLIC_URL_ERROR";

// ─── Constants — must stay in sync with bucket "customer-logos" settings ──────

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — matches bucket file_size_limit

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

const BUCKET = "customer-logos";

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Uploads a logo file to Supabase Storage under:
 *   cart/{sessionId}/{timestamp}-{filename}
 *
 * The sessionId is a stable browser session identifier (not an orderId).
 * Files are later moved / re-referenced when an order is created.
 *
 * Returns the public URL and storage path on success.
 * Requires an authenticated Supabase session.
 */
export async function uploadLogoToSupabase(
  file: File,
  sessionId: string,
): Promise<{ data: LogoUploadResult | null; error: LogoUploadError | null }> {
  const supabase = getSupabaseBrowserClient();

  // 1. Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "NOT_AUTHENTICATED" };
  }

  // 2. Validate size
  if (file.size > MAX_SIZE_BYTES) {
    return { data: null, error: "FILE_TOO_LARGE" };
  }

  // 3. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { data: null, error: "FORMAT_NOT_ALLOWED" };
  }

  // 4. Build storage path
  const timestamp = Date.now();
  const safeName  = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path      = `cart/${sessionId}/${timestamp}-${safeName}`;

  // 5. Upload
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert:      false,
    });

  if (uploadError) {
    console.error("[uploadLogo] Supabase upload error:", uploadError);
    return { data: null, error: "SUPABASE_UPLOAD_ERROR" };
  }

  // 6. Get public URL (bucket is public)
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (!urlData?.publicUrl) {
    return { data: null, error: "PUBLIC_URL_ERROR" };
  }

  return {
    data: {
      logoFileUrl:  urlData.publicUrl,
      logoFileName: file.name,
      logoMimeType: file.type,
      logoPath:     path,
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
      return "Format non autorisé. Formats acceptés : PNG, JPG, WEBP, SVG, PDF.";
    case "NOT_AUTHENTICATED":
      return "Connectez-vous pour envoyer votre logo maintenant, ou ajoutez au panier — vous pourrez l'envoyer depuis votre espace commande.";
    case "SUPABASE_UPLOAD_ERROR":
      return "Erreur lors de l'envoi du fichier. Veuillez réessayer.";
    case "PUBLIC_URL_ERROR":
      return "Fichier envoyé mais l'URL n'a pas pu être récupérée. Contactez le support.";
  }
}
