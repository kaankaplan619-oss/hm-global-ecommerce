/**
 * components/hermes/StatusBadge.tsx — Badge coloré sémantique pour statuts.
 *
 * Server-safe. Utilisé pour rapports (new/read/validated/refused/to_review),
 * tâches (todo/doing/done), projets (active/paused/archived).
 */

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "muted";

const TONE_STYLES: Record<Tone, { bg: string; border: string; color: string }> = {
  neutral: { bg: "rgba(255,255,255,0.06)",   border: "rgba(255,255,255,0.10)", color: "rgba(232,230,240,0.85)" },
  info:    { bg: "rgba(84,182,210,0.12)",    border: "rgba(84,182,210,0.30)",  color: "#9ed7e8" },
  success: { bg: "rgba(74,222,128,0.10)",    border: "rgba(74,222,128,0.28)",  color: "#86efac" },
  warning: { bg: "rgba(250,204,21,0.10)",    border: "rgba(250,204,21,0.28)",  color: "#fde68a" },
  danger:  { bg: "rgba(248,113,113,0.10)",   border: "rgba(248,113,113,0.30)", color: "#fca5a5" },
  muted:   { bg: "rgba(255,255,255,0.035)",  border: "rgba(255,255,255,0.06)", color: "rgba(232,230,240,0.55)" },
};

export default function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  const s = TONE_STYLES[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium tracking-wide whitespace-nowrap"
      style={{
        background: s.bg,
        border:     `1px solid ${s.border}`,
        color:      s.color,
      }}
    >
      {label}
    </span>
  );
}

// ── Mappings exportés pour les pages ──────────────────────────────────────────

export function toneForReportStatus(
  status: "new" | "read" | "validated" | "rejected" | "to_review",
): Tone {
  switch (status) {
    case "new":        return "info";
    case "read":       return "muted";
    case "validated":  return "success";
    case "rejected":   return "danger";
    case "to_review":  return "warning";
  }
}

export function toneForTaskStatus(
  status: "todo" | "doing" | "waiting_agent" | "done",
): Tone {
  switch (status) {
    case "todo":          return "neutral";
    case "doing":         return "info";
    case "waiting_agent": return "warning";
    case "done":          return "success";
  }
}

export function toneForProjectStatus(
  status: "active" | "paused" | "archived",
): Tone {
  switch (status) {
    case "active":   return "success";
    case "paused":   return "warning";
    case "archived": return "muted";
  }
}
