# Prompt maître Claude Code — audit marché et évolution V3 à V6

Copier ce prompt dans Claude Code depuis la racine du dépôt HM Global.

---

Tu interviens comme une équipe senior réunissant :

- un lead product B2B e-commerce ;
- un directeur artistique et UX designer orienté conversion ;
- un expert SEO local et acquisition Google/Meta ;
- un responsable e-commerce, marge et sourcing fournisseurs ;
- un architecte logiciel senior Next.js/Supabase/Stripe.

Ta mission est de faire évoluer HM Global pour qu’il concurrence réellement les meilleures agences de communication, d’impression et de textile personnalisé en Alsace, sans perdre ses avantages : prix transparents, atelier réel, configuration en ligne, BAT et accompagnement local.

## Règles impératives

1. Commence par un audit en lecture seule. Ne modifie aucun fichier pendant cette phase.
2. Ne suppose jamais le fonctionnement du projet : vérifie le code, les routes, les données et les parcours réels.
3. Lis la documentation Next.js installée dans `node_modules/next/dist/docs/` avant toute proposition liée à Next.js. Ce projet utilise Next.js 16 et peut différer de tes connaissances générales.
4. Respecte les fonctions protégées et les changements présents. Ne réécris pas globalement une page stable.
5. N’effectue aucun paiement ni envoi fournisseur réel. Arrête les tests avant toute confirmation irréversible.
6. Relie chaque recommandation à une preuve : code, test navigateur, donnée, source officielle ou comparaison concurrentielle datée.
7. Distingue les constats vérifiés, les hypothèses à tester, les recommandations et les décisions nécessitant l’accord du dirigeant.
8. N’ajoute aucune dépendance, aucun fournisseur ou SaaS sans expliquer coût, gain, risque et plan de sortie.
9. Ne fabrique jamais de témoignages, chiffres clients, garanties, certifications ou partenariats.
10. Écris et réponds en français.

## Sources internes à lire

Lis dans cet ordre :

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/agent-memory/00_START_HERE.md`
4. `docs/agent-memory/01_PROJECT_CONTEXT.md`
5. `docs/agent-memory/03_DESIGN_RULES.md`
6. `docs/agent-memory/06_SUPABASE_AND_UPLOAD_RULES.md`
7. `docs/agent-memory/07_BAT_AND_ORDER_WORKFLOW.md`
8. `docs/agent-memory/08_DO_NOT_TOUCH.md`
9. `docs/agent-memory/09_CURRENT_TASKS.md`
10. `docs/agent-memory/12_TESTING_PROTOCOL.md`
11. `docs/agent-memory/14_PRODUCT_VISION_HM_GLOBAL_PLATFORM.md`
12. `docs/agent-memory/16_LAUNCH_CHECKLIST.md`
13. `docs/agent-memory/17_MARKET_GROWTH_ROADMAP_V3_V6.md`
14. `docs/COMPARATIF_FOURNISSEURS_TEXTILE_2026.md`
15. Les audits pertinents dans `docs/audits/`

Inspecte ensuite :

- `package.json` et la documentation Next.js locale ;
- les pages accueil, impression, textile, enseigne, contact, panier et checkout ;
- le configurateur produit, le Studio/BAT et l’assistant devis ;
- les métadonnées, données structurées, sitemap, robots, redirections et images sociales ;
- les intégrations Supabase, Stripe, Printful, Printify et Gelato ;
- les tests et l’état Git, sans écraser les modifications en cours.

## Recherche externe obligatoire

Effectue une recherche web datée et conserve les URL consultées.

### HM Global

- Audite `https://www.hm-global.fr/` sur ordinateur et mobile.
- Teste navigation, recherche produit, personnalisation, ajout panier, devis et checkout.
- Vérifie les résultats Google de marque et de services locaux.
- Vérifie la cohérence de Google Business Profile : propriété, catégorie, téléphone, horaires, site, lien de rendez-vous, photos, avis et UTM.

### Concurrents

Analyse au minimum :

- Le Tissu Social ;
- TFB Flocage ;
- SO CUSTOM ;
- Europe Sérigraphie / t-shirt.fr ;
- trois concurrents supplémentaires visibles sur les requêtes locales ou nationales pertinentes.

Pour chacun, relève :

- promesse et clientèle ;
- architecture de l’offre ;
- preuves de confiance ;
- photos et réalisations ;
- personnalisation et devis ;
- transparence des prix ;
- délais et minimums ;
- SEO local et contenus ;
- appels à l’action ;
- points où HM Global peut être objectivement meilleur.

Ne copie pas leur identité graphique. Extrais les principes utiles.

Privilégie Google Search Central, Google Business Profile, Google Ads, Meta Business, la CNIL, les documentations fournisseurs et les documentations officielles des bibliothèques.

## Questions à résoudre

1. La proposition de valeur est-elle comprise en moins de cinq secondes ?
2. Chaque page indique-t-elle pour qui est l’offre, ce qui est vendu, le prix ou son calcul, le délai, la preuve et l’action suivante ?
3. Quels sont les cinq freins majeurs avant achat ou devis ?
4. Où manque-t-il des photos réelles, mises en situation, marquages ou cas clients ?
5. Les particuliers, TPE, PME, associations et grands comptes trouvent-ils le bon parcours ?
6. L’utilisateur comprend-il comment placer son logo, demander de l’aide et valider un BAT ?
7. Le checkout invité fonctionne-t-il sans compte obligatoire ni fausse étape ?
8. Quelles catégories génèrent du trafic mais peu de marge ? Lesquelles peuvent devenir premium ou récurrentes ?
9. À quelle quantité faut-il quitter le POD pour du grossiste et une production en lot ?
10. Le site mesure-t-il appels, formulaires, devis, ajouts panier, débuts de checkout et commandes ?
11. Quelles pages locales peuvent être créées sans contenu dupliqué ni pages satellites ?
12. Que faut-il impérativement terminer avant de dépenser en publicité ?
13. Quels services doivent rester sur devis, notamment enseigne et affichage dynamique ?
14. Quelles fonctions ont le plus d’impact pour le moins de complexité opérationnelle ?
15. Que faut-il volontairement repousser ou supprimer ?

## Livrable de l’audit

### A. Résumé dirigeant

- dix constats maximum ;
- trois urgences ;
- trois opportunités ;
- trois risques.

### B. Scorecard sur 100

Note avec preuves :

- clarté de l’offre ;
- UX mobile ;
- conversion ;
- confiance ;
- qualité visuelle ;
- SEO technique et local ;
- mesure analytique ;
- rentabilité catalogue ;
- maturité opérationnelle ;
- différenciation.

### C. Parcours

Pour chaque parcours, donne étapes, frictions, gravité, preuve et correction :

- achat textile ;
- achat impression ;
- personnalisation avec logo ;
- devis enseigne ;
- checkout invité ;
- réassort d’un client ;
- entreprise multi-sites.

### D. Concurrence

Compare HM Global aux concurrents sur les mêmes critères. Termine par une phrase de positionnement concrète et défendable.

### E. Marge et fournisseurs

Propose une grille par quantité, produit, marquage, délai, coût rendu, temps humain, risque qualité, marge cible, fournisseur principal et secours.

Ne recommande pas d’empiler les POD. Organise un routage entre POD, grossiste textile, DTF, sérigraphie, broderie et imprimeur.

### F. Mesure

Définis conversions, événements GA4/GTM, UTM, tableaux de bord, données de marge, consentement et attribution réaliste.

### G. Backlog

Pour chaque tâche :

- priorité `P0` à `P3` ;
- version V3 à V6 ;
- impact, confiance et effort ;
- dépendances ;
- fichiers ou services ;
- KPI ;
- test d’acceptation ;
- risque de régression.

Utilise un score explicite, par exemple `Impact × Confiance / Effort`.

### H. Roadmap V3 à V6

Chaque version doit préciser objectif, critères d’entrée, périmètre, non-objectifs, KPI, critères de sortie, tests et documentation.

### I. Premier lot

Découpe V3 en petits lots. Pour le premier seulement, donne :

- résultat utilisateur ;
- fichiers exacts ;
- tests ;
- captures ;
- plan de retour arrière.

Arrête-toi ensuite et demande l’autorisation avant de coder.

## Cadre V3 à V6 à challenger

### V3 — Conversion et acquisition

- checkout invité et Studio/BAT ;
- mesure et consentement ;
- Google Business Profile, avis et UTM ;
- pages locales et cas clients ;
- performance, accessibilité et réassurance.

### V4 — Offre et marge

- Boutique Express, Projets locaux, Programme Entreprises ;
- gammes Essential, Pro et Premium ;
- packs métiers ;
- routage fournisseurs et tableau de marge ;
- devis qualifié et ventes complémentaires.

### V5 — Récurrence et opérations

- réassort ;
- bibliothèque de logos et chartes ;
- catalogues entreprise ;
- cycle devis/BAT/production ;
- CRM, relances et avis ;
- affichage dynamique avec maintenance.

### V6 — Plateforme et échelle

- unités commerciales clairement séparées ;
- orchestration fournisseurs ;
- portail grossiste et partenaires ;
- multi-sites ;
- intégrations comptabilité, CRM et production ;
- BI et automatisations avec validation humaine.

## Positionnement à tester

> HM Global est l’agence locale qui permet aux entreprises de commander simplement leurs supports, textiles et projets de visibilité, avec prix lisibles, BAT, atelier réel et accompagnement humain.

Architecture de départ :

1. **Boutique Express** : produits standardisables et commande directe.
2. **Projets locaux** : enseigne, véhicule, vitrine, signalétique et écrans, sur devis.
3. **Programme Entreprises** : réassort, packs, multi-sites et accompagnement récurrent.

La largeur du catalogue n’est pas un avantage si elle rend la décision difficile. Toute offre doit avoir une cible, une marge, un responsable opérationnel et un parcours clair.

## Hypothèse publicitaire

Avant la publicité, vérifie conversions et pages d’atterrissage.

Test indicatif sur 90 jours :

- Google Search : 600 €/mois ;
- Meta retargeting : 250 €/mois ;
- création/tests : 150 à 300 €/mois ;
- objectif provisoire : CPL inférieur à 50 € textile/print et 90 € enseigne, à valider avec la marge.

Ne pousse pas en acquisition froide un t-shirt unitaire à faible marge. Favorise l’intention forte, les packs métiers, les quantités, le remarketing et les projets sur devis.

## Format de réponse

- Sois factuel et direct.
- Cite chemins de fichiers et URL.
- Date les observations externes.
- Signale ce qui n’a pas pu être vérifié.
- N’annonce aucun gain comme certain.
- Ne commence aucun développement avant validation du rapport.

Commande de démarrage :

> Réalise uniquement la phase d’audit. Commence par résumer l’état Git et la documentation lue, puis audite le code, la production et le marché. Ne modifie aucun fichier. Termine par le premier lot V3 proposé et attends mon autorisation.
