# 12 — Protocole de Test (UI rendering obligatoire)

> **Règle absolue** : sur ce projet, **une tâche UI n'est jamais "terminée" parce que TypeScript et ESLint passent.**
> La validation rendu réel est obligatoire pour tout changement qui touche : interface, composant, page produit, Studio, catalogue, admin, layout responsive.

---

## Workflow obligatoire en 7 étapes

À appliquer dans cet ordre, sans sauter d'étape, pour toute modification de code qui affecte un rendu visuel.

### 1. Audit avant modification
- Lire les fichiers concernés en lecture seule.
- Identifier la cause racine (pas seulement le symptôme).
- Lister les fichiers à modifier + risques + zones interdites adjacentes.
- Soumettre le plan à Kaan **avant** toute édition.

### 2. Modifier uniquement les fichiers validés
- Ne pas étendre le scope de manière implicite.
- Si un fichier supplémentaire devient nécessaire en cours de route → s'arrêter, signaler, attendre validation.

### 3. Type-check / Lint
```bash
npm run type-check
npm run lint -- <fichiers modifiés>
```
Zéro erreur attendu. Les warnings préexistants doivent être signalés mais n'empêchent pas la suite.

### 4. Lancer les routes concernées en HTTP
- Si un dev server est actif (`npm run dev` sur port 3000 ou autre) : `curl -I` ou `curl -s` sur les routes concernées pour valider HTTP 200 + presence de marqueurs dans le HTML (titre, classes, chaînes attendues).
- Si pas de dev server : le signaler et donner la commande exacte à Kaan pour qu'il le lance.

### 5. Vérification rendu visuel réel
**Tools disponibles dans la session Claude Code (à activer via ToolSearch si deferred)** :

| Tool | Usage |
|---|---|
| `mcp__playwright__*` | Lancer un browser headless, naviguer, screenshot, click, fill |
| `mcp__Claude_Preview__*` | Preview du build Next.js + screenshots |
| `mcp__Claude_in_Chrome__*` | Browser Chrome contrôlé (si l'extension est connectée) |
| `mcp__computer-use__screenshot` | Screenshot direct de l'écran (apps natives) |

**Si AUCUN outil de rendu n'est disponible dans la session courante** :
- Le dire **explicitement** à Kaan en début de réponse de vérification.
- Fournir une **checklist visuelle précise** : URLs à ouvrir, points à observer, éléments DOM clés (data-testid, classes, contenus textuels), captures avant/après attendues.
- Ne **jamais** prétendre avoir validé le rendu sans l'avoir réellement vu.

### 6. Comparaison avant / après
- Quand c'est possible : screenshot avant la modif (sur l'ancienne version) + screenshot après → diff visuel commenté.
- Si seule la version "après" est accessible : décrire précisément l'état observé + le mettre en regard de ce qui était attendu.

### 7. Rapport final structuré
À chaque conclusion de tâche UI, fournir un compte-rendu qui contient explicitement :

```
✅ Ce qui marche  : [liste des points validés visuellement]
❌ Ce qui ne marche pas : [bugs trouvés ou comportements inattendus]
⏳ À vérifier manuellement : [points que Claude n'a PAS pu valider]
📁 Fichiers modifiés : [liste exhaustive avec lignes touchées]
⚠️  Risques : [effets de bord possibles, régressions à surveiller]
```

---

## Pages à vérifier systématiquement par type de tâche

### Tâche catalogue / cards produits
- `/catalogue` → grille complète, cards visibles, images chargées
- `/catalogue/[category]` → filtre par catégorie correct
- Cards : badge, swatches, prix, image, hover, click vers fiche
- Produits `visible: false` doivent être **absents**

### Tâche fiche produit
- `/produits/[slug]` (slug du produit concerné)
- Galerie images, sélection couleur, sélection taille
- MockupViewer (zone cœur + dos), badge, bouton CTA
- Prix dynamique selon technique + quantité

### Tâche Studio / configurateur
- `/studio/[slug]` (au minimum sur 1 produit tshirt + 1 hoodie)
- Canvas visible entier, panneaux latéraux compacts, contrôles accessibles
- Drag/resize logo, snap zone, switch face/dos
- Export PNG fonctionnel

### Tâche admin
- `/admin` (auth requis — Kaan validera manuellement)
- `/admin/commandes`, `/admin/devis`, `/admin/produits` selon le périmètre
- Pas de leak de données dans les listes

### Tâche responsive
- Tester **mobile** (375×667 iPhone SE) **ET** **laptop** (1280×800 / 1440×900) **ET** **desktop large** (1920×1080)
- Vérifier breakpoints `sm:`, `md:`, `lg:`, `xl:` cohérents

### Tâche MockupViewer (canvas Fabric.js v6)
1. Uploader un logo PNG
2. Vérifier positionnement zone cœur (centre poitrine)
3. Vérifier positionnement zone dos (centre haut du dos)
4. Drag + resize dans les deux vues
5. Contrôles (cercles roses) visibles uniquement à la sélection
6. Désélection → contrôles disparaissent

### Tâche Supabase / upload logo
1. Session authentifiée requise
2. Uploader un logo → vérifier `logoFile.url` + `logoFile.path` en console
3. Supabase Dashboard → Storage → `customer-logos` → dossier `cart/`

---

## Avant chaque push / déploiement Vercel

1. `npm run type-check` → zéro erreur
2. `npm run lint` → zéro nouvelle erreur (warnings préexistants tolérés mais signalés)
3. Variables d'environnement Vercel inchangées
4. Pas d'overlay Next.js d'erreur en dev
5. Produits `visible: false` absents du front
6. Workflow obligatoire des 7 étapes ci-dessus appliqué pour la modif principale

## Vérification déploiement Vercel post-push

Vercel Dashboard :
- Statut `READY`
- Build logs : zéro erreur critique
- Runtime logs : zéro 502 / 500
- Sentry / monitoring : aucune nouvelle alerte

---

## Pièges connus

- Les tests Playwright automatisés peuvent échouer sur Fabric.js (canvas headless) — toujours préférer un test manuel pour MockupViewer.
- Le fix TopTex 502 est silencieux : si `TOPTEX_API_KEY` est absent, l'API retourne `{colorImages: {}}` sans erreur.
- L'upload logo nécessite une session Supabase authentifiée — tester avec un vrai compte connecté.
- Le cache Next.js dev server peut servir une version périmée après replacement d'image : restart full (`kill PID + npm run dev`) si un visuel ne se met pas à jour.
- Les ProductCards : `product.badge` est affiché en overlay (depuis 2026-05-26). Vérifier sur catalogue ET catégorie.

---

## Honnêteté obligatoire sur les limites de la session

Si dans la session courante, l'agent n'a **pas accès** à un outil de rendu visuel (browser/screenshot non chargé, dev server pas lancé, pas de capture possible), il doit :

1. **Le dire explicitement** dans la réponse, en clair, sans euphémisme.
2. **Fournir une checklist précise** à Kaan pour vérification manuelle (URLs + points à observer + DOM markers attendus).
3. **Ne pas commit** sans cette checklist transmise pour les tâches UI critiques.
4. **Ne pas conclure** une tâche UI comme "terminée" tant que Kaan n'a pas confirmé le rendu visuel.

Cette règle s'applique même si type-check + lint passent : ils ne sont **pas suffisants** pour valider un rendu.
