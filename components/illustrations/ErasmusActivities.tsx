/**
 * ErasmusActivities — petites illustrations « on a fait ça » pour le bloc
 * Erasmus de l'accueil (demande Kaan 2026-06-24). Classées d'après ce que
 * montrent les photos du SSD (ateliers IA/numérique, immersion à l'atelier,
 * découverte de l'Europe à Strasbourg) — SANS publier les photos (mineurs).
 * Style charte HM Global : objets simples, accents rose/violet/magenta + cyan.
 */

const ROSE = "#b13f74";
const VIOLET = "#3B235A";
const MAGENTA = "#C13C8A";
const CYAN = "#54B6D2";
const BLUE = "#2b73a6";
const LINE = "#d9d4e2";
const SOFT = "#f6f1f8";
const WHITE = "#ffffff";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 220 140" className="h-auto w-full" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

/** Ateliers IA & numérique — ordinateur + graphe de neurones + étincelle. */
export function AtelierIaArt() {
  return (
    <Frame label="Ateliers IA et numérique : initiation aux outils créatifs">
      <rect x="50" y="34" width="120" height="72" rx="6" fill={WHITE} stroke={LINE} strokeWidth="2" />
      <rect x="60" y="44" width="100" height="52" rx="3" fill={SOFT} />
      <path d="M38 116 L182 116 L170 106 L50 106 Z" fill={WHITE} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <g stroke={ROSE} strokeWidth="2" fill="none">
        <line x1="80" y1="84" x2="102" y2="60" />
        <line x1="102" y1="60" x2="130" y2="72" />
        <line x1="102" y1="60" x2="96" y2="88" />
        <line x1="130" y1="72" x2="138" y2="90" />
      </g>
      <circle cx="80" cy="84" r="5" fill={CYAN} />
      <circle cx="102" cy="60" r="6.5" fill={VIOLET} />
      <circle cx="130" cy="72" r="5" fill={MAGENTA} />
      <circle cx="96" cy="88" r="4" fill={BLUE} />
      <circle cx="138" cy="90" r="4" fill={ROSE} />
      <g stroke={MAGENTA} strokeWidth="2.2" strokeLinecap="round">
        <line x1="150" y1="40" x2="150" y2="31" />
        <line x1="157" y1="45" x2="164" y2="41" />
        <line x1="143" y1="45" x2="136" y2="41" />
      </g>
    </Frame>
  );
}

/** Immersion à l'atelier — presse à chaud sur un tee + flamme HM + étincelle. */
export function ImmersionArt() {
  return (
    <Frame label="Immersion à l'atelier : découverte du métier en pratique">
      <line x1="40" y1="118" x2="180" y2="118" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
      {/* bâti de la presse */}
      <rect x="58" y="96" width="104" height="14" rx="3" fill={WHITE} stroke={LINE} strokeWidth="2" />
      <line x1="150" y1="96" x2="150" y2="40" stroke={VIOLET} strokeWidth="4" strokeLinecap="round" />
      <path d="M150 40 h-18 a8 8 0 0 0 -8 8 v6" fill="none" stroke={VIOLET} strokeWidth="4" strokeLinecap="round" />
      {/* plateau supérieur */}
      <rect x="86" y="56" width="58" height="12" rx="3" fill={ROSE} />
      {/* tee-shirt sur le plateau */}
      <path d="M80 92 l10 -8 h36 l10 8 -8 6 -4 -3 v9 h-28 v-9 l-4 3 Z" fill={SOFT} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      {/* flamme HM imprimée */}
      <path d="M108 90 c-5 -3 -3 -9 1 -11 c-1 4 3 4 2 -1 c4 2 6 7 1 12 Z" fill={MAGENTA} />
      {/* étincelle de chaleur */}
      <g stroke={CYAN} strokeWidth="2.2" strokeLinecap="round">
        <line x1="120" y1="50" x2="120" y2="44" />
        <line x1="126" y1="54" x2="131" y2="51" />
      </g>
    </Frame>
  );
}

/** Cap sur l'Europe — institution (fronton + colonnes) + étoiles d'Europe. */
export function EuropeArt() {
  return (
    <Frame label="Découverte de l'Europe à Strasbourg : institutions et échanges">
      <line x1="40" y1="118" x2="180" y2="118" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
      {/* socle + colonnes */}
      <rect x="62" y="106" width="96" height="8" rx="2" fill={VIOLET} />
      <g stroke={VIOLET} strokeWidth="6" strokeLinecap="round">
        <line x1="74" y1="72" x2="74" y2="106" />
        <line x1="94" y1="72" x2="94" y2="106" />
        <line x1="114" y1="72" x2="114" y2="106" />
        <line x1="134" y1="72" x2="134" y2="106" />
        <line x1="146" y1="72" x2="146" y2="106" />
      </g>
      <rect x="60" y="64" width="100" height="9" rx="2" fill={VIOLET} />
      {/* fronton */}
      <path d="M58 64 L110 40 L162 64 Z" fill={ROSE} />
      {/* étoiles d'Europe */}
      <g fill={CYAN}>
        <circle cx="96" cy="56" r="2.4" />
        <circle cx="110" cy="52" r="2.4" />
        <circle cx="124" cy="56" r="2.4" />
        <circle cx="103" cy="50" r="2.1" />
        <circle cx="117" cy="50" r="2.1" />
      </g>
    </Frame>
  );
}
