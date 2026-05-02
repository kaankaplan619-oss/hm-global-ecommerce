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
    children: [
      { label: "T-shirts", href: "/catalogue/tshirts" },
      { label: "Polos", href: "/catalogue/polos" },
      { label: "Hoodies & Sweats", href: "/catalogue/hoodies" },
      { label: "Softshells & Vestes", href: "/catalogue/softshells" },
      { label: "Polaires & Doudounes", href: "/catalogue/polaires" },
      { label: "Casquettes & Bonnets", href: "/catalogue/casquettes" },
      { label: "Sacs & Goodies", href: "/catalogue/sacs" },
      { label: "Enfants", href: "/catalogue/enfants" },
      { label: "Voir tout le catalogue →", href: "/catalogue" },
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
    setMounted(true);
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-[var(--hm-line)] bg-white/92 shadow-[0_6px_20px_rgba(63,45,88,0.05)] backdrop-blur-md"
          : "border-b border-transparent bg-white/80 backdrop-blur-sm"
      )}
    >
      <div className="container">
        <div className="mx-auto flex h-[4rem] max-w-[1140px] items-center justify-between gap-3 md:h-[4.4rem] md:gap-4">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo/hm-global-logo.png"
              alt="HM Global Agence"
              width={240}
              height={64}
              priority
              className="h-8.5 w-auto md:h-9"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center px-2 lg:flex">
            <div className="flex max-w-[700px] items-center rounded-full border border-[var(--hm-line)] bg-white/88 px-1 py-0.5 shadow-[0_6px_18px_rgba(63,45,88,0.03)] backdrop-blur-sm">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-[var(--hm-text-soft)] transition-colors hover:bg-[var(--hm-surface)] hover:text-[var(--hm-rose)]"
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
                  <div className="absolute top-full left-0 pt-2 w-56">
                    <div className="bg-white border border-[var(--hm-line)] rounded-xl overflow-hidden shadow-[0_18px_40px_rgba(63,45,88,0.12)]">
                      {item.children.map((child, idx, arr) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center px-4 py-3 text-sm transition-colors",
                            idx === arr.length - 1
                              ? "border-t border-[var(--hm-line)] font-semibold text-[var(--hm-primary)] hover:bg-[var(--hm-accent-soft-purple)]"
                              : "text-[var(--hm-text-soft)] hover:text-[var(--hm-purple)] hover:bg-[var(--hm-accent-soft-purple)]"
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
              className="btn-ghost hidden rounded-full px-2 lg:flex"
            >
              <User size={16} />
              <span className="hidden text-xs xl:block">
                {isAuthenticated ? user?.firstName : "Connexion"}
              </span>
            </Link>

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin/commandes"
                className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-[var(--hm-line)] px-3 py-1.5 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
              >
                <ShieldCheck size={13} />
                Admin
              </Link>
            )}

            <button
              onClick={toggleCart}
              className="btn-ghost relative px-2.5"
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
              className="btn-primary btn-primary-pulse hidden px-3 py-2 text-[10px] lg:inline-flex"
            >
              Commander
            </Link>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="btn-ghost px-2.5 lg:hidden"
              aria-label="Menu"
            >
              {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div className="border-t border-[var(--hm-line)] bg-white xl:hidden">
          <nav className="container py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block px-4 py-3 text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 border-l border-[var(--hm-line)] pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="block px-2 py-2 text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-purple)] transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-[var(--hm-line)] flex flex-col gap-2">
              <Link
                href={isAuthenticated ? "/mon-compte" : "/connexion"}
                onClick={() => setIsMobileOpen(false)}
                className="btn-outline w-full text-center"
              >
                {isAuthenticated ? "Mon compte" : "Connexion"}
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
              <Link
                href="/catalogue"
                onClick={() => setIsMobileOpen(false)}
                className="btn-primary w-full text-center"
              >
                Commander maintenant
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
