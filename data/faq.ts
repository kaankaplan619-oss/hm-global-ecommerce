/**
 * data/faq.ts
 *
 * FAQ générale du site (page /faq). Bon pour le SEO (résultats enrichis) et la
 * confiance — ce que les concurrents locaux ont et que nous n'avions pas.
 *
 * RÈGLE ANTI-INVENTION : réponses basées uniquement sur des faits vérifiables du
 * code (techniques réelles, seuil atelier = 10, formats d'upload PNG/JPG,
 * paiement CB/virement, commande invité, studio + BAT, adresse réelle). Aucun
 * délai chiffré, avis ou promesse inventés.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Personnalisation & commande",
    items: [
      {
        q: "Comment personnaliser un produit ?",
        a: "Choisissez un produit dans le catalogue, puis ouvrez le studio en ligne : ajoutez votre logo, votre texte ou un QR code, positionnez-les sur le produit et visualisez le rendu en temps réel avant d'ajouter au panier.",
      },
      {
        q: "Puis-je voir le rendu avant de commander ?",
        a: "Oui. Le studio affiche un aperçu en temps réel de votre marquage sur le produit. Un bon à tirer (BAT) vous est également présenté avant le lancement de la production.",
      },
      {
        q: "Quels formats de fichier puis-je importer pour mon logo ?",
        a: "Les fichiers PNG et JPG sont acceptés. Pour un rendu net, privilégiez un logo en haute résolution, idéalement un PNG à fond transparent.",
      },
      {
        q: "Dois-je créer un compte pour commander ?",
        a: "Non. Vous pouvez commander en tant qu'invité avec votre e-mail. Créer un compte reste utile pour retrouver vos commandes, vos factures et vos adresses.",
      },
    ],
  },
  {
    title: "Techniques & quantités",
    items: [
      {
        q: "Quelles techniques de marquage proposez-vous ?",
        a: "DTF, DTFlex, flex / vinyle et broderie machine (dont broderie couleur illimitée). Nous vous orientons vers la technique la plus adaptée à votre visuel et à votre textile.",
      },
      {
        q: "Y a-t-il une quantité minimum ?",
        a: "Vous pouvez commander à partir d'une seule pièce en impression à la demande. À partir de 10 pièces, la production bascule sur notre atelier local pour un meilleur tarif.",
      },
      {
        q: "Faites-vous aussi l'enseigne, le marquage véhicule et l'impression ?",
        a: "Oui. En plus du textile, nous réalisons la signalétique et les enseignes, le marquage et le covering de véhicules, ainsi que l'impression (cartes de visite, flyers, panneaux). Ces prestations se lancent sur devis.",
      },
    ],
  },
  {
    title: "Prix, paiement & livraison",
    items: [
      {
        q: "Les prix sont-ils affichés ?",
        a: "Oui. Le prix s'affiche immédiatement dans le studio et le catalogue, et il est dégressif selon la quantité. Pas besoin d'attendre un devis pour connaître votre tarif.",
      },
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Le paiement se fait en ligne par carte bancaire, ou par virement bancaire (les instructions vous sont envoyées par e-mail après la commande).",
      },
      {
        q: "Où êtes-vous situés et livrez-vous ?",
        a: "Notre atelier est à Souffelweyersheim (67460), à quelques minutes de Strasbourg. Nous intervenons dans le Bas-Rhin et en Alsace, et livrons vos commandes partout en France.",
      },
    ],
  },
];

/** FAQ à plat (pour les données structurées FAQPage). */
export const FAQ_FLAT: FaqItem[] = FAQ_GROUPS.flatMap((g) => g.items);
