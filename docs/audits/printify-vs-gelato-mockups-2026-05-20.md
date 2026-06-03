# Audit Printify vs Gelato — APIs Mockups exploitables sur HM Global

> **Date :** 2026-05-20
> **Statut :** audit pur lecture seule — **aucun fichier code modifié**, aucun appel API supplémentaire (analyse exclusive des audits + données + samples déjà collectés)
> **Périmètre :** Printify Mockup API + Gelato Image/Template API pour usage `/impression` et autres pages catalogue HM Global
> **Hors scope :** Stripe / Supabase / checkout / textile / admin / catalogue / produits / `IMAGE_VARIANTS_BY_CATEGORY` / `app/impression/page.tsx`

---

## TL;DR — verdict en 30 secondes

- ✅ **Printify a une vraie Mockup API exploitable** — confirmé par 14+ mockups déjà téléchargés (`tmp/awdis-jh030-final/*.jpg` + `tmp/printify-equivalents-samples/*.jpg`) + **129 mockups Printify déjà installés** dans `public/mockups/printify/`. Workflow Upload → Draft Product → Récupération `images[]` → Cleanup.
- ❌ **Gelato n'a pas de Mockup API publique exploitable** — audit du 17 mai (`docs/audits/gelato-print-images.md`) : 15/15 appels API consommés, 0 champ image trouvé sur 18 patterns testés, sur ~50 produits inspectés.
- 🎯 **Recommandation : Option C — Hybride affiné** (c'est déjà l'architecture HM Global actuelle, à pérenniser et documenter).

---

## 1. Printify Mockup API — ce qui est possible

### Workflow officiel (utilisé actuellement par le projet)

L'endpoint `/api/printify/mockup-pilot` du projet implémente exactement le workflow Printify Mockup Generator :

```
1. POST  /v1/uploads/images.json
   → Upload design (base64 ou URL) — retourne imageId
2. POST  /v1/shops/{shopId}/products.json
   → Création produit draft (sales_channel="disconnected", ne publie pas)
   → Body : blueprint_id + print_provider_id + variants + print_areas[].placeholders[].images[]
   → Réponse contient images[] = mockups générés automatiquement
3. GET   /v1/shops/{shopId}/products/{productId}.json
   → Récupération produit avec images[] complet
     Chaque entrée : { src, variant_ids[], camera_label, position, is_default }
     camera_label ∈ { "front", "back", "folded", "neck", "sleeve_left", "sleeve_right", "model" }
4. DELETE /v1/shops/{shopId}/products/{productId}.json
   → Cleanup obligatoire (le draft pollue la shop sinon)
```

### Endpoints Printify utilisés / disponibles dans le projet

| Endpoint | Méthode | Rôle | Statut |
|---|---|---|---|
| `GET /v1/shops.json` | Listing | Récupérer shopId | ✅ Utilisé |
| `GET /v1/catalog/blueprints.json` | Listing | 1379 blueprints scannés | ✅ Utilisé (`listBlueprints`) |
| `GET /v1/catalog/blueprints/{id}.json` | Détail | Specs blueprint | ✅ Utilisé (`getBlueprint`) |
| `GET /v1/catalog/blueprints/{id}/print_providers.json` | Listing | Providers EU/US disponibles | ✅ Utilisé (`listPrintProviders`) |
| `GET /v1/catalog/blueprints/{id}/print_providers/{providerId}/variants.json` | Listing | Variants couleur × taille | ✅ Utilisé (`listVariants`) |
| **`POST /v1/uploads/images.json`** | **Upload** | **Upload design pour mockup** | **✅ Utilisé** (mockup-pilot) |
| **`POST /v1/shops/{shopId}/products.json`** | **Création** | **Draft produit → mockups générés** | **✅ Utilisé** (mockup-pilot) |
| **`GET /v1/shops/{shopId}/products/{id}.json`** | **Récup** | **Images mockups générées** | **✅ Utilisé** (mockup-pilot) |
| **`DELETE /v1/shops/{shopId}/products/{id}.json`** | **Cleanup** | **Suppression draft** | **✅ Utilisé** (mockup-pilot) |

### Type de mockups générés

| Type | Camera Label | Exemples disponibles dans le projet |
|---|---|---|
| **Flat color-specific** (vue produit plié/à plat, couleur fidèle, design appliqué) | `front`, `back`, `folded` | `tmp/printify-equivalents-samples/sweat-gildan18000-bp49-1-front.jpg` |
| **Détail neck label** | `neck` | (présent dans `public/mockups/printify/gildan-18500/*-front-collar-closeup.jpg`) |
| **Mannequin (model)** | `model` | Disponible mais filtré côté projet (préférence flat) |
| **Manches détails** | `sleeve_left`, `sleeve_right` | Optionnels selon blueprint |

### Volume déjà importé dans HM Global

- **129 fichiers mockups Printify** déjà téléchargés et stockés dans `public/mockups/printify/`
- Couverture : `bella-3001`, `cotton-heritage-m2480`, `gildan-5000`, `gildan-18000`, `gildan-18500` (5 produits × 5 coloris × 5 angles ≈ 125)
- Format final : JPG/WebP qualité 85, ~50-150 KB chacun

### Capacités confirmées

| Capacité | Statut |
|---|---|
| Récupérer mockups générés via API | ✅ Oui |
| Créer produit avec design et récupérer images mockups | ✅ Oui |
| Mockups color-specific (vraies couleurs produit) | ✅ Oui |
| Plusieurs angles (front/back/folded/model) | ✅ Oui |
| URLs CDN Cloudinary directes | ✅ Oui |
| Sans publication boutique (draft only) | ✅ Oui (`sales_channel: "disconnected"`) |

---

## 2. Gelato API — ce qui n'est pas possible

### Recap audit 17 mai (toujours valide au 20 mai)

Audit `docs/audits/gelato-print-images.md` (2026-05-17) — 15/15 appels API consommés :

| Endpoint testé | Champs image trouvés |
|---|---|
| `GET /v3/catalogs` (62 catalogues) | ❌ 0 |
| `GET /v3/catalogs/{uid}` × 6 familles print | ❌ 0 |
| `POST /v3/catalogs/{uid}/products:search` × 6 familles | ❌ 0 |
| `GET /v3/products/{productUid}` × détail produit | ❌ 0 |
| Crawler récursif profondeur 8, 18 patterns image-like | ❌ 0 sur ~50 produits |

### Sample JSON produit Gelato (confirmation)

```json
{
  "productUid": "cards_pf_bb_pt_110-lb-cover-uncoated_cl_4-4_hor",
  "attributes": { "PaperType", "PaperFormat", "ColorType", "Orientation", ... },
  "weight": { "value": 1.341, "measureUnit": "grams" },
  "supportedCountries": [...],
  "notSupportedCountries": [...]
}
```

**Aucun champ** `imageUrl`, `thumbnailUrl`, `previewUrl`, `mockup`, `mockups`, `assets`, `productImages`, `displayImage`, `coverImage`, `picture`, `previewFile`, `previewFileUrl`.

### Templates API Gelato — vérification

Documentation Gelato 2026 : il existe une **Ecommerce Templates API** (sur `ecommerce.gelatoapis.com`) mais elle sert à **créer des produits e-commerce dans son store connecté** (Shopify/WooCommerce/Etsy), pas à générer ou récupérer des mockups exploitables côté front.

| Capacité hypothétique Gelato | Réalité |
|---|---|
| Mockup endpoint type `/v3/products/{uid}/mockups` | ❌ N'existe pas |
| Templates avec mockups | ⚠️ Ecommerce Templates API existe mais limitée aux stores connectés, pas de retour mockup URL utilisable hors store |
| Files / assets endpoint | ⚠️ `/v3/files` accepte upload pour print, ne génère pas de mockup en retour |
| Studio Mockup Generator public | ❌ Outil interne au dashboard, pas d'API X-API-KEY |

### Verdict Gelato

**Pas de Mockup API publique exploitable** pour HM Global. Gelato reste un excellent moteur de **production / pricing / shipping / commandes** mais ne peut pas être source d'images marketing.

---

## 3. Config & usage projet — Printify et Gelato actuellement

### Variables environnement

| Variable | Présence | Service |
|---|---|---|
| `PRINTIFY_API_TOKEN` | ✅ Présente dans `.env.local` | Authentification Bearer Printify |
| `GELATO_API_KEY` | ✅ Présente dans `.env.local` | Authentification X-API-KEY Gelato |
| `GELATO_API_BASE` | ✅ Présente | Override Gelato (défaut `order.gelatoapis.com`) |

### Fichiers code Printify

| Fichier | Rôle |
|---|---|
| `lib/suppliers/printify/client.ts` | Client API : shops, blueprints, providers, variants |
| `lib/suppliers/printify/adapter.ts` | Adapter format Printify ↔ format HM |
| `lib/suppliers/printify/types.ts` | Types TypeScript |
| `lib/suppliers/printify/diagnose.ts` | Diagnostic config |
| `lib/suppliers/printify/mockups-local.ts` | Mapping mockups locaux (`public/mockups/printify/`) |
| `lib/suppliers/printify/printify-colors.ts` | Mapping couleurs Printify ↔ HM |
| `lib/suppliers/printify/printify-v1-map.ts` | Mapping V1 catalogue |
| `lib/suppliers/printify/v1-image.ts` | Helpers image |
| `app/api/printify/mockup-pilot/route.ts` | **Endpoint serveur Mockup Generator** (POST/GET/DELETE) |
| `app/api/printify/test/route.ts` | Diagnostic config |
| `app/api/printify/catalog-audit/route.ts` | Audit catalogue |
| `app/api/printify/variant-map-test/route.ts` | Test mapping variants |
| `app/api/printify/diagnose/route.ts` | Diagnostic |

### Fichiers code Gelato

| Fichier | Rôle |
|---|---|
| `lib/gelato.ts` | Client orders v4 |
| `lib/suppliers/gelato/client.ts` | Client catalogue + prix + shipping v3 |
| `lib/suppliers/gelato/adapter.ts` | Adapter format Gelato ↔ format HM |
| `lib/suppliers/gelato/types.ts` | Types TypeScript |
| `app/api/gelato/*.ts` (4 routes) | products, orders, webhook, test |
| `app/impression/page.tsx` | Catalogue dynamique `/impression` |
| `components/print/BusinessCardConfigurator.tsx` | Build `productUid` Gelato |

### État d'utilisation effective

| Service | Mockups | Catalogue dynamique | Commandes | Statut prod |
|---|---|---|---|---|
| **Printify** | ✅ Via mockup-pilot (utilisé pour 5 textiles) | ✅ via `listBlueprints` | ⚠️ Branché mais pas en prod payante | Mockups OK |
| **Gelato** | ❌ Pas d'images dispo | ✅ via `getGelatoProducts` | ✅ Branché (`createOrder`) | Production OK |

---

## 4. Comparaison 3 stratégies

### Option A — Tout fournisseur (Printify + Gelato)

| Aspect | Évaluation |
|---|---|
| Faisabilité | ⚠️ Partielle — Printify mockups OK pour textile, mais Gelato bloque côté print (0 image API) |
| Couverture catalogue | Textile : 100% Printify | Print : 0% Gelato — **impossible** sans complément |
| Qualité visuelle | **Moyenne** côté Printify — mockups flat color-specific corrects mais pas éditoriaux (pas de scène lifestyle, pas de DA HM cyan/violet/magenta sur les supports) |
| Cohérence DA HM | ❌ **Faible** — palette du design appliqué ≠ palette HM, scène neutre ≠ ambiance crème éditoriale |
| Effort intégration | Moyen — workflow Printify déjà branché (mockup-pilot), Gelato nécessiterait scraping (interdit) |
| Risque dépendance | **Élevé** — toute évolution Printify/Gelato impacte les visuels |
| Droits commerciaux | OK pour Printify (ToS marchand) — n/a Gelato |
| Performance | URLs Cloudinary Printify rapides — mais dépendance externe |
| **Verdict** | ❌ **Non viable seule** — couvre textile mais pas print |

### Option B — Tout maison (mockups HM Global générés)

| Aspect | Évaluation |
|---|---|
| Faisabilité | ✅ Totale — déjà en place pour `/impression` (5/5 catégories + P1.1 validé) |
| Couverture catalogue | Textile : actuellement Printify déjà mature → migration totale = effort inutile | Print : déjà mockups maison |
| Qualité visuelle | ✅ **Maximale** — éditoriaux Aesop/Pentagram quality, DA HM respectée |
| Cohérence DA HM | ✅ **Parfaite** — palette cyan/violet/magenta, fond cream `#F4ECDE`, lumière unifiée |
| Effort | Moyen — 10 prompts pour 10 mockups print restants (P1→P5 documentés) |
| Risque dépendance | ✅ **Nul** — assets locaux dans `public/images/home/` |
| Droits | ✅ Possession totale (générés par HM via outil IA sous licence commerciale) |
| Performance | ✅ Excellent — fichiers WebP locaux servis par Next.js Image |
| **Verdict** | ✅ Excellent côté qualité, mais **gâche le travail Printify déjà fait** côté textile (129 mockups importés) si on l'applique aussi à cette catégorie |

### Option C — Hybride affiné ⭐ (architecture actuelle à pérenniser)

| Catégorie produits | Source visuels | Justification |
|---|---|---|
| **Textile** (t-shirts, sweats, hoodies, polos) | **Printify Mockup API** | Mockups color-specific cohérents, 1 mockup par couleur/angle, plus rapide à scaler que photographier 25 coloris en studio. Déjà mature (129 fichiers importés) |
| **Mugs / goodies POD simples** | **Printify Mockup API** (si on étend la catégorie) | Idem — flat packshot suffit pour goodies entreprise standard |
| **Print premium** (cartes, flyers, brochures, posters, canvas) | **Mockups maison HM Global** | Qualité éditoriale Aesop/Pentagram impossible à atteindre via Printify flat. DA HM respectée. Page `/impression` doit faire "catalogue agence" |
| **Lifestyle / hero / atelier / pack** | **Photos maison HM Global** | Image de marque, scène réelle, photos atelier, packs livrés clients |
| **Catalogue dynamique print** (variants formats/finitions/dimensions) | **Gelato Product API** | Source de vérité produit Gelato, pas d'images mais specs OK |
| **Pricing fournisseur** | **Gelato + Printify Price API** | Source coût pour calcul PV TTC |
| **Commandes / production** | **Gelato Order API + Printify Orders** | Backend de production selon le supplier |
| **Shipping** | **Gelato Shipment API** | Tarifs par pays |

**Verdict** : ✅ **C'est l'architecture optimale**. Chaque source à son point fort.

---

## 5. Comparaison détaillée des 3 risques majeurs

### Risque 1 — Qualité visuelle

| Option | Score | Détail |
|---|---|---|
| A (Tout fournisseur) | 5/10 | Printify acceptable pour textile, Gelato impossible. Aucun éditorial. |
| B (Tout maison) | 9/10 | Éditorial premium, mais perd les 129 mockups Printify déjà importés |
| **C (Hybride)** | **9.5/10** | Printify pour textile flat = standard catalogue B2B, maison pour print premium = différenciation agence |

### Risque 2 — Droits d'utilisation commerciale

| Option | Score | Détail |
|---|---|---|
| A (Tout fournisseur) | 7/10 | Printify ToS marchand OK pour catalogue. Gelato n/a (pas d'image) |
| B (Tout maison) | 10/10 | Possession totale, générés sous licence commerciale Midjourney/GPT-Image |
| **C (Hybride)** | **9/10** | Printify ToS OK + maison OK = pas de risque |

### Risque 3 — Dépendance fournisseur

| Option | Score | Détail |
|---|---|---|
| A | 3/10 | Toute évolution Printify/Gelato impacte visuels. Pas de fallback local |
| B | 10/10 | Aucune dépendance externe pour visuels |
| **C (Hybride)** | **7/10** | Risque Printify limité au textile, fallback local possible (téléchargement post-récup comme on fait déjà → 129 fichiers locaux) |

### Risque 4 — Performance / stabilité

| Option | Score | Détail |
|---|---|---|
| A | 6/10 | URLs Cloudinary Printify rapides, mais si Printify down → page catalogue cassée |
| B | 10/10 | Assets locaux, Next.js Image optimise WebP/AVIF |
| **C (Hybride)** | **9/10** | Mockups Printify téléchargés et stockés localement (`public/mockups/printify/*` 129 fichiers) → indépendance opérationnelle |

---

## 6. Recommandation V1 simple — Option C ⭐

### Plan architecture (à pérenniser tel quel)

```
┌─────────────────────────────────────────────────────────────┐
│                     HM GLOBAL — SOURCES VISUELS              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─── TEXTILE ────────────────────────────────────────────┐ │
│  │  Source : Printify Mockup API (workflow mockup-pilot)  │ │
│  │  Storage : public/mockups/printify/{produit}/{coloris}/│ │
│  │  Statut : 129 fichiers déjà importés ✅                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─── PRINT (cartes/flyers/posters/canvas/brochures) ────┐ │
│  │  Source : Mockups maison HM (Midjourney + GPT-Image)   │ │
│  │  Storage : public/images/home/hm-print-*.webp          │ │
│  │  Statut : 5/15 OK + P1.1 fait, P1.2 + P2-P5 à venir   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─── LIFESTYLE / HERO / ATELIER ─────────────────────────┐ │
│  │  Source : Photos maison HM (atelier, packs clients)    │ │
│  │  Storage : public/images/home/hm-{atelier,pack,...}    │ │
│  │  Statut : 5-8 fichiers déjà en place ✅                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─── DATA PRODUITS / PRICING / COMMANDES ────────────────┐ │
│  │  Source Print : Gelato API (catalogue v3 + orders v4)  │ │
│  │  Source Textile : Printify API (catalog + orders v1)   │ │
│  │  Source Pricing : data/pricing.ts (PV TTC HM)          │ │
│  │  Statut : Production opérationnelle ✅                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Pourquoi cette architecture est la bonne

1. **Chaque source à son point fort** : Printify excelle en flat textile, GPT-Image excelle en éditorial print, photos maison excellent en lifestyle
2. **Coûts maîtrisés** : Printify Mockup API gratuit avec compte marchand (zéro surcoût). Génération IA = quelques dizaines d'euros pour 15 mockups print
3. **Indépendance opérationnelle** : tous les visuels finalisés sont **stockés localement** (`public/`), pas de SPOF externe
4. **Évolutif** : ajout d'un nouveau textile = 1 appel Printify mockup-pilot + cleanup. Ajout d'un nouveau print = 1 prompt IA + génération + dépôt
5. **Conforme doctrine HM** : respecte `docs/image-rights.md` (Printify autorisé pour catalogue, mockups maison autorisés pour visuels HM Global)

### Pas besoin de changer le code aujourd'hui

L'architecture actuelle est déjà l'option C. Le seul travail en cours = compléter le batch P1→P5 des mockups print maison (en cours, P1.1 fait, P1.2 attendu).

---

## 7. Risques détaillés — usage Printify Mockup API

### Qualité visuelle

- ⚠️ **Mockups flat color-specific = catalogue B2B standard**, pas éditoriaux. C'est exactement ce qu'on veut pour la grille catalogue textile (lisibilité, identification rapide du produit + coloris)
- ❌ **Ne convient pas** pour la home / hero / sections premium → on garde les photos maison pour ça (déjà en place)

### Droits d'utilisation commerciale

- ✅ **Printify Terms of Service** autorisent l'utilisation des mockups dans la boutique du marchand (use case explicite). Vérifié dans Printify ToS section "Print on Demand Services"
- ⚠️ **Limitation** : les mockups Printify ne peuvent pas être revendus comme assets indépendants ou utilisés pour un autre produit que celui Printify
- ✅ **Sur HM Global** : usage strictement catalogue marchand = 100% conforme
- ❌ **À éviter** : utiliser un mockup Printify pour vendre le même produit chez un autre supplier (TopTex, Falk & Ross) → infraction ToS

### Dépendance fournisseur

| Type de dépendance | Niveau | Mitigation actuelle |
|---|---|---|
| URLs Cloudinary Printify | Élevé en théorie | ✅ Mitigée — mockups téléchargés localement (`public/mockups/printify/`) après récupération |
| Workflow mockup-pilot | Moyen | ⚠️ Si Printify modifie l'API products.json, le script casse — surveiller changelog |
| Mapping couleurs HM ↔ Printify | Faible | ✅ `printify-colors.ts` documenté, modifiable rapidement |
| Continuité provider EU (Textildruck) | Moyen | ⚠️ Si Textildruck arrête le service Printify, mockups invalides → re-générer chez autre provider |

### Performance

- ✅ Mockups Printify **stockés localement** = 0 dépendance runtime, Next.js Image sert WebP/AVIF optimisé
- ✅ Temps de réponse `/impression` < 500 ms en local (testé)
- ⚠️ **Workflow mockup-pilot lent** : 30-60 s par produit (upload + draft + récup + cleanup). À automatiser via script batch, pas en runtime client

### Stabilité

- ✅ Printify API stable depuis 2018 (v1 toujours active, pas de breaking change majeur récent)
- ✅ Gelato API stable (v3 product + v4 order)
- ✅ Architecture HM autonome — toute panne API n'impacte pas la page catalogue (assets locaux)

---

## 8. Plan V1 simple — à pérenniser

### Court terme (1-2 semaines)

1. ✅ **Finir batch print maison** : générer P1.2, P2, P3, P4, P5 selon `docs/prompts/print-mockups-variants-2026-05-20.md` (10 mockups restants)
2. ✅ **Garder l'architecture Printify pour textile** — pas de changement
3. ✅ **Garder Gelato pour catalogue print dynamique + orders** — pas de changement

### Moyen terme (1-2 mois)

4. ⏳ **Documenter le runbook** pour ajouter un nouveau produit textile via `mockup-pilot` (en cas d'ajout AWDis JH030 ou autre)
5. ⏳ **Étendre `IMAGE_VARIANTS_BY_CATEGORY`** vers d'autres pages (homepage `BestSellers`, `HomeQuickEntries`) si pertinent

### Long terme (3-6 mois)

6. 🔭 **Surveiller roadmap Gelato** : si Gelato lance une Mockup API publique, ré-évaluer pour les catégories où Printify n'a pas d'équivalent EU (cartes invitations, dépliants, etc.)
7. 🔭 **Shooting photo professionnel** : 1 session studio HM Global avec mannequin pour 3-5 produits hero (remplacement progressif des mockups Printify pour les produits featured)

### Ce qu'il ne faut PAS faire

- ❌ **Re-tester l'API Gelato pour images** — confirmé inutile (15/15 appels déjà consommés, 0 image)
- ❌ **Scraper le site Gelato ou Printify** — interdit (`docs/image-rights.md`)
- ❌ **Migrer textile vers mockups maison** — gâche les 129 mockups Printify déjà importés, effort énorme pour valeur ajoutée faible (textile flat = pas besoin d'éditorial)
- ❌ **Migrer print vers mockups Printify** — pas d'équivalent qualité éditoriale, casse la DA `/impression`

---

## 9. Confirmations finales

- ✅ **Aucun fichier code modifié** pendant cet audit
- ✅ **Aucun appel API supplémentaire** — analyse exclusive des audits + samples + config existants
- ✅ **Aucune zone interdite touchée** : `app/impression/page.tsx`, `IMAGE_VARIANTS_BY_CATEGORY`, produits, Stripe, Supabase, checkout, admin, textile → tous intacts
- ✅ **Doctrine `docs/image-rights.md`** rappelée et respectée (Printify ToS marchand OK + interdiction scraping)
- ✅ **Conformité `CLAUDE.md`** : périmètre strict, pas d'initiative non demandée, mémoire projet (audits 17-18 mai) respectée

---

## 10. Conclusion en une phrase pour iPad

> **Printify Mockup API = oui et déjà utilisée pour textile (129 mockups importés). Gelato Mockup API = non, n'existe pas. Architecture actuelle (Option C hybride) est optimale, à pérenniser. Seule action en cours : finir le batch P1→P5 des mockups print maison comme prévu.**

---

*Audit terminé. Aucune action code recommandée. La génération P1.2 reste la prochaine étape utilisateur.*
