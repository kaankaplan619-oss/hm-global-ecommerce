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
    label: "Textile",
    href: "/catalogue",
    // V1.1 (2026-05-27) — Menu étendu aux 7 catégories actives du site
    // (vs 2 auparavant : T-shirts + Hoodies seulement). Chaque entrée mène
    // à /catalogue/{category} qui est une route dynamique déjà fonctionnelle
    // (vérifié HTTP 200 sur toutes). Ordre : du plus vendu au plus niche.
    // V1.2 — Menu réduit aux catégories qui ont réellement des produits
    // (T-shirts, Hoodies, Polos, Casquettes, Goodies). Sacs & Enfants masqués
    // tant qu'ils sont vides (évite les pages catalogue vides + désencombre le
    // menu). À réactiver quand ces catégories auront des produits visibles.
    children: [
      { label: "T-shirts",       href: "/catalogue/tshirts" },
      { label: "Hoodies",        href: "/catalogue/hoodies" },
      { label: "Polos",          href: "/catalogue/polos" },
      { label: "Casquettes",     href: "/catalogue/casquettes" },
      { label: "Goodies & Mugs", href: "/catalogue/goodies" },
      { label: "Voir tout →",    href: "/catalogue" },
    ],
  },
  {
    label: "Print",
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
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
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

  // Bloque le scroll de la page derrière le menu mobile ouvert (sinon le geste
  // de glissement fait défiler la page au lieu du menu).
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
              className="hidden items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)] lg:inline-flex"
            >
              <User size={15} />
              <span>{isAuthenticated ? (user?.firstName ?? "Mon compte") : "Connexion"}</span>
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
        <div className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-t border-[rgba(63,45,88,0.08)] bg-white/92 backdrop-blur-xl xl:hidden">
          <nav className="container py-5">
            <div className="rounded-[2rem] border border-[rgba(63,45,88,0.08)] bg-white p-5 shadow-[0_22px_45px_rgba(63,45,88,0.10)]">
            {/* Compte / connexion mis en avant en haut du menu */}
            <Link
              href={isAuthenticated ? "/mon-compte" : "/connexion"}
              onClick={() => setIsMobileOpen(false)}
              className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-[var(--hm-primary)] px-4 py-3 text-sm font-bold text-[var(--hm-primary)] transition-colors hover:bg-[rgba(177,63,116,0.07)]"
            >
              <User size={16} />
              {isAuthenticated ? "Mon compte" : "Connexion / Créer un compte"}
            </Link>

            <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                    aria-expanded={mobileExpanded === item.label}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-base font-bold text-[var(--hm-text)] transition-colors hover:bg-[rgba(177,63,116,0.07)]"
                  >
                    {item.label}
                    <ChevronDown
                      size={18}
                      className={`text-[var(--hm-text-soft)] transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileExpanded === item.label && (
                    <div className="ml-4 border-l-2 border-[var(--hm-line)] pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="block rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--hm-text-soft)] transition-colors hover:bg-[rgba(177,63,116,0.06)] hover:text-[var(--hm-purple)]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block rounded-2xl px-4 py-3.5 text-base font-bold text-[var(--hm-text)] transition-colors hover:bg-[rgba(177,63,116,0.07)] hover:text-[var(--hm-rose)]"
                >
                  {item.label}
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
                Demander un devis
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="btn-outline w-full text-center"
              >
                Contact
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
          </nav>
        </div>
      )}
    </header>
  );
}
