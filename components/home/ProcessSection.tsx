import Link from "next/link";
import {
  ShoppingBag,
  Upload,
  ShieldCheck,
  Layers3,
  Truck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

// ─── Données ──────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    actor: "vous",
    actorLabel: "Votre action",
    icon: ShoppingBag,
    title: "Choisissez votre produit",
    description:
      "Parcourez le catalogue, sélectionnez le modèle, la couleur et la quantité. Devis disponible pour les grands volumes ou les besoins mixtes.",
    note: "T-shirts, hoodies, softshells",
    iconBg: "bg-[var(--hm-accent-soft-blue)]",
    iconColor: "text-[var(--hm-blue)]",
    actorBg: "bg-[var(--hm-accent-soft-blue)]",
    actorColor: "text-[var(--hm-blue)]",
    highlight: false,
  },
  {
    number: "02",
    actor: "vous",
    actorLabel: "Votre action",
    icon: Upload,
    title: "Envoyez votre logo",
    description:
      "Uploadez votre fichier (PNG, SVG, PDF vectoriel). Pas de fichier prêt ? On vous aide à le préparer ou à l'adapter selon la technique choisie.",
    note: "Formats acceptés : PNG, SVG, PDF, AI",
    iconBg: "bg-[var(--hm-accent-soft-purple)]",
    iconColor: "text-[var(--hm-purple)]",
    actorBg: "bg-[var(--hm-accent-soft-blue)]",
    actorColor: "text-[var(--hm-blue)]",
    highlight: false,
  },
  {
    number: "03",
    actor: "hm",
    actorLabel: "HM Global",
    icon: ShieldCheck,
    title: "On valide votre fichier",
    description:
      "Avant toute production, notre équipe vérifie le rendu, les couleurs et le positionnement. Un bon à tirer vous est soumis si nécessaire.",
    note: "Aucune production sans validation",
    iconBg: "bg-white",
    iconColor: "text-[var(--hm-rose)]",
    actorBg: "bg-[var(--hm-rose)]",
    actorColor: "text-white",
    highlight: true,
  },
  {
    number: "04",
    actor: "hm",
    actorLabel: "HM Global",
    icon: Layers3,
    title: "Production en Alsace",
    description:
      "DTF, flex ou broderie selon votre commande. Fabrication locale, délai de 7 à 10 jours ouvrés. Vous êtes notifié à chaque changement de statut.",
    note: "7 à 10 jours ouvrés",
    iconBg: "bg-[var(--hm-accent-soft-purple)]",
    iconColor: "text-[var(--hm-purple)]",
    actorBg: "bg-[var(--hm-accent-soft-rose)]",
    actorColor: "text-[var(--hm-rose)]",
    highlight: false,
  },
  {
    number: "05",
    actor: "hm",
    actorLabel: "HM Global",
    icon: Truck,
    title: "Livraison ou remise",
    description:
      "Expédition Colissimo avec numéro de suivi, ou retrait en atelier en Alsace. Livraison offerte dès 10 pièces.",
    note: "Livraison offerte dès 10 pièces",
    iconBg: "bg-[var(--hm-accent-soft-blue)]",
    iconColor: "text-[var(--hm-blue)]",
    actorBg: "bg-[var(--hm-accent-soft-rose)]",
    actorColor: "text-[var(--hm-rose)]",
    highlight: false,
  },
] as const;

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ProcessSection() {
  return (
    <section className="section bg-white" id="comment-ca-marche">
      <div className="container">

        {/* ── En-tête ────────────────────────────────────────────────────── */}
        <div className="mb-12 text-center">
          <p className="section-tag justify-center">Comment ça marche</p>
          <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight
            text-[var(--hm-text)] md:text-4xl">
            De la commande à la livraison,
            <br />
            <span className="text-gradient-gold">on s&rsquo;occupe de tout</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            Un process simple, pensé pour les pros. Vous choisissez, vous envoyez votre logo —
            notre équipe valide, produit et livre.
          </p>
        </div>

        {/* ── Légende ───────────────────────────────────────────────────── */}
        <div className="mb-8 flex items-center justify-center gap-5">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--hm-blue)]" />
            <span className="text-[11px] text-[var(--hm-text-soft)]">Votre action</span>
          </div>
          <div className="h-3 w-[1px] bg-[var(--hm-line)]" />
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--hm-rose)]" />
            <span className="text-[11px] text-[var(--hm-text-soft)]">HM Global prend le relais</span>
          </div>
        </div>

        {/* ── Étapes ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === STEPS.length - 1;

            return (
              <div key={step.number} className="relative">

                {/* ── Connecteur → entre étapes (desktop) ── */}
                {!isLast && (
                  <div className="absolute -right-2.5 top-[38px] z-10 hidden
                    h-5 w-5 items-center justify-center rounded-full
                    border border-[var(--hm-line)] bg-white
                    shadow-[0_1px_4px_rgba(63,45,88,0.08)] lg:flex">
                    <ChevronRight size={9} className="text-[var(--hm-text-muted)]" />
                  </div>
                )}

                {/* ── Carte étape ── */}
                <div
                  className={`relative flex h-full flex-col overflow-hidden
                    rounded-2xl border transition-all duration-300
                    hover:shadow-[0_8px_24px_rgba(63,45,88,0.09)]
                    ${step.highlight
                      ? "border-[var(--hm-rose)] bg-[var(--hm-accent-soft-rose)]"
                      : "border-[var(--hm-line)] bg-white hover:border-[rgba(177,63,116,0.22)]"
                    }`}
                >
                  {/* Numéro décoratif en fond */}
                  <span className="pointer-events-none absolute -right-2 -top-4
                    select-none text-[88px] font-black leading-none
                    text-[var(--hm-text)] opacity-[0.04]">
                    {step.number}
                  </span>

                  <div className="relative flex flex-1 flex-col p-4">

                    {/* Icône + badge acteur */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className={`flex h-9 w-9 shrink-0 items-center
                        justify-center rounded-xl
                        ${step.highlight
                          ? "bg-white shadow-[0_2px_8px_rgba(177,63,116,0.15)]"
                          : step.iconBg
                        }`}>
                        <Icon size={16} className={step.iconColor} />
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px]
                        font-bold uppercase tracking-wider
                        ${step.actorBg} ${step.actorColor}`}>
                        {step.actorLabel}
                      </span>
                    </div>

                    {/* Numéro réel + titre */}
                    <p className={`mb-0.5 text-[10px] font-bold tabular-nums
                      ${step.highlight
                        ? "text-[var(--hm-rose)]"
                        : "text-[var(--hm-text-muted)]"
                      }`}>
                      Étape {step.number}
                    </p>
                    <h3 className={`mb-2 text-[13px] font-black leading-snug
                      ${step.highlight
                        ? "text-[var(--hm-rose)]"
                        : "text-[var(--hm-text)]"
                      }`}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="flex-1 text-[11px] leading-relaxed text-[var(--hm-text-soft)]">
                      {step.description}
                    </p>

                    {/* Note concrète en bas */}
                    <div className={`mt-3 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold
                      ${step.highlight
                        ? "bg-white/60 text-[var(--hm-rose)]"
                        : "bg-[var(--hm-surface)] text-[var(--hm-text-muted)]"
                      }`}>
                      {step.note}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bande de réassurance bas ──────────────────────────────────── */}
        <div className="mt-10 rounded-2xl border border-[var(--hm-line)]
          bg-[var(--hm-surface)] px-6 py-5
          md:flex md:items-center md:justify-between md:gap-8">
          <div className="mb-4 md:mb-0">
            <p className="mb-0.5 text-[15px] font-bold text-[var(--hm-text)]">
              Prêt à lancer votre commande ?
            </p>
            <p className="text-[12px] text-[var(--hm-text-soft)]">
              Commandez en ligne ou demandez un devis —
              on vous rappelle dans la journée si besoin.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/catalogue"
              className="btn-primary gap-2 px-5 py-2.5 text-[0.78rem]"
            >
              Voir le catalogue
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/contact"
              className="btn-outline gap-2 px-5 py-2.5 text-[0.78rem]"
            >
              Demander un devis
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
