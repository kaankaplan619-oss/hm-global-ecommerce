# PROTECTED_FEATURES.md — Fonctionnalités protégées

> Ces fonctionnalités ne doivent **jamais** être cassées par une modification,
> quelle qu'en soit la nature. Toute tâche touchant à ces zones doit inclure
> un test explicite de la fonctionnalité concernée.

---

## 1. Catalogue produit

**Ce qui doit fonctionner :**
- La page `/catalogue` liste tous les produits avec image, nom, prix et badges
- Les pages catégorie (`/catalogue/tshirts`, `/hoodies`, `/polos`, `/softshells`, `/polaires`, `/casquettes`, `/sacs`, `/enfants`) filtrent correctement
- Les cartes produit affichent un packshot isolé (`/packshots/PS_*.png`) quand disponible, sinon la photo mannequin
- Le tri et le filtrage par catégorie fonctionnent

**Composants concernés :**
`ProductCard`, `getProductCatalogImage`, `data/products.ts`

---

## 2. Images produit par couleur

**Ce qui doit fonctionner :**
- Cliquer sur un swatch couleur change l'image principale dans la galerie
- Les packshots iDeal (`PS_IB*.png`) ne s'affichent jamais sur des produits B&C
- Les packshots B&C (`PS_CG*.png`) ne s'affichent jamais sur des produits iDeal
- La galerie affiche les images dans l'ordre : packshot couleur > packshot générique > photo mannequin

**Composants concernés :**
`ProductGallery`, `useTopTexMedias`, `colorPackshots.ts`, `product-image-utils.ts`

---

## 3. Page produit

**Ce qui doit fonctionner :**
- La page se charge correctement pour tous les produits (`/produits/[slug]`)
- La référence, composition, grammage, prix, couleurs et tailles s'affichent
- Le badge stock TopTex s'affiche si `toptexRef` est défini
- Les informations softshell (bandeau broderie recommandée) s'affichent

**Composants concernés :**
`ProductDetailClient`, `ProductConfigurator`, `TopTexStockBadge`

---

## 4. Upload logo

**Ce qui doit fonctionner :**
- Le champ upload accepte les fichiers PNG, JPG, SVG
- Après upload, l'aperçu logo s'affiche immédiatement (LightMockupPreview ou MockupViewer)
- L'URL blob est créée et révoquée proprement (pas de fuite mémoire)
- Le bouton "Prévisualiser le BAT" apparaît dès qu'une couleur ET un logo sont sélectionnés

**Composants concernés :**
`ProductConfigurator`, `ProductDetailClient`, `LightMockupPreview`, `MockupViewer`

---

## 5. Positionnement du logo — LightMockupPreview (iDeal, hoodies, polos, softshells…)

**Ce qui doit fonctionner :**
- Le logo s'affiche à la bonne position selon l'emplacement choisi (cœur / dos / cœur+dos)
- Les positions sont calibrées par catégorie produit (voir `COEUR_BY_CATEGORY`)
- Le sélecteur d'effet lisibilité (Aucun / Contour blanc / Fond blanc) change le rendu du logo
- L'effet se reset automatiquement quand la couleur change (clair → aucun, sombre → contour blanc)

**Composants concernés :**
`LightMockupPreview`, `color-utils.ts`

---

## 6. Déplacement et redimensionnement du logo — MockupViewer (B&C)

**Ce qui doit fonctionner :**
- Le logo uploadé est draggable sur le canvas Fabric.js
- Le logo est redimensionnable avec les poignées Fabric.js
- Le logo reste dans les limites de la zone de marquage
- Le sélecteur Face / Dos change le mockup affiché
- L'effet lisibilité (contour blanc / fond blanc) s'applique correctement

**Composants concernés :**
`MockupViewer`, `color-utils.ts`, `mockup-utils.ts`

---

## 7. BAT — Bon à Tirer

**Ce qui doit fonctionner :**
- Le bouton "Prévisualiser le BAT" s'affiche quand couleur + logo sont sélectionnés
- Le modal BAT s'ouvre avec toutes les informations : référence BAT, produit, couleur, technique, taille, quantité, emplacement, logo, aperçu visuel
- Le bouton "Imprimer / PDF" déclenche `window.print()`
- Le `@media print` masque tout sauf `#bat-print-root`
- La fermeture par Échap ou croix fonctionne

**Composants concernés :**
`BATModal`, `BATPreviewCard`, `bat-utils.ts`, `globals.css (@media print)`

---

## 8. Panier

**Ce qui doit fonctionner :**
- Ajouter un produit au panier depuis la page produit
- Modifier la quantité dans le panier
- Supprimer un article du panier
- Le total se recalcule correctement
- Le panier persiste entre les navigations (Zustand)

**Composants concernés :**
`store/cartStore.ts`, composants panier

---

## 9. Admin

**Ce qui doit fonctionner :**
- L'accès à `/admin` est protégé par authentification Supabase
- Les commandes s'affichent avec statut, produit, client
- La validation / refus de commande fonctionne
- Les notifications (email Resend) partent correctement

**Composants concernés :**
Pages et composants `/admin`, Supabase RLS, Resend

---

## 10. Responsive mobile / desktop

**Ce qui doit fonctionner :**
- Grille catalogue : 2 colonnes sur mobile, 3-4 sur desktop
- Configurateur produit : swatches couleur accessibles au touch, tailles et quantité modifiables
- BAT modal : scrollable sur petits écrans
- QuoteAssistant (bulle flottante) : ne déborde pas du viewport
- Navigation header : menu mobile fonctionnel

**Composants concernés :**
`ProductCard`, `ProductConfigurator`, `BATModal`, `QuoteAssistant`, `Header`

---

## Règle de validation

> Toute tâche modifiant un composant listé ci-dessus **doit** tester
> la fonctionnalité associée et rapporter le résultat dans `AGENT_REPORT.md`.
> Un test non effectué doit être explicitement marqué ⏭ avec la raison.
