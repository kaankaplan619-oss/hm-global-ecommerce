/**
 * lib/suppliers/printify/adapter.ts
 *
 * Adapter Printify → format pivot HM (NormalizedProduct).
 *
 * STATUT : STUB — ne pas appeler en production tant que la validation manuelle
 * du catalogue Printify n'est pas faite (voir rapport "Catalogue POD API-first").
 *
 * Rôle futur :
 *   - Transformer un PrintifyBlueprint + ses variantes en NormalizedProduct
 *   - Mapper les couleurs Printify (ex "True Royal") → IDs HM (ex "true-royal")
 *   - Filtrer les print providers selon localisation EU (préférence Pays-Bas/UK)
 *   - Préparer les fichiers media (catalogue images, mockups par variant)
 *
 * À cette étape (audit token), on n'utilise PAS encore cet adapter.
 * Il existe pour fixer la cible et éviter de bricoler ailleurs.
 */

import type {
  PrintifyBlueprint,
  PrintifyPrintProvider,
  PrintifyVariant,
} from "./types";

// ─── Format pivot HM (placeholder — sera centralisé plus tard) ───────────────
// Note : pour ne pas créer encore lib/suppliers/types.ts (format pivot global),
// on garde ici un type local qu'on consolidera quand un 2e adapter (Prodigi)
// arrivera. Évite le over-engineering tant qu'une seule source POD existe.

export interface NormalizedPrintifyProduct {
  source:           "printify";
  blueprintId:      number;
  title:            string;
  brand:            string;
  model:            string;
  description:      string;
  catalogImages:    string[];
  selectedProvider: {
    id:       number;
    title:    string;
    country?: string;
  } | null;
  variants: NormalizedPrintifyVariant[];
}

export interface NormalizedPrintifyVariant {
  variantId:  number;
  colorLabel: string | undefined;
  size:       string | undefined;
  /** Placeholders d'impression disponibles : front, back, sleeve_left, ... */
  placements: string[];
}

// ─── Fonctions stub (non encore utilisées en prod) ───────────────────────────

/**
 * Choisit le meilleur print provider parmi une liste — préférence EU.
 * Renvoie null si aucun provider trouvé.
 */
export function selectBestProvider(
  providers: PrintifyPrintProvider[],
): PrintifyPrintProvider | null {
  if (providers.length === 0) return null;

  const EU_COUNTRIES = ["NL", "DE", "ES", "GB", "PL", "CZ", "IT", "FR", "BE"];

  const euProvider = providers.find((p) =>
    p.location?.country && EU_COUNTRIES.includes(p.location.country),
  );

  return euProvider ?? providers[0];
}

/**
 * Transforme un blueprint + variants Printify en NormalizedPrintifyProduct.
 * Stub minimal — pas encore branché à l'UI.
 */
export function buildNormalizedPrintifyProduct(input: {
  blueprint: PrintifyBlueprint;
  selectedProvider: PrintifyPrintProvider | null;
  variants: PrintifyVariant[];
}): NormalizedPrintifyProduct {
  return {
    source:        "printify",
    blueprintId:   input.blueprint.id,
    title:         input.blueprint.title,
    brand:         input.blueprint.brand,
    model:         input.blueprint.model,
    description:   input.blueprint.description,
    catalogImages: input.blueprint.images ?? [],
    selectedProvider: input.selectedProvider
      ? {
          id:      input.selectedProvider.id,
          title:   input.selectedProvider.title,
          country: input.selectedProvider.location?.country,
        }
      : null,
    variants: input.variants.map((v) => ({
      variantId:  v.id,
      colorLabel: v.options?.color,
      size:       v.options?.size,
      placements: (v.placeholders ?? []).map((p) => p.position),
    })),
  };
}
