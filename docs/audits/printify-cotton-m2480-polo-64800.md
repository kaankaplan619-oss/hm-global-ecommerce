# Audit Printify — Cotton Heritage M2480 + Polo Gildan 64800

> Date : 2026-05-17
> Statut : audit pré-bascule, **aucun changement catalogue effectué**.
> Script : `scripts/audit-cotton-m2480-polo-64800.mjs`
> Données brutes : `tmp/audit-cotton-polo.json`
> Samples : `tmp/printify-audit-samples/` (vide — voir Annexes)

## TL;DR

- **Cotton Heritage M2480 (bp 795)** → **NE PAS BASCULER sur Printify**. Un seul provider disponible : "Printify Choice" (id 99), pas de provider EU dédié. Cette mise en réseau "Choice" route Printify automatiquement vers son réseau (typiquement US par défaut pour ce blueprint). DTG only, pas de variant EU-localisé. **Garder Printful actuel.**
- **Polo Gildan 64800 (bp 1750)** → **NE PAS BASCULER sur Printify**. Les 2 providers disponibles sont (a) "Printful" (id 410) et (b) "Printify Choice" (id 99) — autrement dit, Printify revend Printful sur ce blueprint. Aucun provider EU indépendant. Basculer ferait passer par Printify pour finir chez Printful avec une marge intermédiaire en plus. **Garder Printful actuel.**
- **Provider EU recommandé pour chaque** : aucun — les 2 blueprints ne sont pas couverts par Textildruck DE (26), Atelier Katanga FR (402), OPT OnDemand CZ (30) ni Print Clever GB (72).
- **Cohérence avec mapping V1 existant** : le fichier `lib/suppliers/printify/printify-v1-map.ts` note déjà "Cotton Heritage M2480 / M2580 (US-only, pas de provider EU)" — l'audit confirme.

## Blueprint 795 — Cotton Heritage M2480 Premium Crewneck

### Validation blueprint
- **Titre API** : `Unisex Crew Sweatshirt`
- **Brand / Model** : Cotton Heritage / M2480
- **Description** : « Add some custom character to any fall collection... 65% cotton/35% polyester... 100% cotton face. »

### Providers disponibles

| provider_id | name              | country | decoration | nb variants | nb couleurs | nb tailles | placements   |
|------------:|-------------------|--------:|-----------:|------------:|------------:|-----------:|--------------|
| 99          | Printify Choice   | (routing) | DTG      | 66          | 11          | 6 (S–3XL)  | front, back  |

**Aucun provider EU dédié** (ni 26 Textildruck DE, ni 402 Atelier Katanga FR, ni 30 OPT OnDemand CZ, ni 72 Print Clever GB).

### Provider recommandé
- **Aucun**. Le seul provider est "Printify Choice", qui est un orchestrateur — pas un imprimeur EU sourçable. Pour HM Global qui livre majoritairement en FR/EU, c'est un risque shipping/délai/customs majeur.

### Couleurs disponibles chez Printify Choice (info)
| couleur Printify       | HM colorId mappé |
|------------------------|------------------|
| Black                  | noir             |
| White                  | blanc            |
| Navy Blazer            | marine           |
| Charcoal Heather / Carbon Grey | gris     |
| Bone                   | beige            |
| Team Red               | rouge            |
| Team Royal             | (royal — bonus)  |
| Forest Green           | —                |
| Dusty Rose             | —                |
| Vintage Black          | —                |
| (+ 1 autre)            | —                |

→ Les 6 couleurs HM cibles sont matchées côté catalogue, mais sans provider EU c'est purement académique.

### Mockups disponibles
- Non récupérés : aucun draft créé puisqu'aucun provider EU n'est viable.
- Caméras `front` et `back` exposées par les placeholders (à confirmer si bascule envisagée plus tard via "Printify Choice" en debug — non recommandé à ce stade).

### Marge estimée
Non calculable proprement sans appel `cost` réel. Hypothèse rapide :
- **Prix de vente HM Global actuel** (data/products.ts → `HOODIE_PRICES.sweat`) : 44,90 € (DTF/flex) à 52,90 € (broderie) TTC pour le Cotton Heritage M2480.
- Si on basculait sur Printify Choice avec impression et expédition US, le shipping international (~15-25 €/u) défoncerait la marge à elle seule.

### Risques
1. **Pas de localisation EU connue** → délai 14-21 jours + customs FR potentiels.
2. **Dépendance à l'opaque "Printify Choice"** : l'imprimeur réel peut changer sans préavis (qualité variable).
3. **Aucune différenciation vs Printful actuel** : Printful livre déjà ce produit depuis ses centres EU (Lettonie/Espagne) — Printify ne ferait que rajouter un intermédiaire.

### Décision V1
**ABANDONNER la bascule.** Conserver le routage Printful actuel pour `cotton-heritage-m2480`.

## Blueprint 1750 — Gildan 64800 Pique Polo Shirt

### Validation blueprint
- **Titre API** : `Unisex Pique Polo Shirt (Embroidery)`
- **Brand / Model** : Gildan / 64800
- **Description** : « ...100% ring-spun cotton, this durable, textured fabric is soft to the touch... »
- **Décoration** : broderie uniquement (cohérent avec data/products.ts qui force `techniqueRecommandee: "broderie"` sur ce produit).

### Providers disponibles

| provider_id | name              | country     | decoration | nb variants | nb couleurs | nb tailles |
|------------:|-------------------|------------:|-----------:|------------:|------------:|-----------:|
| 410         | Printful          | (Printful)  | embroidery | 28          | 4           | 7 (S–4XL)  |
| 99          | Printify Choice   | (routing)   | embroidery | 28          | 4           | 7 (S–4XL)  |

**Les deux providers offrent exactement la même grille variants** — confirmation que "Printify Choice" sur ce blueprint route systématiquement vers Printful.

**Aucun provider EU indépendant** (Textildruck, Atelier Katanga, OPT, Print Clever ne tiennent pas le 64800 en broderie).

### Provider recommandé
- **Aucun via Printify**. Pour ce blueprint, Printify est un revendeur Printful → marge intermédiaire négative pour HM Global.
- **Recommandation** : conserver la voie directe Printful déjà en place (`supplierName: "printful"` dans data/products.ts).

### Couleurs disponibles
| couleur Printify | HM colorId actuel | dispo HM aujourd'hui |
|------------------|-------------------|----------------------|
| Black            | noir              | ✅                   |
| White            | blanc             | ✅                   |
| Navy             | marine            | ✅                   |
| Sport Grey       | gris              | ✅                   |

→ **Couverture 100% sur les 4 couleurs HM existantes**. Pas de rouge/royal côté Printify non plus, ce qui est cohérent avec l'offre couleur d'origine du blueprint.

### Placements broderie disponibles
- `front_left_chest` (coeur — placement principal HM)
- `large_back_embroidery` (dos)
- `left_sleeve` (manche gauche)
- `right_sleeve` (manche droite)

→ Correspond aux placements HM `coeur`, `dos`, `coeur-dos`. Le placement `front_left_chest` est *exactement* celui qu'on retrouve sur les mockups HM existants pour le polo 64800.

### Mockups disponibles
- Non téléchargés : aucun draft créé puisqu'aucun provider EU n'est viable.
- Vues attendues d'après l'API : `front`, `back`, plus potentiellement closeup broderie. À valider via draft si on envisageait quand même Printify en backup (non recommandé).

### Marge estimée
- **Prix de vente HM Global actuel** (data/products.ts → `POLO_PRICES.pique`) : 24,90 € (flex — peu pertinent) / **29,90 € (broderie)** TTC.
- Coût Printful actuel pour le 64800 brodé : non lu dans cet audit (hors scope — pas d'appel Printful API ici).
- Coût Printify si bascule = Printful + marge Printify (~5-10% de surcoût attendu).

### Risques
1. **Surcoût marge intermédiaire** : Printify facture ~10% au-dessus du prix Printful direct sur les blueprints revendus.
2. **Doublon contractuel** : on ajouterait un intermédiaire (Printify) sans gain technique ni géographique.
3. **Pas de bénéfice localisation** : l'impression part de toute façon des entrepôts Printful (Lettonie/USA selon adresse).

### Décision V1
**ABANDONNER la bascule.** Conserver le routage Printful actuel pour `polo-gildan-64800`.

## Recommandation finale

| Blueprint | Décision     | Justification |
|-----------|--------------|---------------|
| 795 Cotton Heritage M2480 | **Abandonner Printify** — garder Printful actuel | Aucun provider EU dédié (seul "Printify Choice" id 99 = routing US par défaut). Note `printify-v1-map.ts` confirmait déjà "US-only". |
| 1750 Gildan 64800 (broderie) | **Abandonner Printify** — garder Printful actuel | Les 2 providers Printify = Printful (id 410) et Printify Choice (id 99) qui revend Printful. Aucun provider EU indépendant → bascule = intermédiaire sans valeur ajoutée. |

**Synthèse 5 lignes** : Aucun des 2 blueprints n'est candidat à une bascule Printify. Le Cotton M2480 reste un produit DTG sans provider EU (seul "Printify Choice" disponible, routing opaque, risque shipping/customs). Le Polo 64800 est revendu par Printify *via* Printful — basculer reviendrait à payer Printify pour aller chez Printful qui est déjà notre fournisseur direct. La stratégie V1 Printify reste donc centrée sur les 6 produits déjà cartographiés (Gildan 5000, Bella 3001, Gildan 18000, Gildan 18500, Comfort Colors 1717, Gildan 2400 LS) — tous couverts par Textildruck Europa DE (id 26) avec localisation EU réelle.

## Annexes

### Drafts créés et supprimés
- **Aucun draft créé** (sortie anticipée à l'étape "no_eu_provider" pour chaque blueprint).
- Pas de cleanup nécessaire.

### Fichiers samples
- Le dossier `tmp/printify-audit-samples/` n'a pas été créé : aucun draft n'a été généré, donc aucun mockup à télécharger.
- Si l'on souhaite quand même voir le rendu Printify Choice (US) à titre comparatif, relancer avec un patch manuel pour autoriser le provider 99 — non recommandé pour V1.

### Cohérence avec le code existant
- `lib/suppliers/printify/printify-v1-map.ts` (lecture seule, **non modifié**) — exclut déjà M2480 explicitement, note "US-only, pas de provider EU".
- `lib/suppliers/printify/printify-colors.ts` (lecture seule, **non modifié**) — pas de mapping prévu pour `polo-gildan-64800` ni `cotton-heritage-m2480`, confirme la trajectoire actuelle.
- `data/products.ts` (lecture seule, **non modifié**) — les 2 produits restent `supplierName: "printful"`.
- `data/pricing.ts` (lecture seule, **non modifié**).

### Calls API effectués
- Blueprint 795 :
  - `GET /catalog/blueprints/795.json`
  - `GET /catalog/blueprints/795/print_providers.json`
  - `GET /catalog/blueprints/795/print_providers/99/variants.json` (audit informatif)
- Blueprint 1750 :
  - `GET /catalog/blueprints/1750.json`
  - `GET /catalog/blueprints/1750/print_providers.json`
  - `GET /catalog/blueprints/1750/print_providers/410/variants.json` (audit informatif)
  - `GET /catalog/blueprints/1750/print_providers/99/variants.json` (audit informatif)
- **Total : 7 appels** (très en dessous du budget 60).
- **Aucun appel POST/DELETE** (pas de draft, pas d'upload image, pas de cost, pas de shipping — pas de provider EU pour les déclencher).

### Notes
- L'audit `audit-printify-catalogue.mjs` du 2026-05-17 avait déjà cartographié 13 candidats — Cotton M2480 et Polo 64800 n'y figuraient volontairement pas car identifiés comme US-only en revue manuelle préalable. Cet audit dédié confirme cette intuition par appel API direct.
- Si Printify ajoute plus tard un provider EU à l'un de ces 2 blueprints, il suffira de relancer ce même script (`node scripts/audit-cotton-m2480-polo-64800.mjs`) pour réévaluer.
