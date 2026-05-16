"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const BusinessCardConfigurator = dynamic(
  () => import("@/components/print/BusinessCardConfigurator"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[480px] items-center justify-center gap-3 text-[var(--hm-text-muted)]">
        <Loader2 size={20} className="animate-spin text-[var(--hm-primary)]" />
        <span className="text-sm">Chargement du configurateur…</span>
      </div>
    ),
  }
);

export default function BusinessCardPageClient() {
  return <BusinessCardConfigurator />;
}
