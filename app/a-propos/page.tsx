import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  FileCheck2,
  Factory,
  Shirt,
  Lamp,
  Car,
  Printer,
  Store,
  PenTool,
} from "lucide-react";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "HM Global Agence : atelier de production et agence créative à Souffelweyersheim. Textile DTF, enseignes, habillage véhicule, print — produit chez nous, en Alsace.",
};

/**
 * Page À propos — refonte image-first (demande Kaan 2026-06-10) :
 * la preuve passe par les vraies photos d'atelier et de chantier, pas par des
 * listes de texte. Métiers en cartes photo, approche en 4 étapes courtes.
 */

const METIERS = [
  {
    title: "Textile personnalisé",
    chips: ["DTF", "Flex", "Broderie"],
    image: "/images/realisations/prestige-tshirts.jpg",
    alt: "T-shirts Prestige marqués en DTF à l'atelier",
    href: "/catalogue",
    icon: Shirt,
  },
  {
    title: "Enseignes & signalétique",
    chips: ["Fabrication", "Pose", "Rétroéclairage"],
    image: "/images/realisations/miammi-fabrication.jpg",
    alt: "Lettres rétroéclairées MiAMMi en cours d'assemblage à l'atelier",
    href: "/realisations",
    icon: Lamp,
  },
  {
    title: "Habillage véhicule",
    chips: ["Covering", "Découpe vinyle"],
    image: "/images/realisations/vehicule-scorpion.jpg",
    alt: "Utilitaire habillé d'un scorpion en vinyle découpé",
    href: "/realisations",
    icon: Car,
  },
  {
    title: "Impression / print",
    chips: ["Cartes", "Flyers", "Affiches"],
    image: "/images/realisations/hm-global-print.jpg",
    alt: "Flyers et cartes de visite imprimés",
    href: "/impression",
    icon: Printer,
  },
  {
    title: "Vitrines & lettrage",
    chips: ["Vinyle", "Pose sur site"],
    image: "/images/realisations/selim-vitrine.jpg",
    alt: "Vitrine habillée en lettrage vinyle chez Selim Coiffure",
    href: "/realisations",
    icon: Store,
  },
  {
    title: "Design & PAO",
    chips: ["Logo", "Fichiers prêts à imprimer"],
    image: "/images/realisations/scorpion-creation.jpg",
    alt: "Création graphique d'un scorpion avant découpe vinyle",
    href: "/contact",
    icon: PenTool,
  },
] as const;

const APPROACH = [
  {
    icon: MessageSquare,
    title: "Comprendre",
    text: "Votre besoin, votre support, votre délai.",
  },
  {
    icon: Lightbulb,
    title: "Conseiller",
    text: "La technique et la finition les plus adaptées.",
  },
  {
    icon: FileCheck2,
    title: "Valider",
    text: "Fichier préparé, BAT validé avant production.",
  },
  {
    icon: Factory,
    title: "Produire",
    text: "À l'atelier de Souffelweyersheim, puis livré ou posé.",
  },
] as const;

const FACTS = [
  { value: "100 %", label: "produit à l'atelier ou posé par nous" },
  { value: "BAT", label: "validé avant chaque production" },
  { value: "Alsace", label: "Souffelweyersheim · Strasbourg" },
  { value: "410", label: "élèves accueillis (Erasmus)" },
] as const;

const CONTACT = [
  { icon: MapPin, label: "Adresse", value: "20 Rue des Tuileries, 67460 Souffelweyersheim" },
  { icon: Clock3, label: "Horaires", value: "Du lundi au vendredi, 9h – 18h" },
  { icon: Phone, label: "Téléphone", value: "06 76 16 11 88" },
  { icon: Mail, label: "Email", value: "contact@hmga.fr" },
] as const;

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="container">
        <BackLink href="/" label="Retour à l'accueil" />

        {/* Héro : texte court + vraies photos */}
        <section className="mb-12 grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="section-tag">À propos</p>
            <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
              Une agence créative, avec un vrai atelier de production.
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--hm-text-soft)]">
              Du logo au textile marqué, de l&apos;enseigne posée au print livré :
              chez HM Global, le conseil, le fichier et la production se font au
              même endroit — notre atelier de Souffelweyersheim.
            </p>
            <div className="mt-6 flex flex-wrap gap-3.5">
              <Link href="/realisations" className="btn-primary gap-2">
                Voir nos réalisations
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn-outline">
                Nous contacter
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)]">
              <Image
                src="/videos/realisations/presse-marquage-poster.jpg"
                alt="Pressage à chaud d'un textile à l'atelier HM Global"
                fill
                sizes="(min-width:1024px) 24vw, 48vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="grid gap-3.5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)]">
                <Image
                  src="/images/realisations/miammi-fabrication.jpg"
                  alt="Enseigne lumineuse en fabrication à l'atelier"
                  fill
                  sizes="(min-width:1024px) 24vw, 48vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)]">
                <Image
                  src="/images/realisations/naga-enseigne.jpg"
                  alt="Enseigne Le Naga posée, éclairée de nuit"
                  fill
                  sizes="(min-width:1024px) 24vw, 48vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Chiffres / repères */}
        <section className="mb-14 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {FACTS.map((f) => (
            <div
              key={f.label}
              className="rounded-[1.4rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-5 py-4"
            >
              <p className="text-2xl font-semibold tracking-tight text-[var(--hm-rose)]">{f.value}</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--hm-text-soft)]">{f.label}</p>
            </div>
          ))}
        </section>

        {/* Métiers en cartes photo */}
        <section className="mb-14">
          <div className="mb-7 max-w-2xl">
            <p className="section-tag">Ce que nous faisons</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              Six métiers, un seul atelier.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {METIERS.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className="group relative block overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(63,45,88,0.12)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={m.image}
                    alt={m.alt}
                    fill
                    sizes="(min-width:1024px) 32vw, (min-width:640px) 48vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[var(--hm-rose)]">
                        <m.icon size={14} />
                      </span>
                      <p className="text-[15px] font-semibold text-white drop-shadow">{m.title}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.chips.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-white/20 px-2 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur-sm"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Approche en 4 étapes */}
        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-7 sm:p-9">
          <div className="mb-7 max-w-2xl">
            <p className="section-tag">Notre approche</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              Du besoin au produit, en 4 étapes.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {APPROACH.map((step, i) => (
              <div key={step.title} className="relative rounded-[1.4rem] border border-[var(--hm-line)] bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)]">
                    <step.icon size={18} />
                  </span>
                  <span className="text-xs font-black tracking-wide text-[var(--hm-text-soft)]/60">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mb-1 text-base font-semibold text-[var(--hm-text)]">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-[var(--hm-text-soft)]">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Erasmus + réalisations */}
        <section className="mb-14 grid items-stretch gap-4 lg:grid-cols-2">
          <div className="flex flex-col rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-rose)] p-7 sm:p-8">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--hm-rose)]">
              <GraduationCap size={20} />
            </span>
            <h2 className="mb-3 text-2xl font-semibold text-[var(--hm-text)]">
              Une agence engagée, ancrée et ouverte
            </h2>
            <p className="mb-6 text-sm leading-7 text-[var(--hm-text-soft)]">
              Nous croyons à la transmission du métier : dans le cadre d&apos;échanges
              Erasmus, nous avons accueilli{" "}
              <strong className="text-[var(--hm-text)]">410 élèves</strong> dans notre
              atelier.
            </p>
            <Link href="/engagements" className="btn-outline mt-auto gap-2 self-start">
              Découvrir nos engagements
              <ArrowRight size={16} />
            </Link>
          </div>

          <Link
            href="/realisations"
            className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[2rem] border border-[var(--hm-line)]"
          >
            <Image
              src="/images/realisations/miammi-pose.jpg"
              alt="Enseignes MiAMMi posées en façade"
              fill
              sizes="(min-width:1024px) 48vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            <div className="relative p-7 sm:p-8">
              <h2 className="mb-2 text-2xl font-semibold text-white drop-shadow">
                Nos réalisations parlent pour nous
              </h2>
              <p className="mb-4 max-w-md text-sm leading-6 text-white/90">
                Textile, enseignes, véhicules, print : des projets concrets,
                produits chez nous pour des entreprises d&apos;Alsace.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--hm-text)]">
                Voir les réalisations
                <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        </section>

        {/* Coordonnées compactes */}
        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-7 sm:p-8">
          <h2 className="mb-5 text-2xl font-semibold text-[var(--hm-text)]">
            Basés à Souffelweyersheim, au service des entreprises
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {CONTACT.map((c) => (
              <div key={c.label} className="flex items-start gap-3 rounded-[1.2rem] bg-white p-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)]">
                  <c.icon size={15} />
                </span>
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)]">
                    {c.label}
                  </p>
                  <p className="text-sm leading-snug text-[var(--hm-text)]">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-white p-8 text-center shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
          <h2 className="mb-3 text-2xl font-semibold text-[var(--hm-text)]">
            Un besoin précis ou un projet global ?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            Commande textile, print en ligne ou projet complet de communication
            visuelle : on conseille, on produit, on livre.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="btn-primary gap-2">
              Nous contacter
              <ArrowRight size={16} />
            </Link>
            <Link href="/catalogue" className="btn-outline">
              Voir le catalogue
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
