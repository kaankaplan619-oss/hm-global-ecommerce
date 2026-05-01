# HM Global — Agent Memory Quick Start

## Projet

HM Global Agence — site e-commerce B2B textile personnalisé.
Objectif : catalogue premium, configuration produit, upload logo, mockup, BAT, commande.
Ne pas donner un rendu catalogue fournisseur.
Stack : Next.js 15 App Router, Tailwind, Supabase, Stripe, Fabric.js v6, Vercel.
Couleur accent : `#b13f74`. Design tokens : `--hm-*`.

## Règles absolues

- Ne jamais modifier un fichier applicatif sans demande explicite.
- Ne pas toucher à `MockupViewer.tsx` sans demande explicite (B3.2-A2 validé en production).
- Ne pas modifier les zones calibrées : `coeur: [0.60, 0.25, 0.14, 0.14]` / `dos: [0.26, 0.13, 0.48, 0.29]`.
- Ne pas modifier `lib/uploadLogo.ts` sans diagnostic validé.
- Ne pas toucher aux variables Supabase Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Ne pas toucher au fix TopTex 502 (`api/toptex/enrichment/[sku]/route.ts`, commit `6261eaa`).
- Ne pas remplacer les images principales HM (`images[]`) par des images fournisseur.
- Ne pas rendre visible un produit avec `visible: false`.
- Ne pas refaire une DA globale sans accord.

## Tâche active

**B4 BAT Preview Studio validé en production** (`hm-global.vercel.app`) — 2026-05-01.

- T-shirts B&C (MockupViewer) : "Prévisualiser le BAT" → Studio interactif full-screen
- Studio : drag logo contraint à la zone, zoom +/-, recentrer, info panel, "Voir BAT complet" → BATModal
- Produits non-MockupViewer (hoodies, softshells…) : fallback direct vers BATModal
- Commits : `1afa1e9` (studio) + `a6574af` (fix fallback hoodie) — tous deux READY
- Aucun bug bloquant restant sur B4

**Prochaine étape : B5 — Flux de commande complet (Stripe + création commande Supabase)**

## Protocole de session

1. Lire `CLAUDE.md`
2. Lire ce fichier uniquement
3. Résumer en 5-10 lignes max (contexte · règles interdites · tâche active · fichiers à lire pour la tâche)
4. Lire les fichiers détaillés **seulement si la tâche le demande** (voir mapping ci-dessous)
5. Ne jamais lire toute la mémoire par défaut
6. Avant modification : annoncer fichiers concernés + plan minimal
7. Après modification : `git diff --stat` + tests ciblés + `git status`

## Mapping fichiers détaillés — à lire selon la tâche

| Tâche | Fichier à lire |
|---|---|
| Design / UI / tokens | `01_DESIGN_RULES.md` |
| Images produits / champs image | `02_PRODUCT_IMAGES_RULES.md` |
| Catalogue / produits visibles | `03_CATALOGUE_RULES.md` |
| Mockup / Fabric.js / zones | `04_MOCKUP_VIEWER_RULES.md` |
| Supabase / upload logo / bucket | `05_SUPABASE_UPLOAD_RULES.md` |
| Zones interdites détaillées | `06_FORBIDDEN_ZONES.md` |
| Tâche active détaillée / B4/BAT | `07_ACTIVE_TASK.md` |
| Protocole de test / vérifications | `08_TESTING_PROTOCOL.md` |
| Prompt de démarrage session | `09_PROMPT_STARTER.md` |
