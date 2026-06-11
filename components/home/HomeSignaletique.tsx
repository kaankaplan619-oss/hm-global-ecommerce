import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lamp, PanelsTopLeft, Car } from "lucide-react";

/**
 * HomeSignaletique — enseignes, panneaux et véhicules sur l'accueil.
 * Demande Kaan 2026-06-10 : pousser les métiers atelier (enseignes, panneaux
 * chantier, habillage véhicule) avec les vraies photos — parcours devis 24h,
 * pas de prix affiché (fabrication sur mesure).
 */

const ITEMS = [
  {
    icon: Lamp,
    label: "Enseignes lumineuses",
    line: "Lettres rétroéclairées, caissons — fabriquées et posées par nous.",
    image: "/images/realisations/naga-enseigne-nuit.jpg",
    alt: "Enseigne lumineuse Le Naga posée de nuit",
  },
  {
    icon: PanelsTopLeft,
    label: "Panneaux & signalétique",
    line: "Panneaux de chantier, vitrines, totems, bâches grand format.",
    image: "/images/realisations/illico-panneau.jpg",
    alt: "Panneau de chantier imprimé pour illiCO travaux",
  },
  {
    icon: Car,
    label: "Habillage véhicule",
    line: "Lettrage, covering partiel, flocage utilitaire ou flotte.",
    image: "/images/realisations/exo-solar-vehicule.jpg",
    alt: "Véhicule Exo Solar lettré devant l'agence HM Global",
  },
] as const;

export default function HomeSignaletique() {
  return (
    <section className="py-14 sm:py-20" style={{ background: "#fff" }}>
      <div className="container">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--hm-cyan)" }}>
              Atelier · Sur mesure
            </p>
            <h2
              className="font-semibold leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.5rem, 2.6vw + 0.4rem, 2.3rem)", color: "var(--hm-text-main)" }}
            >
              Enseignes, panneaux, véhicules :{" "}
              <span style={{ color: "var(--hm-violet)" }}>fabriqué et posé par l&apos;atelier</span>.
            </h2>
            <p className="mt-3 max-w-[44rem] text-[13.5px] leading-6" style={{ color: "var(--hm-text-muted-2)" }}>
              Du sur-mesure qui ne passe pas par un configurateur : envoyez votre
              besoin, on chiffre sous 24h ouvrées, on fabrique, on pose.
            </p>
          </div>
          <Link href="/devis-rapide" className="btn-hm-violet-outline shrink-0 self-start lg:self-auto">
            Demander un devis 24h
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
          {ITEMS.map((item) => (
            <Link
              key={item.label}
              href="/devis-rapide"
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-white transition duration-300 hover:-translate-y-1"
              style={{ border: "1px solid rgba(45,35,64,0.08)", boxShadow: "0 6px 18px rgba(45,35,64,0.04)" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "#f6f7f9" }}>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width:640px) 32vw, 95vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: "var(--hm-cyan)" }} />
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(84,182,210,0.10)", color: "var(--hm-cyan)" }}
                  >
                    <item.icon size={15} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold leading-snug tracking-[-0.01em]" style={{ color: "var(--hm-text-main)" }}>
                      {item.label}
                    </h3>
                    <p className="mt-1 text-[12px] leading-5" style={{ color: "var(--hm-text-muted-2)" }}>
                      {item.line}
                    </p>
                  </div>
                </div>
                <span
                  className="mt-auto inline-flex items-center justify-between gap-1.5 border-t pt-3 text-[11.5px] font-semibold transition group-hover:gap-2.5"
                  style={{ borderColor: "rgba(84,182,210,0.16)", color: "var(--hm-cyan)" }}
                >
                  Devis sous 24h
                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
