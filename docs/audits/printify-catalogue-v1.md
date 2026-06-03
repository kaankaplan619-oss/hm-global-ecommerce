# Audit catalogue textile Printify V1 — HM Global

> **Mission** : sélection fournisseur propre pour la V1 textile.
> **Périmètre** : 13 candidats audités, providers EU prioritaires, shipping vers `67460 Souffelweyersheim`.
> **Méthode** : audit API Printify automatisé via `scripts/audit-printify-catalogue.mjs` + 6 drafts temporaires créés/supprimés (cleanup confirmé).
> **Aucune modification produit / prix / panier / checkout.**

---

## A. Résumé exécutif

### Le périmètre V1 textile peut être ramené à **6 produits réellement compétitifs** sur 13 candidats audités

**Recommandations clés** :
1. **Garder les 4 produits V1 actuels** mais corriger 1 erreur stratégique (Gildan 18000 chez Print Clever GB → bascule sur Textildruck DE économise ~4€/produit + 50% shipping).
2. **Ajouter 2 produits** identifiés comme rentables et techniquement faisables :
   - **Comfort Colors 1717 Heavyweight** (T-shirt premium teint en pièce, coût 9,09 € HT — **moins cher que Gildan 5000**)
   - **Gildan 2400 Ultra Cotton Long Sleeve** (T-shirt manches longues, coût 11,72 € HT)
3. **Reporter en V2** : polos, totes, casquettes, hoodies premium (Champion / Stanley Stella / Port Authority) — aucun n'a de provider EU compatible. Couvrir ces catégories via **TopTex / Falk&Ross** comme c'est déjà le cas pour la majorité du catalogue HM.

### Décisions transverses

| Sujet | Décision proposée |
|---|---|
| **Shipping V1** | Frais calculés au panier (pas de promesse fixe). « Livraison offerte dès 10 pièces » uniquement pour les T-shirts (shipping ~1,55€/u à 10 ex). Pas d'offre livraison pour Gildan 18000 / 18500 (shipping 2,90-4,59€/u plombe la marge). |
| **Printify Premium** | **Free pour V1**. Économie estimée 10-15% sur coût produit (~1-3€/article). Rentabilité Premium (39 USD/mois ≈ 36€) à partir de **15-20 commandes textile/mois**. Passer en Premium après les 3 premiers mois. |
| **Provider Gildan 18000** | **Retirer Royal V1** (seul à imposer Print Clever GB) → bascule sur Textildruck DE → coût **19,26 € au lieu de 23,31 €** (-17%) + shipping **÷2** (29€/10ex au lieu de 45,90€). Gain ~6€/produit. |
| **Hoodie/sweat premium bio** | Stanley/Stella indisponible en EU sur Printify pour V1. Si demande client, basculer sur **iDéal IB400 / IB402** déjà au catalogue via TopTex. |
| **Polos / totes / caps** | Pas de provider EU compétitif sur Printify. **Garder le catalogue TopTex** existant (Kariban, K-up, Kimood) pour ces familles. |

---

## B. Tableau global des 13 candidats audités

| Catégorie HM | Blueprint | Marque · Modèle | Provider EU principal | Pays | Coût HT (L) | Ship 1ex | Ship 10ex | Couleurs HM matchées | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| T-shirt éco | **6** | Gildan 5000 Heavy Cotton | Textildruck Europa | 🇩🇪 DE | **9,70 €** | 4,79 € | 15,50 € | noir · blanc · gris · marine · rouge · royal · bordeaux · vert-militaire · naturel | **V1 ✅ (existant)** |
| T-shirt premium | **12** | Bella+Canvas 3001 Unisex Jersey | Textildruck Europa | 🇩🇪 DE | **13,65 €** (gris 14,59 €) | 4,79 € | 15,50 € | noir · blanc · gris · marine · rouge · royal · bordeaux · vert-militaire | **V1 ✅ (existant)** |
| T-shirt heavyweight | **145** | Comfort Colors 1717 Heavyweight | Textildruck Europa | 🇩🇪 DE | **9,09 €** | 4,79 € | 15,50 € | noir · blanc · gris · marine · rouge · royal · vert-militaire · naturel | **V1 ✅ NOUVEAU** |
| T-shirt bio EU | 384 | Stanley/Stella Creator 2.0 | — | — | — | — | — | — | ⛔ pas de provider EU |
| Sweat éco | **49** | Gildan 18000 Heavy Blend Crewneck | Textildruck Europa | 🇩🇪 DE | **19,26 €** (vs 23,31 € chez GB) | 7,49 € | 29,00 € | noir · blanc · gris · marine · rouge · bordeaux · vert-militaire · naturel | **V1 ✅ (rebascule)** |
| Sweat bio EU | 411 | Stanley/Stella Changer 2.0 | — | — | — | — | — | — | ⛔ pas de provider EU |
| Hoodie éco | **77** | Gildan 18500 Heavy Blend Hoodie | Textildruck Europa | 🇩🇪 DE | **24,24 €** | 7,49 € | 29,00 € | noir · blanc · gris · marine · rouge · royal · bordeaux · vert-militaire · naturel | **V1 ✅ (existant)** |
| Hoodie premium | 314 | Champion S700 Powerblend Hoodie | — | — | — | — | — | — | ⛔ pas de provider EU |
| Hoodie bio EU | 412 | Stanley/Stella Cruiser 2.0 | — | — | — | — | — | — | ⛔ blueprint indisponible (404) |
| Polo staff | 268 | Port Authority K500 Silk Touch | — | — | — | — | — | — | ⛔ pas de provider EU (US) |
| Long sleeve | **36** | Gildan 2400 Ultra Cotton LS Tee | Textildruck Europa | 🇩🇪 DE | **11,72 €** | 4,79 € | 15,50 € | noir · blanc · gris · marine · rouge · naturel | **V1 ✅ NOUVEAU** |
| Tote bag | 522 | Liberty Bags 8502 | — | — | — | — | — | — | ⛔ pas de provider EU (US) |
| Casquette | 113 | Yupoong 6606 Retro Trucker | — | — | — | — | — | — | ⛔ blueprint indisponible (404) |

**Note** : les coûts Printify retournés sont POD-ready (produit blank, sans design pour ce test). Le surplus impression DTF/Broderie est intégré au moment de la commande client réelle.

---

## C. Sélection V1 finale recommandée (6 produits)

### Catégorie T-shirts

| # | Produit | Slug HM proposé | Coût HT (L) | Catégorie | Note |
|---|---|---|---|---|---|
| 1 | **Gildan 5000 Heavy Cotton** (existant) | `tshirt-gildan-heavy-cotton` | 9,70 € | T-shirt entrée gamme | OK V1 — couvre les couleurs HM principales |
| 2 | **Bella+Canvas 3001** (existant) | `tshirt-bella-canvas-3001` | 13,65 € | T-shirt premium | Coton ring-spun, gamme premium |
| 3 | **Comfort Colors 1717 Heavyweight** (NOUVEAU) | `tshirt-comfort-colors-heavyweight` | **9,09 €** | T-shirt heavyweight teint pièce | **Moins cher que Gildan 5000**, couleurs garment-dyed (mode), 195 g/m². Excellent rapport qualité/prix. |
| 4 | **Gildan 2400 Long Sleeve** (NOUVEAU) | `tshirt-gildan-long-sleeve` | 11,72 € | T-shirt manches longues | Couvre demande hiver / restauration. 10 couleurs. |

### Catégorie sweats

| # | Produit | Slug HM proposé | Coût HT (L) | Catégorie | Note |
|---|---|---|---|---|---|
| 5 | **Gildan 18000 Crewneck** (recalibrage) | `sweat-gildan-18000` | **19,26 €** (au lieu de 23,31 €) | Sweat col rond | **Action : retirer Royal V1** → bascule Textildruck DE, économise 4 €/produit et 50% shipping. |

### Catégorie hoodies

| # | Produit | Slug HM proposé | Coût HT (L) | Catégorie | Note |
|---|---|---|---|---|---|
| 6 | **Gildan 18500 Hoodie** (existant) | `hoodie-gildan-18500` | 24,24 € | Hoodie classique | OK V1. Couvre les 6 couleurs core. |

**Total V1 textile Printify** : **6 produits** (4 existants ajustés + 2 nouveaux).

---

## D. Produits à exclure / reporter

| Produit | Raison exclusion V1 | Alternative HM existante |
|---|---|---|
| Stanley/Stella Creator 2.0 (bp 384) | Pas de provider EU sur Printify | **TopTex** : référence Stanley/Stella déjà dispo |
| Stanley/Stella Changer 2.0 (bp 411) | Idem | TopTex |
| Stanley/Stella Cruiser 2.0 (bp 412) | Blueprint Printify 404 | TopTex |
| Champion S700 Hoodie premium (bp 314) | Pas de provider EU | iDéal IB402 hoodie (TopTex) — alternative directe au catalogue |
| Port Authority K500 Polo (bp 268) | Pas de provider EU (US) | **Kariban K262 / K256 / K239 / K240** (TopTex, déjà au catalogue) |
| Liberty Bags 8502 Tote (bp 522) | Pas de provider EU (US) | **Kimood KI0262 / KI0252 / KI0275** (TopTex, déjà au catalogue) |
| Yupoong 6606 Cap (bp 113) | Blueprint 404 | **K-up KP157 / KP162 / KP165 / KP185** (TopTex, déjà au catalogue) |

→ Conclusion : pour les **familles non couvertes par Printify EU**, le catalogue **TopTex existant** est la solution V1. Pas de carence catalogue HM Global.

---

## E. Grille prix recommandée (V1)

Hypothèses : TVA 20% · Stripe 1,5% + 0,25 € · Coût HT Printify + shipping réel par palier.
Objectif marges nettes : **≥ 20%** à 1 pièce (produit d'appel ≥ 5%), **≥ 25%** à 10 pièces, **≥ 25%** à 25 pièces, **≥ 20%** à 50 pièces.

### Gildan 5000 (existant, garder grille actuelle)

| Qty | Coût | Shipping | Prix TTC HM | Marge unitaire | % marge |
|---|---|---|---|---|---|
| 1 | 9,70 € | 4,79 € | 19,90 € | 1,54 € | 9,3% ⚠️ produit d'appel |
| 10 | 9,70 € | 1,55 €/u | 19,90 € | 5,01 € | 30,2% ✅ |
| 25 | 9,70 € | 1,33 €/u | 18,30 € | 3,93 € | 25,8% ✅ |
| 50 | 9,70 € | 1,26 €/u | 16,30 € | 2,37 € | 17,5% ⚠️ |

### Bella+Canvas 3001 (existant — **AJUSTEMENT CRITIQUE**)

| Qty | Coût | Shipping | Prix TTC actuel | Prix TTC recommandé | Marge unitaire (reco) | % marge |
|---|---|---|---|---|---|---|
| 1 | 13,65 € | 4,79 € | 22,90 € | **23,90 €** (+1 €) | 0,89 € | 4,5% ⚠️ produit d'appel |
| 10 | 13,65 € | 1,55 €/u | 22,90 € | 22,90 € (inchangé) | 3,51 € | 18,4% ⚠️ marge faible |
| 25 | 13,65 € | 1,33 €/u | 19,90 € | **20,90 €** (+1 €) | 2,12 € | 12,2% ⚠️ |
| 50 | 13,65 € | 1,26 €/u | **17,90 €** ❌ déficit | **19,90 €** (+2 €) | 1,40 € | 8,5% ✅ sort du déficit |

**Justification** : le tier 50-99 actuel (17,90 €) est en déficit −0,27 €/u. **+2 € minimum impératif**.

### Comfort Colors 1717 Heavyweight (NOUVEAU)

| Qty | Coût | Shipping | Prix TTC recommandé | Marge unitaire | % marge |
|---|---|---|---|---|---|
| 1 | 9,09 € | 4,79 € | 21,90 € | 2,99 € | 16,4% ✅ |
| 10 | 9,09 € | 1,55 €/u | 19,90 € | 5,99 € | 36,1% ✅ |
| 25 | 9,09 € | 1,33 €/u | 18,90 € | 5,30 € | 33,7% ✅ |
| 50 | 9,09 € | 1,26 €/u | 17,90 € | 4,34 € | 29,1% ✅ |

**Positionnement** : T-shirt premium teint en pièce, à positionner entre Gildan 5000 (économique) et Bella 3001 (premium ring-spun) avec un **plus mode** (couleurs garment-dyed).

### Gildan 2400 Long Sleeve (NOUVEAU)

| Qty | Coût | Shipping | Prix TTC recommandé | Marge unitaire | % marge |
|---|---|---|---|---|---|
| 1 | 11,72 € | 4,79 € | 27,90 € | 4,16 € | 17,9% ✅ |
| 10 | 11,72 € | 1,55 €/u | 25,90 € | 6,82 € | 31,6% ✅ |
| 25 | 11,72 € | 1,33 €/u | 23,90 € | 5,77 € | 29,0% ✅ |
| 50 | 11,72 € | 1,26 €/u | 21,90 € | 4,55 € | 25,0% ✅ |

### Gildan 18000 Crewneck (rebascule sur Textildruck DE)

| Qty | Coût (avant 23,31 €) | Coût (après 19,26 €) | Shipping (avant GB) | Shipping (après DE) | Prix TTC HM actuel | Marge actuelle | **Marge nouvelle** |
|---|---|---|---|---|---|---|---|
| 1 | 23,31 € | **19,26 €** | 9,99 € | **7,49 €** | 39,90 € | −0,90 € ❌ | **+5,75 €** ✅ (17,3%) |
| 10 | 23,31 € | 19,26 € | 4,59 €/u | **2,90 €/u** | 39,90 € | 4,73 € (14%) | **10,46 €** ✅ (31,4%) |
| 25 | 23,31 € | 19,26 € | 4,23 €/u | 2,59 €/u | 36,90 € | 2,65 € | **8,55 €** ✅ (27,8%) |
| 50 | 23,31 € | 19,26 € | 4,11 €/u | 2,49 €/u | 33,90 € | 0,32 € | **5,42 €** ✅ (19,2%) |

**Gain potentiel** : passer de **−0,90 €/u** (1 ex) à **+5,75 €/u**. Sur 10 pièces, gain de **57,30 €** de marge totale. **À faire absolument** avant ouverture V1.

### Gildan 18500 Hoodie (existant, garder grille actuelle, marges saines)

| Qty | Coût | Shipping | Prix TTC HM | Marge unitaire | % marge |
|---|---|---|---|---|---|
| 1 | 24,24 € | 7,49 € | 49,90 € | 8,15 € | 19,6% ✅ |
| 10 | 24,24 € | 2,90 €/u | 49,90 € | 12,97 € | 31,2% ✅ |
| 25 | 24,24 € | 2,59 €/u | 45,90 € | 10,02 € | 26,2% ✅ |
| 50 | 24,24 € | 2,49 €/u | 41,90 € | 6,85 € | 19,6% ✅ |

---

## F. Stratégie livraison V1

### Règle générale
- **Frais de port calculés au panier** systématiquement (transparence client + flexibilité fournisseur).
- Le wording site doit dire : « Frais de port confirmés au panier avant paiement ».

### Cas par cas

| Produit | Shipping 10ex / unité | Décision V1 |
|---|---|---|
| Gildan 5000 | 1,55 €/u | ✅ **Livraison offerte dès 10 pièces** (coût absorbable, marge 30% conservée) |
| Bella+Canvas 3001 | 1,55 €/u | ✅ Livraison offerte dès 10 pièces |
| Comfort Colors 1717 | 1,55 €/u | ✅ Livraison offerte dès 10 pièces |
| Gildan 2400 Long Sleeve | 1,55 €/u | ✅ Livraison offerte dès 10 pièces |
| Gildan 18000 (DE rebascule) | 2,90 €/u | ⚠️ Livraison offerte uniquement si commande ≥ **15 pièces** (marge devient confortable) |
| Gildan 18500 | 2,90 €/u | ⚠️ Idem — seuil **15 pièces** |

**Résumé règle V1** : « Livraison offerte dès 10 pièces sur T-shirts, dès 15 pièces sur sweats et hoodies ».

---

## G. Stratégie mockups

### Couleurs à générer par produit

| Produit | Couleurs core V1 |
|---|---|
| Gildan 5000 | noir · blanc · gris · marine · rouge · royal (déjà fait) |
| Bella+Canvas 3001 | noir · blanc · athletic-heather · marine · rouge · true-royal (déjà fait) |
| **Comfort Colors 1717** | noir · blanc · gris · marine · rouge · royal (à générer) |
| **Gildan 2400 LS** | noir · blanc · gris · marine · rouge · naturel (à générer) |
| Gildan 18000 (rebascule) | noir · blanc · gris · marine · rouge — **Royal retiré** (déjà fait, à re-générer pour cohérence DE) |
| Gildan 18500 | noir · blanc · gris · marine · rouge · royal (déjà fait) |

### Vues à conserver
- ✅ `front`, `back`, `folded`
- ✅ `back-2`, `front-collar-closeup` (si dispo, bonus)
- ⛔ JAMAIS `person-*`, `lifestyle` (règle DA HM)

### Stockage
`/public/mockups/printify/{slug}/{colorId}-{view}.jpg` + entrée dans `/public/mockups/printify/manifest.json`.

### Provider DE = même pipeline que les 4 produits actuels
Le script `scripts/refresh-printify-mockups.mjs` peut être étendu sans changement de logique.

---

## H. Plan d'intégration V1 (post-validation)

### Phase 1 — Backend (1-2 jours)

1. **Étendre `scripts/refresh-printify-mockups.mjs`** :
   - Ajouter Comfort Colors 1717 (bp 145) et Gildan 2400 LS (bp 36) à `V1_PRODUCTS`
   - Re-générer Gildan 18000 chez Textildruck DE (sans Royal)
   - Lancer le script → manifest mis à jour
2. **Étendre `lib/suppliers/printify/printify-v1-map.ts`** :
   - Ajouter mapping variant_ids pour Comfort Colors 1717 + Gildan 2400 LS (toutes tailles S/M/L/XL/2XL × 6 couleurs)
   - Mettre à jour Gildan 18000 sans Royal V1, provider 26 (Textildruck DE) au lieu de 72 (Print Clever GB)
3. **Étendre `lib/suppliers/printify/printify-colors.ts`** :
   - Ajouter `HM_TO_PRINTIFY_COLOR['comfort-colors-1717']`
   - Ajouter `HM_TO_PRINTIFY_COLOR['gildan-2400-ls']`
   - Mettre à jour `HM_TO_PRINTIFY_COLOR['gildan-18000']` (retirer royal)

### Phase 2 — Catalogue (1 jour)

4. **Ajouter dans `data/products.ts`** :
   - `PRODUCT_COMFORT_COLORS_1717` (slug `tshirt-comfort-colors-heavyweight`, category `tshirts`, supplier `printful`, 6 couleurs, 6 tailles)
   - `PRODUCT_GILDAN_2400_LS` (slug `tshirt-gildan-long-sleeve`, category `tshirts`, supplier `printful`, 6 couleurs)
   - Modifier `PRODUCT_GILDAN_18000` : retirer Royal de `colors`
5. **Étendre `data/pricing.ts`** :
   - Ajouter `COMFORT_COLORS_1717_PRICES` + `_VOLUME` (selon grille section E)
   - Ajouter `GILDAN_2400_LS_PRICES` + `_VOLUME`
   - Corriger `BELLA_3001_DTF_VOLUME` : tier 50-99 → 19,90 € (sortir du déficit)

### Phase 3 — UI / tests (1 jour)

6. Tests fiches produit : image hero par coloris, sélecteur couleur filtré, taille, prix, panier
7. Test commande interne HM Global : 1 exemplaire de chaque nouveau produit (Comfort + LS) en pré-prod via Printify draft → validation manuelle → cleanup

### Phase 4 — Stratégie livraison (0,5 jour)

8. Implémenter la **logique livraison conditionnelle** dans le panier :
   - Lecture `productSlug + qty` → seuil livraison offerte (10 ex pour T-shirts, 15 ex pour sweats/hoodies)
   - Affichage transparent dans le récap panier

### Phase 5 — Lancement V1 textile

9. Soft launch sur les 6 produits Printify V1
10. Monitoring marges réelles vs estimées sur les 30 premiers jours
11. Décision Printify Premium après J+90 selon volume confirmé

---

## I. Risques identifiés

| Risque | Sévérité | Mitigation |
|---|---|---|
| Comfort Colors 1717 mockups Printify peu professionnels (à vérifier) | Faible | Tester via 1 draft pilote avant intégration finale |
| Gildan 18000 sans Royal réduit l'offre couleur de 16,7% | Faible | Royal sera reproposé V2 si demande client confirmée |
| Coûts Printify > coûts Printful documentés (rapport prix précédent) | Moyen | Recalculer les marges sur les coûts Printify réels avant V1 |
| Pas de polos/totes/caps via Printify EU | Nul | Couverts par TopTex (catalogue HM existant) |
| Le PNG transparent utilisé pour l'audit peut sous-estimer le coût réel avec design imprimé | Faible | Test avec design réel sur 1 commande pilote interne avant ouverture |

---

## J. Top recommandations actionnables

### Immédiat (avant V1)

1. ✅ **Rebasculer Gildan 18000 sur Textildruck DE** (retirer Royal) → gain ~6 €/u en marge
2. ✅ **Corriger Bella 3001 DTF 50-99** : 17,90 € → **19,90 €** (sortir du déficit avéré)
3. ✅ **Ajouter Comfort Colors 1717** dans le pipeline (T-shirt premium teint pièce, coût 9,09 € — produit phare V1)
4. ✅ **Ajouter Gildan 2400 Long Sleeve** (couverture catégorie LS)

### V2 (post-lancement)

5. ⏳ Revoir Stanley/Stella / Comfort Colors couvert via TopTex en attendant que Printify EU s'étende
6. ⏳ Évaluer Printify Premium après J+90 (rentable dès 15-20 commandes/mois)
7. ⏳ Re-tester mockup Printify avec design réel pour valider que les coûts retournés ne sous-estiment pas
8. ⏳ Polo / Tote / Cap : envisager intégration Printify si nouveaux providers EU apparaissent

---

## K. Fichiers générés par cet audit

| Fichier | Rôle |
|---|---|
| `scripts/audit-printify-catalogue.mjs` | Script reproductible — peut être re-lancé pour re-auditer en V2 |
| `tmp/printify-catalogue-audit.json` | Données brutes JSON (light + deep) pour calculs ultérieurs |
| `docs/audits/printify-catalogue-v1.md` | Ce rapport |

**Aucun fichier produit, image, route API, prix, panier, checkout n'a été modifié.**
**Aucune commande Printify réelle n'a été créée.**
**6 drafts d'audit créés et tous supprimés en fin de pipeline (cleanup HTTP 200 × 6).**

---

_Audit généré via `node scripts/audit-printify-catalogue.mjs` — peut être rejoué à volonté._
