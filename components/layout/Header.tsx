"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, User, Menu, X, ChevronDown, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/I18nProvider";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

// Menu réduit aux catégories qui ont réellement des produits (Sacs & Enfants
// masqués tant qu'ils sont vides). Les libellés passent par les clés i18n.
const NAV_ITEMS = [
  {
    labelKey: "nav.textile",
    href: "/catalogue",
    children: [
      { labelKey: "nav.tshirts",       href: "/catalogue/tshirts" },
      { labelKey: "nav.hoodies",       href: "/catalogue/hoodies" },
      { labelKey: "nav.polos",         href: "/catalogue/polos" },
      { labelKey: "nav.caps",          href: "/catalogue/casquettes" },
      { labelKey: "nav.goodies",       href: "/catalogue/goodies" },
      { labelKey: "nav.seeAllTextile", href: "/catalogue" },
    ],
  },
  {
    labelKey: "nav.print",
    href: "/impression",
    children: [
      { labelKey: "nav.businessCards", href: "/impression#business-cards" },
      { labelKey: "nav.flyers",        href: "/impression#flyer" },
      { labelKey: "nav.posters",       href: "/impression#poster" },
      { labelKey: "nav.canvas",        href: "/impression#canvas" },
      { labelKey: "nav.seeAllPrint",   href: "/impression" },
    ],
  },
  { labelKey: "nav.techniques", href: "/techniques" },
  { labelKey: "nav.businesses", href: "/entreprises" },
  { labelKey: "nav.work",       href: "/realisations" },
  { labelKey: "nav.about",      href: "/a-propos" },
  { labelKey: "nav.contact",    href: "/contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { toggleCart, getTotalItems } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const t = useT();

  // ── Hydration guard ──────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    useCartStore.persist.rehydrate();
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-[rgba(63,45,88,0.08)] bg-white/88 shadow-[0_16px_40px_rgba(63,45,88,0.08)] backdrop-blur-xl"
          : "border-b border-transparent bg-white/64 backdrop-blur-md"
      )}
    >
      <div className="container">
        <div className="mx-auto flex h-[4.35rem] max-w-[1180px] items-center justify-between gap-3 md:h-[4.9rem] md:gap-5">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo/hm-global-logo.png"
              alt="HM Global Agence"
              width={240}
              height={64}
              priority
              className="h-9 w-auto md:h-10"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center px-2 lg:flex">
            <div className="flex max-w-[760px] items-center rounded-full border border-[rgba(63,45,88,0.08)] bg-white/92 px-2 py-1 shadow-[0_10px_24px_rgba(63,45,88,0.05)] backdrop-blur-md">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.labelKey}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.labelKey)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 rounded-full px-3 py-2 text-[11px] font-semibold tracking-[0.04em] text-[var(--hm-text-soft)] transition-colors hover:bg-[rgba(177,63,116,0.08)] hover:text-[var(--hm-rose)]"
                >
                  {t(item.labelKey)}
                  {item.children && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform",
                        openDropdown === item.labelKey && "rotate-180"
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && openDropdown === item.labelKey && (
                  <div className="absolute left-0 top-full w-60 pt-3">
                    <div className="overflow-hidden rounded-[1.35rem] border border-[rgba(63,45,88,0.08)] bg-white/98 shadow-[0_24px_50px_rgba(63,45,88,0.13)]">
                      {item.children.map((child, idx, arr) => (
                        <Link
                          key={child.labelKey}
                          href={child.href}
                          className={cn(
                            "flex items-center px-5 py-3 text-sm transition-colors",
                            idx === arr.length - 1
                              ? "border-t border-[var(--hm-line)] font-semibold text-[var(--hm-primary)] hover:bg-[rgba(177,63,116,0.08)]"
                              : "text-[var(--hm-text-soft)] hover:text-[var(--hm-purple)] hover:bg-[rgba(76,47,111,0.06)]"
                          )}
                        >
                          {t(child.labelKey)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-1 md:gap-1.5">
            <LanguageSwitcher className="hidden lg:inline-flex" />

            <Link
              href={isAuthenticated ? "/mon-compte" : "/connexion"}
              className="hidden items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)] lg:inline-flex"
            >
              <User size={15} />
              <span>{isAuthenticated ? (user?.firstName ?? t("header.account")) : t("header.login")}</span>
            </Link>

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin/commandes"
                className="hidden items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)] lg:inline-flex"
              >
                <ShieldCheck size={13} />
                {t("header.admin")}
              </Link>
            )}

            {/* Compte / connexion — icône visible dans la barre sur mobile */}
            <Link
              href={isAuthenticated ? "/mon-compte" : "/connexion"}
              aria-label={isAuthenticated ? t("header.account") : t("header.login")}
              className="btn-ghost rounded-full border border-[rgba(63,45,88,0.08)] bg-white/82 px-2.5 lg:hidden"
            >
              <User size={16} />
            </Link>

            <button
              onClick={toggleCart}
              className="btn-ghost relative rounded-full border border-transparent px-2.5"
              aria-label={t("header.cart")}
            >
              <ShoppingBag size={16} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--hm-rose)] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            <Link
              href="/catalogue"
              className="btn-primary btn-primary-pulse hidden px-4 py-2.5 text-[10px] lg:inline-flex"
            >
              {t("header.order")}
            </Link>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="btn-ghost rounded-full border border-[rgba(63,45,88,0.08)] bg-white/82 px-2.5 lg:hidden"
              aria-label={t("header.menu")}
            >
              {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-t border-[rgba(63,45,88,0.08)] bg-white/92 backdrop-blur-xl xl:hidden">
          <nav className="container py-5">
            <div className="rounded-[2rem] border border-[rgba(63,45,88,0.08)] bg-white p-5 shadow-[0_22px_45px_rgba(63,45,88,0.10)]">
            {/* Sélecteur de langue + compte en haut du menu */}
            <div className="mb-4 flex justify-center">
              <LanguageSwitcher />
            </div>
            <Link
              href={isAuthenticated ? "/mon-compte" : "/connexion"}
              onClick={() => setIsMobileOpen(false)}
              className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-[var(--hm-primary)] px-4 py-3 text-sm font-bold text-[var(--hm-primary)] transition-colors hover:bg-[rgba(177,63,116,0.07)]"
            >
              <User size={16} />
              {isAuthenticated ? t("header.account") : t("header.loginCreate")}
            </Link>

            <div className="flex flex-col gap-1">
            {/* Accueil — repère explicite (le logo seul est moins évident) */}
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-base font-bold text-[var(--hm-text)] transition-colors hover:bg-[rgba(177,63,116,0.07)]"
            >
              {t("header.home")}
            </Link>
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.labelKey}>
                  <button
                    type="button"
                    onClick={() => setMobileExpanded(mobileExpanded === item.labelKey ? null : item.labelKey)}
                    aria-expanded={mobileExpanded === item.labelKey}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-base font-bold text-[var(--hm-text)] transition-colors hover:bg-[rgba(177,63,116,0.07)]"
                  >
                    {t(item.labelKey)}
                    <ChevronDown
                      size={18}
                      className={`text-[var(--hm-text-soft)] transition-transform ${mobileExpanded === item.labelKey ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileExpanded === item.labelKey && (
                    <div className="ml-4 border-l-2 border-[var(--hm-line)] pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.labelKey}
                          href={child.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="block rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--hm-text-soft)] transition-colors hover:bg-[rgba(177,63,116,0.06)] hover:text-[var(--hm-purple)]"
                        >
                          {t(child.labelKey)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block rounded-2xl px-4 py-3.5 text-base font-bold text-[var(--hm-text)] transition-colors hover:bg-[rgba(177,63,116,0.07)] hover:text-[var(--hm-rose)]"
                >
                  {t(item.labelKey)}
                </Link>
              )
            )}
            </div>

            <div className="mt-5 flex flex-col gap-2 border-t border-[var(--hm-line)] pt-5">
              <Link
                href="/contact?sujet=devis"
                onClick={() => setIsMobileOpen(false)}
                className="btn-primary w-full text-center"
              >
                {t("header.requestQuote")}
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="btn-outline w-full text-center"
              >
                {t("nav.contact")}
              </Link>
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin/commandes"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--hm-line)] px-4 py-3 text-sm font-semibold text-[var(--hm-text)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)] transition-colors"
                >
                  <ShieldCheck size={16} />
                  {t("header.adminOrders")}
                </Link>
              )}
            </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
