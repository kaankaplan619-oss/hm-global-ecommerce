import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site HM Global Agence — éditeur, hébergeur, propriété intellectuelle.",
};

export default function MentionsLegalesPage() {
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
            Mentions légales
          </h1>
          <p className="mt-3 text-sm text-[var(--hm-text-soft)]">
            Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN).
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-[var(--hm-text-soft)] leading-7">

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">1. Éditeur du site</h2>
            <div className="rounded-lg border border-[var(--hm-line)] bg-white p-5 text-sm space-y-1">
              <p><strong className="text-[var(--hm-text)]">HM Global Agence</strong></p>
              <p>20 Rue des Tuileries</p>
              <p>67460 Souffelweyersheim</p>
              <p>Alsace, France</p>
              <p className="pt-2">Téléphone : <a href="tel:+33676161188" className="text-[var(--hm-primary)] hover:underline">06 76 16 11 88</a></p>
              <p>Email : <a href="mailto:contact@hmga.fr" className="text-[var(--hm-primary)] hover:underline">contact@hmga.fr</a></p>
              <p className="pt-2">Horaires : Lundi – Vendredi, 9h – 18h</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">2. Directeur de la publication</h2>
            <p>
              Le directeur de la publication est le représentant légal de HM Global Agence.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">3. Hébergement du site</h2>
            <div className="rounded-lg border border-[var(--hm-line)] bg-white p-5 text-sm space-y-1">
              <p><strong className="text-[var(--hm-text)]">Vercel Inc.</strong></p>
              <p>340 Pine Street, Suite 701</p>
              <p>San Francisco, CA 94104</p>
              <p>États-Unis</p>
              <p className="pt-2">Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[var(--hm-primary)] hover:underline">vercel.com</a></p>
            </div>
            <p className="mt-3">
              Les données des utilisateurs européens sont traitées conformément au RGPD. Pour plus d'informations, consultez notre <Link href="/confidentialite" className="text-[var(--hm-primary)] hover:underline">politique de confidentialité</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">4. Base de données et authentification</h2>
            <div className="rounded-lg border border-[var(--hm-line)] bg-white p-5 text-sm space-y-1">
              <p><strong className="text-[var(--hm-text)]">Supabase Inc.</strong></p>
              <p>970 Toa Payoh North #07-04</p>
              <p>Singapore 318992</p>
              <p className="pt-2">Site : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[var(--hm-primary)] hover:underline">supabase.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">5. Paiement en ligne</h2>
            <div className="rounded-lg border border-[var(--hm-line)] bg-white p-5 text-sm space-y-1">
              <p><strong className="text-[var(--hm-text)]">Stripe Payments Europe, Ltd.</strong></p>
              <p>1 Grand Canal Street Lower</p>
              <p>Grand Canal Dock, Dublin, D02 H210</p>
              <p>Irlande</p>
              <p className="pt-2">Site : <a href="https://stripe.com/fr" target="_blank" rel="noopener noreferrer" className="text-[var(--hm-primary)] hover:underline">stripe.com</a></p>
              <p className="mt-2 text-[var(--hm-text-soft)]">
                Les transactions de paiement sont sécurisées et certifiées PCI-DSS niveau 1. HM Global Agence ne stocke aucune donnée bancaire.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">6. Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments constituant ce site (textes, graphismes, logotypes, images, photographies, sons, vidéos, mise en page, base de données) est la propriété exclusive de HM Global Agence ou fait l'objet d'une autorisation d'utilisation. Ces éléments sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="mt-3">
              Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit et sur quelque support que ce soit est interdite sans l'autorisation préalable écrite de HM Global Agence.
            </p>
            <p className="mt-3">
              Le non-respect de cette interdiction constitue une contrefaçon susceptible d'engager la responsabilité civile et pénale du contrefacteur.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">7. Marques</h2>
            <p>
              Les marques et logos figurant sur ce site sont déposés par HM Global Agence ou leurs titulaires respectifs. Toute reproduction sans autorisation préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">8. Liens hypertextes</h2>
            <p>
              HM Global Agence décline toute responsabilité quant au contenu des sites tiers vers lesquels des liens hypertextes sont proposés sur ce site. L'existence d'un lien vers un site tiers ne constitue pas une validation de ce site ou de son contenu.
            </p>
            <p className="mt-3">
              Toute création de lien hypertexte vers une page de ce site requiert l'autorisation préalable et écrite de HM Global Agence, sauf pour les liens sans cadre (sans frame) vers la page d'accueil.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">9. Cookies</h2>
            <p>
              Ce site utilise des cookies strictement nécessaires à son fonctionnement (gestion de session, panier d'achat). Pour plus d'informations sur notre utilisation des cookies et vos droits, consultez notre <Link href="/confidentialite" className="text-[var(--hm-primary)] hover:underline">politique de confidentialité</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">10. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--hm-text)] mb-3">11. Contact</h2>
            <p>
              Pour toute question relative aux présentes mentions légales ou à l'utilisation de ce site, vous pouvez nous contacter :
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Par email : <a href="mailto:contact@hmga.fr" className="text-[var(--hm-primary)] hover:underline">contact@hmga.fr</a></li>
              <li>Par téléphone : <a href="tel:+33676161188" className="text-[var(--hm-primary)] hover:underline">06 76 16 11 88</a></li>
              <li>Par courrier : 20 Rue des Tuileries, 67460 Souffelweyersheim, France</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-[var(--hm-line)] pt-8">
          <Link href="/cgv" className="text-sm text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)] transition-colors">
            Conditions générales de vente
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
