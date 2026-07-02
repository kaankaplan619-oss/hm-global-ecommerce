import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { getT } from "@/lib/i18n/server";

export default async function HomeV3FinalCTA() {
  const t = await getT();

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container">
        <div
          className="relative overflow-hidden rounded-[2rem] px-7 py-14 shadow-[0_40px_80px_-40px_rgba(59,35,90,0.55)] sm:px-14 sm:py-16"
          style={{
            background:
              "radial-gradient(90% 130% at 100% -10%, rgba(193,60,138,0.45), transparent 55%), radial-gradient(80% 120% at -10% 115%, rgba(84,182,210,0.30), transparent 55%), linear-gradient(150deg, #2a1942 0%, #1b1130 100%)",
          }}
        >
          {/* Texture pointillés — profondeur discrète */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(120% 120% at 50% 0%, black, transparent 72%)",
              WebkitMaskImage:
                "radial-gradient(120% 120% at 50% 0%, black, transparent 72%)",
            }}
          />

          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "linear-gradient(135deg,#e05fa8,#54B6D2)" }}
              />
              {t("home.finalcta.eyebrow")}
            </span>

            <h2 className="mt-5 text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[3.25rem]">
              {t("home.finalcta.titleLead")}{" "}
              <span className="bg-gradient-to-r from-[#f07cbb] via-[#c877e0] to-[#5cc3de] bg-clip-text text-transparent">
                {t("home.finalcta.titleHighlight")}
              </span>{" "}
              ?
            </h2>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/65 sm:text-base">
              {t("home.finalcta.subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/contact?sujet=devis"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
                style={{
                  background: "linear-gradient(135deg,#C13C8A,#b13f74)",
                  boxShadow: "0 14px 34px -10px rgba(193,60,138,0.65)",
                }}
              >
                {t("home.finalcta.ctaQuote")}
                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/[0.06] sm:w-auto"
              >
                {t("home.finalcta.ctaCatalogue")}
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Réassurance — lève la friction au moment de convertir */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-medium text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={15} className="text-[#5cc3de]" /> {t("home.finalcta.trustFree")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} className="text-[#5cc3de]" /> {t("home.finalcta.trustFast")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#5cc3de]" /> {t("home.finalcta.trustNoCommit")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
