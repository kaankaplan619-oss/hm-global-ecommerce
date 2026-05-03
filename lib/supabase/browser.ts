import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton browser Supabase client.
 * Safe to call in Client Components ('use client').
 * Creates only one instance per browser session.
 */

/** URL du projet Supabase — fallback hardcodé si la variable d'env pointe
 *  accidentellement vers une autre URL (ex. Vercel deployment URL). */
const SUPABASE_PROJECT_URL = "https://kbeeedbfkalovtusaden.supabase.co";

function resolveSupabaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return env.includes(".supabase.co") ? env : SUPABASE_PROJECT_URL;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createBrowserClient<any>> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client = createBrowserClient<any>(
      resolveSupabaseUrl(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
