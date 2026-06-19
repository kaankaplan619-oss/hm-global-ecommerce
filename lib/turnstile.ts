import type { NextRequest } from "next/server";

/**
 * Vérification serveur d'un token Cloudflare Turnstile (anti-bot).
 *
 * DORMANT par conception :
 *   - Si TURNSTILE_SECRET_KEY n'est PAS configurée → on ne vérifie rien et on
 *     renvoie { ok: true, skipped: true }. Les formulaires fonctionnent comme
 *     avant. C'est l'état tant que Kaan n'a pas posé les clés Cloudflare.
 *   - Si la clé est présente → le token est requis ET doit être validé par
 *     Cloudflare, sinon { ok: false } (le formulaire renvoie une erreur claire).
 *
 * En cas d'erreur réseau vers Cloudflare (clé présente) : fail-closed
 * (cohérent avec le durcissement sécurité du projet).
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string | null | undefined,
  req?: NextRequest,
): Promise<{ ok: boolean; skipped?: boolean }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true }; // dormant — aucune clé configurée

  if (!token) return { ok: false };

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    const ip =
      req?.headers.get("cf-connecting-ip") ??
      req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) body.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    return { ok: data.success === true };
  } catch (err) {
    console.error("[Turnstile] verify error:", err);
    return { ok: false };
  }
}
