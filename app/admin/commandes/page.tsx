"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, RefreshCw, Filter } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import type { OrderStatus } from "@/types";
import { getSupplierInfo, supplierBadge } from "@/lib/supplierMap";

// ─── Statuts ──────────────────────────────────────────────────────────────────

export const STATUS_META: Record<OrderStatus, { label: string; badge: string; group: "urgent" | "active" | "done" | "cancelled" }> = {
  // Legacy
  paiement_recu:      { label: "Paiement reçu",        badge: "badge-warning", group: "urgent" },
  fichier_a_verifier: { label: "Fichier à vérifier",    badge: "badge-warning", group: "urgent" },
  en_attente_client:  { label: "En attente client",     badge: "badge-info",    group: "active" },
  validee:            { label: "Validée",               badge: "badge-success", group: "active" },
  en_traitement:      { label: "En traitement",         badge: "badge-info",    group: "active" },
  expediee:           { label: "Expédiée",              badge: "badge-success", group: "active" },
  terminee:           { label: "Terminée",              badge: "badge-neutral", group: "done" },
  annulee:            { label: "Annulée",               badge: "badge-error",   group: "cancelled" },
  // Nouveau workflow
  commande_a_valider:          { label: "À valider",              badge: "badge-warning", group: "urgent" },
  bat_a_preparer:              { label: "BAT à préparer",         badge: "badge-warning", group: "urgent" },
  attente_validation_client:   { label: "Attente validation",     badge: "badge-info",    group: "active" },
  a_commander_fournisseur:     { label: "À commander",            badge: "badge-warning", group: "urgent" },
  commande_fournisseur_passee: { label: "Cmd fournisseur passée", badge: "badge-info",    group: "active" },
  attente_reception_textile:   { label: "Attente textile",        badge: "badge-info",    group: "active" },
  en_production:               { label: "En production",          badge: "badge-info",    group: "active" },
  prete_a_expedier:            { label: "Prête à expédier",       badge: "badge-success", group: "urgent" },
};

function getNextAction(status: OrderStatus): string {
  switch (status) {
    case "paiement_recu":
    case "commande_a_valider":          return "Valider la commande";
    case "fichier_a_verifier":          return "Vérifier le fichier logo";
    case "bat_a_preparer":              return "Préparer le BAT";
    case "en_attente_client":
    case "attente_validation_client":   return "Attendre le client";
    case "validee":
    case "a_commander_fournisseur":     return "Commander chez fournisseur";
    case "commande_fournisseur_passee": return "Attendre réception";
    case "attente_reception_textile":   return "Réceptionner les textiles";
    case "en_traitement":
    case "en_production":               return "Suivre la production";
    case "prete_a_expedier":            return "Expédier la commande";
    case "expediee":                    return "Confirmer livraison";
    case "terminee":                    return "Terminée ✓";
    case "annulee":                     return "Annulée";
    default:                            return "—";
  }
}

function getBatRequired(items: RawItem[]): "required" | "recommended" | "no" {
  const totalQty = (items ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0);
  const hasBroderie = (items ?? []).some((i) => i.technique === "broderie");
  if (totalQty >= 20) return "required";
  if (hasBroderie) return "recommended";
  return "no";
}

// ─── Types raw API ────────────────────────────────────────────────────────────

interface RawItem {
  id: string;
  product_name?: string;
  product_reference?: string;
  quantity: number;
  size?: string;
  color_label?: string;
  technique?: string;
  placement?: string;
  logo_file_url?: string;
  logo_file_status?: string;
  logo_effect?: string;
  bat_ref?: string;
  total_ttc?: number;
  product_snapshot?: Record<string, unknown>;
}

interface RawOrder {
  id: string;
  order_number?: string;
  status: OrderStatus;
  total_ttc?: number;
  stripe_payment_status?: string;
  paid_at?: string;
  created_at?: string;
  admin_note?: string;
  supplier_mode?: string;
  profiles?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    type?: string;
    company?: string;
  } | null;
  order_items?: RawItem[];
}

// ─── Filtres statuts groupés ──────────────────────────────────────────────────

const FILTER_GROUPS = [
  {
    label: "Urgences",
    statuses: ["commande_a_valider", "paiement_recu", "fichier_a_verifier", "bat_a_preparer", "a_commander_fournisseur", "prete_a_expedier"] as OrderStatus[],
  },
  {
    label: "En cours",
    statuses: ["en_attente_client", "attente_validation_client", "commande_fournisseur_passee", "attente_reception_textile", "en_production", "en_traitement", "expediee", "validee"] as OrderStatus[],
  },
  {
    label: "Clôturées",
    statuses: ["terminee", "annulee"] as OrderStatus[],
  },
];

const FOURNISSEUR_FILTERS = [
  { value: "toptex",    label: "TopTex" },
  { value: "falkross",  label: "Falk&Ross" },
  { value: "autre",     label: "Autre" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminCommandesPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "urgent" | "all">("all");
  const [search, setSearch] = useState("");
  const [filterBAT, setFilterBAT] = useState(false);
  const [filterFichier, setFilterFichier] = useState(false);
  const [filterFournisseur, setFilterFournisseur] = useState<string>("all");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/admin");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== "admin") { router.push("/connexion"); return; }
    // Lire status depuis l'URL (ex: /admin/commandes?status=fichier_a_verifier)
    const params = new URLSearchParams(window.location.search);
    const s = params.get("status");
    if (s) setFilter(s as OrderStatus);
    loadOrders();
  }, [_hasHydrated, isAuthenticated, user, router, loadOrders]);

  if (!_hasHydrated || !isAuthenticated || user?.role !== "admin") return null;

  // ─ Filtrage ────────────────────────────────────────────────────────────────

  const filtered = orders.filter((o) => {
    const items = o.order_items ?? [];
    const profile = o.profiles ?? {};

    // Filtre statut
    if (filter === "urgent") {
      const urgentStatuses: OrderStatus[] = [
        "commande_a_valider", "paiement_recu", "fichier_a_verifier",
        "bat_a_preparer", "a_commander_fournisseur", "prete_a_expedier",
      ];
      if (!urgentStatuses.includes(o.status)) return false;
    } else if (filter !== "all") {
      // Supporte statuts multiples séparés par virgule (liens dashboard)
      const filterStatuses = filter.split(",") as OrderStatus[];
      if (!filterStatuses.includes(o.status)) return false;
    }

    // Filtre BAT
    if (filterBAT && getBatRequired(items) === "no") return false;

    // Filtre fichier à vérifier
    if (filterFichier && !items.some((i) => i.logo_file_status === "en_attente")) return false;

    // Filtre fournisseur
    if (filterFournisseur !== "all") {
      const refs = items.map((i) => {
        const snap = (i.product_snapshot ?? {}) as Record<string, string>;
        return getSupplierInfo({ ...snap, reference: i.product_reference });
      });
      if (!refs.some((r) => r.supplier === filterFournisseur)) return false;
    }

    // Recherche texte
    if (search) {
      const q = search.toLowerCase();
      const num = (o.order_number ?? "").toLowerCase();
      const email = (profile.email ?? "").toLowerCase();
      const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.toLowerCase();
      const ref = items.map((i) => (i.product_reference ?? "").toLowerCase()).join(" ");
      if (!num.includes(q) && !email.includes(q) && !name.includes(q) && !ref.includes(q)) return false;
    }

    return true;
  });

  // ─ Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--hm-bg)] pt-24 pb-20">
      <div className="container max-w-6xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] mb-6">
          <Link href="/admin" className="hover:text-[var(--hm-text)]">Admin</Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">Commandes</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-[var(--hm-text)]">
            Commandes
            {filter !== "all" && (
              <span className="ml-2 text-base font-normal text-[var(--hm-text-soft)]">
                — {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              </span>
            )}
          </h1>
          <button onClick={loadOrders} className="btn-ghost gap-2 text-xs">
            <RefreshCw size={12} />
            Actualiser
          </button>
        </div>

        {/* ─ Filtres ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-5">

          {/* Recherche */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-48">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hm-text-soft)]" />
              <input
                type="text"
                placeholder="N° commande, email, nom, référence produit..."
                className="input pl-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filtres statuts */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-[10px] font-semibold rounded-full border transition-colors
                ${filter === "all" ? "border-[var(--hm-primary)] text-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]" : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-text-soft)]/40"}`}
            >
              Tout ({orders.length})
            </button>
            <button
              onClick={() => setFilter("urgent")}
              className={`px-3 py-1.5 text-[10px] font-semibold rounded-full border transition-colors
                ${filter === "urgent" ? "border-[var(--hm-rose)] text-[var(--hm-rose)] bg-[var(--hm-accent-soft-rose)]" : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-text-soft)]/40"}`}
            >
              🔴 Urgences
            </button>

            {FILTER_GROUPS.map((group) => (
              <span key={group.label} className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-[var(--hm-text-soft)] uppercase tracking-wider self-center">{group.label}</span>
                {group.statuses.map((s) => {
                  const count = orders.filter((o) => o.status === s).length;
                  const meta = STATUS_META[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-colors
                        ${filter === s ? "border-[var(--hm-primary)] text-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]" : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-text-soft)]/40"}`}
                    >
                      {meta.label} {count > 0 && `(${count})`}
                    </button>
                  );
                })}
              </span>
            ))}
          </div>

          {/* Filtres secondaires */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter size={11} className="text-[var(--hm-text-soft)]" />
            <button
              onClick={() => setFilterFichier(!filterFichier)}
              className={`px-3 py-1 text-[10px] font-semibold rounded-full border transition-colors
                ${filterFichier ? "border-amber-400 text-amber-600 bg-amber-50" : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-text-soft)]/40"}`}
            >
              Fichier en attente
            </button>
            <button
              onClick={() => setFilterBAT(!filterBAT)}
              className={`px-3 py-1 text-[10px] font-semibold rounded-full border transition-colors
                ${filterBAT ? "border-blue-400 text-blue-600 bg-blue-50" : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-text-soft)]/40"}`}
            >
              BAT requis/recommandé
            </button>
            {FOURNISSEUR_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterFournisseur(filterFournisseur === value ? "all" : value)}
                className={`px-3 py-1 text-[10px] font-semibold rounded-full border transition-colors
                  ${filterFournisseur === value ? "border-[var(--hm-primary)] text-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]" : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-text-soft)]/40"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ─ Liste ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--hm-text-soft)] text-sm">Aucune commande pour ce filtre</p>
            <button onClick={() => { setFilter("all"); setSearch(""); setFilterBAT(false); setFilterFichier(false); setFilterFournisseur("all"); }} className="btn-ghost mt-4 text-xs">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((order) => {
              const items = order.order_items ?? [];
              const profile = order.profiles ?? {};
              const meta = STATUS_META[order.status] ?? { label: order.status, badge: "badge-neutral", group: "active" };
              const isUrgent = meta.group === "urgent";
              const itemCount = items.length;
              const totalQty = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
              const batReq = getBatRequired(items);
              const hasFileToCheck = items.some((i) => i.logo_file_status === "en_attente");
              const hasLogo = items.some((i) => i.logo_file_url);
              const nextAction = getNextAction(order.status);
              const stripeOk = order.stripe_payment_status === "succeeded";

              // Fournisseur principal (premier item)
              const firstItem = items[0];
              const firstSnap = ((firstItem?.product_snapshot ?? {}) as Record<string, string>);
              const supplierInfo = firstItem
                ? getSupplierInfo({ ...firstSnap, reference: firstItem.product_reference })
                : null;

              return (
                <Link
                  key={order.id}
                  href={`/admin/commandes/${order.id}`}
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-all group shadow-[0_2px_8px_rgba(63,45,88,0.04)] hover:shadow-[0_8px_24px_rgba(63,45,88,0.08)] hover:-translate-y-0.5
                    ${isUrgent
                      ? "bg-[var(--hm-accent-soft-rose)] border-[var(--hm-rose)]/20 hover:border-[var(--hm-rose)]/40"
                      : "bg-white border-[var(--hm-line)] hover:border-[var(--hm-text-soft)]/40"
                    }`}
                >
                  {/* Urgence dot */}
                  {isUrgent && (
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--hm-rose)] animate-pulse shrink-0" />
                  )}

                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1.5">

                      {/* Col 1 — N° + date */}
                      <div>
                        <p className="text-xs font-mono font-bold text-[var(--hm-text)]">
                          #{order.order_number ?? "—"}
                        </p>
                        <p className="text-[9px] text-[var(--hm-text-soft)]">
                          {order.created_at && !isNaN(new Date(order.created_at).getTime())
                            ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(order.created_at))
                            : "—"}
                        </p>
                        {/* Paiement */}
                        <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                          stripeOk ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                        }`}>
                          {stripeOk ? "Payé ✓" : order.stripe_payment_status ?? "—"}
                        </span>
                      </div>

                      {/* Col 2 — Client */}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--hm-text)] truncate">
                          {profile.first_name ?? ""} {profile.last_name ?? ""}
                          {!profile.first_name && !profile.last_name && "—"}
                        </p>
                        <p className="text-[9px] text-[var(--hm-text-soft)] truncate">{profile.email ?? "—"}</p>
                        {profile.company && (
                          <p className="text-[9px] text-[var(--hm-text-soft)] truncate">{profile.company}</p>
                        )}
                      </div>

                      {/* Col 3 — Statut + action */}
                      <div>
                        <span className={`badge ${meta.badge} text-[9px]`}>{meta.label}</span>
                        <p className="text-[9px] text-[var(--hm-text-soft)] mt-0.5 leading-tight">{nextAction}</p>
                      </div>

                      {/* Col 4 — Articles + fournisseur */}
                      <div>
                        <p className="text-[10px] text-[var(--hm-text)]">
                          {itemCount} article{itemCount > 1 ? "s" : ""} · {totalQty} pièce{totalQty > 1 ? "s" : ""}
                        </p>
                        {supplierInfo && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-[var(--hm-surface)] rounded text-[9px] font-semibold text-[var(--hm-text-soft)]">
                            {supplierBadge(supplierInfo.supplier)}
                          </span>
                        )}
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {hasLogo && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              hasFileToCheck ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                            }`}>
                              {hasFileToCheck ? "Fichier à vérifier" : "Fichier OK"}
                            </span>
                          )}
                          {batReq !== "no" && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              batReq === "required" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-600"
                            }`}>
                              {batReq === "required" ? "BAT requis" : "BAT conseillé"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Col 5 — Prix */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--hm-primary)]">
                          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(order.total_ttc ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={14} className="text-[var(--hm-text-soft)] shrink-0 self-center group-hover:text-[var(--hm-text)] mt-1" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
