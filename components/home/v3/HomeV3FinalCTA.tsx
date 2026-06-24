import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { getT } from "@/lib/i18n/server";

export default async function HomeV3FinalCTA() {
  const t = await getT();

  return (
    <section className="bg-[var(--hm-purple-dark)] py-14 text-white sm:py-20">
      <div className="container grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold leading-[1.06] tracking-[-0.04em] sm:text-5xl">
            {t("home.finalcta.titleLead")} {t("home.finalcta.titleHighlight")} ?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">{t("home.finalcta.subtitle")}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/contact?sujet=devis" className="btn-hm-magenta min-h-12 w-full justify-center sm:w-auto">
              {t("home.finalcta.ctaQuote")}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-semibold text-white transition hover:border-white sm:w-auto"
            >
              {t("home.finalcta.ctaCatalogue")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <Send className="hidden h-24 w-24 rotate-[-10deg] text-[var(--hm-primary)] lg:block" strokeWidth={1.25} aria-hidden="true" />
      </div>
    </section>
  );
}
