import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Carnet d'adresses persistant (table public.addresses, déjà créée en 001 + RLS 002).
// Le compte HM Global gère exactement 2 adresses par utilisateur : une de
// facturation, une de livraison → POST = upsert par `type` (1 ligne par type).

type AddressType = "facturation" | "livraison";

type AddressDTO = {
  type: AddressType;
  firstName: string;
  lastName: string;
  company: string;
  street: string;
  complement: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
};

type AddressRow = {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  company: string | null;
  street: string;
  complement: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
};

function rowToDTO(row: AddressRow): AddressDTO {
  return {
    type:       (row.type === "livraison" ? "livraison" : "facturation"),
    firstName:  row.first_name,
    lastName:   row.last_name,
    company:    row.company ?? "",
    street:     row.street,
    complement: row.complement ?? "",
    postalCode: row.postal_code,
    city:       row.city,
    country:    row.country,
    phone:      row.phone ?? "",
  };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// ─── GET /api/addresses ───────────────────────────────────────────────────────
// Retourne les adresses de l'utilisateur courant (RLS = uniquement les siennes).

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/addresses]", error);
      return NextResponse.json({ error: "Lecture échouée" }, { status: 500 });
    }

    const rows = (data ?? []) as AddressRow[];
    return NextResponse.json({ addresses: rows.map(rowToDTO) });
  } catch (err) {
    console.error("[GET /api/addresses]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── POST /api/addresses ──────────────────────────────────────────────────────
// Upsert d'UNE adresse par type. Si une adresse du même type existe déjà pour
// l'utilisateur → on la met à jour ; sinon on l'insère. RLS empêche d'écrire
// pour un autre utilisateur.

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const type: AddressType = body?.type === "livraison" ? "livraison" : "facturation";

    const payload = {
      first_name:  str(body?.firstName),
      last_name:   str(body?.lastName),
      company:     str(body?.company)    || null,
      street:      str(body?.street),
      complement:  str(body?.complement) || null,
      city:        str(body?.city),
      postal_code: str(body?.postalCode),
      country:     str(body?.country)    || "France",
      phone:       str(body?.phone)      || null,
    };

    // Champs NOT NULL en base → on les exige côté API aussi.
    if (!payload.first_name || !payload.last_name || !payload.street || !payload.city || !payload.postal_code) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (prénom, nom, rue, ville, code postal)" },
        { status: 400 }
      );
    }

    // Adresse existante de ce type ?
    const { data: existing } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", authUser.id)
      .eq("type", type)
      .limit(1)
      .maybeSingle();

    let saved: AddressRow | null = null;

    if (existing) {
      const { data, error } = await supabase
        .from("addresses")
        .update(payload)
        .eq("id", (existing as { id: string }).id)
        .eq("user_id", authUser.id)
        .select("*")
        .single();
      if (error) {
        console.error("[POST /api/addresses] update", error);
        return NextResponse.json({ error: "Enregistrement échoué" }, { status: 500 });
      }
      saved = data as AddressRow;
    } else {
      const { data, error } = await supabase
        .from("addresses")
        .insert({ ...payload, type, user_id: authUser.id })
        .select("*")
        .single();
      if (error) {
        console.error("[POST /api/addresses] insert", error);
        return NextResponse.json({ error: "Enregistrement échoué" }, { status: 500 });
      }
      saved = data as AddressRow;
    }

    return NextResponse.json({ address: saved ? rowToDTO(saved) : null });
  } catch (err) {
    console.error("[POST /api/addresses]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
