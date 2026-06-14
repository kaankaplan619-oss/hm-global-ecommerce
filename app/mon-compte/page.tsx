"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Package,
  FileText,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getInitials } from "@/lib/utils";
import { useT } from "@/components/i18n/I18nProvider";

// ── Gradient signature HM Global ─────────────────────────────────────────────
const HM_GRADIENT = "linear-gradient(135deg, #5BC4D8, #7B4FA6, #C4387A)";

const ACCOUNT_LINKS = [
  {
    href: "/mon-compte/commandes",
    icon: Package,
    titleKey: "account.links.orders.title",
    descriptionKey: "account.links.orders.description",
    accent: "#7B4FA6",
    accentSoft: "#f3eefb",
  },
  {
    href: "/mon-compte/factures",
    icon: FileText,
    titleKey: "account.links.invoices.title",
    descriptionKey: "account.links.invoices.description",
    accent: "#5BC4D8",
    accentSoft: "#edf9fc",
  },
  {
    href: "/mon-compte/adresses",
    icon: MapPin,
    titleKey: "account.links.addresses.title",
    descriptionKey: "account.links.addresses.description",
    accent: "#C4387A",
    accentSoft: "#fdeef5",
  },
  {
    href: "/mon-compte/parametres",
    icon: Settings,
    titleKey: "account.links.settings.title",
    descriptionKey: "account.links.settings.description",
    accent: "#7B4FA6",
    accentSoft: "#f3eefb",
  },
] as const;

const IN_PROGRESS_STATUSES = new Set([
  "paiement_recu",
  "fichier_a_verifier",
  "en_attente_client",
  "validee",
  "en_traitement",
  "expediee",
]);

interface StatsData {
  total: number;
  enCours: number;
  terminees: number;
}

export default function MonComptePage() {
  const t = useT();
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated, logout } = useAuthStore();
  const [stats, setStats] = useState<StatsData>({ total: 0, enCours: 0, terminees: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) router.push("/connexion");
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        const orders: Array<{ status: string }> = data.orders ?? [];
        const active = orders.filter((o) => o.status !== "annulee");
        const terminees = active.filter((o) => o.status === "terminee").length;
        const enCours = active.filter((o) => IN_PROGRESS_STATUSES.has(o.status)).length;
        setStats({ total: active.length, enCours, terminees });
      })
      .catch(() => setStats({ total: 0, enCours: 0, terminees: 0 }))
      .finally(() => setLoadingStats(false));
  }, [_hasHydrated, isAuthenticated]);

  if (!_hasHydrated || !user) return null;

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-20 pt-24">
      <div className="container max-w-3xl">

        {/* Bouton retour au site */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e6e8ee] bg-white px-4 py-2 text-sm font-semibold text-[#3f2d58] shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-colors hover:border-[#c4c0cf] hover:text-[#7B4FA6]"
        >
          <ChevronLeft size={16} />
          {t("account.backToHome")}
        </Link>

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
                {t("account.greeting")}, {user.firstName}&nbsp;!
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
              {t("account.orderCta")}
            </Link>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {([
            { label: t("account.stats.total"), value: stats.total },
            { label: t("account.stats.inProgress"), value: stats.enCours },
            { label: t("account.stats.completed"), value: stats.terminees },
          ] as const).map(({ label, value }) => (
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
                {loadingStats ? "…" : value}
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#6e6280]">
                {label}
              </div>
            </div>
          ))}
        </div>
        {!loadingStats && stats.total === 0 && (
          <p className="mb-6 text-center text-sm text-[#6e6280]">
            {t("account.empty.text")}{" "}
            <Link href="/catalogue" className="font-semibold text-[#b13f74] hover:underline">
              {t("account.empty.link")}
            </Link>
          </p>
        )}

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {ACCOUNT_LINKS.map(({ href, icon: Icon, titleKey, descriptionKey, accent, accentSoft }) => (
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
                  {t(titleKey)}
                </p>
                <p className="text-xs text-[#6e6280]">{t(descriptionKey)}</p>
              </div>

              <ChevronRight
                size={16}
                className="shrink-0 text-[#c4c0cf] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#7B4FA6]"
              />
            </Link>
          ))}

          {/* Administration — visible uniquement pour les admins */}
          {user?.role === "admin" && (
            <div className="mt-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--hm-text-soft)]">
                {t("account.admin.heading")}
              </p>
              <Link
                href="/admin/commandes"
                className="group flex items-start gap-4 rounded-2xl border border-[var(--hm-line)] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-all duration-200 hover:border-[var(--hm-primary)]/30 hover:shadow-[0_8px_24px_rgba(63,45,88,0.08)] hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-rose)]">
                  <ShieldCheck size={20} className="text-[var(--hm-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--hm-text)]">{t("account.admin.title")}</p>
                  <p className="mt-0.5 text-sm text-[var(--hm-text-soft)]">
                    {t("account.admin.description")}
                  </p>
                </div>
                <ChevronRight size={18} className="mt-1 shrink-0 text-[var(--hm-text-soft)] group-hover:text-[var(--hm-primary)] transition-colors" />
              </Link>
            </div>
          )}

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
                {t("account.logout")}
              </p>
            </div>
          </button>
        </div>

        {/* ── Pied de page discret ───────────────────────────────────────── */}
        <p className="mt-10 text-center text-[11px] text-[#a09bb0]">
          {t("account.footer.question")}{" "}
          <Link href="/contact" className="font-semibold text-[#7B4FA6] hover:underline">
            {t("account.footer.contact")}
          </Link>
        </p>

      </div>
    </div>
  );
}
