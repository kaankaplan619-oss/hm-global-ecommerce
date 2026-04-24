"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Package,
  FileText,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getInitials } from "@/lib/utils";

// ── Gradient signature HM Global ─────────────────────────────────────────────
const HM_GRADIENT = "linear-gradient(135deg, #5BC4D8, #7B4FA6, #C4387A)";

const ACCOUNT_LINKS = [
  {
    href: "/mon-compte/commandes",
    icon: Package,
    title: "Mes commandes",
    description: "Suivez l'état de vos commandes en cours et passées",
    accent: "#7B4FA6",
    accentSoft: "#f3eefb",
  },
  {
    href: "/mon-compte/factures",
    icon: FileText,
    title: "Mes factures",
    description: "Téléchargez vos factures et justificatifs",
    accent: "#5BC4D8",
    accentSoft: "#edf9fc",
  },
  {
    href: "/mon-compte/adresses",
    icon: MapPin,
    title: "Mes adresses",
    description: "Gérez vos adresses de facturation et livraison",
    accent: "#C4387A",
    accentSoft: "#fdeef5",
  },
  {
    href: "/mon-compte/parametres",
    icon: Settings,
    title: "Paramètres",
    description: "Modifiez vos informations personnelles",
    accent: "#7B4FA6",
    accentSoft: "#f3eefb",
  },
];

const STATS = [
  { label: "Commandes", value: "—" },
  { label: "En cours",  value: "—" },
  { label: "Terminées", value: "—" },
];

export default function MonComptePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push("/connexion");
  }, [isAuthenticated, router]);

  if (!user) return null;

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-20 pt-24">
      <div className="container max-w-3xl">

        {/* ── En-tête profil ─────────────────────────────────────────────── */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_8px_24px_rgba(63,45,88,0.06)]">
          {/* Bandeau gradient subtil */}
          <div className="h-2 w-full" style={{ background: HM_GRADIENT }} />

          <div className="flex items-center gap-5 p-6">
            {/* Avatar avec gradient */}
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-black text-white shadow-[0_4px_16px_rgba(123,79,166,0.30)]"
              style={{ background: HM_GRADIENT }}
            >
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-black text-[#3f2d58]">
                Bonjour, {user.firstName}&nbsp;!
              </h1>
              <p className="text-sm text-[#6e6280]">{user.email}</p>
              {user.type === "entreprise" && user.company && (
                <span className="badge badge-info mt-1">{user.company}</span>
              )}
            </div>

            <Link
              href="/catalogue"
              className="btn-primary hidden gap-2 text-xs sm:flex"
            >
              <ShoppingBag size={14} />
              Commander
            </Link>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {STATS.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-[#e6e8ee] bg-white p-4 text-center shadow-[0_4px_12px_rgba(63,45,88,0.04)]"
            >
              <div
                className="text-2xl font-black"
                style={{
                  background: HM_GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {value}
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#6e6280]">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {ACCOUNT_LINKS.map(({ href, icon: Icon, title, description, accent, accentSoft }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-[#e6e8ee] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-all duration-200 hover:border-[#c4c0cf] hover:shadow-[0_8px_24px_rgba(63,45,88,0.08)] hover:-translate-y-0.5"
            >
              {/* Icône */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200"
                style={{
                  backgroundColor: accentSoft,
                  borderColor: `${accent}22`,
                }}
              >
                <Icon
                  size={18}
                  style={{ color: accent }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#3f2d58] group-hover:text-[#7B4FA6] transition-colors">
                  {title}
                </p>
                <p className="text-xs text-[#6e6280]">{description}</p>
              </div>

              <ChevronRight
                size={16}
                className="shrink-0 text-[#c4c0cf] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#7B4FA6]"
              />
            </Link>
          ))}

          {/* Déconnexion */}
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="group flex w-full items-center gap-4 rounded-2xl border border-[#e6e8ee] bg-white p-5 text-left shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-all duration-200 hover:border-[#fecaca] hover:shadow-[0_8px_24px_rgba(248,113,113,0.08)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#fecaca22] bg-[#fef2f2] transition-colors duration-200 group-hover:border-[#fecaca55] group-hover:bg-[#fee2e2]">
              <LogOut size={18} className="text-[#f87171]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#6e6280] transition-colors group-hover:text-[#ef4444]">
                Se déconnecter
              </p>
            </div>
          </button>
        </div>

        {/* ── Pied de page discret ───────────────────────────────────────── */}
        <p className="mt-10 text-center text-[11px] text-[#a09bb0]">
          Une question ?{" "}
          <Link href="/contact" className="font-semibold text-[#7B4FA6] hover:underline">
            Contactez-nous
          </Link>
        </p>

      </div>
    </div>
  );
}
