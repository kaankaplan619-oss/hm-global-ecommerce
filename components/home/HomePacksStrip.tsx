import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PackCard from "@/components/shared/PackCard";
import { getActivePacks } from "@/data/textile-packs";

/**
 * Home — section "Packs B2B prêts à commander".
 *
 * V1 : 2 packs publiés (Staff 10 + Association).
 * Les CTA renvoient vers contact / devis pré-rempli (pas de panier multi-produits V1).
 */
export default function HomePacksStrip() {
  const packs = getActivePacks();
  if (packs.length === 0) return null;

  return (
    <section
      className="py-12 sm:py-16"
      style={{
        background:
          "linear-gradient(180deg, var(--hm-surface) 0%, #ffffff 100%)",
      }}
    >
      <div className="container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p
              className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--hm-magenta)" }}
            >
              Packs B2B
            </p>
            <h2
              className="font-semibold leading-[1.1] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.5rem, 2.4vw + 0.4rem, 2.2rem)",
                color: "var(--hm-text)",
              }}
            >
              Pas envie de tout configurer ? On a préparé les bons combos.
            </h2>
            <p className="mt-3 max-w-[52ch] text-[13px] leading-6 text-[var(--hm-text-soft)]">
              Pour équiper rapidement votre équipe ou votre association — textile,
              marquage, BAT visuel et livraison inclus. Un seul devis, un seul interlocuteur.
            </p>
          </div>

          <Link
            href="/catalogue/packs"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--hm-rose)] transition hover:gap-2.5"
          >
            Voir tous les packs
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {packs.map((pack) => (
            <PackCard key={pack.slug} pack={pack} variant="detail" />
          ))}
        </div>
      </div>
    </section>
  );
}
