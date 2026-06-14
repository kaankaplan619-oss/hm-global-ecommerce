import type { Metadata } from "next";
import BackLink from "@/components/ui/BackLink";
import BusinessCardPageClient from "./BusinessCardPageClient";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Cartes de visite personnalisées — Impression | HM Global",
  description:
    "Commandez vos cartes de visite 85×55 mm en ligne. Papier 350 g/m², finition mate, brillante ou premium, coins standard ou arrondis. Déposez votre fichier PDF ou PNG et recevez votre BAT avant impression.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CartesDeVisitePage() {
  const t = await getT();

  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">

        {/* ── Fil d'Ariane ─────────────────────────────────────────────── */}
        <BackLink href="/impression" label={t("businessCards.backToPrint")} />

        {/* ── En-tête ──────────────────────────────────────────────────── */}
        <div className="mb-10">
          <p className="section-tag">{t("businessCards.hero.tag")}</p>
          <h1 className="mb-3 text-3xl font-black text-[var(--hm-text)] md:text-4xl">
            {t("businessCards.hero.title")}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            {t("businessCards.hero.desc")}
          </p>
        </div>

        {/* Bandeau réassurance retiré (Kaan) → plus de place pour l'aperçu. */}

        {/* ── Configurateur ─────────────────────────────────────────────── */}
        <BusinessCardPageClient />

      </div>
    </div>
  );
}
