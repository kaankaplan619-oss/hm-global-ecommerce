import Link from "next/link";
import { ArrowRight, Zap, Scissors, Award } from "lucide-react";

// ─── Données ──────────────────────────────────────────────────────────────────

const TECHNIQUES = [
  {
    id: "dtf",
    icon: Zap,
    label: "DTF",
    tagline: "Impression haute définition, couleurs illimitées",
    badge: "Le plus demandé",
    badgeBg: "bg-[var(--hm-accent-soft-rose)]",
    badgeText: "text-[var(--hm-rose)]",
    accent: "border-t-[var(--hm-rose)]",
    dotColor: "bg-[var(--hm-rose)]",
    iconColor: "text-[var(--hm-rose)]",
    iconBg: "bg-[var(--hm-accent-soft-rose)]",
    description:
      "Direct To Film : un film imprimé est thermocollé sur le textile. Résultat photographique, toucher souple, couleurs fidèles même après 50 lavages.",
    useCases: [
      "Logos multicolores ou dégradés",
      "Équipes, clubs, événements",
      "Visuels complexes (photo, illustration)",
    ],
    limit: "Moins économique sur petits volumes monocolores",
    cost: 2, // sur 3
  },
  {
    id: "flex",
    icon: Scissors,
    label: "Flex / Vinyle",
    tagline: "Trait net et précis, idéal pour les logos simples",
    badge: "Économique",
    badgeBg: "bg-[var(--hm-accent-soft-blue)]",
    badgeText: "text-[var(--hm-blue)]",
    accent: "border-t-[var(--hm-blue)]",
    dotColor: "bg-[var(--hm-blue)]",
    iconColor: "text-[var(--hm-blue)]",
    iconBg: "bg-[var(--hm-accent-soft-blue)]",
    description:
      "Découpe vinyle thermocollant. Parfait pour les typographies, logos nets et formes géométriques. Rendu propre et durable sur coton ou polyester.",
    useCases: [
      "Textes, initiales, logos 1-2 couleurs",
      "Petites séries ou prototypes rapides",
      "Uniformes, tenues de travail",
    ],
    limit: "Pas adapté aux dégradés ni aux visuels photo",
    cost: 1, // sur 3
  },
  {
    id: "broderie",
    icon: Award,
    label: "Broderie",
    tagline: "Rendu 3D premium, toucher noble",
    badge: "Prestige",
    badgeBg: "bg-[var(--hm-accent-soft-purple)]",
    badgeText: "text-[var(--hm-purple)]",
    accent: "border-t-[var(--hm-purple)]",
    dotColor: "bg-[var(--hm-purple)]",
    iconColor: "text-[var(--hm-purple)]",
    iconBg: "bg-[var(--hm-accent-soft-purple)]",
    description:
      "Broderie machine haute définition point par point. Donne du relief et du caractère à votre logo. Inusable, indémodable — la finition haut de gamme.",
    useCases: [
      "Softshells, polaires, vestes corporate",
      "Polos et tenues haut de gamme",
      "Logo sobre avec fort impact visuel",
    ],
    limit: "Nombre de couleurs limité, moins adapté aux formes fines",
    cost: 3, // sur 3
  },
] as const;

// ─── Composant ────────────────────────────────────────────────────────────────

export default function TechniqueComparison() {
  return (
    <section className="section bg-white" id="techniques">
      <div className="container">

        {/* ── En-tête ─────────────────────────────────────────────────── */}
        <div className="mb-12 text-center">
          <p className="section-tag justify-center">Nos techniques</p>
          <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight
            text-[var(--hm-text)] md:text-4xl">
            DTF, Flex ou Broderie —
            <br />
            <span className="text-gradient-gold">comment choisir ?</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            Chaque projet est différent. Voici les critères qui font la différence
            pour choisir la technique adaptée à votre rendu, votre budget et vos supports.
          </p>
        </div>

        {/* ── Cartes techniques ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
          {TECHNIQUES.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.id}
                className={`relative flex flex-col rounded-2xl border border-t-4
                  border-[var(--hm-line)] bg-white
                  shadow-[0_4px_20px_rgba(63,45,88,0.06)]
                  transition-all duration-300
                  hover:shadow-[0_12px_36px_rgba(63,45,88,0.10)]
                  hover:-translate-y-0.5
                  ${tech.accent}`}
              >
                {/* ── Header carte ── */}
                <div className="p-5 pb-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    {/* Icône */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center
                      rounded-xl ${tech.iconBg}`}>
                      <Icon size={16} className={tech.iconColor} />
                    </div>
                    {/* Badge */}
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold
                      uppercase tracking-wider ${tech.badgeBg} ${tech.badgeText}`}>
                      {tech.badge}
                    </span>
                  </div>

                  {/* Nom + tagline */}
                  <h3 className="mb-0.5 text-[18px] font-black text-[var(--hm-text)]">
                    {tech.label}
                  </h3>
                  <p className="text-[11px] font-semibold text-[var(--hm-text-soft)]">
                    {tech.tagline}
                  </p>
                </div>

                {/* ── Description ── */}
                <div className="border-t border-[var(--hm-line)] px-5 py-4">
                  <p className="text-[12px] leading-relaxed text-[var(--hm-text-soft)]">
                    {tech.description}
                  </p>
                </div>

                {/* ── Cas d'usage ── */}
                <div className="flex-1 px-5 py-4">
                  <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider
                    text-[var(--hm-text-muted)]">
                    Idéal pour
                  </p>
                  <ul className="flex flex-col gap-2">
                    {tech.useCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2">
                        <span className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full
                          ${tech.dotColor}`} />
                        <span className="text-[12px] leading-snug text-[var(--hm-text)]">
                          {uc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── Limite + coût ── */}
                <div className="rounded-b-2xl border-t border-[var(--hm-line)]
                  bg-[var(--hm-surface)] px-5 py-3">
                  <div className="flex items-center justify-between gap-4">
                    {/* Limite */}
                    <p className="text-[10px] italic leading-snug text-[var(--hm-text-muted)]">
                      {tech.limit}
                    </p>
                    {/* Indicateur coût relatif */}
                    <div className="flex shrink-0 items-center gap-0.5" title="Coût relatif">
                      {[1, 2, 3].map((n) => (
                        <span
                          key={n}
                          className={`h-2 w-2 rounded-full
                            ${n <= tech.cost
                              ? tech.dotColor
                              : "bg-[var(--hm-line)]"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bande de décision ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--hm-line)]
          bg-[var(--hm-surface)] px-6 py-5
          md:flex md:items-center md:justify-between md:gap-8">
          <div className="mb-4 md:mb-0">
            <p className="mb-0.5 text-[15px] font-bold text-[var(--hm-text)]">
              Vous hésitez encore sur la technique ?
            </p>
            <p className="text-[12px] text-[var(--hm-text-soft)]">
              Envoyez-nous votre logo ou décrivez votre projet — on vous conseille
              gratuitement en moins de 24h.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/contact"
              className="btn-primary gap-2 text-[0.78rem] px-5 py-2.5"
            >
              Demander un conseil
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/catalogue"
              className="btn-outline gap-2 text-[0.78rem] px-5 py-2.5"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
