# 13 — Prompt de démarrage de session

Copier ce prompt au début de chaque nouvelle session Claude Code.

---

## Prompt à copier

```
Avant de coder :
1. Lis CLAUDE.md
2. Lis docs/agent-memory/00_START_HERE.md uniquement
3. Ne lis les autres fichiers mémoire que si la tâche le nécessite
4. Lis docs/agent-memory/16_LAUNCH_CHECKLIST.md

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
| Contexte métier | `01_PROJECT_CONTEXT.md` |
| Rôles agents | `02_AGENT_ROLES.md` |
| Design / UI | `03_DESIGN_RULES.md` |
| Images produits | `04_PRODUCT_IMAGES_RULES.md` |
| Catalogue | `05_CATALOGUE_RULES.md` |
| Supabase / upload | `06_SUPABASE_AND_UPLOAD_RULES.md` |
| BAT / commande | `07_BAT_AND_ORDER_WORKFLOW.md` |
| Zones protégées | `08_DO_NOT_TOUCH.md` |
| Tâche active | `09_CURRENT_TASKS.md` |
| Décisions | `10_DECISION_LOG.md` |
| Mockup / Fabric.js | `11_MOCKUP_VIEWER_RULES.md` |
| Tests | `12_TESTING_PROTOCOL.md` |
| Vision produit | `14_PRODUCT_VISION_HM_GLOBAL_PLATFORM.md` |
| Studio | `15_STUDIO_SPEC.md` |
| Lancement | `16_LAUNCH_CHECKLIST.md` |
| Marché / V3-V6 | `17_MARKET_GROWTH_ROADMAP_V3_V6.md` |

---

## Structure mémoire projet

```
/docs/agent-memory/
├── 00_START_HERE.md
├── 01_PROJECT_CONTEXT.md ... 12_TESTING_PROTOCOL.md
├── 13_PROMPT_STARTER.md       ← ce fichier
├── 14_PRODUCT_VISION_HM_GLOBAL_PLATFORM.md
├── 15_STUDIO_SPEC.md
├── 16_LAUNCH_CHECKLIST.md
└── 17_MARKET_GROWTH_ROADMAP_V3_V6.md
```

Pour un audit complet marché et produit, utiliser directement
`docs/prompts/CLAUDE_CODE_V3_V6_MARKET_AUDIT.md`.
