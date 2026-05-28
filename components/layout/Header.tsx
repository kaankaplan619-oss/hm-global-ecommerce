"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, User, Menu, X, ChevronDown, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Catalogue",
    href: "/catalogue",
    // V1.1 (2026-05-27) — Menu étendu aux 7 catégories actives du site
    // (vs 2 auparavant : T-shirts + Hoodies seulement). Chaque entrée mène
    // à /catalogue/{category} qui est une route dynamique déjà fonctionnelle
    // (vérifié HTTP 200 sur toutes). Ordre : du plus vendu au plus niche.
    children: [
      { label: "T-shirts",            href: "/catalogue/tshirts" },
      { label: "Hoodies & Sweats",    href: "/catalogue/hoodies" },
      { label: "Polos",               href: "/catalogue/polos" },
      { label: "Sacs & Tote bags",    href: "/catalogue/sacs" },
      { label: "Goodies & Mugs",      href: "/catalogue/goodies" },
      { label: "Casquettes",          href: "/catalogue/casquettes" },
      { label: "Vêtements enfants",   href: "/catalogue/enfants" },
      { label: "Voir tout le catalogue →", href: "/catalogue" },
    ],
  },
  {
    label: "Impression",
    href: "/impression",
    children: [
      { label: "Cartes de visite", href: "/impression#business-cards" },
      { label: "Flyers", href: "/impression#flyer" },
      { label: "Affiches & Posters", href: "/impression#poster" },
      { label: "Toiles canvas", href: "/impression#canvas" },
      { label: "Voir tout l'impression →", href: "/impression" },
    ],
  },
  { label: "Techniques", href: "/techniques" },
  { label: "Entreprises", href: "/entreprises" },
  { label: "Réalisations", href: "/realisations" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { toggleCart, getTotalItems } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  // ── Hydration guard ──────────────────────────────────────────────────────────
  // Le store utilise skipHydration:true pour éviter l'erreur #418.
  // On déclenche la réhydratation ici (côté client uniquement) et on bloque
  // l'affichage du badge panier jusqu'à ce que le composant soit monté,
  // garantissant que le HTML initial correspond au rendu serveur (badge absent).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    useCartStore.persist.rehydrate();
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

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
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 rounded-full px-3 py-2 text-[11px] font-semibold tracking-[0.04em] text-[var(--hm-text-soft)] transition-colors hover:bg-[rgba(177,63,116,0.08)] hover:text-[var(--hm-rose)]"
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform",
                        openDropdown === item.label && "rotate-180"
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && openDropdown === item.label && (
                  <div className="absolute left-0 top-full w-60 pt-3">
                    <div className="overflow-hidden rounded-[1.35rem] border border-[rgba(63,45,88,0.08)] bg-white/98 shadow-[0_24px_50px_rgba(63,45,88,0.13)]">
                      {item.children.map((child, idx, arr) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center px-5 py-3 text-sm transition-colors",
                            idx === arr.length - 1
                              ? "border-t border-[var(--hm-line)] font-semibold text-[var(--hm-primary)] hover:bg-[rgba(177,63,116,0.08)]"
                              : "text-[var(--hm-text-soft)] hover:text-[var(--hm-purple)] hover:bg-[rgba(76,47,111,0.06)]"
                          )}
                        >
                          {child.label}
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
            <Link
              href={isAuthenticated ? "/mon-compte" : "/connexion"}
              className="btn-ghost hidden rounded-full border border-transparent px-3 lg:flex"
            >
              <User size={16} />
              <span className="hidden text-xs xl:block">
                {isAuthenticated ? user?.firstName : "Connexion"}
              </span>
            </Link>

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin/commandes"
                className="hidden items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)] lg:inline-flex"
              >
                <ShieldCheck size={13} />
                Admin
              </Link>
            )}

            <button
              onClick={toggleCart}
              className="btn-ghost relative rounded-full border border-transparent px-2.5"
              aria-label="Panier"
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
              Commander
            </Link>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="btn-ghost rounded-full border border-[rgba(63,45,88,0.08)] bg-white/82 px-2.5 lg:hidden"
              aria-label="Menu"
            >
              {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div className="border-t border-[rgba(63,45,88,0.08)] bg-white/92 backdrop-blur-xl xl:hidden">
          <nav className="container py-5">
            <div className="rounded-[2rem] border border-[rgba(63,45,88,0.08)] bg-white p-5 shadow-[0_22px_45px_rgba(63,45,88,0.10)]">
            <div className="mb-5 rounded-[1.5rem] border border-[var(--hm-line)] bg-[linear-gradient(135deg,rgba(95,168,210,0.10),rgba(255,255,255,0.92),rgba(177,63,116,0.08))] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--hm-primary)]">
                Commander sans friction
              </p>
              <p className="mt-2 max-w-[26ch] text-sm leading-6 text-[var(--hm-text-soft)]">
                Accès direct au catalogue ou accompagnement sur devis selon votre besoin.
              </p>
            </div>
            <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--hm-text-soft)] transition-colors hover:bg-[rgba(177,63,116,0.07)] hover:text-[var(--hm-rose)]"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-5 border-l border-[var(--hm-line)] pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="block px-2 py-2 text-xs font-medium text-[var(--hm-text-soft)] transition-colors hover:text-[var(--hm-purple)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            </div>
            <div className="mt-5 border-t border-[var(--hm-line)] pt-5">
              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--hm-text-muted)]">
                <span className="rounded-full bg-[var(--hm-surface)] px-2 py-2">Alsace</span>
                <span className="rounded-full bg-[var(--hm-surface)] px-2 py-2">BAT validé</span>
                <span className="rounded-full bg-[var(--hm-surface)] px-2 py-2">Dès 10 pcs</span>
              </div>
              <div className="flex flex-col gap-2">
              <Link
                href="/contact?sujet=devis"
                onClick={() => setIsMobileOpen(false)}
                className="btn-primary w-full text-center"
              >
                Demander un devis
              </Link>
              <Link
                href="/catalogue/tshirts"
                onClick={() => setIsMobileOpen(false)}
                className="btn-outline w-full text-center"
              >
                Voir le catalogue textile
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="block w-full text-center text-xs font-semibold text-[var(--hm-text-soft)] underline-offset-2 hover:text-[var(--hm-rose)] hover:underline"
              >
                Contact rapide
              </Link>
              <Link
                href={isAuthenticated ? "/mon-compte" : "/connexion"}
                onClick={() => setIsMobileOpen(false)}
                className="mt-1 block text-center text-[11px] text-[var(--hm-text-muted)] hover:text-[var(--hm-purple)]"
              >
                {isAuthenticated ? "Mon compte" : "Connexion / inscription"}
              </Link>
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin/commandes"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--hm-line)] px-4 py-3 text-sm font-semibold text-[var(--hm-text)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)] transition-colors"
                >
                  <ShieldCheck size={16} />
                  Commandes admin
                </Link>
              )}
            </div>
            </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
