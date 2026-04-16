import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ProfileRow } from "@/types/supabase";

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Note: we don't pass the Database generic here — use explicit type assertions
 * in route files (e.g. `data as ProfileRow | null`) to avoid supabase-js
 * internal never-inference on custom Database generics.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookies are read-only.
            // Middleware handles session refresh in that case.
          }
        },
      },
    }
  );
}

/**
 * Supabase admin client using the service role key.
 * Bypasses RLS — use ONLY in server-side contexts (webhooks, admin API routes).
 * Never expose the service role key to the browser.
 */
export async function createSupabaseServiceClient() {
  const cookieStore = await cookies();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Service client doesn't manage user sessions
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Returns the currently authenticated Supabase Auth user, or null.
 */
export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Returns the profile row for the current user, or null.
 */
export async function getSessionProfile(): Promise<ProfileRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as ProfileRow | null);
}
