# Audit images Gelato pour visuels print HM Global

> Date : 2026-05-17
> Statut : **Non exploitable**
> Auteur : audit lecture seule via `scripts/audit-gelato-images.mjs`
> Budget : 15/15 appels API consommés

## TL;DR

- L'API publique Gelato (`product.gelatoapis.com/v3`) **ne retourne aucun champ image** dans les endpoints catalogue/produit : ni `image`, `imageUrl`, `thumbnail`, `preview`, `mockup`, `assets`, `productImages`, ni équivalent. Tous les payloads testés sont strictement techniques (attributs papier/format/finition + dimensions + pays supportés).
- Gelato a été conçu comme **moteur de production**, pas comme catalogue marketing : les mockups vivent sur dashboard.gelato.com et sont générés à la volée côté Gelato Studio à partir de fichiers d'impression fournis par le marchand. Aucune URL CDN publique de visuel produit n'est exposée via les API testées.
- → **Ne pas utiliser Gelato comme source d'images marketing pour HM Global Agence.** Alternatives recommandées : photos pack Pixartprinting / Printoclock, rendus 3D maison (Blender), ou génération IA dédiée. 0 image téléchargée.

## Endpoints testés

| # | Endpoint | Méthode | Statut HTTP | Résultat utile |
|---|----------|---------|-------------|----------------|
| 1 | `/v3/catalogs` | GET | 200 | 62 catalogues listés, 0 champ image |
| 2 | `/v3/catalogs/business-cards` | GET | 200 | `productAttributes` uniquement, 0 image |
| 3 | `/v3/catalogs/business-cards/products:search` | POST `{}` | 200 | `products[]` + `hits{}`, 0 image |
| 4 | `/v3/catalogs/flyers/products:search` | POST `{}` | 200 | idem |
| 5 | `/v3/catalogs/posters/products:search` | POST `{}` | 200 | idem |
| 6 | `/v3/catalogs/canvas/products:search` | POST `{}` | 200 | idem |
| 7 | `/v3/catalogs/framed-posters/products:search` | POST `{}` | 200 | idem |
| 8 | `/v3/catalogs/hanging-posters/products:search` | POST `{}` | 200 | idem |
| 9 | `/v3/products/cards_pf_bb_pt_110-lb-cover-uncoated_cl_4-4_hor` | GET | 200 | 12 clés, 0 image |
| 10-15 | calls de structure exploratoire (V1 search, sans body adapté → réponses vides) | POST | 200 | 0 produit (mauvaise structure de requête côté V1) |

Note : la requête V1 sérialisait `{ offset, limit, attributeFilters }` et la réponse a top-level `products` (pas `data`). Le bug d'extraction côté script (test V1) a été corrigé en V2 — confirmé que la structure officielle est :

```
{ products: [...], hits: { attributeHits, availabilityHits } }
```

## Champs image trouvés

**Aucun.** Détail par famille (catalog detail + search + product detail) :

| Famille | Champs image-like trouvés | Clés top-level produit retournées |
|---------|---------------------------|------------------------------------|
| business-cards | aucun | `productUid`, `attributes`, `weight`, `dimensions`, `supportedCountries`, `notSupportedCountries`, `hasFlatShippingPriceType`, `isPrintable`, `validPageCounts`, `isStockable`, `productTypeUid`, `contentAreas` |
| flyers | aucun | idem |
| posters | aucun | idem |
| canvas | aucun | idem |
| framed-posters | aucun | idem |
| hanging-posters | aucun | idem |

Le crawler récursif (profondeur 8, 18 patterns testés dont `image`, `imageUrl`, `thumbnail`, `preview`, `mockup`, `productImage`, `productImages`, `displayImage`, `assets`, `previewUrl`, `productPreview`, `placeholder`, `coverImage`, `icon`, `picture`, `previewFileUrl`, `previewFile`, `previewUrls`) a retourné **0 match** sur la totalité des payloads (cumulé ~50 produits inspectés).

Hypothèse confirmée par la doc Gelato : le `ProductService` v3 ne sert pas de mockups. Les visuels viennent soit :
- de **Gelato Studio** (génération à la commande via fichier print fourni par le marchand) — pas d'API publique de récupération,
- du **Dashboard Gelato** (templates internes) — non accessibles via X-API-KEY,
- de la doc statique [gelato.com/print](https://www.gelato.com/print/) — pages HTML marketing, non destinées au scraping commercial.

## Échantillon visuel

**0 image téléchargée.** Le dossier `public/mockups/print/gelato/` **n'a pas été créé** car aucune image source exploitable n'a été trouvée. Le manifest n'a pas non plus été généré.

## Risques juridiques

Sans objet ici puisqu'aucune image n'est récupérable via API. Pour mémoire si on devait scraper les pages marketing Gelato :

- Les images sur `gelato.com` sont la propriété de Gelato Group AS, soumises à copyright et conditions d'usage du site (clause "no reproduction without consent" sur les CGU).
- Aucune licence "commercial reuse" n'est attachée par défaut, contrairement à des banques d'images stock.
- **À vérifier juridiquement** avant tout usage : un accord partenaire Gelato (compte business) peut donner accès à des assets marketing co-brandés, mais ce n'est pas exposé via X-API-KEY.

## Recommandation finale

**Ne PAS utiliser Gelato comme source d'images marketing.**

Aucune famille n'est exploitable. Les API testées (catalogue, search produits, détail produit) sont des API de production technique — elles renseignent ce qu'on peut imprimer, pas comment ça rend.

### Alternatives recommandées par famille

| Famille HM Global | Source recommandée |
|-------------------|---------------------|
| business-cards | photos stock Pixartprinting (déjà utilisées dans la lib comparable Printify) ou rendu Blender (script existant dans `scripts/blender/`) |
| flyers | rendu IA (ChatGPT / Midjourney) + retouche, ou stock Pixartprinting |
| posters | rendu mockup Etsy/Placeit licence commerciale, ou rendu Blender |
| canvas | rendu Blender existant + texture mur (le dossier `public/mockups/print/canvas/` existe déjà) |
| framed-posters | rendu Blender (cadre + verre, lib existante) |
| hanging-posters | rendu Blender (cadre bois suspendu) ou Placeit |

### Mesures pour le module Gelato existant

- **Ne pas modifier** `lib/suppliers/gelato/`, ni `lib/gelato.ts`, ni les routes `app/api/gelato/**` : ces fichiers restent valides pour leur usage actuel (devis manuel back-office canvas / framed-posters, conformément à la stratégie business V1 documentée en haut de `client.ts`).
- **Type `GelatoCatalogProduct`** dans `lib/suppliers/gelato/types.ts` : on peut confirmer (lecture seule) qu'il n'y a effectivement aucun champ image à ajouter. Le typage actuel reflète bien la réalité de l'API.

### Artefacts générés

- `scripts/audit-gelato-images.mjs` (V1 — discovery)
- `scripts/audit-gelato-images-v2.mjs` (V2 — structure correcte search)
- `scripts/audit-gelato-images-v3.mjs` (V3 — confirmation product detail)
- `tmp/gelato-audit-raw.json` + `tmp/gelato-audit-raw-v2.json` + `tmp/gelato-product-detail-sample.json` (payloads bruts pour archivage)

---

**Verdict :** Gelato API non exploitable pour images marketing — utiliser autre source.
