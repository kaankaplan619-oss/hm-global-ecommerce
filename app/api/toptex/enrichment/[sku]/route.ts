import { NextRequest, NextResponse } from "next/server";
import { getTopTexProductBySku, buildColorImageMap } from "@/lib/toptex";

/**
 * GET /api/toptex/enrichment/{sku}?colors=[{"id":"blanc","label":"Blanc"},...]
 *
 * Endpoint public (pas d'auth requise — données catalogue fournisseur).
 * Retourne un mapping colorId → imageUrls construit depuis les médias TopTex.
 *
 * Cache : 1 heure côté CDN, stale-while-revalidate 2 h.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;

    if (!sku || sku.length < 2) {
      return NextResponse.json({ error: "SKU invalide" }, { status: 400 });
    }

    // Récupère les couleurs du produit passées en query param (JSON)
    const colorsParam = req.nextUrl.searchParams.get("colors");
    let productColors: Array<{ id: string; label: string }> = [];
    if (colorsParam) {
      try {
        productColors = JSON.parse(decodeURIComponent(colorsParam));
      } catch {
        // Ignore — on retournera juste les médias sans mapping
      }
    }

    const toptexProduct = await getTopTexProductBySku(sku);

    if (!toptexProduct) {
      return NextResponse.json(
        { sku, colorImages: {}, medias: [], colors: [] },
        {
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
        }
      );
    }

    const colorImages = buildColorImageMap(productColors, toptexProduct);

    // Retourner aussi les couleurs TopTex brutes pour enrichissement futur
    const rawColors = (toptexProduct.colors ?? []).map((c) => ({
      colorCode: c.colorCode ?? "",
      colorName:
        typeof c.colorName === "object"
          ? (c.colorName as Record<string, string>)
          : { fr: c.colorName as string ?? "" },
    }));

    return NextResponse.json(
      { sku, colorImages, rawColors, mediaCount: (toptexProduct.medias ?? []).length },
      {
        headers: {
          // Cache agressif — les médias changent rarement
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[API /toptex/enrichment]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
