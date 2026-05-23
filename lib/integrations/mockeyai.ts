/**
 * lib/integrations/mockeyai.ts
 *
 * Client de génération de mockups via l'API Mockey.ai.
 *
 * ⚠️ AVERTISSEMENT — CONTRAT API NON VÉRIFIÉ
 *   Les chemins d'endpoint et la forme des payloads ci-dessous sont des
 *   hypothèses raisonnables, PAS un contrat officiel vérifié. Avant activation
 *   réelle, confirmer auprès de la doc Mockey.ai :
 *     - l'URL de base (MOCKEY_API_BASE),
 *     - le chemin de rendu (POST /render),
 *     - le chemin des templates (GET /templates),
 *     - le schéma de réponse (champ contenant l'URL du mockup).
 *   Le code est conçu pour être corrigé en un seul endroit (parseRenderResponse
 *   / endpoints) sans toucher aux appelants.
 *
 * Garantie : aucune fonction ne throw. En cas d'absence de clé, d'erreur réseau
 * ou de réponse inattendue, on retombe TOUJOURS sur le mockup statique
 * (NEXT_PUBLIC_MOCKUP_FALLBACK_URL). L'UI reste fonctionnelle.
 */

import type { MockupProductCategory } from "@/data/mockup-products";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MockupTemplate {
  id: string;
  label: string;
  category: MockupProductCategory;
  /** Vignette de prévisualisation du template, si disponible. */
  thumbnailUrl?: string;
}

export interface MockupResult {
  /** URL du mockup généré (ou du fallback). */
  url: string;
  /** true si on a dû retomber sur le mockup statique. */
  isFallback: boolean;
  /** Template utilisé, si connu. */
  templateId?: string;
  /** Origine du rendu, utile pour le debug. */
  source: "mockey" | "fallback";
  /** Message d'erreur éventuel (présent uniquement si isFallback). */
  error?: string;
}

// ─── Configuration ──────────────────────────────────────────────────────────

const TIMEOUT_MS = 12_000;

function getApiKey(): string | null {
  const key = process.env.MOCKEY_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

function getApiBase(): string {
  return (process.env.MOCKEY_API_BASE?.trim() || "https://api.mockey.ai/v1").replace(/\/+$/, "");
}

/** URL du mockup de repli (statique). Exposée côté client (NEXT_PUBLIC_*). */
export function getFallbackMockupUrl(): string {
  return process.env.NEXT_PUBLIC_MOCKUP_FALLBACK_URL?.trim() || "/images/mockups/placeholder.png";
}

function fallback(error?: string, templateId?: string): MockupResult {
  return { url: getFallbackMockupUrl(), isFallback: true, source: "fallback", templateId, error };
}

/**
 * Extrait l'URL du mockup depuis une réponse Mockey.ai.
 * ⚠️ Point unique à ajuster quand le schéma réel sera confirmé.
 */
function parseRenderResponse(json: unknown): string | null {
  if (typeof json !== "object" || json === null) return null;
  const obj = json as Record<string, unknown>;
  // Hypothèses de champs courants — à confirmer.
  const candidate =
    (typeof obj.mockupUrl === "string" && obj.mockupUrl) ||
    (typeof obj.url === "string" && obj.url) ||
    (typeof obj.output === "string" && obj.output) ||
    (Array.isArray(obj.images) && typeof obj.images[0] === "string" && obj.images[0]) ||
    null;
  return candidate || null;
}

// ─── API publique ──────────────────────────────────────────────────────────────

/**
 * Génère un mockup à partir d'une URL de design et d'un template Mockey.ai.
 *
 * @param designUrl  URL publique du design/logo à appliquer.
 * @param templateId Identifiant du template Mockey.ai.
 * @returns          Résultat de mockup ; fallback statique en cas d'échec.
 */
export async function generateMockup(designUrl: string, templateId: string): Promise<MockupResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return fallback("MOCKEY_API_KEY absente", templateId);
  }
  if (!designUrl) {
    return fallback("designUrl manquant", templateId);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // ⚠️ Endpoint/payload non vérifiés — voir avertissement en tête de fichier.
    const res = await fetch(`${getApiBase()}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ templateId, designUrl }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return fallback(`HTTP ${res.status}`, templateId);
    }

    const json: unknown = await res.json().catch(() => null);
    const url = parseRenderResponse(json);
    if (!url) {
      return fallback("Réponse Mockey inattendue (URL introuvable)", templateId);
    }

    return { url, isFallback: false, source: "mockey", templateId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return fallback(message, templateId);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Templates ──────────────────────────────────────────────────────────────

/**
 * Templates statiques de repli, par catégorie.
 * Utilisés quand l'API n'est pas configurée ou indisponible.
 */
const STATIC_TEMPLATES: Record<MockupProductCategory, MockupTemplate[]> = {
  carte_visite: [{ id: "cv-flat-white", label: "Carte à plat — fond blanc", category: "carte_visite" }],
  flyer:        [{ id: "flyer-flat-white", label: "Flyer à plat — fond blanc", category: "flyer" }],
  brochure:     [{ id: "brochure-scene-desk", label: "Brochure en scène — bureau", category: "brochure" }],
  sticker:      [{ id: "sticker-flat-white", label: "Sticker à plat — fond blanc", category: "sticker" }],
  cap:          [{ id: "cap-front", label: "Casquette — face", category: "cap" }],
  beanie:       [{ id: "beanie-front", label: "Bonnet — face", category: "beanie" }],
  bag:          [{ id: "bag-tote-front", label: "Tote bag — face", category: "bag" }],
  apron:        [{ id: "apron-front", label: "Tablier — face", category: "apron" }],
  mug:          [{ id: "mug-front", label: "Mug — face", category: "mug" }],
};

/**
 * Retourne les templates de mockup disponibles pour une catégorie.
 *
 * Si l'API Mockey est configurée, tente de récupérer la liste distante ;
 * sinon (ou en cas d'erreur), retourne les templates statiques de repli.
 *
 * @param category Catégorie de produit mockup.
 * @returns        Liste de templates (jamais vide, jamais d'exception).
 */
export async function getMockupTemplates(category: MockupProductCategory): Promise<MockupTemplate[]> {
  const apiKey = getApiKey();
  const staticList = STATIC_TEMPLATES[category] ?? [];

  if (!apiKey) {
    return staticList;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // ⚠️ Endpoint non vérifié — voir avertissement en tête de fichier.
    const res = await fetch(`${getApiBase()}/templates?category=${encodeURIComponent(category)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });

    if (!res.ok) return staticList;

    const json: unknown = await res.json().catch(() => null);
    if (!Array.isArray(json)) return staticList;

    const parsed = json
      .map((t): MockupTemplate | null => {
        if (typeof t !== "object" || t === null) return null;
        const o = t as Record<string, unknown>;
        const id = typeof o.id === "string" ? o.id : null;
        if (!id) return null;
        return {
          id,
          label: typeof o.label === "string" ? o.label : id,
          category,
          thumbnailUrl: typeof o.thumbnailUrl === "string" ? o.thumbnailUrl : undefined,
        };
      })
      .filter((t): t is MockupTemplate => t !== null);

    return parsed.length > 0 ? parsed : staticList;
  } catch {
    return staticList;
  } finally {
    clearTimeout(timer);
  }
}
