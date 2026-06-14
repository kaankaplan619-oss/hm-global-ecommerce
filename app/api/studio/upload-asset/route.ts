import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rate-limit";

const BUCKET = "customer-logos";
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
// SVG volontairement EXCLU : un SVG peut embarquer du JavaScript et, servi
// depuis un bucket public en image/svg+xml, devient un vecteur de XSS stocké.
// On n'accepte que des images matricielles (non exécutables).
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
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
        { error: "Format non accepté. Utilisez PNG ou JPG." },
        { status: 415 },
      );
    }

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 80);
    const path = `studio-exports/${sessionId}/${Date.now()}-${kind}-${safeName}`;
    const supabase = await createSupabaseServiceClient();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
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
