import Link from "next/link";
import { ArrowRight } from "lucide-react";
import UsageCard from "@/components/shared/UsageCard";
import { TEXTILE_USAGES } from "@/data/textile-usages";

/**
 * Home — section "Par usage métier" — 6 cartes.
 *
 * V1 marketing : 3 actives (staff, restaurant, association) + 3 "bientôt".
 * Le hub complet est sur /catalogue/usages.
 */
export default function HomeUsagesGrid() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p
              className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--hm-cyan)" }}
            >
              Catalogue par usage
            </p>
            <h2
              className="font-semibold leading-[1.1] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.5rem, 2.4vw + 0.4rem, 2.2rem)",
                color: "var(--hm-text)",
              }}
            >
              Trouvez les bonnes pièces selon votre secteur
            </h2>
            <p className="mt-3 max-w-[52ch] text-[13px] leading-6 text-[var(--hm-text-soft)]">
              Staff, restaurant, association ou événement — chaque secteur a ses contraintes
              de textile, marquage et budget. On vous aide à choisir le bon combo.
            </p>
          </div>

          <Link
            href="/catalogue/usages"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--hm-rose)] transition hover:gap-2.5"
          >
            Voir tous les usages
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {TEXTILE_USAGES.map((usage) => (
            <UsageCard key={usage.slug} usage={usage} />
          ))}
        </div>
      </div>
    </section>
  );
}
