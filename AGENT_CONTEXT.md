# AGENT_CONTEXT.md — Contexte projet HM Global Textile

> Fichier de référence pour tout agent IA intervenant sur ce projet.
> À lire impérativement avant de commencer ou de clôturer une tâche.

---

## Objectif du site

**HM Global Agence** est un site e-commerce B2B de textile personnalisé.
Les clients (entreprises, associations, équipes) choisissent un produit textile,
sélectionnent une couleur, uploadent leur logo, visualisent un aperçu en temps réel,
génèrent un BAT (Bon à Tirer) et passent commande.

L'agence valide chaque commande manuellement avant production.

---

## Fonctionnement général du site

### Parcours client
1. **Catalogue** → liste de produits par catégorie (t-shirts, hoodies, polos, softshells, polaires, casquettes, sacs, enfants)
2. **Page produit** → sélection couleur, technique (DTF / Flex / Broderie), taille, quantité, emplacement logo (cœur / dos)
3. **Upload logo** → aperçu en surimpression sur le produit (LightMockupPreview ou MockupViewer Fabric.js)
4. **BAT** → génération d'un Bon à Tirer imprimable (modal + window.print)
5. **Panier** → récapitulatif commande
6. **Paiement** → Stripe
7. **Admin** → tableau de bord commandes, validation avant production

### Architecture technique
| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 |
| Canvas mockup B&C | Fabric.js v7 (MockupViewer) |
| Aperçu CSS autres produits | LightMockupPreview (pur CSS) |
| Auth & DB | Supabase |
| Paiement | Stripe |
| Email | Resend |
| State global | Zustand |
| Déploiement | Vercel |

### Fournisseurs produit
| Fournisseur | `supplierName` | Aperçu logo |
|---|---|---|
| B&C Collection | `"falk-ross"` | MockupViewer (Fabric.js) |
| iDeal / TopTex | `"toptex"` | LightMockupPreview (CSS) |

---

## Règle principale

> **Ne jamais corriger une fonctionnalité en cassant une autre.**

Chaque modification doit être vérifiée contre `PROTECTED_FEATURES.md`.
Si une feature protégée est potentiellement impactée, elle doit être testée
avant de déclarer la tâche terminée.

---

## Priorité des fonctionnalités

Du plus critique au moins critique :

1. **Catalogue** — affichage et navigation produit
2. **Page produit** — images par couleur, configurateur
3. **Personnalisation textile** — upload logo, aperçu, positionnement
4. **BAT** — génération et impression du Bon à Tirer
5. **Panier** — ajout, modification, suppression
6. **Paiement** — Stripe checkout
7. **Admin** — validation commandes, tableau de bord
8. **SEO / Performance** — métadonnées, images optimisées

---

## Contraintes permanentes

- **Mobile-first** : toute interface doit fonctionner sur écran < 768px
- **Contrôle admin avant production** : aucune commande ne part en production sans validation humaine
- **Images produit** : ne jamais afficher des visuels B&C sur des produits iDeal, et inversement
- **Personnalisation logo** : le logo uploadé doit toujours être positionnable, déplaçable et redimensionnable
- **TypeScript strict** : `npm run type-check` doit passer à zéro erreur
- **Build propre** : `npm run build` doit passer à zéro erreur avant tout déploiement

---

## Fichiers critiques — ne pas modifier sans raison documentée

| Fichier | Rôle | Risque si modifié |
|---|---|---|
| `data/products.ts` | Source de vérité catalogue | Casse tout le catalogue |
| `data/colorPackshots.ts` | Map packshots CDN par produit/couleur | Casse les images par couleur |
| `lib/product-image-utils.ts` | Priorité image catalogue | Mannequins réapparaissent |
| `components/product/MockupViewer.tsx` | Canvas Fabric.js B&C | Casse l'aperçu logo B&C |
| `components/product/LightMockupPreview.tsx` | Overlay CSS iDeal/autres | Casse l'aperçu logo iDeal |
| `components/product/BATModal.tsx` | Modal impression BAT | Casse la génération BAT |
| `lib/bat-utils.ts` | Types et données BAT | Casse le BAT complet |
| `hooks/useTopTexMedias.ts` | Chargement images par couleur | Casse la galerie couleur |
| `components/product/ProductConfigurator.tsx` | Interface de configuration | Casse toute la personnalisation |
| `store/cartStore.ts` | État panier Zustand | Casse le panier |

---

## Références

- `PROTECTED_FEATURES.md` — liste des fonctionnalités protégées
- `TEST_CHECKLIST.md` — checklist de validation obligatoire
- `AGENT_REPORT.md` — template de rapport de fin de tâche
- `CONTRIBUTING.md` — règles de contribution
