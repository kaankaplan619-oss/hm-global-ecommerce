# Roadmap images HM Global — cartographie + plan de génération

> **Date :** 2026-05-20
> **Statut :** audit pur + plan d'action — **aucun fichier code modifié**
> **Périmètre :** toutes les pages publiques du site (40 pages totales, focus sur les 15 pages catalogue/marketing)
> **Outillage disponible côté Claude Code :** lecture/écriture fichiers + conversion sharp WebP/JPG. **Pas d'outil de génération d'image directe** (Midjourney/DALL·E/Firefly se font côté toi, dépôt via Desktop)

---

## 0. Capacités outillage — clarification

### Ce que Claude Code peut faire ici

- ✅ Lecture/écriture fichiers texte (code, prompts, audits)
- ✅ Conversion images via `sharp` (PNG/JPG → WebP/JPG optimisés)
- ✅ Workflow Printify Mockup API (`/api/printify/mockup-pilot`) **déjà branché côté projet** — peut générer des mockups textile via appel API depuis un script Node
- ✅ Inspection visuelle d'images via outil Read (vérification cohérence DA)

### Ce que Claude Code **ne peut pas faire** ici

- ❌ Appel direct à Midjourney / DALL·E / Adobe Firefly (pas d'outil dans la session actuelle)
- ❌ Génération automatique d'images IA via "Workflow Claude" (cet outil n'est pas chargé dans ma session)

### Conséquence pratique pour HM Global

| Type d'image | Méthode de génération | Acteur |
|---|---|---|
| **Mockups textile flat** (color-specific, T-shirts/sweats/hoodies/polos) | **Printify Mockup API** via `/api/printify/mockup-pilot` | Claude Code peut déclencher via script Node |
| **Mockups print éditoriaux** (cartes, flyers, posters, canvas, brochures) | **Midjourney / GPT-Image** + prompts validés | Toi → génération → dépôt Desktop → Claude conversion+dépôt |
| **Photos lifestyle / hero / atelier** | **Midjourney / GPT-Image** (ou shooting pro) | Idem |
| **Conversion + dépôt + branchement code** | Script `sharp` + edit `data/products.ts` ou `IMAGE_VARIANTS_BY_CATEGORY` | Claude Code 100% |

---

## 1. Inventaire actuel — ce qui existe

### Pages du site (40 pages totales)

| Catégorie | Pages | Besoin image |
|---|---|---|
| **Marketing public** | `/`, `/impression`, `/catalogue`, `/catalogue/[category]`, `/produits/[slug]`, `/realisations`, `/a-propos`, `/entreprises`, `/techniques`, `/contact`, `/impression/cartes-de-visite` | ✅ Oui — focus de cette roadmap |
| **Tunnel commande** | `/panier`, `/checkout`, `/checkout/paiement`, `/commande-confirmee`, `/studio/[slug]` | Marginal (UI fonctionnelle) |
| **Compte client** | `/connexion`, `/inscription`, `/mon-compte/*`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe` | Aucune |
| **Légal** | `/cgv`, `/confidentialite`, `/mentions-legales` | Aucune |
| **Admin** | `/admin/*` | Aucune (interne) |
| **Hermès (système agents)** | `/hermes/*` | Aucune (interne) |
| **Dev** | `/dev/mockup-review` | Aucune (interne) |
| **Avis** | `/avis/[orderId]` | Marginal |

### Images existantes — `/public/images/home/` (15 fichiers)

| Fichier | Usage | Statut |
|---|---|---|
| `hm-hero-agence-360.webp` | Hero homepage | ✅ Premium |
| `hm-card-textile-premium-v2.webp` | Card textile QuickEntries | ✅ Premium |
| `hm-card-print-supports-v2.webp` | Card print QuickEntries | ✅ Premium |
| `hm-card-pack-complet.webp` | Card pack QuickEntries | ✅ Premium |
| `hm-textile-hoodie-premium.webp` | Section textile premium homepage | ✅ Premium |
| `hm-macro-textile-logo.webp` | Macro broderie homepage | ✅ Premium |
| `hm-bat-validation.webp` | Section BAT homepage | ✅ Premium |
| `hm-atelier-production-textile.webp` | Section atelier homepage | ✅ Premium |
| `hm-pack-communication-complet.webp` | Section Pack 360 homepage | ✅ Premium |
| `hm-print-cartes-de-visite.webp` | Card "Cartes" `/impression` + QuickEntries | ✅ Premium |
| `hm-print-flyers.webp` | Card "Flyers" `/impression` | ✅ Premium |
| `hm-print-affiches-posters.webp` | Card "Affiches" `/impression` | ✅ Premium |
| `hm-print-toiles-canvas.webp` | Card "Canvas" `/impression` | ✅ Premium |
| `hm-print-cards-invitations-folded.webp` | **P1.1 récent** (cards/invitations, en attente activation `IMAGE_VARIANTS_BY_CATEGORY`) | ✅ Premium |
| `hm-card-print-supports.webp` | (ancien, doublon avec -v2) | ⚠️ À nettoyer V2 |

### Images existantes — `/public/mockups/printify/` (129 fichiers)

- `bella-3001/` : 25 fichiers (5 coloris × 5 angles)
- `gildan-5000/` : 25 fichiers
- `gildan-18000/` : 25 fichiers + version PNG (texturée)
- `gildan-18500/` : 25 fichiers
- `cotton-heritage-m2480/` : 25 fichiers (produit invisible mais mockups préservés)
- `comfort-colors-1717/` : présent
- **Manifest** : `manifest.json` pour cartographie automatique

→ **Couverture textile très solide.** Pas de besoin urgent.

### Images existantes — `/public/mockups/print/` (8 fichiers basse qualité)

- `business-card/carte-visite-premium.webp` (22 KB — bas)
- `flyer/flyer-premium.webp` (19 KB — bas)
- `affiche/affiche-premium.webp` (18 KB — bas)
- `canvas/canvas-premium.webp` (11 KB — bas)

→ **Anciens fallbacks** maintenus pour `STATIC_FALLBACK` rétrocompatibilité. À retirer progressivement à mesure que les nouvelles variantes premium arrivent.

### Logos et assets statiques

- `/public/logo/hm-global-logo.png` ✅ + `hm-global-symbol.png` ✅ (utilisés Header/Footer/Hero fallback)
- `/public/favicon.ico`, `/public/icon.png` (favicons)
- `/public/designs/` (12 SVG : arrow, circle, cross, crown, etc.) — assets studio configurateur

---

## 2. Cartographie des besoins par page

### Homepage `/` — quasi complet ✅

| Section | Image actuelle | Action |
|---|---|---|
| Hero | hm-hero-agence-360 | ✅ OK |
| QuickEntries × 3 | textile-premium-v2 / print-supports-v2 / pack-complet | ✅ OK |
| Textile premium | hoodie-premium + macro-logo | ✅ OK |
| Best-sellers | Mockups Printify dynamiques | ✅ OK |
| Process BAT | bat-validation | ✅ OK |
| Print showcase | 4 cards (cartes/flyers/affiches/canvas) | ✅ OK |
| Atelier | atelier-production-textile | ✅ OK |
| Pack 360 | pack-communication-complet | ✅ OK |
| Trust strip | Icônes lucide (pas d'image) | ✅ OK |
| Final CTA | (pas d'image) | ✅ OK |

**Action homepage : aucune.**

### `/impression` — en cours d'amélioration 🟡

État détaillé dans `docs/audits/impression-image-variants-2026-05-20.md` :
- 5/5 catégories ont 1 visuel premium + 1 fallback médiocre/doublon
- **Plan en cours** : +10 mockups (P1 à P5) pour passer à 3 variantes premium par catégorie
- P1.1 fait, P1.2 en attente, P2-P5 à suivre

**Action `/impression` : continuer le plan en cours (P1 → P5).**

### `/catalogue` + `/catalogue/[category]` — basé sur Printify ✅

- Mockups Printify déjà importés (129 fichiers)
- Pas d'image hero spécifique de page catalogue

**Action `/catalogue` : aucune.**

### `/produits/[slug]` — basé sur Printify + mockups HM ✅

- Image principale : mockups Printify ou hmMockupImages selon supplier
- Galerie : hmMockupGallery avec front/back/detail par couleur

**Action `/produits/[slug]` : aucune.**

### `/realisations` — ⚠️ Manque de vraies photos clients

| Section | Image actuelle | Manque |
|---|---|---|
| Cas client softshell | `/images/products/jui62/PS_CGJUI62_NAVY-NEONGREEN.avif` (packshot fournisseur) | ❌ Photo lifestyle équipe réelle |
| Cas client hoodie | `/images/products/wu620/PS_CGWU620_BLACK.avif` (packshot fournisseur) | ❌ Photo lifestyle équipe réelle |

**Action `/realisations` : générer 3-5 photos lifestyle "cas client" (équipe portant produits HM Global).**

### `/a-propos` — pas d'image actuelle ⚠️

- Pas d'usage Image dans le code (136 lignes, page texte)

**Action `/a-propos` : envisager 2 photos atelier + équipe Souffelweyersheim (priorité moyenne).**

### `/entreprises` — pas d'image actuelle ⚠️

- 347 lignes, page texte
- Cible B2B : restaurants, BTP, clubs, PME, événementiel

**Action `/entreprises` : 2-3 photos "secteurs d'activité" (équipe restaurant, équipe chantier, club sportif).**

### `/techniques` — pas d'image actuelle ⚠️

- 362 lignes, page texte explicative DTF/Flex/Broderie

**Action `/techniques` : 3 photos macro process (DTF transfer, presse à chaud, broderie machine).**

### `/contact` — pas d'image actuelle

- Page formulaire + coordonnées

**Action `/contact` : 1 photo atelier extérieur (façade boutique Souffelweyersheim) — priorité basse.**

### `/impression/cartes-de-visite` — configurateur ⚠️

- Sous-page configurateur avec preview cartes
- Pas d'image hero, BusinessCardVisualizer gère le rendu dynamique

**Action `/impression/cartes-de-visite` : 1-2 photos packshot + 1 macro texture papier (cohérent avec P2 du plan en cours).**

---

## 3. Roadmap priorisée — ce qu'il faut générer

### P1 — Plan en cours (15 mockups print éditoriaux) — VALIDÉ

| # | Catégorie | Mockup | Statut |
|---|---|---|---|
| P1.1 | `cards` | `hm-print-cards-invitations-folded.webp` | ✅ Fait |
| P1.2 | `cards` | `hm-print-cards-invitations-stack.webp` | 🟡 À générer |
| P2.1 | `business-cards` | `hm-print-cartes-detail-macro.webp` | ⏳ À générer |
| P2.2 | `business-cards` | `hm-print-cartes-trio-finitions.webp` | ⏳ À générer |
| P3.1 | `poster` | `hm-print-poster-roll.webp` | ⏳ À générer |
| P3.2 | `poster` | `hm-print-poster-grid-3.webp` | ⏳ À générer |
| P4.1 | `canvas` | `hm-print-canvas-bureau.webp` | ⏳ À générer |
| P4.2 | `canvas` | `hm-print-canvas-pair-wall.webp` | ⏳ À générer |
| P5.1 | `flyer` | `hm-print-flyer-stack-portrait.webp` | ⏳ À générer |
| P5.2 | `flyer` | `hm-print-flyer-recto-verso.webp` | ⏳ À générer |

→ Prompts : `docs/prompts/print-mockups-variants-2026-05-20.md`
→ Effort : 1 image / 10-15 min sur Midjourney v6
→ **Continue ce plan en priorité absolue.**

### P6 — Photos lifestyle "cas client" pour `/realisations` (3-5 nouvelles)

| # | Photo | Brief court |
|---|---|---|
| P6.1 | `hm-realisation-restaurant.webp` | Équipe restaurant 3 personnes en polo brodé HM, ambiance service, lumière naturelle |
| P6.2 | `hm-realisation-club-sport.webp` | Équipe club sportif en sweat noir brodé HM, fond gymnase / vestiaire |
| P6.3 | `hm-realisation-pme-corporate.webp` | Pack textile + cartes + flyers livrés à une PME (open space en arrière-plan flou) |
| P6.4 | `hm-realisation-evenement.webp` | T-shirts staff événement portés par 2-3 personnes, ambiance fête/salon |
| P6.5 | `hm-realisation-asso.webp` | Sweat brodé association, prise en main, fond local associatif |

**Difficulté** : ces photos nécessitent **soit shooting réel** (clients HM avec produits) **soit génération IA réaliste de groupes humains** (risque de l'effet "AI faces" peu convaincant). **Recommandation : commander 1 shooting pro local + IA pour compléter.**

### P7 — Photos process techniques pour `/techniques` (3 macros)

| # | Photo | Brief |
|---|---|---|
| P7.1 | `hm-technique-dtf-transfer.webp` | Macro DTF : feuille de transfert avec gradient HM en cours d'application, table cream, lumière studio 45° |
| P7.2 | `hm-technique-presse-thermique.webp` | Macro presse à chaud : main d'opérateur soulevant la presse, vapeur subtile, t-shirt visible dessous |
| P7.3 | `hm-technique-broderie-machine.webp` | Macro machine broderie en action : aiguilles + fil cyan/violet/magenta en cours de broderie sur tissu noir |

**Effort** : générables via Midjourney avec prompts spécifiques macro industriel.

### P8 — Photos secteurs pour `/entreprises` (3 packshots situation)

| # | Photo | Brief |
|---|---|---|
| P8.1 | `hm-secteur-restauration.webp` | Pack textile + cartes posé sur table restaurant (assiettes en arrière-plan flou, ambiance bistrot) |
| P8.2 | `hm-secteur-btp-chantier.webp` | Pack hoodie + flyer + carte sur établi atelier (clé à molette, gants flou) |
| P8.3 | `hm-secteur-evenementiel.webp` | Pack t-shirts staff + roll-up partiellement visible + brochures programme, ambiance salon |

### P9 — Photos atelier pour `/a-propos` (2 photos premium)

| # | Photo | Brief |
|---|---|---|
| P9.1 | `hm-atelier-facade.webp` | Façade extérieure HM Global Souffelweyersheim, lumière dorée fin d'après-midi |
| P9.2 | `hm-atelier-equipe.webp` | Équipe (silhouettes / arrière-tête, sans visages reconnaissables pour éviter problèmes droit à l'image) au travail dans l'atelier |

**Préférence forte : shooting réel** pour authenticity (vs IA pour atelier qui peut paraître faux).

---

## 4. Plan de travail recommandé (3 phases)

### Phase 1 — Finir le batch print maison (priorité absolue)

| Étape | Mockups | Estimation effort | Méthode |
|---|---|---|---|
| Phase 1.1 | P1.2 (1 image) | 15 min | Midjourney côté toi → dépôt Desktop → conversion Claude |
| Phase 1.2 | P2 (2 images) | 30 min | Idem |
| Phase 1.3 | P3 (2 images) | 30 min | Idem |
| Phase 1.4 | P4 (2 images) | 30 min | Idem |
| Phase 1.5 | P5 (2 images) | 30 min | Idem |
| **Total Phase 1** | **9 mockups** | **~2h30** | Midjourney + Claude conversion |

Après chaque palier (P1, P2, P3, P4, P5), **activation partielle ou totale** de `IMAGE_VARIANTS_BY_CATEGORY` selon ton choix.

### Phase 2 — Lifestyle marketing (priorité moyenne, peut être différée V2)

| Étape | Photos | Méthode recommandée | Effort |
|---|---|---|---|
| Phase 2.1 | `/realisations` (3-5 photos cas client) | **Shooting pro** local (idéal) **ou** Midjourney avec génération humaine prudente | Budget ~400-800 € shoot OU 1-2h Midjourney |
| Phase 2.2 | `/techniques` (3 macros process) | **Midjourney** prompts macro industriel | 45 min |
| Phase 2.3 | `/entreprises` (3 packshots situation) | **Midjourney** (compositions packs, peu d'humains) | 45 min |

### Phase 3 — Atelier authentique (V2, à planifier)

| Étape | Photos | Méthode |
|---|---|---|
| Phase 3.1 | `/a-propos` (façade + équipe) | **Shooting réel obligatoire** (authenticity = différenciation B2B locale) |

---

## 5. Workflow Printify Mockup API — pour textile

Pour rappel et utilisation future si tu ajoutes des produits textile :

### Quand utiliser

- ✅ Ajout d'un nouveau blueprint textile (ex: AWDis JH030 si renégociation prix OK)
- ✅ Changement de provider EU pour un produit existant (nouveau mockup color-specific)
- ✅ Élargissement palette couleurs sur un produit existant

### Comment

```bash
# Endpoint local du projet — déjà branché
POST http://localhost:3000/api/printify/mockup-pilot

# Body
{
  "blueprintId": 95,            // bp AWDis JH030
  "printProviderId": 26,        // Textildruck Europa DE
  "designUrl": "https://...",   // URL design PNG transparent
  "colorIds": ["jet-black", "arctic-white", "oxford-navy"],
  "sizes": ["M", "L"]
}

# Réponse : { mockups: { "jet-black": { front, back, folded } } }
# Puis cleanup automatique du draft (DELETE)
```

**Effort** : 30-60 s par produit (création draft + récupération + cleanup).

### Quand ne PAS utiliser

- ❌ Pour la home / hero (Printify trop "flat catalogue", pas éditorial)
- ❌ Pour `/impression` (Printify ne couvre pas print premium)
- ❌ Pour atelier / équipe / lifestyle (hors scope Printify)

---

## 6. Récap final — ce qu'il faut produire

| Pages | Images manquantes | Priorité | Méthode | Effort |
|---|---:|---|---|---|
| `/impression` (P1 → P5) | **9** (P1.1 fait) | 🔴 P1 | Midjourney maison | ~2h30 |
| `/realisations` | **3-5** | 🟡 P2 | Shoot pro recommandé | 1 journée |
| `/techniques` | **3** | 🟡 P2 | Midjourney macros | 45 min |
| `/entreprises` | **3** | 🟢 P3 | Midjourney compositions | 45 min |
| `/a-propos` | **2** | 🟢 P3 | Shoot réel obligatoire | 1/2 journée |
| `/contact` | **1** (façade) | 🔵 P4 | Photo extérieure rapide | 30 min |
| **TOTAL** | **21-23 images** | | Mix IA + shoot pro | ~3-5 jours étalés |

---

## 7. Recommandation immédiate

**Continuer Phase 1 — P1.2 puis P2 → P5** comme prévu et déjà engagé.

Les Phases 2 et 3 (lifestyle / atelier) peuvent attendre une décision business (budget shooting pro vs IA), sans bloquer le go-live `/impression` qui est la priorité catalogue actuelle.

**Pas d'urgence sur les autres pages** : `/catalogue`, `/produits`, homepage, footer sont 100% OK images-wise.

---

## 8. Confirmations finales

- ✅ **Aucun fichier code modifié** (rapport pur)
- ✅ Aucun appel API supplémentaire (analyse exclusive des données + audits + inventaire local)
- ✅ Aucune zone interdite touchée
- ✅ Stratégie Option C — Hybride affiné respectée
- ✅ Conformité `CLAUDE.md` + `docs/image-rights.md`

---

## 9. Prochaine action utilisateur

**Générer P1.2** (`hm-print-cards-invitations-stack.webp`) selon `docs/prompts/print-mockups-variants-2026-05-20.md` §P1.2.

Quand prête → dépôt Desktop → "P1.2 fait" → je vérifie + convertis + active si tu valides.

*Roadmap livrée. Aucune autre action de code recommandée à ce stade.*
