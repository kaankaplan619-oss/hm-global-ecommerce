import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import PageHeader from "@/components/hermes/PageHeader";
import Card from "@/components/hermes/Card";
import StatusBadge, { toneForProjectStatus } from "@/components/hermes/StatusBadge";
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_REPORTS } from "@/lib/hermes/mock-data";
import { PROJECT_CATEGORY_LABELS } from "@/lib/hermes/types";

export const metadata = {
  title: "Projets",
};

export default function HermesProjectsPage() {
  const projects = [...MOCK_PROJECTS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  // Pré-calcul comptes par projet (mock)
  const openTaskCountByProject: Record<string, number> = {};
  const reportCountByProject: Record<string, number> = {};
  const lastReportByProject: Record<string, string> = {};
  for (const t of MOCK_TASKS) {
    if (t.projectId && t.status !== "done") openTaskCountByProject[t.projectId] = (openTaskCountByProject[t.projectId] ?? 0) + 1;
  }
  for (const r of [...MOCK_REPORTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    if (r.projectId) reportCountByProject[r.projectId] = (reportCountByProject[r.projectId] ?? 0) + 1;
    if (r.projectId && !lastReportByProject[r.projectId]) lastReportByProject[r.projectId] = r.title;
  }

  return (
    <>
      <PageHeader
        eyebrow="Espaces de travail"
        title="Projets"
        description="Espaces de suivi pour voir rapidement objectif, missions, tâches ouvertes et dernier retour IA."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id}>
            <div className="px-5 py-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      background: "rgba(84,182,210,0.10)",
                      color:      "#9ed7e8",
                    }}
                  >
                    <Layers size={14} strokeWidth={1.8} />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold text-white leading-tight">
                      {p.name}
                    </div>
                    <div className="text-[10.5px] uppercase tracking-[0.18em] text-white/40 mt-0.5">
                      {PROJECT_CATEGORY_LABELS[p.category]}
                    </div>
                  </div>
                </div>
                <StatusBadge
                  label={p.status === "active" ? "Actif" : p.status === "paused" ? "Pause" : "Archivé"}
                  tone={toneForProjectStatus(p.status)}
                />
              </div>

              <p className="line-clamp-2 text-[12.5px] text-white/60 leading-6">
                {p.objective}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-white/50">
                <Metric label="Missions" value={reportCountByProject[p.id] ?? 0} />
                <Metric label="Tâches ouvertes" value={openTaskCountByProject[p.id] ?? 0} />
              </div>

              <div className="mt-4 rounded-lg px-3 py-2" style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Dernier rapport</p>
                <p className="mt-1 line-clamp-1 text-[11.5px] text-white/62">
                  {lastReportByProject[p.id] ?? "Aucun rapport pour le moment"}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-white/45">
                <span>Maj {new Date(p.updatedAt).toLocaleDateString("fr-FR")}</span>
                <span className="text-white/20">·</span>
                <span className="line-clamp-1">{p.description}</span>
              </div>

              <Link
                href="/hermes/tasks"
                className="mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11.5px] font-medium transition hover:text-white"
                style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,230,240,0.72)" }}
              >
                Ouvrir
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-[11.5px] text-white/35 text-center">
        En V2 : page projet dédiée avec rapports + tâches + mémoire filtrés.
      </p>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="text-[16px] font-semibold tabular-nums text-white">{value}</div>
      <div className="mt-0.5 text-[10.5px] text-white/38">{label}</div>
    </div>
  );
}
