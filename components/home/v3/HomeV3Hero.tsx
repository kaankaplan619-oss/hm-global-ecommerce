import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { getT } from "@/lib/i18n/server";

const PROOFS = [
  { key: "since", icon: CalendarDays },
  { key: "local", icon: MapPin },
  { key: "bat", icon: ShieldCheck },
] as const;

export default async function HomeV3Hero() {
  const t = await getT();

  return (
    <section className="relative overflow-hidden bg-white pt-[var(--site-header-offset)] pb-12 sm:pb-16 lg:pb-24">
      <div className="container pb-12 pt-7 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-12">
        <div className="grid items-center gap-9 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
          <div className="max-w-[39rem]">
            <h1 className="[font-family:var(--font-bricolage)] text-[2rem] font-bold leading-[1.04] tracking-[-0.045em] text-[var(--hm-text)] sm:text-[3.2rem] lg:text-[3.75rem]">
              {t("about.hero.title")}
            </h1>
            <p className="mt-5 max-w-[36rem] text-[15px] leading-7 text-[var(--hm-text-soft)] sm:text-base">
              {t("about.hero.text")}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/devis-rapide"
                className="btn-hm-magenta min-h-12 w-full justify-center sm:w-auto"
              >
                {t("entreprises.hero.ctaDevis")}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/realisations"
                className="btn-hm-violet-outline min-h-12 w-full justify-center sm:w-auto"
              >
                {t("about.hero.ctaRealisations")}
                <ArrowRight size={15} />
              </Link>
            </div>

            <ul className="mt-7 hidden gap-3 border-t border-[var(--hm-line)] pt-5 sm:grid-cols-3 lg:grid">
              {PROOFS.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-start gap-2.5 text-[12px] leading-5 text-[var(--hm-text-soft)]">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hm-primary)]" strokeWidth={1.8} />
                  <span>{t(`home.about.points.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative col-span-full aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-[var(--hm-surface)]">
                <Image
                  src="/images/home/hm-hero-atelier-v2.jpg"
                  alt="Atelier de production HM Global à Souffelweyersheim"
                  fill
                  priority
                  sizes="(min-width: 1024px) 54vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[var(--hm-surface)]">
                <Image
                  src="/images/realisations/atelier-du-pide-hero-v2.jpg"
                  alt="Textiles personnalisés réalisés dans l'atelier HM Global"
                  fill
                  sizes="(min-width: 1024px) 26vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[var(--hm-surface)]">
                <Image
                  src="/images/realisations/miammi-fabrication.jpg"
                  alt="Enseigne MiAMMi fabriquée dans l'atelier HM Global"
                  fill
                  sizes="(min-width: 1024px) 26vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <ul className="mt-6 grid gap-3 border-t border-[var(--hm-line)] pt-5 sm:grid-cols-3 lg:hidden">
              {PROOFS.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-start gap-2.5 text-[12px] leading-5 text-[var(--hm-text-soft)]">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hm-primary)]" strokeWidth={1.8} />
                  <span>{t(`home.about.points.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
