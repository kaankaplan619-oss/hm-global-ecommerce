import Image from "next/image";
import { REALISATIONS } from "@/data/realisations";

/**
 * Galerie des vraies réalisations HM Global (photos clients).
 * Grille responsive, image plein cadre + overlay (titre, secteur, techniques).
 */
export default function RealisationsGallery() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {REALISATIONS.map((r, i) => (
        <figure
          key={r.id}
          className="group relative overflow-hidden rounded-[1.5rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] shadow-[0_12px_30px_rgba(63,45,88,0.06)]"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={r.image}
              alt={r.alt}
              fill
              sizes="(min-width:1024px) 32vw, (min-width:640px) 48vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              priority={i < 3}
            />
            {/* Dégradé bas pour lisibilité du texte */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--hm-primary)] shadow-sm">
              {r.sector}
            </span>
            <figcaption className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[15px] font-semibold leading-tight text-white drop-shadow">{r.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <span key={t} className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {t}
                  </span>
                ))}
              </div>
            </figcaption>
          </div>
        </figure>
      ))}
    </div>
  );
}
