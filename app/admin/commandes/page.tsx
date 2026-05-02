"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Filter, Search, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import type { Order, OrderStatus } from "@/types";

const STATUS_LABELS: Record<OrderStatus, { label: string; badge: string }> = {
  paiement_recu:      { label: "Paiement reçu", badge: "badge-info" },
  fichier_a_verifier: { label: "Fichier à vérifier", badge: "badge-warning" },
  en_attente_client:  { label: "En attente client", badge: "badge-warning" },
  validee:            { label: "Validée", badge: "badge-success" },
  en_traitement:      { label: "En traitement", badge: "badge-info" },
  expediee:           { label: "Expédiée", badge: "badge-success" },
  terminee:           { label: "Terminée", badge: "badge-neutral" },
  annulee:            { label: "Annulée", badge: "badge-error" },
};

const STATUS_PRIORITY: OrderStatus[] = [
  "fichier_a_verifier",
  "en_attente_client",
  "paiement_recu",
  "validee",
  "en_traitement",
  "expediee",
  "terminee",
  "annulee",
];

export default function AdminCommandesPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== "admin") { router.push("/connexion"); return; }
    loadOrders();
  }, [_hasHydrated, isAuthenticated, user, router]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/admin");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  };

  if (!_hasHydrated || !isAuthenticated || user?.role !== "admin") return null;

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
        !o.user.email.toLowerCase().includes(search.toLowerCase()) &&
        !`${o.user.firstName} ${o.user.lastName}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--hm-bg)] pt-24 pb-20">
      <div className="container max-w-5xl">
        {/* Header */}
        <nav className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] mb-6">
          <Link href="/admin" className="hover:text-[var(--hm-text)]">Admin</Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">Commandes</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-[var(--hm-text)]">Commandes</h1>
          <button onClick={loadOrders} className="btn-ghost gap-2 text-xs">
            <RefreshCw size={12} />
            Actualiser
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hm-text-soft)]" />
            <input
              type="text"
              placeholder="N° commande, email, nom..."
              className="input pl-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-[10px] font-semibold rounded-full border transition-colors
                ${filter === "all" ? "border-[var(--hm-primary)] text-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]" : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-text-soft)]/40"}`}
            >
              Tous ({orders.length})
            </button>
            {["paiement_recu", "fichier_a_verifier", "en_attente_client", "validee"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as OrderStatus)}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-full border transition-colors
                  ${filter === s ? "border-[var(--hm-primary)] text-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]" : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-text-soft)]/40"}`}
              >
                {STATUS_LABELS[s as OrderStatus].label} ({orders.filter((o) => o.status === s).length})
              </button>
            ))}
          </div>
        </div>

        {/* Orders table */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--hm-text-soft)] text-sm">Aucune commande{filter !== "all" ? " pour ce statut" : ""}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((order) => {
              const statusInfo = STATUS_LABELS[order.status];
              const isUrgent = order.status === "fichier_a_verifier" || order.status === "en_attente_client";

              return (
                <Link
                  key={order.id}
                  href={`/admin/commandes/${order.id}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group shadow-[0_2px_8px_rgba(63,45,88,0.04)] hover:shadow-[0_8px_24px_rgba(63,45,88,0.08)]
                    ${isUrgent
                      ? "bg-[var(--hm-accent-soft-rose)] border-[var(--hm-rose)]/20 hover:border-[var(--hm-rose)]/40"
                      : "bg-white border-[var(--hm-line)] hover:border-[var(--hm-text-soft)]/40"
                    }`}
                >
                  {isUrgent && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--hm-rose)] animate-pulse shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs font-mono font-bold text-[var(--hm-text)]">#{order.orderNumber}</p>
                      <p className="text-[10px] text-[var(--hm-text-soft)]">
                        {order.createdAt && !isNaN(new Date(order.createdAt).getTime())
                          ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(order.createdAt))
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--hm-text)] truncate">{order.user.firstName} {order.user.lastName}</p>
                      <p className="text-[10px] text-[var(--hm-text-soft)] truncate">{order.user.email}</p>
                    </div>
                    <div>
                      <span className={`badge ${statusInfo.badge} text-[9px]`}>{statusInfo.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--hm-primary)]">
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(order.totalTTC)}
                      </p>
                      <p className="text-[10px] text-[var(--hm-text-soft)]">{order.items.length} article{order.items.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[var(--hm-text-soft)] shrink-0 group-hover:text-[var(--hm-text)]" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
