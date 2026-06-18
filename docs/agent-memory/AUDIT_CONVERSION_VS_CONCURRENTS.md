# Audit conversion — HM Global vs PrintOclock / Pixartprinting (juin 2026)

Question : qu'est-ce qui manque pour donner envie d'acheter chez HM Global plutôt que chez un imprimeur national ? Workflow 3 axes (leviers concurrents + audit de notre tunnel + différenciation locale) + observation visuelle de l'accueil.

## Verdict : le site est BIEN FAIT
Tunnel complet et positionnement déjà différencié. À NE PAS refaire (points forts confirmés) :
- Checkout complet : invité (guest) + Stripe (CB/Apple/Google Pay/Link) + virement + badges + « paiement 100% sécurisé » + SSL + récap HT/TVA/port/TTC + B2B SIRET/TVA.
- BAT avant production omniprésent ; port offert dès 3 articles (jauge panier) ; suivi/tracking + facture + remboursement self-service.
- Positionnement local déjà fort : hero « atelier à Souffelweyersheim, vous validez votre BAT », réassurance (atelier Alsace / BAT / depuis 2018 / « pas à l'autre bout de l'Europe »), mur de 9 logos clients réels, 25 réalisations nommées (`data/realisations.ts`), avis Google.

## Le combat : ne PAS se battre sur prix/vitesse (perdus). Gagner sur ce qu'eux ne peuvent PAS faire.
PrintOclock/Pixart = usines logistiques anonymes. 7 leviers structurellement impossibles pour eux :
1. Agence physique en Alsace (RDV, visite atelier, pose sur site).
2. Interlocuteur humain unique + conseil.
3. Accompagnement PAO / création graphique incluse.
4. 3 métiers en 1 (équipe + locaux + vitrine, un seul devis).
5. Réactivité / production locale (retrait, dépannage J0/J1).
6. Relation B2B récurrente (réassort sur mêmes fichiers).
7. Ancrage territorial made-in-Alsace.
→ Vendre la **tranquillité d'esprit du patron de PME** : un humain joignable, qui corrige le fichier, valide un BAT, produit à 15 min, qu'il reverra l'an prochain.

## Ce que les concurrents font et qu'on a déjà (ne pas réinventer)
Barre réassurance livraison/délai/France · prix d'appel HT visible · éditeur+modèles · BAT · éco. **On a tout ça.** Leur faiblesse commune : aucun avis sur la fiche produit, support délocalisé, mono-métier, pas de local.

## CE QUI MANQUE — priorisé « pour gagner contre eux »

### A. Différenciation locale (le cœur de la réponse — eux ne pourront JAMAIS le faire)
| # | Manque | Donnée déjà là ? | Effort |
|---|---|---|---|
| A1 | **Témoignages clients LOCAUX nommés** (3-5 verbatims « Le Naga, Strasbourg » / « METEM » / « JS Alsace »). #1 manque. Aujourd'hui = logos muets, 0 phrase client. | Oui (`data/realisations.ts`, manque champ `quote`/`author`) | **faible-moyen** |
| A2 | **« Parlez à un humain » en CTA + WhatsApp** (le tél `06 76 16 11 88` est enterré dans le footer, jamais un bouton). Anti-self-service par excellence. | Tél existe | **faible** |
| A3 | **Invitation visite atelier / RDV** (« passez voir l'atelier à Souffelweyersheim »). L'argument que PrintOclock ne pourra jamais écrire. Absent. | — (copy) | **faible** |
| A4 | **Étude de cas déroulée** (1 projet : besoin → conseil → BAT → prod → pose, ex. Le Naga dépose+pose). Transforme une vignette en preuve de process. | Oui (`naga-depose`+`naga-enseigne`) | **moyen** |
| A5 | **Garantie « satisfait / réimprimé si défaut » sur la FICHE PRODUIT + checkout** (existe seulement sur `/sav` + `/engagements` = là où la décision ne se prend pas). | Oui (`fr.json:830-832`) | **faible** |
| A6 | **Portfolio filtrable par secteur** sur `/realisations` (resto / BTP / asso). Fonction `realisationsBySector()` existe déjà, page affiche à plat. | Oui | **faible-moyen** |

### B. Trous de conversion « classiques » (utiles à tout e-commerce B2B)
| # | Manque | Effort |
|---|---|---|
| B1 | **« Recommander / réassort en 1 clic »** dans mon-compte (friction n°1 du B2B récurrent : équipes, événements). Absent. | moyen |
| B2 | **Date de livraison estimée au panier/checkout** (la ligne « Livraison » n'affiche qu'un prix). | moyen |
| B3 | **Avis : passer de 14 à 50+ + brancher `GOOGLE_PLACES_API_KEY`** (sinon seules la note s'affiche, pas les verbatims) + **widget tiers** (Trustpilot/Avis Vérifiés). Tâche Tuncer (Google Business). | Tuncer + faible |
| B4 | **Contact temps réel** : le bouton flottant est un quiz statique, pas un chat (ni WhatsApp). Trafic = Instagram. | moyen |
| B5 | **Échantillons / nuancier** (toucher la matière avant 50 pièces) — standard imprimeur pro, absent. | décision business |
| B6 | **FAQ** confinée à `/sav` (5 questions), pas de FAQ produit ni schema.org FAQ (conversion + SEO). | faible |

### ⚠️ Petit bug à corriger
- **Note « 4,7/5 » figée en dur** dans le hero (`HomeHeroPremium.tsx:87-93`) alors que `GoogleReviews` lit l'API plus bas → risque d'incohérence. À sourcer dynamiquement.

## Reco : 4 quick wins « anti-national » (faible effort, fort impact, données déjà là)
1. **A1 Témoignages locaux nommés** (sous le mur de logos).
2. **A2 CTA « Appelez l'atelier » + WhatsApp** (hero + sticky mobile).
3. **A5 Garantie satisfait/réimprimé** sur la fiche produit + checkout.
4. **A3 Invitation visite atelier** (bloc « venez nous voir »).
→ Ces 4 transforment « site local sympa » en « preuve qu'un autre patron alsacien nous fait confiance + porte humaine ouverte » = les 2 seules choses qui justifient de payer plus cher qu'un national.

⚠️ Conformité : ne PAS inventer de note/avis non sourcé (DGCCRF) — n'afficher que des verbatims réels de clients réels.
