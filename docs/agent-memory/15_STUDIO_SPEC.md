# Studio de personnalisation — Spécification technique
**Version 1.0 — Mai 2026**

---

## Résumé

Page dédiée `/studio/[slug]` — studio plein écran en 3 colonnes permettant au client de personnaliser un produit textile avant de l'ajouter au panier. Remplace la personnalisation basique de la fiche produit par une interface style Canva.

---

## Route & paramètres

```
/studio/[slug]?couleur=noir&taille=L&technique=dtf&quantite=10&placement=coeur
```

- `slug` : identifiant produit (ex. `tshirt-bc-exact-190-homme`)
- `couleur` : ID coloris (ex. `noir`, `marine`, `blanc`)
- `taille` : taille sélectionnée (ex. `S`, `M`, `L`)
- `technique` : `dtf` | `flex` | `broderie`
- `quantite` : nombre de pièces
- `placement` : `coeur` | `dos` | `coeur-dos`

Entrée : bouton **"🎨 Personnaliser mon article"** sur la fiche produit `/produits/[slug]`.
Sortie : retour fiche produit avec logo info en query params ou sessionStorage → bouton "Commander" actif.

---

## Layout 3 colonnes

```
┌──────────────────────────────────────────────────────────────┐
│  ← Retour     STUDIO DE PERSONNALISATION    [✅ Valider]     │
├─────────────┬──────────────────────────┬─────────────────────┤
│             │                          │                     │
│  OUTILS     │  [DEVANT] [DOS]          │  MON DESIGN         │
│             │                          │                     │
│  📁 Logo    │  ┌────────────────────┐  │  Éléments ajoutés   │
│             │  │  image vêtement    │  │  avec miniature     │
│  🔤 Texte   │  │                    │  │                     │
│             │  │  zone marquage     │  │  ─────────────────  │
│  ⭐ Designs │  │  ┌──────────┐      │  │  Récapitulatif      │
│  prédéfinis │  │  │ éléments │      │  │  Technique • Coul.  │
│             │  │  └──────────┘      │  │  Taille • Qté       │
│  🎨 Couleur │  └────────────────────┘  │  Prix unitaire      │
│  du texte   │                          │  Total TTC          │
│             │  [↩ Centrer][🗑][⧉ Dup] │                     │
│             │                          │  [✅ VALIDER]       │
└─────────────┴──────────────────────────┴─────────────────────┘
```

- **Mobile** : empilé verticalement (canvas en haut, outils en bas, résumé dessous)
- **Tablette** : 2 colonnes (outils + canvas | résumé)
- **Desktop** : 3 colonnes

---

## Panneau gauche — Outils

### 1. Upload logo
- `<input type="file" accept="image/png,image/svg+xml,image/jpeg">`
- Avertissement non-bloquant si PNG < 300px : "⚠️ Résolution faible — résultat d'impression possiblement flou"
- Supabase storage upload au moment de la validation (pas au dépôt)
- Preview locale via `URL.createObjectURL()`

### 2. Ajout de texte
- Input texte libre + sélecteur de police (3 polices max : Inter, serif, mono)
- Color picker couleur du texte (6 presets HM + input custom)
- Taille : slider 12→120px
- Ajoute un `fabric.IText` au canvas

### 3. Bibliothèque designs prédéfinis
- ~20 SVG dans `/public/designs/` (étoiles, ballons foot, formes géo, couronnes, flèches, logos sport)
- Chargés via `fabric.loadSVGFromURL` ou `FabricImage` 
- Grid d'icônes cliquables → ajout au centre du canvas

### 4. Couleur du texte / effets logo
- Reprendre les `EFFECT_OPTIONS` de `lib/color-utils.ts` (none, white-outline, white-bg)
- Color picker hex (#xxxxxx) pour les textes

---

## Canvas central — Fabric.js

### Base technique
- Reprendre **exactement** les patterns de `components/product/MockupViewer.tsx`
- Canvas init via ResizeObserver (responsive)
- Image vêtement en fond (non sélectionnable)
- Zone de marquage rectangle pointillé (existant)
- Import dynamique `import("fabric")` pour éviter SSR crash

### Objets canvas
- **Logo** : `FabricImage` — drag, resize proportionnel (`lockUniScaling: true`), rotate libre
- **Texte** : `fabric.IText` — éditable double-clic, drag, resize, rotate
- **SVG design** : `FabricImage` ou `fabric.Group` — drag, resize, rotate

### Contrôles sélection
- Objets sans handles par défaut (apparence aperçu propre)
- Au clic → `hasControls: true`, `hasBorders: true`
- Click ailleurs → retour mode aperçu

### Toolbar flottante (au-dessus de l'objet sélectionné)
- Centrer horizontalement dans la zone
- Supprimer l'objet (`canvas.remove(activeObject)`)
- Dupliquer l'objet

### Toggle Devant/Dos
- Même logique que MockupViewer (placement coeur ↔ front, dos ↔ back)
- Les objets canvas sont **conservés** lors du toggle (persistent state)

### Export canvas PNG
```typescript
// Haute résolution
const dataURL = canvas.toDataURL({
  format: 'png',
  multiplier: 2, // 2x pour qualité impression
});
```

---

## Panneau droit — Récapitulatif

- Liste des éléments ajoutés (miniature 32px + type + bouton supprimer)
- Séparateur
- Rappel commande :
  - Technique (DTF / Flex / Broderie)
  - Couleur (dot + label)
  - Taille
  - Quantité
  - Prix unitaire TTC
  - **Total TTC** (bold)
  - Livraison offerte si ≥ 10 pièces (badge vert)
- Bouton **"✅ Valider ma personnalisation"**

---

## Flow de validation

1. User clique "✅ Valider ma personnalisation"
2. Export canvas PNG (`toDataURL`, multiplier 2)
3. Conversion dataURL → Blob → File
4. Upload vers Supabase Storage (`customer-logos` bucket) via `getSupabaseBrowserClient()`
5. Récupérer l'URL publique Supabase du PNG exporté
6. Stocker les infos en `sessionStorage` :
```json
{
  "logoFileUrl": "https://...supabase.co/storage/v1/object/public/customer-logos/...",
  "logoFileName": "studio-export-[timestamp].png",
  "logoFilePath": "studio-exports/[timestamp].png",
  "logoFileType": "image/png",
  "logoFileSize": 123456,
  "batRef": "STUDIO-[timestamp]",
  "logoPlacementTransform": { ... }
}
```
7. Redirection vers `/produits/[slug]?couleur=...&taille=...&technique=...&quantite=...&studio=1`
8. Sur la fiche produit : détecter `studio=1` → lire sessionStorage → pré-remplir le panier

---

## Fichiers à créer

```
app/
  studio/
    [slug]/
      page.tsx             ← server component (récupère product)
      _studio-client.tsx   ← client principal (3 colonnes)

components/
  studio/
    StudioToolsPanel.tsx   ← colonne gauche
    StudioCanvas.tsx       ← canvas Fabric.js étendu
    StudioSummaryPanel.tsx ← colonne droite + valider
    StudioHeader.tsx       ← header retour + titre + CTA valider

public/
  designs/
    star.svg
    football.svg
    crown.svg
    arrow-right.svg
    heart.svg
    lightning.svg
    diamond.svg
    shield.svg
    (... 12-20 fichiers SVG simples)
```

---

## Contraintes techniques

- `"use client"` uniquement sur les composants qui en ont besoin
- Fabric.js importé dynamiquement (éviter SSR crash)
- `ssr: false` sur le composant principal si nécessaire (comme pour Stripe)
- Ne pas casser MockupViewer (il reste sur la fiche produit)
- Réutiliser `getProductCatalogImage()` et `COLOR_PACKSHOTS` pour l'image de fond du canvas
- Réutiliser `formatPrice()` pour l'affichage des prix
- TypeScript strict — zéro `any` sauf pour les objets Fabric.js (pattern existant)

---

## Statut

- [ ] Spec documentée ✅ (ce fichier)
- [ ] SVG designs créés dans `/public/designs/`
- [ ] `page.tsx` route serveur
- [ ] `_studio-client.tsx` layout 3 colonnes
- [ ] `StudioCanvas.tsx` canvas Fabric.js
- [ ] `StudioToolsPanel.tsx` outils
- [ ] `StudioSummaryPanel.tsx` résumé + validation
- [ ] Flow validation → Supabase → sessionStorage → redirect
- [ ] Bouton "Personnaliser" sur la fiche produit
- [ ] Lecture sessionStorage sur la fiche produit
