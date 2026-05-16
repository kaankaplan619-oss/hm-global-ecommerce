import Image from "next/image";
import Link from "next/link";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.1" fill="currentColor" strokeWidth="3" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const LINKS_CATALOGUE = [
  { label: "T-shirts personnalisés", href: "/catalogue/tshirts" },
  { label: "Polos", href: "/catalogue/polos" },
  { label: "Hoodies & Sweats", href: "/catalogue/hoodies" },
  { label: "Softshells & Vestes", href: "/catalogue/softshells" },
  { label: "Polaires & Doudounes", href: "/catalogue/polaires" },
  { label: "Casquettes & Bonnets", href: "/catalogue/casquettes" },
  { label: "Sacs & Tote bags", href: "/catalogue/sacs" },
  { label: "Mugs & Goodies", href: "/catalogue/goodies" },
];

const LINKS_IMPRESSION = [
  { label: "Cartes de visite", href: "/impression#business-cards" },
  { label: "Flyers", href: "/impression#flyer" },
  { label: "Affiches & posters", href: "/impression#poster" },
  { label: "Toiles canvas", href: "/impression#canvas" },
];

const LINKS_INFO = [
  { label: "À propos", href: "/a-propos" },
  { label: "Techniques", href: "/techniques" },
  { label: "Entreprises", href: "/entreprises" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Contact", href: "/contact" },
];

const PAYMENT_METHODS = ["CB", "VISA", "Mastercard", "Stripe"];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[rgba(63,45,88,0.08)] bg-[linear-gradient(180deg,#433053_0%,#3f2d58_100%)] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0)), radial-gradient(circle at 16% 16%, rgba(110,193,223,0.08), transparent 22%), radial-gradient(circle at 84% 82%, rgba(177,63,116,0.08), transparent 18%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 pt-12 sm:px-10 lg:px-16 lg:pb-12 lg:pt-16">
        <div className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/54">
              HM Global Agence
            </p>
            <h2 className="mt-3 max-w-[15ch] text-3xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[3.4rem]">
              Textile, impression & signalétique — un accompagnement complet pour votre image.
            </h2>
          </div>
          <p className="max-w-[36rem] text-sm leading-7 text-white/72">
            Textile personnalisé, préparation de fichiers et accompagnement visuel
            pour les entreprises, clubs et marques qui veulent un rendu net et un échange simple.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="rounded-[1.9rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.14)] sm:p-7">
              <Link href="/" className="inline-block">
                <Image
                  src="/logo/hm-global-logo.png"
                  alt="HM Global Agence"
                  width={210}
                  height={54}
                  className="h-11 w-auto"
                />
              </Link>

              <p className="mt-5 max-w-[32rem] text-[14px] leading-7 text-white/70">
                Atelier de production, accompagnement graphique et suivi de commande
                pour des projets textile plus propres, plus lisibles et mieux cadrés.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href="https://maps.google.com/?q=20+Rue+des+Tuileries,+67460+Souffelweyersheim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[1.2rem] border border-white/10 bg-black/6 px-4 py-3 text-sm text-white/76 transition hover:bg-white/8"
                >
                  <div className="flex items-center gap-2 text-white/92">
                    <MapPin size={14} />
                    <span className="font-semibold">Souffelweyersheim</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-white/64">
                    20 Rue des Tuileries, 67460 Souffelweyersheim
                  </p>
                </a>

                <div className="rounded-[1.2rem] border border-white/10 bg-black/6 px-4 py-3">
                  <div className="flex items-center gap-2 text-white/92">
                    <Clock3 size={14} />
                    <span className="font-semibold">Disponibilités</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-white/64">Lun - Ven, 9h - 18h</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/76">
                <a href="tel:+33676161188" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/6 px-4 py-2 transition hover:bg-white/8">
                  <Phone size={14} />
                  06 76 16 11 88
                </a>
                <a href="mailto:contact@hmga.fr" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/6 px-4 py-2 transition hover:bg-white/8">
                  <Mail size={14} />
                  contact@hmga.fr
                </a>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <a
                  href="https://www.instagram.com/hmglobalagence/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/6 text-white/76 transition hover:bg-white/8 hover:text-white"
                  aria-label="Instagram"
                >
                  <IconInstagram />
                </a>
                <a
                  href="https://www.facebook.com/HmGlobalAgence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/6 text-white/76 transition hover:bg-white/8 hover:text-white"
                  aria-label="Facebook"
                >
                  <IconFacebook />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[1.6rem] border border-white/8 bg-black/5 p-5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/54">
                Catalogue
              </h4>
              <ul className="mt-4 space-y-3">
                {LINKS_CATALOGUE.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/76 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/catalogue" className="text-sm font-semibold text-white">
                    Voir tout le catalogue
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-[1.6rem] border border-white/8 bg-black/5 p-5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/54">
                Impression
              </h4>
              <ul className="mt-4 space-y-3">
                {LINKS_IMPRESSION.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/76 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link href="/contact?sujet=impression" className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-white hover:text-[var(--hm-text)]">
                    Demander un devis
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-[1.6rem] border border-white/8 bg-black/5 p-5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/54">
                Informations
              </h4>
              <ul className="mt-4 space-y-3">
                {LINKS_INFO.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/76 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.6rem] border border-white/8 bg-black/5 p-5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/54">
                Espace client
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/connexion" className="text-sm text-white/76 transition hover:text-white">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link href="/mon-compte" className="text-sm text-white/76 transition hover:text-white">
                    Mon compte
                  </Link>
                </li>
                <li>
                  <Link href="/mon-compte/commandes" className="text-sm text-white/76 transition hover:text-white">
                    Mes commandes
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/54">
            <span>© {new Date().getFullYear()} HM Global Agence</span>
            <Link href="/cgv" className="transition hover:text-white">CGV</Link>
            <Link href="/confidentialite" className="transition hover:text-white">Confidentialité</Link>
            <Link href="/mentions-legales" className="transition hover:text-white">Mentions légales</Link>
          </div>

          <div className="flex items-center gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-full border border-white/10 bg-black/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/68"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
