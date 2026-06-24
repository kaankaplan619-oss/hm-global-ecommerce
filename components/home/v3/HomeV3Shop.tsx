import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getT } from "@/lib/i18n/server";

const ITEMS = [
  {
    labelKey: "home.poles.textile.title",
    image: "/images/realisations/atelier-du-pide-hero-v2.jpg",
    href: "/catalogue",
  },
  {
    labelKey: "home.showcase.items.businessCards.label",
    image: "/images/realisations/foch-cartes.jpg",
    href: "/impression/cartes-de-visite",
  },
  {
    labelKey: "home.showcase.items.flyers.label",
    image: "/images/realisations/ncm-flyers.jpg",
    href: "/impression/flyer-a5",
  },
] as const;

export default async function HomeV3Shop() {
  const t = await getT();

  return (
    <section id="boutique-express" className="scroll-mt-24 bg-white py-14 sm:py-20">
      <div className="container">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-tag">{t("home.v3.shop.tag")}</p>
            <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--hm-text)] sm:text-4xl">
              {t("home.v3.shop.title")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--hm-text-soft)]">{t("home.v3.shop.desc")}</p>
          </div>
          <div className="flex flex-col items-start gap-3 text-sm font-semibold sm:flex-row sm:gap-6">
            <Link href="/catalogue" className="inline-flex min-h-11 items-center gap-2 text-[var(--hm-blue)]">
              {t("home.poles.textile.cta")} <ArrowRight size={15} />
            </Link>
            <Link href="/impression" className="inline-flex min-h-11 items-center gap-2 text-[var(--hm-blue)]">
              {t("home.showcase.seeAllCta")} <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="mt-9 grid gap-6 sm:grid-cols-3 sm:gap-6">
          {ITEMS.map((item) => (
            <Link key={item.labelKey} href={item.href} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem] bg-[var(--hm-surface)]">
                <Image
                  src={item.image}
                  alt={t(item.labelKey)}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.025]"
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold text-[var(--hm-text)]">{t(item.labelKey)}</h3>
                <ArrowRight className="h-4 w-4 text-[var(--hm-primary)] transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 grid items-center gap-8 border-t border-[var(--hm-line)] pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--hm-text)] sm:text-4xl">
              {t("home.process.headingLead")} {t("home.process.headingHighlight")}.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--hm-text-soft)]">{t("home.process.intro")}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[var(--hm-surface)]">
            <Image
              src="/images/home/hm-bat-validation-v4.jpg"
              alt={t("home.process.imageAlt")}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
