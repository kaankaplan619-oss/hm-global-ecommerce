"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, BarChart3, Users, Eye, MousePointerClick } from "lucide-react";

type Stats = {
  totals: { visitsToday: number; visits7: number; visits30: number; visitors7: number; visitors30: number };
  daily: { date: string; count: number }[];
  topPaths: { path: string; count: number }[];
  eventCounts: Record<string, number>;
  sampleSize: number;
};

const EVENT_LABELS: Record<string, string> = {
  pageview:      "Pages vues",
  add_to_cart:   "Ajouts au panier",
  begin_checkout:"Débuts de commande",
  purchase:      "Achats",
  click_tel:     "Clics téléphone",
  click_email:   "Clics email",
  configurator:  "Configurateur ouvert",
  logo_upload:   "Logos déposés",
  devis_submit:  "Devis envoyés",
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "Accès réservé à l'admin." : `Erreur ${r.status}`);
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const maxDaily = stats ? Math.max(1, ...stats.daily.map((d) => d.count)) : 1;
  const maxPath = stats ? Math.max(1, ...stats.topPaths.map((p) => p.count)) : 1;

  return (
    <div className="min-h-screen bg-[var(--hm-bg)] pt-24 pb-20">
      <div className="container max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Link href="/admin" className="btn-outline text-xs gap-1.5">
            <ArrowLeft size={14} /> Tableau de bord
          </Link>
          <Link href="/admin/commandes" className="btn-ghost text-xs gap-1.5">
            <LayoutDashboard size={14} /> Commandes
          </Link>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <BarChart3 size={20} className="text-[var(--hm-primary)]" />
          <h1 className="text-xl font-black text-[var(--hm-text)]">Statistiques du site</h1>
        </div>
        <p className="mb-6 text-xs text-[var(--hm-text-soft)]">
          30 derniers jours · données <strong>anonymes</strong> (visiteurs ayant accepté la mesure d&apos;audience). RGPD-conforme.
        </p>

        {loading && <p className="text-sm text-[var(--hm-text-soft)]">Chargement…</p>}
        {error && (
          <div className="rounded-xl border border-[var(--hm-rose)]/30 bg-[var(--hm-accent-soft-rose)] p-4 text-sm text-[var(--hm-rose)]">
            {error}
          </div>
        )}

        {stats && (
          <>
            {stats.sampleSize === 0 && (
              <div className="mb-6 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4 text-sm text-[var(--hm-text-soft)]">
                Aucune donnée pour l&apos;instant. La mesure démarre dès que des visiteurs acceptent les cookies
                (et après déploiement). Les chiffres apparaîtront ici automatiquement.
              </div>
            )}

            {/* KPI cards */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Eye,   label: "Visites aujourd'hui", value: stats.totals.visitsToday },
                { icon: Eye,   label: "Visites · 7 j",        value: stats.totals.visits7 },
                { icon: Eye,   label: "Visites · 30 j",       value: stats.totals.visits30 },
                { icon: Users, label: "Visiteurs uniques · 30 j", value: stats.totals.visitors30 },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-[var(--hm-line)] bg-white p-4 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]">
                    <Icon size={15} />
                  </div>
                  <p className="text-2xl font-black tabular-nums text-[var(--hm-text)]">{value}</p>
                  <p className="text-[11px] text-[var(--hm-text-soft)]">{label}</p>
                </div>
              ))}
            </div>

            {/* Daily bar chart */}
            <div className="mb-8 rounded-2xl border border-[var(--hm-line)] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                Visites par jour (14 jours)
              </h2>
              <div className="flex h-40 items-end gap-1.5">
                {stats.daily.map((d) => (
                  <div key={d.date} className="group flex flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[9px] font-semibold text-[var(--hm-text-soft)] opacity-0 group-hover:opacity-100">{d.count}</span>
                    <div
                      className="w-full rounded-t bg-[var(--hm-primary)]/80 transition-all"
                      style={{ height: `${Math.max(2, (d.count / maxDaily) * 100)}%` }}
                      title={`${d.date} · ${d.count} visites`}
                    />
                    <span className="text-[8px] text-[var(--hm-text-muted)]">{d.date.slice(8)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Top pages */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
                <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Pages les plus vues</h2>
                {stats.topPaths.length === 0 ? (
                  <p className="text-xs text-[var(--hm-text-muted)]">—</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {stats.topPaths.map((p) => (
                      <div key={p.path} className="flex items-center gap-2">
                        <span className="w-40 shrink-0 truncate font-mono text-[11px] text-[var(--hm-text)]" title={p.path}>{p.path}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--hm-surface)]">
                          <div className="h-full rounded-full bg-[var(--hm-primary)]/70" style={{ width: `${(p.count / maxPath) * 100}%` }} />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums text-[var(--hm-text-soft)]">{p.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Event counts */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
                <h2 className="mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  <MousePointerClick size={13} /> Actions mesurées
                </h2>
                {Object.keys(stats.eventCounts).length === 0 ? (
                  <p className="text-xs text-[var(--hm-text-muted)]">—</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {Object.entries(stats.eventCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between border-b border-[var(--hm-line)] pb-1.5 text-sm last:border-0">
                        <span className="text-[var(--hm-text)]">{EVENT_LABELS[type] ?? type}</span>
                        <span className="font-bold tabular-nums text-[var(--hm-primary)]">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
