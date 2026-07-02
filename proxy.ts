import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require authentication
const PROTECTED_ROUTES = ["/mon-compte"];
// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

/**
 * Outils internes (diagnostic fournisseurs + audits) : JAMAIS exposés en
 * production. Ils appellent des APIs fournisseur payantes, peuvent créer/supprimer
 * des produits et fuient des données de configuration/pricing. Bloqués en prod
 * de façon centralisée ici (couvre tous les handlers GET/POST/DELETE).
 */
const DEV_ONLY_API = [
  "/api/cloudprinter/test",
  "/api/cloudprinter/catalog-audit",
  "/api/cloudprinter/options-audit",
  "/api/cloudprinter/price-audit",
  "/api/cloudprinter/quote-audit",
  "/api/printify/test",
  "/api/printify/catalog-audit",
  "/api/printify/diagnose",
  "/api/printify/variant-map-test",
  "/api/printify/mockup-pilot",
  "/api/gelato/test",
  "/api/prodigi/test",
  "/api/toptex/debug-product",
  // Endpoint de diagnostic (réponse brute TopTex) — non utilisé par le front.
  "/api/toptex/raw",
];

/**
 * Next.js 16 Proxy (formerly middleware).
 * Refreshes Supabase session on every request and protects routes.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let response = NextResponse.next({ request: req });

  // ── Outils internes : 404 / redirect en production ───────────────────────
  if (process.env.NODE_ENV === "production") {
    if (DEV_ONLY_API.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return new NextResponse(null, { status: 404 });
    }
    if (pathname.startsWith("/dev/")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Guard: if Supabase env vars are not configured.
  // FAIL-CLOSED sur les zones protégées : sans Supabase on ne peut pas vérifier
  // l'auth → on refuse l'accès à /admin et /mon-compte (au lieu de laisser passer).
  // Les routes publiques continuent normalement (évite de tout casser si misconfig).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const needsAuth =
      PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) ||
      ADMIN_ROUTES.some((r) => pathname.startsWith(r));
    if (needsAuth) {
      return NextResponse.redirect(new URL("/connexion", req.url));
    }
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

  // ── Protect /mon-compte/* ────────────────────────────────────────────────
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
