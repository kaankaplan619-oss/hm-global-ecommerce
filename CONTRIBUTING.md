# Contribuer au projet HM Global Textile

## Règle obligatoire — Rapport agent en fin de tâche

À la fin de **chaque tâche** (qu'elle soit réalisée par Claude Code, un autre agent IA ou un développeur humain),
le contributeur doit produire un rapport structuré en utilisant le format défini dans `AGENT_REPORT_TEMPLATE.md`.

Ce rapport doit être fourni :
- **Dans la réponse finale** de l'agent, **ou**
- **Dans un fichier** `AGENT_REPORT_LATEST.md` à la racine du projet

### Checklist avant de clore une tâche

- [ ] `npm run build` lancé → zéro erreur
- [ ] `npm run type-check` lancé → zéro erreur
- [ ] Fichiers modifiés listés
- [ ] Tests visuels catalogue et page produit effectués
- [ ] BAT générable vérifié (si composants produit touchés)
- [ ] Comportement mobile vérifié (si UI touchée)
- [ ] Risques restants signalés
- [ ] Rapport au format `AGENT_REPORT_TEMPLATE.md` produit

### Commande de rapport rapide

```bash
npm run agent:report
```

Affiche : git status, diff --stat, dernier commit, rappel des commandes de validation.

---

## Règles de développement

Voir `AGENT_CONTEXT.md` pour les règles invariantes du projet.

## Stack

Next.js 16 · React 19 · Tailwind CSS v4 · Fabric.js v7 · Supabase · Stripe · Vercel
