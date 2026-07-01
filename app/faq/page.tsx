import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import BackLink from "@/components/ui/BackLink";
import AtelierAlsaceBlock from "@/components/local/AtelierAlsaceBlock";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import { FAQ_GROUPS, FAQ_FLAT } from "@/data/faq";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hm-global.fr";

export const metadata: Metadata = {
  title: "Questions fréquentes (FAQ) | HM Global Agence",
  description:
    "Personnalisation, techniques, quantités, prix, paiement et livraison : les réponses aux questions fréquentes sur le textile personnalisé et la communication visuelle chez HM Global, à Strasbourg et en Alsace.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd id={`${SITE_URL}/faq/#faq`} items={FAQ_FLAT} />

      <div className="bg-white pb-20 pt-24">
        <div className="container">
          <BackLink href="/" label="Accueil" />

          {/* ── Hero ───────────────────────────────────────────────────────── */}
          <section className="mb-14 max-w-2xl">
            <p className="section-tag">Aide & questions fréquentes</p>
            <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
              Questions fréquentes
            </h1>
            <p className="text-base leading-8 text-[var(--hm-text-soft)]">
              Tout ce qu&apos;il faut savoir pour personnaliser, commander et être livré. Vous ne trouvez pas votre réponse ? Contactez-nous, nous répondons vite.
            </p>
          </section>

          {/* ── Groupes de FAQ ─────────────────────────────────────────────── */}
          <div className="mb-14 grid gap-10">
            {FAQ_GROUPS.map((group) => (
              <section key={group.title}>
                <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[var(--hm-text)]">
                  {group.title}
                </h2>
                <div className="grid gap-3">
                  {group.items.map((f) => (
                    <details
                      key={f.q}
                      className="group rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-5"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[var(--hm-text)]">
                        {f.q}
                        <Plus className="h-4 w-4 shrink-0 text-[var(--hm-rose)] transition-transform group-open:rotate-45" />
                      </summary>
                      <p className="mt-3 text-sm leading-7 text-[var(--hm-text-soft)]">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* ── Bloc atelier local ─────────────────────────────────────────── */}
          <div className="mb-14">
            <AtelierAlsaceBlock />
          </div>

          {/* ── CTA final ──────────────────────────────────────────────────── */}
          <section className="rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="section-tag">Une autre question ?</p>
                <h2 className="mb-3 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                  Parlons de votre projet
                </h2>
                <p className="text-base leading-7 text-[var(--hm-text-soft)]">
                  Contactez notre atelier ou lancez une demande de devis : nous vous répondons rapidement.
                </p>
              </div>
              <div className="flex flex-wrap gap-3.5 lg:justify-end">
                <Link href="/devis-rapide" className="btn-primary gap-2">
                  Demander un devis
                  <ArrowRight size={16} />
                </Link>
                <Link href="/contact" className="btn-outline">
                  Nous contacter
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
