import { ArrowUpRight } from "lucide-react";

function InstagramGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * HomeV3Reels — Mur de réels Instagram (preuve sociale vidéo).
 *
 * Affichage = VIGNETTES CLIQUABLES (couvertures hébergées en local) qui ouvrent
 * le réel sur Instagram. Aucun script externe (pas d'embed.js) : léger, rapide,
 * design maîtrisé. Couvertures : public/mockups/social/reel-<id>.jpg.
 *
 * Réels HM Global (vrais projets clients locaux). Pour en ajouter/retirer :
 * éditer REELS + déposer la couverture correspondante.
 * Textes en dur (FR) — à passer en i18n si besoin.
 */

type Reel = { url: string; cover: string; client: string; alt: string };

const REELS: Reel[] = [
  {
    url: "https://www.instagram.com/reel/DOO1yd7AlHf/",
    cover: "/mockups/social/reel-DOO1yd7AlHf.jpg",
    client: "M MIAM — enseigne lumineuse",
    alt: "Enseigne lumineuse réalisée par HM Global pour le restaurant M MIAM — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DObWCp8ghcZ/",
    cover: "/mockups/social/reel-DObWCp8ghcZ.jpg",
    client: "R3M — covering",
    alt: "Covering de 10 logos réalisé par HM Global pour R3M — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DOdIHghApRh/",
    cover: "/mockups/social/reel-DOdIHghApRh.jpg",
    client: "Serol Carrelage",
    alt: "Réalisation HM Global pour Serol Carrelage — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DOdMvNrgj1e/",
    cover: "/mockups/social/reel-DOdMvNrgj1e.jpg",
    client: "AIS Chauffage Sanitaire",
    alt: "Réalisation HM Global pour AIS Chauffage Sanitaire — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DO87PlHgvK0/",
    cover: "/mockups/social/reel-DO87PlHgvK0.jpg",
    client: "AIS — collaboration",
    alt: "Collaboration HM Global × AIS — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DVOx9LzApW5/",
    cover: "/mockups/social/reel-DVOx9LzApW5.jpg",
    client: "Saveur du Marché",
    alt: "Manteaux et bonnets personnalisés (flex) par HM Global pour Saveur du Marché — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DVOuSWNgvt-/",
    cover: "/mockups/social/reel-DVOuSWNgvt-.jpg",
    client: "Restaurant Naga",
    alt: "Réalisation HM Global pour le restaurant Naga — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DRe3kQ1gs7M/",
    cover: "/mockups/social/reel-DRe3kQ1gs7M.jpg",
    client: "Urban Kiz'sCool",
    alt: "T-shirts flockés par HM Global pour Urban Kiz'sCool — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DRe1G4jgjWV/",
    cover: "/mockups/social/reel-DRe1G4jgjWV.jpg",
    client: "Good Eye Deer",
    alt: "Réalisation HM Global pour Good Eye Deer — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DRKi1sJApbt/",
    cover: "/mockups/social/reel-DRKi1sJApbt.jpg",
    client: "Ambulance de l'Est",
    alt: "Covering véhicule par HM Global pour Ambulance de l'Est — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DRKDEhMjBs9/",
    cover: "/mockups/social/reel-DRKDEhMjBs9.jpg",
    client: "SAS Vansky",
    alt: "Covering véhicules par HM Global pour SAS Vansky — voir le réel Instagram",
  },
  {
    url: "https://www.instagram.com/reel/DRKABAjjBp4/",
    cover: "/mockups/social/reel-DRKABAjjBp4.jpg",
    client: "Habillage appartements",
    alt: "Habillage d'appartements par HM Global — voir le réel Instagram",
  },
];

const INSTAGRAM_PROFILE = "https://www.instagram.com/hmglobalagence/";

export default function HomeV3Reels() {
  if (REELS.length === 0) return null;

  return (
    <section className="bg-[var(--hm-surface)] py-14 sm:py-20">
      <div className="container">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-tag">Sur Instagram</p>
            <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--hm-text)] sm:text-4xl">
              Nos réalisations, en vidéo
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--hm-text-soft)]">
              Textile, enseignes, covering, print — de vrais projets pour des
              entreprises d&apos;ici. Cliquez pour voir le réel sur Instagram.
            </p>
          </div>
          <a
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-[var(--hm-primary)] transition hover:opacity-80"
          >
            <InstagramGlyph /> @hmglobalagence <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {REELS.map((reel) => (
            <a
              key={reel.url}
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-[1.25rem] bg-black shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-[var(--hm-primary)]/40"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={reel.cover}
                  alt={reel.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--hm-primary)] shadow-sm backdrop-blur transition group-hover:bg-white">
                  <InstagramGlyph />
                </span>
                <div className="absolute inset-x-3 bottom-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                    Réalisation
                  </p>
                  <p className="text-sm font-bold leading-tight text-white">
                    {reel.client}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
