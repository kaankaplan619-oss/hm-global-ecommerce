import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | HM Global Agence",
  description: "Conditions générales de vente de HM Global Agence — textile personnalisé, impression et communication visuelle.",
};

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-[var(--hm-surface)] pt-28 pb-20">
      <div className="container max-w-3xl">

        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--hm-line)] bg-white px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--hm-primary)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-primary)]">
              Document légal
            </span>
          </div>
          <h1 className="text-4xl font-black text-[var(--hm-text)]">
            Conditions Générales de Vente
          </h1>
          <p className="mt-3 text-sm text-[var(--hm-text-soft)]">
            Dernière mise à jour : 1er mai 2026
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-[var(--hm-text-soft)] leading-7">

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">1. Identification du vendeur</h2>
            <p>
              Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre <strong>HM Global Agence</strong>, entreprise domiciliée au 20 Rue des Tuileries, 67460 Souffelweyersheim, France (ci-après « HM Global »), et tout client passant commande via le site <strong>hm-global.fr</strong> ou directement auprès de nos équipes.
            </p>
            <p className="mt-3">
              Contact : <a href="tel:+33676161188" className="text-[var(--hm-primary)] hover:underline">06 76 16 11 88</a> — <a href="mailto:contact@hmga.fr" className="text-[var(--hm-primary)] hover:underline">contact@hmga.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">2. Champ d'application</h2>
            <p>
              Toute commande passée auprès de HM Global Agence implique l'acceptation sans réserve des présentes CGV par le client. Ces conditions prévalent sur tout autre document du client, notamment ses propres conditions générales d'achat. HM Global se réserve le droit de modifier ses CGV à tout moment ; les conditions applicables sont celles en vigueur à la date de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">3. Produits et services</h2>
            <p>
              HM Global Agence propose :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Textile personnalisé (t-shirts, polos, hoodies, softshells, vestes, polaires, casquettes, bonnets, sacs)</li>
              <li>Impression et marquage (sérigraphie, broderie, flocage, transfert numérique)</li>
              <li>Communication visuelle et préparation de fichiers pour l'impression</li>
              <li>Conseil et accompagnement créatif</li>
            </ul>
            <p className="mt-3">
              Les produits sont décrits et présentés avec la plus grande exactitude possible. Toutefois, en raison des particularités techniques de la personnalisation textile, des variations mineures de teintes ou de finitions peuvent apparaître entre le visuel et le produit final. Ces variations ne constituent pas un motif de réclamation sauf défaut manifeste de qualité.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">4. Commandes</h2>
            <p>
              Toute commande est considérée comme ferme et définitive après :
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Validation du bon de commande par le client</li>
              <li>Validation du BAT (bon à tirer) numérique par le client</li>
              <li>Réception du paiement ou confirmation d'acompte</li>
            </ol>
            <p className="mt-3">
              HM Global se réserve le droit de refuser ou d'annuler une commande en cas de litige préexistant avec le client, d'indisponibilité du produit, ou de tout motif légitime. Toute modification de commande après validation du BAT entraîne des frais supplémentaires.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">5. Tarifs et paiement</h2>
            <p>
              Les prix sont indiqués en euros (€) hors taxes (HT) sauf mention contraire. La TVA applicable est celle en vigueur au jour de la commande. HM Global se réserve le droit de modifier ses tarifs à tout moment, sans préavis, sous réserve d'en informer le client avant validation de la commande.
            </p>
            <p className="mt-3">
              <strong>Modalités de paiement acceptées :</strong>
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Carte bancaire (Visa, Mastercard, CB) via Stripe</li>
              <li>Virement bancaire (sur devis)</li>
              <li>Chèque (sur devis, à l'ordre de HM Global Agence)</li>
            </ul>
            <p className="mt-3">
              Un acompte de 30 % à 50 % peut être demandé à la commande selon le montant total. Le solde est exigible à la livraison ou avant expédition.
            </p>
            <p className="mt-3">
              Tout retard de paiement entraîne, de plein droit et sans mise en demeure préalable, l'application de pénalités de retard au taux légal en vigueur, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 €.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">6. Délais de production et livraison</h2>
            <p>
              Les délais de production standard sont de <strong>5 à 15 jours ouvrés</strong> à compter de la validation du BAT et du règlement de l'acompte. Ces délais sont donnés à titre indicatif et ne constituent pas un engagement contractuel sauf accord écrit spécifique.
            </p>
            <p className="mt-3">
              HM Global décline toute responsabilité pour les retards dus à des circonstances indépendantes de sa volonté (grèves transporteurs, rupture d'approvisionnement, cas de force majeure).
            </p>
            <p className="mt-3">
              La livraison est effectuée à l'adresse indiquée par le client lors de la commande. Les frais de livraison sont à la charge du client sauf accord contraire.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">7. Bon à tirer (BAT)</h2>
            <p>
              Avant toute mise en production, un BAT numérique est soumis au client pour validation. Le client dispose de <strong>48 heures ouvrées</strong> pour valider ou formuler des corrections. Passé ce délai sans retour, le BAT est considéré comme approuvé et la production peut démarrer.
            </p>
            <p className="mt-3">
              La validation du BAT est irrévocable. Toute erreur non signalée avant validation (faute d'orthographe, mauvais logo, couleurs incorrectes) est à la charge exclusive du client et ne peut donner lieu à remplacement ou remboursement.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">8. Retours et réclamations</h2>
            <p>
              En raison du caractère <strong>personnalisé</strong> de nos produits, le droit de rétractation prévu par le Code de la consommation ne s'applique pas aux articles fabriqués selon les spécifications du client (article L221-28 du Code de la consommation).
            </p>
            <p className="mt-3">
              Toute réclamation relative à un défaut de fabrication (impression incorrecte, défaut matière) doit être signalée dans les <strong>7 jours ouvrés</strong> suivant la réception, accompagnée de photos justificatives. Passé ce délai, aucune réclamation ne sera acceptée.
            </p>
            <p className="mt-3">
              En cas de défaut avéré de notre fait, HM Global s'engage à reproduire les articles concernés ou, à défaut, à rembourser leur montant.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">9. Propriété intellectuelle</h2>
            <p>
              Le client certifie être titulaire des droits sur les fichiers, logos et visuels transmis à HM Global pour réalisation. HM Global ne pourra en aucun cas être tenu responsable de l'utilisation de visuels ne respectant pas les droits de tiers. Le client garantit HM Global contre tout recours de tiers relatif aux contenus qu'il a fournis.
            </p>
            <p className="mt-3">
              HM Global se réserve le droit d'utiliser les réalisations effectuées à des fins de référence commerciale (portfolio, réseaux sociaux), sauf opposition écrite du client lors de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">10. Responsabilité</h2>
            <p>
              La responsabilité de HM Global est limitée au montant de la commande concernée. HM Global ne saurait être tenu responsable de préjudices indirects, pertes d'exploitation ou de bénéfices résultant d'un défaut ou retard.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">11. Droit applicable et litiges</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut d'accord, les tribunaux compétents du ressort de Strasbourg seront seuls compétents, nonobstant pluralité de défendeurs.
            </p>
            <p className="mt-3">
              Conformément aux articles L611-1 et suivants du Code de la consommation, le consommateur peut recourir à un médiateur de la consommation en cas de litige non résolu.
            </p>
          </section>

        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-[var(--hm-line)] pt-8">
          <Link href="/mentions-legales" className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)] transition-colors">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)] transition-colors">
            Politique de confidentialité
          </Link>
          <Link href="/contact" className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)] transition-colors">
            Nous contacter
          </Link>
        </div>

      </div>
    </div>
  );
}
