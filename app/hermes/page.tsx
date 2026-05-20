import Link from "next/link";
import { ArrowRight, Inbox, CheckSquare, FolderKanban, Sparkles, Send, ListChecks } from "lucide-react";
import PageHeader from "@/components/hermes/PageHeader";
import Card from "@/components/hermes/Card";
import StatusBadge, { toneForReportStatus, toneForTaskStatus } from "@/components/hermes/StatusBadge";
import {
  MOCK_PROJECTS,
  MOCK_REPORTS,
  MOCK_TASKS,
  MOCK_MEMORY,
} from "@/lib/hermes/mock-data";
import { REPORT_SOURCE_LABELS, REPORT_STATUS_LABELS, TASK_STATUS_LABELS } from "@/lib/hermes/types";

export const metadata = {
  title: "Dashboard",
};

export default function HermesDashboardPage() {
  const reportsToProcess = MOCK_REPORTS.filter((r) => r.status === "new" || r.status === "to_review");
  const openTasks      = MOCK_TASKS.filter((t) => t.status !== "done");
  const activeProjects = MOCK_PROJECTS.filter((p) => p.status === "active");

  const recentReports = [...MOCK_REPORTS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const urgentTasks = MOCK_TASKS
    .filter((t) => t.status !== "done" && (t.priority === "P1" || t.priority === "P2"))
    .sort((a, b) => (a.priority ?? "P3").localeCompare(b.priority ?? "P3"))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Cockpit"
        title="Bonjour Kaan."
        description="Pilote les agents IA, traite les rapports et ouvre les prochaines actions sans lire des murs de texte."
      />

      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <QuickAction
          href="/hermes/missions"
          icon={<Send size={16} />}
          title="Nouvelle mission IA"
          text="Décrire un besoin, obtenir le brief."
          accent="#9ed7e8"
        />
        <QuickAction
          href="/hermes/inbox"
          icon={<Inbox size={16} />}
          title="Voir rapports à traiter"
          text={`${reportsToProcess.length} rapport(s) à décider.`}
          accent="#fde68a"
        />
        <QuickAction
          href="/hermes/tasks"
          icon={<ListChecks size={16} />}
          title="Voir tâches prioritaires"
          text="P1 et P2, une ligne par action."
          accent="#f9c9dd"
        />
      </div>

      {/* ── KPI tiles ──────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <KpiTile
          icon={<Inbox size={16} strokeWidth={1.8} />}
          label="Rapports à traiter"
          value={reportsToProcess.length}
          subline="Nouveaux ou à revoir"
          href="/hermes/inbox"
          accent="#9ed7e8"
        />
        <KpiTile
          icon={<CheckSquare size={16} strokeWidth={1.8} />}
          label="Tâches ouvertes"
          value={openTasks.length}
          subline="Hors terminé"
          href="/hermes/tasks"
          accent="#f9c9dd"
        />
        <KpiTile
          icon={<FolderKanban size={16} strokeWidth={1.8} />}
          label="Projets actifs"
          value={activeProjects.length}
          subline="Espaces de suivi"
          href="/hermes/projects"
          accent="#86efac"
        />
        <KpiTile
          icon={<Sparkles size={16} strokeWidth={1.8} />}
          label="Mémoires utiles"
          value={MOCK_MEMORY.length}
          subline="Règles et décisions"
          href="/hermes/memory"
          accent="#fde68a"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Rapports récents ───────────────────────────────── */}
        <Card>
          <SectionHeader
            title="Rapports récents"
            href="/hermes/inbox"
            cta="Voir l'inbox"
          />
          <ul className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {recentReports.map((report) => (
              <li key={report.id} className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-white truncate">{report.title}</p>
                    <p className="mt-1 text-[11px] text-white/42">
                      Source : {REPORT_SOURCE_LABELS[report.source]}
                    </p>
                  </div>
                  <StatusBadge
                    label={REPORT_STATUS_LABELS[report.status]}
                    tone={toneForReportStatus(report.status)}
                  />
                  <div className="hidden sm:flex items-center gap-1.5">
                    <SmallLink href="/hermes/inbox" label="Voir" />
                    <SmallLink href="/hermes/inbox" label="Valider" />
                    <SmallLink href="/hermes/tasks" label="Créer tâche" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* ── Tâches prioritaires ────────────────────────────── */}
        <Card>
          <SectionHeader
            title="Tâches prioritaires"
            href="/hermes/tasks"
            cta="Voir toutes"
          />
          <ul className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {urgentTasks.map((task) => (
              <li key={task.id} className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {task.priority && (
                        <span
                          className="text-[10px] font-bold tracking-wider"
                          style={{
                            color: task.priority === "P1" ? "#fca5a5" : "rgba(232,230,240,0.55)",
                          }}
                        >
                          {task.priority}
                        </span>
                      )}
                      <span className="text-[12.5px] font-medium text-white truncate">
                        {task.title}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-white/42 line-clamp-1">
                      {task.nextAction ?? "Ouvrir la tâche"}
                    </p>
                  </div>
                  <StatusBadge
                    label={TASK_STATUS_LABELS[task.status]}
                    tone={toneForTaskStatus(task.status)}
                  />
                  <SmallLink href="/hermes/tasks" label="Ouvrir" />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-10 text-[11.5px] text-white/35 text-center">
        Données mockées · V1 · Branchement Supabase prévu en V2.
      </p>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuickAction({
  href,
  icon,
  title,
  text,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="px-4 py-3.5 transition group-hover:translate-y-[-1px]">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}33` }}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{title}</p>
            <p className="mt-0.5 text-[11.5px] text-white/45 truncate">{text}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SmallLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium text-white/65 transition hover:text-white"
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {label}
    </Link>
  );
}

function KpiTile({
  icon,
  label,
  value,
  subline,
  href,
  accent,
}: {
  icon:    React.ReactNode;
  label:   string;
  value:   number | string;
  subline: string;
  href:    string;
  accent:  string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="px-5 py-4 transition group-hover:translate-y-[-1px]">
        <div className="flex items-center gap-2 mb-3" style={{ color: accent }}>
          {icon}
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/45">
            {label}
          </span>
        </div>
        <div className="text-3xl font-semibold text-white tracking-tight tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-[11.5px] text-white/45">{subline}</div>
      </Card>
    </Link>
  );
}

function SectionHeader({
  title,
  href,
  cta,
}: {
  title: string;
  href:  string;
  cta:   string;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 border-b"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <h3 className="text-[14px] font-semibold text-white">{title}</h3>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-white/55 hover:text-white transition"
      >
        {cta}
        <ArrowRight size={11} />
      </Link>
    </div>
  );
}
