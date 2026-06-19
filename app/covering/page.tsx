import type { Metadata } from "next";
import { Truck } from "lucide-react";
import PoleLanding from "@/components/poles/PoleLanding";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Covering & marquage véhicule à Strasbourg",
  description:
    "Lettrage, covering partiel et marquage de flotte : HM Global habille vos véhicules avec un adhésif durable, posé proprement, à Strasbourg et en Alsace.",
  alternates: { canonical: "/covering" },
};

export default async function CoveringPage() {
  const t = await getT();
  return (
    <PoleLanding
      backLabel={t("poles.common.back")}
      Icon={Truck}
      accent="var(--hm-blue)"
      accentSoft="var(--hm-accent-soft-blue)"
      tag={t("poles.covering.tag")}
      title={t("poles.covering.title")}
      subtitle={t("poles.covering.subtitle")}
      ctaPrimaryLabel={t("poles.common.ctaPrimary")}
      ctaPrimaryHref="/devis-rapide"
      ctaSecondaryLabel={t("poles.common.ctaSecondary")}
      ctaSecondaryHref="/contact"
      featuresTag={t("poles.common.featuresTag")}
      featuresHeading={t("poles.covering.featuresHeading")}
      features={[
        { title: t("poles.covering.f1.title"), desc: t("poles.covering.f1.desc") },
        { title: t("poles.covering.f2.title"), desc: t("poles.covering.f2.desc") },
        { title: t("poles.covering.f3.title"), desc: t("poles.covering.f3.desc") },
        { title: t("poles.covering.f4.title"), desc: t("poles.covering.f4.desc") },
      ]}
      processTag={t("poles.common.processTag")}
      processHeading={t("poles.covering.processHeading")}
      steps={[
        t("poles.covering.step1"),
        t("poles.covering.step2"),
        t("poles.covering.step3"),
        t("poles.covering.step4"),
      ]}
      closingTag={t("poles.common.closingTag")}
      closingHeading={t("poles.covering.closingHeading")}
      closingText={t("poles.covering.closingText")}
    />
  );
}
