# Audit Printify EU — 4 nouvelles catégories produits

> **Date :** 2026-05-18
> **Demande :** identifier les produits viables pour HM Global V1 dans 4 nouvelles catégories : casquettes, gourdes/bouteilles inox, tote bags, chaussures de sécurité.
> **Statut :** audit pur — **aucune modification de code, catalogue, pricing, Stripe, Supabase, routes API**.
> **Sources :** `tmp/audit-equivalents.json`, `tmp/audit-equivalents-phase2.json`, `docs/audits/printify-equivalents-cotton-polo.md`, catalogue Printify (1379 blueprints scannés au 2026-05-17).

---

## TL;DR — verdict en une ligne par catégorie

| Catégorie | Viable Printify V1 ? | Recommandation |
|---|---|---|
| **Casquettes personnalisées** | ❌ NON | Devis-only OU partenariat hors Printify (Atlantis Headwear / fournisseur direct) |
| **Gourdes / bouteilles inox** | ❌ NON | Devis-only OU goodies-distributeur EU direct |
| **Tote bags** | ✅ **OUI (1 candidat EU validé)** | **Westford Mill Organic Cotton Tote (bp 731) chez Textildruck DE** — à intégrer V1 |
| **Chaussures de sécurité** | ❌ NON (hors catalogue POD) | **Devis-only obligatoire** — produit industriel, distribution grossiste EU uniquement |

---

## 1. Casquettes personnalisées — ❌ NON viable Printify EU

### État du catalogue Printify

**20 blueprints casquette identifiés** dans le scan complet. **0 qualifié EU.**

| bp_id | Brand | Modèle |
|------:|-------|--------|
| 1108 | OTTO Cap | Low Profile Baseball Cap |
| 1128 | OTTO Cap | Trucker Caps |
| 1221 | ValuCap | Dad Hat Leather Patch (Rectangle) |
| 1287 | ValuCap | Dad Hat Leather Patch (Round) |
| 1395 | District | Unisex Distressed Cap |
| 1446 | Yupoong | Snapback Trucker Cap |
| 1447 | Yupoong | Classic Dad Cap |
| 1526 | Yupoong | Flat Bill Snapback |
| 1583 | AS Colour | Surf Cap |
| 1692 | Yupoong | Trucker Retro Hat |
| 1698 | AS Colour | Bucket Hat |
| 1703 | Yupoong | Unisex Snapback Hat |
| 1729 | OTTO Cap | Distressed Dad Hat (Embroidery) |
| 1734 | Yupoong | 5 Panel Trucker Cap |
| 1735 | OTTO Cap | Foam Trucker Hat |
| 1736 | OTTO Cap | Vintage Cap (Embroidery) |
| 1741 | Econscious | Organic Baseball Cap (Embroidery) |
| 1742 | Big Accessories | Vintage Corduroy Cap (Embroidery) |
| 1743 | Richardson | Snapback Trucker Cap |
| 1744 | Flexfit | Closed-Back Structured Cap (Embroidery) |

### Vérifications providers explicites (phase 2)

Échantillon vérifié sur 3 blueprints représentatifs :

| bp_id | Brand | Providers réels | EU ? |
|------:|-------|-----------------|-----:|
| 1108 | OTTO Low Profile | Printify Choice (99) · Duplium (41) | NON |
| 1446 | Yupoong Snapback | Printify Choice (99) · Fulfill Engine (217) | NON |
| 1447 | Yupoong Dad Cap | Printify Choice (99) · Printful (410) · Fulfill Engine (217) | NON |
| 1744 | Flexfit Structured | Printful (410) · Printify Choice (99) | NON |

**Diagnostic :** toutes les casquettes Printify passent par Printify Choice (US default), Fulfill Engine (US), Duplium (CZ — mais sans cap dans leur sous-catalogue actif), ou Printful (qui route lui-même US/EU selon shipping).

### Marques pro EU absentes du catalogue Printify

| Marque | Présence Printify | Pourquoi |
|---|---|---|
| **Beechfield Headwear** | ❌ Absent | Distribution exclusive grossistes EU (Falk & Ross, TopTex) |
| **Atlantis Headwear** | ⚠️ Présent uniquement en **beanie** (bp 1922), pas en cap | — |
| **Result Headwear** | ❌ Absent | Idem Beechfield |
| **Sol's caps (Buzz)** | ❌ Absent | SOL'S non référencé Printify |
| **B&C caps** | ❌ Absent | B&C non référencé sur ce produit |

### Verdict casquettes

**Aucun provider EU exploitable.** Conclusions possibles :

1. **Garder hors V1** — pas de casquette dans le catalogue HM Global pour l'instant.
2. **Mode devis-only** — ajouter une fiche produit `quoteOnly: true` avec photo de packshot Beechfield/Atlantis. Route les demandes vers TopTex (broderie locale).
3. **Partenariat direct fournisseur** — TopTex (déjà partenaire), Falk & Ross, ou brodeur Alsace local.

**Risque marge/qualité/délai si on tentait Printify quand même :**
- Marge : amputée par double commission Printify + Printful
- Qualité : variable selon provider (Fulfill Engine = qualité moyenne en sublimation)
- Délai : 14-21 j US + customs FR = **inacceptable B2B France**

---

## 2. Gourdes / bouteilles inox personnalisées — ❌ NON viable Printify EU

### État du catalogue Printify

**20 blueprints water bottle identifiés. 0 qualifié EU.**

| bp_id | Brand | Modèle |
|------:|-------|--------|
| 353 | Generic | Tumbler 20oz |
| 354 | Generic | Tumbler 10oz |
| 482 | Generic | 20oz Insulated Bottle |
| 572 | Generic | Copper Vacuum Insulated 22oz |
| 597 | CamelBak | Eddy Water Bottle 20oz/25oz |
| 604 | Generic | Vacuum Insulated Tumbler 11oz |
| 614 | Generic | Kensington Tritan Sport 20oz |
| 620 | Generic | Chill Wine Tumbler |
| 646 | Generic | Slim Water Bottle |
| 693 | Generic | Copper Vacuum Tumbler 22oz |
| 716 | Generic | Sky Water Bottle |
| 854 | Generic | Stainless Steel Handle Lid |
| 873 | Generic | Stainless Steel Sports Lid |
| 887 | Generic | Stainless Steel Standard Lid |
| 892 | Generic | Stainless Steel Water Bottle |
| 953 | Generic | Tritan Water Bottle |
| 966 | Generic | Vagabond 20oz Tumbler |
| 1139 | ORCA Coatings | Stainless Steel With Straw 20oz |
| 746 | Generic | Plastic Tumbler with Straw |
| 649 | Generic | Bottle Opener |

### Diagnostic

Tous les blueprints "water bottle" sont en **sublimation** chez des providers US (Fulfill Engine, Printify Choice, Duplium DRO US-side). Aucun fabricant EU dédié.

CamelBak (bp 597) est une marque pro reconnue mais distribuée en EU via les grossistes (et non Printify).

### Marques EU absentes

| Marque | Présence Printify |
|---|---|
| **Mepal** (NL) | ❌ Absent |
| **Hydro Flask** (US) | ❌ Absent même côté US Printify (distribution exclusive) |
| **Klean Kanteen** | ❌ Absent |
| **Chilly's Bottles** (UK) | ❌ Absent |
| **24Bottles** (IT) | ❌ Absent |

### Verdict gourdes

**Devis-only ou hors catalogue.** Pour HM Global, le marché gourde personnalisée B2B (corporate, événementiel) passe par :

1. **TopTex Goodies / Pencarrie** — Buzz, Mepal, Stanley, KOOR via leur partenariat sublimation/laser
2. **Sourcing direct grossiste EU** — un brodeur/marqueur local peut faire la gravure laser sur gourde inox blanche
3. **Goodies POD spécialiste** — sans Printify (ex : Maxilia, Cadeaux24, EuroGifts)

**Risque marge/délai si Printify :**
- Coût sublimation US à l'unité : 8-15 €
- Transport transatlantique + customs : 6-10 € + 14-21 j
- PV TTC ne devient rentable qu'à 28-35 € → marge faible, prix client peu attractif

---

## 3. Tote bags — ✅ OUI viable Printify EU

### État du catalogue Printify

**15 blueprints tote bag identifiés. 2 qualifiés EU.**

| bp_id | Brand | Modèle | EU ? |
|------:|-------|--------|-----:|
| 507 | Generic | Canvas Tote 5-Color Straps | non |
| 553 | AS Colour | Cotton Tote Bag | non |
| 609 | Econscious | Organic Canvas Tote | non |
| 707 | Generic | Wine Tote Bag | non |
| **731** | **Westford Mill®** | **Organic Cotton Tote Bag** | **✓ OUI** |
| 826 | Generic | Double Wine Tote | non |
| **836** | Generic | **Shoulder Tote Bag (AOP)** | **✓ OUI (qualifié)** |
| 1090 | S&S Bags | Natural Tote Bag | non |
| 1288 | Generic | Weekender Tote Bag | non |
| 1300 | Generic | Adjustable Tote (AOP) | non |
| 1313 | Liberty Bags | Cotton Canvas Tote | non |
| 1389 | Generic | Tote Bag (AOP) | non |
| 1920 | Econscious | Eco Tote Bag | non |
| 2021 | Generic | Beach Holographic Tote | non |
| 5363 | Generic | Woven Straw Tote | non |

### Détails — bp 731 Westford Mill Organic Cotton Tote (recommandé V1)

- **Marque** : Westford Mill® — fabricant pro UK/EU standard B2B, ligne EarthAware™ Organics
- **Provider EU** : Textildruck Europa (id 26) — DE
- **Pays de production** : Allemagne
- **Caractéristiques typiques** : coton bio certifié, 140-180 g/m², dim. 38×42 cm standard, anses 70 cm
- **Mockups** : non récupérés en phase 1 (budget API limité) — **à générer/upload V1**
- **Personnalisation** : DTG (impression numérique direct), zone large 30×35 cm
- **Couleurs** : naturel, noir, gris (à confirmer phase 2 si on intègre)
- **Prix coût estimé** : 6-9 € TTC (à confirmer via call API si intégration)
- **Délai** : 5-9 j (Textildruck DE → FR)

### Détails — bp 836 Generic Shoulder Tote AOP (qualifié EU mais à éviter)

- "Generic brand" + AOP (All Over Print) sublimation → coton synthétique, qualité moindre
- À écarter au profit de bp 731 (Westford Mill = vraie marque)

### Risques bp 731 Westford Mill

| Risque | Niveau |
|---|---|
| Marge | Faible — cost ~7 € permet PV 14-19 € TTC unitaire, marge confortable dès quantité 50+ |
| Qualité | Faible risque — Westford Mill est référence UK pour tote bio |
| Délai | Faible risque — Textildruck DE = 5-9 j |
| Mockup | Moyen — à générer (pas inclus phase 1 audit) |
| Stock | Faible risque — Westford Mill bien distribué |

### Verdict tote bags

**À intégrer V1 si tu veux ouvrir cette catégorie.**

**Action concrète possible (hors scope cet audit — à valider séparément) :**
1. Commande échantillon physique 1 unité (coût ~20 € avec shipping)
2. Validation qualité visuelle (toucher coton, finition coutures, rendu DTG)
3. Si OK : création produit `PRODUCT_WESTFORD_MILL_731` dans `data/products.ts`
4. Génération mockups Westford Mill (3-4 couleurs × 2 vues = 6-8 visuels)
5. Pricing : ajouter `WESTFORD_MILL_PRICES` dans `data/pricing.ts`

---

## 4. Chaussures de sécurité — ❌ Hors catalogue Printify

### État du catalogue Printify

**Aucun blueprint chaussure de sécurité** dans les 1379 blueprints scannés. Catégorie absente du POD Printify (et de tous les POD majeurs : Printful, Spreadshirt, Gelato).

**Pourquoi ?**
- Produit **industriel** (norme EN ISO 20345 obligatoire)
- Stock par taille/largeur (40-46+ avec semelle anti-perforation, coque acier/composite)
- Distribution exclusive grossistes spécialisés
- Personnalisation par broderie/laser sur partie cuir uniquement (extrêmement rare)

### Marques EU standard B2B

| Marque | Distribution EU | Personnalisation possible |
|---|---|---|
| **Snickers Workwear** | Falk & Ross, Engelbert Strauss, Manutan | Broderie nom/logo sur tige cuir (rare) |
| **Caterpillar Safety** | Würth, Manutan, Mecateam | Broderie sur partie textile uniquement |
| **Puma Safety** | TopTex, Würth, Manutan | Broderie limitée |
| **Sparco Safety** | Würth, fournisseurs auto | Pas de personnalisation en série |
| **PARADE** (FR) | TopTex Goodies, Würth FR | Broderie nom (rare) |
| **Lemaitre Sécurité** (FR) | Würth FR, Manutan | Broderie (rare) |
| **U-Power** (IT) | Würth, Mecateam | Personnalisation possible chez grossiste |

### Verdict chaussures de sécurité

**Devis-only obligatoire** — c'est la **seule configuration viable**. Trois raisons :

1. **Impossible en POD** — pas de fournisseur POD avec ce produit
2. **Stock nécessaire** — chaque taille/largeur doit être commandée pré-personnalisation, pas de "1 à la fois"
3. **Quantité minimum brodeur** — un brodeur EU n'accepte pas moins de 20-30 paires en série pour la broderie nom/logo

### Configuration recommandée dans `data/products.ts` (si tu veux l'ajouter V1)

```typescript
// ─── Chaussures de sécurité — DEVIS UNIQUEMENT ─────────────────────
export const PRODUCT_CHAUSSURE_SECURITE_PRO: Product = {
  id: "chaussure-securite-pro",
  slug: "chaussure-securite-pro",
  reference: "Chaussure de sécurité S3",
  name: "Chaussure de sécurité S3 — Devis",
  // ...
  visible: true,
  quoteOnly: true,
  quoteOnlySubject: "devis-chaussures-securite",
  quoteOnlyMessage:
    "Chaussures de sécurité norme EN ISO 20345 S3. Broderie nom/logo possible dès 20 paires. Marques disponibles : Snickers, Puma Safety, Caterpillar, U-Power. Devis selon volume, taille et finition.",
  // ...
};
```

**À ne pas mettre dans la grille classique catalogue.** À placer dans la rubrique `/entreprises` ou `/contact?sujet=securite-pro` dédiée B2B chantier/industrie.

---

## 5. Récapitulatif décisionnel & priorités V1

| Catégorie | Verdict | Action V1 recommandée | Effort dev | Risque |
|---|---|---|---|---|
| **Tote bags Westford Mill (bp 731)** | ✅ Viable Printify EU | **Intégrer** : sample → ajout produit `data/products.ts` + pricing + mockups | Moyen (4-6h) | Faible |
| **Casquettes** | ❌ Pas viable Printify | **Devis-only** vers TopTex broderie OU **hors V1** | Faible (1h) si quoteOnly | Faible |
| **Gourdes inox** | ❌ Pas viable Printify | **Devis-only** OU **hors V1** | Faible (1h) si quoteOnly | Faible |
| **Chaussures de sécurité** | ❌ Pas chez Printify | **Devis-only obligatoire** + page entreprise dédiée | Faible (1-2h) | Faible |

### Ordre de priorité suggéré

1. **P1 — Tote bag Westford Mill** : seul vrai gain catalogue. Élargit la cible (associations, événements, restaurants pour merch / goodies).
2. **P2 — Chaussures sécurité quoteOnly** : signal fort B2B chantier/industrie. Page `/entreprises` enrichie. Pas de risque tech.
3. **P3 — Casquettes broderie quoteOnly** : si tu vises clubs/équipes événementielles avec uniformes complets, c'est un add-on cohérent avec polos brodés.
4. **P4 — Gourdes** : à reporter V2 (goodies entreprise saisonnier).

### Pré-requis communs si tu intègres l'un d'entre eux

- ✅ Commande échantillon physique (Westford Mill 731 : ~20 € livré)
- ✅ Validation qualité visuelle avant catalogue
- ✅ Cohérence DA : mockups en respect du shooting éditorial HM Global (fond crème, lumière douce, palette cyan/violet/magenta sur le produit)
- ✅ Doctrine `docs/image-rights.md` : photos packshot fournisseur autorisées en V1, photos HM Global pour les visuels marketing

---

## 6. Confirmations finales

- ✅ **Aucune ligne de code modifiée** pendant cet audit
- ✅ **Aucun fichier catalogue / pricing / data touché** (data/products.ts, data/print-products.ts, data/pricing.ts intacts)
- ✅ **Aucun appel API Printify supplémentaire** — analyse exclusive des données existantes au 2026-05-17 (1379 blueprints couverts)
- ✅ **Stripe / Supabase / checkout / routes API** : non concernés
- ✅ État actuel préservé :
  - Cotton Heritage M2480 → `visible: false`
  - Gildan 18000 → visible, supplierName inchangé
  - Polo Gildan 64800 → `quoteOnly: true`
  - PRODUCT_COTTON_HERITAGE_M2480 → objet conservé pour historique + routes admin

---

*Fin de l'audit. Aucune action de code recommandée à ce stade. À toi de prioriser la suite si tu veux ouvrir une de ces 4 catégories.*
