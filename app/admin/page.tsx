"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Users, FileText, Settings,
  AlertTriangle, CheckCircle, Clock,
  TrendingUp, Truck, Factory, ShoppingCart, Eye,
  Wallet, Banknote, ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { classifyOrderRows, type CircuitSummary } from "@/lib/fulfillment";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  counts: Record<string, number>;
  totalRevenueTTC: number;
  monthRevenueTTC: number;
  encaisseTTC?: number;
  monthEncaisseTTC?: number;
  enAttenteTTC?: number;
  paidCount?: number;
  pendingCount?: number;
  total: number;
}

/** Ligne commande brute renvoyée par /api/orders/admin (champs utiles ici). */
interface AdminOrderRow {
  id: string;
  order_number: string;
  status: string;
  printful_order_id?: string | null;
  printful_status?: string | null;
  gelato_order_id?: string | null;
  gelato_status?: string | null;
  order_items?: { product_id?: string | null; product_name?: string | null; product_snapshot?: { printConfig?: unknown } | null }[];
}

/** Statuts clos — exclus de la vue "production par circuit". */
const CLOSED_STATUSES = new Set(["terminee", "annulee"]);

const STATUS_SHORT: Record<string, string> = {
  awaiting_bank_transfer:      "Attente virement",
  commande_a_valider:          "À valider",
  paiement_recu:               "Paiement reçu",
  fichier_a_verifier:          "Fichier à vérifier",
  bat_a_preparer:              "BAT à préparer",
  attente_validation_client:   "Attente client",
  en_attente_client:           "Attente client",
  a_commander_fournisseur:     "À commander",
  validee:                     "Validée",
  commande_fournisseur_passee: "Chez le fournisseur",
  attente_reception_textile:   "Textile en route",
  en_production:               "En production",
  en_traitement:               "En production",
  prete_a_expedier:            "Prête à expédier",
  expediee:                    "Expédiée",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function sumStatuses(counts: Record<string, number>, statuses: string[]): number {
  return statuses.reduce((acc, s) => acc + (counts[s] ?? 0), 0);
}

// ─── Dashboard cards ──────────────────────────────────────────────────────────

interface DashCard {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  count: string | number;
  countLabel: string;
  urgent?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  // Commandes actives classées par circuit (atelier / automatisé / mixte).
  const [circuitOrders, setCircuitOrders] = useState<(AdminOrderRow & { circuit: CircuitSummary })[]>([]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== "admin") { router.push("/connexion"); return; }

    fetch("/api/orders/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => null)
      .finally(() => setLoadingStats(false));

    fetch("/api/orders/admin")
      .then((r) => r.json())
      .then((data) => {
        const rows: AdminOrderRow[] = data.orders ?? [];
        setCircuitOrders(
          rows
            .filter((o) => !CLOSED_STATUSES.has(o.status))
            .map((o) => ({ ...o, circuit: classifyOrderRows(o.order_items ?? []) })),
        );
      })
      .catch(() => null);
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated || !isAuthenticated || user?.role !== "admin") return null;

  const c = stats?.counts ?? {};

  // ─ Cartes production (statuts actifs) ──────────────────────────────────────
  const PROD_CARDS: DashCard[] = [
    {
      href: "/admin/commandes?status=commande_a_valider,paiement_recu",
      icon: AlertTriangle,
      title: "À valider",
      description: "Nouvelles commandes après paiement",
      count: loadingStats ? "…" : sumStatuses(c, ["commande_a_valider", "paiement_recu"]),
      countLabel: "commandes",
      urgent: true,
    },
    {
      href: "/admin/commandes?status=fichier_a_verifier",
      icon: Eye,
      title: "Fichier à vérifier",
      description: "Logo client en attente de validation",
      count: loadingStats ? "…" : (c["fichier_a_verifier"] ?? 0),
      countLabel: "à vérifier",
      urgent: true,
    },
    {
      href: "/admin/commandes?status=bat_a_preparer",
      icon: FileText,
      title: "BAT à préparer",
      description: "Bon à tirer à envoyer au client",
      count: loadingStats ? "…" : (c["bat_a_preparer"] ?? 0),
      countLabel: "BAT en attente",
      urgent: true,
    },
    {
      href: "/admin/commandes?status=attente_validation_client,en_attente_client",
      icon: Clock,
      title: "Attente client",
      description: "En attente de réponse ou nouveau fichier",
      count: loadingStats ? "…" : sumStatuses(c, ["attente_validation_client", "en_attente_client"]),
      countLabel: "en attente",
    },
    {
      href: "/admin/commandes?status=a_commander_fournisseur,validee",
      icon: ShoppingCart,
      title: "À commander",
      description: "Commandes fournisseur à passer manuellement",
      count: loadingStats ? "…" : sumStatuses(c, ["a_commander_fournisseur", "validee"]),
      countLabel: "à commander",
      urgent: true,
    },
    {
      href: "/admin/commandes?status=commande_fournisseur_passee,attente_reception_textile",
      icon: Package,
      title: "En transit",
      description: "Commande fournisseur passée — textile en route",
      count: loadingStats ? "…" : sumStatuses(c, ["commande_fournisseur_passee", "attente_reception_textile"]),
      countLabel: "en transit",
    },
    {
      href: "/admin/commandes?status=en_production,en_traitement",
      icon: Factory,
      title: "En production",
      description: "Marquage / personnalisation en cours",
      count: loadingStats ? "…" : sumStatuses(c, ["en_production", "en_traitement"]),
      countLabel: "en cours",
    },
    {
      href: "/admin/commandes?status=prete_a_expedier",
      icon: Truck,
      title: "Prêtes à expédier",
      description: "Production terminée, à emballer et expédier",
      count: loadingStats ? "…" : (c["prete_a_expedier"] ?? 0),
      countLabel: "prêtes",
      urgent: true,
    },
    {
      href: "/admin/commandes?status=expediee",
      icon: Truck,
      title: "Expédiées",
      description: "En cours de livraison",
      count: loadingStats ? "…" : (c["expediee"] ?? 0),
      countLabel: "expédiées",
    },
    {
      href: "/admin/commandes?status=terminee",
      icon: CheckCircle,
      title: "Terminées",
      description: "Commandes livrées et clôturées",
      count: loadingStats ? "…" : (c["terminee"] ?? 0),
      countLabel: "terminées",
    },
  ];

  // ─ Sections back-office ────────────────────────────────────────────────────
  const SECTIONS = [
    {
      href: "/admin/commandes",
      icon: Package,
      title: "Toutes les commandes",
      description: "Vue production complète — filtres, BAT, fournisseur",
      count: loadingStats ? "…" : (stats?.total ?? "—"),
      countLabel: "total",
    },
    {
      href: "/admin/devis",
      icon: FileText,
      title: "Devis rapides",
      description: "Demandes entrantes, statut, fichier client",
      count: "—",
      countLabel: "à traiter",
    },
    {
      href: "/admin/clients",
      icon: Users,
      title: "Clients",
      description: "Liste et gestion des comptes clients",
      count: "—",
      countLabel: "total",
    },
    {
      href: "/admin/factures",
      icon: FileText,
      title: "Factures",
      description: "Générer et suivre les factures Pennylane",
      count: "—",
      countLabel: "en attente",
    },
    {
      href: "/admin/produits",
      icon: Settings,
      title: "Produits",
      description: "Gérer le catalogue, stocks et références",
      count: "7",
      countLabel: "produits",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--hm-bg)] pt-24 pb-20">
      <div className="container max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-gold">Admin</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--hm-text)]">Back-Office HM Global</h1>
          <p className="text-sm text-[var(--hm-text-soft)] mt-1">
            Bienvenue{user.firstName ? `, ${user.firstName}` : ""}. Tableau de pilotage production.
          </p>
        </div>

        {/* ── Trésorerie (encaissé / en attente) ─────────────────────────── */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Trésorerie</h2>
          <a
            href="https://dashboard.stripe.com/payments"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--hm-primary)] hover:underline"
          >
            Voir sur Stripe <ExternalLink size={11} />
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Wallet,
              label: "Encaissé (total)",
              value: loadingStats ? "…" : fmt(stats?.encaisseTTC ?? stats?.totalRevenueTTC ?? 0),
              sub: loadingStats ? "" : `${stats?.paidCount ?? 0} commande${(stats?.paidCount ?? 0) > 1 ? "s" : ""} payée${(stats?.paidCount ?? 0) > 1 ? "s" : ""}`,
              color: "#16a34a",
            },
            {
              icon: TrendingUp,
              label: "Encaissé ce mois",
              value: loadingStats ? "…" : fmt(stats?.monthEncaisseTTC ?? stats?.monthRevenueTTC ?? 0),
              sub: "TTC · mois en cours",
              color: "#22c55e",
            },
            {
              icon: Clock,
              label: "En attente d'encaissement",
              value: loadingStats ? "…" : fmt(stats?.enAttenteTTC ?? 0),
              sub: loadingStats ? "" : `${stats?.pendingCount ?? 0} commande${(stats?.pendingCount ?? 0) > 1 ? "s" : ""} en attente`,
              color: "#f59e0b",
            },
            {
              icon: Banknote,
              label: "Total commandes",
              value: loadingStats ? "…" : (stats?.total ?? 0),
              sub: "hors annulées",
              color: "var(--hm-primary)",
            },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="p-4 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color }} />
                <span className="text-[10px] text-[var(--hm-text-soft)] uppercase tracking-wider font-semibold leading-tight">{label}</span>
              </div>
              <div className="text-2xl font-black" style={{ color }}>{value}</div>
              {sub && <p className="mt-1 text-[10px] text-[var(--hm-text-muted)]">{sub}</p>}
            </div>
          ))}
        </div>

        {/* KPIs rapides */}
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">À traiter</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: AlertTriangle,
              label: "À valider / vérifier",
              value: loadingStats ? "…" : sumStatuses(c, ["commande_a_valider", "paiement_recu", "fichier_a_verifier"]),
              color: "#f59e0b",
            },
            {
              icon: ShoppingCart,
              label: "À commander fournisseur",
              value: loadingStats ? "…" : sumStatuses(c, ["a_commander_fournisseur", "validee"]),
              color: "var(--hm-primary)",
            },
            {
              icon: Factory,
              label: "En production",
              value: loadingStats ? "…" : sumStatuses(c, ["en_production", "en_traitement"]),
              color: "#60a5fa",
            },
            {
              icon: Truck,
              label: "Prêtes / à expédier",
              value: loadingStats ? "…" : sumStatuses(c, ["prete_a_expedier", "expediee"]),
              color: "#22c55e",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="p-4 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} style={{ color }} />
                <span className="text-[10px] text-[var(--hm-text-soft)] uppercase tracking-wider font-semibold leading-tight">{label}</span>
              </div>
              <div className="text-2xl font-black" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── Production par circuit ─────────────────────────────────────────
             Vision Kaan : d'un coup d'œil, séparer ce que JE dois produire à
             l'atelier de ce qui est géré automatiquement par les fournisseurs
             POD. Une commande MIXTE (articles atelier + articles POD) apparaît
             dans LES DEUX colonnes — les circuits cohabitent. */}
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
          Production par circuit
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">

          {/* 🖨️ À produire à l'atelier */}
          <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
            <div className="flex items-center gap-2 mb-1">
              <Factory size={15} className="text-[var(--hm-primary)]" />
              <h3 className="text-sm font-black text-[var(--hm-text)]">À produire à l&apos;atelier</h3>
              <span className="ml-auto rounded-full bg-[var(--hm-accent-soft-rose)] px-2.5 py-0.5 text-xs font-black text-[var(--hm-primary)]">
                {circuitOrders.filter((o) => o.circuit.hasInterne).length}
              </span>
            </div>
            <p className="mb-3 text-[10px] text-[var(--hm-text-soft)]">
              Stock interne, Falk&amp;Ross, TopTex — marquage et expédition par vous.
            </p>
            <div className="flex flex-col gap-1.5">
              {circuitOrders.filter((o) => o.circuit.hasInterne).slice(0, 6).map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/commandes/${o.id}`}
                  className="flex items-center gap-2 rounded-xl border border-[var(--hm-line)] px-3 py-2 text-xs transition hover:border-[var(--hm-primary)]/40 hover:bg-[var(--hm-surface)]"
                >
                  <span className="font-mono font-bold text-[var(--hm-text)]">#{o.order_number}</span>
                  {o.circuit.circuit === "mixte" && (
                    <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Mixte</span>
                  )}
                  <span className="truncate text-[10px] text-[var(--hm-text-soft)]">
                    {(o.order_items ?? []).map((i) => i.product_name).filter(Boolean).join(", ")}
                  </span>
                  <span className="ml-auto shrink-0 rounded-full bg-[var(--hm-surface)] px-2 py-0.5 text-[9px] font-semibold text-[var(--hm-text-soft)]">
                    {STATUS_SHORT[o.status] ?? o.status}
                  </span>
                </Link>
              ))}
              {circuitOrders.filter((o) => o.circuit.hasInterne).length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--hm-line)] px-3 py-3 text-center text-[10px] text-[var(--hm-text-muted)]">
                  Rien à produire à l&apos;atelier — tout roule. 🎉
                </p>
              )}
            </div>
          </div>

          {/* 🤖 Géré automatiquement (Printful / Gelato) */}
          <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
            <div className="flex items-center gap-2 mb-1">
              <Package size={15} className="text-[#7c3aed]" />
              <h3 className="text-sm font-black text-[var(--hm-text)]">Géré automatiquement</h3>
              <span className="ml-auto rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-black text-[#7c3aed]">
                {circuitOrders.filter((o) => o.circuit.hasPrintful || o.circuit.hasGelato).length}
              </span>
            </div>
            <p className="mb-3 text-[10px] text-[var(--hm-text-soft)]">
              Printful / Gelato impriment et expédient — vous validez, ils produisent.
            </p>
            <div className="flex flex-col gap-1.5">
              {circuitOrders.filter((o) => o.circuit.hasPrintful || o.circuit.hasGelato).slice(0, 6).map((o) => {
                const supplierId = o.printful_order_id ?? o.gelato_order_id;
                const supplierStatus = o.printful_order_id ? o.printful_status : o.gelato_status;
                const supplierName = o.circuit.hasPrintful ? "Printful" : "Gelato";
                const supplierUrl = o.printful_order_id
                  ? `https://www.printful.com/dashboard/default/orders/${o.printful_order_id}`
                  : o.gelato_order_id
                  ? `https://dashboard.gelato.com/orders/${o.gelato_order_id}`
                  : null;
                return (
                  <div
                    key={o.id}
                    className="flex items-center gap-2 rounded-xl border border-[var(--hm-line)] px-3 py-2 text-xs"
                  >
                    <Link href={`/admin/commandes/${o.id}`} className="font-mono font-bold text-[var(--hm-text)] hover:text-[var(--hm-primary)]">
                      #{o.order_number}
                    </Link>
                    {o.circuit.circuit === "mixte" && (
                      <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Mixte</span>
                    )}
                    <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold text-[#7c3aed]">{supplierName}</span>
                    {supplierId ? (
                      <>
                        <span className="text-[10px] text-[var(--hm-text-soft)]">{supplierStatus ?? "créée"}</span>
                        {supplierUrl && (
                          <a
                            href={supplierUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[var(--hm-primary)] hover:underline"
                          >
                            Suivre <ExternalLink size={10} />
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="ml-auto shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                        ⚠ Brouillon fournisseur à créer
                      </span>
                    )}
                  </div>
                );
              })}
              {circuitOrders.filter((o) => o.circuit.hasPrintful || o.circuit.hasGelato).length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--hm-line)] px-3 py-3 text-center text-[10px] text-[var(--hm-text-muted)]">
                  Aucune commande POD active.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Production pipeline */}
        <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-4">
          Suivi production
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {PROD_CARDS.map(({ href, icon: Icon, title, description, count, countLabel, urgent }) => (
            <Link
              key={href}
              href={href}
              className={`p-4 rounded-2xl border transition-all group hover:shadow-[0_8px_24px_rgba(63,45,88,0.08)] hover:-translate-y-0.5
                ${urgent && Number(count) > 0
                  ? "bg-[var(--hm-accent-soft-rose)] border-[var(--hm-rose)]/20 hover:border-[var(--hm-rose)]/40"
                  : "bg-white border-[var(--hm-line)] hover:border-[var(--hm-text-soft)]/40"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon
                  size={14}
                  className={urgent && Number(count) > 0 ? "text-[var(--hm-rose)]" : "text-[var(--hm-text-soft)]"}
                />
                {urgent && Number(count) > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--hm-rose)] animate-pulse" />
                )}
              </div>
              <div className={`text-xl font-black mb-0.5 ${urgent && Number(count) > 0 ? "text-[var(--hm-rose)]" : "text-[var(--hm-text)]"}`}>
                {count}
              </div>
              <p className="text-[10px] font-bold text-[var(--hm-text)] leading-tight mb-0.5">{title}</p>
              <p className="text-[9px] text-[var(--hm-text-soft)] leading-tight hidden sm:block">{description}</p>
              <p className="text-[9px] text-[var(--hm-text-soft)] mt-0.5">{countLabel}</p>
            </Link>
          ))}
        </div>

        {/* Sections back-office */}
        <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-4">
          Back-office
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {SECTIONS.map(({ href, icon: Icon, title, description, count, countLabel }) => (
            <Link
              key={href}
              href={href}
              className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)] hover:border-[var(--hm-text-soft)]/40 hover:shadow-[0_8px_24px_rgba(63,45,88,0.08)] transition-all group hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--hm-surface)] flex items-center justify-center group-hover:bg-[var(--hm-accent-soft-rose)] transition-colors">
                  <Icon size={18} className="text-[var(--hm-text-soft)] group-hover:text-[var(--hm-primary)] transition-colors" />
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[var(--hm-text)]">{count}</span>
                  <p className="text-[10px] text-[var(--hm-text-soft)]">{countLabel}</p>
                </div>
              </div>
              <h3 className="text-sm font-bold text-[var(--hm-text)] mb-1">{title}</h3>
              <p className="text-xs text-[var(--hm-text-soft)]">{description}</p>
            </Link>
          ))}
        </div>

        {/* Légende statuts */}
        <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
          <h3 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-4">
            Workflow statuts — ordre de production
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "À valider",           badge: "badge-warning" },
              { label: "Fichier à vérifier",  badge: "badge-warning" },
              { label: "BAT à préparer",      badge: "badge-warning" },
              { label: "Attente client",       badge: "badge-info" },
              { label: "À commander",          badge: "badge-warning" },
              { label: "Cmd fournisseur",      badge: "badge-info" },
              { label: "Attente textile",      badge: "badge-info" },
              { label: "En production",        badge: "badge-info" },
              { label: "Prête à expédier",     badge: "badge-success" },
              { label: "Expédiée",             badge: "badge-success" },
              { label: "Terminée",             badge: "badge-neutral" },
              { label: "Annulée",              badge: "badge-error" },
            ].map(({ label, badge }) => (
              <span key={label} className={`badge ${badge} text-[9px]`}>{label}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
