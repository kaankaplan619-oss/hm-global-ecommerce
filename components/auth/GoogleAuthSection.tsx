"use client";

import GoogleSignInButton from "./GoogleSignInButton";

/**
 * GoogleAuthSection — bloc « Continuer avec Google » + séparateur « ou ».
 *
 * Gated derrière `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` : tant que la variable n'est
 * pas `"true"`, le bloc ne s'affiche pas du tout (aucun bouton cliquable qui
 * bouncerait vers une erreur tant que le provider Google n'est pas configuré
 * côté Supabase). Pour ACTIVER, une fois Google branché dans Supabase
 * (Client ID/Secret + redirect URLs) :
 *   - local  : NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true dans .env.local
 *   - prod   : même variable dans les env Vercel
 */
const GOOGLE_AUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export default function GoogleAuthSection({ next = "/mon-compte" }: { next?: string }) {
  if (!GOOGLE_AUTH_ENABLED) return null;

  return (
    <>
      <GoogleSignInButton next={next} />
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--hm-line)]" />
        <span className="text-[11px] text-[var(--hm-text-muted)]">ou avec votre email</span>
        <span className="h-px flex-1 bg-[var(--hm-line)]" />
      </div>
    </>
  );
}
