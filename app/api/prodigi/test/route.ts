/**
 * app/api/prodigi/test/route.ts
 *
 * Health-check Prodigi + audit images/mockups par SKU connu.
 *
 * ⚠️  SERVER ONLY. Aucune commande, aucun upload, aucun cache.
 *
 * Pour répondre à : "Est-ce que Prodigi expose des images marketing
 * exploitables sur notre site via API ?"
 *
 * Usage :
 *   curl http://localhost:3000/api/prodigi/test
 *   curl http://localhost:3000/api/prodigi/test | jq
 */

import { NextResponse } from "next/server";
import {
  getProductDetail,
  isProdigiConfigured,
  tryListProducts,
} from "@/lib/suppliers/prodigi/adapter";
import { ProdigiError } from "@/lib/suppliers/prodigi/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// SKUs Prodigi à sonder (élargi pour maximiser les chances de match).
// Si un SKU n'existe pas, l'API retourne 404 "EntityNotFound" — l'audit le signale.
const KNOWN_SKUS = [
  // ── Canvas / wall art ─────────────────────────────────────────────────────
  "GLOBAL-CFP-16X20",     // Canvas Fine Print 16x20
  "GLOBAL-CFP-8X10",      // Canvas 8x10
  "GLOBAL-CFP-A2",        // Canvas A2
  // ── Fine art prints ───────────────────────────────────────────────────────
  "GLOBAL-FAP-16X20",     // Fine Art Print 16x20
  "GLOBAL-FAP-A3",        // Fine Art Print A3
  "GLOBAL-FAP-A4",        // Fine Art Print A4
  // ── Posters / photos ──────────────────────────────────────────────────────
  "GLOBAL-PAP-A3",        // Photographic paper A3
  "GLOBAL-PAP-A4",        // Photographic paper A4
  // ── Mugs ──────────────────────────────────────────────────────────────────
  "CLASSIC-CMU-WHT-11",   // Classic ceramic mug white 11oz
  "GLOBAL-CMU-WHT-11OZ",  // Variant ceramic mug
  // ── Phone cases ───────────────────────────────────────────────────────────
  "GLOBAL-TECH-IP14-CLR", // iPhone 14 case
  // ── Apparel (T-shirts) ────────────────────────────────────────────────────
  "GLOBAL-TEE-LSAP-BLA-S",     // Long-sleeve apparel test
  "A-AOP-COTTEE-S-WHT-FRO",    // All-over print cotton tee S white front
] as const;

// Champs image-like recherchés dans /products/{sku}
const IMAGE_FIELDS = [
  "image",
  "imageUrl",
  "image_url",
  "thumbnail",
  "preview",
  "previewUrl",
  "preview_url",
  "mockup",
  "mockup_url",
  "mockupUrl",
  "proof",
  "render",
  "assets",
  "images",
  "thumbnails",
] as const;

interface ImageFieldHit {
  field: string;
  hasValue: boolean;
  preview?: string;
}

function inspectImageFields(obj: unknown, prefix = ""): ImageFieldHit[] {
  if (!obj || typeof obj !== "object") return [];
  const out: ImageFieldHit[] = [];
  const o = obj as Record<string, unknown>;
  for (const key of IMAGE_FIELDS) {
    if (key in o) {
      const val = o[key];
      const hasValue = val !== null && val !== undefined && val !== "" && (
        Array.isArray(val) ? val.length > 0 : true
      );
      const preview =
        typeof val === "string"
          ? val.slice(0, 100)
          : Array.isArray(val)
            ? `[array len=${val.length}]`
            : typeof val === "object"
              ? "[object]"
              : String(val).slice(0, 60);
      out.push({ field: prefix + key, hasValue, preview });
    }
  }
  // Inspection récursive 1 niveau (pour catch image dans `printAreas`, etc.)
  if (prefix.length === 0) {
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === "object" && !Array.isArray(v) && !IMAGE_FIELDS.includes(k as never)) {
        const nested = inspectImageFields(v, `${k}.`);
        out.push(...nested);
      }
    }
  }
  return out;
}

interface SkuAuditResult {
  sku: string;
  ok: boolean;
  description?: string;
  productType?: string;
  imageFieldsFound: ImageFieldHit[];
  imageFieldsWithValue: number;
  topLevelKeys: string[];
  error?: string;
}

export async function GET() {
  if (!isProdigiConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        tokenPresent: false,
        reason:
          "PRODIGI_API_KEY absent du .env.local. Génération clé : https://dashboard.pwinty.com/ → Settings → API Keys",
      },
      { status: 200 },
    );
  }

  // 1. Tenter le listing pour info (probablement non disponible publiquement)
  const listingProbe = await tryListProducts();

  // 2. Audit par SKU connu
  const skuAudits: SkuAuditResult[] = [];
  for (const sku of KNOWN_SKUS) {
    try {
      const detail = await getProductDetail(sku);
      const detailObj = detail as Record<string, unknown>;
      const imageFields = inspectImageFields(detail);
      skuAudits.push({
        sku,
        ok: true,
        description: typeof detailObj.description === "string" ? detailObj.description : undefined,
        productType: typeof detailObj.productType === "string" ? detailObj.productType : undefined,
        imageFieldsFound: imageFields,
        imageFieldsWithValue: imageFields.filter((f) => f.hasValue).length,
        topLevelKeys: Object.keys(detailObj).slice(0, 25),
      });
    } catch (err) {
      skuAudits.push({
        sku,
        ok: false,
        imageFieldsFound: [],
        imageFieldsWithValue: 0,
        topLevelKeys: [],
        error: err instanceof ProdigiError ? err.message.slice(0, 200) : (err as Error).message.slice(0, 200),
      });
    }
  }

  // Synthèse
  const skusOk = skuAudits.filter((s) => s.ok).length;
  const anyImageFieldHasValue = skuAudits.some((s) => s.imageFieldsWithValue > 0);
  const uniqueImageFieldsAcrossSKUs = new Set<string>();
  for (const s of skuAudits) {
    for (const f of s.imageFieldsFound) {
      if (f.hasValue) uniqueImageFieldsAcrossSKUs.add(f.field);
    }
  }

  // Verdict
  let verdict = "PRODIGI N'EXPOSE PAS D'IMAGES MARKETING VIA API";
  if (anyImageFieldHasValue) {
    verdict = `Prodigi EXPOSE des images via les champs: ${Array.from(uniqueImageFieldsAcrossSKUs).join(", ")}`;
  }

  return NextResponse.json(
    {
      ok: true,
      tokenPresent: true,
      env: process.env.PRODIGI_ENV ?? "sandbox",
      verdict,
      anyImageFieldHasValue,
      uniqueImageFieldsAcrossSKUs: Array.from(uniqueImageFieldsAcrossSKUs),
      listingProbe: {
        ok: listingProbe.ok,
        endpointUsed: listingProbe.endpointUsed,
        productsCount: listingProbe.products.length,
        error: listingProbe.error,
      },
      skuAudits: {
        skusTested: KNOWN_SKUS.length,
        skusOk,
        details: skuAudits,
      },
      methodology: {
        imageFieldsSearched: IMAGE_FIELDS,
        knownSkusTested: KNOWN_SKUS,
        note: "Prodigi documente uniquement l'accès par SKU connu. L'audit confirme empiriquement la présence ou l'absence de champs image dans les payloads /products/{sku}.",
      },
    },
    { status: 200 },
  );
}
