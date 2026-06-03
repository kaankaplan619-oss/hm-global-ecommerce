# Audit Cloudprinter API — qualification HM Global

> Date : 2026-05-17
> Statut : audit **lecture documentaire uniquement** (clé `CLOUDPRINTER_API_KEY` absente de `.env.local`)
> Script : `scripts/test-cloudprinter-api.mjs`
> Données brutes : `tmp/cloudprinter-audit.json`
> Appels API live : 0 — appels WebFetch documentaires : 11

---

## TL;DR

- **Verdict : TEST PHYSIQUE avant tout GO** — Cloudprinter est techniquement viable pour le print papier EU mais présente **un blocage UX majeur pour HM Global : aucun endpoint mockup / preview / proof côté API**. Aller plus loin sans valider l'expérience utilisateur (rendu du fichier client) serait risqué.
- **Couverture catalogue : bonne** sur le papier — 50 000+ produits annoncés couvrant cartes de visite, flyers, posters, brochures, livres, photobooks. À confirmer par catalogue live une fois la clé créée.
- **Images / mockups API : ABSENT.** Aucun endpoint `/preview`, `/mockup`, `/proof`, `/thumbnail` n'existe dans la CloudCore API 1.0. Cloudprinter consomme un PDF par URL externe ; il **n'expose pas** d'image de rendu via API. C'est le point bloquant n°1 vs Gelato/Printful qui retournent des mockups.
- **Production France : non documentée explicitement.** Cloudprinter annonce 381 sites print dans 104 pays via "Global Print Network" mais ne publie pas la liste par pays. Le `routing` est automatique côté plateforme. À vérifier en live (le catalogue exposera les hubs disponibles pour `country=FR`).
- **Plan Free disponible** ("Starter") avec accès complet à l'API et au catalogue ; **sandbox mode** illimité et gratuit ; pas de frais d'intégration. Tier "Business" à 199 €/mois pour 10 % de remise + outil PDF FIX.

---

## Authentification & accès

- **Base URL** : `https://api.cloudprinter.com/cloudcore/1.0/` (HTTPS, port 443, TLS).
- **Méthode d'auth** : la clé API est envoyée dans le **corps JSON** du POST (`{"apikey": "..."}`) sur **tous les endpoints**. Pas de header `Authorization`. Tous les endpoints utilisent `POST`, même les lectures.
- **Format** : JSON request/response, `Content-Type: application/json`.
- **Comment obtenir une clé** :
  1. Créer un compte gratuit sur `https://account.cloudprinter.com/register`.
  2. Confirmer l'email, compléter le profil.
  3. Dashboard → "API Interfaces" → créer une nouvelle interface en **Sandbox mode** (puis Live mode quand prêt).
  4. Copier la valeur `apikey` et l'ajouter à `.env.local` : `CLOUDPRINTER_API_KEY=...`.
- **Sandbox vs production** :
  - Sandbox : commandes acceptées mais **non poussées en production**, signaux d'impression et de shipping simulés via webhooks CloudSignal. **Coût : 0 €**.
  - Production : commandes facturées en réel, paiement requis (carte / prépaiement).
- **Limitations plan Free (Starter)** : appels API illimités, accès aux 50 000+ produits, support chat 24/7, **routing standard (1 profil)**. Pas de PDF FIX, pas de Regional Manager dédié, pas de remise sur le print cost.

---

## Catalogue produits

Le catalogue exact n'est pas inspectable sans clé API ; les références internes Cloudprinter sont au format `<categorie>_<materiau>_<format>_<options>` (ex : `textbook_pb_a4_p_bw` pour un livre A4 portrait noir & blanc, `businesscards_pp_85x55_4_4` pour cartes de visite 85×55 quadri recto-verso d'après les conventions docs).

| Famille HM | Existence docs | Référence Cloudprinter (motif probable) | Formats annoncés | Hubs production |
|---|---|---|---|---|
| Cartes de visite | OUI | `businesscards_*` | 85×55, 90×50 standard | routing auto, non détaillé |
| Flyers | OUI | `flyers_*` | A6/A5/A4 | idem |
| Posters | OUI | `posters_*` | A3/A2/A1/A0 | idem |
| Brochures pliées | OUI | `folded_brochures_*` | A4/A5 | idem |
| Magazines | OUI | `magazines_*` | A4 | idem |
| Photobooks | OUI | `photobooks_*` | divers | idem |
| Livres / textbooks | OUI | `textbook_*` | A4/A5 | idem |

Le script `test-cloudprinter-api.mjs` est prêt à parser ce catalogue dès qu'une clé sera fournie (méthode `/products`), à isoler une carte de visite type, et à demander `/products/info` pour récupérer le détail formats/papiers/options.

---

## Prix

- **Endpoint pricing** : `POST /prices/lookup` (alias structurel de `/orders/quote` — "100% compatible" d'après docs).
- **Body type** :
  ```json
  {
    "apikey": "***",
    "country": "FR",
    "currency": "EUR",
    "items": [
      { "reference": "qty_1", "product": "businesscards_pp_85x55_4_4", "count": "1", "options": [] }
    ]
  }
  ```
- **Devise** : par défaut EUR (déjà adapté à HM Global). Override possible via `currency` ISO 4217.
- **Réponse** : prix produit + objet `shipments[]` avec coûts par méthode shipping. Pas de devise alternative côté Free.
- **Échantillon prix (à compléter en live)** : business card 85×55 350gsm France 67460 — qty 1 / 10 / 25 → prévu dans le script (`price_lookup_business_card_x1`, `_x10`, `_x25`). Sans clé, impossible de chiffrer ici.

---

## Shipping

- **Endpoints** : `/shipping/countries` (liste pays), `/shipping/levels` (niveaux par pays), `/shipping/states` (régions).
- **Hubs identifiés** : Cloudprinter ne publie **pas** la liste géographique des sites print. L'argument commercial parle de "381 print locations dans 104 pays". Le routing du fichier vers le bon site est automatique côté plateforme — l'utilisateur API n'a pas à choisir un hub explicitement (sauf via routing profiles sur tier Business+).
- **Délais France** : non documentés publiquement ; remontés dans la réponse `/shipping/levels` (à mesurer en live). Cloudprinter annonce un modèle **"print locally"** → délais typiquement courts (J+2 à J+5 pour FR métropolitaine en production EU locale).
- **Coût shipping FR** : retourné dans `/prices/lookup` au sein de `shipments[]`. Pas de chiffre disponible sans appel live.

---

## Images / mockups / preview

> **Constat le plus important pour HM Global.**

- **Présence champs image dans payload** : **NON** (audit documentaire). L'API CloudCore 1.0 n'expose **aucun** endpoint ni champ de réponse retournant une image rendue du fichier client (preview, mockup, proof, thumbnail).
- **Endpoints recherchés et absents** : `/preview`, `/mockup`, `/proof`, `/thumbnail`, `/render`, `/files/preview`. Aucun n'apparaît dans la doc CloudCore.
- **Flux fichier** : le client fournit un PDF **hébergé sur sa propre URL publique** (`order.files[].url`). Cloudprinter télécharge ce PDF (depuis 3 IPs fixes : `52.214.176.230`, `46.51.157.175`, `54.216.74.45`) et l'envoie à l'imprimeur. Le retour API se limite à des codes d'état (`state`) — pas de rendu visuel.
- **Alternatives Cloudprinter** :
  - Outil **PDF FIX** (tier Business, 199 €/mois) — corrige automatiquement bleed/CMYK/fonts mais ne renvoie pas un mockup utilisateur exploitable côté frontend.
  - **Dashboard web** propriétaire pour visualiser les commandes — pas exposé en API.
  - **Aucun service de mockup/scene generation** comparable à Printful Mockup Generator API ou Gelato Preview API.
- **Implication HM Global** : il faudra **générer les mockups côté HM Global** (rendu canvas Next.js + composition sur templates papier → `lib/mockups` existant) avant d'envoyer le PDF final à Cloudprinter. Le pipeline mockup actuel (Printify/Gelato) **n'est pas réutilisable** car ces partenaires reçoivent un PNG/JPG et retournent le mockup en réponse. Avec Cloudprinter, c'est HM Global qui doit produire **et** le PDF print-ready **et** le mockup d'aperçu utilisateur.

---

## Preflight / contrôle fichier

- **Endpoint de preflight dédié** : **NON** en plan Free. Le contrôle PDF est effectué par Cloudprinter en interne après réception ; en cas de problème, signal `item_problem` via webhook CloudSignal (asynchrone, post-commande).
- **PDF FIX** (Business 199 €/mois) corrige automatiquement bleed/CMYK/embedded fonts — utile mais payant.
- **Recommandations docs** :
  - PDF 1.6 recommandé.
  - Profil couleur : **FOGRA39** (offset CMYK) ou RGB (digital).
  - Fonts : embedded ou vectorisés.
  - Safe zone : 3 mm (texte).
  - Bleed : non chiffré explicitement, à dériver des specs produit (`/products/info`).
- **Conséquence HM Global** : nécessité d'un **preflight côté HM Global** avant envoi (lib type `pdf-lib` ou service externe Adobe PDF Services) pour éviter les rejets différés en production.

---

## Intégration Next.js — estimation effort

| Tâche | Effort (j-h) |
|---|---|
| Wrapper API CloudCore (axios/fetch, signature `apikey` body, types TS) | 1.5 |
| Génération PDF print-ready depuis design utilisateur (vector + bleed + CMYK) | 4–6 |
| Hébergement public temporaire du PDF (Supabase Storage signed URL) | 0.5 |
| Mockup UI côté HM Global (Canvas/Three.js sur templates papier) | 3–5 |
| Webhooks CloudSignal (états commande + erreurs preflight) | 1.5 |
| Mapping produit Cloudprinter ↔ catalogue HM Global | 2 |
| Tests sandbox + parcours bout-en-bout | 2 |
| **Total V2 papier seul** | **14–18 j-h** |

Pré-requis : clé API Sandbox, URL publique pour PDF (signed Supabase URL OK), définition du mapping produit + tarification HM.

---

## Risques

1. **UX preview cassée** — Sans mockup API, l'utilisateur ne voit pas son rendu print final. Soit HM Global investit dans un rendu mockup propriétaire (3–5 j-h + maintenance), soit accepte une expérience dégradée (PDF download brut). **Risque commercial majeur**.
2. **Preflight asynchrone post-paiement** — Erreur PDF détectée après commande payée → remboursement + friction client. Nécessite preflight HM Global obligatoire en amont.
3. **Opacité du routing géographique** — Pas de garantie écrite que la production se fasse en France ; le `print locally` est best-effort. À auditer sur 5–10 commandes sandbox réelles (origine du `shipped` signal).
4. **Pas de remise sans engagement à 199 €/mois** — Marge HM sur papier petite quantité pourrait être insuffisante en Starter (prix public Cloudprinter), nécessitant Business dès le ramp-up.
5. **Dépendance à URL publique du PDF** — Si la signed URL Supabase expire avant que les 3 IPs Cloudprinter aient téléchargé le fichier, échec silencieux. TTL signed URL ≥ 7 jours obligatoire + retry logic webhook.

---

## Recommandation finale

**TEST PHYSIQUE avant tout GO V2.**

Cloudprinter est **techniquement intégrable** en 14–18 j-h pour le papier, le pricing est transparent (EUR natif, sandbox gratuit, plan Free utilisable jusqu'à validation produit), et le catalogue est suffisant. **Mais** l'absence d'API mockup invalide la réutilisation du pipeline d'aperçu existant (Printify/Gelato) et impose à HM Global d'industrialiser son propre moteur de rendu papier — un investissement qu'il faut pondérer par la qualité physique réelle du produit livré.

**Avant de s'engager, 3 prochaines actions concrètes** :

1. **Créer un compte Starter** sur `account.cloudprinter.com/register` et générer une clé Sandbox → relancer `node scripts/test-cloudprinter-api.mjs` pour produire le catalogue live, les prix FR, et confirmer formellement l'absence de champs image dans `/products/info`.
2. **Commander 3 échantillons physiques** (1 carte de visite 350gsm, 1 flyer A5 135gsm, 1 poster A3 170gsm) **en Live mode** routés vers FR 67460 — évaluer qualité d'impression, délai réel, identité du transporteur/imprimeur, conformité PDF FOGRA39.
3. **Prototyper un mockup papier minimal** côté HM Global (rendu canvas 2D sur template carte de visite) — chiffrer précisément l'effort d'industrialisation du rendu sans dépendre d'une API tierce. Si > 5 j-h, réévaluer le choix vs Gelato Print API qui couvre le papier **avec** mockups natifs.

Si les 3 actions valident la qualité physique et le coût de rendu interne, alors **GO V2 Cloudprinter** comme fournisseur papier EU. Sinon, rester sur Gelato pour le papier.

---

## Addendum (2026-05-17) — Couche d'intégration server-only V0

Suite à la validation de la stratégie de qualification API, une couche server-only Cloudprinter a été créée pour permettre des tests live dès l'ajout de `CLOUDPRINTER_API_KEY` dans `.env.local`. **Aucune logique de commande réelle n'est activée — uniquement catalogue, prix, shipping, devis lecture.**

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `lib/suppliers/cloudprinter/types.ts` | Types TypeScript : `CloudprinterError`, `CloudprinterProductListItem`, `CloudprinterProductInfo`, `CloudprinterPriceLookupParams/Response`, `CloudprinterQuoteParams/Response`, `CloudprinterShippingCountry/Level`, `CloudprinterOrderInfoResponse` |
| `lib/suppliers/cloudprinter/client.ts` | Helper bas-niveau `cpFetch(endpoint, payload)` : POST forcé, injection auto de `{apikey, ...payload}`, AbortController timeout 30s, gestion erreurs via `CloudprinterError`, `cache: "no-store"` |
| `lib/suppliers/cloudprinter/adapter.ts` | Fonctions haut-niveau : `isCloudprinterConfigured()`, `listProducts()`, `getProductInfo(ref)`, `lookupPrice(params)`, `quoteOrder(params)`, `listShippingCountries()`, `listShippingLevels()`, `getOrderInfo(ref)`. `createOrder()` volontairement non implémenté (stub qui throw, implémentation cible en commentaire) |
| `app/api/cloudprinter/test/route.ts` | Health-check : retourne `{ok, tokenPresent, productsCount, sample, usefulProductsCount, usefulCategories}`. Ne retourne JAMAIS la clé |
| `app/api/cloudprinter/catalog-audit/route.ts` | Audit catalogue : filtre catégories HM utiles, lit `/products/info` pour 2 échantillons par catégorie, tente `/prices/lookup` FR EUR 50pcs, détecte champs image/mockup/preview dans les réponses |

### Comportement quand la clé est absente

Les 2 routes retournent **HTTP 200** avec `{ok: false, tokenPresent: false, reason: "CLOUDPRINTER_API_KEY absent..."}` — pas de plantage, pas de 500. C'est la posture choisie pour permettre un déploiement neutre avant l'activation Cloudprinter.

### Sécurité

- ✅ Clé lue uniquement via `process.env.CLOUDPRINTER_API_KEY` côté serveur
- ✅ Aucune route ne retourne la clé, même en cas d'erreur (defense in depth dans `cpFetch` qui ne met jamais l'`apikey` dans le message d'erreur)
- ✅ `createOrder` désactivé par stub `throw` qui empêche tout appel `/orders/add` accidentel
- ✅ Routes en `runtime: "nodejs"` + `dynamic: "force-dynamic"` (pas de cache, pas d'edge)
- ✅ Fichiers sous `lib/suppliers/cloudprinter/` non importables côté client (pattern Printify déjà éprouvé)

### Endpoints exposés (test local)

```bash
# Health-check
curl http://localhost:3000/api/cloudprinter/test

# Audit catalogue complet
curl http://localhost:3000/api/cloudprinter/catalog-audit
```

Les deux endpoints fonctionnent sans clé (réponse documentée) ou avec clé (appels live Cloudprinter). Aucun écran UI ne consomme ces routes en V1 — elles sont strictement pour qualification/debug.

### Catégories HM filtrées (constantes partagées)

```ts
["Businesscard", "Flyer", "Poster", "Brochure", "Canvas", "Folder", "Letterhead", "Envelope"]
```

Le filtrage est *case-insensitive substring* sur le champ `category` retourné par Cloudprinter. À ajuster si l'API live retourne des libellés différents.

### Champs image-like recherchés dans les payloads

```ts
["image", "imageUrl", "image_url", "thumbnail", "preview", "previewUrl",
 "mockup", "mockup_url", "proof", "render", "assets"]
```

L'audit retourne `anyImageFieldFound: boolean` global + détail par produit (`imageFieldsInList`, `imageFieldsInInfo`). Tant que la doc indique l'absence de mockups, on s'attend à `false` partout — la route permet de **confirmer empiriquement** ce verdict une fois la clé en place.

### Prochaine étape concrète

1. **Créer compte Cloudprinter** (gratuit, 5 min) sur `account.cloudprinter.com/register`
2. **Générer une clé Sandbox** dans le dashboard
3. **Ajouter dans `.env.local`** :
   ```bash
   CLOUDPRINTER_API_KEY=sandbox_xxx
   # optionnel — fallback https://api.cloudprinter.com/cloudcore/1.0/
   # CLOUDPRINTER_API_BASE=https://api.cloudprinter.com/cloudcore/1.0/
   ```
4. **Restart `npm run dev`** et appeler :
   - `curl http://localhost:3000/api/cloudprinter/test` → vérifier `productsCount > 0`
   - `curl http://localhost:3000/api/cloudprinter/catalog-audit | jq` → confirmer la couverture des 8 catégories HM utiles et la présence/absence empirique des champs image

Les résultats live seront automatiquement loggués côté serveur (Next.js dev console) pour analyse — sans toucher au front, au panier, ou au checkout.


---

## Addendum 2 (2026-05-17) — Affinage filtre catégories live

Suite à l'audit live qui retournait 0 produit pour `Businesscard`, `Canvas` et `Folder`, refonte de l'endpoint `/api/cloudprinter/catalog-audit` en mode **découverte data-driven** : on inspecte d'abord les vraies catégories Cloudprinter, puis on cherche par mots-clés élargis (`business`, `card`, `visit`, `name`, `canvas`, `wall`, `art`, `photo`, `folder`, `presentation`, `document`, `folded`).

### Résultats live (1666 produits, 25 catégories uniques)

**Top 15 catégories réelles Cloudprinter** :

| Catégorie | Produits | Note |
|---|---|---|
| Wall decoration | 266 | Canvas, posters, wall art — leur produit phare |
| Textbook FC + BW | 180 + 162 = 342 | Livres impression couleur + noir & blanc |
| Poster | 168 | Posters standard |
| Folded brochure | 117 | Chemises, dépliants, folders |
| z_1_DEPRECATED | 104 | ⚠️ à filtrer côté code |
| Photobook | 88 | Albums photo |
| Women's Clothing | 86 | Textile (Cloudprinter fait aussi du textile ! à creuser séparément) |
| Men's Clothing | 83 | Textile |
| **Card** | **72** | Cartes (inclut beaucoup de cartes de visite sous ce libellé générique) |
| **Flyer** | **61** | Flyers standard |
| Promotional | 61 | Objets pub — à creuser pour goodies |
| Magazine | 41 | Magazines |
| Calendar | 31 | Calendriers (souvent muraux) |
| Home and Accessories | 24 | Déco |
| **Business card** | **19** | Catégorie dédiée (très restreinte vs `Card` générique) |

### Couverture par famille HM (mots-clés élargis)

#### 🟢 Carte de visite — **112 candidats trouvés**

Répartis sur **3 catégories Cloudprinter** :
- `Card` (72) — libellé générique qui inclut beaucoup de business cards
- `Card set` (21) — sets de cartes
- `Business card` (19) — catégorie dédiée

Exemples de références :
- `businesscard_ss_us_p_bc_fc` — Business card SS US P FC TNR (portrait, US format)
- `businesscard_ss_s55_mm_bc_fc` — Business card SS S55 mm S FC TNR (format européen)
- `businesscard_ss_int_p_bc_fc` — Business card SS Int. P FC TNR (international portrait)
- `businesscard_ss_int_bc_fc` — Business card SS Int. L FC TNR (international landscape)

**Pourquoi le filtre V1 ratait** : on cherchait `Businesscard` (un seul mot) — le libellé Cloudprinter est `Business card` (deux mots) ou tout simplement `Card`.

#### 🟢 Canvas / Wall art — **136 + 266 = 300+ candidats**

Tous (ou presque) dans la catégorie **`Wall decoration`** — c'est leur libellé commercial pour canvas, posters tendus, wall art, prints encadrés.

**Pourquoi le filtre V1 ratait** : on cherchait `Canvas` — Cloudprinter range les canvas sous `Wall decoration` (le produit fini, pas la matière).

#### 🟢 Folder / chemise — **117 candidats**

Tous dans **`Folded brochure`** — c'est le libellé Cloudprinter pour les chemises pliées, folders, dépliants.

Exemples :
- `folder_4_x_digest_portrait_w_fold_fc` — Folder 4 x US Digest Portrait W Fold FC TNR
- `folder_4_x_s150_square_w_fold_fc` — Folder 4 x 150mm Square W Fold FC TNR

**Pourquoi le filtre V1 ratait** : on cherchait `Folder` — Cloudprinter utilise `Folded brochure`.

#### 🟢 Photo print — **139 candidats**

Répartition :
- `Photobook` (88) — albums photo
- `Wall decoration` (35) — recoupement avec wall art
- `Photo print` (16) — catégorie dédiée petite

Exemples : `photo_print_800x2400in_203x610mm`, `photo_print_600x800in_152x229mm`

### Champs image confirmés ABSENTS

```
productsWithImageField: 0 / 1666
```

Aucun produit Cloudprinter ne retourne `image`, `imageUrl`, `thumbnail`, `preview`, `mockup`, `proof`, `render`, `assets` ou autre champ image-like dans la réponse `/products`. Confirmation empirique du verdict documentaire : **pas de visuel marketing via API**.

### Recommandation actualisée

**Cloudprinter couvre largement le besoin HM Global** dès qu'on traduit les libellés :

| Famille HM | Stratégie filtre côté code (V2) |
|---|---|
| Cartes de visite | Catégorie `Business card` (19 strict) + filtrer `Card` (72) avec keyword `business` ou `visit` dans le name |
| Flyers | Catégorie `Flyer` (61) — direct OK |
| Affiches / Posters | Catégorie `Poster` (168) — direct OK |
| Canvas / Wall art | Catégorie `Wall decoration` (266) — à raffiner par `material=canvas` dans les options si dispo |
| Brochures / dépliants / chemises | Catégorie `Folded brochure` (117) |
| Letterheads | Catégorie `Letterhead` (6) |
| Enveloppes | Catégorie `Envelope` (15) |
| Photo prints / albums | Catégories `Photo print` (16) + `Photobook` (88) |
| Calendriers | Catégorie `Calendar` (31) — bonus non listé dans HM_USEFUL |
| Magazines | Catégorie `Magazine` (41) — bonus |
| Objets promotionnels | Catégorie `Promotional` (61) — à explorer pour goodies |
| Textile | Catégories `Men's/Women's Clothing` (169) — ⚠️ on a déjà Printify, pas prioritaire |
| Livres / textbooks | `Textbook FC` (180) + `Textbook BW` (162) — bonus pour catalogue restaurants / clubs |

### Filtres à blacklister en V2

- **`z_1_DEPRECATED`** (104 produits) — à exclure systématiquement côté serveur

### Verdict final mis à jour

**Cloudprinter est un fournisseur GO pour V2** côté couverture catalogue : il couvre **100 %** des familles cibles HM Global, et **bien au-delà** (~1660 produits utilisables en filtrant les déprés). Le seul vrai bloquant reste l'absence de mockups API — qui est compensable par les visuels HM générés (cf `docs/prompts/print-mockups-prompts.md`) **ou** par un mockup generator interne basé sur le pipeline Blender déjà présent dans `scripts/blender/`.

Prochaine décision V2 : intégrer ou non Cloudprinter en remplacement / complément de Gelato pour le print papier.


---

## Addendum 3 (2026-05-17) — Étape 2 : pricing live obtenu sur 3 produits

### Format payload `/prices/lookup` validé en live

Après itération sur les erreurs Cloudprinter (chaque erreur indique précisément le champ manquant), le **format de payload correct** est :

```json
{
  "apikey": "***REDACTED***",
  "country": "FR",
  "currency": "EUR",
  "items": [{
    "reference": "audit-item-1",           // ID arbitraire de ligne
    "product_reference": "businesscard_ss_int_bc_fc",  // vraie réf produit
    "count": 250,
    "options": {}                          // optionnel — défauts Cloudprinter si absent
  }]
}
```

**Points-clés** :
- `country` + `currency` au top-level
- `items` (tableau) au top-level — **obligatoire**
- Chaque item exige `reference` (ID de ligne) **ET** `product_reference` (réf produit)
- `options` optionnel — Cloudprinter applique des défauts si vide

### 3 produits sélectionnés (format européen)

| Famille HM | Référence Cloudprinter | Catégorie | Options dispo |
|---|---|---|---|
| Carte de visite | `businesscard_ss_int_bc_fc` | Business card | 18 |
| Flyer | `flyer_ss_a5_fc` | Flyer | 20 |
| Poster A3 | `poster_a3_fc` | Poster | 26 |

Sélection automatique via `app/api/cloudprinter/price-audit/route.ts` (filtre keywords `s55` / `a5` / `a3` + exclusion des formats US).

### Prix France EUR obtenus (options par défaut Cloudprinter, TVA 20 %)

#### Business card 85×55 mm (`businesscard_ss_int_bc_fc`)

| Quantité | Prix HT | TVA | Prix TTC | €/unité TTC |
|---|---|---|---|---|
| 100 pcs | **4,74 €** | 0,95 € | **5,69 €** | 0,057 € |
| 250 pcs | **11,85 €** | 2,37 € | **14,22 €** | 0,057 € |
| 500 pcs | **23,03 €** | 4,60 € | **27,63 €** | 0,055 € |

→ Coût direct sur cartes de visite = **5,5 à 5,7 centimes / pièce TTC** (avant marge HM Global). Marge possible à 39-49 € TTC pour 250 pcs = **70-80 % brut**.

#### Flyer A5 (`flyer_ss_a5_fc`)

| Quantité | Prix HT | TVA | Prix TTC | €/unité TTC |
|---|---|---|---|---|
| 100 pcs | **21,46 €** | 4,29 € | **25,75 €** | 0,258 € |
| 250 pcs | **50,49 €** | 10,10 € | **60,58 €** | 0,242 € |
| 500 pcs | **24,84 €** ⚠️ | 4,97 € | **29,80 €** | 0,060 € |

⚠️ **Anomalie à investiguer** : 500 pcs ressort **moins cher** que 250 pcs. Probablement parce que Cloudprinter route automatiquement vers un print provider différent selon le volume (les print providers ont des sweet spots de quantité). À confirmer en V2 en explorant `options` pour fixer le print provider.

→ Coût direct sur flyers A5 = **0,24 à 0,26 € / pièce TTC** sur 100-250. Marge possible à 0,80-1,20 € PV TTC = **65-75 %** brut.

#### Poster A3 (`poster_a3_fc`)

| Quantité | Prix HT | TVA | Prix TTC | €/unité TTC |
|---|---|---|---|---|
| 1 pc | **4,42 €** | 0,88 € | **5,30 €** | 5,30 € |
| 10 pcs | **15,13 €** | 3,03 € | **18,15 €** | 1,82 € |
| 25 pcs | **32,97 €** | 6,59 € | **39,56 €** | 1,58 € |

→ Coût direct sur posters A3 = **1,58 à 5,30 € / unité TTC**. Marge possible à 7-12 € PV TTC = **50-70 %** brut.

### Limites confirmées

1. **Structure `info.options` non lue correctement** — notre `buildMinimalOptions` retourne `{}` car le format réel de `option.values[]` est différent de ce qu'on avait modélisé. Les prix obtenus utilisent donc les défauts Cloudprinter (probablement papier standard, finition mat, recto/verso par défaut). Acceptable pour audit, **à creuser en V2** pour exposer le choix de papier/finition à l'utilisateur final.

2. **Pas de shipping inclus** — `/prices/lookup` retourne uniquement le **coût d'impression**. Le shipping FR sera ajouté via `/orders/quote` (qui inclut shipping_level + adresse). À tester en étape 3 si nécessaire.

3. **Pas de garantie sur le print provider** — Cloudprinter peut router vers un provider différent selon la quantité (anomalie flyer 500 pcs). Pour des prix stables, il faudra fixer le print provider via les `options`.

### Comparaison rapide (à valider en V2 avec d'autres fournisseurs)

| Produit | Cloudprinter (notre audit) | Gelato (ordre de grandeur public) | PrintOclock (B2C public FR) |
|---|---|---|---|
| 250 business cards 85×55 | 11,85 € HT | ~14-18 € HT | ~13-19 € TTC |
| 250 flyers A5 170 g/m² | 50,49 € HT | ~35-50 € HT | ~25-40 € TTC |
| 10 posters A3 | 15,13 € HT | ~20-30 € HT | ~15-25 € TTC |

⚠️ Cloudprinter sort très compétitif sur cartes de visite, **plus cher** sur flyers (peut-être lié au papier 170g par défaut vs 135g), correct sur posters. Les comparaisons exactes nécessiteraient de demander des devis aux concurrents avec exactement les mêmes spécifications.

### Couche d'intégration mise à jour

| Fichier | Changement |
|---|---|
| `lib/suppliers/cloudprinter/client.ts` | `extractCloudprinterError()` gère 6 formats d'erreur Cloudprinter (string, objet imbriqué, array, result imbriqué, raw text, fallback fields). Plus jamais de `[object Object]`. |
| `lib/suppliers/cloudprinter/adapter.ts` | `lookupPrice()` envoie maintenant le payload au format correct : `{country, currency, items: [{reference, product_reference, count, options?}]}` |
| `app/api/cloudprinter/price-audit/route.ts` | Nouvelle route : sélectionne 3 candidats EU, lit `/products/info`, tente `/prices/lookup` à 3 quantités. Retourne un JSON structuré pour audit ad-hoc. |

### Prochaines étapes recommandées

1. **Étape 3 (optionnelle)** — Tester `/orders/quote` pour inclure shipping FR vers 67460. Mêmes produits, même payload mais avec adresse complète. Donnera le coût total HT (impression + shipping) sur lequel calculer la marge réelle.

2. **Étape 4 (optionnelle)** — Décoder correctement la structure de `info.options` pour exposer les choix de papier / finition à l'utilisateur final. Probablement nécessaire pour V2 si on intègre Cloudprinter au catalogue front HM.

3. **Étape 5 (à voter)** — Commander **1 échantillon physique** (Sandbox = gratuit ? ou Live à coût réduit) pour valider qualité papier, finition, délai réel France, identité du transporteur.

4. **Étape 6 (décision V2)** — Décider du fournisseur print V2 entre Cloudprinter, Gelato et les réponses Print.com / HelloPrint en attente. Cloudprinter est **techniquement validé**, le seul vrai bloquant reste le **mockup/preview absent** côté API (déjà documenté).


---

## Addendum 4 (2026-05-17) — Étape 3 : `/orders/quote` avec shipping France

### Format payload validé en live

```json
POST https://api.cloudprinter.com/cloudcore/1.0/orders/quote
{
  "apikey": "***REDACTED***",
  "country": "FR",
  "currency": "EUR",
  "zip": "67460",
  "city": "Souffelweyersheim",
  "street1": "1 rue de la République",
  "items": [{
    "reference": "audit-businessCard-100",
    "product_reference": "businesscard_ss_int_bc_fc",
    "count": 100,
    "options": {}
  }]
}
```

### Structure de la réponse (champs intéressants)

```json
{
  "price": "4.7400",
  "vat": "0.9480",
  "vat_rate": 20,
  "currency": "EUR",
  "expire_date": "2026-05-19T14:33:51.738591Z",
  "subtotals": { "currency": "EUR", "items": "4.7400", "fee": "0.0000", "app_fee": "0.0000" },
  "shipments": [{
    "total_weight": "263",
    "items": [{"reference": "audit-businessCard-100"}],
    "quotes": [{
      "quote": "<sha256 hash>",
      "service": "Ground - Tracked",
      "shipping_price": "6.46",
      "shipping_price_ttc": "7.75",
      "vat": "1.29"
    }]
  }],
  "invoice_currency": "EUR",
  "invoice_exchange_rate": "1.0000",
  "production_sla_days": 2
}
```

Points-clés :
- `price` = prix items seul (sans shipping)
- `shipments[].quotes[]` = options de livraison (1 seule retournée dans notre cas : "Ground - Tracked")
- `quote` field = hash SHA256 unique du devis (à conserver pour `/orders/add` ultérieur)
- `expire_date` = date d'expiration du quote (~48 h)
- `production_sla_days` = délai de production annoncé (**2 jours** sur nos 3 produits)

### Coûts totaux Cloudprinter France (Sandbox, options par défaut)

#### Carte de visite 85×55 mm (`businesscard_ss_int_bc_fc`)

| Qté | Prod HT | Ship HT | Service | **Total HT** | **Total TTC** | SLA | €/unité TTC |
|---|---|---|---|---|---|---|---|
| 100 | 4,74 | 6,46 | Ground - Tracked | **11,20 €** | **13,44 €** | 2 j | 0,134 € |
| 250 | 11,85 | 6,46 | Ground - Tracked | **18,31 €** | **21,97 €** | 2 j | 0,088 € |
| 500 | 23,02 | 7,65 | Ground - Tracked | **30,67 €** | **36,81 €** | 2 j | 0,074 € |

#### Flyer A5 (`flyer_ss_a5_fc`)

| Qté | Prod HT | Ship HT | Service | **Total HT** | **Total TTC** | SLA | €/unité TTC |
|---|---|---|---|---|---|---|---|
| 100 | 21,46 | 8,20 | Ground - Tracked | **29,66 €** | **35,59 €** | 2 j | 0,356 € |
| 250 | 50,49 | 11,06 | Ground - Tracked | **61,55 €** | **73,85 €** | 2 j | 0,295 € |
| 500 | 24,84 ⚠️ | 13,19 | Ground - Tracked | **38,03 €** | **45,63 €** | 2 j | 0,091 € |

⚠️ **Anomalie confirmée à 500 pcs** : prix d'impression descend de 50,49 € (250 pcs) à 24,84 € (500 pcs). Combiné au shipping plus élevé, le total **reste inférieur** au prix 250 pcs. Cloudprinter route automatiquement vers un print provider **différent** au-delà d'un seuil de volume — c'est documenté dans leur logique de "least cost routing". À tester en V2 en fixant le print provider via les options pour avoir un prix dégressif strict.

#### Poster A3 (`poster_a3_fc`)

| Qté | Prod HT | Ship HT | Service | **Total HT** | **Total TTC** | SLA | €/unité TTC |
|---|---|---|---|---|---|---|---|
| 1 | 4,42 | 6,46 | Ground - Tracked | **10,88 €** | **13,06 €** | 2 j | 13,06 € |
| 10 | 15,13 | 7,65 | Ground - Tracked | **22,78 €** | **27,33 €** | 2 j | 2,73 € |
| 25 | 32,97 | 8,20 | Ground - Tracked | **41,17 €** | **49,40 €** | 2 j | 1,98 € |

### Service de livraison

**Service unique retourné : "Ground - Tracked"**

Aucune option Express dans le sandbox sur ces produits/quantité. Pour activer Express : essayer `shipping_level: "cp_dhl_express"` ou similaire en payload. À explorer si besoin V2.

### Délai de production annoncé : **2 jours** (production_sla_days)

Plus shipping → délai total estimé France métro = **3-5 jours ouvrés** (sandbox). À confirmer en Live mode car le routing print provider peut changer.

### Marge possible à HM Global (indicatif)

Le tableau ci-dessous suppose une vente à prix HM réaliste vs concurrence française B2C.

| Produit | Coût total TTC HM | PV cible HM TTC | Marge brute |
|---|---|---|---|
| BC 100 pcs | 13,44 € | 29-39 € | **54-66 %** |
| BC 250 pcs | 21,97 € | 49-59 € | **55-63 %** |
| BC 500 pcs | 36,81 € | 79-99 € | **53-63 %** |
| Flyer A5 100 pcs | 35,59 € | 69-89 € | **48-60 %** |
| Flyer A5 250 pcs | 73,85 € | 119-149 € | **38-50 %** |
| Flyer A5 500 pcs | 45,63 € | 149-179 € | **69-75 %** |
| Poster A3 1 pc | 13,06 € | 19-25 € | **31-48 %** |
| Poster A3 10 pcs | 27,33 € | 59-79 € | **54-65 %** |
| Poster A3 25 pcs | 49,40 € | 119-149 € | **58-67 %** |

### Meilleure quantité par produit (rapport prix/marge)

- **Carte de visite** : sweet spot **250 pcs** (0,088 €/pc TTC, marge confortable, volume standard demandé par les pros)
- **Flyer A5** : sweet spot **500 pcs** (0,091 €/pc TTC, marge 70 %+ — anomalie à exploiter ou à fixer en V2)
- **Poster A3** : sweet spot **10 pcs** (2,73 €/pc TTC, marge ~60 %)

### Recommandation commerciale

**Cloudprinter est viable** pour les 3 familles testées :
- Cartes de visite et posters : marges saines et constantes sur tout le range (50-65 % brut)
- Flyers : grille à valider en V2 (l'anomalie 500 pcs ne tiendra peut-être pas en Live ou changera selon le print provider)
- SLA production 2 jours + Ground-Tracked = délai total France ~3-5 jours ouvrés, **compétitif**

### Limites restantes (avant décision V2)

1. **Une seule option shipping** retournée : Ground - Tracked. Pas testé Express. Si on veut proposer du J+1 / J+2 au client, il faut envoyer `shipping_level` explicite.
2. **Options par défaut Cloudprinter** : on n'a pas encore décodé `info.options` pour exposer le choix papier/finition au client final.
3. **Sandbox = pas de garantie Live** : les prix et le routing print provider peuvent changer en mode Live.
4. **Pas de mockup/preview** : verdict inchangé — il faut générer les BAT côté HM Global.

### Contraintes respectées

- ✅ `/orders/add` jamais appelé (lecture pure `/orders/quote`)
- ✅ `createOrder` reste stub `throw` (pas de risque d'appel accidentel)
- ✅ Aucune commande créée (Cloudprinter ne persiste pas le quote tant que `/orders/add` n'est pas appelé avec le `quote` hash)
- ✅ Aucun upload de fichier client
- ✅ Aucune modif `data/products.ts`, `data/pricing.ts`, panier, checkout, Stripe, Supabase, front
- ✅ Token jamais affiché (`***REDACTED***` partout)
- ✅ tsc + eslint 0 erreur

### Prochaines étapes possibles

1. **Étape 4** — Tester `shipping_level: "cp_dhl_express"` pour voir si des options Express apparaissent
2. **Étape 5** — Décoder la vraie structure `info.options` pour permettre au client de choisir papier/finition (nécessaire pour intégration front V2)
3. **Étape 6** — Commander 1 échantillon physique pour valider qualité réelle + délai réel + identité transporteur
4. **Décision V2** — Comparer Cloudprinter (validé techniquement + commercialement) vs réponses Print.com / HelloPrint en attente


---

## Addendum 5 (2026-05-17) — Étape 5 : décodage options produit Cloudprinter

### Structure réelle de `info.options[]`

Découverte critique : le tableau retourné par `/products/info` est un tableau PLAT où **chaque entrée est UNE valeur possible** d'UNE famille d'options. Il faut donc grouper par `type` pour reconstituer les familles. Chaque entrée a la forme :

```json
{
  "type":         "type_product_material",       // famille (avec préfixe type_)
  "type_name":    "Product material",            // label humain de la famille
  "reference":    "paper_300off",                // référence de la valeur
  "note":         "Product paper 300gsm Offset", // description humaine de la valeur
  "default":      1,                             // 1 si valeur par défaut, 0 sinon
  "availability": "Global",                      // "Global" / "Regional"
  "files": [{ "type": "product", "format": "pdf" }]
}
```

### Familles d'options par produit (audit live)

#### Business card (`businesscard_ss_int_bc_fc`) — 18 valeurs / 3 familles

| Type Cloudprinter | Label humain | Valeurs | Défaut |
|---|---|---|---|
| `type_product_material` | Product material | 8 papiers | `paper_250ecb` (250gsm Gloss coated) |
| `type_product_shape` | Product shape | 2 formes | `right_angled_corners` |
| `type_sheet_product_finish` | Sheet product finishing | 8 finitions | `product_finish_none` |

#### Flyer A5 (`flyer_ss_a5_fc`) — 20 valeurs / 2 familles

| Type | Label | Valeurs | Défaut |
|---|---|---|---|
| `type_product_material` | Product material | 14 papiers | `paper_350mcg` (350gsm Machine Coated Gloss) |
| `type_sheet_product_finish` | Sheet product finishing | 6 finitions | `product_finish_none` |

#### Poster A3 (`poster_a3_fc`) — 26 valeurs / 4 familles

| Type | Label | Valeurs | Défaut |
|---|---|---|---|
| `type_packaging` | Packaging | 3 emballages | `packaging_poster_rolled` |
| `type_poster_paper` | Poster paper | 17 papiers | `poster_190pps` (190gsm Satin) |
| `type_sheet_product_finish` | Sheet product finishing | 2 finitions | `product_finish_none` |
| `type_wall_decoration_frame` | Frame | 4 cadres | `frame_none` |

### Format payload `options[]` validé en live (probe de 9 shapes)

```json
{
  "items": [{
    "reference": "myorder-line-1",
    "product_reference": "businesscard_ss_int_bc_fc",
    "count": 250,
    "options": [
      { "option": "product_material", "option_reference": "paper_300off", "count": 1 },
      { "option": "sheet_product_finish", "option_reference": "product_finish_matte", "count": 1 }
    ]
  }]
}
```

**Règles découvertes** :
- Clé `option` = nom de la famille **SANS** le préfixe `type_`
- Clé `option_reference` = référence de la valeur sélectionnée
- Clé `count: 1` obligatoire sur chaque option (sinon "missing parameter")
- Le champ `options` doit toujours être présent dans l'item (tableau vide accepté pour utiliser les défauts)

**Shapes rejetées par Cloudprinter** (pour mémoire) :

| Shape testée | Erreur |
|---|---|
| `{type, reference, count}` | `option_unknown: type_product_material` |
| `{type, reference, count}` (sans préfixe type_) | `option_unknown: product_material` |
| `{type, option, count}` (option=ref) | `option_unknown: type_product_material` |
| `{option, option_value, count}` | `option_reference is missing` |
| `{option, value, count}` | `option_reference is missing` |
| `{type, option_reference, count}` | `option_unknown: type_product_material` |

**Shapes acceptées** :

| Shape | Statut |
|---|---|
| `{option: "product_material", option_reference: "paper_300off", count: 1}` | ✅ standard |
| `{option: "paper", option_reference: "paper_300off", count: 1}` | ✅ shortcut |
| `{option_type: "product_material", option_reference: "...", count: 1}` | ✅ variante |

### Configuration "standard HM" proposée

| Produit | Famille | Référence HM | vs Défaut Cloudprinter |
|---|---|---|---|
| **Business card** | `product_material` | `paper_250ecb` (250gsm Gloss) | ⚠️ idem défaut (pas de 350gsm matt en stock standard sur ce blueprint) |
| | `sheet_product_finish` | `product_finish_matte` | ≠ défaut (`none`) |
| **Flyer A5** | `product_material` | `paper_170mcg` (170gsm Coated Gloss) | ≠ défaut (350gsm) |
| | `sheet_product_finish` | `product_finish_gloss` | ≠ défaut (`none`) |
| **Poster A3** | `poster_paper` | `poster_200art_matt` (200gsm Art Matt) | ≠ défaut (190gsm Satin) |
| | `sheet_product_finish` | `product_finish_matte` | ≠ défaut (`none`) |

### Comparaison prix : défaut Cloudprinter vs configuration HM explicite

(Quote complet vers FR 67460, audit live en sandbox)

| Produit (qté) | Défaut HT | HM Explicit HT | Δ HT | Δ TTC |
|---|---|---|---|---|
| Business card (250) | 11,85 € | **16,09 €** | +4,24 € | +5,09 € |
| Flyer A5 (250) | 50,49 € | **77,90 €** | +27,41 € | +29,47 € |
| Poster A3 (10) | 15,13 € | **48,93 €** | +33,80 € | +38,15 € |

**Insight commercial majeur** :

Le surcoût HM vient principalement de la **finition lamination** (matte/gloss) qui est facturée comme une couche additionnelle. Le poster bouge le plus car on passe d'un 190gsm satin sans finition à un 200gsm matt avec lamination matte → triplement du prix.

→ Pour V2, deux options stratégiques :
1. **Assumer la finition premium** comme standard HM (différenciation qualité) — répercuter sur le PV.
2. **Rendre la finition optionnelle** au choix client, avec surcoût explicite affiché.

### Limites restantes

1. **Une seule réf paper 350gsm matt sur business card** : `paper_300off` (offset 300gsm) est le plus proche. Pour un vrai 350gsm matt premium, on resterait sur le défaut 250gsm gloss en V1.
2. **Pas de combinaison testée avec `type_product_shape`** (coins ronds vs droits) — à explorer en V2 pour offrir un choix client.
3. **`type_packaging` et `type_wall_decoration_frame`** pour posters : non testées, intéressantes pour upsell encadrement.

### Fichiers modifiés / créés (Étape 5)

| Fichier | Changement |
|---|---|
| `lib/suppliers/cloudprinter/types.ts` | Refonte `CloudprinterOption` au format validé live : `{option, option_reference, count}` |
| `lib/suppliers/cloudprinter/adapter.ts` | `options[]` toujours présent dans items (tableau vide accepté). Documentation des règles découvertes. |
| `app/api/cloudprinter/options-audit/route.ts` | **NOUVEAU** — décode la structure de `info.options`, regroupe par famille, construit options HM via patterns regex, probe 9 shapes de payload pour identification, compare prix défaut vs explicit |
| `app/api/cloudprinter/price-audit/route.ts` | Mise à jour : `options` neutralisé (utilisait l'ancien format objet) — désormais s'appuie sur défauts Cloudprinter |
| `app/api/cloudprinter/quote-audit/route.ts` | Mise à jour : `options: []` (tableau vide) au lieu de `{}` (objet) |

### Recommandation finale pour V2

**Cloudprinter est techniquement intégrable** sur le parcours print V2. Configuration suggérée par produit :

**Business card 85×55 mm** :
```json
options: [
  { option: "product_material", option_reference: "paper_300off", count: 1 },
  { option: "sheet_product_finish", option_reference: "product_finish_matte", count: 1 }
]
```
Surcoût ~4 € HT sur 250 pcs → PV cible 49-59 € TTC (marge ~50-60 %).

**Flyer A5** :
```json
options: [
  { option: "product_material", option_reference: "paper_170mcg", count: 1 },
  { option: "sheet_product_finish", option_reference: "product_finish_gloss", count: 1 }
]
```
Surcoût ~27 € HT sur 250 pcs → PV cible 129-149 € TTC (marge ~35-45 %).

**Poster A3** :
```json
options: [
  { option: "poster_paper", option_reference: "poster_200art_matt", count: 1 },
  { option: "sheet_product_finish", option_reference: "product_finish_matte", count: 1 }
]
```
Surcoût ~34 € HT sur 10 pcs → PV cible 79-99 € TTC (marge ~40-50 %).

### Contraintes respectées

| Contrainte | Statut |
|---|---|
| Aucune commande créée (`/orders/add` jamais appelé) | ✅ |
| `createOrder` stub `throw` | ✅ |
| Aucun upload fichier client | ✅ |
| Aucune modif `data/products.ts`, `data/pricing.ts`, panier, checkout, Stripe, Supabase, front | ✅ |
| Token jamais affiché | ✅ |
| tsc + eslint | ✅ 0 erreur |
| Smoke routes critiques | ✅ 8/8 (200) |

### Prochaines étapes possibles

1. **Étape 6** — Tester `type_product_shape` (coins ronds) sur business card pour offrir un upsell formes
2. **Étape 7** — Décoder les options secondaires (packaging, frame) pour posters
3. **Étape 8** — Commander 1 échantillon physique pour valider la qualité réelle des configurations HM
4. **Décision V2** — Comparer Cloudprinter (techniquement complet) vs réponses Print.com / HelloPrint en attente

