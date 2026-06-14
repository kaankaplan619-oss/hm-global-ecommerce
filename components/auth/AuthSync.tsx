"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";

/**
 * AuthSync — synchronise le store auth (Zustand/localStorage) avec la session
 * Supabase (cookie).
 *
 * Nécessaire pour les connexions OAuth (Google) : le retour OAuth pose le
 * cookie de session côté serveur (route /auth/callback) mais ne peuple pas le
 * store client, que l'UI utilise pour l'état connecté. Sans ça, l'utilisateur
 * reviendrait « déconnecté » visuellement malgré une session valide.
 *
 * Sécurité/coût : ne s'exécute qu'une fois par chargement de page, et seulement
 * si aucun utilisateur n'est déjà en store. Pour un visiteur non connecté,
 * /api/auth/me renvoie 401 et rien n'est modifié. Ne déconnecte jamais.
 */
export default function AuthSync() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const didRun = useRef(false);

  useEffect(() => {
    if (!hasHydrated || user || didRun.current) return;
    didRun.current = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.user) setUser(data.user);
      } catch {
        /* non bloquant */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, user, setUser]);

  return null;
}
