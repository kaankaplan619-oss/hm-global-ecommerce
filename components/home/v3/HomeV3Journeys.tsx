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

// Dégradés de marque (flamme) — un accent par carte parcours.
const JOURNEY_ACCENTS = [
  "linear-gradient(135deg,#C13C8A,#e05fa8)", // magenta
  "linear-gradient(135deg,#3aa7c9,#54B6D2)", // cyan
  "linear-gradient(135deg,#7d4bb0,#4c2f6f)", // violet
];

export default async function HomeV3Journeys() {
  const t = await getT();

  return (
    <>
      <section
        className="relative overflow-hidden py-16 text-white sm:py-20"
        style={{
          background:
            "radial-gradient(70% 120% at 88% -10%, rgba(193,60,138,0.40), transparent 55%), radial-gradient(70% 120% at 5% 115%, rgba(84,182,210,0.28), transparent 55%), linear-gradient(150deg, #2a1942 0%, #1b1130 100%)",
        }}
      >
        {/* Texture pointillés — profondeur discrète */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(120% 100% at 50% 0%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(120% 100% at 50% 0%, black, transparent 75%)",
          }}
        />
        <div className="container relative">
          <div className="mb-9 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#e05fa8,#54B6D2)" }} />
              {t("home.v3.journeys.eyebrow")}
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">
              {t("home.v3.journeys.heading")}
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
            {JOURNEYS.map(({ key, href, icon: Icon }, i) => (
              <Link
                key={key}
                href={href}
                className="group relative flex min-h-[236px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-7 transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-[0_28px_56px_-28px_rgba(0,0,0,0.6)] sm:p-8"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition duration-300 group-hover:opacity-100"
                  style={{ background: JOURNEY_ACCENTS[i] }}
                />
                <span
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ background: JOURNEY_ACCENTS[i] }}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="relative mt-6 text-xl font-semibold tracking-[-0.02em]">
                  {t(`home.v3.journeys.${key}.title`)}
                </h3>
                <p className="relative mt-2 text-sm leading-6 text-white/60">
                  {t(`home.v3.journeys.${key}.desc`)}
                </p>
                <span className="relative mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-semibold text-white/90 transition group-hover:text-white">
                  {t(`home.v3.journeys.${key}.cta`)}
                  <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
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
