import Link from "next/link";
import {
  Briefcase,
  HardHat,
  UtensilsCrossed,
  Trophy,
  CalendarDays,
  Store,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

// ─── Secteurs d'activité ──────────────────────────────────────────────────────

const SECTORS = [
  {
    icon: Briefcase,
    label: "Entreprises & Corporate",
    example: "Uniformes, tenues d'équipe, cadeaux clients",
    bg: "bg-[var(--hm-accent-soft-blue)]",
    color: "text-[var(--hm-blue)]",
  },
  {
    icon: HardHat,
    label: "BTP & Industrie",
    example: "Vêtements de travail identifiés, sécurité renforcée",
    bg: "bg-[var(--hm-accent-soft-purple)]",
    color: "text-[var(--hm-purple)]",
  },
  {
    icon: UtensilsCrossed,
    label: "Restauration & Hôtellerie",
    example: "Tenues de salle, tabliers, polos brodés",
    bg: "bg-[var(--hm-accent-soft-rose)]",
    color: "text-[var(--hm-rose)]",
  },
  {
    icon: Trophy,
    label: "Associations & Clubs",
    example: "Maillots, sweats de club, kits complets",
    bg: "bg-[var(--hm-accent-soft-blue)]",
    color: "text-[var(--hm-blue)]",
  },
  {
    icon: CalendarDays,
    label: "Événementiel",
    example: "T-shirts d'événement, lots promotionnels, goodies",
    bg: "bg-[var(--hm-accent-soft-purple)]",
    color: "text-[var(--hm-purple)]",
  },
  {
    icon: Store,
    label: "Commerce & Retail",
    example: "Merchandising, vêtements à l'effigie de votre enseigne",
    bg: "bg-[var(--hm-accent-soft-rose)]",
    color: "text-[var(--hm-rose)]",
  },
] as const;

// ─── Engagements différenciateurs ─────────────────────────────────────────────

const COMMITMENTS = [
  {
    value: "0",
    unit: "surprise",
    label: "Validation avant production",
    detail: "Aucun lancement sans votre accord sur le rendu final.",
  },
  {
    value: "7–10",
    unit: "jours",
    label: "Délai de production annoncé",
    detail: "Une fois le fichier validé, vous savez exactement quand livrer.",
  },
  {
    value: "10",
    unit: "pièces",
    label: "Livraison offerte dès",
    detail: "Pas de minimum de commande prohibitif pour démarrer.",
  },
] as const;

// ─── Composant ────────────────────────────────────────────────────────────────

export default function TrustBand() {
  return (
    <section className="section bg-[var(--hm-surface)]">
      <div className="container">

        {/* ── En-tête ────────────────────────────────────────────────────── */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-tag">Nos clients</p>
            <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight
              text-[var(--hm-text)] md:text-4xl">
              Des professionnels
              <br />
              <span className="text-gradient-gold">de tous les secteurs</span>
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
              T-shirts, hoodies et vestes personnalisés pour les entreprises, associations
              et commerces d'Alsace et partout en France. Chaque commande est traitée avec
              le même niveau d'exigence, que ce soit 10 ou 500 pièces.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-outline gap-2 self-start shrink-0 lg:self-auto"
          >
            <MessageSquare size={14} />
            Parler de votre projet
          </Link>
        </div>

        {/* ── Grille secteurs ───────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            return (
              <div
                key={sector.label}
                className="flex items-start gap-3.5 rounded-2xl border
                  border-[var(--hm-line)] bg-white p-4
                  transition-shadow duration-200
                  hover:shadow-[0_6px_20px_rgba(63,45,88,0.07)]"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center
                  rounded-xl ${sector.bg}`}>
                  <Icon size={16} className={sector.color} />
                </div>
                <div>
                  <p className="mb-0.5 text-[13px] font-bold text-[var(--hm-text)]">
                    {sector.label}
                  </p>
                  <p className="text-[11px] leading-snug text-[var(--hm-text-soft)]">
                    {sector.example}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bande engagements ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--hm-line)] bg-white
          overflow-hidden">
          <div className="grid divide-y divide-[var(--hm-line)]
            sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {COMMITMENTS.map((item) => (
              <div key={item.label} className="px-6 py-5">
                <div className="mb-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[var(--hm-rose)]">
                    {item.value}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider
                    text-[var(--hm-text-muted)]">
                    {item.unit}
                  </span>
                </div>
                <p className="mb-0.5 text-[13px] font-bold text-[var(--hm-text)]">
                  {item.label}
                </p>
                <p className="text-[11px] leading-snug text-[var(--hm-text-soft)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Bandeau bas */}
          <div className="border-t border-[var(--hm-line)] bg-[var(--hm-surface)]
            px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-[var(--hm-text-soft)]">
              Votre secteur d'activité n'est pas listé ?
              <span className="ml-1 font-semibold text-[var(--hm-text)]">
                On travaille sur mesure pour tous les professionnels.
              </span>
            </p>
            <Link
              href="/contact"
              className="flex shrink-0 items-center gap-1.5 text-[12px] font-bold
                text-[var(--hm-rose)] transition-all duration-200 hover:gap-2.5"
            >
              Nous contacter
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
