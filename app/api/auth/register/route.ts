import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rate-limit";

/**
 * POST /api/auth/register
 * Creates a Supabase Auth user. The handle_new_user trigger automatically
 * inserts the profile row using raw_user_meta_data.
 */
export async function POST(req: NextRequest) {
  // Anti-spam : création de comptes en masse.
  const limited = rateLimit(req, { key: "register", limit: 5, windowMs: 15 * 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone, type, company, siret, tvaIntracom } = body;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || req.nextUrl.origin;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { message: "Tous les champs obligatoires sont requis" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Le mot de passe doit comporter au moins 8 caractères" },
        { status: 400 }
      );
    }

    if (type === "entreprise") {
      if (!company) {
        return NextResponse.json({ message: "Nom de la société requis" }, { status: 400 });
      }
      if (!siret || !/^\d{14}$/.test(siret.replace(/[\s.]/g, ""))) {
        return NextResponse.json(
          { message: "SIRET invalide — 14 chiffres requis" },
          { status: 400 }
        );
      }
    }

    const supabase = await createSupabaseServerClient();

    // ── Create Supabase Auth user ─────────────────────────────────────────────
    // The trigger handle_new_user reads these options.data fields to populate profiles
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/mon-compte`,
        data: {
          first_name:   firstName,
          last_name:    lastName,
          phone:        phone,
          type:         type ?? "particulier",
          company:      company ?? null,
          siret:        siret ? siret.replace(/[\s.]/g, "") : null,
          tva_intracom: tvaIntracom ?? null,
        },
      },
    });

    if (authError) {
      // Supabase returns a 400 for duplicate email
      if (authError.message.includes("already registered") || authError.message.includes("User already")) {
        return NextResponse.json(
          { message: "Un compte existe déjà avec cet email" },
          { status: 409 }
        );
      }
      return NextResponse.json({ message: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ message: "Erreur lors de la création du compte" }, { status: 500 });
    }

    // Important:
    // - If email confirmation is enabled in Supabase Auth, signup should NOT
    //   auto-confirm the user and should NOT create an authenticated session.
    // - The user must confirm their email first via the Supabase email link.

    return NextResponse.json(
      {
        user: null,
        requiresEmailConfirmation: true,
        message:
          "Votre compte a été créé. Vérifiez votre boîte mail pour confirmer votre adresse email avant de vous connecter.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Auth Register]", err);
    return NextResponse.json({ message: "Une erreur est survenue" }, { status: 500 });
  }
}
