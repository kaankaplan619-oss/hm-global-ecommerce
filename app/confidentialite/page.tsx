import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | HM Global Agence",
  description: "Politique de confidentialité et protection des données personnelles — HM Global Agence, conformité RGPD.",
};

export default function ConfidentialitePage() {
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
            Politique de confidentialité
          </h1>
          <p className="mt-3 text-sm text-[var(--hm-text-soft)]">
            Dernière mise à jour : 1er mai 2026 — Conforme au RGPD (Règlement UE 2016/679)
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-[var(--hm-text-soft)] leading-7">

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées sur ce site est :
            </p>
            <div className="mt-3 rounded-lg border border-[var(--hm-line)] bg-white p-4 text-sm">
              <p><strong>HM Global Agence</strong></p>
              <p>20 Rue des Tuileries, 67460 Souffelweyersheim, France</p>
              <p>Téléphone : <a href="tel:+33676161188" className="text-[var(--hm-primary)] hover:underline">06 76 16 11 88</a></p>
              <p>Email : <a href="mailto:contact@hmga.fr" className="text-[var(--hm-primary)] hover:underline">contact@hmga.fr</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">2. Données collectées</h2>
            <p>
              Nous collectons les données suivantes lors de votre utilisation du site :
            </p>
            <p className="mt-3 font-semibold text-[var(--hm-text)]">Lors de la création d'un compte :</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Prénom et nom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Mot de passe (chiffré, jamais stocké en clair)</li>
              <li>Pour les entreprises : raison sociale, numéro SIRET, TVA intracommunautaire</li>
            </ul>
            <p className="mt-3 font-semibold text-[var(--hm-text)]">Lors d'une commande :</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Adresse de livraison et de facturation</li>
              <li>Détails de la commande (produits, quantités, personnalisation)</li>
              <li>Fichiers graphiques fournis pour la personnalisation</li>
              <li>Informations de paiement (traitées exclusivement par Stripe — HM Global ne stocke pas vos données bancaires)</li>
            </ul>
            <p className="mt-3 font-semibold text-[var(--hm-text)]">Automatiquement :</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Adresse IP</li>
              <li>Données de navigation (pages visitées, durée de session)</li>
              <li>Type de navigateur et système d'exploitation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">3. Finalités et bases légales du traitement</h2>
            <div className="space-y-3">
              <div className="rounded-lg border border-[var(--hm-line)] bg-white p-4 text-sm">
                <p className="font-semibold text-[var(--hm-text)]">Gestion des commandes et de la relation client</p>
                <p className="mt-1">Base légale : exécution d'un contrat — nécessaire pour traiter vos commandes, vous envoyer les confirmations et gérer les réclamations.</p>
              </div>
              <div className="rounded-lg border border-[var(--hm-line)] bg-white p-4 text-sm">
                <p className="font-semibold text-[var(--hm-text)]">Création et gestion de votre espace client</p>
                <p className="mt-1">Base légale : exécution d'un contrat — nécessaire pour vous permettre d'accéder à votre historique de commandes et gérer vos informations.</p>
              </div>
              <div className="rounded-lg border border-[var(--hm-line)] bg-white p-4 text-sm">
                <p className="font-semibold text-[var(--hm-text)]">Obligations comptables et fiscales</p>
                <p className="mt-1">Base légale : obligation légale — conservation des factures et pièces comptables conformément à la loi française.</p>
              </div>
              <div className="rounded-lg border border-[var(--hm-line)] bg-white p-4 text-sm">
                <p className="font-semibold text-[var(--hm-text)]">Amélioration du site et analyses</p>
                <p className="mt-1">Base légale : intérêt légitime — analyse des données de navigation anonymisées pour améliorer nos services.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">4. Durée de conservation</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Données de compte :</strong> conservées jusqu'à la suppression du compte + 3 ans pour permettre la réouverture</li>
              <li><strong>Données de commandes :</strong> 10 ans (durée légale de conservation des pièces comptables)</li>
              <li><strong>Fichiers graphiques :</strong> 1 an après la commande, puis supprimés automatiquement</li>
              <li><strong>Données de navigation :</strong> 13 mois maximum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">5. Destinataires des données</h2>
            <p>
              Vos données sont traitées par HM Global Agence et ses sous-traitants techniques, dans le strict cadre de l'exécution de nos services :
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Supabase</strong> (hébergement de la base de données et authentification) — serveurs en Union Européenne</li>
              <li><strong>Stripe</strong> (paiement en ligne sécurisé) — certifié PCI-DSS niveau 1</li>
              <li><strong>Vercel</strong> (hébergement du site web) — conforme au RGPD</li>
              <li><strong>Transporteurs</strong> (livraison de vos commandes) — uniquement nom, adresse, téléphone</li>
            </ul>
            <p className="mt-3">
              Vos données ne sont jamais vendues ni cédées à des tiers à des fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">6. Transferts hors UE</h2>
            <p>
              Certains de nos prestataires (Stripe, Vercel) peuvent transférer des données hors de l'Union Européenne. Ces transferts sont encadrés par des garanties appropriées (clauses contractuelles types de la Commission Européenne, adhésion au Data Privacy Framework).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">7. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données (sous réserve des obligations légales)</li>
              <li><strong>Droit à la limitation</strong> : restreindre le traitement de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible</li>
              <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements basés sur l'intérêt légitime</li>
              <li><strong>Droit de retrait du consentement</strong> : à tout moment, sans affecter la licéité des traitements antérieurs</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, contactez-nous à <a href="mailto:contact@hmga.fr" className="text-[var(--hm-primary)] hover:underline">contact@hmga.fr</a> en indiquant votre demande et une pièce d'identité. Nous nous engageons à répondre dans un délai d'un mois.
            </p>
            <p className="mt-3">
              Vous disposez également du droit d'introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[var(--hm-primary)] hover:underline">www.cnil.fr</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">8. Sécurité des données</h2>
            <p>
              HM Global Agence met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, destruction ou altération :
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Chiffrement des communications via HTTPS/TLS</li>
              <li>Mots de passe stockés avec hachage cryptographique (bcrypt)</li>
              <li>Accès aux données restreint aux personnes habilitées</li>
              <li>Authentification sécurisée via Supabase Auth</li>
              <li>Paiements traités exclusivement par Stripe (certifié PCI-DSS)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">9. Cookies</h2>
            <p>
              Notre site utilise des cookies strictement nécessaires à son fonctionnement (session d'authentification, panier). Aucun cookie publicitaire tiers n'est utilisé. Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">10. Modifications de cette politique</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Toute modification substantielle sera notifiée par email aux utilisateurs disposant d'un compte. La date de dernière mise à jour figure en haut de ce document.
            </p>
          </section>

        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-[var(--hm-line)] pt-8">
          <Link href="/cgv" className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)] transition-colors">
            Conditions générales de vente
          </Link>
          <Link href="/mentions-legales" className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)] transition-colors">
            Mentions légales
          </Link>
          <Link href="/contact" className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)] transition-colors">
            Nous contacter
          </Link>
        </div>

      </div>
    </div>
  );
}
