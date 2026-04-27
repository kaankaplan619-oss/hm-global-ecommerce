import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/toptex";

const TOPTEX_BASE = "https://api.toptex.io";

/**
 * GET /api/toptex/enrichment/{catalogRef}
 *
 * Récupère les images packshot TopTex pour un produit donné par son
 * catalog_reference (ex. CGTU01T, K262, IB320).
 *
 * Retourne : { colorImages: Record<string, string[]> }
 *   clé = nom couleur TopTex en minuscules (ex. "white", "black", "navy")
 *   valeur = tableau d'URLs FACE / BACK / SIDE
 *
 * Si les packshots sont bloqués par la charte Photo Library TopTex,
 * la couleur n'est pas incluse dans la réponse (filtre silencieux).
 *
 * Cache CDN : revalidate 1h (données catalogue stables).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  const { sku } = await params;

  if (!sku || sku.length < 2) {
    return NextResponse.json({ error: "Référence invalide" }, { status: 400 });
  }

  try {
    const headers = await getAuthHeaders();

    const url =
      `${TOPTEX_BASE}/v3/products` +
      `?catalog_reference=${encodeURIComponent(sku)}` +
      `&usage_right=b2b_b2c` +
      `&lang=fr`;

    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[TopTex Enrichment] ${res.status} pour ${sku}:`, body);
      return NextResponse.json(
        { sku, colorImages: {} },
        { headers: { "Cache-Control": "public, s-maxage=300" } }
      );
    }

    const product = await res.json() as Record<string, unknown>;

    // Vérifier que la réponse est bien un produit (pas une erreur applicative)
    if (product.errorType || product.errorMessage) {
      console.warn(`[TopTex Enrichment] Erreur API pour ${sku}:`, product.errorMessage);
      return NextResponse.json(
        { sku, colorImages: {} },
        { headers: { "Cache-Control": "public, s-maxage=300" } }
      );
    }

    const rawColors = (product.colors ?? []) as Array<Record<string, unknown>>;

    // Construire colorImages : nom couleur → URLs packshot valides
    const colorImages: Record<string, string[]> = {};

    for (const color of rawColors) {
      // Nom de la couleur (le champ s'appelle "colors" dans le JSON TopTex réel)
      const colorNames =
        (color.colors as Record<string, string> | undefined) ??
        (color.colorName as Record<string, string> | undefined) ??
        {};

      const colorKey = (
        colorNames.fr ??
        colorNames.en ??
        Object.values(colorNames).find((v) => typeof v === "string") ??
        ""
      ).toLowerCase().trim();

      if (!colorKey) continue;

      const packshots =
        (color.packshots as Record<string, unknown> | undefined) ?? {};

      // Extraire les URLs valides (FACE → BACK → SIDE), filtrer les erreurs Photo Library
      const urls: string[] = [];
      for (const view of ["FACE", "BACK", "SIDE"]) {
        const p = packshots[view];
        if (typeof p === "string" && !p.includes("Please connect")) {
          urls.push(p);
        }
        // Si p est { error: "Please connect to Photo library..." } → ignorer silencieusement
      }

      if (urls.length > 0) {
        colorImages[colorKey] = urls;
      }
    }

    console.log(
      `[TopTex Enrichment] ${sku}` +
      ` | ${rawColors.length} couleurs TopTex` +
      ` | ${Object.keys(colorImages).length} avec photos`
    );

    return NextResponse.json(
      { sku, colorImages },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[TopTex Enrichment] Erreur:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
