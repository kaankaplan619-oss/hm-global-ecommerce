import type { Metadata } from "next";
import BackLink from "@/components/ui/BackLink";
import { MapPin, Phone, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { getT } from "@/lib/i18n/server";

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

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getT();

  const CONTACT_ITEMS = [
    {
      icon: Phone,
      label: t("contactPage.contact.phone.label"),
      value: "06 76 16 11 88",
      href: "tel:+33676161188",
    },
    {
      icon: MapPin,
      label: t("contactPage.contact.address.label"),
      value: "20 Rue des Tuileries, 67460 Souffelweyersheim",
      href: "https://maps.google.com/?q=20+Rue+des+Tuileries,+67460+Souffelweyersheim",
    },
    {
      icon: Clock,
      label: t("contactPage.contact.hours.label"),
      value: t("contactPage.contact.hours.value"),
    },
  ];

  const EXPERTISES = [
    t("contactPage.expertises.textile"),
    t("contactPage.expertises.dtfFlexEmbroidery"),
    t("contactPage.expertises.designPao"),
    t("contactPage.expertises.vehicle"),
    t("contactPage.expertises.signage"),
    t("contactPage.expertises.visual"),
  ];

  // Retour contextuel : si on arrive depuis le print (devis cartes/flyers/…),
  // on revient au print, pas à l'accueil (cohérence des couches de navigation).
  const params = await searchParams;
  const sujet = typeof params.sujet === "string" ? params.sujet : "";
  const back =
    sujet === "impression"
      ? { href: "/impression", label: t("contactPage.back.print") }
      : { href: "/", label: t("contactPage.back.home") };
  const defaultSubject = sujet === "impression" ? "Signalétique / print" : undefined;

  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="container">
        <BackLink href={back.href} label={back.label} />

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="max-w-3xl">
            <p className="section-tag">{t("contactPage.hero.tag")}</p>
            <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
              {t("contactPage.hero.title")}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
              {t("contactPage.hero.description")}
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
                {t("contactPage.expertises.title")}
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
            <ContactForm defaultSubject={defaultSubject} />

            <div className="rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-6">
              <h3 className="text-lg font-semibold text-[var(--hm-text)] mb-4">
                {t("contactPage.social.title")}
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
