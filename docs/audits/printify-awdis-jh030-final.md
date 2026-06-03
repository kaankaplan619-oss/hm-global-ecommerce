# Audit final AWDis JH030 (bp #95) — sweat premium V1

> Date : 2026-05-17
> Décision attendue : GO / NO-GO bascule en remplacement Cotton Heritage M2480 Printful
> Script : `scripts/audit-awdis-jh030-final.mjs` — 9 appels API / budget 25.
> Données brutes : `tmp/awdis-jh030-final.json`
> Samples mockups : `tmp/awdis-jh030-final/*.jpg` (8 fichiers, 42-132 Ko)
> Statut : **aucun fichier catalogue / pricing / site / Stripe / Supabase / lib modifié.** Draft créé puis supprimé (200 OK).

## Verdict en 1 ligne

**REPORTER V2** — 4 couleurs HM matchées proprement (noir/blanc/marine/gris) et mockups exploitables, MAIS marge brute à 44,90 € TTC = **33%** (en dessous du seuil GO 35%) ; renégocier prix de vente vers 47,90-49,90 € TTC ou commander échantillon physique avant bascule grand public.

## Spécifications produit

- **Blueprint Printify** : `id 95` — title `Unisex Sweatshirt`
- **Marque / modèle** : **AWDIS / JH030** (confirmé API)
- **Composition** : 80 % coton, 20 % polyester (fibre content peut varier selon couleur)
- **Grammage** : 280 g/m² (medium-heavy fabric, 9.9 oz/yd²)
- **Coupe** : "Stylish fit", runs true to size, tear-away label, seams renforcés ribbed knitting, neck tape backing
- **Tailles disponibles** : S, M, L, XL, 2XL (pas de XS ni 3XL)
- **Placements impression** (provider Textildruck DE) : front (vérifié dans le draft), back (vérifié via mockups back disponibles) — placements complémentaires non auditisés faute de budget API (sleeves potentiels mais non confirmés)

## Provider Textildruck Europa (DE)

- Confirmation présence : **OUI** (id 26 dans la liste des 7 providers du blueprint : Printify Choice 99, OPT OnDemand 30, SwiftPOD 39, **Textildruck Europa 26**, Print Clever 72, Shirt Monkey 331, T Shirt and Sons 6).
- Nombre de variants total chez Textildruck DE : **50** (10 couleurs × 5 tailles).
- Couleurs disponibles (catalogue exhaustif) :

| # | Couleur Printify | Variants | Tailles |
|--:|------------------|---------:|---------|
| 1 | Arctic White     | 5 | S–2XL |
| 2 | Jet Black        | 5 | S–2XL |
| 3 | Oxford Navy      | 5 | S–2XL |
| 4 | Heather Grey     | 5 | S–2XL |
| 5 | Fire Red         | 5 | S–2XL |
| 6 | Bottle Green     | 5 | S–2XL |
| 7 | Sky Blue         | 5 | S–2XL |
| 8 | Steel Grey       | 5 | S–2XL |
| 9 | Sun Yellow       | 5 | S–2XL |
| 10| Baby Pink        | 5 | S–2XL |

*Hex codes non retournés par l'API variants (`color_code` null pour tous). À récupérer manuellement avant intégration.*

## Mapping couleurs HM proposé V1

| Couleur HM | Match Printify | Variant ID (L) | Statut | Note |
|---|---|---:|---|---|
| **noir** | Jet Black | 36126 | ✅ OK | match exact |
| **blanc** | Arctic White | 36121 | ✅ OK | match exact |
| **marine** | Oxford Navy | 36128 | ✅ OK | bleu marine soutenu, cohérent avec M2480 navy |
| **gris chiné** | Heather Grey | 36124 | ✅ OK | équivalent direct du "gris-chine" HM |
| **sand / beige** | — | — | ❌ NON DISPO | aucune couleur sand/natural/stone/khaki dans le catalogue Textildruck DE |

**4 / 5 couleurs HM matchées (80 %)**. Le M2480 Printful actuel inclut "beige" — cette couleur disparaît si bascule. Steel Grey pourrait être proposé comme couleur supplémentaire HM (différente de gris chiné, plus charcoal), à valider commercialement.

## Coûts

Cost variant L par couleur (réponse Printify draft creation) :

| Couleur HM | Cost L (€) |
|---|---:|
| blanc | **21.48** |
| noir | 22.13 |
| marine | 22.13 |
| gris | 22.13 |
| **Moyenne** | **21.97** |

Shipping FR 67460 (récupéré via `POST /shops/{shop_id}/orders/shipping.json`) :

| Quantité | Standard | Express | Priority |
|---:|---:|---:|---:|
| 1 pc | **7.49 €** | 21.79 € | 21.79 € |
| 10 pcs | **29.00 €** (2.90 €/pc) | 39.79 € | 39.79 € |
| 25 pcs | non récupéré directement, **estimation linéaire 55-65 €** (~2.20-2.60 €/pc) | n/a | n/a |

> Note : l'endpoint `/products/{id}/shipping_info.json` retourne 404 sur draft ; on est passé par `/orders/shipping.json` qui supporte qty 1 et qty 10 testés. Pour qty 25 réel, refaire un appel au moment de la bascule.

**Coût total unitaire (10 pcs, couleur noir/marine/gris) :** 22.13 + 2.90 = **25.03 €**
**Coût total unitaire (10 pcs, blanc) :** 21.48 + 2.90 = **24.38 €**
**Coût total unitaire (1 pc, noir) :** 22.13 + 7.49 = **29.62 €** (peu pertinent en B2B)

## Mockups

- **Vues récupérées** : `front`, `back` pour les 4 couleurs HM matchées (pas de `folded` retourné par Printify pour ce blueprint).
- **Qualité** : flat/packshot fond clair, propre, cohérent avec le style `public/mockups/printify/` existant. Tailles 42-44 Ko pour noir/blanc/marine, 116-132 Ko pour gris (texture heather plus détaillée).
- **Samples téléchargés** (`tmp/awdis-jh030-final/`) :
  - `noir-front.jpg` (42 Ko) — `noir-back.jpg` (43 Ko)
  - `blanc-front.jpg` (44 Ko) — `blanc-back.jpg` (42 Ko)
  - `marine-front.jpg` (44 Ko) — `marine-back.jpg` (44 Ko)
  - `gris-front.jpg` (116 Ko) — `gris-back.jpg` (132 Ko)
- **Limite** : pas de vue `folded`, pas de `front-collar-closeup`, pas de mannequin (mais les autres produits V1 Printify sont également flat → cohérence design system).

## Marge estimée

Référence prix de vente sweat actuel (Cotton Heritage M2480, fichier `data/pricing.ts` → `HOODIE_PRICES.sweat`) :

| Technique | PV TTC actuel |
|---|---:|
| DTF | 44,90 € |
| DTflex | 46,90 € |
| Flex | 44,90 € |
| Broderie | 52,90 € |

Coût de revient unitaire estimé sur 10 pcs (couleur la plus coûteuse, noir/marine/gris) : **25.03 €** HT (le shipping Printify est HT, le cost variant Printify est HT).

| PV TTC | PV HT (÷1.2) | Coût unitaire (10 pcs) | Marge brute % |
|---|---:|---:|---:|
| 39,90 € | 33,25 € | 25,03 € | **24,7 %** |
| 44,90 € (actuel DTF) | 37,42 € | 25,03 € | **33,1 %** |
| 46,90 € (actuel DTflex) | 39,08 € | 25,03 € | **36,0 %** |
| 49,90 € | 41,58 € | 25,03 € | **39,8 %** |
| 52,90 € (actuel broderie) | 44,08 € | 25,03 € | **43,2 %** |

**Comparaison avec Cotton Heritage M2480 Printful actuel** : le M2480 chez Printful (DTG) côte ~22-25 USD HT + shipping ~5 € (EU print center Lettonie) = ~24-27 € HT par pièce. **Marge AWDis JH030 ≈ marge Cotton Heritage actuel (similaire, peut-être marginalement meilleure de 1-2 points en faveur d'AWDis sur volumes 10+)**. Pas de gain financier net significatif, mais gain logistique (shipping DE → FR = 2-3 jours vs Printful Lettonie/Espagne 5-7 jours).

## Risques spécifiques

1. **Couleur "beige/sand" disparaît** — le Cotton Heritage M2480 actuel propose "beige", qui n'a aucun équivalent chez AWDis. Impact commercial si "beige" est une vente régulière (à vérifier dans Stripe / Supabase). Mitigation : remplacer par "Sky Blue" ou "Bottle Green" ou retirer la couleur.
2. **Grammage 280 g/m² < Cotton Heritage** — le M2480 fait ~280-320 g/m² selon source. Le JH030 est donné 280 g/m² officiellement. À sentation physique, perception probablement similaire mais à valider avec échantillon (matière brushed inside non explicitement mentionnée dans la description AWDis).
3. **Composition 80/20 coton/poly** — le M2480 est généralement 90/10 ou 100% coton ringspun. Le JH030 a plus de polyester → moins de douceur premium, plus de tenue lavage. Risque de retour client si attente "premium = 100% coton".
4. **Pas de placement sleeve** — non confirmé via l'API variants. Si HM Global vend en broderie manche, vérifier que Printify supporte ce placement chez Textildruck DE avant de migrer.
5. **Hex codes non fournis par l'API** — il faut les renseigner manuellement dans le mapping HM, risque de mismatch visuel sur le picker couleur du site si valeur approximative.
6. **Marge à 44,90 € (PV actuel DTF) = 33 %** — sous le seuil de 35 % recommandé pour un sweat premium. Soit augmenter PV à 47,90 € (marge 36 %), soit accepter cette marge plus tendue.

## Recommandation finale

**REPORTER V2** car :

- ✅ **4 couleurs HM matchées** (objectif ≥ 4 atteint) — noir/blanc/marine/gris-chine sont les couleurs cœur du catalogue HM.
- ⚠️ **Marge brute à 44,90 € TTC = 33,1 %** — sous le seuil GO (35 %) mais au-dessus du seuil ABANDON (30 %). Position intermédiaire qui appelle un échantillon avant bascule grand public.
- ✅ **Mockups exploitables** — front + back sur les 4 couleurs, qualité packshot cohérente avec V1 actuel.
- ⚠️ **Perte couleur "beige"** — impact à mesurer si vente B2B existante.
- ⚠️ **Tissu 80/20 vs M2480 100% coton** — différence perceptible, échantillon physique obligatoire avant retrait du M2480.

Si la décision business est de pousser le sweat premium à PV 47,90 € ou 49,90 € TTC → la marge passe à 36-40 % et la bascule devient un **GO immédiat**. À cadrer côté positionnement marketing avant code.

## Prochaines étapes (si GO décidé)

**Effort dev estimé : 4-5 h**

1. Récupérer les hex codes Printify (manuel, depuis app.printify.com → blueprint 95 → couleurs) et ajouter au mapping HM.
2. Ajouter entrée `"sweat-awdis-jh030"` dans `lib/suppliers/printify/printify-v1-map.ts` (blueprintId=95, providerId=26, variants L noir/blanc/marine/gris).
3. Ajouter `HM_TO_PRINTIFY_COLOR["sweat-awdis-jh030"]` dans `lib/suppliers/printify/printify-colors.ts`.
4. Étendre `scripts/refresh-printify-mockups.mjs` avec ce nouveau produit, puis copier les samples depuis `tmp/awdis-jh030-final/` vers `public/mockups/printify/sweat-awdis-jh030/` (4 couleurs × 2 vues).
5. Mettre à jour `data/products.ts` :
   - Soit créer un nouveau `PRODUCT_AWDIS_JH030` à côté du M2480 (transition douce, A/B),
   - Soit basculer `PRODUCT_COTTON_HERITAGE_M2480` vers supplier `printify` + nouveau slug si retrait franc.
6. Décision business sur la couleur "beige" disparue : retrait ou remplacement (Steel Grey, Sky Blue, Bottle Green).

**Pré-requis go-live obligatoire** : commander 1 échantillon physique (L noir + L marine) chez Textildruck DE via un draft test ponctuel **avant** retrait du M2480 du catalogue public. Coût ~50-60 € incluant shipping, délai 5-8 jours ouvrés DE → FR. Cet échantillon valide :
- La tenue du tissu (80/20 perçu comme premium ou pas)
- La qualité d'impression DTG/DTF de Textildruck Europa
- La couleur réelle vs hex prévu (surtout Heather Grey, sensible aux écarts entre fabricants)

## Annexes

### Annexe 1 — Draft créé et supprimé

| Draft ID | Statut | Code HTTP DELETE |
|---|---|---|
| `6a09bb18d4244047410115b3` | ✅ supprimé | 200 |

**1 draft créé / 1 supprimé / 0 publié — 100 % cleanup.**

### Annexe 2 — Erreurs API rencontrées

- `GET /shops/{shop_id}/products/{id}/shipping_info.json` → **404** (endpoint inexistant ou non applicable aux drafts). Fallback : `POST /orders/shipping.json` avec préfiguration order, qui retourne 200 et donne les tarifs FR 67460 par quantité.
- Tous les autres appels : 200 OK.

### Annexe 3 — API calls (9 / 25 budget)

| # | Méthode | Endpoint | Status |
|--:|---|---|--:|
| 1 | GET | /catalog/blueprints/95.json | 200 |
| 2 | GET | /catalog/blueprints/95/print_providers.json | 200 |
| 3 | GET | /catalog/blueprints/95/print_providers/26/variants.json | 200 |
| 4 | POST | /uploads/images.json | 200 |
| 5 | POST | /shops/27566098/products.json | 200 |
| 6 | GET | /shops/27566098/products/{id}/shipping_info.json | 404 (attendu) |
| 7 | POST | /shops/27566098/orders/shipping.json (qty 1) | 200 |
| 8 | POST | /shops/27566098/orders/shipping.json (qty 10) | 200 |
| 9 | DELETE | /shops/27566098/products/{id}.json | 200 |

Token Printify lu depuis `.env.local`, jamais loggé ni écrit.

### Annexe 4 — Fichiers créés / modifiés

**Créés** :
- `scripts/audit-awdis-jh030-final.mjs`
- `docs/audits/printify-awdis-jh030-final.md` (ce rapport)
- `tmp/awdis-jh030-final.json` (données brutes)
- `tmp/awdis-jh030-final/*.jpg` (8 samples mockups)

**Modifiés** : **AUCUN.** Aucun fichier `data/products.ts`, `data/pricing.ts`, `lib/suppliers/printify/*`, manifest, route API, Stripe ou Supabase n'a été touché, en accord avec le brief.
