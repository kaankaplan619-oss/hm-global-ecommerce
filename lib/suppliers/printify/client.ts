/**
 * lib/suppliers/printify/client.ts
 *
 * Client Printify v1 — SERVER ONLY.
 *
 * ⚠️  Ne jamais importer depuis un Client Component ou un fichier "use client".
 *     Toutes les fonctions utilisent process.env.PRINTIFY_API_TOKEN.
 *
 * Source API : https://developers.printify.com/
 *
 * Auth : Bearer token (header Authorization).
 * Base URL : https://api.printify.com/v1
 */

/*
 * ⚠️  SERVER ONLY — ne pas importer depuis un Client Component.
 *     L'absence du package "server-only" est volontaire ici pour ne pas
 *     ajouter de dépendance. La discipline d'import est garantie par les
 *     commentaires + la lecture de process.env (Node only).
 */

import {
  PrintifyError,
  type PrintifyBlueprint,
  type PrintifyBlueprintVariantsResponse,
  type PrintifyPrintProvider,
  type PrintifyShop,
  type PrintifyUploadResult,
  type PrintifyCreateOrderPayload,
  type PrintifyOrderResult,
} from "./types";

const PRINTIFY_BASE = "https://api.printify.com/v1";

// ─── Token getter (lazy, jamais en module-scope) ─────────────────────────────

function getToken(): string {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) {
    throw new PrintifyError(
      0,
      "(init)",
      "PRINTIFY_API_TOKEN manquant dans .env.local",
    );
  }
  return token;
}

/** True si la variable est présente — n'expose JAMAIS la valeur. */
export function isPrintifyConfigured(): boolean {
  return Boolean(process.env.PRINTIFY_API_TOKEN);
}

// ─── Fetch interne ───────────────────────────────────────────────────────────

interface PfRequestOptions extends RequestInit {
  /** Désactive le throw pour 404 — utile pour les audits. */
  allow404?: boolean;
}

async function pfFetch<T>(path: string, options: PfRequestOptions = {}): Promise<T> {
  const { allow404, ...init } = options;
  const url = `${PRINTIFY_BASE}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "User-Agent":  "HMGlobal/1.0 (printify-audit)",
      "Content-Type": "application/json",
      Accept:         "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (allow404 && res.status === 404) {
      return null as T;
    }
    const body = await res.text().catch(() => "");
    throw new PrintifyError(res.status, path, body || res.statusText);
  }

  return res.json() as Promise<T>;
}

// ─── Endpoints publics ──────────────────────────────────────────────────────

/** Liste les boutiques liées au compte (test de validité du token). */
export async function listShops(): Promise<PrintifyShop[]> {
  return pfFetch<PrintifyShop[]>("/shops.json");
}

/** Liste tous les blueprints (catalogue catalog-wide). */
export async function listBlueprints(): Promise<PrintifyBlueprint[]> {
  return pfFetch<PrintifyBlueprint[]>("/catalog/blueprints.json");
}

/** Récupère un blueprint par ID. */
export async function getBlueprint(blueprintId: number): Promise<PrintifyBlueprint | null> {
  return pfFetch<PrintifyBlueprint | null>(`/catalog/blueprints/${blueprintId}.json`, { allow404: true });
}

/** Liste les print providers pour un blueprint donné. */
export async function listPrintProviders(blueprintId: number): Promise<PrintifyPrintProvider[]> {
  return pfFetch<PrintifyPrintProvider[]>(`/catalog/blueprints/${blueprintId}/print_providers.json`);
}

/** Liste les variantes d'un blueprint chez un print provider donné. */
export async function listVariants(
  blueprintId: number,
  printProviderId: number,
): Promise<PrintifyBlueprintVariantsResponse> {
  return pfFetch<PrintifyBlueprintVariantsResponse>(
    `/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`,
  );
}

/**
 * Recherche basique de blueprints par mots-clés.
 * Filtre sur title/brand/model (lower-case substring match).
 */
export async function searchBlueprints(keywords: string[]): Promise<PrintifyBlueprint[]> {
  const all = await listBlueprints();
  const lows = keywords.map((k) => k.toLowerCase());

  return all.filter((bp) => {
    const haystack = [
      bp.title,
      bp.brand,
      bp.model,
      bp.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return lows.every((kw) => haystack.includes(kw));
  });
}

// ─── Boutique (shop_id) ──────────────────────────────────────────────────────

let cachedShopId: number | null = null;

/**
 * ID de la boutique Printify à utiliser pour les commandes.
 * Priorité : env PRINTIFY_SHOP_ID, sinon 1re boutique liée au compte (cachée).
 */
export async function getPrintifyShopId(): Promise<number> {
  const envId = process.env.PRINTIFY_SHOP_ID;
  if (envId && /^\d+$/.test(envId)) return Number(envId);
  if (cachedShopId) return cachedShopId;
  const shops = await listShops();
  if (!shops.length) {
    throw new PrintifyError(0, "/shops.json", "Aucune boutique Printify liée au compte");
  }
  cachedShopId = shops[0].id;
  return cachedShopId;
}

// ─── Upload image (pour les zones d'impression) ──────────────────────────────

/**
 * Upload un visuel depuis une URL publique → renvoie l'image Printify (id).
 * L'`id` retourné est ensuite référencé dans les `print_areas` de la commande.
 */
export async function uploadPrintifyImage(
  fileName: string,
  url: string,
): Promise<PrintifyUploadResult> {
  return pfFetch<PrintifyUploadResult>("/uploads/images.json", {
    method: "POST",
    body: JSON.stringify({ file_name: fileName, url }),
  });
}

// ─── Commandes (orders) ──────────────────────────────────────────────────────

/**
 * Crée une commande Printify en mode BROUILLON : l'ordre est créé dans la
 * boutique mais N'EST PAS envoyé en production (send_to_production non appelé).
 * Symétrique de createPrintfulDraft. À confirmer via
 * sendPrintifyOrderToProduction() après validation admin.
 */
export async function createPrintifyOrder(
  payload: PrintifyCreateOrderPayload,
): Promise<PrintifyOrderResult> {
  const shopId = await getPrintifyShopId();
  return pfFetch<PrintifyOrderResult>(`/shops/${shopId}/orders.json`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Envoie une commande Printify (brouillon) en PRODUCTION.
 * ⚠️ IRRÉVERSIBLE et PAYANT — n'appeler qu'après validation admin explicite.
 */
export async function sendPrintifyOrderToProduction(
  orderId: string,
): Promise<PrintifyOrderResult> {
  const shopId = await getPrintifyShopId();
  return pfFetch<PrintifyOrderResult>(
    `/shops/${shopId}/orders/${orderId}/send_to_production.json`,
    { method: "POST" },
  );
}

/** Récupère le statut live d'une commande Printify. */
export async function getPrintifyShopOrder(orderId: string): Promise<PrintifyOrderResult> {
  const shopId = await getPrintifyShopId();
  return pfFetch<PrintifyOrderResult>(`/shops/${shopId}/orders/${orderId}.json`);
}
