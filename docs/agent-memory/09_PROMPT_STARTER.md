# 09 — Prompt de Démarrage de Session

Copier ce prompt au début de chaque nouvelle session Claude Code pour initialiser correctement le contexte projet.

---

## Prompt à copier

```
Avant de coder, lis CLAUDE.md puis tous les fichiers dans /docs/agent-memory/.

Résume-moi ce que tu as compris avec ces sections :
1. Contexte projet
2. Règles design
3. Règles images produits
4. Règles catalogue
5. Règles mockup / upload logo
6. Zones interdites
7. Tâche active

Ne modifie aucun fichier avant ce résumé.
```

---

## Pourquoi ce prompt ?

Claude Code ne conserve pas de mémoire entre les sessions. Sans ce prompt :
- Le contexte projet est perdu
- Les zones interdites ne sont pas connues
- La tâche active n'est pas lue
- Des modifications destructrices peuvent être faites par erreur

Ce prompt force Claude à lire la mémoire projet avant d'agir.

---

## Checklist session

Avant de donner une tâche à Claude, vérifier :

- [ ] `07_ACTIVE_TASK.md` est à jour avec la tâche en cours
- [ ] `06_FORBIDDEN_ZONES.md` liste bien tout ce qu'on ne veut pas toucher
- [ ] Le prompt de démarrage a été copié en début de session

---

## Structure mémoire projet

```
/docs/agent-memory/
├── 00_PROJECT_CONTEXT.md     — Stack, parcours client, produits
├── 01_DESIGN_RULES.md        — DA premium, tokens, couleur accent
├── 02_PRODUCT_IMAGES_RULES.md — Champs image, règles fournisseur
├── 03_CATALOGUE_RULES.md      — Catégories, tiers, visible
├── 04_MOCKUP_VIEWER_RULES.md  — Fabric.js, zones calibrées
├── 05_SUPABASE_UPLOAD_RULES.md — Bucket, RLS, variables Vercel
├── 06_FORBIDDEN_ZONES.md      — Liste des zones interdites
├── 07_ACTIVE_TASK.md          — État actuel, prochaine action
├── 08_TESTING_PROTOCOL.md     — Protocole de test et vérification
└── 09_PROMPT_STARTER.md       — Ce fichier, prompt de démarrage
```
