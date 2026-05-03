import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require authentication
const PROTECTED_ROUTES = ["/mon-compte", "/checkout"];
// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

/**
 * Next.js 16 Proxy (formerly middleware).
 * Refreshes Supabase session on every request and protects routes.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let response = NextResponse.next({ request: req });

  // Guard: if Supabase env vars are not configured, skip auth entirely
  // (avoids "TypeError: Invalid URL" crashing every request in environments
  //  where NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always use getUser() to refresh the token — not getSession()
  const { data: { user } } = await supabase.auth.getUser();

  // ── Protect /mon-compte/* and /checkout ──────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !user) {
    const loginUrl = new URL("/connexion", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Protect /admin/* ─────────────────────────────────────────────────────
  const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (isAdmin) {
    if (!user) {
      return NextResponse.redirect(new URL("/connexion", req.url));
    }
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const profile = data as { role: string } | null;
    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/stripe/webhook|api/printful/webhook|images/).*)",
  ],
};
