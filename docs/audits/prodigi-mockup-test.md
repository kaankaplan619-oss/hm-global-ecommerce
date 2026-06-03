# Audit Prodigi — API print + Mockup Generator

> Date : 2026-05-17
> Statut : audit lecture documentation publique uniquement (pas de clé `PRODIGI_API_KEY` dans `.env.local`, donc aucun appel live)
> Budget : 13/15 WebFetch consommés
> Auteur : agent IA (sous-tâche dédiée Prodigi)

---

## TL;DR

- **Verdict global pour HM Global : NON pour mockups, TEST conditionnel pour print V2.** Le mockup generator Prodigi n'est pas viable pour alimenter le site HM en images marketing (pas d'API publique documentée, licence d'usage commercial non explicitée, fonctionnement orienté outil web manuel).
- **API print classique : solide et bien documentée** (v4.0, sandbox propre, auth simple `X-API-Key`, endpoints orders/quotes/products clairs).
- **Production EU confirmée** (UK + Europe en hubs primaires) — couverture France OK via réseau partenaires.
- **Catalogue 200+ produits** dominé par wall art (canvas, framed prints, metal, wooden, photo tiles), apparel, home goods. **Aucun produit papeterie pro pertinent pour HM Global identifié** (pas de cartes de visite, flyers, kakémonos).
- **Tarification opaque** : pas de pricing public, modèle pay-per-order sans plan d'abonnement visible. Pas de claim "free tier" pour l'API.
- **Mockup generator (mockups.prodigi.com) annoncé gratuit et illimité**, mais zéro documentation sur format de sortie, résolution, watermark, ni licence commerciale. Bloquant.
- **Pas de chevauchement utile avec Printify/Gelato déjà intégrés** sur les familles textile/papeterie.

---

## A. API print classique

### A.1 Authentification & accès

| Élément | Valeur |
|---|---|
| Version | v4.0 (actuelle, guide de migration v3 → v4 fourni) |
| Base URL prod | `https://api.prodigi.com/v4.0` |
| Base URL sandbox | `https://api.sandbox.prodigi.com/v4.0` |
| Header d'auth | `X-API-Key: <clé>` |
| Format | JSON, REST classique |
| Outils fournis | Collection Postman officielle, full reference, guide quickstart, FAQ |
| Support | support@prodigi.com |

**Acquisition de clé** : non documentée dans les pages publiques indexées (pages `getting-started/`, `quickstart/`, `print-on-demand-app/` retournent 404). Suppose une création de compte sur `prodigi.com` → onglet développeur. À confirmer en s'inscrivant.

### A.2 Endpoints principaux

**Orders** (création et gestion) :
- `POST /orders` — création
- `GET /orders/{id}` — récupération
- `GET /orders` — liste avec filtres
- `GET /orders/{id}/actions` — actions disponibles
- `POST /orders/{id}/actions/cancel` — annulation
- `POST /orders/{id}/actions/updateShippingMethod`
- `POST /orders/{id}/actions/updateRecipient`
- `POST /orders/{id}/actions/updateMetadata`

**Quotes** (chiffrage sans création) :
- `POST /quotes` — devis pricing + fulfillment sans engagement

**Products** (catalogue) :
- `GET /products/{sku}` — fiche produit (ex. `GLOBAL-CAN-10x10` pour un canvas 10×10)
- `POST /products/spine` — calcul de largeur de dos de photobook

**Aucun endpoint `/mockups` n'est listé dans la référence v4.0 publique.** C'est le constat le plus important de cet audit : le mockup generator de Prodigi est un outil web indépendant (mockups.prodigi.com), pas un endpoint de l'API marchande.

### A.3 Catalogue produits couverts

D'après les pages indexées, 200+ produits répartis en :

| Famille | Exemples | Pertinence HM Global |
|---|---|---|
| Wall art | canvas, framed prints, metal prints, wooden prints, photo tiles | Faible (HM = papeterie pro / textile entreprise) |
| Apparel | T-shirts, sweatshirts, accessoires hommes/femmes/enfants | Redondant avec Printify (déjà intégré) |
| Lifestyle / home | cushions, mugs (probable), phone cases | Hors core HM |
| Stickers | — | Marginal |
| Books & magazines, cards & stationery | photobooks, greeting cards | Possiblement intéressant V2 (cartes événementielles) |
| Business products | non détaillé | À investiguer si HM veut diversifier |

**Pas de cartes de visite, flyers A5/A4, kakémonos, roll-ups, ni signalétique pro identifiés** dans les pages publiques. C'est le cœur de l'offre HM Global et Prodigi ne semble pas couvrir.

### A.4 Production EU

- Hubs primaires annoncés : **UK + Europe** (positionnement "go global, print local")
- Hubs secondaires : USA, Australie, Canada
- Pays EU exact (Pays-Bas, Allemagne, France ?) non détaillé sur les pages indexées — la page `/about/locations/` retourne 404
- **À demander en clarification au support** : présence de lab France, ou impression Pays-Bas / Allemagne avec shipping J+2/3 vers FR ?

### A.5 Pricing API & shipping France

- Aucune grille publique
- Modèle déclaré : **pay-per-order** (produit + impression + frais de port refacturés au merchant)
- Sandbox accessible librement (api.sandbox.prodigi.com) — devis et tests gratuits
- Shipping France : non confirmé explicitement, mais "fast, low cost delivery around the world" + EU hub → présomption favorable

---

## B. Mockup Generator (priorité audit)

### B.1 URL & accès

- URL : `https://mockups.prodigi.com/`
- Accès : annoncé **gratuit, sans inscription** d'après la page marketing
- Mode d'usage principal : **outil web interactif** (upload artwork → live preview → resize/rotate/reposition → download)
- Promesse marketing : "unlimited access to hundreds of mockups", "high-resolution file downloads"

### B.2 Types de mockups proposés

| Famille produit | Confirmation page marketing | Style (lifestyle / flat / scene) | Résolution | Usage commercial autorisé |
|---|---|---|---|---|
| Canvas wall art | Oui | Non précisé | "High-resolution" — pas de chiffre | **Non documenté** |
| Framed prints | Oui | Non précisé | id. | **Non documenté** |
| T-shirts | Oui | Non précisé | id. | **Non documenté** |
| Sweatshirts | Oui | Non précisé | id. | **Non documenté** |
| Cushions | Oui | Non précisé | id. | **Non documenté** |
| Phone cases | Oui | Non précisé | id. | **Non documenté** |

### B.3 Endpoint API mockup

**Aucun endpoint API officiel pour la génération de mockups n'a été trouvé** dans :
- la doc Prodigi API v4.0 (référence publique)
- la page mockups.prodigi.com (pas de section "Developers" / "API" visible)
- les URLs `mockups.prodigi.com/api`, `/print-api/docs/quickstart/`, `/print-api/docs/faqs/` (toutes 404)

Conclusion : **le mockup generator est un produit "consumer / merchant" non exposé via API**. Génération programmatique impossible sans contournement.

### B.4 Watermark / quotas / limites

Aucune information publique :
- Watermark sur plan gratuit : **non précisé** (peu probable selon promesse "free downloads", mais à vérifier)
- Quota mensuel : **non précisé**
- Rate limit : sans objet (pas d'API)

### B.5 Licensing / usage commercial — **point bloquant**

- Page marketing : silence total sur les conditions de réutilisation des mockups téléchargés
- `mockups.prodigi.com/terms` et `prodigi.com/legal/terms-of-service/` : 404 sur les URLs testées
- **Risque légal** : utiliser un mockup généré par un outil tiers gratuit sur le site marchand HM Global sans accord écrit expose à un retrait soudain ou à une exigence rétroactive de licence
- Action requise avant tout usage : courriel à `hi@prodigi.com` demandant explicitement :
  > "Can mockups generated on mockups.prodigi.com be displayed on a third-party commercial e-commerce site (hmglobal.fr) to market printed products that are NOT fulfilled by Prodigi? If yes, please confirm in writing the license terms (royalty-free, perpetual, transferable)."

---

## C. Comparaison Prodigi vs alternatives mockups

| Solution | Coût | API | Usage commercial | Qualité | Couverture produits HM |
|---|---|---|---|---|---|
| **Prodigi Mockup Gen** | Gratuit (mais licence floue) | Non | À vérifier | Marketing claim "high-res" | Wall art + apparel + déco — pas papeterie pro |
| **ChatGPT / Midjourney / Flux** | ~20-60$/mois | Oui | OK (avec attribution selon CGU) | Excellent (génération IA, infinie variabilité) | Tout type — mais "fake mockup" pas photo produit réel |
| **Placeit (Envato)** | 14,95$/mois | Limité | Oui, inclus dans abo | Pro | Très large bibliothèque mockups |
| **Smartmockups** | 9-29$/mois | Oui | Oui, inclus | Pro | Large, focus apparel/print |
| **Photo studio interne HM (V3)** | Coût production initial | N/A | 100% propriété HM | Maximum (photo réelle) | Sur mesure pour HM uniquement |
| **Printify / Gelato (déjà intégrés)** | Inclus dans tarif | Oui (déjà câblés côté HM) | Oui sur produits achetés | Bonne | Textile + papeterie déjà couverts |

**Lecture HM Global** : Placeit ou Smartmockups offrent une licence commerciale claire pour <30€/mois avec une API documentée — bien plus pertinent que Prodigi si l'objectif est d'industrialiser la génération de mockups. Pour de la photo produit "vraie", la solution V3 (photo studio interne) reste irremplaçable.

---

## D. Intégration Next.js

Si HM décide quand même d'utiliser Prodigi (uniquement pour print V2, pas pour mockups) :

- **Effort estimé** : 4-6 jours-homme
  - 1 j : création compte + clé API + variable `PRODIGI_API_KEY` sandbox
  - 1 j : helper `lib/print-suppliers/prodigi.ts` (typage v4.0, fetch wrappers)
  - 1 j : intégration dans `lib/print-suppliers/router.ts` (sélection fournisseur)
  - 1-2 j : mapping SKU Prodigi ↔ catalogue HM
  - 1 j : tests sandbox + bascule prod
- **Pré-requis** :
  - Compte Prodigi merchant validé
  - Décision produit : quelles familles HM passerait sur Prodigi (canvas ? wall art ?)
  - Tarification confirmée (quote endpoint utilisé pour comparer vs Printify/Gelato)

Pour le mockup generator : **0 intégration possible sans API** — l'unique usage serait un opérateur HM qui télécharge manuellement des images depuis mockups.prodigi.com et les upload dans Supabase Storage. Pas industrialisable.

---

## E. Risques

1. **Licence mockups floue** — risque retrait/réclamation si HM affiche des mockups Prodigi sans accord écrit.
2. **Dépendance API tierce supplémentaire** — HM gère déjà Stripe, Supabase, Printify, Gelato ; ajouter Prodigi multiplie la surface d'incident.
3. **Pas de papeterie pro dans le catalogue** — désalignement avec le cœur de métier HM Global.
4. **Tarification non publique** — pas de moyen de comparer vs Printify/Gelato sans inscription et tests sandbox.
5. **Doc partiellement 404** — plusieurs pages clés (locations, getting-started, terms) renvoient 404 sur les URLs publiques testées ; signe que le site est en reorg ou que la doc dev est gated.
6. **Redondance** : familles textile/apparel déjà parfaitement couvertes par Printify intégré.

---

## Recommandation finale

| Cas d'usage | Recommandation |
|---|---|
| **Mockup generator pour images marketing site HM** | **NON.** Pas d'API, licence floue, alternatives (Placeit/Smartmockups/IA) plus claires. |
| **API print Prodigi pour textile** | **NON.** Redondant avec Printify déjà intégré. |
| **API print Prodigi pour wall art / canvas / framed prints (V2 si HM diversifie)** | **TEST sandbox uniquement**, après confirmation de présence d'un hub EU avec délais France acceptables et grille tarifaire compétitive vs Gelato. |
| **API print Prodigi pour cartes événementielles / photobooks (V2)** | **TEST sandbox** envisageable si HM lance gamme événementiel. |

**Décision suggérée pour le sprint en cours** : ne pas créer de compte Prodigi maintenant. Réévaluer en V2/V3 si HM ouvre une catégorie wall art ou photobook. Pour les mockups marketing, privilégier Smartmockups (API + licence commerciale claire) ou continuer le pipeline interne (Blender/photo studio déjà en place selon `scripts/blender/` et `scripts/generate-mockups.mjs`).

---

## Prochaines actions

1. **Si réévaluation V2** : créer compte sur `prodigi.com` (formulaire merchant standard), récupérer clé sandbox, ajouter à `.env.local` sous `PRODIGI_API_KEY=`, relancer ce script d'audit en mode live.
2. **Questions à poser au support Prodigi (hi@prodigi.com) avant intégration** :
   - Existe-t-il un hub EU production avec délais France < 5 jours ouvrés ?
   - Le retour `GET /products/{sku}` inclut-il des URLs de preview images exploitables commercialement ?
   - Quelles sont les CGU exactes pour la réutilisation des mockups générés sur `mockups.prodigi.com` sur un site marchand tiers ?
   - Existe-t-il un endpoint API privé / beta pour générer des mockups programmatiquement ?
   - Grille tarifaire indicative sur canvas 30×40 cm impression + livraison France ?
3. **Si HM lance gamme déco/wall art** : intégrer Prodigi comme 3e fournisseur dans `lib/print-suppliers/` après comparaison quote vs Gelato.

---

## Annexes

- Données brutes : `tmp/prodigi-audit.json`
- Appels WebFetch consommés : 13/15
- Aucun fichier modifié hors `docs/audits/prodigi-mockup-test.md` + `tmp/prodigi-audit.json`
- Aucun appel API live effectué (clé absente)
- Aucun mockup téléchargé (pas d'endpoint API disponible)
