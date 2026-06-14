"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  RefreshCw,
  Mail,
  Phone,
  ExternalLink,
  ReceiptText,
  Undo2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

type ReqStatus = "nouveau" | "en_cours" | "traite" | "refuse";
type ReqType = "facture" | "remboursement";

interface OrderRequest {
  id: string;
  order_id: string;
  type: ReqType;
  status: ReqStatus;
  reason: string | null;
  contact_email: string | null;
  internal_note: string | null;
  created_at: string;
  orders: {
    order_number: string;
    total_ttc: number;
    status: string;
    profiles: { first_name: string | null; last_name: string | null; email: string | null; phone: string | null } | null;
  } | null;
}

const STATUS_OPTIONS: { value: ReqStatus; label: string; badge: string }[] = [
  { value: "nouveau", label: "Nouvelle", badge: "badge-warning" },
  { value: "en_cours", label: "En cours", badge: "badge-info" },
  { value: "traite", label: "Traitée", badge: "badge-success" },
  { value: "refuse", label: "Refusée", badge: "badge-error" },
];
const STATUS_META = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s])) as Record<
  ReqStatus,
  { value: ReqStatus; label: string; badge: string }
>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminDemandesPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReqStatus | "all">("all");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/order-requests/admin", { cache: "no-store" });
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/connexion");
      return;
    }
    loadRequests();
  }, [_hasHydrated, isAuthenticated, user, router, loadRequests]);

  const updateRequest = async (id: string, patch: { status?: ReqStatus; internalNote?: string }) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...(patch.status ? { status: patch.status } : {}), ...(patch.internalNote !== undefined ? { internal_note: patch.internalNote } : {}) } : r)),
    );
    try {
      await fetch("/api/order-requests/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
    } catch {
      /* optimiste : on recharge en cas de doute */
      loadRequests();
    }
  };

  if (!_hasHydrated || !isAuthenticated || user?.role !== "admin") return null;

  const shown = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen bg-[#f8f9fb] pt-24 pb-20">
      <div className="container max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge badge-gold mb-3">Dossiers clients</span>
            <h1 className="text-2xl font-black text-[var(--hm-text)]">Demandes facture / remboursement</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs font-semibold text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)]">
              ← Tableau de bord
            </Link>
            <button onClick={loadRequests} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hm-text)] hover:border-[var(--hm-primary)]">
              <RefreshCw size={13} /> Rafraîchir
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-5 flex flex-wrap gap-2">
          {(["all", "nouveau", "en_cours", "traite", "refuse"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f ? "bg-[var(--hm-primary)] text-white" : "bg-white border border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
              }`}
            >
              {f === "all" ? "Toutes" : STATUS_META[f].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl border border-[var(--hm-line)] bg-white" />
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-10 text-center text-sm text-[var(--hm-text-soft)]">
            <FileText size={28} className="mx-auto mb-3 text-[var(--hm-text-muted)]" />
            Aucune demande pour ce filtre.
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((r) => {
              const meta = STATUS_META[r.status] ?? STATUS_META.nouveau;
              const p = r.orders?.profiles;
              const clientName = [p?.first_name, p?.last_name].filter(Boolean).join(" ") || (r.contact_email ?? "—");
              return (
                <div key={r.id} className="rounded-2xl border border-[var(--hm-line)] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f3eefb] px-2.5 py-1 text-xs font-bold text-[var(--hm-primary)]">
                        {r.type === "facture" ? <ReceiptText size={13} /> : <Undo2 size={13} />}
                        {r.type === "facture" ? "Facture" : "Remboursement"}
                      </span>
                      <span className={`badge ${meta.badge}`}>{meta.label}</span>
                    </div>
                    <span className="text-[11px] text-[var(--hm-text-muted)]">{formatDate(r.created_at)}</span>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="text-xs text-[var(--hm-text-soft)]">
                      <p className="font-semibold text-[var(--hm-text)]">{clientName}</p>
                      {p?.email && <p className="flex items-center gap-1 mt-0.5"><Mail size={11} /> {p.email}</p>}
                      {p?.phone && <p className="flex items-center gap-1 mt-0.5"><Phone size={11} /> {p.phone}</p>}
                    </div>
                    <div className="text-xs text-[var(--hm-text-soft)] sm:text-right">
                      {r.orders && (
                        <Link href={`/admin/commandes/${r.order_id}`} className="inline-flex items-center gap-1 font-mono font-bold text-[var(--hm-text)] hover:text-[var(--hm-primary)]">
                          #{r.orders.order_number} <ExternalLink size={11} />
                        </Link>
                      )}
                      {r.orders && (
                        <p className="mt-0.5">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(r.orders.total_ttc)}</p>
                      )}
                    </div>
                  </div>

                  {r.reason && (
                    <p className="mt-3 rounded-xl bg-[#f8f9fb] px-3 py-2 text-xs text-[var(--hm-text-soft)]">
                      « {r.reason} »
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--hm-line)] pt-3">
                    <label className="text-[11px] font-semibold text-[var(--hm-text-muted)]">Statut</label>
                    <select
                      value={r.status}
                      onChange={(e) => updateRequest(r.id, { status: e.target.value as ReqStatus })}
                      className="rounded-lg border border-[var(--hm-line)] bg-white px-2 py-1 text-xs text-[var(--hm-text)] outline-none focus:border-[var(--hm-primary)]"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <input
                      defaultValue={r.internal_note ?? ""}
                      placeholder="Note interne…"
                      onBlur={(e) => { if (e.target.value !== (r.internal_note ?? "")) updateRequest(r.id, { internalNote: e.target.value }); }}
                      className="min-w-0 flex-1 rounded-lg border border-[var(--hm-line)] bg-white px-2 py-1 text-xs text-[var(--hm-text)] outline-none focus:border-[var(--hm-primary)]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
