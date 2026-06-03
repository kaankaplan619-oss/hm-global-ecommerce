"use client";

/**
 * components/hermes/HermesShell.tsx — Layout chrome de Hermès OS.
 *
 * Sidebar desktop fixe + topbar mobile avec drawer. Dark theme premium aligné
 * sur les tokens HM (`--hm-violet`, `--hm-cyan`, `--hm-magenta`, `--hm-navy`).
 *
 * Server component parent (`app/hermes/layout.tsx`) fait le check d'accès puis
 * passe `children` ici. Ce composant gère uniquement le chrome client (drawer
 * mobile + état actif de la nav).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarCheck,
  Inbox,
  CheckSquare,
  FolderKanban,
  BookOpen,
  Sparkles,
  Bot,
  Send,
  Target,
  Menu,
  X,
  Compass,
  MessageCircle,
} from "lucide-react";

interface NavItem {
  href:  string;
  label: string;
  icon:  typeof CalendarCheck;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  compact?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Mon cockpit",
    items: [
      { href: "/hermes",        label: "Aujourd'hui",     icon: CalendarCheck },
      { href: "/hermes/master", label: "Hermès Master",   icon: MessageCircle },
      { href: "/hermes/inbox",  label: "Rapports agents", icon: Inbox },
      { href: "/hermes/tasks",  label: "Tâches",          icon: CheckSquare },
    ],
  },
  {
    label: "Mes projets",
    items: [
      { href: "/hermes/projects", label: "Projets",            icon: FolderKanban },
      { href: "/hermes/vente",    label: "Clients & Prospects", icon: Target },
      { href: "/hermes/agents",   label: "Agents",             icon: Bot },
      { href: "/hermes/missions", label: "Lancer une mission",  icon: Send },
    ],
  },
  {
    label: "Ma base",
    compact: true,
    items: [
      { href: "/hermes/memory",  label: "Base de connaissance", icon: BookOpen },
      { href: "/hermes/prompts", label: "Modèles de messages",  icon: Sparkles },
      { href: "/hermes/guide",   label: "Guide",                icon: Compass },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/hermes") return pathname === "/hermes";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function HermesShell({
  email,
  children,
}: {
  email:    string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "radial-gradient(ellipse at 0% 0%, #1a1f2c 0%, #0c0e14 60%), linear-gradient(180deg, #0c0e14, #131720)",
        color: "#e8e6f0",
      }}
    >
      {/* ── Sidebar desktop ─────────────────────────────────────── */}
      <aside
        className="hidden lg:flex w-64 shrink-0 flex-col border-r"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background:  "rgba(12,14,20,0.85)",
        }}
      >
        <SidebarContent
          pathname={pathname}
          email={email}
          onLinkClick={undefined}
        />
      </aside>

      {/* ── Mobile topbar ───────────────────────────────────────── */}
      <div
        className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background:  "rgba(12,14,20,0.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/hermes" className="flex items-center gap-2">
          <BrandMark />
          <span className="text-sm font-semibold tracking-wide text-white">Hermès OS</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          className="p-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            role="presentation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.55)" }}
          />
          <aside
            className="relative w-72 max-w-[85vw] h-full flex flex-col border-r"
            style={{
              background:  "#0c0e14",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
              className="absolute top-3 right-3 p-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <X size={18} />
            </button>
            <SidebarContent
              pathname={pathname}
              email={email}
              onLinkClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 lg:pt-0 pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {children}
        </div>
      </main>

      {pathname !== "/hermes/master" && (
        <Link
          href="/hermes/master"
          aria-label="Ouvrir Hermès Master"
          className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_18px_42px_rgba(193,60,138,0.34)] transition hover:translate-y-[-1px] lg:hidden"
          style={{
            background: "linear-gradient(135deg, #C13C8A 0%, #3B235A 100%)",
            border:     "1px solid rgba(249,201,221,0.26)",
          }}
        >
          <Sparkles size={22} strokeWidth={1.8} />
        </Link>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SidebarContent({
  pathname,
  email,
  onLinkClick,
}: {
  pathname:    string;
  email:       string | null;
  onLinkClick: (() => void) | undefined;
}) {
  return (
    <>
      <div className="p-6 flex items-center gap-3">
        <BrandMark />
        <div>
          <div className="text-[15px] font-semibold tracking-tight text-white">Hermès OS</div>
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-white/40 mt-0.5">
            HM Global · Cockpit
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <div
              className="mb-2 px-3 text-[9.5px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "rgba(232,230,240,0.34)" }}
            >
              {group.label}
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className="flex items-center gap-3 rounded-lg transition"
                    style={{
                      padding:    group.compact ? "0.55rem 0.75rem" : "0.68rem 0.75rem",
                      fontSize:   group.compact ? "12.5px" : "14px",
                      background: active ? "rgba(177,63,116,0.12)" : "transparent",
                      color:      active ? "#f9c9dd" : group.compact ? "rgba(232,230,240,0.58)" : "rgba(232,230,240,0.78)",
                      border:     active
                        ? "1px solid rgba(177,63,116,0.25)"
                        : "1px solid transparent",
                    }}
                  >
                    <Icon size={group.compact ? 14 : 16} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/35 mb-1">
          Session
        </div>
        <div className="text-[12px] text-white/70 truncate">
          {email ?? "—"}
        </div>
        <Link
          href="/"
          className="mt-3 inline-block text-[11px] text-white/45 hover:text-white/80 transition"
        >
          ← Retour site public
        </Link>
      </div>
    </>
  );
}

function BrandMark() {
  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
      style={{
        background:
          "linear-gradient(135deg, #54B6D2 0%, #3B235A 55%, #C13C8A 100%)",
        boxShadow: "0 8px 24px rgba(177,63,116,0.25)",
      }}
    >
      <span className="text-white text-[14px] font-bold tracking-tight">H</span>
    </span>
  );
}
