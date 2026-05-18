@AGENTS.md

---

# Contexte iPad Pro — HM Global

Ce projet est géré depuis un iPad Pro M5 via Claude.ai (Safari).
L'accès au code se fait par copier-coller entre Claude.ai et Claude Code.

## Stack
- Next.js 14
- Vercel (déploiement automatique via GitHub)
- Supabase (storage + auth)
- Printful API (mockups + commandes)
- Stripe (paiements)

## Règles importantes
- Toujours faire un résumé court des fichiers modifiés
  pour que je puisse le copier sur iPad
- Quand tu modifies plusieurs fichiers, liste-les clairement
- Préfère des réponses courtes et structurées
- Les clés API sont dans .env.local — ne jamais les afficher

## Fournisseurs actifs
- Printful : branché et testé (commande HM-TEST-PRINTFUL-001)
- Gelato : clé présente dans .env.local
- Supabase : actif

## Priorité en cours
Générer des mockups flat fond blanc via Printful API
pour : gildan-5000, gildan-18000, gildan-18500, bella-3001

---

# Mémoire projet obligatoire

## Lecture obligatoire avant toute action

Avant de modifier le moindre fichier, lire dans cet ordre :

1. `CLAUDE.md` (ce fichier)
2. `docs/agent-memory/00_START_HERE.md` uniquement

Lire les autres fichiers mémoire (`01` → `09`) **seulement si la tâche le nécessite** — le mapping est dans `00_START_HERE.md`.

## Résumé structuré obligatoire avant toute modification

Après lecture, commencer par un résumé en **5-10 lignes maximum** :
- contexte projet
- règles interdites pertinentes
- tâche active
- fichiers mémoire à lire pour cette tâche spécifique

**Ne modifier aucun fichier avant ce résumé.**

## Mission

Développer et maintenir le site e-commerce B2B de textile personnalisé HM Global Agence. Premium, orienté conversion, mobile-first. Jamais l'apparence d'un catalogue fournisseur générique.

## Contraintes absolues

- Ne jamais casser le MockupViewer (B3.2-A2 validé, zones calibrées)
- Ne jamais modifier les variables Supabase Vercel sans accord explicite
- Ne jamais rendre visible un produit avec `visible: false`
- Ne jamais remplacer les images HM Global par des images fournisseur
- Ne jamais refaire une DA globale sans accord

## Retour attendu

Réponses concises, sans commentaires inutiles dans le code, sans abstractions superflues. Chaque tâche = périmètre strict. Pas d'initiative non demandée.

---

# Workflow Hermès & Git (ajout 2026-05-18)

## Hermès — système de coordination des missions

- Les missions structurées vivent dans `docs/hermes/missions/` (hors repo, working dir parent).
- Templates : `docs/hermes/01_MISSION_TEMPLATE.md`, rapports : `docs/hermes/03_REPORT_TEMPLATE.md`.
- Zones interdites consolidées : `docs/hermes/04_FORBIDDEN_ZONES.md` (en plus de `docs/agent-memory/06_FORBIDDEN_ZONES.md` qui reste la source repo).
- Discord opérationnel (webhooks `DISCORD_WEBHOOK_URL` + `DISCORD_NIGHT_WEBHOOK_URL` dans `.env.local`). Format messages : `docs/hermes/missions/2026-05-18_hermes-discord-channel.md`.
- GitHub Issue/PR templates : `.github/ISSUE_TEMPLATE/` (5 templates) + `.github/pull_request_template.md`.
- Règle d'or : **Hermès prépare, Claude Code exécute, Kaan valide.**

## Quick Git protocol (lecture obligatoire avant toute commit)

1. **Toujours commencer par** `git status --short` + `git branch --show-current`.
2. **Jamais `git add -A`** ni `git add .` — stage par groupe précis (fichier par fichier ou dossier ciblé).
3. **Jamais de push sur `main`** sans validation Kaan explicite.
4. **Toujours `npx tsc --noEmit` + `npm run build`** avant de push une branche destinée à Vercel.
5. **Toujours vérifier les untracked** qui pourraient casser Vercel — voir `docs/agent-memory/VERCEL_DEBUG.md` §1.
6. **Toujours un commit thématique** (un commit = un sujet cohérent). Pas de fourre-tout.

## Pour les bugs Vercel

Le **build local peut passer** alors que Vercel échoue (différence : Vercel voit seulement Git). Avant toute correction :
1. Récupérer le **log Vercel exact** (ne pas deviner).
2. Lire `docs/agent-memory/VERCEL_DEBUG.md`.
3. Diagnostiquer avec le log, puis proposer la correction minimale.

## Pour les assets images

Voir `docs/agent-memory/IMAGE_ASSETS_RULES.md`. Règle clé : **les images dans `public/` doivent être commitées si elles sont référencées par du code tracké**. Les manifests JSON seuls ne suffisent pas.

## Pour l'état actuel du projet

Voir `docs/agent-memory/PROJECT_STATE.md` (dashboard d'état, derniers commits, branches actives).
