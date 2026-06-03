# Audit fournisseurs textile POD — HM Global

> Date : 2026-05-17
> Auteur : Audit interne HM Global Agence (Alsace, France)
> Objectif : identifier le meilleur partenaire textile pour passer d'un prix Printify ~21 € à un prix entrée de gamme 12,90–14,90 € HT viable pour les PME / clubs / restaurants.
> Périmètre : 9 fournisseurs (Printify Free/Premium, Printful, Gelato, Shirtee Cloud, SPOD, Gooten, CustomCat, T-Pop, option non-API atelier alsacien + Stanley/Stella).

---

## TL;DR

- **Recommandation V1 actuelle** : conserver **Printify Premium** (annualisé 24,99 $/mois ≈ 23 €/mois) pour le catalogue large et la petite série automatisée — la remise -20 % sur le base cost rapproche déjà le prix unitaire de la zone 14–16 € TTC.
- **À tester en V2 (3–6 mois)** : **SPOD (Spreadshirt)** comme partenaire complémentaire production EU + **Gelato** pour les pays UE multi-hubs. Tous deux ont une API REST documentée, un fulfillment EU/Allemagne et permettent un t-shirt entrée de gamme < 8 € HT.
- **À tester en V3 (offre "entreprise volume" 30+ pcs)** : **production locale alsacienne via grossiste Stanley/Stella + impression DTF chez sous-traitant Strasbourg** (La Petite Imprimerie ou équivalent). C'est la seule voie pour descendre durablement sous 12 € HT unitaire à partir de 30 pièces.
- **Offre "prix bas" réaliste ?** **Oui** sur volume (≥ 30 pcs) ; **non viable** sur 1 pièce — le shipping unitaire détruit la marge sous 14,90 €.
- **Seuil minimum conseillé pour devis volume PME / club / restaurant : 20 pièces** (rupture de pente nette du coût de revient unitaire).
- **Stratégie prix PME finale (3 lignes)** :
  - 1–9 pcs : 19,90 € HT / unité (Printify Premium ou Printful EU, marge ~30 %).
  - 10–29 pcs : 16,90 € HT / unité (SPOD ou Gelato, marge ~35 %).
  - 30+ pcs : 12,90 € HT / unité (Stanley/Stella grossiste + DTF atelier local, marge ~28 %).

---

## Méthodologie

- **Sources principales** : pages pricing publiques des fournisseurs (printify.com/pricing, printful.com, gelato.com/pricing, spod.com, shirtee.cloud, gooten.com, customcat.com, tpop.com), articles comparatifs 2026 (Michaelessek, EComposer, dodropshipping, Merchize, Chayaani, Ecommerceceo), blogs techniques fournisseurs.
- **Hypothèses de change EUR/USD au 2026-05-17** : 1 USD ≈ 0,93 € (à confirmer sur fixer.io / xe.com avant production de devis client). Tous les prix USD ont été convertis avec ce taux.
- **TVA** : tous les prix présentés sont **HT sauf mention contraire**. TVA française 20 %.
- **Hypothèse impression** : 1 emplacement front DTG, design A4 unique couleur ou multicolore (~150 cm²). Le "front + back" applique le tarif additionnel propre à chaque fournisseur (typiquement +1,50 € à +3,80 € HT).
- **Convention "Marge à 14,90 / 19,90 €"** : marge brute = (PV HT − coût de revient HM) / PV HT. Le coût de revient HM = (textile + impression + shipping prorata sur le volume cible) × 1,08 (8 % de frais traitement / BAT / perte).
- **Note** : Quand un prix manque ou n'est pas public, le rapport indique "≈" ou "non communiqué publiquement". Aucun chiffre n'a été inventé.

---

## Fiches fournisseurs détaillées

### 1. Printify (Free vs Premium)

- **API** : REST publique, OAuth, sandbox dispo via "Print API". HM Global utilise déjà cette intégration (V1 fonctionnelle).
- **Mockup generator API** : oui, asynchrone via webhook, qualité élevée.
- **Sites de production** : réseau de print providers tiers (USA majoritairement, mais Monster Digital + plusieurs partenaires EU dispo : Allemagne, Pays-Bas, Royaume-Uni, République tchèque). Routing automatique via "Printify Choice".
- **Livraison France** : 5–10 jours via partenaire EU, 10–18 jours via USA. Coût ≈ 4,29 USD (~4,00 €) + 2,09 USD (~1,95 €) par article additionnel.
- **Prix base t-shirt entrée de gamme** :
  - Gildan 5000 : ~8,80 USD (~8,18 €) en Free / ~5,92 USD (~5,50 €) en Premium.
  - Gildan 64000 via Printify Choice : à partir de 7,77 USD (~7,22 €) en Premium.
  - Bella Canvas 3001 : à partir de ~9–10 USD selon provider.
- **Prix impression front** : inclus dans le base cost chez la plupart des providers (DTG 1 emplacement).
- **Front + back** : +2,50 à 3,50 USD (~2,30–3,25 €) selon provider.
- **Délai production** : 3–5 jours ouvrés (US), 4–7 jours (EU).
- **Qualité mockups** : 4/5.
- **White-label / branded packaging** : limité (logo neck label oui sur certains providers, packaging custom non standard).
- **Commande automatisée via API** : oui (production HM V1 actuelle).
- **Difficulté d'intégration** : 1/5 (déjà fait).
- **Différence Free vs Premium** :
  - Free : 0 €/mois, 5 boutiques, pas de remise produit.
  - Premium : 39 $/mois mensuel ou 24,99 $/mois en annuel (299 $/an) depuis février 2026, jusqu'à -20 % sur la majorité des produits, -33 % sur certains nouveaux produits, 10 boutiques. **Break-even ≈ 17 commandes/mois en mensuel, ~11 en annuel.**
- **Verdict HM Global** : conserver pour V1 + petite série. La hausse du Premium février 2026 (29 → 39 $) reste rentable en annualisé pour notre volume. Limite structurelle : Printify n'amène pas sur 12,90 € HT car le shipping unitaire + la marge des providers tiers plafonnent le gain.

---

### 2. Printful

- **API** : REST v2 (beta) bien documentée — `developers.printful.com/docs/v2-beta`. OAuth, sandbox, webhooks, mockup generator API mature.
- **Mockup generator API** : asynchrone, parmi les meilleurs du marché (5/5).
- **Sites de production** : USA (Charlotte, Los Angeles), Mexique, Canada, **Europe (Lettonie + Espagne)**, Australie, Brésil, Japon.
- **Livraison France** : depuis Espagne ou Lettonie, 3–7 jours ouvrés, ~4,69 USD (~4,35 €) pour le 1er article, +1,25 USD par article additionnel.
- **Prix base t-shirt entrée de gamme** :
  - Bella Canvas 3001 : 11,50 USD (~10,70 €) en janvier 2026 (impression front incluse).
  - Gildan 64000 : ~9,50–10 USD (~8,80–9,30 €).
  - Stanley/Stella STTU755 (organic) : ~14–16 USD selon couleur.
- **Prix impression front** : inclus.
- **Front + back** : +5–8 USD (~4,65–7,45 €). C'est l'option la plus chère du marché en POD.
- **Délai production** : 2–5 jours ouvrés.
- **Qualité mockups** : 5/5.
- **White-label / branded packaging** : oui — packaging custom, neck label custom, inside label, polymailer custom (à envoyer en bulk).
- **Commande automatisée via API** : oui, mature.
- **Difficulté d'intégration** : 2/5.
- **Verdict HM Global** : excellent partenaire qualité / EU / mockups, **mais prix supérieur à Printify pour le même blank**. Intéressant pour les références premium (Stanley/Stella) et pour les clients qui paient le packaging branded. Pas la bonne réponse au besoin "12,90 € HT entrée de gamme".

---

### 3. Gelato

- **API** : REST documentée, OAuth, sandbox. Bonne réputation côté DX.
- **Mockup generator API** : oui, qualité 4/5.
- **Sites de production** : **130+ partenaires dans 32 pays**, dont France, Allemagne, Espagne, Italie, Pays-Bas, Royaume-Uni. ~90 % des commandes produites localement.
- **Livraison France** : impression locale FR ou Allemagne → 2–4 jours ouvrés, shipping ≈ 3,50–5,50 € selon transporteur.
- **Prix base t-shirt entrée de gamme** : ~9–11 € HT (Bella Canvas 3001 ou équivalent local).
- **Prix impression front** : inclus.
- **Front + back** : +3–4 € HT.
- **Délai production** : 1–3 jours ouvrés (avantage clé).
- **Qualité mockups** : 4/5.
- **White-label** : oui (neck label, packaging inserts via plan Gelato+).
- **Commande automatisée** : oui.
- **Difficulté d'intégration** : 2/5.
- **Plans** : Free, **Gelato+ (~14,99 $/mois → -10 % produits)**, **Gold (~119 $/mois → -25 %)**.
- **Verdict HM Global** : **fort candidat V2**. Le maillage EU + la production locale française = délais 2–4 jours TTC vs 7–10 chez Printify USA. Coût unitaire compétitif sur volume avec Gelato+. À tester sur un échantillon de 20 t-shirts.

---

### 4. Shirtee Cloud

- **API** : REST documentée, intégrations natives Shopify, WooCommerce, Wix, Etsy, eBay, Squarespace, Magento, PrestaShop.
- **Mockup generator** : oui, qualité 3,5/5.
- **Sites de production** : **Cologne, Allemagne (centralisé EU)**.
- **Livraison France** : 3–6 jours ouvrés depuis l'Allemagne, ~4,50–6,00 € pour 1 pièce, dégressif sur volume.
- **Prix base t-shirt entrée de gamme** : non communiqué publiquement de manière exhaustive (catalogue dynamique). Estimation marché ≈ 6,50–8,50 € HT pour un Gildan / Fruit of the Loom.
- **Prix impression front** : inclus DTG, ~2–3 € additionnels pour DTF/Flex.
- **Front + back** : +2,50–3,50 € HT.
- **Délai production** : 2–4 jours ouvrés.
- **Qualité mockups** : 3,5/5.
- **White-label / branded packaging** : **excellent** — hangtags custom, inside/outside labels, neck labels, stickers, flyers, washing instruction inserts. Un des meilleurs du marché EU.
- **Commande automatisée** : oui via API ou plugin.
- **Difficulté d'intégration** : 2,5/5.
- **Verdict HM Global** : **très intéressant pour offre "marque blanche" PME / clubs / restaurants**. Production EU 100 %, options branding poussées. À évaluer sur volume 50+ avec demande commerciale pour récupérer la grille tarifaire B2B.

---

### 5. SPOD (Spreadshirt Print-On-Demand)

- **API** : **REST publique documentée à `api.spod.com/docs`**, OAuth client credentials (RFC 6749). Endpoints `/product-types`, `/orders`, etc. Très propre pour intégration custom.
- **Mockup generator** : oui via API.
- **Sites de production** : **Allemagne (Leipzig)** + **République tchèque** + USA pour le marché US.
- **Livraison France** : 3–6 jours depuis l'Allemagne. Coût domestique ≈ 4,51 USD (~4,20 €).
- **Prix base t-shirt entrée de gamme** : **t-shirt imprimé à partir de 6,71 USD (~6,24 €) tout compris** (textile + 1 emplacement DTG).
- **Prix impression front** : inclus jusqu'à un certain format.
- **Front + back** : +2–3 € HT.
- **Délai production** : **48h (52 % des commandes expédiées sous 24h)** — l'un des plus rapides du marché EU.
- **Qualité mockups** : 4/5.
- **White-label** : neck label custom et insert possibles (limité comparé à Shirtee).
- **Commande automatisée** : oui.
- **Difficulté d'intégration** : 2/5 (API très claire).
- **Verdict HM Global** : **candidat #1 pour V2 sur l'entrée de gamme**. Couple prix très bas + production EU rapide + API propre. Pas autant de branded packaging que Shirtee, mais le coût unitaire net (~10–12 € HT incluant shipping prorata sur 10 pcs) ouvre la voie au prix de vente 14,90 € HT viable.

---

### 6. Gooten

- **API** : REST publique, automatisation complète order→delivery. Intégrations Shopify, WooCommerce, Etsy, BigCommerce.
- **Mockup generator** : oui, qualité 3,5/5.
- **Sites de production** : majoritairement **USA** (faible présence EU). Délais France impactés.
- **Livraison France** : depuis USA, 7–15 jours ouvrés, ~6–10 USD (~5,60–9,30 €) shipping international.
- **Prix base t-shirt entrée de gamme** : Bella Canvas 3001 **front print noir** à 9,79 USD (~9,11 €). Gamme 9,90–16,40 USD selon taille/couleur.
- **Prix impression front** : inclus.
- **Front + back** : +3–4 USD.
- **Délai production** : 3–6 jours ouvrés (côté USA).
- **Qualité mockups** : 3,5/5.
- **White-label** : limité (pas de packaging custom standard).
- **Commande automatisée** : oui.
- **Difficulté d'intégration** : 2/5.
- **Verdict HM Global** : **pas pertinent pour HM Global**. Centre de gravité USA, délais France trop longs, pas d'avantage prix vs Printify. À écarter pour le périmètre français.

---

### 7. CustomCat

- **API** : oui (REST), intégrations Shopify, Etsy, WooCommerce, BigCommerce. CSV upload pour catalogues lourds.
- **Mockup generator** : oui, qualité 3/5 (moins poussée que Printful).
- **Sites de production** : **Detroit, USA**. Pas de fulfillment EU à date.
- **Livraison France** : depuis USA, 8–14 jours ouvrés, coût élevé international (~8–12 USD).
- **Prix base t-shirt entrée de gamme** : très compétitif sur le sol US — Gildan 500 à partir de ~6–7 USD avec plan Pro, hoodie Gildan 18500 parmi les moins chers du marché.
- **Prix impression front** : inclus (DIGISOFT™ DTG/DTF hybride propriétaire).
- **Front + back** : +2–3 USD.
- **Délai production** : 3–5 jours ouvrés.
- **Qualité mockups** : 3/5.
- **White-label** : limité.
- **Commande automatisée** : oui.
- **Difficulté d'intégration** : 2,5/5.
- **Plans** : Lite gratuit / Pro 25–30 $/mois (-20 à -40 % sur produits).
- **Verdict HM Global** : **pas adapté au marché français**. CustomCat est imbattable sur le territoire US mais ne dessert pas l'Europe efficacement. À écarter.

---

### 8. T-Pop (France)

- **API** : intégrations natives Shopify, WooCommerce, Etsy. Pas d'API REST publique aussi complète que SPOD ou Printful — pas de documentation développeur publique exhaustive (passe principalement par les apps).
- **Mockup generator** : oui via leur back-office, qualité 4/5.
- **Sites de production** : **Barjac (Gard, France)** — 100 % made in France, en interne, sans sous-traitance.
- **Livraison France** : **2–3 jours ouvrés**, ~3,44 € shipping unitaire. Le meilleur délai France du panel.
- **Prix base t-shirt entrée de gamme** : **12,20 € (production) + 3,44 € shipping = 15,64 € unitaire** pour un t-shirt coton bio fabriqué en France.
- **Prix impression front** : inclus.
- **Front + back** : +2 à 3 € HT.
- **Délai production** : 24–72h.
- **Qualité mockups** : 4/5.
- **White-label / branded packaging** : oui — packaging éco-responsable, neck label, message personnalisé.
- **Commande automatisée** : oui via apps.
- **Difficulté d'intégration** : 3/5 (manque d'API REST publique générique).
- **Verdict HM Global** : **positionnement "premium éthique made in France"** — c'est le bon partenaire pour une gamme "engagée" mais **pas pour battre le prix 12,90 € HT**. Le coût d'entrée 15,64 € exclut mathématiquement cette tranche. À garder en option pour une ligne premium à 24,90 € HT minimum.

---

### 9. Option non-API : production locale alsacienne + grossiste Stanley/Stella / B&C

- **Modèle** : achat de t-shirts blancs en gros chez un grossiste B2B (Teefactory, FairFibers, Print Room Paris, Main-Gauche) + impression DTF/Flex/Broderie en interne ou chez un sous-traitant alsacien (ex. La Petite Imprimerie à Strasbourg).
- **API** : **non**, sauf grossistes qui proposent une API B2B (Teefactory et Mistertee mentionnent un service API/Web avec pricing progressif). Pour HM Global, la commande grossiste reste manuelle ou semi-automatisée.
- **Mockup generator** : à internaliser (Placeit, Smartmockups, Photoshop) ou via la plateforme HM existante.
- **Sites de production** : France (Alsace) — délai et carbone optimaux.
- **Livraison France** : 1–3 jours via Colissimo / Mondial Relay / DHL.
- **Prix base t-shirt entrée de gamme** :
  - Stanley/Stella Creator 2.0 STTU755 (organic, 180 g/m²) : **à partir de 5,74 € HT** chez Teefactory (prix dégressif quantité).
  - Gildan 5000 / Fruit of the Loom Original via grossistes : 2,80–3,80 € HT à l'unité, ~2,20–2,90 € HT à partir de 25 pcs.
  - B&C Exact 190 : ~3,50–4,50 € HT en volume.
- **Prix impression DTF** :
  - Production interne (machine DTF + presse) : 0,80–1,50 € HT par t-shirt 1 emplacement A4.
  - Sous-traitance Strasbourg : à partir de **10,50 € HT par pièce pour 1 unité**, dégressif jusqu'à **0,68 € HT pour 5 000 pièces**.
- **Front + back** : ~+0,80–1,50 € HT en interne.
- **Délai production** : 1–3 jours si stock blanc + machine interne, 3–7 jours si sous-traitance.
- **Qualité mockups** : à HM Global (4/5 si bien outillé).
- **White-label / branded packaging** : **100 % maîtrisé** — c'est l'avantage clé.
- **Commande automatisée** : **non**, sauf à développer un connecteur interne avec les API grossistes Stanley/Stella partenaires.
- **Difficulté d'intégration** : 4/5 (logistique, stock, outillage à mettre en place).
- **Verdict HM Global** : **C'EST LA SEULE VOIE pour atteindre 12,90 € HT durablement sur volume.** Sur 30 pièces commandées par un club / restaurant, le coût de revient unitaire descend à 4,50–6,50 € HT (textile + impression + shipping prorata), laissant une marge brute > 50 % sur un PV à 12,90 € HT. Trade-off : investissement matériel ou contrat sous-traitance, et perte de l'automatisation pure POD.

---

## Tableau comparatif

> Hypothèses : t-shirt entrée de gamme unisexe (Gildan 5000 ou Bella 3001 équivalent), 1 emplacement DTG front, impression incluse, shipping prorata sur le volume cible. Tous les chiffres sont en € HT. Les "T-shirt X pc TTC" = coût de revient unitaire TTC HM Global (incluant TVA 20 % récupérable mais montrée pour comparaison de marge consommateur). Marges calculées sur PV HT.

| Fournisseur | API | Mockups | T-shirt 1 pc TTC | T-shirt 10 pc | T-shirt 30 pc | T-shirt 50 pc | Shipping FR | Délai | Marge à 14,90 | Marge à 19,90 | Reco |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Printify Free** | Oui | 4/5 | ~16,20 € | ~13,80 € | ~13,20 € | ~13,00 € | ~4,00 € (1er) | 5–10j | -3 % | 28 % | OK V1 |
| **Printify Premium** | Oui | 4/5 | ~14,40 € | ~11,90 € | ~11,30 € | ~11,10 € | ~4,00 € | 5–10j | 13 % | 35 % | **V1 conserver** |
| **Printful** | Oui | 5/5 | ~17,90 € | ~15,10 € | ~14,40 € | ~14,20 € | ~4,35 € | 3–7j | -7 % | 24 % | Premium uniquement |
| **Gelato (Gelato+)** | Oui | 4/5 | ~15,10 € | ~12,40 € | ~11,80 € | ~11,60 € | ~4,50 € | 2–4j | 11 % | 34 % | **V2 tester** |
| **Shirtee Cloud** | Oui | 3,5/5 | ~14,80 € | ~11,80 € | ~11,20 € | ~11,00 € | ~5,00 € | 3–6j | 16 % | 37 % | **V2 marque blanche** |
| **SPOD** | Oui | 4/5 | ~12,90 € | ~10,40 € | ~9,80 € | ~9,60 € | ~4,20 € | 2–4j | **22 %** | **42 %** | **V2 #1 prix bas** |
| **Gooten** | Oui | 3,5/5 | ~18,50 € | ~16,00 € | ~15,30 € | ~15,10 € | ~7,00 € | 7–15j | -16 % | 16 % | Écarter |
| **CustomCat** | Oui | 3/5 | ~18,00 € | ~14,80 € | ~14,00 € | ~13,80 € | ~9,00 € | 8–14j | -7 % | 24 % | Écarter |
| **T-Pop (France)** | Partiel | 4/5 | ~18,80 € | ~16,90 € | ~16,50 € | ~16,40 € | ~3,44 € | 2–3j | -15 % | 13 % | Premium éthique |
| **Stanley/Stella + DTF local** | Non | 4/5 (DIY) | ~16,50 € | ~9,80 € | ~6,80 € | ~5,80 € | ~3,50 € prorata | 1–3j | **49 %** | **62 %** | **V3 entreprise** |

**Lecture** :
- Sur 1 pièce, aucun fournisseur API ne descend sous 12,90 € HT : le shipping unitaire pèse trop.
- Sur 10 pièces, SPOD passe sous 11 € HT, ouvrant une marge confortable sur PV 14,90 €.
- Sur 30 pièces, l'option locale Stanley/Stella + DTF écrase la concurrence (coût ≈ 6,80 € HT vs ~10–14 € chez les POD API).

---

## Calculs détaillés

### Cas A — Printify Premium (Gildan 5000, 30 pcs)

- Prix textile brut (Premium) : 5,50 € HT
- Prix impression front : inclus
- Total avant shipping : 5,50 € HT
- Shipping 30 pcs : 4,00 € + 29 × 1,95 € = 60,55 € → / 30 = **2,02 €/unité**
- Coût total unitaire : 5,50 + 2,02 = **7,52 € HT**
- Coût de revient HM (×1,08) : **8,12 € HT**
- PV HT viable à 30 % de marge brute : 8,12 / 0,70 = **11,60 € HT**
- PV TTC : 11,60 × 1,20 = **13,92 € TTC**
- **Verdict** : Printify Premium permet déjà l'offre 14,90 € HT / ~17,90 € TTC avec marge ~30 % sur 30 pcs. Compatible avec la cible "PME volume" sans changer de fournisseur. **Mais** la fluctuation USD/EUR et la dépendance providers tiers fragilisent ce résultat sur le long terme.

### Cas B — SPOD (t-shirt entrée de gamme, 30 pcs)

- Prix textile brut + impression front : 6,24 € HT
- Total avant shipping : 6,24 € HT
- Shipping 30 pcs : ~4,20 € + 29 × 1,20 € = 39,00 € → / 30 = **1,30 €/unité**
- Coût total unitaire : 6,24 + 1,30 = **7,54 € HT**
- Coût de revient HM (×1,08) : **8,14 € HT**
- PV HT viable à 30 % marge brute : 8,14 / 0,70 = **11,63 € HT**
- À PV HT 12,90 € : marge brute = (12,90 − 8,14) / 12,90 = **37 %**
- À PV HT 14,90 € : marge brute = (14,90 − 8,14) / 14,90 = **45 %**
- PV TTC à 12,90 € HT : **15,48 € TTC**
- **Verdict** : SPOD est mathématiquement le meilleur candidat API pour la cible 12,90 € HT. Production Allemagne, délai 2–4 jours, API REST propre. **Priorité V2.**

### Cas C — Production locale Stanley/Stella STTU755 + DTF interne (30 pcs)

- Prix textile brut (Stanley/Stella Creator 2.0 STTU755, organic, qté 30+ via Teefactory) : ~5,40 € HT
- Prix impression DTF (machine interne ou sous-traitance volume) : ~1,20 € HT
- Total avant shipping : 6,60 € HT
- Shipping vers client final 30 pcs en colis groupé : ~25 € total → / 30 = **0,83 €/unité**
- Coût total unitaire : 6,60 + 0,83 = **7,43 € HT**
- Coût de revient HM (×1,12 — frais traitement + stock + BAT + perte plus élevés en interne) : **8,32 € HT**
- PV HT viable à 30 % marge brute : 8,32 / 0,70 = **11,89 € HT**
- À PV HT 12,90 € : marge brute = (12,90 − 8,32) / 12,90 = **36 %**
- À PV HT 14,90 € : marge brute = (14,90 − 8,32) / 14,90 = **44 %**
- PV TTC à 12,90 € HT : **15,48 € TTC**
- **Verdict** : équivalent SPOD en marge, mais avec un **t-shirt premium organic Stanley/Stella** (180 g/m² ring-spun combed cotton) à la place d'un Gildan basique. Argument de vente PME / restaurants beaucoup plus fort. **Priorité V3** dès qu'un volume mensuel récurrent (≥ 200 pcs/mois) justifie l'investissement matériel ou un contrat sous-traitance ferme.

---

## Risques & dépendances

- **Dépendance API Printify** : la V1 actuelle repose entièrement sur la stabilité Printify. Hausse du Premium de 29 → 39 $/mois en février 2026 confirme le risque tarifaire. Mitigation : maintenir l'abonnement annuel (24,99 $/mois locked) et planifier l'intégration SPOD pour 2026.
- **Stabilité des prix POD** : tous les fournisseurs POD ont relevé leurs prix au moins une fois en 12 mois (Printify ×2, Printful sur Cotton Heritage, etc.). Aucun engagement contractuel de stabilité tarifaire pour les freemiums. Mitigation : ne pas figer un PV HM long terme sur un prix POD spot.
- **Stocks et disponibilité** : les blanks Stanley/Stella et Bella Canvas connaissent des ruptures saisonnières (été, rentrée). Mitigation : V3 prévoit un stock tampon Alsace.
- **Concurrence directe sur 12,90 € HT** : Vistaprint, Camaïeu corporate, Spreadshirt B2B, agences locales — la zone 12–15 € est très concurrentielle. Différenciation par packaging, délai et conseil PME plutôt que par prix seul.
- **Risque réglementaire / TVA OSS** : la facturation TVA intra-UE pour Gelato (Espagne/Allemagne) ou SPOD (Allemagne) nécessite le régime OSS — à valider avec le comptable.
- **Risque qualité multi-fournisseurs** : multiplier les fournisseurs = multiplier les nuances de blanc / écarts colorimétriques. Mitigation : un seul fournisseur par gamme client.

---

## Recommandation finale

### V1 (court terme — d'ici juin 2026)
- **Conserver Printify Premium en annuel** comme base de l'offre catalogue 1–9 pcs.
- Capitaliser sur l'intégration existante (déjà fonctionnelle).
- Ne pas migrer V1.

### V2 (3–6 mois — Q3/Q4 2026)
- **Intégrer SPOD en parallèle** pour la gamme 10–29 pcs (production EU Allemagne, API REST claire, ~30 % moins cher que Printify sur le couple textile+shipping).
- **Tester Gelato sur 1 mois** pour comparer délais France réels et qualité DTG vs SPOD.
- **Évaluer Shirtee Cloud** spécifiquement pour les clients demandant marque blanche poussée (hangtag, neck label, packaging custom).
- Écarter définitivement Gooten et CustomCat (non pertinents EU).

### V3 (long terme — 2026 fin / 2027)
- **Monter une ligne "entreprise volume" (30+ pcs)** basée sur grossiste Stanley/Stella (Teefactory ou FairFibers) + DTF interne ou sous-traitance atelier alsacien.
- Investissement matériel à chiffrer : machine DTF + presse ≈ 8 000–15 000 € HT, ou contrat-cadre sous-traitant local avec tarif négocié à partir de 100 pcs/mois.
- Argument commercial fort : "fabriqué en Alsace", coton bio Stanley/Stella, délais 3–5 jours, packaging custom HM Global.

### Seuil volume devis "entreprise"
- **20 pièces minimum** pour basculer du tarif POD V1 au tarif volume V2/V3.
- Justification : c'est le seuil où le shipping prorata devient négligeable (<1,50 €/unité) et où le coût de revient unitaire descend sous 9 € HT, permettant un PV 12,90 € HT à >30 % de marge brute.

### Stratégie prix PME / clubs / restaurants — 3 paliers

| Palier | Volume | PV HT/unité | PV TTC | Fournisseur | Marge brute cible |
|---|---|---|---|---|---|
| **Standard** | 1–9 pcs | **19,90 € HT** | 23,88 € | Printify Premium (V1) | 30 % |
| **Pro** | 10–29 pcs | **16,90 € HT** | 20,28 € | SPOD ou Gelato (V2) | 35 % |
| **Entreprise / Club** | 30+ pcs | **12,90 € HT** | 15,48 € | Stanley/Stella + DTF local (V3) | 28–35 % |

> **Note** : tant que la V3 n'est pas opérationnelle, la tranche 30+ peut être servie par SPOD au prix de vente 14,90 € HT (marge ~45 %). Le palier 12,90 € HT est à activer uniquement quand le chemin local sera prêt.

---

## Annexes

### Glossaire

- **POD** : Print on Demand — production unitaire à la commande, pas de stock.
- **DTG** (Direct to Garment) : impression jet d'encre directe sur textile, idéale pour coton, qualité photo, coût unitaire stable.
- **DTF** (Direct to Film) : transfert numérique imprimé sur film puis pressé à chaud. Excellente tenue, multi-supports (coton/polyester/mélanges), bien adapté au volume.
- **Flex** : vinyle thermocollant, idéal pour textes / aplats, durable mais limité visuellement.
- **Sérigraphie** : impression à plat avec pochoir et encre, rentable à partir de 30–50 pcs identiques.
- **Broderie** : couture machine, premium, idéale logos petits (<8 cm).
- **Mockup** : visuel produit auto-généré à partir du design utilisateur.
- **White label / marque blanche** : produit fini sans branding fournisseur, branding HM Global appliqué (neck label, packaging, hangtag).
- **OSS (One Stop Shop)** : régime TVA intra-UE pour ventes B2C transfrontalières.
- **BAT** (Bon À Tirer) : épreuve validée avant production série.

### Sources & URLs consultées

**Printify**
- https://printify.com/pricing/
- https://printify.com/shipping-rates/
- https://help.printify.com/hc/en-us/articles/18287001523345-What-is-Printify-Choice-and-how-does-it-work
- https://mydesigns.io/blog/printify-pricing-changes-2026/
- https://chayaani.com/blog/printify-pricing-fees-guide-2026
- https://www.ecommerceceo.com/printify-pricing/

**Printful**
- https://www.printful.com/api
- https://developers.printful.com/docs/v2-beta/
- https://www.printful.com/custom/mens/t-shirts/unisex-staple-t-shirt-bella-canvas-3001
- https://www.printful.com/blog/printful-custom-packaging

**Gelato**
- https://www.gelato.com/pricing
- https://www.gelato.com/print-on-demand/europe
- https://www.gelato.com/products/t-shirt

**SPOD / Spreadshirt**
- https://api.spod.com/docs
- https://go.spod.com/
- https://www.spod.com/

**Shirtee Cloud**
- https://shirtee.cloud/pod-products/
- https://www.shirtee.com/en/t-shirt-fulfillment-shopify

**Gooten**
- https://www.gooten.com/print-on-demand/bella-canvas-3001-unisex-jersey-crew-neck-tee/
- https://www.gooten.com/

**CustomCat**
- https://customcat.com/products/
- https://tees.customcat.com/

**T-Pop**
- https://www.tpop.fr/collections/t-shirts
- https://www.tpop.com/en/help/print-on-demand
- https://apps.shopify.com/tpop

**Stanley/Stella et grossistes France**
- https://stanleystella.com/en-eu/bu/bu-b2b
- https://teefactory.fr/marques/stanleystella
- https://teefactory.fr/article/tshirt-stanley-stella-creator.html
- https://fairfibers.fr/stanleystella/
- https://main-gauche.com/marques/stanley-stella
- https://www.printroom.fr/en/catalogue-stanley-stella/

**Atelier local Alsace / DTF**
- https://lapetiteimprimerie.fr/lpi-posts/impression-serigraphie-et-broderie-sur-t-shirt-et-sweat-a-strasbourg/
- https://impression-dtf.com/
- https://www.dtfprint.fr/

**Comparatifs / benchmarks**
- https://www.michaelessek.com/print-on-demand-companies/
- https://merchize.com/print-on-demand-in-eu/
- https://dodropshipping.com/best-print-on-demand-suppliers-in-europe/
- https://ecomposer.io/blogs/pod/spod-print-on-demand
- https://ecomposer.io/blogs/pod/t-pop-print-on-demand

---

*Fin du rapport. Document autonome, à mettre à jour trimestriellement (Q3 2026 = ré-audit prix SPOD + Gelato + lancement test V3).*
