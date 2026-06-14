import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/supabase";
import type { User } from "@/types";

/**
 * GET /api/auth/me
 * Renvoie l'utilisateur courant à partir de la session cookie (@supabase/ssr).
 * Sert à hydrater le store client après une connexion OAuth (Google), où le
 * cookie de session est posé côté serveur sans passer par /api/auth/login.
 * 401 si aucune session.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    let profile = profileData as ProfileRow | null;

    // Premier login OAuth : le trigger DB peut ne pas avoir créé le profil, ou
    // l'avoir créé sans nom (Google renvoie given_name/family_name/full_name).
    if (!profile) {
      const meta = authUser.user_metadata ?? {};
      const fullName: string = meta.full_name ?? meta.name ?? "";
      const firstName = meta.first_name ?? meta.given_name ?? fullName.split(" ")[0] ?? "";
      const lastName = meta.last_name ?? meta.family_name ?? fullName.split(" ").slice(1).join(" ");

      const { data: created } = await supabase
        .from("profiles")
        .insert({
          id: authUser.id,
          email: authUser.email,
          first_name: firstName,
          last_name: lastName,
          phone: meta.phone ?? null,
          role: "client",
          type: meta.type ?? "particulier",
          company: meta.company ?? null,
          siret: meta.siret ?? null,
          tva_intracom: meta.tva_intracom ?? null,
        })
        .select("*")
        .single();

      profile = created as ProfileRow | null;
    }

    if (!profile) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user: User = {
      id: profile.id,
      email: authUser.email!,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone ?? "",
      role: profile.role,
      type: profile.type,
      company: profile.company ?? undefined,
      siret: profile.siret ?? undefined,
      tvaIntracom: profile.tva_intracom ?? undefined,
      addresses: [],
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[Auth Me]", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
