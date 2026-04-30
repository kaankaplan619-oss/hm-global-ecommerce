# 03 — Règles Catalogue

## Catégories autorisées

```typescript
type ProductCategory =
  | "tshirts"
  | "hoodies"
  | "softshells"
  | "polos"
  | "polaires"
  | "casquettes"
  | "sacs"
  | "enfants";
```

Ne pas créer de nouvelle catégorie sans validation — toute nouvelle catégorie nécessite une route `/catalogue/[slug]` et des assets visuels associés.

## Tiers produit

| Tier | Description |
|---|---|
| `appel` | Entrée de gamme — prix attractif, trafic |
| `standard` | Volume principal des ventes |
| `premium` | Finition haut de gamme, broderie, matière noble |

## Visibilité produit — règle stricte

```typescript
visible?: boolean
```

- **`visible: false`** → produit masqué du catalogue public, même s'il est dans la BDD
- **`visible: true`** ou **champ absent** → produit visible (rétrocompatibilité)
- **Ne jamais rendre visible** un produit dont la zone de marquage est floue ou absente sur la photo principale

## Placements

```typescript
type Placement = "coeur" | "dos" | "coeur-dos";
```

- `coeur` — petite zone avant (poitrine gauche)
- `dos` — grande zone dos (surface complète)
- `coeur-dos` — les deux combinés (surcoût)

## Techniques

```typescript
type Technique = "dtf" | "flex" | "broderie";
```

- **DTF** — populaire, couleurs illimitées, tout type de tissu
- **Flex / Vinyle** — logos simples, monochromes ou bicolores
- **Broderie** — finition premium, textiles épais (polo, softshell)

## Règles éditoriales catalogue

- Le catalogue doit rester **simple, premium et orienté conversion**
- Ne pas surcharger avec des produits non validés visuellement
- Chaque produit affiché doit avoir au minimum : image claire, coloris disponibles, technique possible
- Le badge (`badge?: string`) sert à mettre en avant : `"Bestseller"`, `"Nouveau"`, `"Premium"`

## À ne jamais faire

- Ne pas afficher un produit avec `visible: false`
- Ne pas créer un produit sans image principale lisible
- Ne pas ajouter une catégorie hors de la liste autorisée sans discussion
