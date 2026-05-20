"use client";

/**
 * components/hermes/InboxClient.tsx — Liste filtrable des rapports IA.
 *
 * Filtre par statut côté client (état local). Le tableau de rapports vient en
 * props depuis le server component parent (page.tsx) qui lit les mocks.
 *
 * Actions V1 : Copier (clipboard), Valider, Refuser, Créer tâche.
 * Les 3 dernières sont en local-state seulement (pas de persistance V2).
 */

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, ListTodo, Eye } from "lucide-react";
import type { HermesReport, ReportSource, ReportStatus } from "@/lib/hermes/types";
import { AGENT_LABELS, REPORT_SOURCE_LABELS, REPORT_STATUS_LABELS } from "@/lib/hermes/types";
import Card from "@/components/hermes/Card";
import StatusBadge, { toneForReportStatus } from "@/components/hermes/StatusBadge";
import CopyButton from "@/components/hermes/CopyButton";

type StatusFilter = "all" | ReportStatus;
type SourceFilter = "all" | ReportSource;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all",       label: "Tous" },
  { value: "new",       label: "Nouveaux" },
  { value: "to_review", label: "À revoir" },
  { value: "validated", label: "Validés" },
  { value: "rejected",  label: "Refusés" },
  { value: "read",      label: "Lus" },
];

const SOURCE_FILTERS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "claude-code", label: "Claude Code" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "discord", label: "Discord" },
  { value: "manuel", label: "Manuel" },
];

export default function InboxClient({ reports }: { reports: HermesReport[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [localStatus, setLocalStatus] = useState<Record<string, ReportStatus>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reports
      .map((r) => ({ ...r, status: localStatus[r.id] ?? r.status }))
      .filter((r) => filter === "all" || r.status === filter)
      .filter((r) => sourceFilter === "all" || r.source === sourceFilter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reports, filter, sourceFilter, localStatus]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: reports.length,
      new: 0, read: 0, validated: 0, rejected: 0, to_review: 0,
    };
    for (const r of reports) {
      const s = localStatus[r.id] ?? r.status;
      c[s] += 1;
    }
    return c;
  }, [reports, localStatus]);

  return (
    <>
      <div className="mb-6 space-y-3">
        <FilterRow label="Agent / source">
          {SOURCE_FILTERS.map((f) => (
            <FilterButton
              key={f.value}
              active={sourceFilter === f.value}
              label={f.label}
              onClick={() => setSourceFilter(f.value)}
              tone="cyan"
            />
          ))}
        </FilterRow>
        <FilterRow label="Statut">
          {FILTERS.map((f) => (
            <FilterButton
              key={f.value}
              active={filter === f.value}
              label={f.label}
              count={counts[f.value]}
              onClick={() => setFilter(f.value)}
              tone="pink"
            />
          ))}
        </FilterRow>
      </div>

      {/* ── List ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center text-[13px] text-white/45">
            Aucun rapport pour ce filtre.
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const open = openId === report.id;
            return (
              <Card key={report.id}>
                <div className="px-5 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                          {REPORT_SOURCE_LABELS[report.source]}
                        </span>
                        <span className="text-white/20">·</span>
                        {report.agentId && (
                          <>
                            <span className="text-[10.5px] text-white/45">
                              {AGENT_LABELS[report.agentId]}
                            </span>
                            <span className="text-white/20">·</span>
                          </>
                        )}
                        <span className="text-[10.5px] text-white/45">
                          {new Date(report.createdAt).toLocaleString("fr-FR", {
                            day:    "2-digit",
                            month:  "short",
                            hour:   "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <h3 className="text-[14px] font-semibold text-white mb-1.5 leading-snug">
                        {report.title}
                      </h3>
                      <p className="line-clamp-1 text-[12.5px] text-white/58 leading-5">
                        {report.summary}
                      </p>
                    </div>
                    <StatusBadge
                      label={REPORT_STATUS_LABELS[report.status]}
                      tone={toneForReportStatus(report.status)}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ActionPill
                      icon={<CheckCircle2 size={12} />}
                      label="Valider"
                      tone="success"
                      onClick={() => setLocalStatus((s) => ({ ...s, [report.id]: "validated" }))}
                    />
                    <ActionPill
                      icon={<XCircle size={12} />}
                      label="Refuser"
                      tone="danger"
                      onClick={() => setLocalStatus((s) => ({ ...s, [report.id]: "rejected" }))}
                    />
                    <ActionPill
                      icon={<ListTodo size={12} />}
                      label="Créer tâche"
                      tone="info"
                      onClick={() => alert(`Tâche créée à partir de : ${report.title}\n(V1 : action en local — Supabase en V2)`)}
                    />
                    <CopyButton text={`${report.title}\n\n${report.summary}\n\n${report.body}`} />
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : report.id)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium text-white/55 transition hover:text-white"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <Eye size={12} />
                      {open ? "Masquer" : "Voir contenu"}
                    </button>
                  </div>

                  {open && (
                    <div
                      className="mt-4 rounded-lg p-4 text-[12.5px] leading-6 text-white/75 whitespace-pre-wrap"
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        border:     "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {report.body}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-28 shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/35">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
  tone,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  tone: "cyan" | "pink";
}) {
  const activeColor = tone === "cyan" ? "#9ed7e8" : "#f9c9dd";
  const activeBg = tone === "cyan" ? "rgba(84,182,210,0.16)" : "rgba(177,63,116,0.18)";
  const activeBorder = tone === "cyan" ? "rgba(84,182,210,0.40)" : "rgba(177,63,116,0.40)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium transition"
      style={{
        background: active ? activeBg : "rgba(255,255,255,0.04)",
        border: active ? `1px solid ${activeBorder}` : "1px solid rgba(255,255,255,0.08)",
        color: active ? activeColor : "rgba(232,230,240,0.78)",
      }}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="text-[10.5px] tabular-nums" style={{ color: active ? `${activeColor}aa` : "rgba(232,230,240,0.45)" }}>
          {count}
        </span>
      )}
    </button>
  );
}

function ActionPill({
  icon,
  label,
  tone,
  onClick,
}: {
  icon:    React.ReactNode;
  label:   string;
  tone:    "success" | "danger" | "info";
  onClick: () => void;
}) {
  const styles = {
    success: { bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.28)",  color: "#86efac" },
    danger:  { bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.30)", color: "#fca5a5" },
    info:    { bg: "rgba(84,182,210,0.10)",  border: "rgba(84,182,210,0.28)",  color: "#9ed7e8" },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition"
      style={{
        background: styles.bg,
        border:     `1px solid ${styles.border}`,
        color:      styles.color,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
