# 06 — Zones Interdites

Liste des fichiers, zones et comportements à **ne jamais modifier** sans demande explicite de l'utilisateur.

---

## Composants — Ne pas toucher

### `components/product/MockupViewer.tsx`
- B3.2-A2 validé en production
- Calibration des zones cœur/dos fine et approuvée
- Toute modification = risque de casser le positionnement logo

### Zones calibrées Fabric.js
```
coeur: [0.60, 0.25, 0.14, 0.14]
dos:   [0.26, 0.13, 0.48, 0.29]
```
Ne jamais changer ces valeurs sans audit visuel sur toutes les couleurs et vues.

---

## Infrastructure — Ne pas toucher

### `lib/uploadLogo.ts`
- Logique d'upload Supabase validée
- RLS configurée et testée
- Modifier = risque de casser l'upload logo en production

### `app/api/toptex/enrichment/[sku]/route.ts`
- Fix TopTex 502 validé (commit `6261eaa`, déployé)
- L'early return `if (!process.env.TOPTEX_API_KEY)` est intentionnel
- Ne pas le retirer — il évite des erreurs console 502 en production

### Variables Vercel Production
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
Ne pas modifier sans coordination explicite — un mauvais changement casse l'auth et l'upload en production.

---

## Catalogue produits — Ne pas toucher

### Produits avec `visible: false`
- Ne jamais les rendre visibles sans validation manuelle par l'utilisateur
- Ces produits sont masqués pour une raison (zone de marquage illisible, validation en cours, photos insuffisantes)

### Images principales `images[]`
- Ne jamais les remplacer par des images fournisseur (TopTex, Falk & Ross)
- Les images fournisseur vont dans `supplierImages[]` uniquement

---

## Design — Ne pas toucher

- Ne pas refaire une DA globale sans accord explicite
- Ne pas modifier les design tokens `--hm-*` sans discussion
- Ne pas changer la couleur accent `#b13f74` sans validation

---

## Règle générale

> **Si ce n'est pas explicitement dans la tâche demandée, ne pas modifier.**

Préférer poser la question plutôt que de modifier par initiative quelque chose qui n'est pas dans le périmètre.
