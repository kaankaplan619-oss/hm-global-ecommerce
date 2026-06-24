import Link from "next/link";
import {
  ArrowRight,
  Building2,
  PackageCheck,
  Palette,
  Printer,
  Shirt,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getT } from "@/lib/i18n/server";

type Journey = {
  key: "project" | "express" | "enterprise";
  href: string;
  icon: LucideIcon;
};

const JOURNEYS: Journey[] = [
  { key: "project", href: "/contact?sujet=devis", icon: Sparkles },
  { key: "express", href: "#boutique-express", icon: PackageCheck },
  { key: "enterprise", href: "/entreprises", icon: Building2 },
];

const SERVICES = [
  { key: "textile", href: "/catalogue", icon: Shirt },
  { key: "impression", href: "/impression", icon: Printer },
  { key: "enseignes", href: "/enseignes", icon: Store },
  { key: "covering", href: "/covering", icon: Truck },
  { key: "branding", href: "/branding", icon: Palette },
] as const;

export default async function HomeV3Journeys() {
  const t = await getT();

  return (
    <>
      <section className="bg-[var(--hm-purple-dark)] py-12 text-white sm:py-16">
        <div className="container grid gap-3 sm:gap-4 lg:grid-cols-3">
          {JOURNEYS.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="group flex min-h-[230px] flex-col rounded-[1.5rem] border border-white/10 p-7 transition duration-200 hover:border-white/25 hover:bg-white/[0.05] sm:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--hm-primary)] transition group-hover:bg-white/15">
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em]">
                {t(`home.v3.journeys.${key}.title`)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                {t(`home.v3.journeys.${key}.desc`)}
              </p>
              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:border-white group-hover:bg-white/10">
                {t(`home.v3.journeys.${key}.cta`)}
                <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="nos-poles" className="scroll-mt-24 bg-white py-12 sm:py-16">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="section-tag">{t("home.poles.tag")}</p>
              <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--hm-text)] sm:text-4xl">
                {t("home.poles.title")}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--hm-text-soft)]">
                {t("home.poles.subtitle")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map(({ key, href, icon: Icon }) => (
                <Link
                  key={key}
                  href={href}
                  className="group flex items-center gap-4 rounded-2xl border border-[var(--hm-line)] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--hm-primary)]/40 hover:shadow-[0_14px_30px_rgba(63,45,88,0.10)] sm:last:col-span-2"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] transition duration-200 group-hover:bg-[var(--hm-primary)] group-hover:text-white">
                    <Icon size={19} strokeWidth={1.8} />
                  </span>
                  <span className="flex-1 text-[15px] font-semibold text-[var(--hm-text)]">
                    {t(`home.poles.${key}.title`)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--hm-text-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--hm-primary)]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
