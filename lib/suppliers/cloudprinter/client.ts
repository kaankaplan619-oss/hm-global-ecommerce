/**
 * lib/suppliers/cloudprinter/client.ts
 *
 * Client Cloudprinter (cloudcore 1.0) — SERVER ONLY.
 *
 * ⚠️  Ne jamais importer depuis un Client Component ou un fichier "use client".
 *     Toutes les fonctions lisent `process.env.CLOUDPRINTER_API_KEY` et
 *     n'exposent jamais cette valeur.
 *
 * Convention Cloudprinter :
 *   - Toutes les requêtes sont POST
 *   - Auth : `apikey` dans le body JSON (pas de header Authorization)
 *   - Content-Type: application/json
 *   - Base URL : https://api.cloudprinter.com/cloudcore/1.0/
 *
 * Source : https://docs.cloudprinter.com/
 */

import { CloudprinterError } from "./types";

// ─── Configuration ───────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = "https://api.cloudprinter.com/cloudcore/1.0";

/**
 * URL de base de l'API Cloudprinter — depuis env ou fallback officiel.
 * Trailing slash retiré pour permettre la concaténation propre.
 */
function getBaseUrl(): string {
  const fromEnv = process.env.CLOUDPRINTER_API_BASE;
  const raw = (fromEnv && fromEnv.trim().length > 0 ? fromEnv : DEFAULT_BASE_URL).trim();
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

/**
 * Lit la clé API depuis l'environnement. Retourne `null` si absente.
 * Ne jamais logguer la valeur retournée.
 */
function getApiKey(): string | null {
  const key = process.env.CLOUDPRINTER_API_KEY;
  if (!key || key.trim().length === 0) return null;
  return key.trim();
}

/**
 * `true` si la clé API Cloudprinter est présente dans l'env.
 * Utilisée par les routes pour décider d'un fallback documentaire.
 */
export function isCloudprinterConfigured(): boolean {
  return getApiKey() !== null;
}

// ─── Helper bas niveau ───────────────────────────────────────────────────────

interface CpFetchOptions {
  /** Timeout en ms, 30000 par défaut */
  timeoutMs?: number;
}

/**
 * Helper bas-niveau : POST vers Cloudprinter avec auth automatique.
 *
 * - Injecte `{ apikey, ...payload }` dans le body
 * - Force Content-Type: application/json
 * - Gère timeout via AbortController
 * - Retourne la réponse JSON désérialisée
 * - Lance une `CloudprinterError` typée en cas d'échec
 *
 * @param endpoint Chemin relatif (ex: "/products", "/products/info") ou
 *                 chemin complet — la concaténation gère les deux cas.
 * @param payload  Body JSON (sans `apikey`). Optionnel.
 */
export async function cpFetch<T = unknown>(
  endpoint: string,
  payload: Record<string, unknown> = {},
  options: CpFetchOptions = {},
): Promise<T> {
  const apikey = getApiKey();
  if (!apikey) {
    throw new CloudprinterError(
      "CLOUDPRINTER_API_KEY absent — ajouter la clé dans .env.local",
      0,
      endpoint,
    );
  }

  const baseUrl = getBaseUrl();
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const timeoutMs = options.timeoutMs ?? 30_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // ⚠️ La clé API vit DANS le body JSON, pas dans les headers (spec Cloudprinter)
      body: JSON.stringify({ apikey, ...payload }),
      signal: controller.signal,
      // Pas de cache Next.js — données live, lecture en route handler dynamique
      cache: "no-store",
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err instanceof Error ? err.message : "Erreur réseau Cloudprinter";
    throw new CloudprinterError(`Réseau Cloudprinter : ${msg}`, 0, endpoint);
  } finally {
    clearTimeout(timeoutId);
  }

  let body: unknown = null;
  const contentType = response.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      body = await response.json();
    } else {
      // Cloudprinter peut retourner du texte d'erreur HTML/plain en cas de 4xx/5xx
      const text = await response.text();
      body = text.length > 0 ? { _raw: text.slice(0, 500) } : null;
    }
  } catch {
    body = null;
  }

  if (!response.ok) {
    // On NE met JAMAIS l'apikey dans le message d'erreur.
    // Cloudprinter peut retourner plusieurs formats :
    //   - { error: "string" }
    //   - { error: { code, message, field } }
    //   - { errors: [{ code, message, field }, ...] }
    //   - { result: { error: {...} } }
    //   - { _raw: "<text/html>..." } (fallback non-JSON)
    const errMessage = extractCloudprinterError(body, response.status, endpoint);
    throw new CloudprinterError(errMessage, response.status, endpoint, body);
  }

  return body as T;
}

// ─── Extraction d'erreur structurée Cloudprinter ─────────────────────────────

/**
 * Détails d'erreur structurés extraits d'une réponse non-2xx Cloudprinter.
 * Exposés via `CloudprinterError.details` (champ optionnel) pour permettre
 * aux callers de logger/afficher proprement le code et le champ fautif.
 */
export interface CloudprinterErrorDetails {
  code?: string | number;
  message?: string;
  field?: string;
  /** Tableau d'erreurs si Cloudprinter en renvoie plusieurs */
  errors?: Array<{ code?: string | number; message?: string; field?: string }>;
}

/**
 * Construit un message d'erreur lisible à partir du body de réponse.
 * Gère les différents formats observés Cloudprinter :
 *   { error: "..." }
 *   { error: { code, message, field } }
 *   { errors: [{code, message, field}, ...] }
 *   { result: { error: ... } }
 *   { _raw: "..." } (fallback texte)
 *
 * Ne JAMAIS retourner / exposer un champ `apikey` même s'il était echo'é
 * (defense in depth — Cloudprinter ne devrait jamais le faire mais on
 * sécurise quand même).
 */
function extractCloudprinterError(body: unknown, status: number, endpoint: string): string {
  const fallback = `Cloudprinter ${endpoint} → HTTP ${status}`;
  if (body === null || body === undefined) return fallback;

  if (typeof body === "string") {
    const safe = body.replace(/apikey[^&"\s]*/gi, "***");
    return safe.slice(0, 300) || fallback;
  }

  if (typeof body !== "object") return fallback;

  const obj = body as Record<string, unknown>;

  // 1. { error: "string" }
  if (typeof obj.error === "string") {
    return `${fallback} — ${obj.error.slice(0, 300)}`;
  }

  // 2. { error: { code, message, field } }
  if (obj.error && typeof obj.error === "object") {
    const err = obj.error as Record<string, unknown>;
    const parts: string[] = [];
    if (err.code !== undefined) parts.push(`code=${String(err.code)}`);
    if (typeof err.message === "string") parts.push(`msg="${err.message.slice(0, 200)}"`);
    if (typeof err.field === "string") parts.push(`field=${err.field}`);
    if (parts.length > 0) return `${fallback} — ${parts.join(" ")}`;
  }

  // 3. { errors: [{code, message, field}, ...] }
  if (Array.isArray(obj.errors)) {
    const first = obj.errors.find((e) => e && typeof e === "object") as
      | Record<string, unknown>
      | undefined;
    if (first) {
      const parts: string[] = [];
      if (first.code !== undefined) parts.push(`code=${String(first.code)}`);
      if (typeof first.message === "string") parts.push(`msg="${first.message.slice(0, 200)}"`);
      if (typeof first.field === "string") parts.push(`field=${first.field}`);
      if (parts.length > 0) {
        const more = obj.errors.length > 1 ? ` (+${obj.errors.length - 1} autres)` : "";
        return `${fallback} — ${parts.join(" ")}${more}`;
      }
    }
  }

  // 4. { result: { error: ... } }
  if (obj.result && typeof obj.result === "object") {
    const nested = (obj.result as Record<string, unknown>).error;
    if (nested) {
      return extractCloudprinterError({ error: nested }, status, endpoint);
    }
  }

  // 5. { _raw: "..." } — body non-JSON capturé en texte
  if (typeof obj._raw === "string") {
    return `${fallback} — ${String(obj._raw).slice(0, 200)}`;
  }

  // 6. Fallback : sérialiser les premiers champs intéressants
  const keys = Object.keys(obj).filter((k) => k !== "apikey").slice(0, 4);
  if (keys.length > 0) {
    const preview = keys.map((k) => `${k}=${safePreviewValue(obj[k])}`).join(" ");
    return `${fallback} — ${preview}`;
  }

  return fallback;
}

function safePreviewValue(v: unknown): string {
  if (v === null || v === undefined) return String(v);
  if (typeof v === "string") return `"${v.slice(0, 80)}"`;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v).slice(0, 120);
  } catch {
    return "[unserializable]";
  }
}

// ─── Re-exports utiles ───────────────────────────────────────────────────────

export { CloudprinterError } from "./types";
