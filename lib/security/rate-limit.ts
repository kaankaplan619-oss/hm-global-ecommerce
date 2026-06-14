import { NextRequest, NextResponse } from "next/server";

/**
 * Rate-limiter best-effort EN MÉMOIRE (par instance serveur).
 *
 * ⚠️ Limite : sur Vercel/serverless, le compteur n'est PAS partagé entre
 * instances et se réinitialise à chaque cold start. Ça élève fortement la barre
 * contre les scripts d'abus naïfs (spam, brute-force, email-bombing) sans aucune
 * dépendance, mais ce n'est PAS un quota global fiable.
 *
 * Pour un rate-limit durable et distribué (prod à volume), brancher
 * @upstash/ratelimit (Redis) ou le Vercel Firewall et remplacer l'implémentation
 * ici sans changer les appels.
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

// Purge paresseuse pour éviter une croissance non bornée de la Map.
function sweep(now: number): void {
  if (store.size < 10_000) return;
  for (const [key, b] of store) {
    if (b.resetAt < now) store.delete(key);
  }
}

/** Meilleure estimation de l'IP cliente derrière le proxy Vercel. */
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

type RateLimitOptions = {
  /** Identifiant logique de la limite (ex. "contact", "login"). */
  key: string;
  /** Nombre de requêtes autorisées dans la fenêtre. */
  limit: number;
  /** Taille de la fenêtre en millisecondes. */
  windowMs: number;
};

/**
 * Vérifie la limite pour (key + IP). Renvoie `null` si autorisé, sinon une
 * réponse 429 prête à retourner (avec en-tête Retry-After).
 */
export function rateLimit(req: NextRequest, opts: RateLimitOptions): NextResponse | null {
  const now = Date.now();
  sweep(now);

  const id = `${opts.key}:${clientIp(req)}`;
  const bucket = store.get(id);

  if (!bucket || bucket.resetAt < now) {
    store.set(id, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  if (bucket.count >= opts.limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans un instant." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  bucket.count += 1;
  return null;
}

/** Variante booléenne : `true` si la requête est dans la limite, `false` si dépassée. */
export function withinRateLimit(req: NextRequest, opts: RateLimitOptions): boolean {
  return rateLimit(req, opts) === null;
}
