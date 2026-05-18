# IMAGE_ASSETS_RULES — Règles assets images (commit / Vercel)

> Complément à `02_PRODUCT_IMAGES_RULES.md` (règles métier sur les champs `images[]`, `hmMockupImages`, etc.).
>
> Ce fichier est centré sur **quoi commiter** et **comment éviter les 404 sur Vercel**.

---

## Règle n°1 — Les images dans `public/` doivent être commitées si elles sont référencées par du code tracké

**Symptôme typique** : composant affiche **"Visuel à venir"** ou bien l'image ne charge pas → 404.

**Cause** : le fichier image existe dans `public/...` localement mais n'a pas été commité. Vercel sert une 404 → Next/Image → `onError` → fallback "Visuel à venir".

**Vérification rapide** :
```bash
# Le fichier est-il commité ?
git ls-files --error-unmatch public/mockups/printify/bella-3001/blanc-front.jpg

# Si la commande exit 1 et dit "did not match any file" → UNTRACKED → à commiter
```

---

## Règle n°2 — Les manifests JSON sans les images ne suffisent pas

Le code peut importer un `manifest.json` qui liste des paths d'images. Le manifest est petit (~12 Ko) et peut être commit isolément, mais **les images référencées par le manifest doivent aussi exister côté Vercel**.

**Cas vécu sur HM Global** :
- Commit `7a2bd62` a poussé `public/mockups/printify/manifest.json` (path mapping)
- Mais les **129 + 129 JPG** référencés dans le manifest n'étaient pas commités
- Résultat : code retournait `/mockups/printify/bella-3001/blanc-front.jpg` → Vercel 404 → "Visuel à venir"
- Fix : commit `f9ec03b` a ajouté les 258 JPG + 29 images home

**Règle** : si tu commits un manifest, commit aussi les fichiers qu'il référence (ou bien upload-les sur un CDN externe whitelisté dans `next.config.ts`).

---

## Règle n°3 — Ne jamais commit `tmp/`

`tmp/` contient des dumps JSON d'audit (Printify, Gelato, Cloudprinter, Prodigi) qui n'ont rien à faire en production. À ce jour `tmp/` n'est pas dans `.gitignore` mais devrait l'être.

**À faire au prochain commit** :
- Si tu vois `tmp/` dans `git status --short` et qu'il n'est pas dans `.gitignore`, **suggère** à Kaan d'ajouter `tmp/` au `.gitignore` (mission séparée).
- En attendant, **ne jamais** `git add tmp/` ni `git add -A` qui ramasserait `tmp/`.

---

## Règle n°4 — Ne pas commiter tous les assets sans tri

Le repo HM Global contient beaucoup d'assets candidats au commit (mockups, images marketing, audits visuels). Avant de commit en masse :

1. **Identifier précisément** ceux référencés par du code tracké (cf. règle n°1).
2. **Vérifier qu'aucun fichier sensible** ne se glisse dedans (screenshot d'admin avec données client, etc.).
3. **Vérifier les tailles** : `du -sh <dossier>`. Si > 50 MB, envisager Git LFS ou CDN externe.
4. **Stage par dossier précis**, jamais `git add -A`.

---

## Règle n°5 — Pour `ProductImageStage` / `HMProductVisual` / `MockupViewer`, vérifier les chemins réels Vercel

Ces composants ont des fallbacks complexes (Printify cropped → Printify original → hmMockupImages → TopTex packshot → null). Si une vue affiche "Visuel à venir", il faut savoir **lequel** des fallbacks tente quoi.

**Pipeline complet pour un produit Printify V1 (ex. `gildan-18000`)** :

1. `HMProductVisual` reçoit `src` depuis le composant parent.
2. Le parent appelle `getHMMockupPath(product, colorId)` de `lib/hm-visual-utils.ts`.
3. `getHMMockupPath` tente dans l'ordre :
   - **P-2** : `getPrintifyMockupForHMColor(product.id, colorId, "front")` → `/mockups/printify-cropped/<id>/<color>-front.jpg` OU `/mockups/printify/<id>/<color>-front.jpg`
   - **P-1** : `getHMTextileFrontPath(productId, colorId)` → asset HM premium webp
   - **P0** : Printful → mockups locaux HM (`hmMockupImages`)
   - **0a-d** : fallback famille (tshirt → packshot couleur)
   - **null** : `HMProductVisual` affiche "Visuel à venir"
4. Le path retourné est passé à `<Image src>` Next.js.
5. Si 404 → `onError` → `setHasError(true)` → "Visuel à venir".

**Pour diagnostiquer "Visuel à venir"** :
- Si tu peux ouvrir la fiche produit en mode dev (`npm run dev`) → DevTools → Network → repère la requête image 404.
- Si Vercel preview seulement → ouvrir DevTools du preview → Network → idem.

---

## Règle n°6 — `next.config.ts` doit autoriser les domaines distants

Pour les URLs distantes (Supabase Storage, TopTex CDN, Cloudinary), `next.config.ts` doit déclarer le domaine dans `images.remotePatterns`. Sinon Next/Image refuse de charger.

**Actuel HM Global (2026-05-18)** :
- ✅ `**.supabase.co` (Supabase Storage publics)
- ✅ `res.cloudinary.com`
- ✅ `cdn.toptex.com` (packshots + visuels éditoriaux)
- ✅ `media.europeancatalog.com` (fallback Toptex)
- ✅ `files.cdn.printful.com` (variants couleur Printful)

Si tu ajoutes un nouveau CDN, mets à jour cette liste dans `next.config.ts` (mission Hermès séparée car touche `next.config.ts` — voir `06_FORBIDDEN_ZONES.md` si applicable).

---

## Règle n°7 — Diagnostic "Visuel à venir" : src null vs 404 image

`HMProductVisual.tsx` utilise `isEmpty = !src || hasError`. Deux scénarios différents :

### Scénario A — `src` est `null` (logique métier ne retourne pas de path)

- Le produit n'a pas d'asset configuré (`hmMockupImages` vide, pas de mapping Printify, etc.).
- Solution : **ajouter l'asset dans `data/products.ts`** ou dans le mapping concerné.
- **Pas un bug Vercel** — c'est un produit avec image non renseignée.

### Scénario B — `src` est un path mais 404 (image absente)

- Le path est correct mais le fichier n'existe pas côté Vercel (untracked).
- Solution : **commiter le fichier** dans `public/`.
- **Bug Vercel typique** — souvent vu sur HM Global.

### Comment distinguer

Ouvrir la console DevTools sur la page concernée :
- **Pas de log "image error"** + composant affiche "Visuel à venir" → scénario A (`src` null).
- **Erreur 404 dans Network** sur l'URL image → scénario B (fichier absent).

Tu peux aussi ajouter temporairement un `console.log(src)` dans `HMProductVisual.tsx` pendant le debug — à **retirer** avant commit.

---

## Quick reference — commits assets HM Global (mai 2026)

| Commit | Contenu | Volume |
|---|---|---|
| `e375521` | 20 PNG packshots Bella + Gildan refresh (sur `main`) | < 1 MB (binaires git diff = 0) |
| `f9ec03b` | 258 JPG Printify + 29 images home (sur `mission/...`) | ~21 MB |

À l'avenir, suivre la même logique :
- Petits refresh ponctuels : commit ciblé sur main directement (après PR).
- Gros volumes (>10 MB) : commit dans une mission Hermès dédiée.
