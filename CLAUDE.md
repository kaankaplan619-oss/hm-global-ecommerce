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
