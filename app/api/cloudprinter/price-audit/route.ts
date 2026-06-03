/**
 * app/api/cloudprinter/price-audit/route.ts
 *
 * Audit pricing Cloudprinter — endpoint qualification SERVER ONLY.
 *
 * Sélectionne 3 produits représentatifs (business card EU, flyer EU, poster EU)
 * et tente :
 *   1. /products/info → comprendre les options requises
 *   2. /prices/lookup → obtenir un prix France EUR à plusieurs quantités
 *
 * Aucune création de commande, aucun upload fichier, aucun /orders/add.
 *
 * Usage :
 *   curl http://localhost:3000/api/cloudprinter/price-audit
 *   curl http://localhost:3000/api/cloudprinter/price-audit | jq
 */

import { NextResponse } from "next/server";
import {
  isCloudprinterConfigured,
  listProducts,
  getProductInfo,
  lookupPrice,
} from "@/lib/suppliers/cloudprinter/adapter";
import { CloudprinterError } from "@/lib/suppliers/cloudprinter/client";
import type {
  CloudprinterProductInfo,
  CloudprinterProductListItem,
} from "@/lib/suppliers/cloudprinter/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Familles à tester ───────────────────────────────────────────────────────

interface FamilyConfig {
  family: "businessCard" | "flyer" | "poster";
  label: string;
  /** Mots-clés à inclure (au moins 1) dans `name` ou `reference` (lowercase) */
  includeAnyOf: string[];
  /** Mots-clés à EXCLURE (pour éviter formats US / déprés) */
  excludeAll: string[];
  /** Quantités à tester en lookup price */
  quantities: number[];
}

const FAMILIES: FamilyConfig[] = [
  {
    family: "businessCard",
    label: "Carte de visite (format européen 85×55 mm)",
    // S55 = standard EU 85x55mm. "int" = international.
    includeAnyOf: ["s55", "int_bc", "55x85", "85x55"],
    excludeAll: ["us_", "_us", "deprecated"],
    quantities: [100, 250, 500],
  },
  {
    family: "flyer",
    label: "Flyer A5",
    includeAnyOf: ["a5", "148x210", "210x148"],
    excludeAll: ["us_letter", "us_large", "deprecated"],
    quantities: [100, 250, 500],
  },
  {
    family: "poster",
    label: "Poster A3",
    includeAnyOf: ["a3", "297x420", "420x297"],
    excludeAll: ["us_", "deprecated"],
    quantities: [1, 10, 25],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTextHaystack(p: CloudprinterProductListItem): string {
  const parts: string[] = [];
  for (const k of ["reference", "name", "category"] as const) {
    const v = (p as Record<string, unknown>)[k];
    if (typeof v === "string") parts.push(v);
  }
  return parts.join(" ").toLowerCase();
}

function pickCandidate(
  products: CloudprinterProductListItem[],
  cfg: FamilyConfig,
  expectedCategoryKeywords: string[],
): CloudprinterProductListItem | null {
  const candidates = products.filter((p) => {
    if (p.category === "z_1_DEPRECATED") return false;
    const cat = String(p.category ?? "").toLowerCase();
    const hay = getTextHaystack(p);

    const catMatch = expectedCategoryKeywords.some((c) => cat.includes(c));
    if (!catMatch) return false;

    const includeMatch = cfg.includeAnyOf.some((k) => hay.includes(k));
    if (!includeMatch) return false;

    const excludeMatch = cfg.excludeAll.some((k) => hay.includes(k));
    if (excludeMatch) return false;

    return true;
  });

  // Préférer le plus court reference (souvent plus standard)
  candidates.sort((a, b) => a.reference.length - b.reference.length);
  return candidates[0] ?? null;
}

/**
 * Extrait un set d'options "minimal viable" depuis la réponse /products/info.
 * Pour chaque `option` type, on prend la valeur marquée `default: true` si dispo,
 * sinon la première valeur listée.
 *
 * Retour : Record<optionType, value>  prêt pour /prices/lookup
 */
function buildMinimalOptions(
  info: CloudprinterProductInfo,
): { options: Record<string, string | number>; trace: Array<{ type: string; chosen: string; reason: string }> } {
  const options: Record<string, string | number> = {};
  const trace: Array<{ type: string; chosen: string; reason: string }> = [];
  const rawOptions = info.options;
  if (!Array.isArray(rawOptions)) return { options, trace };

  for (const opt of rawOptions) {
    const type = typeof opt?.type === "string" ? opt.type : null;
    const values = Array.isArray(opt?.values) ? opt.values : [];
    if (!type || values.length === 0) continue;

    // Préférer la valeur "default: true"
    const defaultVal = values.find((v) => v && v.default === true);
    if (defaultVal && typeof defaultVal.value === "string") {
      options[type] = defaultVal.value;
      trace.push({ type, chosen: defaultVal.value, reason: "default=true" });
      continue;
    }

    // Sinon, première valeur
    const first = values.find((v) => v && typeof v.value === "string");
    if (first && typeof first.value === "string") {
      options[type] = first.value;
      trace.push({ type, chosen: first.value, reason: "first available" });
    }
  }

  return { options, trace };
}

interface PriceAttempt {
  count: number;
  options: Record<string, string | number>;
  ok: boolean;
  price?: number | string;
  vat?: number | string;
  currency?: string;
  raw?: unknown;
  error?: string;
  errorEndpoint?: string;
  errorStatus?: number;
}

interface FamilyResult {
  family: FamilyConfig["family"];
  label: string;
  candidate?: {
    reference: string;
    name?: string;
    category?: string;
  };
  info?: {
    optionsCount: number;
    sizesCount: number;
    sampleOptions: Array<{ type?: string; name?: string; valuesCount: number; sampleValues: string[] }>;
  };
  chosenOptions?: Record<string, string | number>;
  optionsTrace?: Array<{ type: string; chosen: string; reason: string }>;
  priceAttempts?: PriceAttempt[];
  note?: string;
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function GET() {
  if (!isCloudprinterConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        tokenPresent: false,
        reason: "CLOUDPRINTER_API_KEY absent du .env.local",
      },
      { status: 200 },
    );
  }

  let allProducts: CloudprinterProductListItem[] = [];
  try {
    allProducts = await listProducts();
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        tokenPresent: true,
        error: err instanceof Error ? err.message : "Erreur listProducts",
        endpoint: err instanceof CloudprinterError ? err.endpoint : "/products",
      },
      { status: 502 },
    );
  }

  const results: FamilyResult[] = [];

  for (const cfg of FAMILIES) {
    const result: FamilyResult = { family: cfg.family, label: cfg.label };

    // Catégories Cloudprinter attendues par famille (lowercase substring)
    const expectedCats: Record<typeof cfg.family, string[]> = {
      businessCard: ["business card", "card"],
      flyer: ["flyer"],
      poster: ["poster"],
    };

    const candidate = pickCandidate(allProducts, cfg, expectedCats[cfg.family]);
    if (!candidate) {
      result.note = `Aucun candidat trouvé (keywords=${cfg.includeAnyOf.join("/")}, excludes=${cfg.excludeAll.join("/")})`;
      results.push(result);
      continue;
    }

    result.candidate = {
      reference: candidate.reference,
      name: candidate.name,
      category: candidate.category,
    };

    // /products/info
    let info: CloudprinterProductInfo;
    try {
      info = await getProductInfo(candidate.reference);
    } catch (err) {
      result.note = `getProductInfo a échoué : ${
        err instanceof Error ? err.message.slice(0, 200) : "erreur inconnue"
      }`;
      results.push(result);
      continue;
    }

    const optionsArr = Array.isArray(info.options) ? info.options : [];
    const sizesArr = Array.isArray(info.sizes) ? info.sizes : [];
    result.info = {
      optionsCount: optionsArr.length,
      sizesCount: sizesArr.length,
      sampleOptions: optionsArr.slice(0, 6).map((o) => ({
        type: o.type,
        name: o.name,
        valuesCount: Array.isArray(o.values) ? o.values.length : 0,
        sampleValues: Array.isArray(o.values)
          ? o.values.slice(0, 4).map((v) => String(v?.value ?? "")).filter(Boolean)
          : [],
      })),
    };

    const { options: minimal, trace } = buildMinimalOptions(info);
    result.chosenOptions = minimal;
    result.optionsTrace = trace;

    // /prices/lookup pour chaque quantité
    const attempts: PriceAttempt[] = [];
    for (const count of cfg.quantities) {
      try {
        // Note : depuis l'étape 5, le bon format options est un tableau
        // `[{type, reference}]`. Cette route plus ancienne utilisait un
        // objet — on neutralise donc en ne passant pas d'options (Cloudprinter
        // applique alors ses défauts internes).
        const payload = {
          reference: candidate.reference,
          country: "FR",
          currency: "EUR",
          count,
        };
        const priced = await lookupPrice(payload);
        attempts.push({
          count,
          options: minimal,
          ok: true,
          price: priced.price,
          vat: priced.vat,
          currency: priced.currency,
          raw: priced,
        });
      } catch (err) {
        if (err instanceof CloudprinterError) {
          attempts.push({
            count,
            options: minimal,
            ok: false,
            error: err.message,
            errorEndpoint: err.endpoint,
            errorStatus: err.status,
            raw: err.body,
          });
        } else {
          attempts.push({
            count,
            options: minimal,
            ok: false,
            error: err instanceof Error ? err.message : "erreur inconnue",
          });
        }
      }
    }

    result.priceAttempts = attempts;
    results.push(result);
  }

  // Synthèse
  const okCount = results.filter((r) => r.priceAttempts?.some((a) => a.ok)).length;

  return NextResponse.json(
    {
      ok: true,
      tokenPresent: true,
      totalProductsScanned: allProducts.length,
      familiesTested: FAMILIES.length,
      familiesWithAtLeastOnePrice: okCount,
      results,
      methodology: {
        country: "FR",
        currency: "EUR",
        optionStrategy: "default=true value if available, else first listed value",
      },
    },
    { status: 200 },
  );
}
