import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

function IconInstagram() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.1" fill="currentColor" strokeWidth="3"/>
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

const LINKS_CATALOGUE = [
  { label: "T-shirts personnalisés", href: "/catalogue/tshirts" },
  { label: "Hoodies & Sweats", href: "/catalogue/hoodies" },
  { label: "Softshells & Vestes", href: "/catalogue/softshells" },
  { label: "Voir tout le catalogue", href: "/catalogue" },
];

const LINKS_TECHNIQUES = [
  { label: "Impression DTF", href: "/#techniques" },
  { label: "Flex / Vinyle", href: "/#techniques" },
  { label: "Broderie premium", href: "/#techniques" },
];

const LINKS_COMPTE = [
  { label: "Mon compte", href: "/mon-compte" },
  { label: "Mes commandes", href: "/mon-compte/commandes" },
  { label: "Mes factures", href: "/mon-compte/factures" },
  { label: "Connexion / Inscription", href: "/connexion" },
];

const LINKS_INFO = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV", href: "/cgv" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--hm-surface)] border-t border-[var(--hm-line)] relative overflow-hidden">
      <div className="absolute -bottom-16 -right-12 h-56 w-56 rounded-full border-[22px] border-[color:var(--hm-blue-light)]/20" />
      <div className="absolute bottom-6 -right-4 h-40 w-40 rounded-full border-[18px] border-[color:var(--hm-rose)]/18" />
      <div className="absolute bottom-12 right-16 h-28 w-28 rounded-full border-[14px] border-[color:var(--hm-purple)]/18" />

      <div className="container py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex mb-6">
              <Image
                src="/logo/hm-global-logo.png"
                alt="HM Global Agence"
                width={220}
                height={58}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed max-w-xs">
              Spécialiste du textile personnalisé depuis 2018. Basé en Alsace, nous habillons les entreprises qui veulent marquer les esprits.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://maps.google.com/?q=Souffelweyersheim"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
              >
                <MapPin size={13} className="text-[var(--hm-rose)] shrink-0" />
                Souffelweyersheim, Alsace (67)
              </a>
              <a
                href="tel:+33XXXXXXXXX"
                className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
              >
                <Phone size={13} className="text-[var(--hm-rose)] shrink-0" />
                +33 X XX XX XX XX
              </a>
              <a
                href="mailto:contact@hmglobalagence.fr"
                className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
              >
                <Mail size={13} className="text-[var(--hm-rose)] shrink-0" />
                contact@hmglobalagence.fr
              </a>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded border border-[var(--hm-line)] flex items-center justify-center text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] hover:border-[var(--hm-rose)] transition-colors"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded border border-[var(--hm-line)] flex items-center justify-center text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] hover:border-[var(--hm-rose)] transition-colors"
                aria-label="LinkedIn"
              >
                <IconLinkedin />
              </a>
            </div>
          </div>

          {/* Catalogue */}
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

          {/* Techniques */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--hm-text)] mb-5">
              Techniques
            </h4>
            <ul className="flex flex-col gap-3">
              {LINKS_TECHNIQUES.map((link) => (
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
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--hm-text)] mb-5 mt-8">
              Mon compte
            </h4>
            <ul className="flex flex-col gap-3">
              {LINKS_COMPTE.map((link) => (
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

          {/* Autres savoir-faire */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--hm-text)] mb-5">
              Nos savoir-faire
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                "Textile personnalisé",
                "Création graphique & PAO",
                "Logos & identité visuelle",
                "Enseignes",
                "Bâches publicitaires",
                "Marquage véhicule",
              ].map((service) => (
                <li key={service}>
                  <span className="text-sm text-[var(--hm-text-soft)]">{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="divider-brand" />

      <div className="container py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--hm-text-soft)]">
            © {new Date().getFullYear()} HM Global Agence — Tous droits réservés
          </p>
          <div className="flex items-center gap-6">
            {LINKS_INFO.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-[var(--hm-text-soft)] hover:text-[var(--hm-rose)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
