import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/track — Collecte d'événements de mesure (first-party, RGPD).
 *
 * Appelée UNIQUEMENT côté client si le consentement « analytics » est donné
 * (cf. AnalyticsTracker). Écrit dans `analytics_events` via service role.
 * Aucune donnée personnelle : `sessionId` = UUID anonyme de navigateur.
 *
 * Ne renvoie jamais d'erreur bloquante au client (204) : la mesure ne doit
 * jamais dégrader l'expérience.
 */

const MAX_TYPE = 60;
const MAX_STR  = 512;
const TYPE_RE  = /^[a-z0-9_]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return new NextResponse(null, { status: 204 });

    const { type, path, referrer, meta, sessionId } = body as {
      type?: string; path?: string; referrer?: string; meta?: unknown; sessionId?: string;
    };

    if (!type || typeof type !== "string" || type.length > MAX_TYPE || !TYPE_RE.test(type)) {
      return new NextResponse(null, { status: 204 });
    }
    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 64) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = await createSupabaseServiceClient();
    await supabase.from("analytics_events").insert({
      session_id: sessionId,
      event_type: type,
      path:       typeof path === "string" ? path.slice(0, MAX_STR) : null,
      referrer:   typeof referrer === "string" ? referrer.slice(0, MAX_STR) : null,
      meta:       meta && typeof meta === "object" ? meta : null,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[track]", err);
    return new NextResponse(null, { status: 204 });
  }
}
