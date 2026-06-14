import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/orders/upload-print-file
 *
 * Upload d'un fichier print (PDF, PNG, JPG) vers Supabase Storage.
 * Bucket : "print-files" — séparé du bucket "customer-logos" (textile).
 * Ne pas mélanger les fichiers print et textile.
 *
 * Pourquoi un bucket séparé ?
 *   - "customer-logos" est réservé aux logos textile (uploadLogo.ts — zone sensible).
 *   - "print-files" contient les fichiers prêts à imprimer (PDF, haute résolution).
 *   - RLS différente : les fichiers print sont plus volumineux, gestion distincte.
 *
 * Si le bucket "print-files" n'existe pas dans Supabase :
 *   → L'upload échoue avec une erreur claire (pas de crash silencieux).
 *   → Créer le bucket manuellement dans Supabase Dashboard :
 *       Storage → New Bucket → "print-files" → Public → Save
 *   → Ou via SQL : INSERT INTO storage.buckets (id, name, public) VALUES ('print-files', 'print-files', true);
 *
 * FormData attendu :
 *   file        : File
 *   face        : "front" | "back"
 *   productType : "business_card"
 *
 * Réponse :
 *   { url, name, size, type, path }
 */

const PRINT_BUCKET   = "print-files";
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 Mo
const ALLOWED_TYPES  = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

export async function POST(req: NextRequest) {
  try {
    // V1.2 (2026-05-27) — Upload invité autorisé. Auth est désormais optionnel :
    //   - User connecté → path "customers/{userId}/..." (continuité historique)
    //   - User invité   → path "guests/{sessionId}/..." (la session vient du
    //                     navigateur via FormData, voir BusinessCardConfigurator)
    // L'utilisateur peut configurer + uploader son fichier sans inscription
    // préalable. Le checkout accepte aussi les invités ; les fichiers restent
    // rattachés à la session et à la commande créée.
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ── Parse FormData ──────────────────────────────────────────────────────
    const formData = await req.formData();
    const file        = formData.get("file")        as File | null;
    const face        = formData.get("face")        as string | null;
    const productType = formData.get("productType") as string | null;
    const sessionId   = formData.get("sessionId")   as string | null;

    // Garde-fou : si pas connecté et pas de sessionId, on refuse pour éviter
    // les uploads anonymes sans aucune traçabilité (orphelins dans le bucket).
    if (!user && !sessionId) {
      return NextResponse.json(
        { error: "sessionId requis pour les uploads invités." },
        { status: 400 }
      );
    }

    if (!file || !face || !productType) {
      return NextResponse.json(
        { error: "Paramètres manquants : file, face, productType requis." },
        { status: 400 }
      );
    }

    if (!["front", "back"].includes(face)) {
      return NextResponse.json(
        { error: "face doit être 'front' ou 'back'." },
        { status: 400 }
      );
    }

    // Accepte les cartes ("business_card") ET tout produit print du catalogue
    // (flyer-a6, poster-50x70, canvas-30x40, card-a6…). Le productType ne sert
    // pas au chemin de stockage — on valide juste un slug sûr, non vide.
    if (!/^[a-z0-9_-]{2,40}$/.test(productType)) {
      return NextResponse.json(
        { error: "productType invalide." },
        { status: 400 }
      );
    }

    // ── Validation taille ───────────────────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Taille maximale : 20 Mo (reçu : ${Math.round(file.size / 1024 / 1024)} Mo).` },
        { status: 413 }
      );
    }

    // ── Validation type MIME ────────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non accepté : ${file.type}. Formats acceptés : PDF, PNG, JPG.` },
        { status: 415 }
      );
    }

    // ── Construction du chemin de stockage ─────────────────────────────────
    // V1.2 (2026-05-27) — Path différencié selon auth :
    //   User connecté → "customers/{userId}/{timestamp}-{face}-{nom}.ext"
    //   User invité   → "guests/{sessionId}/{timestamp}-{face}-{nom}.ext"
    // Permet de retrouver les fichiers d'un visiteur à la création de compte
    // post-checkout (script de migration guests → customers en V1.3).
    const ext       = file.name.split(".").pop() ?? "pdf";
    const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 80);
    const timestamp = Date.now();
    const ownerPrefix = user
      ? `customers/${user.id}`
      : `guests/${sessionId}`;
    const path      = `${ownerPrefix}/${timestamp}-${face}-${safeName}`;
    void ext; // (extension utilisée dans safeName, conservée pour évolutions futures)

    // ── Upload vers Supabase Storage ───────────────────────────────────────
    const bytes  = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const { error: uploadError } = await supabase.storage
      .from(PRINT_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert:      false, // pas d'écrasement silencieux
      });

    if (uploadError) {
      // Détection bucket manquant — message d'erreur actionnable
      if (
        uploadError.message?.includes("Bucket not found") ||
        uploadError.message?.includes("bucket") ||
        uploadError.message?.includes("The resource was not found")
      ) {
        return NextResponse.json(
          {
            error: [
              "Le bucket Supabase 'print-files' n'existe pas.",
              "Action requise : Supabase Dashboard → Storage → New Bucket → 'print-files' → cocher 'Public' → Save.",
              "Ou via SQL : INSERT INTO storage.buckets (id, name, public) VALUES ('print-files', 'print-files', true);",
            ].join(" "),
            bucketMissing: true,
          },
          { status: 503 }
        );
      }

      console.error("[upload-print-file] Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: `Erreur lors de l'upload : ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ── URL publique ────────────────────────────────────────────────────────
    const { data: { publicUrl } } = supabase.storage
      .from(PRINT_BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({
      url:  publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      path,
    });

  } catch (err) {
    console.error("[upload-print-file]", err);
    return NextResponse.json(
      { error: "Erreur serveur inattendue." },
      { status: 500 }
    );
  }
}
