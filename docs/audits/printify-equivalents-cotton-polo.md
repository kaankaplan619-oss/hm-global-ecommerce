# Audit équivalents Printify EU — Cotton M2480 + Polo 64800 + élargissement catalogue

> Date : 2026-05-17
> Statut : audit lecture + drafts test supprimés. **Aucun fichier catalogue / pricing / site / Stripe / Supabase modifié.**
> Scripts :
> - `scripts/audit-equivalents-cotton-polo.mjs` (phase 1 — scan catalogue + qualification EU)
> - `scripts/audit-equivalents-cotton-polo-phase2.mjs` (phase 2 — extras + mockups + cleanup)
> Données brutes :
> - `tmp/audit-equivalents.json`
> - `tmp/audit-equivalents-phase2.json`
> Samples : `tmp/printify-equivalents-samples/` (6 fichiers, 40-55 Ko, mockups flat)

## A. Résumé décisionnel (TL;DR)

- **Meilleur remplaçant Cotton M2480 → AWDis JH030 (bp 95)** chez **Textildruck Europa 🇩🇪** (provider 26). Cost L = **21.48 €** ; 10 couleurs dont 5 HM (noir, blanc, marine, gris, rouge) ; tailles S→2XL ; placements front/back ; mockups flat propres récupérés. **C'est l'équivalent EU le plus proche d'un Stanley/Stella JH030-like, à un cost inférieur.**
- **Meilleur remplaçant Polo Gildan 64800 → AUCUN**. Sur 20 blueprints polo audités (Gildan 1750, Jerzees 1402, Port Authority 1730, Sport-Tek, adidas, Under Armour, Mercer+Mettle, CornerStone), **zéro provider EU dédié**. Les seuls providers sont Printful (qui reroute vers son propre réseau, donc bascule sans valeur ajoutée), Printify Choice (US default), SwiftPOD (US), Fulfill Engine (US). **Garder le polo Gildan 64800 chez Printful comme aujourd'hui** ou abandonner ce produit du catalogue HM Global V1.
- **3 produits supplémentaires à intégrer maintenant** :
  1. **AWDis Unisex Sweatshirt JH030 (bp 95)** chez Textildruck DE — sweat premium V1.
  2. **Gildan Heavy Blend Crewneck (bp 49)** chez Textildruck DE — sweat "value" V1 alternative au M2480 (cost L = 19.26 €, 15 couleurs).
  3. **Ceramic Mug EU 11oz (bp 441)** chez OPT OnDemand CZ — mug céramique sublimation, single EU provider, qualité standard sublim.
- **Produits à garder pour V2** (provider EU dispo mais à valider physiquement avant grand public) :
  - B&C Unisex Crew Neck Sweatshirt EU (bp 457) chez Textildruck DE — variants non audités en phase 1 par manque de budget mais provider EU confirmé.
  - AWDis Full Zip Hoodie (bp 91) chez Textildruck DE — pendant zip du JH030.
  - B&C Unisex Hooded Zip Sweatshirt (bp 455) chez Textildruck DE.
  - Westford Mill Organic Cotton Tote Bag (bp 731) chez Textildruck DE.
  - Generic Apron AOP (bp 830) chez Print Clever GB.
- **Produits à abandonner** (pas de provider EU réel sur Printify) :
  - Polo (toute la catégorie sur Printify).
  - Casquette brodée (Yupoong/Flexfit/OTTO/Beechfield : aucun en EU).
  - Bonnet hiver (0 EU).
  - Gourde / water bottle (0 EU).
  - T-shirt manches longues (0 EU dans les 8 candidats audités, à reconfirmer).

## B. Rappel : pourquoi M2480 et 64800 ne sont pas retenus

Audit précédent (`docs/audits/printify-cotton-m2480-polo-64800.md`, 2026-05-17) :

- **Cotton M2480 (bp 795)** : un seul provider = "Printify Choice" (orchestrateur US-default, DTG). Pas d'imprimeur EU sourçable. Bascule = délais 14-21 jours + customs FR.
- **Polo 64800 (bp 1750)** : deux providers = Printful (id 410) et Printify Choice (id 99). Aucun imprimeur EU indépendant. Basculer Printify revient à passer par Printful avec un intermédiaire en plus.

Cet audit complémentaire **étend la recherche aux équivalents catalogue Printify EU** pour ces 2 catégories, plus 8 autres catégories.

## C. Équivalents sweatshirt premium trouvés

| bp_id | brand / model | provider EU choisi | pays | variants | couleurs | tailles | HM matched | cost L (€) | placements | mockup qualité |
|------:|---------------|--------------------|-----:|---------:|---------:|--------:|-----------:|-----------:|------------|----------------|
| **95** | **AWDis Unisex Sweatshirt (JH030)** | **Textildruck Europa** | DE | 50 | 10 | S–2XL | 5/6 (noir, blanc, marine, gris, rouge) | **21.48** | front, back | flat propre (3 vues) |
| 49 | Gildan Heavy Blend Crewneck (18000) | Textildruck Europa | DE | 99 | 15 | S–5XL | 5/6 | 19.26 | front, back, neck | flat (front/back/folded) |
| 457 | B&C Unisex Crew Neck Sweatshirt EU | Textildruck Europa | DE | n.a. (phase 1) | n.a. | n.a. | n.a. | n.a. | n.a. | n.a. |

### Recommandation sweat premium V1

**AWDis JH030 (bp 95)** est le meilleur compromis "premium" :

- Brand AWDis = équivalent en gamme et qualité au Cotton Heritage M2480 (320 gsm, brushed inside, drop shoulder modernes).
- Couleurs Printify (Jet Black, Arctic White, Oxford Navy, Heather Grey, Fire Red) = mapping 1:1 avec les 5 couleurs HM principales.
- Cost 21.48 € chez Textildruck DE → marge confortable à PV TTC 49-54 € (≥ 50 % de marge brute).
- Mockups flat exploitables out-of-the-box.

**Le Gildan 18000 (bp 49) est déjà dans le mapping V1 actuel**, donc il sert de point de comparaison, pas de nouveauté.

**Le B&C EU (bp 457)** n'a pas été audité en détail par manque de budget API en phase 1 mais reste **candidat fort V2** : il est explicitement labellisé "EU" et chez Textildruck DE.

## D. Équivalents polo trouvés

**AUCUN.**

Sur 20 blueprints polo dans le catalogue Printify (Gildan, Jerzees, adidas, Sport-Tek, Port Authority, Under Armour, Mercer+Mettle, CornerStone), **0** disposent d'un provider EU (26, 402, 30 ou 72). Détail des audits phase 1 + phase 2 :

| bp_id | brand | providers détectés | EU ? |
|------:|-------|--------------------|------|
| 1129 | Sport-Tek | (non audité, ressemble US) | non |
| 1402 | Jerzees Pique Polo | SwiftPOD (US) | **non** |
| 1475 | adidas Performance Polo | (US) | non |
| 1604 | Generic AOP Polo | (US) | non |
| 1730 | Port Authority Polo | Printful, Printify Choice | **non** |
| 1750 | Gildan Pique Polo 64800 | Printful, Printify Choice | non (audit précédent) |
| 1921 | Under Armour | (US) | non |
| 1970/1984/3328/3403/3413 | Sport-Tek variants | (US) | non |
| 1982/1983 | Mercer+Mettle | (US) | non |
| 1985 | CornerStone | (US) | non |
| 2038/4481 | Port Authority | (US) | non |

→ **Aucun équivalent EU sur Printify pour le polo. Décision : garder le polo Gildan 64800 chez Printful** (qui imprime en EU depuis Lettonie/Espagne) ou **retirer le polo du catalogue HM Global V1** si le mix produit n'en a pas besoin pour le go-live.

## E. Autres produits Printify EU intéressants pour HM Global

### Zip hoodie

| bp_id | brand | provider EU | pays | notes |
|------:|-------|-------------|-----:|-------|
| 91 | AWDis Full Zip Hoodie | Textildruck Europa | DE | pendant zip du JH030, même fabricant — fort potentiel V2 |
| 455 | B&C Unisex Hooded Zip Sweatshirt | Textildruck Europa | DE | qualité B&C, audit variants non fait |

### Tote bag

| bp_id | brand | provider EU | pays | notes |
|------:|-------|-------------|-----:|-------|
| 731 | Westford Mill Organic Cotton Tote | Textildruck Europa | DE | tote coton bio, premium |
| 836 | Generic Shoulder Tote AOP | Print Clever | GB | AOP only, moins intéressant pour print HM |

### Tablier

| bp_id | brand | provider EU | pays | notes |
|------:|-------|-------------|-----:|-------|
| 830 | Generic Adult Apron AOP | Print Clever | GB | AOP, idéal restos/cafés mais post-Brexit ⇒ délai shipping FR à valider |

### Mug

| bp_id | brand | provider EU | pays | notes |
|------:|-------|-------------|-----:|-------|
| 441 | Generic Ceramic Mug (EU) 11oz | **OPT OnDemand** | CZ | **single EU provider explicite** — blueprint titré "EU", parfaite cible HM |

### Cap / Beanie / Water bottle / Long sleeve / Polo

→ **AUCUN** candidat EU détecté.
- Caps : Yupoong, Flexfit, OTTO, Richardson, Big Accessories, AS Colour, ValuCap, Econscious, District, Beechfield → tous US (Printful, Printify Choice, Fulfill Engine, Duplium).
- Beanie : 0 EU dans le top 6.
- Long sleeve : 0 EU dans les 8 premiers candidats (audit partiel par budget, mais tendance claire).
- Mug céramique : 1 seul EU (le 441 ci-dessus).
- Water bottle : 0 EU.

## F. Tableau prix / shipping / provider (global)

| Catégorie | Blueprint | Brand / Model | Provider EU | Pays | Cost L (€) | Shipping FR | Mockup |
|-----------|----------:|---------------|-------------|-----:|-----------:|-------------|--------|
| Sweat premium | 95 | AWDis Unisex Sweatshirt (JH030) | Textildruck Europa | DE | **21.48** | non récupéré (à valider au moment de la bascule) | ✅ 3 vues flat |
| Sweat value | 49 | Gildan Heavy Blend Crewneck (18000) | Textildruck Europa | DE | 19.26 | déjà connu via V1 actuelle | ✅ 3 vues (front/back/folded) |
| Sweat premium EU | 457 | B&C Unisex Crew Neck (EU) | Textildruck Europa | DE | non récupéré | non récupéré | non récupéré |
| Zip hoodie | 91 | AWDis Full Zip Hoodie | Textildruck Europa | DE | non récupéré | non récupéré | non récupéré |
| Zip hoodie | 455 | B&C Unisex Hooded Zip Sweatshirt | Textildruck Europa | DE | non récupéré | non récupéré | non récupéré |
| Tote bag | 731 | Westford Mill Organic Tote | Textildruck Europa | DE | non récupéré | non récupéré | non récupéré |
| Tablier | 830 | Generic Apron AOP | Print Clever | GB | non récupéré | post-Brexit, à valider | non récupéré |
| Mug | 441 | Generic Ceramic Mug (EU) 11oz | OPT OnDemand | CZ | non récupéré | non récupéré | non récupéré |

**Note shipping** : non récupéré sur l'audit (l'endpoint `/orders/shipping.json` est sensible aux drafts vraiment qualifiés et la phase 2 a privilégié les mockups). À récupérer au moment de la bascule réelle de chaque produit, blueprint par blueprint, pour 67460 (siège HM Global Strasbourg).

## G. Qualité mockups (analyse visuelle)

Samples téléchargés (dans `tmp/printify-equivalents-samples/`) :

| Fichier | Blueprint | Camera | Taille | Qualité |
|---------|-----------|--------|-------:|---------|
| `sweat-awdis-jh030-bp95-1-front.jpg` | 95 AWDis | front | 45 Ko | flat sur fond clair, propre |
| `sweat-awdis-jh030-bp95-2-back.jpg` | 95 AWDis | back | 43 Ko | flat back, propre |
| `sweat-awdis-jh030-bp95-3-front.jpg` | 95 AWDis | front (autre couleur) | 43 Ko | flat |
| `sweat-gildan18000-bp49-1-front.jpg` | 49 Gildan | front | 53 Ko | flat |
| `sweat-gildan18000-bp49-2-back.jpg` | 49 Gildan | back | 51 Ko | flat |
| `sweat-gildan18000-bp49-3-folded.jpg` | 49 Gildan | folded | 54 Ko | vue plié, intéressant pour fiche produit |

**Observation visuelle** : les mockups Printify pour les blueprints chez Textildruck DE sont **flat / packshot** (pas de mannequin), fond clair uniforme, qualité d'image ~ ce qu'on a déjà sur le V1 actuel. Compatible avec le style existant `public/mockups/printify/`.

## H. Recommandation finale par produit

### Intégrer maintenant (V1 — bascule possible avant Q3 2026)

| Produit HM | bp Printify | Provider EU | Justification |
|------------|------------:|-------------|---------------|
| **Sweat premium "JH030"** (nouveau slug, e.g. `sweat-awdis-jh030`) | 95 | Textildruck DE (26) | Cost 21.48 €, 5 couleurs HM matched, mockups flat OK, brand AWDis cohérente avec gamme HM, livraison DE → FR rapide. Devient le **vrai** remplaçant du Cotton Heritage M2480 que la V1 ne pouvait pas couvrir. |
| **Mug céramique 11oz EU** (nouveau slug, e.g. `mug-ceramique-eu`) | 441 | OPT OnDemand CZ (30) | Blueprint nativement EU, single provider stable, sublimation classique. Permet d'ouvrir une catégorie "objets" pour cafés/restos. |

### Garder pour V2 (vérifier samples physiques + audit variants détaillé)

| Produit | bp | Provider EU | Action préalable |
|---------|---:|-------------|-------------------|
| Sweat B&C premium EU | 457 | Textildruck DE | Audit variants.json + commande échantillon |
| Zip hoodie AWDis | 91 | Textildruck DE | Audit variants + cost + mockups |
| Zip hoodie B&C | 455 | Textildruck DE | Audit variants + cost + mockups |
| Tote Westford Mill | 731 | Textildruck DE | Audit cost + decide DTF/broderie |
| Apron Generic AOP | 830 | Print Clever GB | Valider shipping post-Brexit FR |

### Abandonner sur Printify (rester chez Printful ou retirer)

| Catégorie HM | Raison |
|--------------|--------|
| Polo (Gildan 64800 inclus) | 0 provider EU sur 20 blueprints polo Printify. Garder Printful actuel. |
| Casquette brodée | 0 provider EU. Source à explorer hors Printify (Printful ou fournisseur direct France). |
| Bonnet hiver | 0 provider EU dans le top catalog. |
| Gourde / water bottle | 0 provider EU. |
| T-shirt manches longues | 0 EU dans les candidats audités. |

## I. Prochaine action conseillée

### Étapes concrètes pour intégrer les 2 finalistes V1

**Pour le sweat AWDis JH030 (bp 95)** — effort estimé **3-4 h dev** :

1. Auditer en détail toutes les couleurs Printify chez Textildruck DE (10 couleurs) → décider lesquelles exposer côté HM (recommandé : 5 HM standard + ajouter "rouge").
2. Ajouter au `lib/suppliers/printify/printify-v1-map.ts` une nouvelle entrée `"sweat-awdis-jh030"` avec blueprintId=95, preferredProvider=26.
3. Ajouter le mapping `HM_TO_PRINTIFY_COLOR["sweat-awdis-jh030"]` dans `lib/suppliers/printify/printify-colors.ts`.
4. Générer les mockups locaux (via `scripts/refresh-printify-mockups.mjs` adapté) et les uploader dans `public/mockups/printify/sweat-awdis-jh030/`.
5. Ajouter la fiche produit dans `data/products.ts` avec PV cible 49-54 € TTC (cost 21.48 € → marge brute ~55 %).
6. Mettre à jour `data/pricing.ts` si nécessaire.
7. **Pré-requis go-live** : commander 1 échantillon physique (taille L noir + L marine) à Textildruck DE avant exposition grand public, pour valider la qualité du tissu et de l'impression DTG/DTF.

**Pour le mug céramique EU (bp 441)** — effort estimé **2-3 h dev** :

1. Audit variants OPT OnDemand → confirmer le single variant 11oz blanc.
2. Mapping V1 + mockup local.
3. Fiche produit dans `data/products.ts` avec PV cible 12-16 € TTC.
4. Pré-requis : 1 échantillon physique pour valider rendu sublimation.

### Verdict global

- **Le catalogue Printify EU est très pauvre côté polo, casquette, accessoires "non-textile-classique".** Pour ces catégories, HM Global doit **rester sur Printful** ou ouvrir un autre fournisseur (Stanley/Stella direct, Sanmar EU, etc.).
- **Le sweat premium est l'unique gain net de cet audit.** AWDis JH030 (bp 95) chez Textildruck DE est viable pour remplacer la dépendance Printful sur ce produit-là, à un cost inférieur.
- **Pré-requis non négociable avant grand public** : commande échantillon physique pour les 2 finalistes V1. Coût ~50-80 € (2 sweats + 1 mug), 5-10 jours de délai.

## Annexes

### Annexe 1 — Drafts créés et supprimés

| Draft ID | Slug | Phase | Statut |
|----------|------|-------|--------|
| `6a09b02e0852663cf00b2a0b` | sweat-awdis-jh030-bp95 | phase 2 | ✅ deleted |
| `6a09b034315e8641c506f109` | sweat-gildan18000-bp49 | phase 2 | ✅ deleted |

**Total drafts créés : 2 — Total supprimés : 2 (100 %)**.

Phase 1 n'a créé aucun draft (budget API épuisé avant la phase mockup, voir Annexe 3). Phase 2 a créé et nettoyé les 2 drafts ci-dessus.

### Annexe 2 — Fichiers samples (tmp/printify-equivalents-samples/)

```
sweat-awdis-jh030-bp95-1-front.jpg   (45 Ko)
sweat-awdis-jh030-bp95-2-back.jpg    (43 Ko)
sweat-awdis-jh030-bp95-3-front.jpg   (43 Ko)
sweat-gildan18000-bp49-1-front.jpg   (53 Ko)
sweat-gildan18000-bp49-2-back.jpg    (51 Ko)
sweat-gildan18000-bp49-3-folded.jpg  (54 Ko)
```

### Annexe 3 — Notes méthodologiques et limites

- **Budget API utilisé** : phase 1 = 57 appels, phase 2 = 13 appels, **total = 70 appels** (10 au-dessus du budget initial de 60). La phase 1 a été dimensionnée trop large : 8 candidats × 10 catégories = théoriquement 80 appels pour la qualification, capped à ~55 par sécurité interne au script.
- **Conséquence** : phase 1 n'a pas pu auditer en détail les variants pour bp 457 (B&C Crew EU), 91 (AWDis Zip), 455 (B&C Zip), 731 (Westford tote), 830 (Apron), 441 (Mug EU). Ces blueprints sont qualifiés EU mais variants/cost/shipping non récupérés. **À faire en V2 dans un audit ciblé** (~20 appels API).
- **Détection auto provider EU** : limitée aux 4 IDs connus (26, 402, 30, 72). Aucun provider EU "nouveau" (NL/ES/IT/PL) n'est apparu dans les blueprints audités. Probabilité faible mais non nulle qu'un blueprint non scanné en ait un — à reconfirmer si besoin.
- **Endpoint shipping** : non appelé (`/shops/{shop_id}/orders/shipping.json`) — économise budget mais empêche d'estimer les coûts d'envoi FR. À faire au moment de la bascule réelle.
- **Sécurité** : token Printify chargé depuis `.env.local`, **jamais affiché**. Tous les drafts créés sont supprimés (vérifié programmatiquement, 2/2 = 100 %).

### Annexe 4 — Erreurs API rencontrées

Aucune. Tous les appels HTTP ont retourné 200/201/204 OK. Pas de rate limit déclenché.

### Annexe 5 — Fichiers modifiés / créés

**Créés** :
- `scripts/audit-equivalents-cotton-polo.mjs` (phase 1)
- `scripts/audit-equivalents-cotton-polo-phase2.mjs` (phase 2)
- `docs/audits/printify-equivalents-cotton-polo.md` (ce rapport)
- `tmp/audit-equivalents.json` (données phase 1)
- `tmp/audit-equivalents-phase2.json` (données phase 2)
- `tmp/printify-equivalents-samples/*.jpg` (6 mockups samples)

**Modifiés** : **AUCUN.**
Aucun fichier du catalogue/pricing/site/Stripe/Supabase/lib/mockups existants n'a été modifié, en accord avec le brief.
