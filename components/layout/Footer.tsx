import Image from "next/image";
import Link from "next/link";
import { Clock3, Mail, MapPin, Phone, ShieldCheck, Timer, Truck } from "lucide-react";

/**
 * Footer HM Global Agence — version éditoriale premium (P2).
 *
 * Direction artistique :
 *   - Fond crème, accents cyan + magenta sur traits fins
 *   - Colonne 1 (manifeste agence + contact)
 *   - 3 colonnes nav (Commander, Expertises, Agence)
 *   - Ligne confiance avant légal
 *   - Plus éditorial, moins "dashboard"
 *
 * Anciens tokens (--hm-rose, --hm-purple) préservés mais accents
 * principaux migrés vers --hm-cyan / --hm-magenta / --hm-violet.
 */

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

const NAV_COMMANDER = [
  { label: "Textile personnalisé",      href: "/catalogue" },
  { label: "Impression",                href: "/impression" },
  { label: "Suivi de commande",         href: "/mon-compte/commandes" },
  { label: "Demander un devis global",  href: "/contact?sujet=devis" },
];

const NAV_EXPERTISES = [
  { label: "DTF / Flex",     href: "/techniques" },
  { label: "Broderie",       href: "/techniques" },
  { label: "Print",          href: "/impression" },
  { label: "Signalétique",   href: "/contact?sujet=signaletique" },
];

const NAV_AGENCE = [
  { label: "À propos",      href: "/a-propos" },
  { label: "Nos engagements", href: "/engagements" },
  { label: "Réalisations",  href: "/realisations" },
  { label: "Contact",       href: "/contact" },
];

const TRUST_LINE = [
  { icon: ShieldCheck, label: "BAT avant production" },
  { icon: Timer,       label: "Devis sous 24h" },
  { icon: Truck,       label: "Livraison France" },
] as const;

const PAYMENT_METHODS = ["CB", "VISA", "Mastercard", "Stripe"];

export default function Footer() {
  return (
    <footer
      className="relative text-[var(--hm-text-main)]"
      style={{
        background: "#ffffff",
        borderTop: "1px solid rgba(45,35,64,0.08)",
      }}
    >
      {/* Trait fin cyan en haut (discret) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(84,182,210,0.22) 50%, transparent 100%)",
        }}
      />

      <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-12 sm:px-10 sm:pb-8 lg:px-16 lg:pb-10 lg:pt-16">

        {/* ── Grille principale ───────────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] lg:gap-12">

          {/* ── Colonne 1 — Manifeste agence + contact ───────────────── */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logo/hm-global-logo.png"
                alt="HM Global Agence"
                width={220}
                height={56}
                className="h-10 w-auto"
              />
            </Link>

            <p
              className="mt-5 max-w-[28rem] text-[13.5px] leading-[1.65]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              <strong style={{ color: "var(--hm-text-main)" }}>
                Atelier de communication visuelle en Alsace.
              </strong>{" "}
              Textile, print, signalétique et accompagnement graphique pour les
              entreprises.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="https://maps.google.com/?q=20+Rue+des+Tuileries,+67460+Souffelweyersheim"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-[13px] leading-6 transition"
                style={{ color: "var(--hm-text-muted-2)" }}
              >
                <MapPin
                  size={15}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--hm-cyan)" }}
                />
                <span>
                  <span
                    className="block font-semibold"
                    style={{ color: "var(--hm-text-main)" }}
                  >
                    20 Rue des Tuileries
                  </span>
                  67460 Souffelweyersheim
                </span>
              </a>

              <a
                href="tel:+33676161188"
                className="flex items-center gap-2.5 text-[13px] transition hover:opacity-80"
                style={{ color: "var(--hm-text-muted-2)" }}
              >
                <Phone
                  size={15}
                  className="shrink-0"
                  style={{ color: "var(--hm-cyan)" }}
                />
                <span style={{ color: "var(--hm-text-main)" }}>
                  06 76 16 11 88
                </span>
              </a>

              <a
                href="/contact"
                className="flex items-center gap-2.5 text-[13px] transition hover:opacity-80"
                style={{ color: "var(--hm-text-muted-2)" }}
              >
                <Mail
                  size={15}
                  className="shrink-0"
                  style={{ color: "var(--hm-cyan)" }}
                />
                <span style={{ color: "var(--hm-text-main)" }}>
                  Nous écrire
                </span>
              </a>

              <div
                className="flex items-center gap-2.5 text-[13px]"
                style={{ color: "var(--hm-text-muted-2)" }}
              >
                <Clock3
                  size={15}
                  className="shrink-0"
                  style={{ color: "var(--hm-cyan)" }}
                />
                Lun–Ven, 9h–18h
              </div>
            </div>

            {/* Social */}
            <div className="mt-6 flex items-center gap-2">
              <a
                href="https://www.instagram.com/hmglobalagence/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105"
                style={{
                  background: "#FAFBFC",
                  color: "var(--hm-violet)",
                  border: "1px solid rgba(45,35,64,0.08)",
                }}
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href="https://www.facebook.com/HmGlobalAgence"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105"
                style={{
                  background: "#FAFBFC",
                  color: "var(--hm-violet)",
                  border: "1px solid rgba(45,35,64,0.08)",
                }}
                aria-label="Facebook"
              >
                <IconFacebook />
              </a>
            </div>
          </div>

          {/* ── Colonnes nav — 2 colonnes sur mobile (plus compact),
                 puis intégrées à la grille 4-col en desktop (lg:contents) ── */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:contents">
            <FooterColumn title="Commander" links={NAV_COMMANDER} highlightLast />
            <FooterColumn title="Expertises" links={NAV_EXPERTISES} />
            <FooterColumn title="Agence" links={NAV_AGENCE} />
          </div>
        </div>

        {/* ── Ligne confiance ─────────────────────────────────────────── */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl px-6 py-4"
          style={{
            background: "#FAFBFC",
            border: "1px solid rgba(45,35,64,0.06)",
          }}
        >
          {TRUST_LINE.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 text-[12px] font-semibold"
              style={{ color: "var(--hm-text-main)" }}
            >
              <Icon size={14} style={{ color: "var(--hm-cyan)" }} />
              {label}
            </span>
          ))}
        </div>

        {/* ── Bas de footer — légal + paiements ───────────────────────── */}
        <div
          className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "rgba(45,35,64,0.08)" }}
        >
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]"
            style={{ color: "var(--hm-text-muted-2)" }}
          >
            <span>© 2018 HM Global Agence</span>
            <Link
              href="/sav"
              className="transition hover:opacity-80"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              SAV &amp; suivi
            </Link>
            <Link
              href="/cgv"
              className="transition hover:opacity-80"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              CGV
            </Link>
            <Link
              href="/confidentialite"
              className="transition hover:opacity-80"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              Confidentialité
            </Link>
            <Link
              href="/mentions-legales"
              className="transition hover:opacity-80"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              Mentions légales
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{
                  color: "var(--hm-text-muted-2)",
                  border: "1px solid rgba(45,35,64,0.08)",
                }}
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

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composant colonne

function FooterColumn({
  title,
  links,
  highlightLast = false,
}: {
  title: string;
  links: { label: string; href: string }[];
  highlightLast?: boolean;
}) {
  return (
    <div>
      <h4
        className="text-[10px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--hm-cyan)" }}
      >
        {title}
      </h4>
      <ul className="mt-5 space-y-2.5">
        {links.map((link, idx) => {
          const isHighlight = highlightLast && idx === links.length - 1;
          return (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-[13px] transition hover:opacity-80"
                style={{
                  color: isHighlight
                    ? "var(--hm-magenta)"
                    : "var(--hm-text-muted-2)",
                  fontWeight: isHighlight ? 600 : 400,
                }}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
