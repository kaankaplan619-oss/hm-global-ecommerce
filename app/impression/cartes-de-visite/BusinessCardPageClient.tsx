"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

function ConfiguratorLoading() {
  const t = useT();
  return (
    <div className="flex min-h-[480px] items-center justify-center gap-3 text-[var(--hm-text-muted)]">
      <Loader2 size={20} className="animate-spin text-[var(--hm-primary)]" />
      <span className="text-sm">{t("businessCardsClient.loading")}</span>
    </div>
  );
}

const BusinessCardConfigurator = dynamic(
  () => import("@/components/print/BusinessCardConfigurator"),
  {
    ssr: false,
    loading: () => <ConfiguratorLoading />,
  }
);

export default function BusinessCardPageClient() {
  return <BusinessCardConfigurator />;
}
