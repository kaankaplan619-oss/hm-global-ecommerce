# Audit stratégique — Gelato API peut-elle fournir nos mockups print ?

> **Date :** 2026-05-20
> **Statut :** audit lecture seule — **aucune modification de code**, aucun appel API supplémentaire (réutilisation des données déjà collectées le 2026-05-17 — budget API préservé)
> **Périmètre :** capacités API Gelato pour récupérer ou générer des mockups produits exploitables sur `/impression`
> **Hors scope :** Stripe / Supabase / checkout / textile / admin / catalogue / data/products.ts / app/impression/page.tsx / IMAGE_VARIANTS_BY_CATEGORY

---

## 1. Synthèse en 30 secondes

**Verdict : Solution hybride recommandée.**

- ❌ **Gelato API publique ne fournit AUCUNE image mockup exploitable.** Confirmé par 15 appels API exhaustifs en mai 2026 (audit `docs/audits/gelato-print-images.md`). Aucun champ `image`, `thumbnail`, `preview`, `mockup`, `assets` dans les réponses des endpoints publics.
- ✅ **Gelato API publique est excellente pour : catalogue / prix / commandes / shipping.** Déjà active sur le projet (clé en `.env.local`, `lib/gelato.ts` + `lib/suppliers/gelato/client.ts` branchés).
- ✅ **Mockups maison HM Global (ChatGPT / Midjourney) restent la bonne voie** pour les visuels marketing premium. Cohérence DA totale, contrôle qualité, palette HM respectée.
- 💡 **Stratégie hybride à pérenniser** : Gelato = production engine en backend (catalogue dynamique + commandes), HM Global = visuels marketing en frontend (mockups premium générés en interne).

---

## 2. État Gelato sur le projet HM Global (2026-05-20)

### Configuration active

| Variable env | Présence | Usage |
|---|---|---|
| `GELATO_API_KEY` | ✅ Présente dans `.env.local` | Authentification X-API-KEY sur tous les endpoints |
| `GELATO_API_BASE` | ✅ Présente | Override possible (défaut : `order.gelatoapis.com`) |
| `GELATO_PRODUCT_BASE` | Optionnelle | Défaut : `product.gelatoapis.com` |
| `GELATO_SHIPMENT_BASE` | Optionnelle | Défaut : `shipment.gelatoapis.com` |

→ **API Gelato réellement active**, pas seulement préparée. Le code peut faire des vrais appels en prod.

### Fichiers code utilisant Gelato

| Fichier | Rôle | Endpoints touchés |
|---|---|---|
| `lib/gelato.ts` | Client orders (création commandes) | `order.gelatoapis.com` |
| `lib/suppliers/gelato/client.ts` | Client catalogue + prix + shipping | `product.gelatoapis.com` + `shipment.gelatoapis.com` |
| `lib/suppliers/gelato/types.ts` | Types TypeScript des réponses Gelato | — |
| `lib/suppliers/gelato/adapter.ts` | Adaptateur entre format Gelato et format HM | — |
| `app/api/gelato/products/route.ts` | Endpoint Next.js exposant le catalogue Gelato | `listCatalogs`, `listCatalogProducts` |
| `app/api/gelato/orders/route.ts` | Endpoint création commande | `createOrder` |
| `app/api/gelato/test/route.ts` | Endpoint diagnostic config | — |
| `app/api/gelato/webhook/route.ts` | Webhook événements Gelato | — |
| `app/impression/page.tsx` | Page catalogue dynamique print | `getGelatoProducts()` |
| `components/print/BusinessCardConfigurator.tsx` | Configurateur cartes de visite | Build `productUid` Gelato |
| `app/admin/commandes/[id]/page.tsx` | Détail commande admin | Affichage statut Gelato |

### Endpoints Gelato actuellement utilisés

| Endpoint | Méthode | Usage HM Global |
|---|---|---|
| `product.gelatoapis.com/v3/catalogs` | GET | Liste 62 catalogues print |
| `product.gelatoapis.com/v3/catalogs/{uid}` | GET | Détail catalogue (attributs disponibles) |
| `product.gelatoapis.com/v3/catalogs/{uid}/products:search` | POST | Recherche produits + variants |
| `product.gelatoapis.com/v3/products/{productUid}` | GET | Détail technique produit |
| `product.gelatoapis.com/v3/products/{productUid}/prices` | GET | Prix par pays/devise |
| `shipment.gelatoapis.com/v1/...` | GET | Options shipping |
| `order.gelatoapis.com/v4/orders` | POST | Créer commande |
| `order.gelatoapis.com/v4/orders/{id}` | GET | Statut commande |
| `order.gelatoapis.com/v4/orders/{id}/cancel` | POST | Annulation |

→ **9 endpoints actifs**, tous pour catalogue/prix/orders. **Aucun n'a vocation à fournir des images**.

---

## 3. Réponses aux 6 questions du brief

### Q1 — Gelato propose-t-elle une API de mockups prédéfinis ?

**Non.** Aucun endpoint mockup publié dans la documentation Gelato (v3 Product API, v4 Order API). Audit `docs/audits/gelato-print-images.md` du 2026-05-17 a confirmé : 0 champ image dans les réponses des 9 endpoints publics testés.

### Q2 — Peut-on récupérer automatiquement les images produit Gelato ?

**Non.** Les réponses produit contiennent uniquement :

```json
{
  "productUid": "cards_pf_bb_pt_110-lb-cover-uncoated_cl_4-4_hor",
  "attributes": { "PaperType", "PaperFormat", "ColorType", "Orientation", ... },
  "weight": { "value": 1.341, "measureUnit": "grams" },
  "supportedCountries": ["US", "CA", "PR"],
  "notSupportedCountries": [...]
}
```

Aucun champ `imageUrl`, `thumbnailUrl`, `previewUrl`, `mockup`, `assets`, `productImages`, `displayImage`, ni équivalent. Crawler récursif profondeur 8 sur 18 patterns image-like → **0 match** sur ~50 produits inspectés.

### Q3 — Peut-on générer un mockup avec notre visuel via API ?

**Non.** Pas d'endpoint type `/mockup-generator/create-task` (équivalent Printful) ni `/catalog/.../mockups` (équivalent Printify). Les mockups Gelato sont générés exclusivement :

- Dans **Gelato Studio** (outil interne au dashboard `dashboard.gelato.com`) — pas d'API publique X-API-KEY
- À la commande, à partir du `OrderItem.files[]` (URL PDF/PNG fournie par le marchand) — mais retournés **uniquement comme preview à la production interne**, pas exposés via API

### Q4 — L'API permet-elle seulement commandes/prix/catalogue, ou aussi images ?

**Uniquement commandes / prix / catalogue / shipping.** Pas d'images. Stack API Gelato 2026 :

| Service | Domaine | Permet |
|---|---|---|
| Product API | `product.gelatoapis.com/v3` | Liste catalogues, attributs, dimensions, productUid, prix |
| Order API | `order.gelatoapis.com/v4` | Création/lecture/annulation commandes |
| Shipment API | `shipment.gelatoapis.com/v1` | Tarifs shipping par pays |
| Webhooks | (callbacks) | Événements orders : status, tracking, shipped, delivered |

**Aucun service "Mockup API" ni "Asset API" publié.**

### Q5 — Les images Gelato sont-elles libres/utilisables sur notre site ?

**Question non applicable** — il n'y a pas d'image fournie par l'API Gelato à utiliser. Les visuels sur `gelato.com/print` (pages marketing) sont du contenu HTML statique non destiné au scraping commercial (cf. risques juridiques `docs/audits/gelato-print-images.md` §Risques). À éviter strictement.

### Q6 — Mieux d'utiliser Gelato ou de garder les mockups maison ?

**Garder les mockups maison HM Global.** Détaillé en §5 ci-dessous.

---

## 4. Endpoints Gelato pertinents si trouvés

### Pertinents (à garder pour usage actuel — catalogue / commandes)

| Endpoint | Pertinence HM Global |
|---|---|
| `GET /v3/catalogs` | ✅ Inventaire des familles produit print |
| `POST /v3/catalogs/{uid}/products:search` | ✅ Liste produits + variants dynamiques |
| `GET /v3/products/{productUid}` | ✅ Specs techniques d'un variant précis |
| `GET /v3/products/{productUid}/prices` | ✅ Pricing par pays/devise |
| `GET /v1/shipment-methods` | ✅ Options shipping |
| `POST /v4/orders` | ✅ Création de commande |

### Recherchés mais inexistants (côté image)

| Endpoint hypothétique | Présent ? | Note |
|---|---|---|
| `GET /v3/products/{uid}/mockups` | ❌ N'existe pas | Vérifié, 404 implicite (endpoint non documenté) |
| `GET /v3/products/{uid}/preview-image` | ❌ N'existe pas | — |
| `POST /v3/mockup-generator` | ❌ N'existe pas | Pas d'équivalent Printful Mockup Generator |
| `GET /v3/assets` | ❌ N'existe pas | — |
| `GET /v3/templates` | ❌ N'existe pas | Pas de templates visuels exploitables |

---

## 5. Comparaison Option A vs Option B

### Option A — Utiliser visuels/mockups Gelato

| Critère | Évaluation |
|---|---|
| **Disponibilité** | ❌ **Bloquante** — aucun visuel exposé par l'API publique |
| **Avantages potentiels** | (Hypothétiques si Gelato lançait un Mockup API) : photos officielles cohérentes par produit, mise à jour automatique du catalogue avec les nouveaux SKU |
| **Limites actuelles** | Bloquant : 0 image accessible. La seule alternative serait de scraper `gelato.com/print` — **interdit** (cf. `docs/image-rights.md` règle "Ne pas scraper Google Images" qui s'étend implicitement aux sites tiers) |
| **Qualité visuelle** | Inconnue côté API. Sur dashboard marchand Gelato Studio, les mockups générés depuis fichiers print sont fonctionnels mais pas éditoriaux (pas de scène lifestyle, fond neutre flat) |
| **Risque dépendance** | **Élevé** — toute évolution Gelato (changement endpoints, migration v4, prix API) impacterait nos visuels |
| **Effort d'intégration** | **Impossible aujourd'hui** — pas de surface API à intégrer |
| **Risque légal** | Aucun si rien à intégrer ; **élevé** si on tentait de scraper le site marketing |

**Note :** Cette option n'est pas réellement exécutable. Elle est documentée pour ne pas la rouvrir à chaque nouvelle suggestion stratégique.

### Option B — Mockups maison HM Global (état actuel)

| Critère | Évaluation |
|---|---|
| **Disponibilité** | ✅ Totale — déjà en place pour 5/5 catégories print sur `/impression`, en cours d'extension à 3 variantes par catégorie |
| **Avantages** | (1) **Cohérence DA HM Global** parfaite (palette cyan/violet/magenta, fond cream `#F4ECDE`, lumière 45°, grain unifié) · (2) **Contrôle total** sur composition, angle, ambiance · (3) **Évolutif** — prompts dans `docs/prompts/print-mockups-*.md`, regénérables · (4) **Différenciant marché** — visuels reconnaissables = ce que veut une vraie agence (cf. brief premium) |
| **Limites** | Effort de génération initiale (Midjourney / GPT-Image) — quelques heures par batch · Pas de mise à jour automatique si Gelato ajoute des SKU (mais c'est résiduel : le visuel sert une catégorie, pas un SKU précis) |
| **Cohérence DA** | ✅ **Maximale** — chaque visuel respecte la base DA partagée (`docs/prompts/print-mockups-variants-2026-05-20.md`) |
| **Effort de génération** | Faible-moyen : 10 prompts pour 10 mockups = ~3-4 h Midjourney + 30 min conversion sharp + 5 min intégration code |
| **Contrôle qualité** | ✅ Validation visuelle systématique avant intégration. Pattern déjà en place (sample-first comme on a fait pour les 5 premiers + P1.1) |

---

## 6. Recommandation stratégique

### Conclusion brute

> **Non, Gelato ne suffit pas pour des mockups premium.**
> **Garder la stratégie Option B (mockups maison)** et continuer le plan en cours (P1 → P5 du fichier `docs/prompts/print-mockups-variants-2026-05-20.md`).

### Pourquoi "Solution hybride" est en fait ce qu'on a déjà

Le projet HM Global utilise déjà Gelato et les mockups maison **chacun à leur point fort** :

| Couche | Source | Rôle |
|---|---|---|
| **Catalogue dynamique** (formats, finitions, papier, dimensions) | **Gelato API** | Source de vérité produit. Évite de maintenir un catalogue manuel |
| **Prix unitaire produit** | **Gelato API** + override `SAC_PRICES.toteBio` etc. dans `data/pricing.ts` | Gelato pour cost fournisseur, HM pour PV TTC |
| **Commandes / production** | **Gelato API** (orders v4) | Backend production déclenché après validation client |
| **Visuels marketing produit** | **Mockups maison** (Midjourney + sharp + `IMAGE_VARIANTS_BY_CATEGORY`) | Frontend catalogue éditorial |
| **Shipping rates** | **Gelato API** (shipment v1) | Tarifs par pays |

→ **C'est déjà une solution hybride bien pensée.** Aucun changement architectural requis.

### Plan V1 simple (à conserver)

1. ✅ **Garder Gelato API** pour catalogue dynamique + commandes + shipping (état actuel)
2. ✅ **Garder les mockups maison** pour les visuels frontend `/impression` (état actuel, en cours d'extension)
3. ✅ **Finir le batch P1 → P5** comme prévu (`docs/prompts/print-mockups-variants-2026-05-20.md`) — 10 nouveaux mockups à générer, 1/10 déjà déposé (P1.1)
4. ✅ **Ne pas attendre une "API mockup Gelato"** qui n'arrive pas — la roadmap publique Gelato 2026 n'annonce rien sur ce front

### Ce qu'il ne faut PAS faire

- ❌ Re-tester l'API Gelato pour des mockups (budget API gaspillé — déjà fait 15/15 calls)
- ❌ Scraper `gelato.com/print` ou le dashboard Gelato (cf. doctrine `docs/image-rights.md`)
- ❌ Brancher des visuels Printify ou Printful sur les produits Gelato (incohérence sourcing + risque license)
- ❌ Mélanger des packshots fournisseurs basse résolution (`carte-visite-premium.webp` 22 KB) avec des photos éditoriales premium 65-180 KB dans le même pool — c'est précisément le problème que résout le batch P1 → P5

---

## 7. Confirmations finales

- ✅ **Aucun fichier code modifié** — audit pur
- ✅ **Aucun appel API Gelato supplémentaire** — réutilisation des données 2026-05-17
- ✅ **Aucune zone interdite touchée** : `app/impression/page.tsx`, `IMAGE_VARIANTS_BY_CATEGORY`, `data/products.ts`, Stripe, Supabase, checkout, textile, admin, catalogue → tous intacts
- ✅ Conformité `CLAUDE.md` : périmètre strict, pas d'initiative non demandée, mémoire projet (audit existant 2026-05-17) respectée
- ✅ Doctrine `docs/image-rights.md` rappelée (interdiction scraping)

---

## 8. Conclusion en une phrase pour iPad

> **Gelato API = excellent pour commandes/prix/catalogue, nul pour images. On continue les mockups maison comme prévu (P1.1 déjà fait, P1.2 en attente). C'est déjà une solution hybride bien pensée — pas besoin de changer de stratégie.**

---

*Audit terminé. Aucune action de code recommandée. La génération P1.2 reste la prochaine étape utilisateur.*
