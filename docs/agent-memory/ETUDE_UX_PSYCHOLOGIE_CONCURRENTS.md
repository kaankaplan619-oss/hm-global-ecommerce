# Étude UX + psychologie de conversion — leaders print vs HM Global (juin 2026)

Workflow 4 axes (accueil + compte/SAV + psychologie + mapping notre code). Sites : PrintOclock, Pixartprinting, instantprint, Vistaprint, MOO, Helloprint. ⚠️ Ne jamais afficher de note/avis non sourcé (DGCCRF) ni de dark pattern.

## Posture stratégique
- **MOO = boussole esthétique** (gamme resserrée, soin, logos clients désirables, garantie nommée « L'engagement MOO »).
- **PrintOclock = boussole « imprimeur local »** (« Imprimé à Toulouse », hotline pas sous-traitée) — mais à l'échelle d'un **quartier**, pas d'un pays.
- **NE PAS imiter Pixart/Helloprint** (supermarché de masse, « 900 000 clients », promo -70%). Emprunter leurs **mécaniques de clarté**, jouer ce qu'eux ne peuvent pas : Strasbourg, atelier réel, BAT humain, délai Alsace, retrait.

## A. Patterns d'accueil à s'approprier
1. **Triptyque réassurance sous le hero** (Helloprint 4 badges, Vistaprint 3 blocs). On l'a déjà (4 blocs). Garder, version locale vérifiable (« Imprimé & marqué à Strasbourg · BAT avant prod · Atelier Alsace »).
2. **Prix d'appel affiché DÈS la home** (PrintOclock « 9,90 €/100 ex », instantprint « start at £7 »). On a les chips dégressifs en fiche → remonter « T-shirt marqué dès 14,90 € · franco dès 3 ».
3. **Double porte : par produit ET par secteur/intention** (Vistaprint « Restauration / BTP » + « Lancer mon entreprise »). On a `HomeNeedsPacks` (6 cartes secteur) MAIS **bloc #12/14** → à remonter above-the-fold.
4. **Vérif fichier comme argument marketing** (instantprint « We check every artwork — free »). On a le BAT → le vendre ATF : « un humain regarde votre fichier ».
5. **Preuve sociale par les marques/clients, pas le volume** (MOO = Uber/Coca ; Helloprint = SNCF/Doctolib). On a 9 logos → + témoignages locaux nommés.

## B. Compte/profil — ce que tous ont et qu'on n'a pas
- **Reorder « commander à nouveau » en 1 clic** = pattern central universel (Vistaprint, MOO « Edit & Reorder », Helloprint). **On ne l'a PAS** → #1 ROI réassort B2B.
- Historique + statut + **suivi transporteur cliquable** (on a le tracking, à exposer).
- **Designs sauvegardés « Mes créations »** (MOO « Your Packs ») — on n'a pas.
- **Carnet d'adresses persisté** (livraison + facturation séparées) — le nôtre n'est PAS sauvegardé (perdu au reload, `adresses/page.tsx:174-177`).
- Factures PDF (on a). Champs entreprise SIRET/TVA (on a).
- **B2B self-ordering à la MOO** (gabarit verrouillé, l'employé recommande seul) = P3, plus tard quand ≥ qqs comptes pros.

## C. SAV — le plus copiable
- **Garantie satisfaction NOMMÉE** (MOO « L'engagement MOO » ; Helloprint « 100% Satisfaction » = 3 options : réimpression / remboursement / garder+10%, réclamation par photo, **exclusions explicites = erreurs du fichier client**). On l'a mais **enterrée sur /sav** → la nommer « La Garantie HM Global », la mettre sur fiche + checkout + email.
- **WhatsApp Business** > chat live 7j/7 (coûteux, même PrintOclock l'affiche « indisponible »). Notre bouton flottant = **quiz statique avec une icône de chat = trompeur**.
- FAQ structurée + horaires affichés (Pixart 8h-22h week-end).
- Espace « Mes demandes/SAV » centralisé (on a un embryon dans le détail commande).

## D. Psychologie — 10 micro-détails à fort ROI (principe → où)
1. **Deadline coupe atelier honnête** : « Commandez avant 14h, expédié aujourd'hui » (urgence VRAIE) → fiche sous le prix + panier.
2. **Avis au niveau de la variante** (Vistaprint « 4.4 (24854) ») → fiche, ⚠️ seulement si avis vérifiés sourcés (DGCCRF).
3. **Garantie nommée** → bloc réassurance fiche + checkout + email.
4. **Microcopy anti-angoisse à l'upload** : « un humain vérifie votre fichier » → studio, sous la zone de dépôt.
5. **BAT vendu comme bénéfice** (pas juste une étape) → fiche + panier.
6. **Échantillon DTF gratuit** (réciprocité — TOUS le font : MOO/Vista/instantprint/Pixart) → CTA secondaire fiche. Son absence = paraît moins sérieux.
7. **Prix « à partir de X €/u » + prix du lot côte à côte** (ancrage PrintOclock) → headline prix fiche.
8. **Bandeau « -X% 1re commande » à date de fin explicite** → header sitewide.
9. **« Atelier Strasbourg, jamais sous-traité »** (réduction risque + diff) → bloc réassurance + accueil.
10. **Reorder 1 clic** (friction-killer réachat) → compte.

## E. Dark patterns à ÉVITER (éthique + DGCCRF/Omnibus)
- Faux compteurs « 12 personnes regardent » (sauf vrai, façon Etsy « vues sur 24h »).
- Faux compte à rebours qui se réinitialise au reload.
- Faux prix barrés / fausse remise (prix de réf = plus bas des 30 derniers jours).
- **Notes/avis non sourcés** (« 4.9/5 · 200+ projets » = risque déjà flaggé).
- Échantillons « gratuits » avec port caché.
- Cases pré-cochées au checkout (RGPD).

## F. Mapping → notre code (top quick wins LOCAL/B2B, faible effort)
| # | Action | État | Effort | Fichier |
|---|---|---|---|---|
| 1 | **Remonter l'entrée « par besoin/secteur »** above-the-fold | AMÉLIORER | faible | `app/page.tsx:78` (déplacer `HomeNeedsPacks`) |
| 2 | **WhatsApp réel** sur le bouton flottant (vs quiz) | CRÉER | faible-moyen | `components/assistant/QuoteAssistant.tsx`, `app/sav/page.tsx` |
| 3 | **Garantie nommée** sur fiche + checkout | AMÉLIORER | faible | bloc réassurance `ProductDetailClient.tsx`, `fr.json:830` |
| 4 | **Reorder 1 clic** | CRÉER | moyen | `app/mon-compte/commandes/[id]/page.tsx` + `store/cart` |
| 5 | **Échantillon DTF gratuit** (CTA) | CRÉER | faible | fiche + footer |
| 6 | **Deadline atelier + prix « dès X/u »** sur fiche | AMÉLIORER | faible | `ProductDetailClient.tsx` |
| 7 | Carnet d'adresses persisté | AMÉLIORER | moyen | `app/mon-compte/adresses/page.tsx:174` + route API |
| 8 | Recherche/filtres catalogue | CRÉER | moyen | `app/catalogue/page.tsx:48` (liens de catégorie only) |
| 9 | Designs sauvegardés « Mes créations » | CRÉER | élevé | table + `app/mon-compte/designs/` |
| 10 | Note « 4,7/5 » figée → sourcer ou retirer | AMÉLIORER | faible | `HomeHeroPremium.tsx:91` |

**Déjà bon (ne pas refaire)** : suivi colis, BAT, fenêtre annulation, demande facture/remboursement, dashboard+stats, SIRET/TVA, mur de logos, réalisations. Choix gardé = **prix visibles sur la fiche** (Pixart/PrintOclock les cachent derrière le configurateur — on a raison de les montrer).
