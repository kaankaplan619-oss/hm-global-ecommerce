import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

function IconInstagram() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.1" fill="currentColor" strokeWidth="3"/>
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

// ─── Mise à jour : toutes les catégories du catalogue ─────────────────────────
const LINKS_CATALOGUE = [
  { label: "T-shirts personnalisés",   href: "/catalogue/tshirts" },
  { label: "Polos",                    href: "/catalogue/polos" },
  { label: "Hoodies & Sweats",         href: "/catalogue/hoodies" },
  { label: "Softshells & Vestes",      href: "/catalogue/softshells" },
  { label: "Polaires & Doudounes",     href: "/catalogue/polaires" },
  { label: "Casquettes & Bonnets",     href: "/catalogue/casquettes" },
  { label: "Sacs & Goodies",           href: "/catalogue/sacs" },
  { label: "Enfants",                   href: "/catalogue/enfants" },
  { label: "Voir tout le catalogue →", href: "/catalogue" },
];

const LINKS_INFO = [
  { label: "À propos",       href: "/a-propos" },
  { label: "Techniques",     href: "/techniques" },
  { label: "Entreprises",    href: "/entreprises" },
  { label: "Réalisations",   href: "/realisations" },
  { label: "Contact",        href: "/contact" },
];

// Badges de paiement — texte uniquement pour éviter les contraintes de licences
const PAYMENT_METHODS = ["CB", "VISA", "Mastercard", "Stripe"];

export default function Footer() {
  return (
    <footer className="bg-[var(--hm-surface)] border-t-2 border-[var(--hm-line)] relative overflow-hidden">

      {/* ── Cercles décoratifs isolés ─────────────────────────────────────────
          Wrapper aria-hidden + pointer-events-none + z-0 garantit qu'ils
          ne passent jamais au-dessus du contenu texte/liens.              */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      >
        <div className="absolute -bottom-16 -right-12 h-56 w-56 rounded-full border-[22px] border-[color:var(--hm-blue-light)]/20" />
        <div className="absolute bottom-6 -right-4 h-40 w-40 rounded-full border-[18px] border-[color:var(--hm-rose)]/18" />
        <div className="absolute bottom-12 right-16 h-28 w-28 rounded-full border-[14px] border-[color:var(--hm-purple)]/18" />
      </div>

      {/* ── Contenu — z-10 pour passer au-dessus des cercles ─────────────── */}
      <div className="container relative z-10 py-16 sm:py-20">
        {/* Grille 4 colonnes équilibrées */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Logo + infos contact + réseaux */}
          <div>
            <Link href="/" className="mb-7 inline-flex items-center">
              <Image
                src="/logo/hm-global-logo.png"
                alt="HM Global Agence"
                width={208}
                height={54}
                className="h-9 w-auto max-w-full sm:h-[2.35rem]"
              />
            </Link>
            <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed max-w-xs">
              HM Global Agence est une agence créative avec atelier de production, spécialisée en textile personnalisé, communication visuelle et préparation de fichiers pour l&apos;impression.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://maps.google.com/?q=20+Rue+des+Tuileries,+67460+Souffelweyersheim"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
              >
                <MapPin size={13} className="text-[var(--hm-rose)] shrink-0" />
                20 Rue des Tuileries, 67460 Souffelweyersheim
              </a>
              <a
                href="tel:+33676161188"
                className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
              >
                <Phone size={13} className="text-[var(--hm-rose)] shrink-0" />
                06 76 16 11 88
              </a>
              <a
                href="mailto:contact@hmga.fr"
                className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
              >
                <Mail size={13} className="text-[var(--hm-rose)] shrink-0" />
                contact@hmga.fr
              </a>
              <div className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)]">
                <Clock size={13} className="text-[var(--hm-rose)] shrink-0" />
                Du lundi au vendredi, de 9h à 18h
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/hmglobalagence/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded border border-[var(--hm-line)] flex items-center justify-center text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] hover:border-[var(--hm-rose)] transition-colors"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href="https://www.facebook.com/HmGlobalAgence"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded border border-[var(--hm-line)] flex items-center justify-center text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] hover:border-[var(--hm-rose)] transition-colors"
                aria-label="Facebook"
              >
                <IconFacebook />
              </a>
            </div>
          </div>

          {/* Col 2 — Catalogue */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--hm-text)] mb-5">
              Catalogue
            </h4>
            <ul className="flex flex-col gap-3">
              {LINKS_CATALOGUE.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Informations */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--hm-text)] mb-5">
              Informations
            </h4>
            <ul className="flex flex-col gap-3">
              {LINKS_INFO.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Espace client */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--hm-text)] mb-5">
              Espace client
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/connexion"
                  className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/mon-compte"
                  className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
                >
                  Mon compte
                </Link>
              </li>
              <li>
                <Link
                  href="/mon-compte/commandes"
                  className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
                >
                  Mes commandes
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Divider brand ────────────────────────────────────────────────── */}
      <div className="divider-brand relative z-10" />

      {/* ── Barre du bas — copyright + légal + paiements ─────────────────── */}
      <div className="container relative z-10 pt-5 pb-24 sm:pb-5">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* Copyright */}
          <p className="text-xs text-[var(--hm-text-soft)] whitespace-nowrap">
            © {new Date().getFullYear()} HM Global Agence
          </p>

          {/* Liens légaux — centrés */}
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/cgv" className="text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors">
              CGV
            </Link>
            <span className="text-[var(--hm-line)] select-none">·</span>
            <Link href="/confidentialite" className="text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors">
              Confidentialité
            </Link>
            <span className="text-[var(--hm-line)] select-none">·</span>
            <Link href="/mentions-legales" className="text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors">
              Mentions légales
            </Link>
          </div>

          {/* Badges de paiement */}
          <div className="flex items-center gap-1.5">
            {PAYMENT_METHODS.map((m) => (
              <span
                key={m}
                className="inline-flex items-center rounded border border-[var(--hm-line)] bg-white px-2 py-0.5 text-[9px] font-bold tracking-wider text-[var(--hm-text-soft)]"
              >
                {m}
              </span>
            ))}
          </div>

        </div>
      </div>

    </footer>
  );
}
