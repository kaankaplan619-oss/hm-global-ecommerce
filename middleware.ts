import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware — runs on every matched request.
 *
 * Critical role: calls supabase.auth.getUser() on every request so that
 * @supabase/ssr can detect an expired access token and silently exchange the
 * refresh token for a fresh one, then write the updated cookies back into the
 * response.  Without this, the session dies as soon as the access token
 * expires (~1 hour) even though the refresh token is still valid.
 *
 * Note: the middleware must NOT redirect unauthenticated users here — that
 * is handled by individual page components with useAuthStore + router.push.
 * The middleware's sole job is session hydration / token refresh.
 */
export async function middleware(request: NextRequest) {
  // Start with a vanilla "pass through" response that carries the original
  // request headers so RSCs receive the right cookies.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies back onto both the request (for downstream RSCs)
          // and the response (for the browser).
          // request.cookies.set only accepts (name, value) — options live on
          // the response cookie where the browser actually reads them.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() is the trigger that refreshes an expired access token using the
  // refresh token.  The result is intentionally ignored here — we only call
  // it for its side-effect (cookie refresh).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match every route EXCEPT:
     *   - _next/static  (static assets)
     *   - _next/image   (Next.js image optimisation)
     *   - favicon.ico
     *   - common image extensions
     *
     * This ensures the middleware runs on every page and API route so the
     * session is always up-to-date.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
