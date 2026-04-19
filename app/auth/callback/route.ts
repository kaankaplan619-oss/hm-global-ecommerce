import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) return "/mon-compte";
  return value;
}

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/connexion?error=auth_callback", requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback]", error);
    return NextResponse.redirect(new URL("/connexion?error=auth_callback", requestUrl.origin));
  }

  const target = type === "recovery" ? "/reinitialiser-mot-de-passe" : next;
  return NextResponse.redirect(new URL(target, requestUrl.origin));
}
