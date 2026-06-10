import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { REALISATIONS } from "@/data/realisations";

/**
 * HomeRealisations — vraies réalisations clients sur l'accueil.
 * Preuve immédiate que l'agence produit réellement (textile DTF, enseignes,
 * véhicule, print) → crédibilise l'achat en ligne. Photos issues de
 * data/realisations (sélection des 1ʳᵉˢ de chaque univers).
 */

const PICK_IDS = [
  "prestige-polos",        // textile DTF client
  "miammi-fabrication",    // enseigne en fabrication
  "vehicule-scorpion",     // habillage véhicule
  "naga-enseigne",         // enseigne posée de nuit
] as const;

export default function HomeRealisations() {
  const picks = PICK_IDS
    .map((id) => REALISATIONS.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <section className="py-12 sm:py-16" style={{ background: "#fff" }}>
      <div className="container">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--hm-magenta)" }}>
              Réalisations · Fait chez nous
            </p>
            <h2
              className="font-semibold leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.5rem, 0.4rem + 2.6vw, 2.3rem)", color: "var(--hm-text-main)" }}
            >
              Des projets réels, livrés à <span style={{ color: "var(--hm-violet)" }}>de vraies entreprises</span>.
            </h2>
            <p className="mt-3 max-w-[44rem] text-[13.5px] leading-6" style={{ color: "var(--hm-text-muted-2)" }}>
              Textile marqué, enseignes posées, véhicules, print : produit à l&apos;atelier de
              Souffelweyersheim, pour des clients d&apos;Alsace.
            </p>
          </div>
          <Link href="/realisations" className="btn-hm-violet-outline shrink-0 self-start lg:self-auto">
            Voir toutes nos réalisations
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {picks.map((r) => (
            <Link
              key={r.id}
              href="/realisations"
              className="group relative block overflow-hidden rounded-[1.4rem] bg-white transition duration-300 hover:-translate-y-1"
              style={{ border: "1px solid rgba(45,35,64,0.08)", boxShadow: "rgba(45,35,64,0.04) 0px 6px 18px" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={r.image}
                  alt={r.alt}
                  fill
                  sizes="(min-width:1024px) 24vw, 48vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm" style={{ color: "var(--hm-magenta)" }}>
                  {r.sector}
                </span>
                <p className="absolute inset-x-0 bottom-0 p-3.5 text-[13px] font-semibold leading-tight text-white drop-shadow">
                  {r.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
