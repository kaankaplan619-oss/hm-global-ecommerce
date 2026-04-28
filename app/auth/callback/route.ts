import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sanitizeNextPath(value: string | null) {
    if (!value || !value.startsWith("/")) return "/mon-compte";
    return value;
}

/**
 * GET /auth/callback
 *
 * Handles Supabase auth flows:
 * 1. token_hash (email links) — verifyOtp on server, redirect to reset page
 * 2. PKCE (code) — exchange code for session
 */
export async function GET(req: NextRequest) {
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get("code");
    const tokenHash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type") as "recovery" | "signup" | "magiclink" | null;
    const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
    const origin = requestUrl.origin;

  // ── token_hash flow (email links: reset, confirm, magic link) ──────────────
  if (tokenHash && type) {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type,
        });

      if (error) {
              console.error("[Auth Callback] verifyOtp failed:", error.message);
              if (type === "recovery") {
                        return NextResponse.redirect(
                                    new URL("/reinitialiser-mot-de-passe?error=invalid_link", origin)
                                  );
              }
              return NextResponse.redirect(
                        new URL("/connexion?error=auth_callback", origin)
                      );
      }

      // Success — redirect to appropriate page
      if (type === "recovery") {
              return NextResponse.redirect(
                        new URL("/reinitialiser-mot-de-passe", origin)
                      );
      }
        return NextResponse.redirect(new URL(next, origin));
  }

  // ── PKCE flow (code in query params) ───────────────────────────────────────
  if (code) {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
              console.error("[Auth Callback] exchangeCodeForSession failed:", error.message);
              return NextResponse.redirect(
                        new URL("/connexion?error=auth_callback", origin)
                      );
      }

      return NextResponse.redirect(new URL(next, origin));
  }

  // ── Fallback ────────────────────────────────────────────────────────────────
  return NextResponse.redirect(new URL("/connexion?error=auth_callback", origin));
}
