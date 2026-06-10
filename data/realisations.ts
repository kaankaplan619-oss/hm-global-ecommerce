/**
 * data/realisations.ts
 *
 * Vraies réalisations HM Global (photos clients réels). Source de vérité unique
 * pour la galerie /realisations et les exemples par secteur sur /entreprises.
 * Photos : public/images/realisations/ (converties depuis les originaux).
 * Techniques validées par Kaan (2026-06-10) : majoritairement DTF.
 */

export interface Realisation {
  id:       string;
  title:    string;
  sector:   string;       // secteur client (sert aussi au regroupement /entreprises)
  tags:     string[];     // techniques / supports
  image:    string;
  alt:      string;
}

export const REALISATIONS: Realisation[] = [
  {
    id: "prestige-polos",
    title: "Polos marqués — Prestige Bar à Vin",
    sector: "Restauration",
    tags: ["DTF", "Polo"],
    image: "/images/realisations/prestige-polo-broderie.jpg",
    alt: "Polo noir avec logo Prestige Bar à Vin imprimé en DTF doré",
  },
  {
    id: "prestige-tshirts",
    title: "T-shirts imprimés — Prestige Vins & Boissons",
    sector: "Restauration",
    tags: ["DTF", "T-shirt"],
    image: "/images/realisations/prestige-tshirts.jpg",
    alt: "T-shirts noirs marqués Prestige Vins & boissons en DTF (poitrine + manche)",
  },
  {
    id: "js-alsace-softshell",
    title: "Softshells marquées — JS Alsace Detailing",
    sector: "Automobile",
    tags: ["DTF", "Softshell"],
    image: "/images/realisations/js-alsace-softshell.jpg",
    alt: "Softshell marquée en DTF au logo JS Alsace Detailing",
  },
  {
    id: "js-alsace-ensemble",
    title: "Tenues d'équipe — JS Alsace Detailing",
    sector: "Automobile",
    tags: ["DTF", "Softshell", "T-shirt"],
    image: "/images/realisations/js-alsace-ensemble.jpg",
    alt: "Softshell et t-shirt marqués JS Alsace Detailing en DTF",
  },
  {
    id: "metem-softshell",
    title: "Vestes softshell — METEM",
    sector: "Entreprise",
    tags: ["DTF", "Softshell"],
    image: "/images/realisations/metem-softshell.jpg",
    alt: "Vestes softshell noires logo METEM, prêtes à être livrées",
  },
  {
    id: "metem-transferts",
    title: "Planche de transferts DTF — METEM",
    sector: "Entreprise",
    tags: ["DTF", "Transferts"],
    image: "/images/realisations/metem-autocollants.jpg",
    alt: "Planche de transferts DTF METEM prête à presser",
  },
  {
    id: "okami-softshell",
    title: "Softshell de sécurité — Okami Protection",
    sector: "Sécurité",
    tags: ["Flex thermocollant", "Softshell"],
    image: "/images/realisations/okami-softshell.jpg",
    alt: "Softshell noire avec marquage Okami Protection en flex blanc et bande réfléchissante",
  },
  {
    id: "vehicule-scorpion",
    title: "Habillage véhicule — scorpion vinyle",
    sector: "Véhicule",
    tags: ["Covering", "Vinyle"],
    image: "/images/realisations/vehicule-scorpion.jpg",
    alt: "Utilitaire Renault Master habillé d'un scorpion en vinyle découpé",
  },
  {
    id: "scorpion-creation",
    title: "Du dessin à la découpe — scorpion",
    sector: "Véhicule",
    tags: ["Création graphique", "Découpe vinyle"],
    image: "/images/realisations/scorpion-creation.jpg",
    alt: "Visuel scorpion découpé en vinyle avant pose sur véhicule",
  },
  {
    id: "miammi-fabrication",
    title: "Enseigne lumineuse en fabrication — MiAMMi",
    sector: "Signalétique",
    tags: ["Enseigne", "Lettres rétroéclairées"],
    image: "/images/realisations/miammi-fabrication.jpg",
    alt: "Lettres rétroéclairées MiAMMi en cours d'assemblage à l'atelier",
  },
  {
    id: "miammi-pose",
    title: "Enseignes posées — MiAMMi",
    sector: "Signalétique",
    tags: ["Enseigne", "Pose"],
    image: "/images/realisations/miammi-pose.jpg",
    alt: "Caisson lumineux rond et panneau MiAMMi posés en façade",
  },
  {
    id: "naga-depose",
    title: "Dépose de l'ancienne enseigne — Le Naga",
    sector: "Signalétique",
    tags: ["Dépose", "Façade"],
    image: "/images/realisations/alternative-pose.jpg",
    alt: "Dépose des anciennes lettres de façade avant pose de l'enseigne Le Naga",
  },
  {
    id: "naga-enseigne",
    title: "Nouvelle enseigne rétroéclairée — Le Naga Sushi & Wok",
    sector: "Signalétique",
    tags: ["Enseigne", "Rétroéclairage"],
    image: "/images/realisations/naga-enseigne.jpg",
    alt: "Nouvelle enseigne lumineuse Le Naga Sushi & Wok posée, éclairée de nuit",
  },
  {
    id: "selim-vitrine",
    title: "Habillage vitrine — Selim Coiffure",
    sector: "Signalétique",
    tags: ["Vitrine", "Vinyle"],
    image: "/images/realisations/selim-vitrine.jpg",
    alt: "Vitrine du salon Selim Coiffure avec lettrage et logos en vinyle",
  },
  {
    id: "enseigne-crusty-coq",
    title: "Enseigne lumineuse — Crusty Coq",
    sector: "Signalétique",
    tags: ["Enseigne", "Pose"],
    image: "/images/realisations/enseigne-1664.jpg",
    alt: "Enseigne lumineuse ronde posée en façade chez Crusty Coq",
  },
  {
    id: "totem-euro-automobile",
    title: "Conception totem 3D — Euro Automobile",
    sector: "Signalétique",
    tags: ["Totem", "Maquette 3D"],
    image: "/images/realisations/totem-euro-automobile.jpg",
    alt: "Maquette 3D du totem signalétique Euro Automobile",
  },
  {
    id: "foch-cartes",
    title: "Cartes de visite — Foch Restaurant",
    sector: "Print",
    tags: ["Cartes de visite"],
    image: "/images/realisations/foch-cartes.jpg",
    alt: "Cartes de visite Foch Restaurant imprimées et livrées",
  },
  {
    id: "ncm-flyers",
    title: "Flyers — NCM Terrassement",
    sector: "Print",
    tags: ["Flyers"],
    image: "/images/realisations/ncm-flyers.jpg",
    alt: "Flyers NCM Terrassement imprimés recto-verso",
  },
  {
    id: "illico-panneau",
    title: "Panneau de chantier — illiCO travaux",
    sector: "Print",
    tags: ["Panneau"],
    image: "/images/realisations/illico-panneau.jpg",
    alt: "Panneau de chantier imprimé pour illiCO travaux",
  },
  {
    id: "hm-print",
    title: "Flyers & cartes de visite — HM Global",
    sector: "Print",
    tags: ["Flyers", "Cartes de visite"],
    image: "/images/realisations/hm-global-print.jpg",
    alt: "Flyers et cartes de visite HM Global imprimés",
  },
];

/** Réalisations regroupées par secteur (pour la page Entreprises). */
export function realisationsBySector(): Record<string, Realisation[]> {
  return REALISATIONS.reduce<Record<string, Realisation[]>>((acc, r) => {
    (acc[r.sector] ??= []).push(r);
    return acc;
  }, {});
}
