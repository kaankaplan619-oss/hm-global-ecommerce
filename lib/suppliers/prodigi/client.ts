/**
 * lib/suppliers/prodigi/client.ts
 *
 * Client Prodigi Print API v4.0 — SERVER ONLY.
 *
 * ⚠️  Ne jamais importer depuis un Client Component.
 *
 * Conventions Prodigi :
 *   - Base URL Sandbox : https://api.sandbox.prodigi.com/v4.0/
 *   - Base URL Live    : https://api.prodigi.com/v4.0/
 *   - Auth : header `X-API-Key: <token>`
 *   - Content-Type : application/json
 *   - Verbs : GET pour catalog/products, POST pour quotes/orders
 *
 * Source : https://www.prodigi.com/print-api/docs/
 */

import { ProdigiError } from "./types";

// ─── Configuration ───────────────────────────────────────────────────────────

const DEFAULT_BASE_SANDBOX = "https://api.sandbox.prodigi.com/v4.0";
const DEFAULT_BASE_LIVE = "https://api.prodigi.com/v4.0";

/**
 * URL de base — choisit sandbox par défaut.
 * Override possible via `PRODIGI_API_BASE` (URL complète) ou
 * `PRODIGI_ENV=live` pour basculer sur la prod.
 */
function getBaseUrl(): string {
  const explicit = process.env.PRODIGI_API_BASE;
  if (explicit && explicit.trim().length > 0) {
    const u = explicit.trim();
    return u.endsWith("/") ? u.slice(0, -1) : u;
  }
  const env = (process.env.PRODIGI_ENV ?? "sandbox").toLowerCase();
  return env === "live" ? DEFAULT_BASE_LIVE : DEFAULT_BASE_SANDBOX;
}

function getApiKey(): string | null {
  const k = process.env.PRODIGI_API_KEY;
  if (!k || k.trim().length === 0) return null;
  return k.trim();
}

export function isProdigiConfigured(): boolean {
  return getApiKey() !== null;
}

// ─── Helper bas niveau ───────────────────────────────────────────────────────

interface PdFetchOptions {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  timeoutMs?: number;
}

/**
 * Helper bas-niveau : appel HTTP vers Prodigi avec auth automatique.
 *
 * - Header `X-API-Key` injecté côté serveur
 * - Header `Content-Type` JSON sur POST
 * - Gestion timeout via AbortController
 * - Erreurs typées via `ProdigiError`
 * - Le token n'est jamais inclus dans les messages d'erreur (defense in depth)
 */
export async function pdFetch<T = unknown>(
  endpoint: string,
  options: PdFetchOptions = {},
): Promise<T> {
  const apikey = getApiKey();
  if (!apikey) {
    throw new ProdigiError(
      "PRODIGI_API_KEY absent — ajouter la clé dans .env.local",
      0,
      endpoint,
    );
  }

  const baseUrl = getBaseUrl();
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? 30_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    "X-API-Key": apikey,
    Accept: "application/json",
  };
  if (method === "POST") headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: method === "POST" && options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err instanceof Error ? err.message : "Erreur réseau Prodigi";
    throw new ProdigiError(`Réseau Prodigi : ${msg}`, 0, endpoint);
  } finally {
    clearTimeout(timeoutId);
  }

  let body: unknown = null;
  const ct = response.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      body = await response.json();
    } else {
      const text = await response.text();
      body = text.length > 0 ? { _raw: text.slice(0, 500) } : null;
    }
  } catch {
    body = null;
  }

  if (!response.ok) {
    const msg = extractProdigiError(body, response.status, endpoint);
    throw new ProdigiError(msg, response.status, endpoint, body);
  }

  return body as T;
}

// ─── Extraction d'erreur structurée ──────────────────────────────────────────

function extractProdigiError(body: unknown, status: number, endpoint: string): string {
  const fallback = `Prodigi ${endpoint} → HTTP ${status}`;
  if (body === null || body === undefined) return fallback;
  if (typeof body === "string") {
    const safe = body.replace(/api[_-]?key[^&"\s]*/gi, "***");
    return safe.slice(0, 300) || fallback;
  }
  if (typeof body !== "object") return fallback;
  const obj = body as Record<string, unknown>;

  if (typeof obj.error === "string") return `${fallback} — ${obj.error.slice(0, 300)}`;
  if (obj.error && typeof obj.error === "object") {
    const err = obj.error as Record<string, unknown>;
    const parts: string[] = [];
    if (err.code !== undefined) parts.push(`code=${String(err.code)}`);
    if (typeof err.message === "string") parts.push(`msg="${err.message.slice(0, 200)}"`);
    if (parts.length > 0) return `${fallback} — ${parts.join(" ")}`;
  }
  if (typeof obj.message === "string") return `${fallback} — ${obj.message.slice(0, 300)}`;
  if (typeof (obj as { _raw?: unknown })._raw === "string") {
    return `${fallback} — ${String((obj as { _raw: string })._raw).slice(0, 200)}`;
  }
  const keys = Object.keys(obj).filter((k) => k.toLowerCase() !== "apikey").slice(0, 4);
  if (keys.length > 0) {
    return `${fallback} — ${keys.map((k) => `${k}=${JSON.stringify(obj[k]).slice(0, 80)}`).join(" ")}`;
  }
  return fallback;
}

export { ProdigiError } from "./types";
