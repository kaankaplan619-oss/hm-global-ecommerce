/**
 * GET /api/printify/variant-map-test
 *
 * Route serveur — test du mapping V1 colorId HM ↔ variant_id Printify.
 *
 * Lookup local uniquement (aucun appel à l'API Printify).
 * Vérifie 5 combinaisons attendues + un cas d'échec contrôlé.
 *
 * Usage :
 *   curl http://localhost:3000/api/printify/variant-map-test | jq
 *
 * Optionnel — tester une combinaison custom :
 *   curl 'http://localhost:3000/api/printify/variant-map-test?slug=gildan-18000&color=marine&size=XL'
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getPrintifyVariantId,
  getMappedProductSlugs,
  getMappedColors,
  PROVIDER_LABELS,
} from "@/lib/suppliers/printify/printify-v1-map";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Combinaisons par défaut (cas demandés dans la mission) ──────────────────

const DEFAULT_CASES: { productSlug: string; colorId: string; size: string }[] = [
  { productSlug: "gildan-5000",  colorId: "noir",   size: "M" },
  { productSlug: "gildan-5000",  colorId: "blanc",  size: "L" },
  { productSlug: "bella-3001",   colorId: "noir",   size: "M" },
  { productSlug: "gildan-18000", colorId: "noir",   size: "L" },
  { productSlug: "gildan-18500", colorId: "noir",   size: "L" },
  // Cas d'échec attendu pour vérifier la robustesse :
  { productSlug: "cotton-heritage-m2480", colorId: "noir", size: "M" }, // produit exclus V1
];

// ─── Helper de formatage ─────────────────────────────────────────────────────

function describeProvider(id: number): string {
  const p = PROVIDER_LABELS[id];
  return p ? `${p.flag} ${p.name} (id=${id})` : `id=${id}`;
}

function formatResult(input: { productSlug: string; colorId: string; size: string }) {
  const result = getPrintifyVariantId(input);
  if (result.ok) {
    return {
      input,
      status:             "OK",
      blueprintId:        result.blueprintId,
      variantId:          result.variantId,
      printifyColorName:  result.printifyColorName,
      preferredProvider:  describeProvider(result.preferredProvider),
      fallbackProviders:  result.fallbackProviders.map(describeProvider),
    };
  }
  return {
    input,
    status:  "ERROR",
    error:   result.error,
    message: result.message,
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const slugParam  = req.nextUrl.searchParams.get("slug");
  const colorParam = req.nextUrl.searchParams.get("color");
  const sizeParam  = req.nextUrl.searchParams.get("size");

  // Mode "custom" si tous les params fournis
  if (slugParam && colorParam && sizeParam) {
    return NextResponse.json({
      mode:   "custom",
      result: formatResult({ productSlug: slugParam, colorId: colorParam, size: sizeParam }),
    });
  }

  // Mode "default" : déroule les 6 cas + intro
  const cases = DEFAULT_CASES.map(formatResult);
  const okCount = cases.filter((c) => c.status === "OK").length;
  const errCount = cases.length - okCount;

  // Vue catalogue V1
  const v1Catalogue: Record<string, { colors: string[] }> = {};
  for (const slug of getMappedProductSlugs()) {
    v1Catalogue[slug] = { colors: getMappedColors(slug) };
  }

  return NextResponse.json({
    mode:    "default",
    summary: {
      casesTotal: cases.length,
      casesOk:    okCount,
      casesError: errCount,
    },
    v1Catalogue,
    cases,
    hint: "Pour tester une combinaison custom : ?slug=gildan-18500&color=marine&size=L",
  });
}
