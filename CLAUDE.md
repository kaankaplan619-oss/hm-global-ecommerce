@AGENTS.md

---

# Mémoire projet obligatoire

## Lecture obligatoire avant toute action

Avant de modifier le moindre fichier, lire obligatoirement dans cet ordre :

1. `CLAUDE.md` (ce fichier)
2. Tous les fichiers dans `/docs/agent-memory/` :
   - `00_PROJECT_CONTEXT.md` — Stack, parcours client, produits
   - `01_DESIGN_RULES.md` — DA premium, tokens CSS, couleur accent
   - `02_PRODUCT_IMAGES_RULES.md` — Champs image, règles fournisseur
   - `03_CATALOGUE_RULES.md` — Catégories, tiers, règle visible
   - `04_MOCKUP_VIEWER_RULES.md` — Fabric.js v6, zones calibrées, B3.2-A2
   - `05_SUPABASE_UPLOAD_RULES.md` — Bucket, RLS, variables Vercel
   - `06_FORBIDDEN_ZONES.md` — Zones interdites, fichiers à ne pas toucher
   - `07_ACTIVE_TASK.md` — État actuel du projet, prochaine action
   - `08_TESTING_PROTOCOL.md` — Protocole de test et vérification
   - `09_PROMPT_STARTER.md` — Prompt de démarrage, structure mémoire

## Résumé structuré obligatoire avant toute modification

Après avoir lu les fichiers ci-dessus, commencer **uniquement** par un résumé structuré :

```
## 1. Contexte projet
## 2. Règles design
## 3. Règles images produits
## 4. Règles catalogue
## 5. Règles mockup / upload logo
## 6. Zones interdites
## 7. Tâche active
```

**Ne modifier aucun fichier applicatif avant d'avoir produit ce résumé.**

## Mission

Développer et maintenir le site e-commerce B2B de textile personnalisé HM Global Agence. Le site doit être premium, orienté conversion, mobile-first, et ne jamais ressembler à un catalogue fournisseur générique.

## Contraintes absolues

- Ne jamais casser le MockupViewer (B3.2-A2 validé, zones calibrées)
- Ne jamais modifier les variables Supabase Vercel sans accord explicite
- Ne jamais rendre visible un produit avec `visible: false`
- Ne jamais remplacer les images HM Global par des images fournisseur
- Ne jamais refaire une DA globale sans accord

## Retour attendu

Réponses concises, sans commentaires inutiles dans le code, sans abstractions superflues. Chaque tâche = périmètre strict. Pas d'initiative non demandée.
