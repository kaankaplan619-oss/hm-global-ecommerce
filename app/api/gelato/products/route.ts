import { NextRequest, NextResponse } from "next/server";
import { getGelatoProducts, isGelatoConfigured } from "@/lib/gelato";
import { rateLimit } from "@/lib/security/rate-limit";

/**
 * GET /api/gelato/products
 * Retourne la liste des produits Gelato disponibles.
 * Utilisé pour afficher le catalogue print sur le site.
 */
export async function GET(req: NextRequest) {
  // Rate-limit (relais API Gelato — cap l'aspiration/abus).
  const limited = rateLimit(req, { key: "gelato-products", limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  try {
    if (!isGelatoConfigured()) {
      return NextResponse.json(
        { error: "Gelato non configuré." },
        { status: 503 }
      );
    }

    const products = await getGelatoProducts();
    return NextResponse.json({ products });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Gelato] getProducts error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
