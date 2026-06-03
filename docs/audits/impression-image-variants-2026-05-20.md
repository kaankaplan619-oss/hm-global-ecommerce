# Audit visuel — `IMAGE_VARIANTS_BY_CATEGORY` /impression

> **Date :** 2026-05-20
> **Statut :** audit pur — **aucune modification de code**
> **Périmètre :** `app/impression/page.tsx` (pool d'images par catégorie) + `public/images/home/hm-print-*` + `public/mockups/print/` + `public/print/`
> **Hors scope :** Stripe / Supabase / Gelato API / checkout / textile / admin

---

## 1. Récap pool actuel (`IMAGE_VARIANTS_BY_CATEGORY`)

| Catégorie | UID | Variantes | Type |
|---|---|---|---|
| Cartes de visite | `business-cards` | 2 | 1 premium HM + 1 fallback fournisseur |
| Flyers | `flyer` | 2 | 1 premium HM + 1 premium HM (brochure) |
| Affiches & posters | `poster` | 2 | 1 premium HM + 1 fallback fournisseur |
| Toiles canvas | `canvas` | 2 | 1 premium HM + 1 fallback fournisseur |
| Cartes & invitations | `cards` | 2 | 1 premium HM (brochure) + 1 premium HM (stack cartes) |

---

## 2. Tableau d'audit détaillé

| Catégorie | Image | Dim | Poids | Style visuel | Qualité |
|---|---|---|---|---|---|
| **business-cards #1** | `hm-print-cartes-de-visite.webp` | 1448×1086 | **182 KB** | Stack ~20 cartes + 2 cartes au-dessus, formes violet/cyan/magenta, fond beige éditorial, top-down 25° | ✅ Premium |
| **business-cards #2** | `carte-visite-premium.webp` | 1600×1000 | **23 KB** | Packshot 3D isométrique stylisé, palette ancienne timide | ⚠️ Basse rés / palette obsolète |
| **flyer #1** | `hm-print-flyers.webp` | 1448×1086 | **68 KB** | Éventail 6 flyers A5 gradient HM, blé séché haut-droite, top-down | ✅ Premium |
| **flyer #2** | `hm-card-print-supports-v2.webp` | 1448×1086 | **65 KB** | Brochure A4 ouverte (double page gradient) + brochure fermée + bac béton + stylo plume | ✅ Premium (mais c'est brochure, pas flyer — sémantique discordante) |
| **poster #1** | `hm-print-affiches-posters.webp` | 1448×1086 | **68 KB** | 2 affiches verticales contre mur cream + vase pampa, contre-plongée | ✅ Premium |
| **poster #2** | `affiche-premium.webp` | 1200×1600 | **18 KB** | Packshot 3D isométrique stylisé (portrait), palette ancienne | ⚠️ Basse rés / palette obsolète |
| **canvas #1** | `hm-print-toiles-canvas.webp` | 1448×1086 | **74 KB** | Canvas paysage gradient sur mur cream + console bois + vase pampa, 3/4 vue | ✅ Premium |
| **canvas #2** | `canvas-premium.webp` | 1200×1600 | **11 KB** | Packshot 3D simple, palette ancienne | ⚠️ Très basse rés / palette obsolète |
| **cards #1** | `hm-card-print-supports-v2.webp` | 1448×1086 | **65 KB** | Brochure A4 ouverte + bac béton + stylo | ✅ Premium (mais doublon avec flyer #2) |
| **cards #2** | `hm-print-cartes-de-visite.webp` | 1448×1086 | **182 KB** | Stack cartes (idem business-cards #1) | ⚠️ Doublon strict avec business-cards #1 |

---

## 3. Diagnostic — vraie différence visuelle ou répétition ?

### Catégories où les 2 variantes sont *vraiment* différentes

| Catégorie | Verdict | Détails |
|---|---|---|
| **business-cards** | ⚠️ Différentes mais hétérogènes | Photo éditoriale premium top-down (#1) vs vectoriel 3D isométrique flou (#2). L'écart de qualité est tellement énorme que c'est gênant : si Gelato retourne 3 formats, on alterne entre du Aesop niveau et du wireframe Figma 2020. **Pire qu'une répétition de la même photo premium.** |
| **flyer** | ⚠️ Différentes mais sémantique fausse | #1 = flyers (correct). #2 = brochure A4 (objet différent). Affiché en alternance dans la card "Flyers" → confusion client ("Je commande un flyer ou une brochure ?"). |
| **poster** | ⚠️ Différentes mais hétérogènes | Idem business-cards : photo éditoriale premium vs vectoriel 3D basse résolution. |
| **canvas** | ❌ Quasi inutilisable | Photo intérieur premium (#1) vs vectoriel 3D 11 KB (#2). 11 KB pour 1200×1600 = très flou en grand format desktop. |
| **cards** | ❌ **Faux dédoublonnage** | #1 = brochure (déjà variante #2 de "flyer") · #2 = stack cartes (déjà variante #1 de "business-cards"). **Aucune image réellement dédiée à cards/invitations.** Le pool recycle 2 visuels d'autres catégories. |

### Risque de répétition voisine

| Scénario | Risque |
|---|---|
| Gelato inactif (`STATIC_FALLBACK` seul) | **Nul** — 1 card par catégorie, donc 0 voisin dans la même section |
| Gelato actif, 2 formats par catégorie | **Nul** — `index % 2` alterne 0→1 (toujours différent) |
| Gelato actif, 3+ formats par catégorie | **Faible structurel** — modulo garantit alternance — **mais le rendu visuel reste hétérogène** (mélange premium 65-180 KB + fallback fournisseur 11-23 KB) |
| Section `cards` à 2+ formats | **Doublon inter-catégorie** — affiche les mêmes images que `business-cards` et `flyer` (effet "déjà vu" pour le client qui scrolle) |

### Conclusion brute

Le problème n'est **pas** la répétition adjacente (le modulo la prévient bien). Le problème est :

1. **Qualité hétérogène** entre les 2 variantes de 3 catégories (`business-cards`, `poster`, `canvas`) — la 2e variante (fallback fournisseur 11-23 KB) casse l'impression premium dès qu'elle s'affiche
2. **Sémantique discordante** sur `flyer` (mélange flyer/brochure) et `cards` (recycle stack business-cards + brochure flyer — pas d'image dédiée invitation)
3. **Pool insuffisant** pour donner l'impression "catalogue agence" — chaque catégorie a 1 vrai visuel + 1 doublon ou 1 fallback médiocre

---

## 4. Tableau récap demandé

| Catégorie | Nb produits affichés (V1 fallback) | Nb produits possibles (Gelato actif) | Nb images dispo dans pool | Risque répétition | Risque qualité hétérogène | Mockups manquants à créer |
|---|---:|---:|---:|---|---|---|
| **business-cards** | 1 | 3-6 (formats × finitions) | 2 (1 OK + 1 médiocre) | Nul (modulo) | **Élevé** (premium ↔ vectoriel) | **+1 ou +2 variantes premium** |
| **flyer** | 1 | 3-6 | 2 (1 OK + 1 sémantique fausse) | Nul (modulo) | **Moyen** (premium ↔ brochure) | **+1 variante flyer dédiée** (pas brochure) |
| **poster** | 1 | 3-5 | 2 (1 OK + 1 médiocre) | Nul (modulo) | **Élevé** | **+1 ou +2 variantes premium** |
| **canvas** | 1 | 3-4 | 2 (1 OK + 1 médiocre 11 KB) | Nul (modulo) | **Critique** | **+1 ou +2 variantes premium** |
| **cards** | 1 | 2-3 | 2 (doublons d'autres catégories) | Nul (modulo) | **Élevé** (doublon visuel inter-catégorie) | **+2 variantes dédiées invitations** |

---

## 5. Images orphelines (non utilisées dans `IMAGE_VARIANTS_BY_CATEGORY`)

### `public/print/` (4 illustrations vectorielles, JPG)

| Fichier | Style | Verdict |
|---|---|---|
| `carte-visite-mockup.jpg` | Vectoriel plat : carte blanche + 4 lignes typo stylisées + cercle rose accent | ❌ Style "stock Figma 2020", palette ancienne (rose/violet timide), pas premium |
| `flyer-mockup.jpg` | Vectoriel plat : flyer A4 avec bandeau violet + bouton CTA stylisé | ❌ Idem |
| `affiche-mockup.jpg` | Vectoriel plat : poster avec 3 cercles colorés (blanc/cyan/magenta) | ❌ Idem |
| `canvas-mockup.jpg` | Vectoriel plat : cadre bois + grosse pastille violette | ❌ Idem |

→ **Inutilisables** comme variantes premium. **Recommandation : à supprimer** (ou archiver `public/print/_legacy/`) pour ne pas polluer le repo.

### `public/mockups/print/business-card/carte-visite-render.png` (non utilisée)

→ Variante render du même packshot — peut-être à archiver aussi (non audité visuellement ce tour mais probablement même style basse-rés que `carte-visite-premium.webp`).

---

## 6. Mockups prioritaires à créer

### Stratégie : **3 variantes premium par catégorie** (au lieu de 1 premium + 1 fallback)

Cela donnerait :
- 3 vraies photos éditoriales différentes par catégorie
- Modulo 3 → alternance large même si Gelato retourne 6 formats
- Plus aucun fallback fournisseur basse rés dans le pool actif
- Effet "catalogue agence" plein

**Effort : 11 mockups à créer** (pour passer de 10 actuels à 15 cibles + remplacer les 4 médiocres) :

### Par catégorie — priorité d'action

#### P1 — `cards` (cartes invitations) — critique car pool 100% doublon

| # | Nom de fichier proposé | Composition recommandée |
|---|---|---|
| 1 | `hm-print-cards-invitations-folded.webp` | Carton plié A6 vertical posé à plat + enveloppe assortie + ruban discret, fond cream, gradient HM en couverture |
| 2 | `hm-print-cards-invitations-stack.webp` | Pile de cartes carrées 140×140 avec finition dorure mate, posées en éventail léger, fond beige + brindille pampa |

#### P2 — `business-cards` — éliminer le packshot vectoriel

| # | Nom de fichier proposé | Composition recommandée |
|---|---|---|
| 3 | `hm-print-cartes-detail-macro.webp` | **Macro** texture papier 350 g/m² + coin rond visible + gradient sur la tranche, lumière rasante (close-up qualité) |
| 4 | `hm-print-cartes-trio-finitions.webp` | 3 cartes côte à côte montrant les 3 finitions Mat / Brillant / Coins ronds, fond cream |

#### P3 — `poster` — éliminer le packshot vectoriel

| # | Nom de fichier proposé | Composition recommandée |
|---|---|---|
| 5 | `hm-print-poster-roll.webp` | Poster A3 enroulé partiellement déroulé sur table cream, ruban fin de maintien, lumière studio |
| 6 | `hm-print-poster-grid-3.webp` | 3 affiches alignées contre un mur clair (galerie style expo), 3 compositions gradient différentes |

#### P4 — `canvas` — éliminer le packshot 11 KB

| # | Nom de fichier proposé | Composition recommandée |
|---|---|---|
| 7 | `hm-print-canvas-bureau.webp` | Canvas accroché derrière un bureau créatif (laptop fermé + plante + mug), ambiance lifestyle pro |
| 8 | `hm-print-canvas-pair-wall.webp` | 2 canvas de tailles différentes côte à côte sur mur cream, gradient HM, composition asymétrique |

#### P5 — `flyer` — donner un vrai flyer #2 (pas brochure)

| # | Nom de fichier proposé | Composition recommandée |
|---|---|---|
| 9 | `hm-print-flyer-stack-portrait.webp` | Pile dense de flyers A5 portrait dépliés (≠ éventail #1), vue 3/4, paper grain visible |
| 10 | `hm-print-flyer-recto-verso.webp` | 2 flyers côte à côte montrant recto + verso, fond cream |

### Brochures (catégorie potentielle future)

| # | Nom de fichier proposé | Composition recommandée |
|---|---|---|
| 11 | (existant) `hm-card-print-supports-v2.webp` | Brochure ouverte + fermée + bac béton + stylo. **À déplacer vers catégorie dédiée si on ajoute `brochures` à PRINT_CATEGORIES.** |

---

## 7. Où placer les nouveaux mockups

### Dossier cible recommandé

```
public/images/print/
├── business-cards/
│   ├── hm-print-cartes-detail-macro.webp
│   └── hm-print-cartes-trio-finitions.webp
├── flyer/
│   ├── hm-print-flyer-stack-portrait.webp
│   └── hm-print-flyer-recto-verso.webp
├── poster/
│   ├── hm-print-poster-roll.webp
│   └── hm-print-poster-grid-3.webp
├── canvas/
│   ├── hm-print-canvas-bureau.webp
│   └── hm-print-canvas-pair-wall.webp
└── cards/
    ├── hm-print-cards-invitations-folded.webp
    └── hm-print-cards-invitations-stack.webp
```

**Avantage** : structure miroir des catégories `IMAGE_VARIANTS_BY_CATEGORY` → maintenance facile.

**Alternative** (plus plate, cohérente avec l'existant) :

```
public/images/home/
├── hm-print-cartes-detail-macro.webp
├── hm-print-cartes-trio-finitions.webp
├── hm-print-flyer-stack-portrait.webp
├── hm-print-flyer-recto-verso.webp
├── ... (toutes les nouvelles dans /images/home/)
```

→ Cohérence avec les 5 images premium déjà installées dans `/images/home/` (héritage de l'audit homepage 2026-05-17). **Recommandation : garder `/images/home/`** pour V1 par simplicité.

### Format technique

- Format primaire : **WebP qualité 85** (génération via `sharp`)
- Fallback compat : JPG qualité 92
- Dimensions : 1448×1086 (4:3 paysage, cohérent avec les 5 existantes)
- Poids cible : 60-100 KB en WebP
- Cohérence DA : prompts dans `docs/prompts/print-mockups-prompts.md` (déjà rédigés, ajouter section "variantes" si on génère ces 10 visuels)

---

## 8. Comment brancher proprement dans `IMAGE_VARIANTS_BY_CATEGORY`

Une fois les 10 nouvelles images générées et déposées :

```typescript
const IMAGE_VARIANTS_BY_CATEGORY: Record<string, string[]> = {
  "business-cards": [
    "/images/home/hm-print-cartes-de-visite.webp",     // existant — stack éditorial
    "/images/home/hm-print-cartes-detail-macro.webp",  // NEW P2 — macro texture papier
    "/images/home/hm-print-cartes-trio-finitions.webp",// NEW P2 — 3 finitions côte à côte
  ],
  flyer: [
    "/images/home/hm-print-flyers.webp",               // existant — éventail
    "/images/home/hm-print-flyer-stack-portrait.webp", // NEW P5 — pile portrait
    "/images/home/hm-print-flyer-recto-verso.webp",    // NEW P5 — recto/verso
  ],
  poster: [
    "/images/home/hm-print-affiches-posters.webp",     // existant — 2 affiches mur
    "/images/home/hm-print-poster-roll.webp",          // NEW P3 — poster enroulé
    "/images/home/hm-print-poster-grid-3.webp",        // NEW P3 — 3 affiches galerie
  ],
  canvas: [
    "/images/home/hm-print-toiles-canvas.webp",        // existant — canvas mur
    "/images/home/hm-print-canvas-bureau.webp",        // NEW P4 — canvas lifestyle bureau
    "/images/home/hm-print-canvas-pair-wall.webp",     // NEW P4 — paire canvas asymétrique
  ],
  cards: [
    "/images/home/hm-print-cards-invitations-folded.webp", // NEW P1 — carton plié + enveloppe
    "/images/home/hm-print-cards-invitations-stack.webp",  // NEW P1 — stack cartes carrées
    "/images/home/hm-card-print-supports-v2.webp",         // existant — brochure (en dernier de la rotation pour minimiser le doublon avec flyer)
  ],
};
```

**Effet attendu** :
- Modulo 3 sur chaque catégorie → alternance large
- Plus aucun fallback fournisseur basse résolution actif
- Catégorie `cards` aura enfin **2 images dédiées invitations** (au lieu du recyclage)
- Si Gelato retourne 1 à 6 formats par catégorie, chaque card a une vraie variation visuelle

### Fallback statique inchangé

`STATIC_FALLBACK[uid].image` reste identique. Quand Gelato est inactif, la 1ère image du pool premium s'affiche (image #1 de chaque catégorie). Pas de régression.

---

## 9. Plan d'action proposé (au choix utilisateur)

### Option A — Quick win (effort : faible, ~30 min)

Si tu n'as pas envie de générer 10 nouveaux mockups maintenant :

1. **Retirer les 3 fallback fournisseur** basse rés du pool (`carte-visite-premium`, `affiche-premium`, `canvas-premium`) → garder 1 seule image par catégorie pour ces 3
2. **Renommer la 2e variante de `cards`** (qui est un doublon de `business-cards`) en utilisant simplement `hm-card-print-supports-v2` → pool `cards` = 1 image
3. **Conséquence** : modulo retombe sur la même image quand 2+ formats → mais c'est **mieux qu'alterner premium/médiocre** car au moins la qualité reste uniforme

### Option B — Vraie ambition catalogue (effort : moyen, ~3-4h)

Générer les 10 nouveaux mockups via Midjourney/DALL·E (prompts à adapter depuis `docs/prompts/print-mockups-prompts.md`), les déposer, mettre à jour `IMAGE_VARIANTS_BY_CATEGORY`. **Recommandation forte si l'objectif est "catalogue d'agence premium"**.

### Option C — Minimaliste (effort : nul)

Garder l'état actuel. Le modulo prévient la répétition adjacente. La qualité hétérogène est un compromis acceptable tant que Gelato n'est pas en production avec 3+ formats par catégorie.

---

## 10. Confirmations

- ✅ **Aucune ligne de code modifiée** pendant cet audit
- ✅ `app/impression/page.tsx` intact
- ✅ Stripe / Supabase / Gelato API / checkout / textile / admin / supplierMap : non concernés
- ✅ Doctrine `docs/image-rights.md` respectée (images HM et fournisseur restent dans leurs zones)
- ✅ Conformité règles `CLAUDE.md` : audit pur, périmètre strict, pas d'initiative non demandée

---

*Audit terminé. À toi de choisir l'option A / B / C ou de demander des précisions ciblées sur une catégorie spécifique.*
