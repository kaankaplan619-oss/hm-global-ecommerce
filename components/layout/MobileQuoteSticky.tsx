"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

export default function MobileQuoteSticky() {
  const t = useT();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/92 px-4 py-3 shadow-[0_-10px_28px_rgba(63,45,88,0.14)] backdrop-blur md:hidden">
      <Link
        href="/devis-rapide"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--hm-magenta)] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(193,60,138,0.24)]"
      >
        {t("mobileQuote.cta")}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
