# 08 — Protocole de Test

## Avant chaque modification

1. Lire `CLAUDE.md`
2. Lire tous les fichiers dans `/docs/agent-memory/`
3. Résumer ce qui a été compris (contexte, règles, zones interdites, tâche active)
4. Confirmer le périmètre de la modification avec l'utilisateur si doute

## Après chaque modification applicative

### Vérifications TypeScript
```bash
npx tsc --noEmit
```
Zéro erreur attendu avant tout commit.

### Vérifications pages à tester systématiquement

| Page | URL | Ce qu'on vérifie |
|---|---|---|
| Catalogue | `/catalogue` | Cards visibles, images chargées, produits `visible:false` absents |
| Produit t-shirt | `/catalogue/tshirts/[slug]` | Galerie, sélection couleur/taille, MockupViewer |
| Produit hoodie | `/catalogue/hoodies/[slug]` | Idem |
| Produit softshell | `/catalogue/softshells/[slug]` | Idem |
| Panier | `/panier` | Items, prix, bouton valider |
| Console navigateur | DevTools → Console | Zéro erreur rouge, zéro 502 |

### Vérifications MockupViewer (si changement canvas)

1. Uploader un logo PNG
2. Vérifier positionnement dans la zone cœur
3. Vérifier positionnement dans la zone dos
4. Vérifier drag + resize dans les deux vues
5. Vérifier que les contrôles (cercles roses) n'apparaissent qu'à la sélection
6. Vérifier que la déselection retire les contrôles

### Vérifications Supabase (si changement upload)

1. Se connecter sur le site
2. Uploader un logo sur une page produit
3. Vérifier dans la console : `logoFile.url` et `logoFile.path` présents
4. Vérifier dans Supabase Dashboard → Storage → `customer-logos` → dossier `cart/`

## Avant chaque push / déploiement Vercel

1. `npx tsc --noEmit` → zéro erreur
2. Vérifier que les variables d'environnement ne changent pas
3. Vérifier l'absence d'overlay Next.js d'erreur en développement
4. Confirmer que les produits `visible: false` ne remontent pas

## Vérification déploiement Vercel

Après push → vérifier dans Vercel Dashboard :
- Statut deployment : `READY`
- Build logs : zéro erreur critique
- Runtime logs : zéro 502 / 500

## Notes importantes

- Les tests Playwright automatisés peuvent échouer sur Fabric.js (canvas headless) — toujours préférer un test manuel pour MockupViewer
- Le fix TopTex 502 est silencieux : si `TOPTEX_API_KEY` est absent, l'API retourne `{colorImages: {}}` sans erreur
- L'upload logo nécessite une session Supabase authentifiée — tester avec un vrai compte connecté
