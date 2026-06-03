/**
 * GET /api/printify/catalog-audit
 *
 * Route serveur — audit catalogue Printify pour les produits cibles HM.
 *
 * Cherche dans le catalogue Printify (blueprints) les produits suivants :
 *   - Bella+Canvas 3001
 *   - Gildan Heavy Cotton 5000
 *   - Gildan 18000
 *   - Gildan 18500
 *   - Cotton Heritage M2480
 *   - Cotton Heritage hoodie premium (équivalent)
 *
 * Pour chaque match, retourne :
 *   - blueprint_id, title, brand, model
 *   - print providers disponibles (avec localisation)
 *   - 1 variante exemple + total nombre de variantes
 *   - URLs images catalogue (1-3 premières)
 *
 * Lecture seule. Aucun import dans le catalogue HM, aucune commande.
 *
 * Usage local :
 *   curl 'http://localhost:3000/api/printify/catalog-audit'
 *   curl 'http://localhost:3000/api/printify/catalog-audit?withVariants=1'
 */

import { NextRequest, NextResponse } from "next/server";
import {
  isPrintifyConfigured,
  searchBlueprints,
  listPrintProviders,
  listVariants,
} from "@/lib/suppliers/printify/client";
import {
  PrintifyError,
  type PrintifyBlueprint,
} from "@/lib/suppliers/printify/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Cibles HM ───────────────────────────────────────────────────────────────

interface Target {
  hmKey:    string;        // identifiant lisible pour la sortie
  keywords: string[];      // mots-clés AND pour matcher le blueprint
}

const TARGETS: Target[] = [
  { hmKey: "bella-3001",            keywords: ["bella", "3001"] },
  { hmKey: "gildan-5000",           keywords: ["gildan", "5000"] },
  { hmKey: "gildan-18000",          keywords: ["gildan", "18000"] },
  { hmKey: "gildan-18500",          keywords: ["gildan", "18500"] },
  { hmKey: "cotton-heritage-m2480", keywords: ["cotton heritage", "m2480"] },
  { hmKey: "cotton-heritage-hoodie", keywords: ["cotton heritage", "hoodie"] },
];

// ─── Résultat par cible ──────────────────────────────────────────────────────

interface BlueprintSummary {
  blueprint_id: number;
  title:        string;
  brand:        string;
  model:        string;
  description_short: string;
  catalog_images_sample: string[];
  print_providers: {
    id:      number;
    title:   string;
    country?: string;
    region?: string;
  }[];
  variants_summary?: {
    total: number;
    example: {
      id:    number;
      title: string;
      color?: string;
      size?:  string;
      placements: string[];
    } | null;
    note: string;
  };
}

interface TargetResult {
  hmKey:    string;
  keywords: string[];
  matched:  BlueprintSummary[];
  /** True si au moins un blueprint a été trouvé */
  found: boolean;
}

// ─── Helper : enrichit un blueprint avec providers + 1 variant exemple ───────

async function enrichBlueprint(
  bp: PrintifyBlueprint,
  withVariants: boolean,
): Promise<BlueprintSummary> {
  let providers: BlueprintSummary["print_providers"] = [];
  let variantsSummary: BlueprintSummary["variants_summary"] = undefined;

  try {
    const pps = await listPrintProviders(bp.id);
    providers = pps.map((p) => ({
      id:      p.id,
      title:   p.title,
      country: p.location?.country,
      region:  p.location?.region,
    }));

    if (withVariants && pps.length > 0) {
      // Préférer un provider EU si dispo, sinon le premier
      const EU = ["NL", "DE", "ES", "GB", "PL", "CZ", "IT", "FR", "BE"];
      const provider = pps.find((p) => p.location?.country && EU.includes(p.location.country)) ?? pps[0];

      try {
        const vres = await listVariants(bp.id, provider.id);
        const total = vres.variants?.length ?? 0;
        const v0 = vres.variants?.[0];
        variantsSummary = {
          total,
          example: v0
            ? {
                id:    v0.id,
                title: v0.title,
                color: v0.options?.color,
                size:  v0.options?.size,
                placements: (v0.placeholders ?? []).map((ph) => ph.position),
              }
            : null,
          note: `Variantes pour provider ${provider.id} (${provider.title})`,
        };
      } catch (verr) {
        variantsSummary = {
          total: 0,
          example: null,
          note: `Échec listVariants : ${verr instanceof Error ? verr.message : "erreur"}`,
        };
      }
    }
  } catch (perr) {
    providers = [];
    variantsSummary = {
      total: 0,
      example: null,
      note: `Échec listPrintProviders : ${perr instanceof Error ? perr.message : "erreur"}`,
    };
  }

  return {
    blueprint_id: bp.id,
    title:        bp.title,
    brand:        bp.brand,
    model:        bp.model,
    description_short: (bp.description ?? "").slice(0, 200),
    catalog_images_sample: (bp.images ?? []).slice(0, 3),
    print_providers: providers,
    variants_summary: variantsSummary,
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isPrintifyConfigured()) {
    return NextResponse.json(
      {
        ok:    false,
        error: "PRINTIFY_API_TOKEN manquant dans .env.local",
      },
      { status: 500 },
    );
  }

  const withVariants = req.nextUrl.searchParams.get("withVariants") === "1";

  try {
    const results: TargetResult[] = [];

    for (const target of TARGETS) {
      const matched = await searchBlueprints(target.keywords);

      // Enrichir chaque match (providers + 1 variante exemple si demandé)
      const summaries: BlueprintSummary[] = [];
      for (const bp of matched.slice(0, 5)) {
        summaries.push(await enrichBlueprint(bp, withVariants));
      }

      results.push({
        hmKey:    target.hmKey,
        keywords: target.keywords,
        found:    matched.length > 0,
        matched:  summaries,
      });
    }

    const summary = {
      totalTargets:    TARGETS.length,
      targetsFound:    results.filter((r) => r.found).length,
      targetsMissing:  results.filter((r) => !r.found).map((r) => r.hmKey),
      withVariants,
    };

    return NextResponse.json({
      ok: true,
      summary,
      results,
    });
  } catch (err) {
    if (err instanceof PrintifyError) {
      return NextResponse.json(
        {
          ok:    false,
          error: err.message,
          status: err.status,
          endpoint: err.endpoint,
        },
        { status: err.status === 401 ? 401 : 502 },
      );
    }

    return NextResponse.json(
      {
        ok:    false,
        error: err instanceof Error ? err.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
