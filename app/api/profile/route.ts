import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/supabase";
import type { User } from "@/types";

// ─── Allowed PATCH fields ─────────────────────────────────────────────────────
// role, id, created_at, updated_at are never writable via this route.
const ALLOWED_UPDATE_FIELDS = [
  "first_name",
  "last_name",
  "phone",
  "company",
  "siret",
  "tva_intracom",
] as const;

type AllowedField = (typeof ALLOWED_UPDATE_FIELDS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps a profiles DB row to the frontend User type. */
function profileToUser(profile: ProfileRow, email: string): User {
  return {
    id:          profile.id,
    email,
    firstName:   profile.first_name,
    lastName:    profile.last_name,
    phone:       profile.phone ?? "",
    role:        profile.role,
    type:        profile.type,
    company:     profile.company   ?? undefined,
    siret:       profile.siret     ?? undefined,
    tvaIntracom: profile.tva_intracom ?? undefined,
    addresses:   [],
    createdAt:   profile.created_at,
    updatedAt:   profile.updated_at,
  };
}

// ─── GET /api/profile ─────────────────────────────────────────────────────────

/**
 * Returns the fresh profile for the current authenticated user.
 * Use on page mount to hydrate the Zustand store with up-to-date data.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    const profile = data as ProfileRow | null;

    if (error || !profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    return NextResponse.json({ user: profileToUser(profile, authUser.email!) });
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── PATCH /api/profile ───────────────────────────────────────────────────────

/**
 * Updates allowed profile fields for the current user.
 *
 * Accepted body fields: first_name, last_name, phone, company, siret, tva_intracom.
 * The `role` field is explicitly rejected — elevation is SQL-only.
 *
 * RLS on the profiles table ensures a user can only update their own row.
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();

    // ── Reject any attempt to change role or protected fields ─────────────────
    if ("role" in body || "id" in body || "created_at" in body || "updated_at" in body) {
      return NextResponse.json(
        { error: "Modification de champ protégé interdite" },
        { status: 403 }
      );
    }

    // ── Build update payload from allowed fields only ─────────────────────────
    const update: Partial<Record<AllowedField, string | null>> = {};

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (field in body) {
        update[field] = body[field] ?? null;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Aucun champ valide à mettre à jour" }, { status: 400 });
    }

    // ── Validation ────────────────────────────────────────────────────────────

    if (update.first_name !== undefined && !update.first_name?.trim()) {
      return NextResponse.json({ error: "Le prénom ne peut pas être vide" }, { status: 400 });
    }

    if (update.last_name !== undefined && !update.last_name?.trim()) {
      return NextResponse.json({ error: "Le nom ne peut pas être vide" }, { status: 400 });
    }

    if (update.siret !== undefined && update.siret !== null) {
      const normalized = update.siret.replace(/[\s.]/g, "");
      if (!/^\d{14}$/.test(normalized)) {
        return NextResponse.json(
          { error: "SIRET invalide — 14 chiffres requis" },
          { status: 400 }
        );
      }
      update.siret = normalized;
    }

    if (update.phone !== undefined && update.phone !== null) {
      const cleanPhone = update.phone.replace(/\s/g, "");
      if (cleanPhone.length > 0 && !/^(\+?\d{7,15})$/.test(cleanPhone)) {
        return NextResponse.json({ error: "Numéro de téléphone invalide" }, { status: 400 });
      }
    }

    // ── Write to DB — RLS ensures user can only update their own row ──────────
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", authUser.id)
      .select("*")
      .single();

    if (updateError) {
      console.error("[PATCH /api/profile]", updateError);
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
    }

    const updatedProfile = data as ProfileRow | null;
    if (!updatedProfile) {
      return NextResponse.json({ error: "Profil introuvable après mise à jour" }, { status: 404 });
    }

    return NextResponse.json({ user: profileToUser(updatedProfile, authUser.email!) });
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
