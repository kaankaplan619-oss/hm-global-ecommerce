# AGENT_CONTEXT.md — Règles projet HM Global Textile

Ce fichier définit les règles invariantes que tout agent IA (Claude Code, ChatGPT, etc.)
doit respecter avant de considérer une tâche comme terminée sur ce projet.

---

## Règles de validation obligatoires

### 1. Personnalisation textile — ne jamais casser
- Le flux logo upload → aperçu → BAT doit toujours fonctionner.
- `LightMockupPreview` : le logo doit rester positionnable sur les zones cœur/dos.
- `MockupViewer` (Fabric.js) : le logo doit rester déplaçable et redimensionnable.
- Le bouton "Prévisualiser le BAT" doit s'afficher dès qu'une couleur et un logo sont sélectionnés.
- `BATModal` doit s'ouvrir, afficher les données correctes, et déclencher `window.print()`.

### 2. Images produit — vérifier le changement par couleur
- Cliquer sur un swatch couleur doit changer l'image principale dans `ProductGallery`.
- Les packshots (`/packshots/PS_*.png`) doivent être prioritaires sur les photos mannequin (`/pictures/`).
- Les produits iDeal (supplierName `"toptex"`) ne doivent jamais afficher des visuels B&C.
- `getProductCatalogImage()` doit retourner un packshot si disponible, sinon `product.images[0]`.

### 3. Mobile + Desktop — toujours tester les deux
- La grille catalogue doit passer en 1 colonne sur mobile, 2 sur md:, 3-4 sur lg:.
- Le configurateur produit doit être utilisable sur mobile (swatches, tailles, quantité).
- Le `BATModal` doit être scrollable sur petits écrans.
- Le `QuoteAssistant` flottant ne doit pas déborder du viewport.

### 4. Build — obligatoire avant de clore une tâche
```bash
npm run build        # Next.js build complet — zéro erreur
npm run type-check   # TypeScript strict — zéro erreur
```
Ne jamais déclarer une tâche terminée sans avoir lancé ces deux commandes.

### 5. Fichiers modifiés — toujours lister
Chaque rapport doit lister exactement les fichiers créés, modifiés ou supprimés,
avec une ligne de description par fichier.

### 6. Tests — toujours distinguer lancés vs non lancés
Indiquer explicitement :
- ✅ Tests lancés et résultats observés
- ⏭ Tests non lancés (avec raison)

### 7. Risques restants — toujours signaler
Signaler tout ce qui pourrait casser à la prochaine modification :
- Dépendances fragiles entre composants
- Données statiques qui pourraient être périmées
- Comportements non testés sur certains navigateurs/appareils

---

## Stack technique de référence

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 |
| Canvas mockup | Fabric.js v7 |
| Auth & DB | Supabase |
| Paiement | Stripe |
| Email | Resend |
| State | Zustand |
| Déploiement | Vercel |

---

## Fichiers critiques — ne pas modifier sans raison claire

| Fichier | Rôle |
|---|---|
| `data/products.ts` | Source de vérité catalogue |
| `data/colorPackshots.ts` | Map packshots CDN par produit/couleur |
| `lib/product-image-utils.ts` | Priorité image catalogue |
| `components/product/MockupViewer.tsx` | Canvas Fabric.js B&C |
| `components/product/LightMockupPreview.tsx` | Overlay CSS iDeal/autres |
| `components/product/BATModal.tsx` | Modal impression BAT |
| `lib/bat-utils.ts` | Types et construction données BAT |
| `hooks/useTopTexMedias.ts` | Chargement images par couleur |

---

## Format de rapport attendu en fin de tâche

Voir `AGENT_REPORT_TEMPLATE.md` — ce format doit être produit dans la réponse finale
de chaque tâche ou dans un fichier `AGENT_REPORT_LATEST.md`.
