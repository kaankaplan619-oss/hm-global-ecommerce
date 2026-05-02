"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Users, FileText, Settings,
  AlertTriangle, CheckCircle, Clock,
  TrendingUp, Truck, Factory, ShoppingCart, Eye,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  counts: Record<string, number>;
  totalRevenueTTC: number;
  monthRevenueTTC: number;
  total: number;
}

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
  icon: React.ElementType;
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

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== "admin") { router.push("/connexion"); return; }

    fetch("/api/orders/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => null)
      .finally(() => setLoadingStats(false));
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

        {/* KPIs rapides */}
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
              icon: TrendingUp,
              label: "CA ce mois (TTC)",
              value: loadingStats ? "…" : fmt(stats?.monthRevenueTTC ?? 0),
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
