import type { TechniqueOption, PlacementOption } from "@/types";

export const TECHNIQUES: TechniqueOption[] = [
  {
    id: "dtf",
    label: "DTF",
    description:
      "Direct To Film — rendu vif, couleurs illimitées, idéal pour les visuels complexes et les dégradés. Technique phare pour un résultat impeccable.",
    available: true,
  },
  {
    id: "dtflex",
    label: "DTFlex",
    description:
      "DTFlex — dernière génération. Résultat ultra-vif, toucher soyeux, excellente tenue sur tissus foncés. Couches plus fines, rendu plus premium que le DTF classique.",
    available: true,
  },
  {
    id: "flex",
    label: "Flex / Vinyle",
    description:
      "Découpe vinyle thermocollant — trait net, look sport et corporate. Idéal pour les logos simples et les typographies.",
    available: true,
  },
  {
    id: "broderie",
    label: "Broderie",
    description:
      "Broderie machine haute définition — rendu premium et durable. Idéal pour les polos, vestes et softshells. Finition professionnelle garantie.",
    available: true,
  },
  {
    id: "broderie_illimitee",
    label: "Broderie · Couleur illimitée",
    description:
      "Broderie couleurs illimitées — même qualité premium, mais sans restriction sur le nombre de couleurs du fil. Idéal pour les logos multicolores complexes.",
    available: true,
  },
];

export const PLACEMENTS: PlacementOption[] = [
  {
    id: "coeur",
    label: "Cœur",
    description: "Emplaçement standard côté cœur (poitrine gauche). Idéal pour un logo discret et professionnel.",
  },
  {
    id: "dos",
    label: "Dos",
    description: "Marquage plein dos, grande visibilité. Parfait pour les équipes sportives et les événements.",
  },
  {
    id: "coeur-dos",
    label: "Cœur + Dos",
    description: "Double emplacement — cœur ET dos. Visibilité maximale pour votre marque.",
  },
];

export const TECHNIQUE_LABELS: Record<string, string> = {
  dtf:                "DTF",
  dtflex:             "DTFlex",
  flex:               "Flex / Vinyle",
  broderie:           "Broderie",
  broderie_illimitee: "Broderie · Couleur illimitée",
  print:              "Impression",
};

export const PLACEMENT_LABELS: Record<string, string> = {
  coeur:     "Cœur",
  dos:       "Dos",
  "coeur-dos": "Cœur + Dos",
};

export const TECHNIQUE_BADGES: Record<string, string> = {
  dtf:                "Populaire",
  dtflex:             "Nouveau",
  flex:               "Économique",
  broderie:           "Premium",
  broderie_illimitee: "Illimitée",
};

export const TECHNIQUE_COLORS: Record<string, string> = {
  dtf:                "#c9a96e",
  dtflex:             "#7c3aed",
  flex:               "#60a5fa",
  broderie:           "#a78bfa",
  broderie_illimitee: "#9333ea",
};
