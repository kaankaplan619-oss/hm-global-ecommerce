"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Calculator,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

type QuoteStatus =
  | "new"
  | "pricing"
  | "bat_to_prepare"
  | "quote_sent"
  | "validated"
  | "refused"
  | "archived";

interface QuoteRequest {
  id: string;
  status: QuoteStatus;
  company_name: string;
  email: string;
  phone: string | null;
  need_type: string;
  quantity_range: string;
  desired_product: string | null;
  desired_technique: string;
  message: string | null;
  file_name: string | null;
  file_url: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  source: string | null;
  page_path: string | null;
  user_agent: string | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS: { value: QuoteStatus; label: string; badge: string }[] = [
  { value: "new", label: "Nouveau", badge: "badge-warning" },
  { value: "pricing", label: "À chiffrer", badge: "badge-info" },
  { value: "bat_to_prepare", label: "BAT à préparer", badge: "badge-warning" },
  { value: "quote_sent", label: "Devis envoyé", badge: "badge-info" },
  { value: "validated", label: "Validé", badge: "badge-success" },
  { value: "refused", label: "Refusé", badge: "badge-error" },
  { value: "archived", label: "Archivé", badge: "badge-neutral" },
];

const STATUS_META = Object.fromEntries(STATUS_OPTIONS.map((item) => [item.value, item])) as Record<
  QuoteStatus,
  { value: QuoteStatus; label: string; badge: string }
>;

const NEED_LABELS: Record<string, string> = {
  "tenues-entreprise": "Tenues entreprise",
  "restaurant-commerce": "Restaurant / commerce",
  "evenement-association": "Événement / association",
  "chantier-nettoyage": "Chantier / nettoyage",
  "marque-createur": "Marque / créateur",
  "erasmus-ecole": "Erasmus / école",
  "print-signaletique": "Print / signalétique",
  autre: "Autre",
};

const QUANTITY_LABELS: Record<string, string> = {
  "5-10": "5-10",
  "10-25": "10-25",
  "25-50": "25-50",
  "50-plus": "50+",
  unknown: "Je ne sais pas encore",
};

const TECHNIQUE_LABELS: Record<string, string> = {
  unknown: "Je ne sais pas",
  dtf: "DTF",
  broderie: "Broderie",
  flex: "Flex",
  print: "Print",
  autre: "Autre",
};

function labelFrom(map: Record<string, string>, value: string | null | undefined) {
  if (!value) return "Non renseigné";
  return map[value] ?? value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFileSize(value: number | null) {
  if (!value) return "";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} Ko`;
  return `${(value / 1024 / 1024).toFixed(1)} Mo`;
}

export default function AdminDevisPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [selected, setSelected] = useState<QuoteRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setError(null);
    setRefreshing(true);
    try {
      const res = await fetch("/api/quote-requests/admin", { cache: "no-store" });
      const data = (await res.json()) as { quoteRequests?: QuoteRequest[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Chargement impossible.");
      const items = data.quoteRequests ?? [];
      setRequests(items);
      setSelected((current) => {
        if (!current) return items[0] ?? null;
        return items.find((item) => item.id === current.id) ?? items[0] ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/connexion");
      return;
    }

    void loadRequests();
  }, [_hasHydrated, isAuthenticated, user, router, loadRequests]);

  const filteredRequests = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return requests.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!cleanQuery) return true;

      return [
        item.company_name,
        item.email,
        item.phone,
        item.desired_product,
        item.message,
        labelFrom(NEED_LABELS, item.need_type),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(cleanQuery));
    });
  }, [requests, query, statusFilter]);

  const statusCounts = useMemo(() => {
    return requests.reduce<Record<QuoteStatus, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {} as Record<QuoteStatus, number>);
  }, [requests]);

  const updateStatus = useCallback(async (id: string, status: QuoteStatus) => {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch("/api/quote-requests/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await res.json()) as { quoteRequest?: QuoteRequest; error?: string };
      if (!res.ok || !data.quoteRequest) throw new Error(data.error ?? "Mise à jour impossible.");

      setRequests((items) => items.map((item) => (item.id === id ? data.quoteRequest! : item)));
      setSelected((current) => (current?.id === id ? data.quoteRequest! : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const copyValue = useCallback(async (value: string | null, key: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  }, []);

  if (!_hasHydrated || !isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[var(--hm-bg)] pt-24 pb-20">
      <div className="container max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-[var(--hm-text-soft)]">
              <Link href="/admin" className="font-semibold hover:text-[var(--hm-primary)]">Admin</Link>
              <span>/</span>
              <span>Devis rapides</span>
            </div>
            <span className="badge badge-gold mb-3">Demandes entrantes</span>
            <h1 className="text-2xl font-black text-[var(--hm-text)]">Demandes de devis rapides</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--hm-text-soft)]">
              Traiter les demandes reçues depuis le formulaire, préparer le chiffrage et suivre le statut.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadRequests()}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--hm-line)] bg-white px-4 text-sm font-bold text-[var(--hm-text)] shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition hover:border-[var(--hm-primary)]/40 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--hm-text-soft)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher client, email, produit..."
              className="h-12 w-full rounded-2xl border border-[var(--hm-line)] bg-white pl-11 pr-4 text-sm text-[var(--hm-text)] outline-none transition placeholder:text-[var(--hm-text-soft)] focus:border-[var(--hm-primary)]/50"
            />
          </div>

          <div className="rounded-2xl border border-[var(--hm-line)] bg-white px-4 py-3 text-sm text-[var(--hm-text-soft)]">
            <span className="font-black text-[var(--hm-text)]">{requests.length}</span> demandes au total
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${
              statusFilter === "all"
                ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:text-[var(--hm-text)]"
            }`}
          >
            Tous ({requests.length})
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setStatusFilter(status.value)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${
                statusFilter === status.value
                  ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                  : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:text-[var(--hm-text)]"
              }`}
            >
              {status.label} ({statusCounts[status.value] ?? 0})
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-semibold text-[#b91c1c]">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <section className="space-y-3">
            {loading ? (
              [1, 2, 3].map((item) => (
                <div key={item} className="h-36 animate-pulse rounded-2xl border border-[var(--hm-line)] bg-white" />
              ))
            ) : filteredRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--hm-line)] bg-white p-10 text-center">
                <FileText size={28} className="mx-auto mb-3 text-[var(--hm-text-soft)]" />
                <h2 className="text-sm font-black text-[var(--hm-text)]">Aucune demande à afficher</h2>
                <p className="mt-1 text-xs text-[var(--hm-text-soft)]">Change le filtre ou actualise la liste.</p>
              </div>
            ) : (
              filteredRequests.map((request) => {
                const meta = STATUS_META[request.status];
                const active = selected?.id === request.id;

                return (
                  <article
                    key={request.id}
                    className={`rounded-2xl border bg-white p-4 shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition ${
                      active ? "border-[var(--hm-primary)]/45 ring-2 ring-[var(--hm-primary)]/10" : "border-[var(--hm-line)] hover:border-[var(--hm-text-soft)]/40"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <button type="button" onClick={() => setSelected(request)} className="min-w-0 text-left">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`badge ${meta.badge} text-[9px]`}>{meta.label}</span>
                          <span className="text-xs font-semibold text-[var(--hm-text-soft)]">{formatDate(request.created_at)}</span>
                        </div>
                        <h2 className="line-clamp-1 text-base font-black text-[var(--hm-text)]">
                          {request.company_name}
                        </h2>
                        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--hm-text-soft)]">
                          <span>{request.email}</span>
                          {request.phone && <span>{request.phone}</span>}
                        </p>
                      </button>

                      <div className="flex shrink-0 items-center gap-2">
                        <select
                          value={request.status}
                          disabled={updatingId === request.id}
                          onChange={(event) => void updateStatus(request.id, event.target.value as QuoteStatus)}
                          className="h-10 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 text-xs font-bold text-[var(--hm-text)] outline-none focus:border-[var(--hm-primary)]/50"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setSelected(request)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--hm-line)] px-3 text-xs font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]/40"
                        >
                          <Eye size={14} />
                          Détail
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <Info label="Besoin" value={labelFrom(NEED_LABELS, request.need_type)} />
                      <Info label="Quantité" value={labelFrom(QUANTITY_LABELS, request.quantity_range)} />
                      <Info label="Technique" value={labelFrom(TECHNIQUE_LABELS, request.desired_technique)} />
                    </div>

                    <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-[var(--hm-surface)] p-3 text-xs text-[var(--hm-text-soft)] sm:flex-row sm:items-center sm:justify-between">
                      <p className="line-clamp-2">
                        <span className="font-bold text-[var(--hm-text)]">Produit :</span>{" "}
                        {request.desired_product || "Non renseigné"}
                        {request.message ? ` — ${request.message}` : ""}
                      </p>
                      {request.file_url && (
                        <a
                          href={request.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 font-bold text-[var(--hm-primary)]"
                        >
                          Fichier
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            {selected ? (
              <DetailPanel
                request={selected}
                copied={copied}
                updating={updatingId === selected.id}
                onCopy={copyValue}
                onStatus={(status) => void updateStatus(selected.id, status)}
              />
            ) : (
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-6 text-center shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
                <ShieldCheck size={28} className="mx-auto mb-3 text-[var(--hm-text-soft)]" />
                <h2 className="text-sm font-black text-[var(--hm-text)]">Sélectionne une demande</h2>
                <p className="mt-1 text-xs text-[var(--hm-text-soft)]">Le détail complet s&apos;affichera ici.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--hm-line)] bg-white px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">{label}</p>
      <p className="mt-1 line-clamp-1 text-xs font-bold text-[var(--hm-text)]">{value}</p>
    </div>
  );
}

function DetailPanel({
  request,
  copied,
  updating,
  onCopy,
  onStatus,
}: {
  request: QuoteRequest;
  copied: string | null;
  updating: boolean;
  onCopy: (value: string | null, key: string) => Promise<void>;
  onStatus: (status: QuoteStatus) => void;
}) {
  const meta = STATUS_META[request.status];

  return (
    <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <span className={`badge ${meta.badge} text-[9px]`}>{meta.label}</span>
          <h2 className="mt-3 text-lg font-black text-[var(--hm-text)]">{request.company_name}</h2>
          <p className="mt-1 text-xs text-[var(--hm-text-soft)]">{formatDate(request.created_at)}</p>
        </div>
        <FileText size={22} className="text-[var(--hm-text-soft)]" />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void onCopy(request.email, `email-${request.id}`)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--hm-primary)] px-3 text-xs font-bold text-white transition hover:bg-[var(--hm-primary)]/90"
        >
          <Mail size={14} />
          {copied === `email-${request.id}` ? "Copié" : "Copier email"}
        </button>
        <button
          type="button"
          onClick={() => void onCopy(request.phone, `phone-${request.id}`)}
          disabled={!request.phone}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--hm-line)] px-3 text-xs font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]/40 disabled:opacity-50"
        >
          <Phone size={14} />
          {copied === `phone-${request.id}` ? "Copié" : "Copier tél."}
        </button>
      </div>

      <div className="space-y-3">
        <DetailRow label="Email" value={request.email} />
        <DetailRow label="Téléphone" value={request.phone || "Non renseigné"} />
        <DetailRow label="Type de besoin" value={labelFrom(NEED_LABELS, request.need_type)} />
        <DetailRow label="Quantité" value={labelFrom(QUANTITY_LABELS, request.quantity_range)} />
        <DetailRow label="Produit souhaité" value={request.desired_product || "Non renseigné"} />
        <DetailRow label="Technique" value={labelFrom(TECHNIQUE_LABELS, request.desired_technique)} />
        <DetailRow label="Source" value={request.source || request.page_path || "Formulaire devis rapide"} />
        <DetailRow label="Mise à jour" value={formatDate(request.updated_at)} />
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Message</p>
        <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--hm-text)]">
          {request.message || "Aucun message renseigné."}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--hm-line)] bg-white p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Fichier client</p>
        {request.file_url ? (
          <a
            href={request.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-3 text-sm font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]/40"
          >
            <span className="min-w-0">
              <span className="block truncate">{request.file_name || "Fichier uploadé"}</span>
              <span className="block text-[10px] font-semibold text-[var(--hm-text-soft)]">
                {formatFileSize(request.file_size)}
              </span>
            </span>
            <ExternalLink size={15} className="shrink-0 text-[var(--hm-primary)]" />
          </a>
        ) : (
          <p className="text-xs text-[var(--hm-text-soft)]">Aucun fichier envoyé.</p>
        )}
      </div>

      <div className="mt-5 grid gap-2">
        <ActionButton icon={Calculator} label="Marquer à chiffrer" disabled={updating} onClick={() => onStatus("pricing")} />
        <ActionButton icon={Send} label="Marquer devis envoyé" disabled={updating} onClick={() => onStatus("quote_sent")} />
        <ActionButton icon={FileText} label="BAT à préparer" disabled={updating} onClick={() => onStatus("bat_to_prepare")} />
        <div className="grid grid-cols-2 gap-2">
          <ActionButton icon={CheckCircle2} label="Validé" disabled={updating} onClick={() => onStatus("validated")} />
          <ActionButton icon={XCircle} label="Refusé" disabled={updating} onClick={() => onStatus("refused")} />
        </div>
        <ActionButton icon={Archive} label="Archiver" muted disabled={updating} onClick={() => onStatus("archived")} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--hm-line)] pb-2 last:border-b-0 last:pb-0">
      <span className="text-xs font-semibold text-[var(--hm-text-soft)]">{label}</span>
      <span className="max-w-[62%] text-right text-xs font-bold text-[var(--hm-text)]">{value}</span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  disabled,
  muted,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  disabled?: boolean;
  muted?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition disabled:opacity-55 ${
        muted
          ? "border border-[var(--hm-line)] bg-white text-[var(--hm-text)] hover:border-[var(--hm-primary)]/40"
          : "bg-[var(--hm-primary)] text-white hover:bg-[var(--hm-primary)]/90"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}
