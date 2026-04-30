import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/supabase";
import type { User } from "@/types";

/**
 * POST /api/auth/login
 * Signs in via Supabase Auth and returns the user profile.
 * Session cookies are set automatically by @supabase/ssr.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      const authMessage = authError?.message?.toLowerCase() ?? "";

      if (
        authMessage.includes("email not confirmed") ||
        authMessage.includes("email_not_confirmed")
      ) {
        return NextResponse.json(
          {
            message:
              "Votre adresse email n’a pas encore été confirmée. Vérifiez votre boîte mail avant de vous connecter.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Fetch the profile row (explicit cast to avoid supabase discriminated-union inference)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    let profile = profileData as ProfileRow | null;

    if (profileError || !profile) {
      // Trigger may have failed — create profile from user metadata as fallback
      const meta = authData.user.user_metadata ?? {};
      const { data: createdProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          first_name: meta.first_name ?? "",
          last_name: meta.last_name ?? "",
          phone: meta.phone ?? null,
          role: "client",
          type: meta.type ?? "particulier",
          company: meta.company ?? null,
          siret: meta.siret ?? null,
          tva_intracom: meta.tva_intracom ?? null,
        })
        .select("*")
        .single();

      if (insertError || !createdProfile) {
        console.error("[Login] Profile creation fallback failed:", insertError?.message);
        return NextResponse.json(
          { message: "Profil introuvable. Contactez le support." },
          { status: 500 }
        );
      }
      profile = createdProfile as ProfileRow;
    }

    // Build the User object matching our frontend type
    const user: User = {
      id: profile.id,
      email: authData.user.email!,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone ?? "",
      role: profile.role,
      type: profile.type,
      company: profile.company ?? undefined,
      siret: profile.siret ?? undefined,
      tvaIntracom: profile.tva_intracom ?? undefined,
      addresses: [], // loaded separately if needed
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[Auth Login]", err);
    return NextResponse.json({ message: "Une erreur est survenue" }, { status: 500 });
  }
}
