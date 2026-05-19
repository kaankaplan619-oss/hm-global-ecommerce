# HM Global — Agent Memory — Start Here

> **Fichier d'entrée de la mémoire projet. À lire avant toute action.**
>
> Référencé depuis `CLAUDE.md` (sections "Mémoire projet obligatoire" FR et "Mandatory Project Memory" EN).

---

## Projet en une phrase

**HM Global Agence** — site e-commerce B2B de textile personnalisé (Next.js 15 / Tailwind / Supabase / Stripe / Fabric.js v6 / Vercel).
Premium, sobre, mobile-first. Jamais l'apparence d'un catalogue fournisseur générique.
Couleur accent : `#b13f74`. Design tokens : `--hm-*`.

---

## Règles absolues (à respecter sans exception)

- Ne jamais modifier un fichier applicatif sans demande explicite.
- Ne pas toucher à `components/product/MockupViewer.tsx` (B3.2-A2 validé production).
- Ne pas modifier les zones calibrées Fabric.js sans audit visuel complet.
- Ne pas modifier `lib/uploadLogo.ts` sans diagnostic validé.
- Ne pas toucher aux variables Supabase Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Ne pas toucher au fix TopTex 502 (`app/api/toptex/enrichment/[sku]/route.ts`, commit `6261eaa`).
- Ne pas remplacer les images principales HM (`images[]`, `hmHeroImage`, `hmMockupImages`) par des images fournisseur.
- Ne pas rendre visible un produit avec `visible: false` sans validation Kaan.
- Ne pas refaire une DA globale sans accord écrit.

Détail complet et nuances → `08_DO_NOT_TOUCH.md`.

---

## Protocole de session (à appliquer à chaque mission)

1. Lire **`CLAUDE.md`** (racine du repo)
2. Lire **ce fichier uniquement** (`00_START_HERE.md`)
3. **Résumer en 5-10 lignes maximum** :
   - contexte projet
   - règles interdites pertinentes pour la tâche
   - rôle de l'agent / acteurs concernés
   - tâche active
   - fichiers mémoire à lire pour cette tâche spécifique (via le mapping ci-dessous)
4. Lire les fichiers détaillés **seulement si la tâche le demande** (voir mapping)
5. **Ne jamais lire toute la mémoire par défaut**
6. **Avant modification** : annoncer fichiers concernés + plan minimal
7. **Après modification** : `git diff --stat` + tests ciblés + `git status`
8. **Si la tâche entre en conflit avec la mémoire** : s'arrêter et demander validation à Kaan.

---

## Mapping fichiers — à lire selon la tâche

### Cœur (11 fichiers — convention standard)

| Fichier | Contenu | Lire quand |
|---|---|---|
| `00_START_HERE.md` | Ce fichier — mapping + règles absolues | **Toujours en début de session** |
| `01_PROJECT_CONTEXT.md` | Mission, stack, produits, techniques de personnalisation | Première session, ou si on touche au cœur métier |
| `02_AGENT_ROLES.md` | Rôles humains et IA, périmètres, limites | Tout doute sur "qui fait quoi", coordination multi-agents |
| `03_DESIGN_RULES.md` | DA, tokens CSS, couleur accent, principes UI | Toute tâche design / UI / nouveau composant visuel |
| `04_PRODUCT_IMAGES_RULES.md` | `images[]`, `supplierImages[]`, `hmHeroImage`, `hmMockupImages`, droits | Toute manipulation d'images produits ou fournisseur |
| `05_CATALOGUE_RULES.md` | Catégories, tiers, visibilité, placements, techniques | Toute modif catalogue / data/products |
| `06_SUPABASE_AND_UPLOAD_RULES.md` | Bucket, RLS, variables Vercel, `lib/uploadLogo.ts` | Toute tâche upload, auth, Supabase |
| `07_BAT_AND_ORDER_WORKFLOW.md` | Flux BAT, commande, studio, statuts, composants impliqués | Toute tâche checkout, BAT, studio, admin commande |
| `08_DO_NOT_TOUCH.md` | Zones interdites détaillées (composants, infra, catalogue, design) | À relire au moindre doute avant modification |
| `09_CURRENT_TASKS.md` | Tâche active + état du projet (commits validés, prochaines étapes) | **Toujours en début de session pour contexte** |
| `10_DECISION_LOG.md` | Journal append-only des décisions historiques validées | Toute mission stratégique ou avant tout choix de fond |

### Annexes spécialisées (5 fichiers — à lire ponctuellement)

| Fichier | Contenu | Lire quand |
|---|---|---|
| `11_MOCKUP_VIEWER_RULES.md` | Détail technique MockupViewer Fabric.js, zones par catégorie | Toute mission qui approche du composant mockup ou du studio |
| `12_TESTING_PROTOCOL.md` | Checklist tests manuels, scénarios production, vérifications après modif | Avant chaque commit visible production |
| `13_PROMPT_STARTER.md` | Template prompt de démarrage de session | Pratique pour relancer un agent dans le bon état |
| `14_PRODUCT_VISION_HM_GLOBAL_PLATFORM.md` | Vision produit long terme — stratégie plateforme | Discussions roadmap V2-V5, refonte structurelle |
| `15_STUDIO_SPEC.md` | Spécifications fonctionnelles complètes du studio personnalisation | Toute évolution du studio ou de l'expérience Canva-style |

---

## Convention de mise à jour

- **Ne jamais réécrire une entrée du `10_DECISION_LOG.md`** — append uniquement. Si une décision change, créer une nouvelle entrée et marquer l'ancienne `Modifiée` ou `Annulée`.
- **`09_CURRENT_TASKS.md`** est le seul fichier qui peut être réécrit régulièrement — il reflète l'état présent.
- Pour les autres fichiers, modifier avec parcimonie. Préférer ajouter une entrée dans `10_DECISION_LOG.md` qui pointe vers une nuance d'une règle existante.
- Tout fichier supprimé / renommé doit être git mv (jamais delete + add) pour préserver l'historique.

---

## Mission active actuelle

Voir `09_CURRENT_TASKS.md` pour le détail.

---

## En cas de doute

Si une mission demandée semble en conflit avec :
- une règle absolue (ci-dessus ou dans `08_DO_NOT_TOUCH.md`)
- une décision active (`10_DECISION_LOG.md`)
- la direction artistique (`03_DESIGN_RULES.md`)
- une zone validée production (MockupViewer, uploadLogo, etc.)

**→ s'arrêter immédiatement et demander validation à Kaan avant toute modification.**
