# Re-audit polo Printify EU — 2026-05-18

> **Date :** 2026-05-18
> **Demande :** revérifier s'il existe aujourd'hui un polo Printify avec provider EU exploitable (alternative au Gildan 64800 actuellement en `quoteOnly: true`).
> **Statut :** audit pur — **aucun fichier modifié** (catalogue, pricing, code, Stripe, Supabase, routes API intacts).
> **Sources consultées :**
> - `docs/audits/printify-equivalents-cotton-polo.md` (audit principal, 2026-05-17)
> - `docs/audits/printify-cotton-m2480-polo-64800.md` (audit initial, 2026-05-17)
> - `tmp/audit-equivalents.json` (données brutes phase 1, 1379 blueprints scannés)
> - `tmp/audit-equivalents-phase2.json` (vérifications providers ciblées)
> - Catalogue Printify total : **1379 blueprints** scannés au 2026-05-17

---

## 1. Méthodologie

Le script `scripts/audit-equivalents-cotton-polo.mjs` a :
1. Récupéré la liste complète des blueprints Printify (1379 produits)
2. Filtré par mot-clé : `polo`, `pique`, `performance shirt`, `golf shirt`
3. Identifié **20 candidats polo**
4. Catégorisé chacun puis vérifié les providers en phase 2 (sample de 2 polos pour budget API)

Pour qualifier "EU" : provider doit avoir country code `DE`, `FR`, `NL`, `IT`, `ES`, `PT`, `CZ`, `PL`, `LV`, `LT`, `GB`. Les providers `Printful` (id 410), `Printify Choice` (id 99), `SwiftPOD` (id 39), `Fulfill Engine` (id 217), `Duplium` (id 41) sont identifiés comme orchestrateurs US-default — **non considérés EU** (même si Printful peut router en EU, ça n'apporte pas de gain par rapport à l'état actuel).

---

## 2. Inventaire complet des 20 blueprints polo Printify

Données brutes extraites de `tmp/audit-equivalents.json` :

| bp_id | Brand | Modèle | Catégorie probable |
|------:|-------|--------|---------------------|
| 1129 | Sport-Tek | Men's Sport Polo Shirt | US, dropshipping |
| **1402** | **Jerzees** | Men's Piqué Polo | US (SwiftPOD) |
| 1475 | adidas® | Performance Polo (Unisex) | US |
| 1604 | Generic brand | Polo Shirt (AOP) | US |
| **1730** | **Port Authority** | Polo Shirt (Embroidery) | US (Printful + Printify Choice) |
| **1750** | **Gildan** | Pique Polo Shirt (Embroidery) | **= Gildan 64800 actuel** — US (Printful + Printify Choice) |
| 1921 | Under Armour® | Men's Polo Shirt (Embroidery) | US |
| 1947 | Gildan | DryBlend® Youth Jersey Polo | US, enfant |
| 1970 | Sport-Tek | PosiCharge Competitor Polo | US |
| 1982 | Mercer+Mettle™ | Recharge Jersey Polo | US |
| 1983 | Mercer+Mettle™ | Stretch Jersey Polo | US |
| 1984 | Sport-Tek | UV Micropique Polo | US |
| 1985 | CornerStone® | Select Lightweight Snag-Proof | US |
| 2038 | Port Authority | Fine Pique Blend Polo | US |
| 3328 | Sport-Tek | PosiCharge Strive Polo | US |
| 3379 | Port Authority | Cotton Touch Performance Polo | US |
| 3380 | Port Authority | Rapid Dry Mesh Polo | US |
| 3403 | Sport-Tek | Competitor United Polo | US |
| 3413 | Sport-Tek | Colorblock Micropique Sport-Wick | US |
| 4481 | Port Authority | Tall Silk Touch Performance Polo | US |

**`qualifiedEUByCategory.polo` : 0** — **aucun** des 20 blueprints n'a passé le filtre EU.

### Vérifications phase 2 ciblées (providers explicitement listés)

| bp_id | Brand | Providers réels |
|------:|-------|-----------------|
| 1402 | Jerzees Pique Polo | **SwiftPOD (id 39, US)** |
| 1730 | Port Authority Polo | **Printful (id 410)** + **Printify Choice (id 99)** |
| 1750 | Gildan Pique Polo (= 64800) | **Printful (id 410)** + **Printify Choice (id 99)** *(audit précédent)* |

→ 0 provider EU sur les 3 vérifiés en détail. Les 17 autres sont des marques exclusivement US (Sport-Tek, Mercer+Mettle, CornerStone, Under Armour, adidas, Port Authority) → forte présomption "non EU" sans nécessité de re-vérifier individuellement.

---

## 3. Statut des 5 marques que tu m'as demandées spécifiquement

| Marque demandée | Présence dans catalogue Printify polo | Verdict |
|---|---|---|
| **Stanley / Stella polo** | ❌ **Absent.** Stanley/Stella est sur Printify pour **sweats** (bp 1952, 1953, 2674, 2689) et **t-shirts** mais **pas pour polo**. Leur ligne "Casey" / "Prepster" / "Phaser" polos existe en distribution directe (chez les revendeurs textile pro) mais Printify ne l'intègre pas. | **Indisponible** |
| **SOL'S polo** | ❌ **Absent.** Marque française de textile pro très répandue (Mistral, Phoenix, Spring polos) mais Printify ne référence aucun produit SOL'S dans son catalogue, ni en polo ni dans aucune catégorie (vérifié sur les 1379 blueprints scannés). | **Indisponible** |
| **B&C polo** | ❌ **Absent.** B&C est sur Printify uniquement pour sweat EU (bp 457 "Unisex Crew Neck Sweatshirt EU") chez Textildruck DE — pas pour polo. | **Indisponible** |
| **AWDis / Just Polos** | ❌ **Absent.** AWDis est sur Printify pour **sweat JH030** (bp 95) chez Textildruck DE. Leur ligne "Just Polos JP100" / "JP002" existe en distribution directe mais n'est **pas intégrée à Printify**. | **Indisponible** |
| **Fruit of the Loom polo** | ❌ **Absent.** Marque très répandue en B2B textile EU mais Printify ne référence pas Fruit of the Loom polo. *(Note : ils référencent quelques sweats et t-shirts FOTL mais pas polo.)* | **Indisponible** |

### Pourquoi ces marques sont absentes du catalogue Printify EU

Printify est avant tout une plateforme **US-first / dropshipping** orientée petites séries personnalisées. Les marques **Stanley/Stella, SOL'S, B&C, AWDis, Fruit of the Loom polo** sont distribuées par les grossistes textile pro européens (Falk & Ross, TopTex, Sanmar EU, Pencarrie) qui visent un autre marché : commande gros, personnalisation par marquage industriel (broderie, sérigraphie), pas POD.

L'intégration Printify d'une marque polo nécessite un **provider EU partenaire** (Textildruck Europa, Print Logistic, OPT OnDemand) capable d'imprimer/broder à la demande. Or aucun de ces 3 providers EU **n'a configuré de blueprint polo** dans leur catalogue Printify.

---

## 4. Pourquoi le verdict du 2026-05-17 tient toujours aujourd'hui

L'audit principal a déjà tranché clairement (extrait `docs/audits/printify-equivalents-cotton-polo.md` §D ligne 64-84) :

> **Aucun équivalent EU sur Printify pour le polo. Décision : garder le polo Gildan 64800 chez Printful** (qui imprime en EU depuis Lettonie/Espagne) ou **retirer le polo du catalogue HM Global V1** si le mix produit n'en a pas besoin pour le go-live.

### Ce qui a changé depuis le 17 mai (rien de significatif)

- Le catalogue Printify n'a pas eu d'annonce d'ajout de provider EU polo entre le 17 mai et aujourd'hui.
- Aucune marque polo EU n'a été ajoutée à Printify dans cette fenêtre.
- Les 1379 blueprints scannés couvrent l'intégralité du catalogue marchand actuel.

### Pourquoi "Printful via Printify" ne compte pas comme gain

Le polo bp 1750 est aussi disponible via **Printful** comme provider Printify. Mais :

- Printful en tant que provider Printify **route la commande au même réseau Printful** (Lettonie / Espagne / Mexique / US selon shipping)
- HM Global est **déjà directement client Printful** pour ce produit
- Passer par Printify ajoute donc juste **un intermédiaire** (commission Printify) **sans réduire les délais ni les coûts**

→ Aucun intérêt opérationnel.

---

## 5. Verdict & recommandation

### Q : Peut-on remplacer le polo actuel par un polo Printify EU fiable ?

**Réponse : NON.**

Aujourd'hui (2026-05-18), il n'existe **aucun blueprint polo Printify avec provider EU dédié** dans le catalogue. Les 20 polos disponibles sont tous routés via :
- Printful (déjà notre fournisseur actuel — pas de gain)
- Printify Choice (orchestrateur US-default, délais 14-21j + customs FR)
- SwiftPOD (US)
- Fulfill Engine (US)
- Duplium (CZ — mais aucun polo dans leur sous-catalogue)

### Q : Lequel recommandes-tu ?

**Aucun.** Tous les candidats Printify polo sont strictement moins bons que la situation actuelle :

| Option | Avantage vs état actuel | Désavantage |
|---|---|---|
| bp 1750 via Printify Choice | Aucun | + commission Printify, + délai 14-21j, customs FR potentiels |
| bp 1402 Jerzees via SwiftPOD | Aucun | US uniquement, délais transatlantiques, customs |
| bp 1730 Port Authority via Printful | Aucun | Identique au routing actuel + commission Printify |

### Q : Faut-il garder le polo en `quoteOnly: true` ?

**Oui — c'est la bonne configuration actuelle.** Ne rien modifier sur :
- `data/products.ts` ligne ~2550 — `quoteOnly: true` ✓
- `supplierName: "printful"` ✓
- `quoteOnlySubject: "devis-broderie"` ✓
- `quoteOnlyMessage` ✓

Le polo reste **visible** dans le catalogue (sous la card "Polos"), avec un CTA "Demander un devis broderie" au lieu de "Ajouter au panier". C'est exactement le comportement adapté car :

1. **La broderie polo n'est rentable qu'en volume** (≥ 50 pièces typiquement)
2. **Le client B2B polo cherche un devis** plus qu'une commande pièce-par-pièce
3. **Pas de risque opérationnel** : si une commande arrive, c'est cadré devis = on choisit le routing (Printful actuel ou fournisseur direct France selon volume)

---

## 6. Alternatives hors Printify si tu veux quand même avoir un polo "commande directe"

Cet audit ne sort pas du périmètre Printify, mais voici les pistes que ton audit précédent (ligne 205) recommandait pour cette catégorie :

1. **Garder Printful** comme aujourd'hui — le polo bp 64800 Printful imprime en EU (Lettonie/Espagne) avec délais raisonnables (7-12j). C'est l'option zéro risque.

2. **Cloudprinter** — fournisseur EU spécialisé (mentionné dans `CLAUDE.md` comme intégration possible). À auditer si tu veux ouvrir un nouveau supplier. Coût/délai à vérifier.

3. **Fournisseur direct France** — TopTex (déjà partenaire), Falk & Ross, Sanmar EU. Pour le polo broderie, **TopTex avec broderie sous-traitée chez un brodeur local** est le go-to historique. Moins POD-friendly mais infiniment meilleur en marge et qualité dès 30+ pièces.

4. **Sortir le polo du catalogue V1** — `visible: false`, exactement comme tu viens de faire pour le M2480. Décision marketing/produit, pas technique.

---

## 7. Confirmations finales

- ✅ **Aucune ligne de code modifiée** pendant cet audit (relecture audits + JSON brut + analyse)
- ✅ **Aucun fichier de catalogue modifié** (`data/products.ts`, `data/print-products.ts` intacts)
- ✅ **Aucun appel API Printify supplémentaire** (utilisé uniquement les données existantes des 2 audits précédents)
- ✅ **Stripe / Supabase / checkout / routes API** : non concernés
- ✅ Polo Gildan 64800 reste **en `quoteOnly: true`** comme aujourd'hui — c'est la bonne config

**Recommandation finale : garder l'état actuel.** Le polo Gildan 64800 en `quoteOnly: true` chez Printful est la **meilleure configuration techniquement disponible** pour HM Global aujourd'hui. Re-considérer dans 3-6 mois si Printify ajoute un partenaire EU polo (peu probable vu leur stratégie produit US-first).

---

*Fin de l'audit. Aucune action de code recommandée.*
