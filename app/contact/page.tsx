import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.1" fill="currentColor" strokeWidth="3" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez HM Global Agence à Souffelweyersheim pour vos projets de textile personnalisé, communication visuelle, design et production.",
};

const CONTACT_ITEMS = [
  {
    icon: Phone,
    label: "Téléphone",
    value: "06 76 16 11 88",
    href: "tel:+33676161188",
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@hmga.fr",
    href: "mailto:contact@hmga.fr",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "20 Rue des Tuileries, 67460 Souffelweyersheim",
    href: "https://maps.google.com/?q=20+Rue+des+Tuileries,+67460+Souffelweyersheim",
  },
  {
    icon: Clock,
    label: "Horaires",
    value: "Du lundi au vendredi, de 9h à 18h",
  },
];

const EXPERTISES = [
  "Textile personnalisé",
  "DTF, flex et broderie",
  "Design, logo et préparation de fichier / PAO",
  "Lettrage et habillage véhicule",
  "Totems, signalétique et print",
  "Communication visuelle",
];

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="container">
        <nav className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] mb-8">
          <Link href="/" className="hover:text-[var(--hm-rose)]">Accueil</Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">Contact</span>
        </nav>

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="max-w-3xl">
            <p className="section-tag">Contact</p>
            <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
              Parlons de votre besoin textile, visuel ou projet sur mesure.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
              HM Global Agence accompagne les entreprises, associations et équipes qui veulent
              une image de marque cohérente, visible et bien produite. Nous intervenons à la fois
              comme agence créative et comme atelier de production.
            </p>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }) => {
                const content = (
                  <div className="card p-5 h-full">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--hm-accent-soft-purple)] text-[var(--hm-purple)] flex items-center justify-center mb-4">
                      <Icon size={18} />
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hm-text-soft)] font-semibold mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-[var(--hm-text)] leading-relaxed">
                      {value}
                    </p>
                  </div>
                );

                return href ? (
                  <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
                    {content}
                  </a>
                ) : (
                  <div key={label}>{content}</div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6">
              <h2 className="text-xl font-semibold text-[var(--hm-text)] mb-4">
                Ce que nous pouvons produire pour vous
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {EXPERTISES.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[var(--hm-rose)] mt-0.5 shrink-0" />
                    <p className="text-sm text-[var(--hm-text-soft)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--hm-line)] bg-white shadow-[0_18px_48px_rgba(63,45,88,0.08)] p-7">
              <h2 className="text-2xl font-semibold text-[var(--hm-text)] mb-4">
                Une réponse claire et concrète
              </h2>
              <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed mb-6">
                Pour une première prise de contact, l&apos;idéal est de nous indiquer votre besoin, le type de support souhaité et si vous avez déjà un visuel ou un logo prêt à être exploité.
              </p>
              <div className="space-y-3 text-sm text-[var(--hm-text-soft)]">
                <p>Vous pouvez nous contacter pour :</p>
                <ul className="space-y-2">
                  <li>• un projet de textile personnalisé pour votre équipe</li>
                  <li>• une demande de DTF, flex ou broderie</li>
                  <li>• la création d&apos;un logo ou d&apos;une identité visuelle</li>
                  <li>• la préparation de fichiers / PAO</li>
                  <li>• du lettrage, un habillage véhicule, un totem ou de la signalétique</li>
                </ul>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a href="mailto:contact@hmga.fr" className="btn-primary gap-2">
                  Nous écrire
                  <ArrowRight size={16} />
                </a>
                <a href="tel:+33676161188" className="btn-outline">
                  Appeler HM Global
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-6">
              <h3 className="text-lg font-semibold text-[var(--hm-text)] mb-4">
                Réseaux sociaux
              </h3>
              <div className="flex flex-col gap-3">
                <a
                  href="https://www.instagram.com/hmglobalagence/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
                >
                  <span className="text-[var(--hm-rose)]">
                    <IconInstagram />
                  </span>
                  instagram.com/hmglobalagence
                </a>
                <a
                  href="https://www.facebook.com/HmGlobalAgence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
                >
                  <span className="text-[var(--hm-rose)]">
                    <IconFacebook />
                  </span>
                  facebook.com/HmGlobalAgence
                </a>
                <a
                  href="https://www.hm-global.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
                >
                  <ArrowRight size={16} className="text-[var(--hm-rose)]" />
                  www.hm-global.fr
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
