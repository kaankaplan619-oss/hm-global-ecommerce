import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, MapPin, Phone, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez HM Global Agence, agence créative avec atelier de production à Souffelweyersheim, spécialisée en textile personnalisé et communication visuelle.",
};

const ACTIVITIES = [
  "Textile personnalisé",
  "DTF",
  "Flex",
  "Broderie",
  "Design",
  "Logo",
  "Préparation de fichier / PAO",
  "Lettrage",
  "Habillage véhicule",
  "Totems",
  "Signalétique / print",
  "Communication visuelle",
];

const APPROACH = [
  "Comprendre le besoin et le support à produire",
  "Conseiller la technique ou la finition la plus adaptée",
  "Préparer le visuel ou le fichier si nécessaire",
  "Lancer une production propre, lisible et cohérente avec l'image de marque",
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="container">
        <nav className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] mb-8">
          <Link href="/" className="hover:text-[var(--hm-rose)]">Accueil</Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">À propos</span>
        </nav>

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <p className="section-tag">À propos</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--hm-text)] leading-tight tracking-tight mb-5">
            HM Global Agence, une structure créative avec atelier de production.
          </h1>
          <p className="text-base text-[var(--hm-text-soft)] max-w-3xl leading-8">
            HM Global accompagne les professionnels qui veulent une communication plus claire, plus visible et mieux produite. Notre positionnement réunit le conseil créatif, la préparation technique des fichiers et la production de supports concrets, du textile personnalisé à la signalétique.
          </p>
        </section>

        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 mb-14">
          <div className="rounded-3xl border border-[var(--hm-line)] bg-white shadow-[0_18px_48px_rgba(63,45,88,0.08)] p-8">
            <h2 className="text-2xl font-semibold text-[var(--hm-text)] mb-4">
              Ce que nous faisons
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {ACTIVITIES.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-[var(--hm-rose)] mt-0.5 shrink-0" />
                  <p className="text-sm text-[var(--hm-text-soft)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-8">
            <h2 className="text-2xl font-semibold text-[var(--hm-text)] mb-4">
              Notre approche
            </h2>
            <div className="space-y-4">
              {APPROACH.map((item, index) => (
                <div key={item} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)] flex items-center justify-center text-xs font-black shrink-0">
                    0{index + 1}
                  </div>
                  <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8 mb-14">
          <h2 className="text-2xl font-semibold text-[var(--hm-text)] mb-4">
            Basés à Souffelweyersheim, au service des entreprises
          </h2>
          <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed max-w-3xl mb-6">
            Nous travaillons avec une logique simple : proposer un accompagnement concret, des visuels propres, une préparation de fichier sérieuse et une production adaptée aux usages réels des entreprises, associations et structures professionnelles.
          </p>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card p-5">
              <MapPin size={18} className="text-[var(--hm-rose)] mb-3" />
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hm-text-soft)] font-semibold mb-1">Adresse</p>
              <p className="text-sm text-[var(--hm-text)]">20 Rue des Tuileries, 67460 Souffelweyersheim</p>
            </div>
            <div className="card p-5">
              <Clock3 size={18} className="text-[var(--hm-rose)] mb-3" />
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hm-text-soft)] font-semibold mb-1">Horaires</p>
              <p className="text-sm text-[var(--hm-text)]">Du lundi au vendredi, de 9h à 18h</p>
            </div>
            <div className="card p-5">
              <Phone size={18} className="text-[var(--hm-rose)] mb-3" />
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hm-text-soft)] font-semibold mb-1">Téléphone</p>
              <p className="text-sm text-[var(--hm-text)]">06 76 16 11 88</p>
            </div>
            <div className="card p-5">
              <Mail size={18} className="text-[var(--hm-rose)] mb-3" />
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hm-text-soft)] font-semibold mb-1">Email</p>
              <p className="text-sm text-[var(--hm-text)]">contact@hmga.fr</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--hm-line)] bg-white shadow-[0_18px_48px_rgba(63,45,88,0.06)] p-8 text-center">
          <h2 className="text-2xl font-semibold text-[var(--hm-text)] mb-4">
            Un besoin précis ou un projet global ?
          </h2>
          <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed max-w-2xl mx-auto mb-6">
            HM Global peut intervenir aussi bien sur une commande textile que sur un projet plus large de communication visuelle, avec une logique de conseil, de design et de production.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
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
