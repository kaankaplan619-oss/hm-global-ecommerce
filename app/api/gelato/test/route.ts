/**
 * GET /api/gelato/test
 *
 * Route serveur — test de la clé Gelato.
 *
 * Vérifie :
 *   1. Présence de GELATO_API_KEY dans .env.local
 *   2. Réponse de l'API Gelato (liste des catalogues)
 *
 * Ne retourne JAMAIS la clé dans la réponse.
 *
 * Usage :
 *   curl http://localhost:3000/api/gelato/test | jq
 */

import { NextResponse } from "next/server";
import { isGelatoConfigured, listCatalogs } from "@/lib/suppliers/gelato/client";
import { GelatoError } from "@/lib/suppliers/gelato/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRINT_CATALOG_KEYWORDS = [
  "business-cards",
  "flyers",
  "posters",
  "canvas",
  "stickers",
  "accordion-fold-brochures",
  "folded-brochures",
  "wall-art",
];

export async function GET() {
  if (!isGelatoConfigured()) {
    return NextResponse.json(
      {
        ok:    false,
        error: "GELATO_API_KEY manquant dans .env.local",
        hint:  "Ajouter GELATO_API_KEY=… dans .env.local puis relancer le serveur dev.",
      },
      { status: 500 },
    );
  }

  try {
    const catalogs = await listCatalogs();
    const printRelevant = catalogs.filter((c) =>
      PRINT_CATALOG_KEYWORDS.some((kw) => c.catalogUid.toLowerCase().includes(kw)),
    );

    return NextResponse.json({
      ok:           true,
      tokenPresent: true,
      catalogsTotal: catalogs.length,
      printCatalogs: printRelevant.map((c) => ({
        catalogUid: c.catalogUid,
        title:      c.title,
      })),
      sample10: catalogs.slice(0, 10).map((c) => c.catalogUid),
    });
  } catch (err) {
    if (err instanceof GelatoError) {
      return NextResponse.json(
        {
          ok:       false,
          error:    err.message,
          status:   err.status,
          endpoint: err.endpoint,
          hint: err.status === 401 || err.status === 403
            ? "Clé Gelato invalide. Régénérer sur dashboard.gelato.com/keys."
            : "Vérifier connectivité réseau + validité de la clé.",
        },
        { status: err.status === 401 || err.status === 403 ? err.status : 502 },
      );
    }
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 },
    );
  }
}
