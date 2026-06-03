/**
 * GET /api/printify/test
 *
 * Route serveur — test du token Printify.
 *
 * Vérifie :
 *   1. Que PRINTIFY_API_TOKEN est présent dans .env.local
 *   2. Que l'API Printify répond correctement (appel GET /shops.json)
 *
 * Ne retourne JAMAIS le token dans la réponse.
 * Aucune écriture, aucune création de commande.
 *
 * Usage local :
 *   curl http://localhost:3000/api/printify/test
 */

import { NextResponse } from "next/server";
import {
  isPrintifyConfigured,
  listShops,
} from "@/lib/suppliers/printify/client";
import { PrintifyError } from "@/lib/suppliers/printify/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  // ── 1. Vérifier la présence du token (sans révéler sa valeur) ───────────
  if (!isPrintifyConfigured()) {
    return NextResponse.json(
      {
        ok:    false,
        error: "PRINTIFY_API_TOKEN manquant dans .env.local",
        hint:  "Ajouter une ligne PRINTIFY_API_TOKEN=… dans .env.local puis relancer le serveur dev.",
      },
      { status: 500 },
    );
  }

  // ── 2. Appel API Printify ──────────────────────────────────────────────
  try {
    const shops = await listShops();

    return NextResponse.json({
      ok:        true,
      tokenPresent: true,
      shopsCount:   shops.length,
      shops: shops.map((s) => ({
        id:    s.id,
        title: s.title,
        salesChannel: s.sales_channel,
      })),
    });
  } catch (err) {
    if (err instanceof PrintifyError) {
      return NextResponse.json(
        {
          ok:    false,
          error: err.message,
          status: err.status,
          endpoint: err.endpoint,
          hint: err.status === 401
            ? "Token Printify invalide ou expiré. Régénérer sur printify.com/app/account/api."
            : "Vérifier la connectivité réseau et la validité du token.",
        },
        { status: err.status === 401 ? 401 : 502 },
      );
    }

    return NextResponse.json(
      {
        ok:    false,
        error: err instanceof Error ? err.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
