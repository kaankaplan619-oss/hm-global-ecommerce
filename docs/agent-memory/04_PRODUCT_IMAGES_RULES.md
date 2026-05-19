# 02 — Règles Images Produits

## Doctrine V1

Le site doit pouvoir vendre rapidement avec des images fournisseur propres, tout en reservant la personnalisation logo client aux images maitrisees par HM Global.

- Images fournisseur = catalogue, fiches produits, galerie produit, reassurance client.
- Images HM Global = atelier de personnalisation, previsualisation logo client, BAT Sharp HD, admin production.
- Aucun logo client ne doit etre pose sur une image fournisseur sans autorisation ecrite.
- Documentation de reference : `docs/image-rights.md`.

## Structure des champs image sur `Product`

| Champ | Rôle | Priorité |
|---|---|---|
| `images[]` | Images catalogue/fiches produits existantes. Peut contenir des images fournisseur autorisees ou des images HM selon le produit. | Galerie catalogue actuelle |
| `supplierImages[]` | Images fournisseur explicites (TopTex, Falk&Ross, B&C, Printful) | Catalogue/fiches/galerie uniquement |
| `hmHeroImage` | Image hero HM Global dédiée par produit | Vitrine produit si source HM |
| `hmMockupImages` | Record `colorId → chemin /public/mockups/` — mockup HM par couleur | Atelier/BAT uniquement |
| `hmMockupImagesBack` | Record `colorId → chemin /public/mockups/` — dos HM par couleur | Atelier/BAT uniquement |
| `toptexRef` | Référence catalogue TopTex (ex. `IB320`) | Référence interne uniquement |
| `toptexUrl` | URL fiche TopTex | Référence interne uniquement |

## Structure cible des dossiers

```txt
public/supplier-images/toptex/{productSlug}/
public/supplier-images/falkross/{productSlug}/
public/supplier-images/printful/{productSlug}/

public/mockups/hm/textile/{productSlug}/{color}/front.webp
public/mockups/hm/textile/{productSlug}/{color}/back.webp
```

## Règles impératives

1. **Images fournisseur autorisees pour vendre** : catalogue, fiches produits, galerie produit et reassurance client.
2. **Images HM Global obligatoires pour personnaliser** : atelier, previsualisation logo client, BAT Sharp HD, admin production.
3. **Ne jamais poser un logo client sur un visuel fournisseur** sans autorisation ecrite du fournisseur ou du titulaire des droits.
4. **Ne pas utiliser Google Images** comme source.
5. **Ne pas scraper des sites tiers**.
6. **Ne pas modifier fortement les packshots fournisseur**.
7. **Ne pas rendre visible un produit avec `visible: false`** sans validation manuelle.
8. **`hmMockupImages` / `public/mockups/hm/textile`** sont reserves a l'atelier/BAT, pas a la simple reassurance catalogue.

## Sources autorisees

Images fournisseur, sous reserve de droits/charte respectes :

- TopTex Phototheque / CDN / API
- Falk&Ross espace client / Support & Downloads
- B&C Marketing Resources Hub
- Printful mockup generator/API pour produits Printful

Images HM Global :

- photos maison
- Blender
- images generees ou retravaillees par HM Global
- assets achetes avec licence commerciale claire

## Print / BAT

- Print V1 Blender assets = visuels marketing / impression.
- Sharp BAT = rendu final HD avec images HM Global uniquement.
- L'atelier reste en 2.5D pour la V1 ; ne pas brancher de 3D complete sans validation.

## Exemple de structure correcte

```typescript
{
  images: ["/supplier-images/toptex/tshirt-bc-exact-190-homme/packshot-front.webp"],
  supplierImages: [
    "/supplier-images/toptex/tshirt-bc-exact-190-homme/packshot-front.webp",
    "/supplier-images/toptex/tshirt-bc-exact-190-homme/detail-col.webp",
  ],
  hmMockupImages: {
    "blanc": "/mockups/hm/textile/tshirt-bc-exact-190-homme/blanc/front.webp",
    "noir": "/mockups/hm/textile/tshirt-bc-exact-190-homme/noir/front.webp",
  },
  hmMockupImagesBack: {
    "blanc": "/mockups/hm/textile/tshirt-bc-exact-190-homme/blanc/back.webp",
    "noir": "/mockups/hm/textile/tshirt-bc-exact-190-homme/noir/back.webp",
  },
  toptexRef: "CGTU01T",
  toptexUrl: "https://...",
}
```

## À ne jamais faire

- Ne pas utiliser une image fournisseur comme base de personnalisation logo client
- Ne pas rendre visible un produit dont la zone de marquage est illisible
- Ne pas supprimer `hmMockupImages` d'un produit déjà configuré sans vérification du canvas
- Ne pas migrer ou remplacer des images en masse sans validation
- Ne pas modifier `MockupViewer.tsx` ni les zones Fabric.js pour une simple mise a jour catalogue
