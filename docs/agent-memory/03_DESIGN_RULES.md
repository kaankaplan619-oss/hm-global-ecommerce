# 01 — Règles Design

## Direction artistique

Le site HM Global Agence doit être **premium, sobre, corporate, propre et moderne**.

Il ne doit **jamais** ressembler à un catalogue fournisseur générique (TopTex, B&C, SanMar, Falk & Ross).

## Principes clés

- **Mobile-first** — toutes les pages doivent être fonctionnelles et belles sur mobile avant d'être optimisées desktop
- **Hiérarchie claire** — titres, sous-titres, CTA lisibles sans effort
- **Cards propres** — pas de surcharge visuelle, espacement généreux
- **CTA visibles** — les boutons d'action (ajouter au panier, configurer, valider) doivent être immédiatement identifiables
- **Confiance et envie d'acheter** — le site cible des pros ; il doit rassurer et convertir

## Couleur accent

```
#b13f74  — rose HM Global
```

Utilisée pour : boutons CTA, contrôles Fabric.js (canvas mockup), bordures de sélection zone placement, éléments d'accentuation.

## Design tokens CSS

Utiliser exclusivement les tokens `--hm-*` définis dans le design system :

```
--hm-surface       (fond principal)
--hm-line          (séparateurs, bordures)
--hm-text-soft     (texte secondaire)
```

Ne jamais hard-coder des couleurs arbitraires sans passer par les tokens ou la couleur accent définie.

## Images fournisseur

- Les images TopTex / Falk & Ross sont **techniquement utiles** (référence coloris, angle packshot) mais **ne sont pas la DA principale**
- Elles ne doivent **jamais remplacer** les images HM Global (`images[]`, `hmHeroImage`, `hmMockupImages`)
- Elles peuvent apparaître en galerie secondaire (`supplierImages[]`) uniquement

## À ne jamais faire

- Ne pas refaire une DA globale sans accord explicite
- Ne pas introduire de style "dropshipping générique" ou "template e-commerce basique"
- Ne pas utiliser de couleurs ou typographies hors design system sans validation
