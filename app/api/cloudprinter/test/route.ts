/**
 * app/api/cloudprinter/test/route.ts
 *
 * Health-check Cloudprinter — vérifie auth + connectivité.
 *
 * ⚠️  SERVER ONLY — aucun token n'est jamais retourné dans la réponse.
 *
 * Réponses :
 *   - 200 { ok: true, tokenPresent: true, productsCount, sample }
 *   - 200 { ok: false, tokenPresent: false, reason } si clé absente
 *   - 502 { ok: false, error } si erreur API Cloudprinter
 *
 * Usage :
 *   curl http://localhost:3000/api/cloudprinter/test
 */

import { NextResponse } from "next/server";
import {
  isCloudprinterConfigured,
  listProducts,
} from "@/lib/suppliers/cloudprinter/adapter";
import { CloudprinterError } from "@/lib/suppliers/cloudprinter/client";

// Route dynamique — données live, jamais mises en cache
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Catégories utiles HM (pour info dans le sample)
const HM_USEFUL_CATEGORIES = [
  "Businesscard",
  "Flyer",
  "Poster",
  "Brochure",
  "Canvas",
  "Folder",
  "Letterhead",
  "Envelope",
];

export async function GET() {
  const tokenPresent = isCloudprinterConfigured();

  if (!tokenPresent) {
    return NextResponse.json(
      {
        ok: false,
        tokenPresent: false,
        reason:
          "CLOUDPRINTER_API_KEY absent du .env.local. Inscription gratuite : https://cloudprinter.com/register",
      },
      { status: 200 },
    );
  }

  try {
    const products = await listProducts();
    const productsCount = products.length;

    // Échantillon : 3 produits, filtrés sur les catégories HM si possible
    const useful = products.filter((p) => {
      const cat = String(p.category ?? "");
      return HM_USEFUL_CATEGORIES.some((c) => cat.toLowerCase().includes(c.toLowerCase()));
    });
    const sample = (useful.length > 0 ? useful : products).slice(0, 3).map((p) => ({
      reference: p.reference,
      name: p.name,
      category: p.category,
      // Ne jamais retourner l'éventuel champ "apikey" qui serait dans l'objet brut
      hasImageField: typeof p.image === "string" && p.image.length > 0,
    }));

    return NextResponse.json(
      {
        ok: true,
        tokenPresent: true,
        productsCount,
        usefulProductsCount: useful.length,
        sample,
        usefulCategories: HM_USEFUL_CATEGORIES,
      },
      { status: 200 },
    );
  } catch (err) {
    const status = err instanceof CloudprinterError ? err.status || 502 : 502;
    const message = err instanceof Error ? err.message : "Erreur inconnue Cloudprinter";
    // On retourne le message d'erreur mais SANS le payload brut (qui pourrait
    // inclure indirectement le body envoyé — défense en profondeur).
    return NextResponse.json(
      {
        ok: false,
        tokenPresent: true,
        error: message,
        endpoint: err instanceof CloudprinterError ? err.endpoint : undefined,
      },
      { status },
    );
  }
}
