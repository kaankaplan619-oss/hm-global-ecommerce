# 04 — Règles MockupViewer

## Statut

**B3.2-A2 validé en production** — le composant est stable et calibré. Ne pas modifier sans raison explicite et audit visuel complet.

## Fichier concerné

```
components/product/MockupViewer.tsx
```

## Bibliothèque

**Fabric.js v6** — API différente de v5. Points clés v6 :
- `FabricImage` (pas `fabric.Image`)
- `canvas.add(obj)` retourne le canvas (chainable)
- `canvas.requestRenderAll()` (pas `renderAll()`)
- Events : `selection:created`, `selection:cleared`
- `discardActiveObject()` pour désélectionner programmatiquement

## Zones calibrées — NE PAS MODIFIER

```typescript
const ZONES = {
  coeur: [0.60, 0.25, 0.14, 0.14],  // [left, top, width, height] en fraction de canvasSize
  dos:   [0.26, 0.13, 0.48, 0.29],
};
```

Ces valeurs ont été calibrées visuellement sur les images mockup réelles. Toute modification nécessite un audit visuel complet sur toutes les couleurs et toutes les vues.

## Comportement logo

- Logo chargé avec `FabricImage.fromURL(url)`
- Positionné au **centre de la zone** avec `originX: "left", originY: "top"` (top-left explicite)
- Scale = **80% des dimensions de la zone** (width et height)
- Formule de positionnement :
  ```
  logoLeft = (lf + wf/2) * canvasSize - (logoScale * nw / 2)
  logoTop  = (tf + hf/2) * canvasSize - (logoScale * nh / 2)
  ```

## Contrôles de sélection

- Par défaut : `hasControls: false, hasBorders: false` (logo non sélectionné = propre)
- `selection:created` → `logo.set({ hasControls: true, hasBorders: true })`
- `selection:cleared` → `logo.set({ hasControls: false, hasBorders: false })`
- `canvas.discardActiveObject()` après `canvas.add(logo)` (pas de sélection automatique)

## Style des contrôles

```typescript
cornerStyle: "circle"
cornerColor: "#b13f74"
borderColor: "rgba(177,63,116,0.6)"
lockRotation: true
lockUniScaling: true
```

## Zone rect (visuel de la zone de placement)

```typescript
fill: "rgba(177,63,116,0.04)"
stroke: "rgba(177,63,116,0.35)"
strokeDashArray: [4, 5]
```
Quasi-invisible — sert uniquement de guide visuel discret.

## À ne jamais faire

- Ne pas modifier les valeurs `ZONES` sans audit visuel sur images réelles
- Ne pas changer `lockRotation` ou `lockUniScaling` sans accord
- Ne pas supprimer la logique `selection:created` / `selection:cleared`
- Ne pas passer à une autre version de Fabric.js sans refonte complète
- Ne pas retirer `discardActiveObject()` après l'ajout du logo
