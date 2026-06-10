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
    id: "enseigne-crusty-coq",
    title: "Enseigne lumineuse — Crusty Coq",
    sector: "Signalétique",
    tags: ["Enseigne", "Pose"],
    image: "/images/realisations/enseigne-1664.jpg",
    alt: "Pose d'une enseigne lumineuse ronde en façade chez Crusty Coq",
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
