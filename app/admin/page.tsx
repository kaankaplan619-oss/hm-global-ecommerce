"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const ADMIN_SECTIONS = [
  {
    href: "/admin/commandes",
    icon: Package,
    title: "Commandes",
    description: "Valider, gérer et suivre toutes les commandes",
    count: "—",
    countLabel: "à traiter",
    accent: "badge-warning",
  },
  {
    href: "/admin/clients",
    icon: Users,
    title: "Clients",
    description: "Liste et gestion des comptes clients",
    count: "—",
    countLabel: "total",
    accent: "badge-info",
  },
  {
    href: "/admin/factures",
    icon: FileText,
    title: "Factures",
    description: "Générer et suivre les factures Pennylane",
    count: "—",
    countLabel: "en attente",
    accent: "badge-warning",
  },
  {
    href: "/admin/produits",
    icon: Settings,
    title: "Produits",
    description: "Gérer le catalogue, stocks et références",
    count: "7",
    countLabel: "produits",
    accent: "badge-neutral",
  },
];

const QUICK_STATS = [
  { icon: AlertTriangle, label: "Commandes à valider", value: "—", color: "#f59e0b" },
  { icon: FileText,      label: "Fichiers à vérifier", value: "—", color: "var(--hm-primary)" },
  { icon: Clock,         label: "En attente client",   value: "—", color: "#60a5fa" },
  { icon: TrendingUp,    label: "CA ce mois (TTC)",    value: "—", color: "#22c55e" },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/connexion");
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated || !isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[var(--hm-bg)] pt-24 pb-20">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-gold">Admin</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--hm-text)]">Back-Office HM Global</h1>
          <p className="text-sm text-[var(--hm-text-soft)] mt-1">
            Bienvenue, {user.firstName}. Gérez vos commandes, clients et factures.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {QUICK_STATS.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="p-4 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} style={{ color }} />
                <span className="text-[10px] text-[var(--hm-text-soft)] uppercase tracking-wider font-semibold">
                  {label}
                </span>
              </div>
              <div className="text-2xl font-black" style={{ color }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Admin sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ADMIN_SECTIONS.map(({ href, icon: Icon, title, description, count, countLabel }) => (
            <Link
              key={href}
              href={href}
              className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)] hover:border-[var(--hm-text-soft)]/40 hover:shadow-[0_8px_24px_rgba(63,45,88,0.08)] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--hm-surface)] flex items-center justify-center group-hover:bg-[var(--hm-accent-soft-rose)] transition-colors">
                  <Icon size={18} className="text-[var(--hm-text-soft)] group-hover:text-[var(--hm-primary)] transition-colors" />
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[var(--hm-text)]">{count}</span>
                  <p className="text-[10px] text-[var(--hm-text-soft)]">{countLabel}</p>
                </div>
              </div>
              <h2 className="text-sm font-bold text-[var(--hm-text)] mb-1">{title}</h2>
              <p className="text-xs text-[var(--hm-text-soft)]">{description}</p>
            </Link>
          ))}
        </div>

        {/* Status legend */}
        <div className="mt-10 p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
          <h3 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-4">
            Statuts des commandes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Paiement reçu",      badge: "badge-info" },
              { label: "Fichier à vérifier", badge: "badge-warning" },
              { label: "En attente client",  badge: "badge-warning" },
              { label: "Validée",            badge: "badge-success" },
              { label: "En traitement",      badge: "badge-info" },
              { label: "Expédiée",           badge: "badge-success" },
              { label: "Terminée",           badge: "badge-neutral" },
              { label: "Annulée",            badge: "badge-error" },
            ].map(({ label, badge }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`badge ${badge} text-[9px]`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
