import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rate-limit";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const BUCKET = "customer-logos";

// SVG exclu (XSS stocké possible si servi depuis un bucket public). PDF conservé
// (pièce jointe de devis légitime, non exécutée inline par le visualiseur).
const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];

const NEED_TYPES = [
  "tenues-entreprise",
  "restaurant-commerce",
  "evenement-association",
  "chantier-nettoyage",
  "marque-createur",
  "erasmus-ecole",
  "print-signaletique",
  "autre",
];

const QUANTITY_RANGES = ["5-10", "10-25", "25-50", "50-plus", "unknown"];
const TECHNIQUES = ["unknown", "dtf", "broderie", "flex", "print", "autre"];

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 120);
}

export async function POST(req: NextRequest) {
  // Anti-spam : soumission anonyme avec upload (insert service_role + storage).
  const limited = rateLimit(req, { key: "quote", limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;

  try {
    const formData = await req.formData();

    const companyName = asString(formData.get("companyName"));
    const email = asString(formData.get("email")).toLowerCase();
    const phone = asString(formData.get("phone"));
    const needType = asString(formData.get("needType"));
    const quantityRange = asString(formData.get("quantityRange"));
    const desiredProduct = asString(formData.get("desiredProduct"));
    const desiredTechnique = asString(formData.get("desiredTechnique"));
    const message = asString(formData.get("message"));
    const pagePath = asString(formData.get("pagePath")) || "/devis-rapide";
    const file = formData.get("file");

    if (!companyName || !email || !needType || !quantityRange || !desiredTechnique) {
      return NextResponse.json(
        { error: "Merci de remplir les champs obligatoires." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Merci d'indiquer une adresse email valide." },
        { status: 400 }
      );
    }

    if (!NEED_TYPES.includes(needType) || !QUANTITY_RANGES.includes(quantityRange) || !TECHNIQUES.includes(desiredTechnique)) {
      return NextResponse.json(
        { error: "Une option du formulaire est invalide." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServiceClient();
    let fileMeta: {
      file_name?: string;
      file_url?: string;
      file_path?: string;
      file_type?: string;
      file_size?: number;
    } = {};

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Fichier trop volumineux. Taille maximale : 10 Mo." },
          { status: 400 }
        );
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Format non supporté. Utilisez PNG, JPG, SVG ou PDF." },
          { status: 400 }
        );
      }

      const storagePath = `quote-requests/${Date.now()}-${safeFileName(file.name)}`;
      const buffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        console.error("[Quote request] upload:", uploadError);
        return NextResponse.json(
          { error: "Le fichier n'a pas pu être envoyé. Réessayez sans fichier ou contactez HM Global." },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      fileMeta = {
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_path: storagePath,
        file_type: file.type,
        file_size: file.size,
      };
    }

    const { data, error } = await supabase
      .from("quote_requests")
      .insert({
        company_name: companyName,
        email,
        phone: phone || null,
        need_type: needType,
        quantity_range: quantityRange,
        desired_product: desiredProduct || null,
        desired_technique: desiredTechnique,
        message: message || null,
        page_path: pagePath,
        user_agent: req.headers.get("user-agent"),
        ...fileMeta,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[Quote request] insert:", error);
      return NextResponse.json(
        { error: "La demande n'a pas pu être enregistrée. Merci de réessayer." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error("[Quote request]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
