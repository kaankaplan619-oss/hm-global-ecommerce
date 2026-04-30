# 09 — Prompt de Démarrage de Session

Copier ce prompt au début de chaque nouvelle session Claude Code.

---

## Prompt à copier

```
Avant de coder :
1. Lis CLAUDE.md
2. Lis docs/agent-memory/00_START_HERE.md uniquement
3. Ne lis les autres fichiers mémoire que si la tâche le nécessite

Résume en 5-10 lignes :
- contexte projet
- règles interdites
- tâche active
- fichiers que tu dois lire pour cette tâche

Ne modifie aucun fichier avant ce résumé.
```

---

## Pourquoi ce prompt ?

Claude Code ne conserve pas de mémoire entre les sessions. Ce prompt force la lecture du contexte minimal avant toute action, sans consommer inutilement des tokens sur les fichiers détaillés.

---

## Quand lire les fichiers détaillés ?

Uniquement si la tâche porte sur :

| Tâche | Fichier |
|---|---|
| Design / UI | `01_DESIGN_RULES.md` |
| Images produits | `02_PRODUCT_IMAGES_RULES.md` |
| Catalogue | `03_CATALOGUE_RULES.md` |
| Mockup / Fabric.js | `04_MOCKUP_VIEWER_RULES.md` |
| Supabase / upload | `05_SUPABASE_UPLOAD_RULES.md` |
| Zones interdites | `06_FORBIDDEN_ZONES.md` |
| Tâche active / B4 | `07_ACTIVE_TASK.md` |
| Tests | `08_TESTING_PROTOCOL.md` |

---

## Structure mémoire projet

```
/docs/agent-memory/
├── 00_START_HERE.md           ← LIRE EN PREMIER (quick start, 60 lignes)
├── 01_DESIGN_RULES.md
├── 02_PRODUCT_IMAGES_RULES.md
├── 03_CATALOGUE_RULES.md
├── 04_MOCKUP_VIEWER_RULES.md
├── 05_SUPABASE_UPLOAD_RULES.md
├── 06_FORBIDDEN_ZONES.md
├── 07_ACTIVE_TASK.md
├── 08_TESTING_PROTOCOL.md
└── 09_PROMPT_STARTER.md       ← ce fichier
```
