/**
 * data/realisations.ts
 *
 * Vraies réalisations HM Global (photos clients réels). Source de vérité unique
 * pour la galerie /realisations et les exemples par secteur sur /entreprises.
 * Photos : public/images/realisations/ (converties depuis les originaux).
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
    title: "Polos brodés — Prestige Bar à Vin",
    sector: "Restauration",
    tags: ["Broderie", "Polo"],
    image: "/images/realisations/prestige-polo-broderie.jpg",
    alt: "Polo noir avec logo Prestige Bar à Vin brodé en doré",
  },
  {
    id: "prestige-tshirts",
    title: "T-shirts floqués — Prestige Vins & Boissons",
    sector: "Restauration",
    tags: ["Impression", "T-shirt"],
    image: "/images/realisations/prestige-tshirts.jpg",
    alt: "T-shirts noirs marqués Prestige Vins & boissons (poitrine + manche)",
  },
  {
    id: "js-alsace-softshell",
    title: "Softshells brodés — JS Alsace Detailing",
    sector: "Automobile",
    tags: ["Broderie", "Softshell"],
    image: "/images/realisations/js-alsace-softshell.jpg",
    alt: "Softshell brodée au logo JS Alsace Detailing",
  },
  {
    id: "js-alsace-ensemble",
    title: "Tenues d'équipe — JS Alsace Detailing",
    sector: "Automobile",
    tags: ["Broderie", "Softshell", "T-shirt"],
    image: "/images/realisations/js-alsace-ensemble.jpg",
    alt: "Softshell et t-shirt brodés JS Alsace Detailing",
  },
  {
    id: "metem-softshell",
    title: "Vestes softshell — METEM",
    sector: "Entreprise",
    tags: ["Broderie", "Softshell"],
    image: "/images/realisations/metem-softshell.jpg",
    alt: "Vestes softshell noires logo METEM, prêtes à être livrées",
  },
  {
    id: "metem-autocollants",
    title: "Autocollants découpés — METEM",
    sector: "Entreprise",
    tags: ["Autocollants", "Découpe"],
    image: "/images/realisations/metem-autocollants.jpg",
    alt: "Planche d'autocollants METEM découpés",
  },
  {
    id: "okami-softshell",
    title: "Softshell de sécurité — Okami Protection",
    sector: "Sécurité",
    tags: ["Flex / transfert", "Softshell"],
    image: "/images/realisations/okami-softshell.jpg",
    alt: "Softshell noire avec marquage Okami Protection et bande réfléchissante",
  },
  {
    id: "taxi-cartes",
    title: "Cartes de visite — Taxi Capital Service",
    sector: "Transport",
    tags: ["Cartes de visite", "Print"],
    image: "/images/realisations/taxi-capital-carte-recto.jpg",
    alt: "Carte de visite Taxi & VSL Capital Service",
  },
  {
    id: "enseigne-1664",
    title: "Enseigne lumineuse posée",
    sector: "Signalétique",
    tags: ["Enseigne", "Pose"],
    image: "/images/realisations/enseigne-1664.jpg",
    alt: "Pose d'une enseigne lumineuse ronde en façade",
  },
  {
    id: "hm-print",
    title: "Flyers & cartes de visite",
    sector: "Print",
    tags: ["Flyers", "Cartes de visite"],
    image: "/images/realisations/hm-global-print.jpg",
    alt: "Flyers et cartes de visite imprimés",
  },
  {
    id: "atelier-vinyle",
    title: "Notre atelier — découpe vinyle",
    sector: "Savoir-faire",
    tags: ["Atelier", "Découpe vinyle"],
    image: "/images/realisations/atelier-traceur-vinyle.jpg",
    alt: "Traceur de découpe et rouleaux de vinyle de couleur à l'atelier",
  },
];

/** Réalisations regroupées par secteur (pour la page Entreprises). */
export function realisationsBySector(): Record<string, Realisation[]> {
  return REALISATIONS.reduce<Record<string, Realisation[]>>((acc, r) => {
    (acc[r.sector] ??= []).push(r);
    return acc;
  }, {});
}
