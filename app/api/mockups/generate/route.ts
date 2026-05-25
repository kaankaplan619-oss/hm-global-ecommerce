/**
 * POST /api/mockups/generate
 *
 * Glue serveur entre le composant client `UniversalMockupViewer` et l'API
 * Mockey.ai (`lib/integrations/mockeyai.ts`).
 *
 * Pourquoi une route ? La clé `MOCKEY_API_KEY` est server-only (pas de préfixe
 * NEXT_PUBLIC) — elle ne doit jamais transiter côté navigateur. Le composant
 * client appelle donc cette route, qui exécute `generateMockup` côté serveur.
 *
 * Route isolée : ne touche ni au checkout, ni au panier, ni à Stripe, ni à la DB.
 * Ne throw jamais vers le client (le helper retourne toujours un fallback).
 *
 * Entrée JSON  : { designUrl: string, templateId: string }
 * Sortie JSON  : MockupResult (voir lib/integrations/mockeyai.ts)
 */

import { NextRequest, NextResponse } from "next/server";
import { generateMockup, getFallbackMockupUrl } from "@/lib/integrations/mockeyai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const designUrl = typeof body?.designUrl === "string" ? body.designUrl : "";
    const templateId = typeof body?.templateId === "string" ? body.templateId : "";

    if (!templateId) {
      return NextResponse.json(
        { url: getFallbackMockupUrl(), isFallback: true, source: "fallback", error: "templateId manquant" },
        { status: 200 },
      );
    }

    const result = await generateMockup(designUrl, templateId);
    return NextResponse.json(result, { status: 200 });
  } catch {
    // Garantie : on renvoie toujours un fallback exploitable, jamais une 500.
    return NextResponse.json(
      { url: getFallbackMockupUrl(), isFallback: true, source: "fallback", error: "Erreur serveur" },
      { status: 200 },
    );
  }
}
