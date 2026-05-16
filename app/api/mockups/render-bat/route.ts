/**
 * POST /api/mockups/render-bat
 *
 * POC — rendu BAT haute résolution côté serveur (Sharp).
 * Route isolée : ne touche pas au checkout, panier, admin, studio ni Stripe.
 *
 * Entrée JSON :
 * {
 *   "garmentPath":      "hm/textile/gildan-18000/noir/front.webp",
 *   "logoUrl":          "https://…supabase…/customer-logos/…/logo.png",
 *   "placement":        "coeur" | "dos",
 *   "face":             "front" | "back",
 *   "productCategory":  "hoodies",
 *   "transform": {
 *     "left":       217,
 *     "top":        174,
 *     "scaleX":     0.82,
 *     "scaleY":     0.82,
 *     "width":      200,
 *     "height":     180,
 *     "angle":      0,
 *     "canvasSize": 544
 *   },
 *   "outputSize": 2000
 * }
 *
 * Sortie JSON :
 * {
 *   "batUrl":       "https://…supabase…/bat-renders/…/bat.png",
 *   "storagePath":  "textile/gildan-18000/noir/1234567890-bat.png",
 *   "width":        2000,
 *   "height":       2000,
 *   "sizeBytes":    1234567
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { renderBat, validateGarmentPath, type LogoTransform } from "@/lib/bat-renderer";

const BAT_BUCKET = "bat-renders";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse body ────────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
    }

    const {
      garmentPath,
      logoUrl,
      placement,
      face,
      productCategory,
      transform,
      outputSize,
    } = body as {
      garmentPath:     string;
      logoUrl:         string;
      placement:       string;
      face:            string;
      productCategory: string;
      transform:       LogoTransform;
      outputSize?:     number;
    };

    // ── 2. Validation des champs requis ──────────────────────────────────────
    if (!garmentPath || typeof garmentPath !== "string") {
      return NextResponse.json({ error: "garmentPath requis (string)" }, { status: 400 });
    }
    if (!logoUrl || typeof logoUrl !== "string") {
      return NextResponse.json({ error: "logoUrl requis (string)" }, { status: 400 });
    }
    if (!placement || !["coeur", "dos"].includes(placement)) {
      return NextResponse.json({ error: "placement requis : coeur | dos" }, { status: 400 });
    }
    if (!face || !["front", "back"].includes(face)) {
      return NextResponse.json({ error: "face requis : front | back" }, { status: 400 });
    }
    if (!productCategory || typeof productCategory !== "string") {
      return NextResponse.json({ error: "productCategory requis (string)" }, { status: 400 });
    }
    if (
      !transform ||
      typeof transform.left      !== "number" ||
      typeof transform.top       !== "number" ||
      typeof transform.scaleX    !== "number" ||
      typeof transform.scaleY    !== "number" ||
      typeof transform.width     !== "number" ||
      typeof transform.height    !== "number" ||
      typeof transform.angle     !== "number" ||
      typeof transform.canvasSize !== "number" ||
      transform.canvasSize <= 0
    ) {
      return NextResponse.json(
        { error: "transform invalide — champs requis : left, top, scaleX, scaleY, width, height, angle, canvasSize" },
        { status: 400 },
      );
    }
    if (outputSize !== undefined && (typeof outputSize !== "number" || outputSize < 100 || outputSize > 4000)) {
      return NextResponse.json({ error: "outputSize invalide — entier entre 100 et 4000" }, { status: 400 });
    }

    // ── 3. Validation chemin garment (anti path-traversal) ───────────────────
    let safeGarmentPath: string;
    try {
      safeGarmentPath = validateGarmentPath(garmentPath);
    } catch (e) {
      return NextResponse.json(
        { error: (e as Error).message },
        { status: 400 },
      );
    }

    // ── 4. Vérifier que le bucket bat-renders existe ──────────────────────────
    const supabase = await createSupabaseServiceClient();
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("[render-bat] listBuckets error:", bucketsError);
      return NextResponse.json({ error: "Impossible de vérifier les buckets Supabase" }, { status: 500 });
    }
    const bucketExists = buckets?.some((b) => b.name === BAT_BUCKET);
    if (!bucketExists) {
      return NextResponse.json(
        {
          error: `Bucket "${BAT_BUCKET}" introuvable dans Supabase Storage.`,
          hint:  `Créer le bucket via Dashboard → Storage → New bucket → nom: "${BAT_BUCKET}" (public, 10 Mo max).`,
        },
        { status: 500 },
      );
    }

    // ── 5. Rendu Sharp ───────────────────────────────────────────────────────
    let result: Awaited<ReturnType<typeof renderBat>>;
    try {
      result = await renderBat({
        garmentRelativePath: safeGarmentPath,
        logoUrl,
        placement: placement as "coeur" | "dos",
        face:      face      as "front" | "back",
        productCategory,
        transform,
        outputSize,
      });
    } catch (e) {
      const msg = (e as Error).message;
      console.error("[render-bat] renderBat error:", msg);
      return NextResponse.json({ error: msg }, { status: 422 });
    }

    // ── 6. Upload vers Supabase bat-renders ──────────────────────────────────
    const timestamp    = Date.now();
    // Extraire productId/colorId depuis le chemin : hm/textile/{product}/{color}/{face}.webp
    const pathParts    = safeGarmentPath.split("/");
    const productId    = pathParts[2] ?? "unknown";
    const colorId      = pathParts[3] ?? "unknown";
    const storagePath  = `textile/${productId}/${colorId}/${timestamp}-${face}-bat.png`;

    const { error: uploadError } = await supabase.storage
      .from(BAT_BUCKET)
      .upload(storagePath, result.buffer, {
        contentType: "image/png",
        upsert:      false,
      });

    if (uploadError) {
      console.error("[render-bat] upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload Supabase échoué : ${uploadError.message}` },
        { status: 500 },
      );
    }

    // ── 7. Retourner l'URL publique ──────────────────────────────────────────
    const { data: urlData } = supabase.storage
      .from(BAT_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      batUrl:      urlData.publicUrl,
      storagePath,
      width:       result.width,
      height:      result.height,
      sizeBytes:   result.sizeBytes,
    });
  } catch (err) {
    console.error("[render-bat] unhandled error:", err);
    return NextResponse.json({ error: "Erreur serveur inattendue" }, { status: 500 });
  }
}
