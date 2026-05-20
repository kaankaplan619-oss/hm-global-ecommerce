import { Clock3, ShieldCheck, Zap } from "lucide-react";

interface DeliveryBadgeProps {
  /** Compact = inline strip (1 ligne), block = bande pleine largeur sectionnée. */
  variant?: "compact" | "block";
}

const ITEMS = [
  {
    icon: ShieldCheck,
    label: "BAT sous 24 h",
    detail: "Validation visuelle avant production",
  },
  {
    icon: Clock3,
    label: "Production 7-10 jours",
    detail: "Délai ouvrés après BAT validé",
  },
  {
    icon: Zap,
    label: "Express sur demande",
    detail: "Délai serré ? Contactez-nous",
  },
] as const;

/**
 * Bande délais HM Global — composant marketing partagé.
 * Affichable sur fiche produit, home et landings usages/packs.
 */
export default function DeliveryBadge({ variant = "block" }: DeliveryBadgeProps) {
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[var(--hm-text-soft)]">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <Icon size={12} className="text-[var(--hm-rose)]" />
              <span className="font-semibold text-[var(--hm-text)]">{item.label}</span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-[var(--hm-line)] bg-white px-4 py-3 sm:grid-cols-3">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--hm-accent-soft-rose)]">
              <Icon size={15} className="text-[var(--hm-rose)]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[var(--hm-text)]">{item.label}</p>
              <p className="text-[10.5px] leading-snug text-[var(--hm-text-soft)]">{item.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
