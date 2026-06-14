import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/analytics — Agrégats de mesure pour le dashboard admin.
 * Admin-only. Lit `analytics_events` (service role) sur 30 jours et renvoie :
 * totaux visites/visiteurs, visites par jour (14j), top pages, compteurs
 * d'événements. Agrégation en JS (volume V1 faible).
 */

type Row = { event_type: string; path: string | null; session_id: string; created_at: string };

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const svc = await createSupabaseServiceClient();
  const dayMs = 24 * 3600 * 1000;
  const now = Date.now();
  const since30 = new Date(now - 30 * dayMs).toISOString();

  const { data, error } = await svc
    .from("analytics_events")
    .select("event_type, path, session_id, created_at")
    .gte("created_at", since30)
    .order("created_at", { ascending: false })
    .limit(50000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Row[];
  const pv = rows.filter((r) => r.event_type === "pageview");

  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const t0 = startToday.getTime();
  const t7 = now - 7 * dayMs;
  const at = (r: Row) => new Date(r.created_at).getTime();
  const uniq = (arr: Row[]) => new Set(arr.map((r) => r.session_id)).size;

  const daily: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dStart = t0 - i * dayMs;
    const dEnd = dStart + dayMs;
    daily.push({
      date: new Date(dStart).toISOString().slice(0, 10),
      count: pv.filter((r) => at(r) >= dStart && at(r) < dEnd).length,
    });
  }

  const pathCounts: Record<string, number> = {};
  for (const r of pv) if (r.path) pathCounts[r.path] = (pathCounts[r.path] ?? 0) + 1;
  const topPaths = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([path, count]) => ({ path, count }));

  const eventCounts: Record<string, number> = {};
  for (const r of rows) eventCounts[r.event_type] = (eventCounts[r.event_type] ?? 0) + 1;

  return NextResponse.json({
    totals: {
      visitsToday: pv.filter((r) => at(r) >= t0).length,
      visits7:     pv.filter((r) => at(r) >= t7).length,
      visits30:    pv.length,
      visitors7:   uniq(pv.filter((r) => at(r) >= t7)),
      visitors30:  uniq(pv),
    },
    daily,
    topPaths,
    eventCounts,
    sampleSize: rows.length,
  });
}
