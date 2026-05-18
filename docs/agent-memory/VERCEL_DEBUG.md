# VERCEL_DEBUG — Quand le build local passe mais Vercel échoue

> Cas le plus courant en environnement HM Global : 4 fois sur 5, c'est un **fichier untracked** importé par du code tracké.
>
> Règle d'or : **ne jamais corriger à l'aveugle si le build local passe**. Toujours récupérer le **log Vercel exact** d'abord.

---

## §1 — Différence local vs Vercel

| Local | Vercel |
|---|---|
| Voit **tous** les fichiers du working tree (M, untracked, gitignored hors `.gitignore`) | Voit **uniquement** ce qui est commité + poussé sur GitHub |
| Charge `.env.local` automatiquement | Charge les vars du dashboard Vercel (env preview/production) |
| Cache `.next/cache/` local | Cache build Vercel persistant entre déploiements |
| Node version locale (souvent récente) | Node version par défaut Vercel (selon config projet ou défaut Vercel) |

**Conséquence** : un fichier que tu as créé localement et que tu n'as **pas commité** sera invisible côté Vercel. Si du code tracké l'importe → `module-not-found` au build Vercel, mais ton build local passe (le fichier est sur disque).

---

## §2 — Diagnostic systématique (suivre l'ordre)

### Étape 1 — Récupérer le log Vercel exact

1. https://vercel.com/dashboard → projet HM Global.
2. Onglet **Deployments** → cliquer sur le déploiement en rouge.
3. Onglet **Build Logs**.
4. Repérer la **première ligne en rouge** ou contenant `Error:` / `Failed`.
5. Copier les **20-30 lignes autour** (contexte + erreur + nom du fichier).

Pas de log = pas de diagnostic. Ne jamais corriger à l'aveugle.

### Étape 2 — Identifier le type d'erreur

| Erreur Vercel | Cause typique | Voir |
|---|---|---|
| `Module not found: Can't resolve '@/...'` ou `'../...'` | Fichier importé mais non commité | §3 |
| `Error occurred prerendering page "/..."` | `generateStaticParams` fail ou env var manquante au build | §4 |
| `JavaScript heap out of memory` ou exit 137 | OOM build (RAM épuisée) | §5 |
| `Failed to compile. ./components/...` lint errors | Lint strict en build prod | §6 |
| `Turbopack build failed with N errors` | Bug Turbopack OU module not found | §3 + §7 |
| `EBUSY: resource busy`, `ECONNREFUSED` | Network/infra Vercel | §8 |

### Étape 3 — Reproduire localement le plus fidèlement possible

Build production-strict :
```bash
mv .env.local .env.local.tmp-debug   # désactiver les env vars locales
NODE_ENV=production npm run build    # simuler env minimal
mv .env.local.tmp-debug .env.local   # toujours restaurer
```

Si **build local sans .env passe** → le problème est **côté Vercel** (cache, env preview, infra).
Si **build local sans .env échoue** → tu as la même erreur localement, diagnostique-la.

---

## §3 — Cause #1 : imports vers fichiers untracked

**Symptôme Vercel** :
```
Module not found: Can't resolve '@/components/.../FooBar'
```

**Cause** : `FooBar.tsx` existe localement (donc le build local passe) mais n'est **pas dans le repo Git**.

**Comment scanner** :

```bash
cd hm-global

# Détecte tous les imports @/... du code tracké qui pointent vers un untracked
git ls-files '*.ts' '*.tsx' | while IFS= read -r f ; do
  grep -hoE '"@/[^"]+"' "$f" 2>/dev/null
done | sort -u | sed 's/^"@\///; s/"$//' | while read mod ; do
  for ext in .ts .tsx /index.ts /index.tsx .json ; do
    target="$mod$ext"
    if [ -f "$target" ] ; then
      if ! git ls-files --error-unmatch "$target" >/dev/null 2>&1 ; then
        echo "UNTRACKED IMPORT: @/$mod → $target"
      fi
      break
    fi
  done
done
```

⚠ **Bug du scan ci-dessus** : il ne détecte que les imports `@/...` (alias). Pour les imports **relatifs** `../components/...`, il faut un scan complémentaire. Cas vécu : `app/page.tsx` importait 9 composants `Home*` via `../components/home/Home...` — invisibles au scan `@/...`.

**Scan complémentaire pour imports relatifs** :
```bash
git ls-files '*.ts' '*.tsx' | while IFS= read -r f ; do
  grep -hoE 'from\s+"\.[^"]+"' "$f" 2>/dev/null | sed 's/^from\s\+"//; s/"$//'
done | sort -u
```

Puis pour chaque path relatif suspect, résoudre depuis son fichier source et vérifier le tracking.

**Correction** : stage uniquement les fichiers untracked **importés par du code tracké**, puis commit + push. Voir cas vécus dans `PROJECT_STATE.md` (commits `7a2bd62`, `9fef335`, `ec2124e`).

---

## §4 — `generateStaticParams` fail (rare sur HM Global)

Si `app/produits/[slug]/page.tsx` ou `app/catalogue/[category]/page.tsx` fait un fetch externe au build, et que les env vars Vercel preview manquent ou diffèrent → build casse.

**Vérification** :
```bash
grep -A 5 "export async function generateStaticParams" app/**/*/page.tsx
grep -nE "fetch\(|getSupabase|toptex" app/produits/*/page.tsx app/catalogue/*/page.tsx
```

**Sur HM Global au 2026-05-18** : `generateStaticParams` retourne `ALL_PRODUCTS.map(...)` et `Object.keys(...).map(...)` — aucun fetch externe. Hypothèse à éliminer rapidement.

---

## §5 — OOM build

Vercel free tier : ~8 GB RAM build. Next.js 16 + Turbopack + 287 nouveaux assets peuvent surcharger.

**Symptôme** : exit code 137, `JavaScript heap out of memory`, ou simple `Error` sans détail à ~46s.

**Mitigation** :
- Réduire la taille des assets (compression WebP, optimisation images en amont).
- Retirer le cache : `rm -rf .next/cache && next build` (déjà fait par script `build` HM Global).
- Côté Vercel : **Redeploy without cache** (UI Vercel → 3 points → Redeploy → décocher "Use existing Build Cache").

---

## §6 — Lint strict en build prod

Next.js exécute `eslint` durant `next build` sauf si désactivé dans `next.config.ts` (`eslint.ignoreDuringBuilds: true`).

**Sur HM Global** : lint a 4 erreurs pré-existantes (`Missing "key" prop` × 2 dans `StudioCanvas.tsx`, `unescaped entities` × 2 dans `StudioSummaryPanel.tsx`). Le build passe quand même → soit `ignoreDuringBuilds` est activé, soit `next build` traite ces 4 erreurs comme warnings malgré le rapport en "errors" via `npx eslint`. À investiguer si Vercel changeait de comportement.

---

## §7 — Bug Next 16 / Turbopack

Stack récente (Next 16.2.4 + Turbopack par défaut). Edge cases possibles.

**Workaround si suspecté** : tester un build **sans Turbopack** :
```bash
npx next build  # sans --turbopack
```

Si ça passe sans Turbopack mais casse avec → bug Turbopack. Reporter sur GitHub Next.js.

Sur HM Global, le script `build` est `rm -rf .next/cache && next build` (Turbopack par défaut dans Next 16).

---

## §8 — Infra Vercel / cache corrompu

Symptôme : build local OK, Vercel échoue de façon erratique ou à 46s sans message clair.

**Première action gratuite, zéro modification de code** :
1. Vercel UI → Deployments → 3 points (⋯) → **Redeploy**.
2. **Décocher "Use existing Build Cache"**.
3. Confirmer.

Souvent ça résout sans rien d'autre.

---

## §9 — Quand demander le log Vercel à Kaan

Si :
- Le build local passe dans **toutes** les configs testées (avec et sans `.env.local`).
- Le scan imports tracked → untracked ne remonte rien.
- Le scan d'imports relatifs est propre.
- Aucun `generateStaticParams` qui fetch.

Alors **STOP**. Demander à Kaan le **log Vercel exact**. Voir la checklist dans `docs/hermes/missions/`.

---

## Pour info — cas vécus historique branche unification

Sur `mission/2026-05-18-configurateur-unification-zones`, 4 fix build successifs ont été nécessaires :

| Commit | Cause | Solution |
|---|---|---|
| `7a2bd62` | `hm-visual-utils.ts` → `mockup-urls.ts` + `lib/suppliers/printify/*` untracked | Commit 11 fichiers (lib + manifests) |
| `9fef335` | `ProductDetailClient.tsx` → `VolumeQuoteBlock`, `QuoteOnlyBlock`, etc. (4 untracked) | Commit 4 composants UI |
| `f9ec03b` | 287 assets binaires absents (PNG Printify + images home) | Commit `public/mockups/printify/` + `public/mockups/printify-cropped/` + `public/images/home/` |
| `ec2124e` | `app/page.tsx` → 9 `Home*.tsx` via imports **relatifs** (scan `@/` les manquait) | Commit 9 composants Home |

**Leçon** : sur ce projet, beaucoup de fichiers étaient en working tree sans avoir été poussés. Scanner les deux types d'imports (`@/...` ET `../...`) avant tout push.
