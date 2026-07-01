import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { sniffImageKind, kindFromMime, sanitizeSvg } from "@/lib/security/fileValidation";

// Runtime Node requis (sanitisation SVG via DOMPurify / jsdom).
export const runtime = "nodejs";

const BUCKET = "customer-logos";
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
// SVG accepté mais SANITISÉ avant stockage (cf. lib/security/fileValidation) :
// un SVG peut embarquer du JavaScript et, servi depuis un bucket public en
// image/svg+xml, deviendrait un vecteur de XSS stocké. On neutralise donc
// scripts / handlers / liens javascript: avant l'upload. Le type réel de tout
// fichier est vérifié par magic bytes (indépendamment du type déclaré).
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
]);
const ALLOWED_KINDS = new Set(["logo", "print", "preview-face", "preview-back"]);

export async function POST(req: NextRequest) {
  // Anti-spam : upload anonyme via service_role (bypass RLS).
  const limited = rateLimit(req, { key: "upload-asset", limit: 30, windowMs: 5 * 60_000 });
  if (limited) return limited;

  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin) {
      return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const sessionId = formData.get("sessionId");
    const kind = formData.get("kind");

    if (
      !(file instanceof File) ||
      typeof sessionId !== "string" ||
      typeof kind !== "string"
    ) {
      return NextResponse.json(
        { error: "Paramètres file, sessionId et kind requis." },
        { status: 400 },
      );
    }

    if (!/^[a-f0-9-]{36}$/i.test(sessionId) || !ALLOWED_KINDS.has(kind)) {
      return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Fichier vide ou supérieur à 10 Mo." },
        { status: 413 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Format non accepté. Utilisez PNG, JPG ou SVG." },
        { status: 415 },
      );
    }

    // Validation du CONTENU réel (magic bytes) — indépendante du type déclaré.
    const declaredKind = kindFromMime(file.type);
    const rawBytes = new Uint8Array(await file.arrayBuffer());
    const actualKind = sniffImageKind(rawBytes);

    if (!actualKind || actualKind !== declaredKind) {
      return NextResponse.json(
        { error: "Le contenu du fichier ne correspond pas à une image PNG, JPG ou SVG valide." },
        { status: 415 },
      );
    }

    // SVG : sanitisation obligatoire avant stockage public (anti-XSS stocké).
    let uploadBytes: Uint8Array = rawBytes;
    let uploadContentType = file.type;
    if (actualKind === "svg") {
      const clean = sanitizeSvg(rawBytes);
      if (!clean) {
        return NextResponse.json(
          { error: "Le SVG n'a pas pu être sécurisé." },
          { status: 422 },
        );
      }
      uploadBytes = new TextEncoder().encode(clean);
      uploadContentType = "image/svg+xml";
    }

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 80);
    const path = `studio-exports/${sessionId}/${Date.now()}-${kind}-${safeName}`;
    const supabase = await createSupabaseServiceClient();
    const { error } = await supabase.storage.from(BUCKET).upload(path, uploadBytes, {
      contentType: uploadContentType,
      upsert: false,
      cacheControl: "86400",
    });

    if (error) {
      console.error("[studio/upload-asset]", error);
      return NextResponse.json(
        { error: "Le fichier n'a pas pu être enregistré." },
        { status: 500 },
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
      return NextResponse.json(
        { error: "L'URL publique n'a pas pu être créée." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: data.publicUrl,
      path,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("[studio/upload-asset]", error);
    return NextResponse.json(
      { error: "Erreur serveur pendant l'envoi du fichier." },
      { status: 500 },
    );
  }
}
