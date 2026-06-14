import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import { ArrowRight, BadgeCheck, FileCheck2, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import QuickQuoteForm from "@/components/quote/QuickQuoteForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("quickQuote.meta.title"),
    description: t("quickQuote.meta.description"),
  };
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function QuickQuotePage({ searchParams }: Props) {
  const t = await getT();
  const params = await searchParams;
  const initialNeedType = pickParam(params.besoin) || "tenues-entreprise";
  const initialProduct = pickParam(params.produit);

  const assurances = [
    { icon: ShieldCheck, text: t("quickQuote.assurances.bat") },
    { icon: Sparkles, text: t("quickQuote.assurances.advice") },
    { icon: Layers3, text: t("quickQuote.assurances.quote") },
    { icon: FileCheck2, text: t("quickQuote.assurances.afterValidation") },
  ];

  const checklist = [
    t("quickQuote.checklist.support"),
    t("quickQuote.checklist.volume"),
    t("quickQuote.checklist.logoChecked"),
    t("quickQuote.checklist.clearReply"),
  ];

  return (
    <div className="bg-white pb-24 pt-24">
      <div className="container">
        <BackLink href="/" label={t("quickQuote.backHome")} />

        <section className="mb-8 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-5 py-7 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="section-tag">{t("quickQuote.hero.tag")}</p>
              <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
                {t("quickQuote.hero.title")}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
                {t("quickQuote.hero.subtitle")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {assurances.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 rounded-2xl border border-[var(--hm-line)] bg-white p-4 shadow-[0_10px_24px_rgba(63,45,88,0.04)]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]">
                    <Icon size={17} />
                  </div>
                  <p className="text-[13px] font-semibold leading-5 text-[var(--hm-text)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <aside className="rounded-[1.5rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-5 sm:p-6">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--hm-text)]">
              {t("quickQuote.aside.title")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--hm-text-soft)]">
              {t("quickQuote.aside.body")}
            </p>
            <div className="mt-6 space-y-3">
              {checklist.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <BadgeCheck size={16} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
                  <p className="text-sm text-[var(--hm-text-soft)]">{item}</p>
                </div>
              ))}
            </div>
            <Link href="/catalogue" className="mt-7 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--hm-primary)] transition hover:gap-2.5">
              {t("quickQuote.viewCatalogue")}
              <ArrowRight size={14} />
            </Link>
          </aside>

          <QuickQuoteForm initialNeedType={initialNeedType} initialProduct={initialProduct} />
        </div>
      </div>
    </div>
  );
}
