import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparatif images print (dev)",
  robots: { index: false, follow: false },
};

/**
 * Page DEV — comparatif visuels print : actuel vs candidats mockups
 * (mockups-design.com, licence commerciale sans attribution, vérifiée
 * 2026-06-10). Les candidats affichent encore le design de démo du
 * mockup : après validation Kaan, on y insère les designs HM Global.
 * Page non indexée, à supprimer après décision.
 */

type Pair = {
  zone: string;
  note: string;
  current: { src: string; label: string };
  candidates: { src: string; label: string }[];
};

const PAIRS: Pair[] = [
  {
    zone: "Cartes de visite",
    note: "Le candidat sera personnalisé avec une vraie carte HM Global (logo + coordonnées) à la place du design de démo.",
    current: { src: "/mockups/print/spec/bc-standard.webp", label: "Actuel — vignette générée (support + cote)" },
    candidates: [
      { src: "/dev-comparatif/free-stacked-business-cards-mockup-55-x-85-mm.jpg", label: "Candidat A — cartes empilées 85×55" },
      { src: "/dev-comparatif/hand-holding-business-card-mockup.jpg", label: "Candidat B — carte tenue en main" },
    ],
  },
  {
    zone: "Flyers",
    note: "Format A5 exact. Le dépliant 3 volets servira aussi à la fiche dépliant.",
    current: { src: "/mockups/print/spec/flyer-a5.webp", label: "Actuel — vignette générée" },
    candidates: [
      { src: "/dev-comparatif/free-a5-flyer-mockup.jpg", label: "Candidat A — flyer A5 posé" },
      { src: "/dev-comparatif/free-a5-trifold-flyer-mockup.jpg", label: "Candidat B — dépliant 3 volets" },
    ],
  },
  {
    zone: "Affiches & posters",
    note: "Mise en situation urbaine (abribus) — très vendeur pour le B2B local.",
    current: { src: "/mockups/print/spec/poster-a3.webp", label: "Actuel — vignette générée" },
    candidates: [
      { src: "/dev-comparatif/free-citylight-poster-mockup.jpg", label: "Candidat — poster citylight urbain" },
    ],
  },
  {
    zone: "Toiles canvas",
    note: "Toile en situation intérieure.",
    current: { src: "/mockups/print/spec/canvas-30x40.webp", label: "Actuel — vignette générée" },
    candidates: [
      { src: "/dev-comparatif/free-canvas-mockup.jpg", label: "Candidat — canvas mural" },
    ],
  },
  {
    zone: "Enseignes (section accueil)",
    note: "Ta vraie photo Le Naga reste sans doute plus forte (preuve réelle) — le mockup servirait plutôt en page devis enseigne.",
    current: { src: "/images/realisations/naga-enseigne.jpg", label: "Actuel — vraie photo (Le Naga)" },
    candidates: [
      { src: "/dev-comparatif/free-shop-sign-mockup.jpg", label: "Candidat — enseigne caisson (mockup)" },
    ],
  },
];

export default function ComparatifImagesPage() {
  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <p className="section-tag">Dev · Comparatif visuels</p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
          Actuel vs candidats mockups
        </h1>
        <p className="mb-10 max-w-2xl text-sm leading-7 text-[var(--hm-text-soft)]">
          Les candidats affichent encore le design de démonstration du mockup
          (« Free mockup »). Après ta validation, on y place les designs HM
          Global. Licence : commerciale, sans attribution (mockups-design).
        </p>

        <div className="space-y-12">
          {PAIRS.map((p) => (
            <section key={p.zone}>
              <h2 className="mb-1 text-xl font-semibold text-[var(--hm-text)]">{p.zone}</h2>
              <p className="mb-4 max-w-2xl text-[12.5px] leading-relaxed text-[var(--hm-text-soft)]">{p.note}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <figure className="overflow-hidden rounded-[1.2rem] border-2 border-[var(--hm-line)]">
                  <div className="relative aspect-[4/3] bg-[var(--hm-surface)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.current.src} alt={p.current.label} className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                  <figcaption className="bg-[var(--hm-surface)] p-3 text-[12px] font-semibold text-[var(--hm-text-soft)]">
                    {p.current.label}
                  </figcaption>
                </figure>
                {p.candidates.map((c) => (
                  <figure key={c.src} className="overflow-hidden rounded-[1.2rem] border-2 border-[rgba(177,63,116,0.35)]">
                    <div className="relative aspect-[4/3] bg-[var(--hm-surface)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.src} alt={c.label} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <figcaption className="bg-[rgba(177,63,116,0.06)] p-3 text-[12px] font-semibold" style={{ color: "var(--hm-primary)" }}>
                      {c.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
