/**
 * GET  /api/printify/diagnose?slug=...&color=...&size=...&technique=...&placement=...&quantity=...&logoUrl=...
 * POST /api/printify/diagnose   { productSlug, colorId, size, technique, placement, quantity, logoFile }
 *
 * Route serveur de diagnostic — pour un item panier (ou ses champs),
 * vérifie si toutes les données nécessaires à une commande Printify V1 sont présentes.
 *
 * Ne crée AUCUNE commande, n'envoie rien chez Printify, ne touche pas la DB.
 * Pure résolution mapping HM → Printify (variant_id / provider / blueprint).
 *
 * Usage rapide :
 *   curl 'http://localhost:3000/api/printify/diagnose?slug=hoodie-gildan-18500&color=noir&size=L&technique=dtf&placement=coeur&quantity=1&logoUrl=https://example.com/logo.png'
 *
 * Cas par défaut (sans paramètres) :
 *   curl http://localhost:3000/api/printify/diagnose
 *   → exécute un diagnostic sur le scénario type :
 *     Gildan 18500 Hoodie noir L DTF cœur 1 ex, logo Supabase fictif.
 */

import { NextRequest, NextResponse } from "next/server";
import { diagnoseCartItem, type DiagnoseInput } from "@/lib/suppliers/printify/diagnose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_TEST_CASE: DiagnoseInput = {
  productSlug: "hoodie-gildan-18500",
  colorId:     "noir",
  size:        "L",
  technique:   "dtf",
  placement:   "coeur",
  quantity:    1,
  logoFile: {
    name: "hm-logo-test.png",
    url:  "https://kbeeedbfkalovtusaden.supabase.co/storage/v1/object/public/logos/test/hm-logo-test.png",
    type: "image/png",
  },
};

function parseQuery(url: URL): DiagnoseInput | null {
  const slug = url.searchParams.get("slug");
  const color = url.searchParams.get("color");
  const size = url.searchParams.get("size");
  if (!slug || !color || !size) return null;
  const logoUrl = url.searchParams.get("logoUrl");
  return {
    productSlug: slug,
    colorId:     color,
    size,
    technique:   url.searchParams.get("technique")  ?? undefined,
    placement:   url.searchParams.get("placement")  ?? undefined,
    quantity:    Number(url.searchParams.get("quantity") ?? "1"),
    logoFile:    logoUrl ? { name: "logo.png", url: logoUrl, type: "image/png" } : undefined,
  };
}

export async function GET(req: NextRequest) {
  const fromQuery = parseQuery(req.nextUrl);
  const input = fromQuery ?? DEFAULT_TEST_CASE;
  const result = diagnoseCartItem(input);
  return NextResponse.json({
    ok: true,
    mode: fromQuery ? "custom" : "default-test-case",
    input,
    result,
  });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON invalide" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Body manquant" }, { status: 400 });
  }
  const input = body as DiagnoseInput;
  const result = diagnoseCartItem(input);
  return NextResponse.json({ ok: true, mode: "custom-post", input, result });
}
