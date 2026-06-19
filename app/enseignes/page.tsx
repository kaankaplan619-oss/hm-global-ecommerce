import type { Metadata } from "next";
import { Store } from "lucide-react";
import PoleLanding from "@/components/poles/PoleLanding";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Enseignes & signalétique à Strasbourg",
  description:
    "Enseignes de façade, totems, signalétique intérieure et extérieure : conception, fabrication et pose par HM Global à Strasbourg et en Alsace.",
  alternates: { canonical: "/enseignes" },
};

export default async function EnseignesPage() {
  const t = await getT();
  return (
    <PoleLanding
      backLabel={t("poles.common.back")}
      Icon={Store}
      accent="var(--hm-purple)"
      accentSoft="var(--hm-accent-soft-purple)"
      tag={t("poles.enseignes.tag")}
      title={t("poles.enseignes.title")}
      subtitle={t("poles.enseignes.subtitle")}
      ctaPrimaryLabel={t("poles.common.ctaPrimary")}
      ctaPrimaryHref="/devis-rapide"
      ctaSecondaryLabel={t("poles.common.ctaSecondary")}
      ctaSecondaryHref="/contact"
      featuresTag={t("poles.common.featuresTag")}
      featuresHeading={t("poles.enseignes.featuresHeading")}
      features={[
        { title: t("poles.enseignes.f1.title"), desc: t("poles.enseignes.f1.desc") },
        { title: t("poles.enseignes.f2.title"), desc: t("poles.enseignes.f2.desc") },
        { title: t("poles.enseignes.f3.title"), desc: t("poles.enseignes.f3.desc") },
        { title: t("poles.enseignes.f4.title"), desc: t("poles.enseignes.f4.desc") },
      ]}
      processTag={t("poles.common.processTag")}
      processHeading={t("poles.enseignes.processHeading")}
      steps={[
        t("poles.enseignes.step1"),
        t("poles.enseignes.step2"),
        t("poles.enseignes.step3"),
        t("poles.enseignes.step4"),
      ]}
      closingTag={t("poles.common.closingTag")}
      closingHeading={t("poles.enseignes.closingHeading")}
      closingText={t("poles.enseignes.closingText")}
    />
  );
}
