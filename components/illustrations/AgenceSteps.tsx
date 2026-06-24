/**
 * AgenceSteps — petites illustrations « façon de faire » pour le bloc
 * « L'agence » (demande Kaan : même style que les cartes Erasmus, pour
 * accentuer « on ne sous-traite pas votre image, on la fabrique »).
 * 3 scènes : tout sous le même toit · ancrés en Alsace · validé avant prod.
 * Charte HM Global : flamme bleu/violet/magenta, accents rose/cyan.
 */

const ROSE = "#b13f74";
const VIOLET = "#3B235A";
const MAGENTA = "#C13C8A";
const CYAN = "#54B6D2";
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

const Flame = () => (
  <linearGradient id="agFlame" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stopColor={CYAN} />
    <stop offset="55%" stopColor={VIOLET} />
    <stop offset="100%" stopColor={MAGENTA} />
  </linearGradient>
);

/** Tout sous le même toit — devanture d'agence (vitrines, porte, enseigne). */
export function RoofArt() {
  return (
    <Frame label="Notre agence : un atelier et une devanture ouverts, où l'on vient nous voir">
      <defs><Flame /></defs>
      <line x1="34" y1="120" x2="186" y2="120" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
      {/* façade */}
      <rect x="56" y="48" width="98" height="72" rx="3" fill={SOFT} stroke={LINE} strokeWidth="1.6" />
      {/* bandeau enseigne */}
      <rect x="50" y="40" width="110" height="9" rx="2" fill={VIOLET} />
      {/* vitrines */}
      <g fill="#e7f1f7" stroke={LINE} strokeWidth="1.2">
        <rect x="64" y="66" width="22" height="22" rx="2" />
        <rect x="124" y="66" width="22" height="22" rx="2" />
      </g>
      <g stroke={LINE} strokeWidth="1" opacity="0.8">
        <line x1="75" y1="66" x2="75" y2="88" />
        <line x1="64" y1="77" x2="86" y2="77" />
        <line x1="135" y1="66" x2="135" y2="88" />
        <line x1="124" y1="77" x2="146" y2="77" />
      </g>
      {/* porte */}
      <rect x="91" y="88" width="28" height="32" rx="1.5" fill="#ece9f2" stroke={LINE} strokeWidth="1.4" />
      <line x1="105" y1="88" x2="105" y2="120" stroke={LINE} strokeWidth="1" />
      <circle cx="101" cy="105" r="1.8" fill={ROSE} />
      {/* enseigne ronde en saillie (notre marque) */}
      <line x1="154" y1="60" x2="166" y2="60" stroke={VIOLET} strokeWidth="3" strokeLinecap="round" />
      <circle cx="177" cy="60" r="12.5" fill={WHITE} stroke={VIOLET} strokeWidth="2.4" />
      <g transform="translate(177,60) scale(0.32) translate(-128,-162)">
        <path d="M124 179 C111 169 116 152 127 145 C123 157 134 157 133 146 C144 152 146 169 133 179 Z" fill="url(#agFlame)" />
      </g>
    </Frame>
  );
}

/** Ancrés en Alsace — maison à colombages + repère de localisation. */
export function AlsaceArt() {
  return (
    <Frame label="Atelier ancré en Alsace, à Souffelweyersheim">
      <line x1="40" y1="118" x2="180" y2="118" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
      <rect x="64" y="74" width="56" height="38" rx="2" fill={SOFT} stroke={LINE} strokeWidth="1.6" />
      <path d="M58 74 L92 52 L126 74 Z" fill={ROSE} />
      <g stroke={VIOLET} strokeWidth="2" opacity="0.5">
        <line x1="92" y1="74" x2="92" y2="112" />
        <line x1="64" y1="74" x2="92" y2="100" />
        <line x1="120" y1="74" x2="92" y2="100" />
      </g>
      <g transform="translate(150,62)">
        <path d="M0 0 C-12 0 -13 16 0 32 C13 16 12 0 0 0 Z" fill={MAGENTA} />
        <circle cx="0" cy="12" r="5" fill={WHITE} />
      </g>
    </Frame>
  );
}

/** Validé avant de produire — BAT (document) + tee + bon pour accord. */
export function BatArt() {
  return (
    <Frame label="Bon à tirer validé avec vous avant la production">
      <defs><Flame /></defs>
      <line x1="40" y1="120" x2="180" y2="120" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
      <rect x="68" y="24" width="86" height="92" rx="5" fill={WHITE} stroke={LINE} strokeWidth="1.8" />
      <path d="M97 44 l8 -6 a8 6 0 0 0 14 0 l8 6 8 8 -7 6 -4 -3 v22 h-28 v-22 l-4 3 -7 -6 Z" fill={SOFT} stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
      <g transform="translate(111,62) scale(0.3) translate(-128,-162)">
        <path d="M124 179 C111 169 116 152 127 145 C123 157 134 157 133 146 C144 152 146 169 133 179 Z" fill="url(#agFlame)" />
      </g>
      <g stroke={LINE} strokeWidth="3.4" strokeLinecap="round">
        <line x1="82" y1="92" x2="140" y2="92" />
        <line x1="82" y1="101" x2="122" y2="101" />
      </g>
      <g>
        <circle cx="140" cy="104" r="13" fill={ROSE} />
        <path d="M133 104 l5 5 9 -11" fill="none" stroke={WHITE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Frame>
  );
}
