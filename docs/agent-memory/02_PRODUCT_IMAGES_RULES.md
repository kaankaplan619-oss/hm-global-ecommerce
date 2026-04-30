# 02 — Règles Images Produits

## Structure des champs image sur `Product`

| Champ | Rôle | Priorité |
|---|---|---|
| `images[]` | Images principales HM Global (`/images/products/...`) | **Principale — toujours utilisée** |
| `hmHeroImage` | Image hero dédiée par produit | Vitrine produit |
| `hmMockupImages` | Record `colorId → chemin /public/mockups/` — mockup par couleur | Canvas mockup |
| `supplierImages[]` | Images secondaires fournisseur (TopTex, Falk & Ross) | Galerie technique secondaire |
| `toptexRef` | Référence catalogue TopTex (ex. `IB320`) | Référence interne uniquement |
| `toptexUrl` | URL fiche TopTex | Référence interne uniquement |

## Règles impératives

1. **Ne jamais remplacer `images[]` par des images fournisseur** — les images TopTex vont dans `supplierImages[]` uniquement
2. **Un produit n'est visible dans le catalogue** (`visible: true`) **que si la zone de marquage est clairement visible** sur la photo principale (cœur ou dos lisible, pas de flou, pas de surimpression)
3. **Les images TopTex sont utiles techniquement** (angles, coloris) mais pas forcément esthétiques — ne pas les pousser en avant
4. **`hmMockupImages`** est prioritaire sur le rendu canvas Fabric.js — si un mockup par couleur est disponible, il est utilisé à la place de l'image générique

## Exemple de structure correcte

```typescript
{
  images: ["/images/products/tu01t-blanc-face.jpg"],  // HM Global
  hmHeroImage: "/images/products/tu01t-hero.jpg",
  hmMockupImages: {
    "blanc": "/mockups/tu01t-blanc.png",
    "noir": "/mockups/tu01t-noir.png",
  },
  supplierImages: [
    "https://cdn.toptex.io/images/tu01t-packshot-face.jpg",
  ],
  toptexRef: "CGTU01T",
  toptexUrl: "https://...",
}
```

## À ne jamais faire

- Ne pas mettre des URLs TopTex dans `images[]`
- Ne pas rendre visible un produit dont la zone de marquage est illisible
- Ne pas supprimer `hmMockupImages` d'un produit déjà configuré sans vérification du canvas
