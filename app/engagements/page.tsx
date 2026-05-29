import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Globe2,
  Users,
  HeartHandshake,
  MapPin,
  Leaf,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nos engagements",
  description:
    "HM Global Agence, une structure ancrée en Alsace et ouverte sur l'Europe : accueil d'échanges Erasmus, transmission, production locale et accompagnement humain.",
};

const STATS = [
  { value: "410", label: "élèves accueillis", sub: "dans le cadre d'échanges avec la Turquie" },
  { value: "Erasmus", label: "programme européen", sub: "mobilité, rencontre et transmission" },
  { value: "Alsace", label: "atelier local", sub: "Souffelweyersheim, près de Strasbourg" },
  { value: "Humain", label: "accompagnement direct", sub: "conseil, BAT et suivi de production" },
];

const VALUES = [
  {
    icon: MapPin,
    title: "Ancrage local",
    text: "Une production réalisée dans notre atelier en Alsace, au plus près des entreprises, associations et structures que nous accompagnons.",
  },
  {
    icon: Globe2,
    title: "Ouverture européenne",
    text: "Participer à des échanges Erasmus, c'est faire vivre des rencontres concrètes entre jeunes, cultures et savoir-faire au-delà des frontières.",
  },
  {
    icon: HeartHandshake,
    title: "Transmission",
    text: "Accueillir, expliquer notre métier, montrer un atelier réel : la transmission fait partie de notre manière de travailler.",
  },
  {
    icon: Leaf,
    title: "Production responsable",
    text: "Conseiller la bonne technique, préparer des fichiers propres et produire juste : moins de gaspillage, des supports qui durent.",
  },
];

export default function EngagementsPage() {
  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="container">
        <nav className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] mb-8">
          <Link href="/" className="hover:text-[var(--hm-rose)]">Accueil</Link>
          <span>/</span>
          <Link href="/a-propos" className="hover:text-[var(--hm-rose)]">À propos</Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">Nos engagements</span>
        </nav>

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <p className="section-tag">Nos engagements</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--hm-text)] leading-tight tracking-tight mb-5">
            Une agence ancrée en Alsace, ouverte sur l&apos;Europe.
          </h1>
          <p className="text-base text-[var(--hm-text-soft)] max-w-3xl leading-8">
            HM Global n&apos;est pas qu&apos;un atelier de production. Nous croyons à un
            métier qui se transmet, à un territoire qui se construit avec ses entreprises,
            et à des rencontres qui dépassent nos murs. Notre participation à des échanges
            Erasmus et notre attachement à une production locale en sont l&apos;expression
            concrète.
          </p>
        </section>

        <section className="mb-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6"
            >
              <p className="text-3xl md:text-4xl font-semibold text-[var(--hm-rose)] leading-none mb-2">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-[var(--hm-text)] mb-1">{stat.label}</p>
              <p className="text-xs text-[var(--hm-text-soft)] leading-relaxed">{stat.sub}</p>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 mb-14">
          <div className="rounded-3xl border border-[var(--hm-line)] bg-white shadow-[0_18px_48px_rgba(63,45,88,0.08)] p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)] flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </span>
              <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                Notre engagement Erasmus
              </h2>
            </div>
            <p className="text-sm text-[var(--hm-text-soft)] leading-7 mb-4">
              Dans le cadre d&apos;échanges européens, nous avons accueilli{" "}
              <strong className="text-[var(--hm-text)]">410 élèves venus de Turquie</strong>,
              pour leur faire découvrir un métier, un atelier et une manière de travailler.
              Ces moments dépassent largement la production : ils créent des liens, ouvrent
              des perspectives et donnent du sens à ce que nous faisons.
            </p>
            <p className="text-sm text-[var(--hm-text-soft)] leading-7">
              Pour HM Global, participer à Erasmus, c&apos;est rendre concret un échange entre
              jeunes, cultures et savoir-faire — et rappeler qu&apos;une entreprise locale peut
              s&apos;inscrire dans une dynamique européenne.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-white text-[var(--hm-rose)] flex items-center justify-center shrink-0">
                <Users size={20} />
              </span>
              <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                Pourquoi cela compte
              </h2>
            </div>
            <ul className="space-y-4">
              {[
                "Transmettre un savoir-faire réel, dans un atelier qui produit chaque jour.",
                "Faire vivre des rencontres entre jeunes de plusieurs pays.",
                "Montrer qu'une PME ancrée localement peut s'ouvrir à l'Europe.",
                "Donner du sens au métier au-delà de la simple commande.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Sparkles size={16} className="text-[var(--hm-rose)] mt-0.5 shrink-0" />
                  <span className="text-sm text-[var(--hm-text-soft)] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-6">
            <p className="section-tag">Nos valeurs</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--hm-text)]">
              Ce qui guide notre travail
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="rounded-3xl border border-[var(--hm-line)] bg-white p-6"
                >
                  <span className="w-10 h-10 rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)] flex items-center justify-center mb-4">
                    <Icon size={18} />
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--hm-text)] mb-2">{value.title}</h3>
                  <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed">{value.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--hm-line)] bg-white shadow-[0_18px_48px_rgba(63,45,88,0.06)] p-8 text-center">
          <h2 className="text-2xl font-semibold text-[var(--hm-text)] mb-4">
            Travaillons ensemble sur votre projet
          </h2>
          <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed max-w-2xl mx-auto mb-6">
            Que vous soyez une entreprise, une association ou une collectivité, HM Global vous
            accompagne avec la même exigence : conseil, préparation de fichier et production
            locale soignée.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/contact" className="btn-primary gap-2">
              Nous contacter
              <ArrowRight size={16} />
            </Link>
            <Link href="/a-propos" className="btn-outline">
              En savoir plus sur l&apos;agence
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
