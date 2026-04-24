import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) return "/mon-compte";
  return value;
}

/**
 * GET /auth/callback
 *
 * Handles two Supabase auth flows:
 *   1. PKCE  (newer) — token arrives as ?code=XXX in query params (server-readable)
 *   2. Implicit (older) — tokens arrive in URL #hash (only browser-readable)
 *
 * For recovery, we ALWAYS redirect to /reinitialiser-mot-de-passe regardless of flow.
 * The reset page itself validates the session client-side (handles both flows).
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const origin = requestUrl.origin;

  // ── Recovery flow — always land on the reset password page ───────────────
  // Whether PKCE (code present) or implicit (no code, tokens in hash), the
  // /reinitialiser-mot-de-passe page handles session detection client-side.
  if (type === "recovery") {
    if (code) {
      // PKCE: exchange code for session so the cookie is set before redirect
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[Auth Callback] Recovery exchange failed:", error.message);
        // Still redirect to reset page — it will show an "expired link" message
      }
    }
    // Implicit flow OR successful PKCE: go to the reset page either way
    return NextResponse.redirect(new URL("/reinitialiser-mot-de-passe", origin));
  }

  // ── Implicit flow (no code, hash-based) — return a client-side redirect ──
  // The browser will read the hash tokens and Supabase JS SDK fires the event.
  // We redirect to /auth/session-bridge which handles the client-side detection.
  if (!code) {
    // If next contains a reset path, send there; otherwise connexion error
    if (next.includes("reinitialiser")) {
      return NextResponse.redirect(new URL("/reinitialiser-mot-de-passe", origin));
    }
    return NextResponse.redirect(new URL("/connexion?error=auth_callback", origin));
  }

  // ── PKCE flow — exchange code for session ─────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback]", error);
    return NextResponse.redirect(new URL("/connexion?error=auth_callback", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
