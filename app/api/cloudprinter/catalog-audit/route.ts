/**
 * app/api/cloudprinter/catalog-audit/route.ts
 *
 * Audit catalogue Cloudprinter — endpoint lecture seule.
 *
 * Mai 2026 — refonte V2 axée DÉCOUVERTE :
 *   La V1 filtrait par catégories HM hardcodées (Businesscard, Canvas, Folder,
 *   etc.) et retournait 0 produit pour ces 3 familles. La nouvelle version
 *   inspecte d'abord les catégories RÉELLEMENT retournées par Cloudprinter,
 *   puis cherche par mots-clés élargis (business / card / visit / canvas /
 *   wall / art / photo / folder / presentation / document / folded) pour
 *   identifier ce qui est probablement disponible sous un autre libellé.
 *
 * ⚠️  SERVER ONLY. Aucune création de commande, aucun upload fichier.
 *
 * Usage :
 *   curl http://localhost:3000/api/cloudprinter/catalog-audit
 *   curl http://localhost:3000/api/cloudprinter/catalog-audit | jq
 */

import { NextResponse } from "next/server";
import {
  isCloudprinterConfigured,
  listProducts,
} from "@/lib/suppliers/cloudprinter/adapter";
import { CloudprinterError } from "@/lib/suppliers/cloudprinter/client";
import type { CloudprinterProductListItem } from "@/lib/suppliers/cloudprinter/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Champs image-like recherchés (mêmes que V1) ────────────────────────────

const IMAGE_FIELDS = [
  "image",
  "imageUrl",
  "image_url",
  "thumbnail",
  "preview",
  "previewUrl",
  "mockup",
  "mockup_url",
  "proof",
  "render",
  "assets",
] as const;

// ─── Groupes de mots-clés pour identification famille ───────────────────────
//
// Chaque famille HM est cherchée via PLUSIEURS mots-clés, dans tous les champs
// texte du produit (name, category, reference). Match case-insensitive
// substring. Un produit peut matcher plusieurs familles (intersection
// possible — ex: "Photo on canvas" matche canvas ET photo).

interface KeywordGroup {
  /** Nom HM de la famille (slug interne) */
  hmFamily:
    | "businessCard"
    | "canvas"
    | "folder"
    | "wallArt"
    | "photoPrint"
    | "presentation";
  /** Libellé humain pour le rapport */
  label: string;
  /** Mots-clés à matcher (lowercase, substring) */
  keywords: string[];
}

const KEYWORD_GROUPS: KeywordGroup[] = [
  {
    hmFamily: "businessCard",
    label: "Carte de visite (Business Card)",
    keywords: ["business", "businesscard", "business_card", "visit", "namecard", "name_card", "card"],
  },
  {
    hmFamily: "canvas",
    label: "Toile canvas",
    keywords: ["canvas"],
  },
  {
    hmFamily: "wallArt",
    label: "Wall art / décoration murale",
    keywords: ["wall", "wallart", "wall_art", "art_print", "artprint"],
  },
  {
    hmFamily: "photoPrint",
    label: "Photo print / impression photo",
    keywords: ["photo", "photoprint", "photo_print", "photobook"],
  },
  {
    hmFamily: "folder",
    label: "Folder / chemise / pochette",
    keywords: ["folder", "presentation_folder", "document_folder", "chemise"],
  },
  {
    hmFamily: "presentation",
    label: "Présentation / pliage (folded)",
    keywords: ["presentation", "folded", "fold"],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSearchableText(p: CloudprinterProductListItem): string {
  const parts: string[] = [];
  for (const key of ["reference", "name", "category", "subcategory", "description"] as const) {
    const val = (p as Record<string, unknown>)[key];
    if (typeof val === "string") parts.push(val);
  }
  return parts.join(" | ").toLowerCase();
}

function detectImageFields(obj: unknown): string[] {
  if (!obj || typeof obj !== "object") return [];
  const found: string[] = [];
  for (const key of IMAGE_FIELDS) {
    if (key in (obj as Record<string, unknown>)) {
      const val = (obj as Record<string, unknown>)[key];
      if (val !== null && val !== undefined && val !== "") found.push(key);
    }
  }
  return found;
}

// ─── Route ───────────────────────────────────────────────────────────────────

interface KeywordMatchResult {
  hmFamily: KeywordGroup["hmFamily"];
  label: string;
  keywords: string[];
  count: number;
  /** Catégories Cloudprinter trouvées qui matchent (utile pour comprendre les libellés) */
  categoriesMatched: Array<{ category: string; count: number }>;
  /** 10 échantillons */
  samples: Array<{
    reference: string;
    name?: string;
    category?: string;
    matchedOn: string[];
  }>;
}

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

  // ─── 1. Catégories uniques retournées par Cloudprinter ────────────────────
  const categoryCounts = new Map<string, number>();
  let productsWithCategory = 0;
  let productsWithoutCategory = 0;

  for (const p of allProducts) {
    const cat = typeof p.category === "string" && p.category.length > 0 ? p.category : null;
    if (cat) {
      productsWithCategory++;
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    } else {
      productsWithoutCategory++;
    }
  }

  const allCategoriesSorted = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  const top15Categories = allCategoriesSorted.slice(0, 15);

  // ─── 2. Recherche par groupes de mots-clés ────────────────────────────────
  const keywordResults: KeywordMatchResult[] = [];

  for (const group of KEYWORD_GROUPS) {
    const lowerKeywords = group.keywords.map((k) => k.toLowerCase());
    const matched: Array<{ product: CloudprinterProductListItem; matchedOn: string[] }> = [];

    for (const p of allProducts) {
      const text = getSearchableText(p);
      const hits = lowerKeywords.filter((k) => text.includes(k));
      if (hits.length > 0) {
        matched.push({ product: p, matchedOn: hits });
      }
    }

    // Catégories Cloudprinter présentes parmi les matchés
    const catCounts = new Map<string, number>();
    for (const m of matched) {
      const c = String(m.product.category ?? "uncategorized");
      catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
    }
    const categoriesMatched = Array.from(catCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    // 10 samples diversifiés (pris dans différentes catégories si possible)
    const samples: KeywordMatchResult["samples"] = [];
    const seenCats = new Set<string>();
    for (const m of matched) {
      const c = String(m.product.category ?? "uncategorized");
      if (samples.length < 10 && (seenCats.size < 5 || !seenCats.has(c))) {
        samples.push({
          reference: m.product.reference,
          name: m.product.name,
          category: m.product.category,
          matchedOn: m.matchedOn,
        });
        seenCats.add(c);
      }
      if (samples.length >= 10) break;
    }
    // Compléter si moins de 10
    if (samples.length < 10) {
      for (const m of matched) {
        if (samples.length >= 10) break;
        if (samples.some((s) => s.reference === m.product.reference)) continue;
        samples.push({
          reference: m.product.reference,
          name: m.product.name,
          category: m.product.category,
          matchedOn: m.matchedOn,
        });
      }
    }

    keywordResults.push({
      hmFamily: group.hmFamily,
      label: group.label,
      keywords: group.keywords,
      count: matched.length,
      categoriesMatched,
      samples,
    });
  }

  // ─── 3. Champs image-like présents dans la liste racine ───────────────────
  let imageFieldHits = 0;
  for (const p of allProducts) {
    if (detectImageFields(p).length > 0) imageFieldHits++;
  }

  return NextResponse.json(
    {
      ok: true,
      tokenPresent: true,
      summary: {
        totalProducts: allProducts.length,
        productsWithCategory,
        productsWithoutCategory,
        uniqueCategoriesCount: allCategoriesSorted.length,
        productsWithImageField: imageFieldHits,
      },
      categories: {
        top15: top15Categories,
        all: allCategoriesSorted,
      },
      keywordCandidates: keywordResults,
      methodology: {
        imageFieldsSearched: IMAGE_FIELDS,
        keywordSearchFields: ["reference", "name", "category", "subcategory", "description"],
        matchType: "case-insensitive substring",
      },
    },
    { status: 200 },
  );
}
