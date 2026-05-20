import Link from "next/link";
import {
  ArrowRight,
  Users,
  ChefHat,
  Handshake,
  Calendar,
  HardHat,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TextileUsage } from "@/data/textile-usages";

const ICON_MAP: Record<TextileUsage["icon"], LucideIcon> = {
  Users,
  ChefHat,
  Handshake,
  Calendar,
  HardHat,
  Sparkles,
};

interface UsageCardProps {
  usage: TextileUsage;
}

/**
 * Carte "Par usage métier" — hub + home grid.
 *
 * Si usage.status === "coming_soon", la carte renvoie vers /contact avec un
 * sujet pré-rempli, et un badge "Bientôt disponible" est affiché.
 */
export default function UsageCard({ usage }: UsageCardProps) {
  const Icon = ICON_MAP[usage.icon];
  const isActive = usage.status === "active";

  const href = isActive
    ? `/catalogue/usages/${usage.slug}`
    : `/contact?sujet=textile-usage&usage=${usage.slug}`;

  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-[var(--hm-line)] bg-white transition duration-300 hover:-translate-y-1 hover:border-[var(--hm-cyan)]/40 hover:shadow-[0_18px_36px_rgba(95,168,210,0.10)]"
    >
      {/* Bandeau coloré + icône */}
      <div
        className="relative flex items-center gap-3 px-5 py-4"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(95,168,210,0.10) 0%, rgba(177,63,116,0.06) 100%)"
            : "linear-gradient(135deg, rgba(122,107,151,0.08) 0%, rgba(255,255,255,0.92) 100%)",
          borderBottom: "1px solid var(--hm-line)",
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
          <Icon
            size={18}
            className={isActive ? "text-[var(--hm-cyan)]" : "text-[var(--hm-text-muted)]"}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold leading-tight text-[var(--hm-text)]">
            {usage.title}
          </h3>
        </div>
        {!isActive && (
          <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--hm-text-muted)]">
            Bientôt
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-4 text-[12.5px] leading-relaxed text-[var(--hm-text-soft)]">
          {usage.tagline}
        </p>

        <span className="mt-auto inline-flex items-center gap-1.5 text-[12px] font-semibold transition group-hover:gap-2.5"
          style={{
            color: isActive ? "var(--hm-cyan)" : "var(--hm-text-soft)",
          }}
        >
          {isActive ? "Découvrir" : "Demander un devis"}
          <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}
