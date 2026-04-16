import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton browser Supabase client.
 * Safe to call in Client Components ('use client').
 * Creates only one instance per browser session.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createBrowserClient<any>> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client = createBrowserClient<any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
