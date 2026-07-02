import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Factory, CalendarClock, ShieldCheck } from "lucide-react";
import { getT } from "@/lib/i18n/server";

/**
 * HomeAbout — section « Qui sommes-nous », placée haut dans la page
 * (retour client 2026-06-19 : trop « magasin de vêtements », pas assez l'agence).
 *
 * Présente l'AGENCE avant les produits : atelier + équipe créative à
 * Souffelweyersheim depuis 2018, production maison, BAT avant fabrication.
 * Faits réels uniquement (aucun chiffre inventé). DA magenta, i18n home.about.*.
 */

const POINTS = [
  { icon: MapPin, key: "local" },
  { icon: Factory, key: "production" },
  { icon: CalendarClock, key: "since" },
  { icon: ShieldCheck, key: "bat" },
] as const;

export default async function HomeAbout() {
  const t = await getT();
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          {/* Texte */}
          <div>
            <p className="section-tag">{t("home.about.tag")}</p>
            <h2
              className="font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--hm-text)]"
              style={{ fontSize: "clamp(1.6rem, 2.6vw + 0.4rem, 2.4rem)" }}
            >
              {t("home.about.heading")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--hm-text-soft)]">
              {t("home.about.body")}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {POINTS.map(({ icon: Icon, key }) => (
                <div key={key} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]">
                    <Icon size={16} />
                  </span>
                  <p className="text-[13.5px] leading-5 text-[var(--hm-text)]">
                    {t(`home.about.points.${key}`)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <Link href="/a-propos" className="btn-primary min-h-12 gap-2">
                {t("home.about.cta")}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Photo atelier réelle */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.8rem] border border-[var(--hm-line)] shadow-[0_16px_40px_rgba(45,35,64,0.08)]">
            <Image
              src="/images/home/hm-about-atelier-enseigne.jpg"
              alt={t("home.about.imageAlt")}
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
