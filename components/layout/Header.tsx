"use client";

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
  { label: "Techniques", href: "/#techniques" },
  { label: "À propos", href: "/#a-propos" },
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
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1e1e1e]"
          : "bg-transparent"
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col leading-none">
              <span className="text-[#f5f5f5] font-black text-base tracking-wider uppercase">
                HM GLOBAL
              </span>
              <span className="text-[#c9a96e] font-light text-[10px] tracking-[0.25em] uppercase">
                Agence
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
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
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors",
                    "text-[#8a8a8a] hover:text-[#f5f5f5]"
                  )}
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
                    <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-2xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="flex items-center px-4 py-3 text-sm text-[#8a8a8a] hover:text-[#f5f5f5] hover:bg-[#1a1a1a] transition-colors"
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

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Account */}
            <Link
              href={isAuthenticated ? "/mon-compte" : "/connexion"}
              className="btn-ghost hidden md:flex"
            >
              <User size={18} />
              <span className="text-xs hidden lg:block">
                {isAuthenticated ? user?.firstName : "Connexion"}
              </span>
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="btn-ghost relative"
              aria-label="Panier"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c9a96e] text-[#0a0a0a] text-[9px] font-black rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* CTA desktop */}
            <Link
              href="/catalogue"
              className="btn-primary hidden lg:inline-flex text-xs px-4 py-2.5"
            >
              Commander
            </Link>

            {/* Mobile menu toggle */}
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

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-t border-[#1e1e1e]">
          <nav className="container py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block px-4 py-3 text-sm text-[#8a8a8a] hover:text-[#f5f5f5] transition-colors"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 border-l border-[#1e1e1e] pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="block px-2 py-2 text-xs text-[#555555] hover:text-[#f5f5f5] transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-[#1e1e1e] flex flex-col gap-2">
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
