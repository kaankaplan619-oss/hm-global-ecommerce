/**
 * lib/hermes/access.ts — Contrôle d'accès Hermès OS.
 *
 * Règle V1 : seuls les emails listés dans HERMES_OS_ALLOWED_EMAILS (CSV) ont
 * accès aux routes /hermes/*. Si la variable n'est pas configurée, l'accès est
 * refusé (fail-safe) sauf en environnement de développement local.
 *
 * Utilise la session Supabase existante (getSessionUser).
 */

import { getSessionUser } from "@/lib/supabase/server";

export interface HermesAccess {
  allowed: boolean;
  email:   string | null;
  /**
   * Raison du refus, utile pour debug côté layout :
   *   - "no_session"  : aucun utilisateur connecté
   *   - "not_listed"  : connecté mais email pas dans la whitelist
   *   - "not_configured" : la variable d'env n'est pas définie en prod
   */
  reason?: "no_session" | "not_listed" | "not_configured";
}

function parseAllowedEmails(): string[] {
  const raw = process.env.HERMES_OS_ALLOWED_EMAILS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Vérifie si l'utilisateur connecté a accès à Hermès OS.
 * À appeler depuis `app/hermes/layout.tsx` (server component).
 */
export async function checkHermesAccess(): Promise<HermesAccess> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { allowed: false, email: null, reason: "not_configured" };
  }

  const user = await getSessionUser();

  if (!user) {
    return { allowed: false, email: null, reason: "no_session" };
  }

  const email = (user.email ?? "").toLowerCase();
  const allowedList = parseAllowedEmails();

  // Dev local : si la variable n'est pas configurée et qu'on est en NODE_ENV
  // development, on laisse passer toute session valide. En prod, on refuse.
  if (allowedList.length === 0) {
    if (process.env.NODE_ENV === "development") {
      return { allowed: true, email };
    }
    return { allowed: false, email, reason: "not_configured" };
  }

  if (allowedList.includes(email)) {
    return { allowed: true, email };
  }

  return { allowed: false, email, reason: "not_listed" };
}
