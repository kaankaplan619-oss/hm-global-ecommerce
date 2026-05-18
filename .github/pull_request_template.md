<!--
  PR template Hermès — HM Global Agence
  Toutes les sections sont obligatoires sauf indication contraire.
  Voir docs/hermes/00_HERMES_SYSTEM.md et docs/hermes/04_FORBIDDEN_ZONES.md.
-->

## Mission liée

<!-- Référence à l'issue Hermès. Remplir AU MOINS un lien. -->

- Issue : Closes #
- Mission Hermès : `docs/hermes/missions/AAAA-MM-JJ_titre-court.md`

## Résumé en 2-3 phrases

<!-- Ce qui a changé et pourquoi. Pas le diff brut. -->

…

## Type de PR

- [ ] Audit (lecture seule) — pas de modif code applicatif
- [ ] Mission Hermès — exécution sur fichiers listés dans la mission
- [ ] Bug fix
- [ ] Documentation
- [ ] QA / refactor cosmétique
- [ ] Night Mode (LOW / MEDIUM cadré uniquement)

## Niveau de risque

- [ ] **LOW** — audit, lecture, docs
- [ ] **MEDIUM** — UI ciblée, fichiers listés explicitement dans la mission
- [ ] **HIGH** — touche `04_FORBIDDEN_ZONES.md` (validation Kaan **écrite** obligatoire — joindre le lien du commentaire d'approbation)

## Fichiers modifiés (résumé)

<!-- Lister par catégorie. Format : chemin — une ligne de description. -->

**Applicatif :**
- …

**Docs Hermès :**
- …

**Tests :**
- …

## Tests lancés

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Tests unitaires / e2e applicables ✅
- [ ] Captures Chrome MCP desktop 1440px ✅
- [ ] Captures Chrome MCP mobile 375px ✅
- [ ] Console JS — aucune erreur rouge ✅

## Pre-merge safety check

<!-- Toutes les cases doivent être cochées. -->

- [ ] J'ai relu la liste `docs/hermes/04_FORBIDDEN_ZONES.md` et **aucun** fichier modifié n'en fait partie sans autorisation écrite.
- [ ] Aucun `.env*` modifié.
- [ ] Aucune nouvelle dépendance npm (`package.json` inchangé) — OU dépendance justifiée et validée par Kaan en commentaire.
- [ ] Aucune URL webhook, clé API, token, secret n'apparaît dans le diff (ni dans le code, ni dans les commentaires, ni dans les tests).
- [ ] Aucun email client envoyé, aucune commande fournisseur passée, aucun paiement déclenché par les modifications.
- [ ] Si zone HIGH touchée : commentaire Kaan d'autorisation joint ci-dessous.

## Rapport Hermès

<!-- Lien vers le rapport final si la mission en exige un. Voir docs/hermes/03_REPORT_TEMPLATE.md. -->

`docs/hermes/missions/AAAA-MM-JJ_titre-rapport.md`

## Captures avant / après

<!-- Pour toute PR qui touche l'UI. Format : image desktop + mobile, avant + après. -->

…

## Décision attendue de Kaan

- [ ] Validation visuelle uniquement → merge sur `main`
- [ ] Itération demandée (laisser feedback en review)
- [ ] Demande de second avis Codex avant merge
- [ ] PR à fermer / rejeter

<!--
  Rappel final :
  - Pas de force-push sur main.
  - Pas de --no-verify, pas de --no-gpg-sign.
  - Toujours créer un NOUVEAU commit plutôt qu'amender.
  - Hermès prépare, Claude Code exécute, Kaan valide.
-->
