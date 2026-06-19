import type { Metadata } from "next";
import { Palette } from "lucide-react";
import PoleLanding from "@/components/poles/PoleLanding";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Création de logo & branding à Strasbourg",
  description:
    "Création ou refonte de logo, identité visuelle, déclinaisons et préparation de fichiers par HM Global, à Strasbourg et en Alsace — prêt pour le textile, le print et l'enseigne.",
  alternates: { canonical: "/branding" },
};

export default async function BrandingPage() {
  const t = await getT();
  return (
    <PoleLanding
      backLabel={t("poles.common.back")}
      Icon={Palette}
      accent="var(--hm-primary)"
      accentSoft="var(--hm-accent-soft-rose)"
      tag={t("poles.branding.tag")}
      title={t("poles.branding.title")}
      subtitle={t("poles.branding.subtitle")}
      ctaPrimaryLabel={t("poles.common.ctaPrimary")}
      ctaPrimaryHref="/devis-rapide"
      ctaSecondaryLabel={t("poles.common.ctaSecondary")}
      ctaSecondaryHref="/contact"
      featuresTag={t("poles.common.featuresTag")}
      featuresHeading={t("poles.branding.featuresHeading")}
      features={[
        { title: t("poles.branding.f1.title"), desc: t("poles.branding.f1.desc") },
        { title: t("poles.branding.f2.title"), desc: t("poles.branding.f2.desc") },
        { title: t("poles.branding.f3.title"), desc: t("poles.branding.f3.desc") },
        { title: t("poles.branding.f4.title"), desc: t("poles.branding.f4.desc") },
      ]}
      processTag={t("poles.common.processTag")}
      processHeading={t("poles.branding.processHeading")}
      steps={[
        t("poles.branding.step1"),
        t("poles.branding.step2"),
        t("poles.branding.step3"),
        t("poles.branding.step4"),
      ]}
      closingTag={t("poles.common.closingTag")}
      closingHeading={t("poles.branding.closingHeading")}
      closingText={t("poles.branding.closingText")}
    />
  );
}
