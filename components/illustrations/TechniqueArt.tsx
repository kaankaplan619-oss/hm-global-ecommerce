/**
 * TechniqueArt — illustrations SVG sur-mesure des 3 techniques de marquage.
 *
 * Demande Kaan 2026-06-13 : des visuels « différents de ce qu'on trouve en
 * ligne » qui EXPLIQUENT le marquage (film → presse → textile, etc.) pour
 * montrer le savoir-faire. 100 % vectoriel, à la charte HM Global, zéro droit
 * d'auteur, chargement instantané, net sur tous les écrans.
 *
 * Chaque illustration raconte les 3 étapes de la technique, avec sa couleur
 * d'accent (DTF = rose, Flex = bleu, Broderie = violet — alignées sur la page
 * /techniques).
 */

type ArtProps = { className?: string };

// Palette charte (app/globals.css)
const NEUTRAL_LINE = "#d9dbe3";
const NEUTRAL_FILL = "#f3f4f8";
const SHIRT_FILL = "#eef0f5";
const LABEL = "#8a8198";

/** Petit t-shirt réutilisable, centré sur (cx, cy), ~48 px de large. */
function Tshirt({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <path
        d={`M ${cx - 24} ${cy - 12}
            L ${cx - 11} ${cy - 21}
            Q ${cx} ${cy - 25} ${cx + 11} ${cy - 21}
            L ${cx + 24} ${cy - 12}
            L ${cx + 16} ${cy - 2}
            L ${cx + 12} ${cy - 6}
            L ${cx + 12} ${cy + 22}
            Q ${cx + 12} ${cy + 25} ${cx + 9} ${cy + 25}
            L ${cx - 9} ${cy + 25}
            Q ${cx - 12} ${cy + 25} ${cx - 12} ${cy + 22}
            L ${cx - 12} ${cy - 6}
            L ${cx - 16} ${cy - 2} Z`}
        fill={SHIRT_FILL}
        stroke={NEUTRAL_LINE}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* col */}
      <path
        d={`M ${cx - 11} ${cy - 21} Q ${cx} ${cy - 13} ${cx + 11} ${cy - 21}`}
        fill="none"
        stroke={NEUTRAL_LINE}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );
}

function StageFrame({ cx }: { cx: number }) {
  return (
    <rect
      x={cx - 42}
      y={20}
      width={84}
      height={84}
      rx={18}
      fill="#ffffff"
      stroke={NEUTRAL_LINE}
      strokeWidth="1.4"
    />
  );
}

function Arrow({ x, accent }: { x: number; accent: string }) {
  return (
    <g stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
      <line x1={x} y1={62} x2={x + 20} y2={62} />
      <polyline points={`${x + 14},57 ${x + 20},62 ${x + 14},67`} fill="none" />
    </g>
  );
}

function Label({ cx, children }: { cx: number; children: string }) {
  return (
    <text x={cx} y={128} textAnchor="middle" fontSize="11" fontWeight="600" fill={LABEL} letterSpacing="0.02em">
      {children}
    </text>
  );
}

const S1 = 70;
const S2 = 190;
const S3 = 310;

/** DTF — film couleur → presse à chaud → textile. Accent rose. */
export function DtfArt({ className }: ArtProps) {
  const accent = "#b13f74";
  return (
    <svg viewBox="0 0 380 140" className={className} role="img" aria-label="DTF : un film imprimé en couleur, transféré à la presse à chaud sur le textile">
      <defs>
        <linearGradient id="dtfMotif" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b13f74" />
          <stop offset="55%" stopColor="#7a4f9c" />
          <stop offset="100%" stopColor="#2b73a6" />
        </linearGradient>
      </defs>

      {/* Étape 1 — film couleur */}
      <StageFrame cx={S1} />
      <rect x={S1 - 26} y={38} width={52} height={48} rx={6} fill={NEUTRAL_FILL} stroke={NEUTRAL_LINE} strokeWidth="1.2" strokeDasharray="4 4" />
      <circle cx={S1 - 8} cy={56} r={11} fill="#b13f74" opacity="0.85" />
      <circle cx={S1 + 8} cy={58} r={11} fill="#2b73a6" opacity="0.7" />
      <circle cx={S1} cy={70} r={11} fill="#7a4f9c" opacity="0.7" />
      <Label cx={S1}>Film couleur</Label>

      <Arrow x={114} accent={accent} />

      {/* Étape 2 — presse à chaud */}
      <StageFrame cx={S2} />
      {/* plaque haute + chaleur */}
      <g stroke={accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" fill="none">
        <path d={`M ${S2 - 10} 30 q 4 -5 0 -10`} />
        <path d={`M ${S2} 30 q 4 -5 0 -10`} />
        <path d={`M ${S2 + 10} 30 q 4 -5 0 -10`} />
      </g>
      <rect x={S2 - 30} y={36} width={60} height={10} rx={3} fill={accent} opacity="0.85" />
      <rect x={S2 - 24} y={50} width={48} height={6} rx={2} fill="url(#dtfMotif)" />
      <rect x={S2 - 30} y={62} width={60} height={12} rx={3} fill={NEUTRAL_FILL} stroke={NEUTRAL_LINE} strokeWidth="1.2" />
      <rect x={S2 - 8} y={78} width={16} height={14} rx={2} fill={NEUTRAL_LINE} opacity="0.6" />
      <Label cx={S2}>Presse à chaud</Label>

      <Arrow x={234} accent={accent} />

      {/* Étape 3 — textile */}
      <StageFrame cx={S3} />
      <Tshirt cx={S3} cy={58} />
      <circle cx={S3 - 5} cy={52} r={5} fill="#b13f74" opacity="0.9" />
      <circle cx={S3 + 4} cy={54} r={5} fill="#2b73a6" opacity="0.75" />
      <circle cx={S3} cy={60} r={5} fill="#7a4f9c" opacity="0.75" />
      <Label cx={S3}>Sur le textile</Label>
    </svg>
  );
}

/** Flex — vinyle découpé → échenillage → pressé net. Accent bleu. */
export function FlexArt({ className }: ArtProps) {
  const accent = "#2b73a6";
  return (
    <svg viewBox="0 0 380 140" className={className} role="img" aria-label="Flex : un vinyle de couleur découpé puis échenillé, pressé net sur le textile">
      {/* Étape 1 — vinyle + lame de découpe */}
      <StageFrame cx={S1} />
      <rect x={S1 - 26} y={38} width={52} height={48} rx={6} fill={NEUTRAL_FILL} stroke={NEUTRAL_LINE} strokeWidth="1.2" />
      {/* lettre A en tracé de découpe (pointillés) */}
      <path d={`M ${S1 - 10} 76 L ${S1} 48 L ${S1 + 10} 76 M ${S1 - 6} 66 L ${S1 + 6} 66`} fill="none" stroke={accent} strokeWidth="1.8" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round" />
      {/* lame */}
      <path d={`M ${S1 + 14} 40 l 6 6 -3 3 -6 -6 z`} fill={accent} opacity="0.85" />
      <Label cx={S1}>Vinyle découpé</Label>

      <Arrow x={114} accent={accent} />

      {/* Étape 2 — échenillage (lettre levée) */}
      <StageFrame cx={S2} />
      <rect x={S2 - 26} y={38} width={52} height={48} rx={6} fill={NEUTRAL_FILL} stroke={NEUTRAL_LINE} strokeWidth="1.2" />
      <path d={`M ${S2 - 10} 78 L ${S2} 46 L ${S2 + 10} 78 L ${S2 + 4} 78 L ${S2 + 1.5} 70 L ${S2 - 1.5} 70 L ${S2 - 4} 78 Z M ${S2 - 0} 56 L ${S2 + 3} 64 L ${S2 - 3} 64 Z`} fill={accent} />
      {/* petit coin soulevé */}
      <path d={`M ${S2 + 12} 44 q 6 -2 9 2`} fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      <Label cx={S2}>Échenillage</Label>

      <Arrow x={234} accent={accent} />

      {/* Étape 3 — textile net */}
      <StageFrame cx={S3} />
      <Tshirt cx={S3} cy={58} />
      <path d={`M ${S3 - 7} 64 L ${S3} 48 L ${S3 + 7} 64 L ${S3 + 3.5} 64 L ${S3 + 2} 59 L ${S3 - 2} 59 L ${S3 - 3.5} 64 Z`} fill={accent} />
      <Label cx={S3}>Marquage net</Label>
    </svg>
  );
}

/** Broderie — fil → aiguille & points → emblème en relief. Accent violet. */
export function BroderieArt({ className }: ArtProps) {
  const accent = "#4c2f6f";
  return (
    <svg viewBox="0 0 380 140" className={className} role="img" aria-label="Broderie : du fil et une aiguille forment des points qui composent un emblème en relief">
      {/* Étape 1 — bobine de fil */}
      <StageFrame cx={S1} />
      <rect x={S1 - 8} y={40} width={16} height={44} rx={3} fill={NEUTRAL_FILL} stroke={NEUTRAL_LINE} strokeWidth="1.2" />
      <g stroke={accent} strokeWidth="2.2" strokeLinecap="round">
        <line x1={S1 - 8} y1={48} x2={S1 + 8} y2={48} />
        <line x1={S1 - 8} y1={54} x2={S1 + 8} y2={54} />
        <line x1={S1 - 8} y1={60} x2={S1 + 8} y2={60} />
        <line x1={S1 - 8} y1={66} x2={S1 + 8} y2={66} />
        <line x1={S1 - 8} y1={72} x2={S1 + 8} y2={72} />
      </g>
      {/* brin qui s'échappe */}
      <path d={`M ${S1 + 8} 50 q 14 6 6 22`} fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <Label cx={S1}>Fil & couleur</Label>

      <Arrow x={114} accent={accent} />

      {/* Étape 2 — aiguille + points */}
      <StageFrame cx={S2} />
      {/* tissu */}
      <rect x={S2 - 26} y={42} width={52} height={40} rx={6} fill={NEUTRAL_FILL} stroke={NEUTRAL_LINE} strokeWidth="1.2" />
      {/* rangée de points */}
      <g stroke={accent} strokeWidth="2.4" strokeLinecap="round">
        <line x1={S2 - 18} y1={64} x2={S2 - 12} y2={58} />
        <line x1={S2 - 9} y1={64} x2={S2 - 3} y2={58} />
        <line x1={S2} y1={64} x2={S2 + 6} y2={58} />
        <line x1={S2 + 9} y1={64} x2={S2 + 15} y2={58} />
      </g>
      {/* aiguille + fil */}
      <line x1={S2 + 20} y1={34} x2={S2 + 6} y2={58} stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <circle cx={S2 + 20} cy={34} r={2.4} fill="none" stroke={accent} strokeWidth="1.6" />
      <path d={`M ${S2 + 20} 34 q -10 6 -4 16`} fill="none" stroke={accent} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <Label cx={S2}>Points piqués</Label>

      <Arrow x={234} accent={accent} />

      {/* Étape 3 — emblème brodé en relief */}
      <StageFrame cx={S3} />
      <Tshirt cx={S3} cy={58} />
      {/* écusson relief */}
      <circle cx={S3} cy={56} r={9} fill={accent} opacity="0.16" />
      <circle cx={S3} cy={56} r={9} fill="none" stroke={accent} strokeWidth="1.6" />
      <g stroke={accent} strokeWidth="1.3" strokeLinecap="round" opacity="0.85">
        <line x1={S3 - 5} y1={53} x2={S3 + 5} y2={53} />
        <line x1={S3 - 6} y1={56} x2={S3 + 6} y2={56} />
        <line x1={S3 - 5} y1={59} x2={S3 + 5} y2={59} />
      </g>
      <Label cx={S3}>Relief durable</Label>
    </svg>
  );
}

export const TECHNIQUE_ART: Record<"dtf" | "flex" | "broderie", (p: ArtProps) => React.ReactElement> = {
  dtf: DtfArt,
  flex: FlexArt,
  broderie: BroderieArt,
};

/** Sélectionne et rend l'illustration d'une technique par son id. */
export function TechniqueArtById({ id, className }: { id: string; className?: string }) {
  const Art = TECHNIQUE_ART[id as "dtf" | "flex" | "broderie"];
  return Art ? <Art className={className} /> : null;
}
