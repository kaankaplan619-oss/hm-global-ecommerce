/**
 * data/realisations.ts
 *
 * Vraies réalisations HM Global (photos clients réels). Source de vérité unique
 * pour la galerie /realisations et les exemples par secteur sur /entreprises.
 * Photos : public/images/realisations/ (converties depuis les originaux).
 * Techniques validées par Kaan (2026-06-10) : majoritairement DTF.
 *
 * `category` = catégorie de filtre sur /realisations (assignée d'après le projet
 * RÉEL, jamais inventée). Les filtres affichés sont dérivés des données présentes
 * (un filtre n'apparaît que s'il a au moins une réalisation).
 */

export type RealisationCategory =
  | "textile"
  | "print"
  | "signaletique"
  | "vehicules"
  | "enseignes"
  | "goodies";

export interface Realisation {
  id:       string;
  title:    string;
  sector:   string;             // secteur client (sert aussi au regroupement /entreprises)
  category: RealisationCategory; // catégorie de filtre galerie
  tags:     string[];           // techniques / supports
  image:    string;
  alt:      string;
}

export const REALISATIONS: Realisation[] = [
  {
    id: "prestige-polos",
    title: "Polos marqués — Prestige Bar à Vin",
    sector: "Restauration",
    category: "textile",
    tags: ["DTF", "Polo"],
    image: "/images/realisations/prestige-polo-broderie.jpg",
    alt: "Polo noir avec logo Prestige Bar à Vin imprimé en DTF doré",
  },
  {
    id: "prestige-tshirts",
    title: "T-shirts imprimés — Prestige Vins & Boissons",
    sector: "Restauration",
    category: "textile",
    tags: ["DTF", "T-shirt"],
    image: "/images/realisations/prestige-tshirts.jpg",
    alt: "T-shirts noirs marqués Prestige Vins & boissons en DTF (poitrine + manche)",
  },
  {
    id: "js-alsace-softshell",
    title: "Softshells marquées — JS Alsace Detailing",
    sector: "Automobile",
    category: "textile",
    tags: ["DTF", "Softshell"],
    image: "/images/realisations/js-alsace-softshell.jpg",
    alt: "Softshell marquée en DTF au logo JS Alsace Detailing",
  },
  {
    id: "js-alsace-ensemble",
    title: "Tenues d'équipe — JS Alsace Detailing",
    sector: "Automobile",
    category: "textile",
    tags: ["DTF", "Softshell", "T-shirt"],
    image: "/images/realisations/js-alsace-ensemble.jpg",
    alt: "Softshell et t-shirt marqués JS Alsace Detailing en DTF",
  },
  {
    id: "metem-softshell",
    title: "Vestes softshell — METEM",
    sector: "Entreprise",
    category: "textile",
    tags: ["DTF", "Softshell"],
    image: "/images/realisations/metem-softshell.jpg",
    alt: "Vestes softshell noires logo METEM, prêtes à être livrées",
  },
  {
    id: "metem-transferts",
    title: "Planche de transferts DTF — METEM",
    sector: "Entreprise",
    category: "textile",
    tags: ["DTF", "Transferts"],
    image: "/images/realisations/metem-autocollants.jpg",
    alt: "Planche de transferts DTF METEM prête à presser",
  },
  {
    id: "okami-softshell",
    title: "Softshell de sécurité — Okami Protection",
    sector: "Sécurité",
    category: "textile",
    tags: ["Flex thermocollant", "Softshell"],
    image: "/images/realisations/okami-softshell.jpg",
    alt: "Softshell noire avec marquage Okami Protection en flex blanc et bande réfléchissante",
  },
  {
    id: "vehicule-scorpion",
    title: "Habillage véhicule — scorpion vinyle",
    sector: "Véhicule",
    category: "vehicules",
    tags: ["Covering", "Vinyle"],
    image: "/images/realisations/vehicule-scorpion.jpg",
    alt: "Utilitaire Renault Master habillé d'un scorpion en vinyle découpé",
  },
  {
    id: "scorpion-creation",
    title: "Du dessin à la découpe — scorpion",
    sector: "Véhicule",
    category: "vehicules",
    tags: ["Création graphique", "Découpe vinyle"],
    image: "/images/realisations/scorpion-creation.jpg",
    alt: "Visuel scorpion découpé en vinyle avant pose sur véhicule",
  },
  {
    id: "exo-solar-vehicule",
    title: "Lettrage véhicule — Exo Solar",
    sector: "Véhicule",
    category: "vehicules",
    tags: ["Lettrage", "Vinyle"],
    image: "/images/realisations/exo-solar-vehicule.jpg",
    alt: "Berlingo gris lettré Exo Solar, photographié devant l'agence HM Global",
  },
  {
    id: "oz-tat-camion",
    title: "Habillage camion frigorifique — Öz-Tat",
    sector: "Véhicule",
    category: "vehicules",
    tags: ["Lettrage", "Camion"],
    image: "/images/realisations/oz-tat-camion.jpg",
    alt: "Arrière du camion frigorifique Öz-Tat lettré en vinyle",
  },
  {
    id: "miammi-fabrication",
    title: "Enseigne lumineuse en fabrication — MiAMMi",
    sector: "Signalétique",
    category: "enseignes",
    tags: ["Enseigne", "Lettres rétroéclairées"],
    image: "/images/realisations/miammi-fabrication.jpg",
    alt: "Lettres rétroéclairées MiAMMi en cours d'assemblage à l'atelier",
  },
  {
    id: "miammi-pose",
    title: "Enseignes posées — MiAMMi",
    sector: "Signalétique",
    category: "enseignes",
    tags: ["Enseigne", "Pose"],
    image: "/images/realisations/miammi-pose.jpg",
    alt: "Caisson lumineux rond et panneau MiAMMi posés en façade",
  },
  {
    id: "naga-depose",
    title: "Dépose de l'ancienne enseigne — Le Naga",
    sector: "Signalétique",
    category: "enseignes",
    tags: ["Dépose", "Façade"],
    image: "/images/realisations/alternative-pose.jpg",
    alt: "Dépose des anciennes lettres de façade avant pose de l'enseigne Le Naga",
  },
  {
    id: "naga-enseigne",
    title: "Nouvelle enseigne rétroéclairée — Le Naga Sushi & Wok",
    sector: "Signalétique",
    category: "enseignes",
    tags: ["Enseigne", "Rétroéclairage"],
    image: "/images/realisations/naga-enseigne.jpg",
    alt: "Nouvelle enseigne lumineuse Le Naga Sushi & Wok posée, éclairée de nuit",
  },
  {
    id: "ibo-barber-facade",
    title: "Enseigne et vitrines — IBO Barber",
    sector: "Signalétique",
    category: "enseignes",
    tags: ["Enseigne", "Vitrine"],
    image: "/images/realisations/ibo-barber-facade.jpg",
    alt: "Façade IBO Barber avec enseigne posée et vitrines habillées",
  },
  {
    id: "hera-home-enseigne",
    title: "Enseigne de façade — Hera Home",
    sector: "Signalétique",
    category: "enseignes",
    tags: ["Enseigne", "Pose"],
    image: "/images/realisations/hera-home-enseigne.jpg",
    alt: "Enseigne noire Hera Home posée au-dessus de l'entrée du magasin",
  },
  {
    id: "selim-vitrine",
    title: "Habillage vitrine — Selim Coiffure",
    sector: "Signalétique",
    category: "signaletique",
    tags: ["Vitrine", "Vinyle"],
    image: "/images/realisations/selim-vitrine.jpg",
    alt: "Vitrine du salon Selim Coiffure avec lettrage et logos en vinyle",
  },
  {
    id: "enseigne-crusty-coq",
    title: "Enseigne lumineuse — Crusty Coq",
    sector: "Signalétique",
    category: "enseignes",
    tags: ["Enseigne", "Pose"],
    image: "/images/realisations/enseigne-1664.jpg",
    alt: "Enseigne lumineuse ronde posée en façade chez Crusty Coq",
  },
  {
    id: "jour-j-enseigne",
    title: "Enseigne lettres rétroéclairées — Jour J",
    sector: "Signalétique",
    category: "enseignes",
    tags: ["Enseigne", "Lettres découpées"],
    image: "/images/realisations/jour-j-enseigne.jpg",
    alt: "Façade noire Jour J Salle de réception avec lettres blanches rétroéclairées",
  },
  {
    id: "totem-euro-automobile",
    title: "Conception totem 3D — Euro Automobile",
    sector: "Signalétique",
    category: "signaletique",
    tags: ["Totem", "Maquette 3D"],
    image: "/images/realisations/totem-euro-automobile.jpg",
    alt: "Maquette 3D du totem signalétique Euro Automobile",
  },
  {
    id: "foch-cartes",
    title: "Cartes de visite — Foch Restaurant",
    sector: "Print",
    category: "print",
    tags: ["Cartes de visite"],
    image: "/images/realisations/foch-cartes.jpg",
    alt: "Cartes de visite Foch Restaurant imprimées et livrées",
  },
  {
    id: "ncm-flyers",
    title: "Flyers — NCM Terrassement",
    sector: "Print",
    category: "print",
    tags: ["Flyers"],
    image: "/images/realisations/ncm-flyers.jpg",
    alt: "Flyers NCM Terrassement imprimés recto-verso",
  },
  {
    id: "illico-panneau",
    title: "Panneau de chantier — illiCO travaux",
    sector: "Print",
    category: "print",
    tags: ["Panneau"],
    image: "/images/realisations/illico-panneau.jpg",
    alt: "Panneau de chantier imprimé pour illiCO travaux",
  },
  {
    id: "hm-print",
    title: "Flyers & cartes de visite — HM Global",
    sector: "Print",
    category: "print",
    tags: ["Flyers", "Cartes de visite"],
    image: "/images/realisations/hm-global-print.jpg",
    alt: "Flyers et cartes de visite HM Global imprimés",
  },

  // — Pack 2026-06 (vraies réalisations clients, vérifiées image par image) —
  {
    id: "yasart-covering",
    title: "Lettrage véhicule — YASART Isolation",
    sector: "Bâtiment",
    category: "vehicules",
    tags: ["Lettrage", "Vinyle"],
    image: "/images/realisations/yasart-covering.jpg",
    alt: "Renault Clio lettrée aux couleurs de YASART Isolation (Strasbourg), trois angles",
  },
  {
    id: "ce-bat-fiat-doblo",
    title: "Marquage utilitaire — CE-BAT (Fiat Doblo)",
    sector: "Bâtiment",
    category: "vehicules",
    tags: ["Lettrage", "Utilitaire"],
    image: "/images/realisations/ce-bat-fiat-doblo.jpg",
    alt: "Fiat Doblo blanc floqué CE-BAT (étanchéité, zinguerie, pliage), trois angles",
  },
  {
    id: "ce-bat-benne",
    title: "Lettrage camion benne — CE-BAT",
    sector: "Bâtiment",
    category: "vehicules",
    tags: ["Lettrage", "Camion benne"],
    image: "/images/realisations/ce-bat-benne.jpg",
    alt: "Renault Master benne CE-BAT marqué logo et lettrage sur les ridelles, quatre angles",
  },
  {
    id: "ce-bat-polos",
    title: "Polos marqués — CE-BAT",
    sector: "Bâtiment",
    category: "textile",
    tags: ["Polo", "Poitrine + dos"],
    image: "/images/realisations/ce-bat-polos.jpg",
    alt: "Polos gris et noir marqués CE-BAT, logo poitrine et grand marquage dos",
  },
  {
    id: "o2-cartes",
    title: "Cartes de visite — O2 Concept",
    sector: "Bâtiment",
    category: "print",
    tags: ["Cartes de visite", "Identité"],
    image: "/images/realisations/o2-cartes.jpg",
    alt: "Carte de visite O2 Concept (Entreprise Générale, Strasbourg) — recto logo et QR code",
  },
  {
    id: "activ-renovation-panneau",
    title: "Panneau de chantier — Activ-Rénovation",
    sector: "Bâtiment",
    category: "print",
    tags: ["Panneau de chantier", "Grand format"],
    image: "/images/realisations/activ-renovation-panneau.jpg",
    alt: "Panneau de chantier Activ-Rénovation (Eschau) — travaux de rénovation et neuf",
  },
  {
    id: "hm-stylos",
    title: "Stylos personnalisés — HM Global",
    sector: "Goodies",
    category: "goodies",
    tags: ["Stylos", "Objet publicitaire"],
    image: "/images/realisations/hm-stylos.jpg",
    alt: "Stylos blancs personnalisés au logo et aux coordonnées de HM Global Agence",
  },
  {
    id: "boulangerie-tote-bag",
    title: "Tote bag coton — Boulangerie du Quartier",
    sector: "Goodies",
    category: "goodies",
    tags: ["Tote bag", "Coton"],
    image: "/images/realisations/boulangerie-tote-bag.jpg",
    alt: "Tote bag en coton personnalisé Boulangerie du Quartier (Haguenau), impression recto",
  },
];

/** Ordre d'affichage des catégories de filtre (galerie /realisations). */
export const REALISATION_CATEGORY_ORDER: RealisationCategory[] = [
  "textile",
  "print",
  "signaletique",
  "vehicules",
  "enseignes",
  "goodies",
];

/** Catégories réellement présentes dans les données (pour n'afficher que des filtres utiles). */
export function realisationCategoriesPresent(): RealisationCategory[] {
  const present = new Set(REALISATIONS.map((r) => r.category));
  return REALISATION_CATEGORY_ORDER.filter((c) => present.has(c));
}

/** Réalisations regroupées par secteur (pour la page Entreprises). */
export function realisationsBySector(): Record<string, Realisation[]> {
  return REALISATIONS.reduce<Record<string, Realisation[]>>((acc, r) => {
    (acc[r.sector] ??= []).push(r);
    return acc;
  }, {});
}
