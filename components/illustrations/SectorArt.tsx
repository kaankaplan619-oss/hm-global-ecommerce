/**
 * SectorArt — illustrations SVG sur-mesure par secteur pour /entreprises.
 *
 * Demande Kaan 2026-06-13 : aérer une page trop textuelle avec des visuels
 * « différents de ce qu'on trouve en ligne ». Petites scènes vectorielles à la
 * charte HM Global (accent rose #b13f74), une par secteur, en bannière de carte.
 * Zéro droit d'auteur, léger, net partout.
 */

const ROSE = "#b13f74";
const BLUE = "#2b73a6";
const LINE = "#cfd2dc";
const FILL = "#ffffff";
const SOFT = "#f3f4f8";
const GROUND = "#d9dbe3";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 320 132" className="h-auto w-full" role="img" aria-label={label}>
      <rect x="0" y="0" width="320" height="132" rx="18" fill="none" />
      {children}
    </svg>
  );
}

/** BTP — bâtiment en construction, grue, casque de chantier. */
function Btp() {
  return (
    <Frame label="Secteur BTP : chantier, grue et casque de sécurité">
      <line x1="20" y1="108" x2="300" y2="108" stroke={GROUND} strokeWidth="2" strokeLinecap="round" />
      {/* bâtiment */}
      <rect x="150" y="44" width="78" height="64" rx="3" fill={SOFT} stroke={LINE} strokeWidth="1.6" />
      <g stroke={LINE} strokeWidth="1.3">
        <line x1="150" y1="62" x2="228" y2="62" />
        <line x1="150" y1="80" x2="228" y2="80" />
        <line x1="176" y1="44" x2="176" y2="108" />
        <line x1="202" y1="44" x2="202" y2="108" />
      </g>
      {/* grue */}
      <g stroke={ROSE} strokeWidth="2.2" strokeLinecap="round" fill="none">
        <line x1="244" y1="108" x2="244" y2="34" />
        <line x1="236" y1="108" x2="252" y2="108" />
        <line x1="210" y1="34" x2="276" y2="34" />
        <line x1="244" y1="34" x2="252" y2="22" />
        <line x1="220" y1="34" x2="220" y2="48" />
      </g>
      <rect x="214" y="48" width="12" height="9" rx="1.5" fill={ROSE} opacity="0.8" />
      {/* casque de chantier */}
      <g>
        <path d="M58 92 a30 30 0 0 1 60 0 Z" fill={ROSE} />
        <rect x="50" y="92" width="76" height="7" rx="3.5" fill={ROSE} />
        <path d="M88 64 v10" stroke={FILL} strokeWidth="3" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

/** Restauration — devanture avec store rayé et enseigne. */
function Restauration() {
  return (
    <Frame label="Secteur restauration : devanture de restaurant avec store">
      <line x1="20" y1="110" x2="300" y2="110" stroke={GROUND} strokeWidth="2" strokeLinecap="round" />
      <rect x="96" y="58" width="128" height="52" rx="3" fill={SOFT} stroke={LINE} strokeWidth="1.6" />
      {/* store rayé */}
      <path d="M88 58 h144 l-10 22 h-124 Z" fill={FILL} stroke={LINE} strokeWidth="1.4" />
      <g fill={ROSE}>
        <path d="M88 58 h18 l-8 22 h-19 Z" opacity="0.9" />
        <path d="M124 58 h18 l-9 22 h-18 Z" opacity="0.9" />
        <path d="M160 58 h18 l-9 22 h-18 Z" opacity="0.9" />
        <path d="M196 58 h18 l-10 22 h-17 Z" opacity="0.9" />
      </g>
      {/* porte + vitrine */}
      <rect x="148" y="84" width="24" height="26" rx="1.5" fill="#ffffff" stroke={LINE} strokeWidth="1.4" />
      <rect x="108" y="88" width="28" height="18" rx="1.5" fill="#ffffff" stroke={LINE} strokeWidth="1.3" />
      <rect x="184" y="88" width="28" height="18" rx="1.5" fill="#ffffff" stroke={LINE} strokeWidth="1.3" />
      {/* assiette + couverts */}
      <circle cx="258" cy="88" r="15" fill="none" stroke={BLUE} strokeWidth="1.8" />
      <circle cx="258" cy="88" r="7" fill={BLUE} opacity="0.18" />
      <line x1="240" y1="78" x2="240" y2="98" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="276" y1="78" x2="276" y2="98" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
    </Frame>
  );
}

/** Associations — un groupe de personnes, esprit collectif. */
function Associations() {
  const people = [
    { x: 118, r: 11, h: 34, c: BLUE },
    { x: 160, r: 13, h: 42, c: ROSE },
    { x: 202, r: 11, h: 34, c: BLUE },
  ];
  return (
    <Frame label="Secteur associations : un groupe de membres et bénévoles">
      <line x1="20" y1="108" x2="300" y2="108" stroke={GROUND} strokeWidth="2" strokeLinecap="round" />
      {/* cœur au-dessus */}
      <path d="M160 30 c-4 -8 -16 -5 -16 3 c0 6 8 11 16 17 c8 -6 16 -11 16 -17 c0 -8 -12 -11 -16 -3 Z" fill={ROSE} opacity="0.9" />
      {people.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={108 - p.h} r={p.r} fill={p.c} opacity={p.c === ROSE ? 0.9 : 0.75} />
          <path
            d={`M ${p.x - p.r - 3} 108 a ${p.r + 3} ${p.r + 6} 0 0 1 ${2 * (p.r + 3)} 0 Z`}
            fill={p.c}
            opacity={p.c === ROSE ? 0.9 : 0.75}
          />
        </g>
      ))}
    </Frame>
  );
}

/** Événements — guirlande de fanions + badge accréditation. */
function Evenements() {
  return (
    <Frame label="Secteur événements : guirlande de fanions et badge staff">
      {/* guirlande */}
      <path d="M24 30 q140 34 272 8" fill="none" stroke={LINE} strokeWidth="1.4" />
      {[
        [44, 36], [80, 42], [116, 45], [152, 45], [188, 43], [224, 38], [260, 32],
      ].map(([x, y], i) => (
        <path key={i} d={`M ${x - 8} ${y} h16 l-8 16 Z`} fill={i % 2 ? ROSE : BLUE} opacity="0.85" />
      ))}
      {/* badge */}
      <line x1="160" y1="60" x2="146" y2="84" stroke={LINE} strokeWidth="2" />
      <line x1="160" y1="60" x2="174" y2="84" stroke={LINE} strokeWidth="2" />
      <rect x="132" y="80" width="56" height="40" rx="6" fill={FILL} stroke={LINE} strokeWidth="1.6" />
      <rect x="150" y="74" width="20" height="10" rx="2" fill={ROSE} />
      <rect x="140" y="90" width="40" height="6" rx="3" fill={ROSE} opacity="0.85" />
      <line x1="140" y1="102" x2="180" y2="102" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="140" y1="110" x2="168" y2="110" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" />
    </Frame>
  );
}

/** PME — immeuble de bureaux + courbe de croissance. */
function Pme() {
  return (
    <Frame label="Secteur PME : immeuble de bureaux et croissance">
      <line x1="20" y1="110" x2="300" y2="110" stroke={GROUND} strokeWidth="2" strokeLinecap="round" />
      {/* immeuble principal */}
      <rect x="120" y="40" width="64" height="70" rx="3" fill={SOFT} stroke={LINE} strokeWidth="1.6" />
      {/* immeuble secondaire */}
      <rect x="188" y="64" width="44" height="46" rx="3" fill={FILL} stroke={LINE} strokeWidth="1.6" />
      {/* fenêtres éclairées */}
      <g fill={ROSE} opacity="0.85">
        <rect x="130" y="50" width="10" height="10" rx="1.5" />
        <rect x="148" y="50" width="10" height="10" rx="1.5" />
        <rect x="166" y="50" width="10" height="10" rx="1.5" />
        <rect x="130" y="70" width="10" height="10" rx="1.5" opacity="0.5" />
        <rect x="166" y="70" width="10" height="10" rx="1.5" />
        <rect x="148" y="90" width="10" height="10" rx="1.5" opacity="0.5" />
      </g>
      <g fill={BLUE} opacity="0.6">
        <rect x="196" y="74" width="9" height="9" rx="1.5" />
        <rect x="214" y="74" width="9" height="9" rx="1.5" />
        <rect x="196" y="90" width="9" height="9" rx="1.5" />
      </g>
      {/* courbe de croissance */}
      <g stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="246,96 262,84 274,90 290,66" />
        <polyline points="284,66 290,66 290,72" />
      </g>
    </Frame>
  );
}

/** Équipes terrain / commerce — utilitaire sur la route + point d'arrivée. */
function Terrain() {
  return (
    <Frame label="Secteur équipes terrain et commerce : véhicule utilitaire en tournée">
      {/* route */}
      <line x1="20" y1="104" x2="300" y2="104" stroke={GROUND} strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="116" x2="250" y2="116" stroke={LINE} strokeWidth="2" strokeDasharray="10 10" strokeLinecap="round" />
      {/* utilitaire */}
      <g>
        <path d="M96 96 v-26 h44 l16 14 v12 Z" fill={ROSE} opacity="0.9" />
        <rect x="60" y="78" width="40" height="18" rx="2" fill={ROSE} opacity="0.7" />
        <rect x="124" y="74" width="22" height="12" rx="2" fill="#ffffff" opacity="0.85" />
        <circle cx="80" cy="98" r="8" fill="#2d2340" />
        <circle cx="80" cy="98" r="3" fill="#ffffff" />
        <circle cx="132" cy="98" r="8" fill="#2d2340" />
        <circle cx="132" cy="98" r="3" fill="#ffffff" />
      </g>
      {/* point d'arrivée */}
      <g>
        <path d="M252 58 a14 14 0 1 0 -0.1 0 L252 86 Z" fill={BLUE} opacity="0.9" />
        <circle cx="252" cy="56" r="5" fill="#ffffff" />
      </g>
    </Frame>
  );
}

const SECTOR_ART: Record<string, () => React.ReactElement> = {
  btp: Btp,
  restauration: Restauration,
  associations: Associations,
  evenements: Evenements,
  pme: Pme,
  terrain: Terrain,
};

/** Rend l'illustration d'un secteur par son id. Renvoie null si inconnu. */
export function SectorArt({ id, className }: { id: string; className?: string }) {
  const Art = SECTOR_ART[id];
  if (!Art) return null;
  return (
    <div className={className}>
      <Art />
    </div>
  );
}
