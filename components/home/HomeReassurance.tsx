"use client";

import { MapPin, ShieldCheck, Award, Zap } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * HomeReassurance — Bandeau 4 blocs sous le hero. Libellés via i18n (FR/EN/TR).
 */

const ITEMS = [
  { icon: MapPin,      titleKey: "home.reassurance.atelier.title", textKey: "home.reassurance.atelier.text" },
  { icon: ShieldCheck, titleKey: "home.reassurance.bat.title",     textKey: "home.reassurance.bat.text" },
  { icon: Award,       titleKey: "home.reassurance.since.title",   textKey: "home.reassurance.since.text" },
  { icon: Zap,         titleKey: "home.reassurance.express.title", textKey: "home.reassurance.express.text" },
] as const;

export default function HomeReassurance() {
  const t = useT();
  return (
    <section className="border-y" style={{ borderColor: "rgba(45,35,64,0.07)", background: "#fbfafc" }}>
      <div className="container">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 py-7 lg:grid-cols-4 lg:py-8">
          {ITEMS.map(({ icon: Icon, titleKey, textKey }) => (
            <div key={titleKey} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(84,182,210,0.12)" }}
              >
                <Icon size={16} style={{ color: "var(--hm-cyan)" }} strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[13px] font-bold leading-snug" style={{ color: "var(--hm-text-main)" }}>
                  {t(titleKey)}
                </p>
                <p className="mt-0.5 hidden text-[11.5px] leading-snug sm:block" style={{ color: "var(--hm-text-muted-2)" }}>
                  {t(textKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
