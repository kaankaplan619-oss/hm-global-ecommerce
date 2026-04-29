# AGENT_REPORT.md — Rapport de fin de tâche

> Template à remplir à chaque fin de tâche. Remplacer les `...` par les vraies valeurs.
> Ce rapport est conçu pour être transmis directement à ChatGPT pour review.

---

## Informations générales

| Champ | Valeur |
|---|---|
| Date | ... |
| Commit | `...` |
| Branche | `main` |
| Déployé sur Vercel | ✅ Oui / ❌ Non |
| URL de test | `https://hm-global-sumup-agen-ia-s-projects.vercel.app` |

---

## 1. Objectif demandé

_Décrire en 2-3 phrases ce qui était demandé par l'utilisateur._

...

---

## 2. Modifications effectuées

_Vue d'ensemble : qu'est-ce qui a changé et pourquoi. Approche technique choisie._

...

---

## 3. Fichiers modifiés

| Fichier | Statut | Description du changement |
|---|---|---|
| `chemin/fichier.ts` | ✅ Créé | ... |
| `chemin/fichier.tsx` | ✏️ Modifié | ... |
| `chemin/fichier.md` | 🗑️ Supprimé | ... |

---

## 4. Tests exécutés

### Build & TypeScript

| Test | Commande | Résultat |
|---|---|---|
| TypeScript | `npm run type-check` | ✅ 0 erreur / ❌ X erreurs |
| Build | `npm run build` | ✅ Succès / ❌ Échec |

### Tests visuels (référencer TEST_CHECKLIST.md)

| Réf. | Test | Résultat |
|---|---|---|
| B1-B10 | Catalogue | ✅ / ❌ / ⏭ |
| C1-C4 | Page produit T-shirt | ✅ / ❌ / ⏭ |
| D1-D2 | Page produit Hoodie | ✅ / ❌ / ⏭ |
| E1-E2 | Page produit Softshell | ✅ / ❌ / ⏭ |
| F1-F4 | Changement couleur | ✅ / ❌ / ⏭ |
| G1-G3 | Upload logo | ✅ / ❌ / ⏭ |
| H1-H5 | LightMockupPreview | ✅ / ❌ / ⏭ |
| I1-I4 | MockupViewer (B&C) | ✅ / ❌ / ⏭ |
| J1-J6 | BAT | ✅ / ❌ / ⏭ |
| K1-K4 | Panier | ✅ / ❌ / ⏭ |
| L1-L5 | Mobile | ✅ / ❌ / ⏭ |
| M1-M3 | Desktop | ✅ / ❌ / ⏭ |

---

## 5. Résultats observés

_Décrire ce qui a été vu lors des tests — URLs testées, comportements vérifiés, captures d'écran si disponibles._

...

---

## 6. Tests non exécutés

| Réf. | Test | Raison |
|---|---|---|
| ... | ... | Non applicable / Hors périmètre / ... |

---

## 7. Risques restants

_Ce qui pourrait casser à la prochaine modification ou en production._

- ...
- ...

---

## 8. Fonctionnalités potentiellement impactées

_Même si non cassées aujourd'hui, ces fonctionnalités pourraient être affectées par cette modification._

- ...
- ...

---

## 9. Prochaine action recommandée

_La tâche suivante prioritaire, avec le contexte nécessaire pour la reprendre._

...

---

## 10. Message prêt à envoyer à ChatGPT pour review

```
=== CONTEXTE PROJET ===
Site : HM Global Agence — e-commerce B2B de textile personnalisé
Stack : Next.js 16, React 19, Tailwind CSS v4, Fabric.js v7, Supabase, Stripe, Vercel
Repo : kaankaplan619-oss/hm-global-ecommerce (branche main)

=== TÂCHE RÉALISÉE ===
[TITRE DE LA TÂCHE]

=== MODIFICATIONS ===
[LISTE DES FICHIERS MODIFIÉS]

=== TESTS EFFECTUÉS ===
[RÉSULTATS SYNTHÉTIQUES]

=== PROBLÈMES RESTANTS ===
[LISTE DES PROBLÈMES NON RÉSOLUS]

=== RISQUES ===
[LISTE DES RISQUES TECHNIQUES]

=== QUESTION POUR REVIEW ===
[CE QUE TU VEUX QUE CHATGPT ANALYSE, VALIDE OU PROPOSE]
```
