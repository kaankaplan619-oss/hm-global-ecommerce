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

## Validation rendu UI obligatoire

Pour toute tâche qui touche : **interface, composant, page produit, Studio, catalogue ou admin** — type-check + lint **ne sont jamais suffisants** pour conclure.

Workflow obligatoire à chaque tâche UI :

1. Audit lecture seule avant modification
2. Modifier uniquement les fichiers validés par Kaan
3. `npm run type-check` + `npm run lint`
4. Lancer les routes concernées en HTTP (curl si dev server actif)
5. Vérifier le rendu visuel réel (Playwright / Claude Preview / Chrome MCP / computer-use screenshot — selon ce qui est disponible)
6. Comparer avant / après si possible
7. Rapport structuré obligatoire : ce qui marche / ce qui casse / à vérifier manuellement / fichiers modifiés / risques

Si aucun outil de rendu n'est disponible dans la session : **le dire explicitement** et fournir une checklist visuelle précise à Kaan (URLs + DOM markers + breakpoints à tester).

**Ne jamais prétendre avoir validé un rendu sans l'avoir réellement vu.**

Détails complets et pages à tester par type de tâche : `docs/agent-memory/12_TESTING_PROTOCOL.md`.

---

## Mandatory Project Memory

Before starting any coding task, Claude Code must read:
/docs/agent-memory/00_START_HERE.md

Then Claude Code must read all relevant files in:
/docs/agent-memory/

Claude Code must not start editing before summarizing:
1. project context,
2. agent roles,
3. design rules,
4. product image rules,
5. current task,
6. do-not-touch areas.

If the requested task conflicts with the memory files, Claude Code must stop and ask for validation.

---

# Suivi de lancement — règles obligatoires (2026-06-12)

- **Source de vérité de l'avancement** : `docs/agent-memory/16_LAUNCH_CHECKLIST.md`.
  Numérotation stable (jamais renuméroter). Début de session : la lire.
  Fin de tâche : mettre à jour le statut de l'item (✅ + date + commit) et le
  signaler à Kaan sous la forme « n° X corrigé / n° Y pas corrigé ».
- **Ne modifier le site que sur demande explicite de Kaan**, ou pour un item
  de la checklist qu'il a déjà validé. Toute découverte hors périmètre :
  l'ajouter en ⏳ à la checklist, ne PAS la corriger d'office.
- **Compte QA** pour les vérifications E2E : identifiants dans `.env.local`
  (`QA_CLAUDE_EMAIL` / `QA_CLAUDE_PASSWORD`, rôle client). Ne jamais les
  committer ni les afficher. Paniers et commandes de TEST autorisés en local ;
  jamais de commande fournisseur confirmée (brouillons `confirm: false`
  uniquement, à supprimer après usage).
- ⚠️ **Plusieurs agents travaillent en parallèle sur ce repo** : ne jamais
  `git add -A` ni `git add .` — toujours stager explicitement ses fichiers
  (un commit du 2026-06-12 a embarqué le travail en cours d'une autre session).
  Le navigateur Playwright est lui aussi partagé : faire les parcours E2E dans
  un onglet dédié et en un seul script atomique.
