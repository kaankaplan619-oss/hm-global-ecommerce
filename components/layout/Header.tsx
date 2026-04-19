"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Catalogue",
    href: "/catalogue",
    children: [
      { label: "T-shirts", href: "/catalogue/tshirts" },
      { label: "Hoodies & Sweats", href: "/catalogue/hoodies" },
      { label: "Softshells & Vestes", href: "/catalogue/softshells" },
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
  const totalItems = getTotalItems();

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
          ? "bg-white/95 backdrop-blur-md border-b border-[var(--hm-line)] shadow-[0_6px_24px_rgba(63,45,88,0.08)]"
          : "bg-white/88 backdrop-blur-sm border-b border-transparent"
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo/hm-global-logo.png"
              alt="HM Global Agence"
              width={240}
              height={64}
              priority
              className="h-10 md:h-11 w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
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
                  <div className="absolute top-full left-0 pt-2 w-52">
                    <div className="bg-white border border-[var(--hm-line)] rounded-xl overflow-hidden shadow-[0_18px_40px_rgba(63,45,88,0.12)]">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="flex items-center px-4 py-3 text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-purple)] hover:bg-[var(--hm-accent-soft-purple)] transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={isAuthenticated ? "/mon-compte" : "/connexion"}
              className="btn-ghost hidden md:flex"
            >
              <User size={18} />
              <span className="text-xs hidden lg:block">
                {isAuthenticated ? user?.firstName : "Connexion"}
              </span>
            </Link>

            <button
              onClick={toggleCart}
              className="btn-ghost relative"
              aria-label="Panier"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--hm-rose)] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            <Link
              href="/catalogue"
              className="btn-primary hidden lg:inline-flex text-xs px-4 py-2.5"
            >
              Commander
            </Link>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="btn-ghost lg:hidden"
              aria-label="Menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div className="lg:hidden bg-white border-t border-[var(--hm-line)]">
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
