/**
 * POST /api/printify/mockup-pilot   → crée un produit pilote + retourne les mockups
 * GET  /api/printify/mockup-pilot?action=fetch&productId=…  → relit un produit pilote
 * DELETE /api/printify/mockup-pilot?productId=…             → supprime un produit pilote
 *
 * Route serveur — test du Printify Product Creator pour récupérer
 * automatiquement des mockups flat color-specific.
 *
 * Workflow POST :
 *   1. Upload un design de test (PNG transparent 200×200 + marqueur rouge) via base64
 *   2. Crée un produit draft dans la shop Printify avec les 4 couleurs principales
 *      (noir, blanc, gris, marine — toutes tailles M/L) du blueprint 77 (Gildan 18500)
 *      chez Textildruck Europa (id 26)
 *   3. Récupère le produit (qui contient les mockups générés par Printify)
 *   4. Filtre les images pour ne retourner que les vues flat color-specific
 *      (camera_label ∈ {front, back, folded}) — sans mannequin
 *   5. Retourne un mapping {colorId HM → {front, back, folded}}
 *
 * ⚠️  Le produit créé n'est PAS publié dans une boutique (sales_channel=disconnected).
 *     Aucune commande client. Pour supprimer le draft : DELETE avec productId.
 *
 * Le token n'est jamais renvoyé dans la réponse.
 */

import { NextRequest, NextResponse } from "next/server";
import { isPrintifyConfigured } from "@/lib/suppliers/printify/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRINTIFY_BASE = "https://api.printify.com/v1";

// ─── Config pilote ───────────────────────────────────────────────────────────

const PILOT_CONFIG = {
  shopId:           27566098,
  blueprintId:      77,                          // Gildan 18500 Hoodie
  printProviderId:  26,                          // Textildruck Europa DE
  productTitle:     "HM PILOT TEST — DO NOT PUBLISH",
  productDescription: "Pilote mockup Printify, à supprimer après audit",
  // Mapping couleur HM → variant_id Printify pour tailles M & L
  colors: [
    { hmColorId: "noir",   variantIds: [32919, 32920] }, // M, L
    { hmColorId: "blanc",  variantIds: [32911, 32912] },
    { hmColorId: "gris",   variantIds: [32903, 32904] },
    { hmColorId: "marine", variantIds: [32895, 32896] },
  ],
};

// Camera labels qu'on garde pour le catalogue HM (sans mannequin)
const KEEP_LABELS = new Set(["front", "back", "folded", "back-2", "front-collar-closeup"]);

// ─── Types Printify (réponse produit) ────────────────────────────────────────

interface PrintifyImage {
  src:         string;
  variant_ids: number[];
  position:    "front" | "back" | "other";
  is_default:  boolean;
}

interface PrintifyProductResponse {
  id:           string;
  title:        string;
  variants:     unknown[];
  images:       PrintifyImage[];
}

// ─── PNG test (200×200 transparent + petit carré rouge au centre) ────────────
// Généré offline via Pillow puis inliné en base64.
// Sert uniquement à déclencher la génération de mockups.
const TEST_DESIGN_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAABDklEQVR42u3QQRGAMAwAsRzPaPwbqYTRJ" +
  "EZ2sZ19/3xnyCM/SCggCkgCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCgg" +
  "CggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggC" +
  "ggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCg" +
  "gCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCgg" +
  "CggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggCggC4d4AcDQRfm4" +
  "lZlnAAAAAElFTkSuQmCC";

// ─── Helpers Printify ────────────────────────────────────────────────────────

async function pfFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) throw new Error("PRINTIFY_API_TOKEN manquant");
  const res = await fetch(`${PRINTIFY_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept:        "application/json",
      "User-Agent":   "HMGlobal/1.0 (mockup-pilot)",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[Printify] ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function uploadDesign(): Promise<string> {
  const r = await pfFetch<{ id: string }>("/uploads/images.json", {
    method: "POST",
    body: JSON.stringify({
      file_name: "hm-mockup-pilot-test.png",
      contents:  TEST_DESIGN_B64,
    }),
  });
  return r.id;
}

async function createPilotProduct(imageId: string): Promise<PrintifyProductResponse> {
  const allVariantIds = PILOT_CONFIG.colors.flatMap((c) => c.variantIds);
  const payload = {
    title:             PILOT_CONFIG.productTitle,
    description:       PILOT_CONFIG.productDescription,
    blueprint_id:      PILOT_CONFIG.blueprintId,
    print_provider_id: PILOT_CONFIG.printProviderId,
    variants: allVariantIds.map((id) => ({ id, price: 3000, is_enabled: true })),
    print_areas: [{
      variant_ids: allVariantIds,
      placeholders: [{
        position: "front",
        images: [{ id: imageId, x: 0.5, y: 0.5, scale: 0.5, angle: 0 }],
      }],
    }],
  };

  return pfFetch<PrintifyProductResponse>(`/shops/${PILOT_CONFIG.shopId}/products.json`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function fetchProduct(productId: string): Promise<PrintifyProductResponse> {
  return pfFetch<PrintifyProductResponse>(`/shops/${PILOT_CONFIG.shopId}/products/${productId}.json`);
}

async function deleteProduct(productId: string): Promise<void> {
  await pfFetch<void>(`/shops/${PILOT_CONFIG.shopId}/products/${productId}.json`, {
    method: "DELETE",
  });
}

// ─── Builder : transforme PrintifyProductResponse en mapping HM ──────────────

interface MockupForColor {
  hmColorId: string;
  printifyVariantIdL: number;
  views: Record<string, string>;   // ex { front: "...", back: "...", folded: "..." }
}

interface PilotResult {
  productId: string;
  imagesTotal: number;
  imagesKept: number;
  mockupsByColor: MockupForColor[];
}

function buildMockupMap(product: PrintifyProductResponse): PilotResult {
  const result: MockupForColor[] = [];

  for (const c of PILOT_CONFIG.colors) {
    // On prend le variant_id "L" (le 2e dans variantIds[]) comme représentant de la couleur
    const variantIdL = c.variantIds[1] ?? c.variantIds[0];
    const views: Record<string, string> = {};

    for (const img of product.images ?? []) {
      const url = new URL(img.src);
      const camLabel = url.searchParams.get("camera_label") ?? "";
      if (!KEEP_LABELS.has(camLabel)) continue;
      // Le variant_id apparaît dans le path : .../mockup/{product_id}/{variant_id}/...
      if (!url.pathname.includes(`/${variantIdL}/`)) continue;
      views[camLabel] = img.src;
    }

    result.push({
      hmColorId: c.hmColorId,
      printifyVariantIdL: variantIdL,
      views,
    });
  }

  return {
    productId:   product.id,
    imagesTotal: product.images?.length ?? 0,
    imagesKept:  result.reduce((sum, c) => sum + Object.keys(c.views).length, 0),
    mockupsByColor: result,
  };
}

// ─── Handlers ────────────────────────────────────────────────────────────────

function tokenCheck() {
  if (!isPrintifyConfigured()) {
    return NextResponse.json(
      { ok: false, error: "PRINTIFY_API_TOKEN manquant dans .env.local" },
      { status: 500 },
    );
  }
  return null;
}

export async function POST() {
  const guard = tokenCheck();
  if (guard) return guard;

  try {
    const imageId = await uploadDesign();
    const product = await createPilotProduct(imageId);
    const result = buildMockupMap(product);

    return NextResponse.json({
      ok:        true,
      action:    "create",
      pilot:     PILOT_CONFIG,
      uploadedDesignId: imageId,
      ...result,
      hint: `Pour supprimer ce draft : curl -X DELETE 'http://localhost:3000/api/printify/mockup-pilot?productId=${product.id}'`,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest) {
  const guard = tokenCheck();
  if (guard) return guard;

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({
      ok: false,
      error: "Paramètre productId manquant",
      hint: "Pour créer un draft pilote : POST /api/printify/mockup-pilot. Pour relire un draft existant : GET ?productId=...",
    }, { status: 400 });
  }

  try {
    const product = await fetchProduct(productId);
    const built = buildMockupMap(product);
    return NextResponse.json({
      ok:      true,
      action:  "fetch",
      ...built,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 502 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const guard = tokenCheck();
  if (guard) return guard;

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ ok: false, error: "Paramètre productId manquant" }, { status: 400 });
  }

  try {
    await deleteProduct(productId);
    return NextResponse.json({ ok: true, action: "delete", productId, message: "Draft supprimé" });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 502 },
    );
  }
}
