import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  GraduationCap,
  Hammer,
  Scissors,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NeedCard = {
  title: string;
  text: string;
  href: string;
  icon: LucideIcon;
  accent: string;
};

const NEEDS: NeedCard[] = [
  {
    title: "Tenues entreprise",
    text: "Polos, sweats et vestes pour une équipe identifiable.",
    href: "/devis-rapide?besoin=tenues-entreprise",
    icon: BriefcaseBusiness,
    accent: "var(--hm-cyan)",
  },
  {
    title: "Restaurant / salon / barber",
    text: "Textiles propres, tabliers, polos et marquage discret.",
    href: "/devis-rapide?besoin=restaurant-commerce",
    icon: Scissors,
    accent: "var(--hm-magenta)",
  },
  {
    title: "Événement / association",
    text: "T-shirts, tote bags et supports pour groupes et clubs.",
    href: "/devis-rapide?besoin=evenement-association",
    icon: Users,
    accent: "var(--hm-violet)",
  },
  {
    title: "Chantier / nettoyage",
    text: "Vêtements résistants, softshells et marquage visible.",
    href: "/devis-rapide?besoin=chantier-nettoyage",
    icon: Hammer,
    accent: "var(--hm-cyan)",
  },
  {
    title: "Marque / créateur",
    text: "Première capsule textile, BAT et rendu prêt à vendre.",
    href: "/devis-rapide?besoin=marque-createur",
    icon: Store,
    accent: "var(--hm-magenta)",
  },
  {
    title: "Erasmus / écoles",
    text: "Packs groupes, événements étudiants et souvenirs personnalisés.",
    href: "/devis-rapide?besoin=erasmus-ecole",
    icon: GraduationCap,
    accent: "var(--hm-violet)",
  },
];

const PACKS = [
  {
    name: "Essentiel",
    usage: "Tenues simples pour équipe, association ou événement.",
    minimum: "À partir de 10 pièces",
    points: ["1 produit textile", "1 zone de marquage", "BAT avant production"],
  },
  {
    name: "Premium",
    usage: "Image plus professionnelle avec finitions et choix textile.",
    minimum: "À partir de 25 pièces",
    points: ["Textile sélectionné", "DTF ou broderie conseillée", "Suivi devis + BAT"],
  },
  {
    name: "Sur mesure",
    usage: "Projet complet : textile, print, signalétique ou lancement marque.",
    minimum: "Selon besoin",
    points: ["Sélection fournisseur", "Packs multi-supports", "Accompagnement humain"],
  },
];

const METHOD = [
  "Vous envoyez votre besoin",
  "Nous vérifions le logo et la technique adaptée",
  "Nous préparons le BAT",
  "Vous validez",
  "Production après validation",
];

export default function HomeNeedsPacks() {
  return (
    <>
      <section className="py-12 sm:py-16" style={{ background: "#FAFBFC" }}>
        <div className="container">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--hm-cyan)" }}>
                Choisissez votre besoin
              </p>
              <h2 className="font-semibold leading-[1.1] tracking-[-0.02em]" style={{ fontSize: "clamp(1.5rem, 2.4vw + 0.4rem, 2.2rem)", color: "var(--hm-text-main)" }}>
                Une entrée claire selon votre projet.
              </h2>
            </div>
            <Link href="/devis-rapide" className="btn-hm-magenta w-full justify-center sm:w-auto">
              Devis rapide
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {NEEDS.map(({ title, text, href, icon: Icon, accent }) => (
              <Link
                key={title}
                href={href}
                className="group flex h-full flex-col rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-5 shadow-[0_10px_24px_rgba(63,45,88,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(63,45,88,0.08)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(84,182,210,0.10)", color: accent }}>
                  <Icon size={18} />
                </div>
                <h3 className="text-[1rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--hm-text)]">{title}</h3>
                <p className="mt-1.5 flex-1 text-[13px] leading-6 text-[var(--hm-text-soft)]">{text}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold transition group-hover:gap-2.5" style={{ color: accent }}>
                  Voir le pack
                  <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="packs-textile" className="py-12 sm:py-16" style={{ background: "#ffffff" }}>
        <div className="container">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--hm-magenta)" }}>
              Packs textile
            </p>
            <h2 className="font-semibold leading-[1.1] tracking-[-0.02em]" style={{ fontSize: "clamp(1.5rem, 2.4vw + 0.4rem, 2.2rem)", color: "var(--hm-text-main)" }}>
              Trois niveaux pour avancer vite.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {PACKS.map((pack, index) => (
              <div
                key={pack.name}
                className="flex h-full flex-col rounded-[1.4rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_12px_30px_rgba(63,45,88,0.05)]"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-[var(--hm-text)]">{pack.name}</h3>
                  <span className="rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)]">
                    Pack {index + 1}
                  </span>
                </div>
                <p className="text-[13px] leading-6 text-[var(--hm-text-soft)]">{pack.usage}</p>
                <p className="mt-4 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-2 text-[12px] font-semibold text-[var(--hm-text)]">
                  Minimum indicatif : {pack.minimum}
                </p>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {pack.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[12.5px] leading-6 text-[var(--hm-text-soft)]">
                      <BadgeCheck size={15} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/devis-rapide?pack=${pack.name.toLowerCase().replaceAll(" ", "-")}`} className="btn-hm-magenta mt-6 w-full justify-center">
                  Demander un devis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16" style={{ background: "#FAFBFC" }}>
        <div className="container">
          <div className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_12px_30px_rgba(63,45,88,0.05)] sm:p-8">
            <div className="mb-7 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--hm-accent-soft-purple)] text-[var(--hm-violet)]">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--hm-text-muted)]">Notre méthode</p>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--hm-text)]">Un BAT validé avant fabrication.</h2>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              {METHOD.map((step, index) => (
                <div key={step} className="rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
                  <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[var(--hm-primary)] shadow-sm">
                    {index + 1}
                  </span>
                  <p className="text-[12.5px] font-semibold leading-5 text-[var(--hm-text)]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
