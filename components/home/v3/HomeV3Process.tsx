import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileText, Truck, Upload } from "lucide-react";
import { getT } from "@/lib/i18n/server";

const STEPS = [
  { key: "step1", icon: Upload },
  { key: "step2", icon: FileText },
  { key: "step3", icon: ClipboardCheck },
  { key: "step4", icon: Truck },
] as const;

export default async function HomeV3Process() {
  const t = await getT();

  return (
    <section className="bg-[var(--hm-purple-dark)] py-14 text-white sm:py-20">
      <div className="container">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">
              {t("home.howItWorks.heading")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{t("home.howItWorks.subtitle")}</p>
          </div>
          <Link href="/devis-rapide" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white">
            {t("home.howItWorks.cta")}
            <ArrowRight size={15} />
          </Link>
        </div>

        <ol className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {STEPS.map(({ key, icon: Icon }, index) => (
            <li key={key} className="relative border-white/15 lg:border-l lg:px-7 first:lg:border-l-0 first:lg:pl-0">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hm-primary)] text-sm font-bold">
                  {index + 1}
                </span>
                <Icon className="h-6 w-6 text-[var(--hm-primary)]" strokeWidth={1.7} />
              </div>
              <h3 className="mt-5 text-[17px] font-semibold leading-6">{t(`home.howItWorks.${key}.title`)}</h3>
              <p className="mt-2 text-[13px] leading-6 text-white/65">{t(`home.howItWorks.${key}.desc`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
