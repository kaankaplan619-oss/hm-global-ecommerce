# PROJECT_STATE — Dashboard d'état HM Global

> **Dernière mise à jour : 2026-05-18.** Ce fichier remplace les sections « état » d'anciens docs et sert de point d'entrée rapide.
>
> À mettre à jour à chaque fois qu'une mission Hermès est validée (commit `*-rapport.md`).

---

## État actuel

| Système | Statut | Note |
|---|---|---|
| Site en production (`hm-global.vercel.app`) | ✅ Up | Hors branche mission, sur `main = 28309bd` |
| Tunnel d'achat V1 (catalogue → studio → checkout → Stripe) | ✅ Validé production | Voir `07_ACTIVE_TASK.md` détail |
| MockupViewer B3.2-A2 | ✅ Validé production | **Ne jamais casser** — zones calibrées |
| Studio configurateur `/studio/[slug]` | ✅ Déployé | Specs : `11_STUDIO_SPEC.md` |
| BAT Preview Studio + BATModal | ✅ Validé production | |
| Hermès Discord (notifications) | ✅ Opérationnel | Webhooks `DISCORD_WEBHOOK_URL` + `DISCORD_NIGHT_WEBHOOK_URL` testés |
| GitHub Issue/PR templates | ✅ Poussés sur `main` | 5 templates issue + 1 PR template (commit `6bf1a0d`) |
| SSH GitHub | ✅ Opérationnel | Clé ed25519 configurée, remote = SSH |
| Branche unification zones | ⏳ **En cours** — Vercel build à valider | Voir `07_ACTIVE_TASK.md` |
| 81 fichiers untracked restants | 📋 À trier plus tard | Voir `IMAGE_ASSETS_RULES.md` |

---

## Derniers commits importants

```
main :
  28309bd  feat(product): improve catalogue and product visuals
  1b6413f  feat(impression): polish print pages
  c4af577  feat(home): refine premium homepage experience
  4f8f555  feat(catalogue): add new textile products (Comfort Colors 1717, Gildan 2400 LS)
  e375521  chore: refresh product mockups
  6bf1a0d  feat: add Hermès GitHub issue and PR templates

mission/2026-05-18-configurateur-unification-zones :
  ec2124e  fix(build): commit premium home components (9 Home* manquants)
  f9ec03b  chore(assets): add Printify mockups + home images (287 fichiers, 21 MB)
  9fef335  fix(build): commit untracked product/print stage and quote components (4 fichiers)
  7a2bd62  fix(build): resolve hm visual utils import on Vercel (11 fichiers)
  c4337bd  feat(configurator): unify textile marking zones — single source of truth
```

**À retenir** : la branche mission a accumulé 5 commits — 1 commit de la mission principale (unification) + 4 commits "fix build Vercel" qui ont commit des fichiers existant localement mais jamais poussés. Voir `VERCEL_DEBUG.md` pour la leçon.

---

## Prochaine action

1. **Valider le déploiement Vercel** de la branche `mission/2026-05-18-configurateur-unification-zones` (commit `ec2124e`).
2. Si build Vercel passe : **tester la preview visuellement** — homepage + `/studio/<slug>` + `/produits/<slug>` + `/catalogue/tshirts` + `/impression`.
3. Si validation visuelle OK : ouvrir une PR vers `main` (template Hermès), Kaan approuve, merge.
4. Si build Vercel échoue encore : récupérer le **log exact** (voir `VERCEL_DEBUG.md`) avant toute correction.

---

## Branches actives

| Branche | Statut | Ce qu'elle contient |
|---|---|---|
| `main` | Sync `origin/main` (`28309bd`) | Production stable |
| `mission/2026-05-18-configurateur-unification-zones` | Sync `origin/...` (`ec2124e`) | Mission unification + 4 fix build |

Pas d'autres branches mission en cours.

---

## Pour info — missions Hermès récentes (voir `docs/hermes/missions/`)

- `2026-05-18_configurateur-unification-zones.md` (en exécution actuellement)
- `2026-05-18_configurateur-textile-fabricjs-audit.md` (rapport d'audit complet)
- `2026-05-18_hermes-github-templates.md` (validée, mergée sur main via `6bf1a0d`)
- `2026-05-18_hermes-discord-channel.md` (contrat figé, validée)
- `2026-05-18_hermes-agentic-architecture-report.md` (rapport architecture global)

---

## Comment mettre à jour ce fichier

À chaque mission validée :
1. Ajouter le nouveau commit dans la table « Derniers commits importants ».
2. Mettre à jour la table « État actuel » si une feature passe `⏳` → `✅`.
3. Mettre à jour « Prochaine action ».
4. Mettre la date en haut.

**Ne pas dépasser 100 lignes utiles.** Si ça déborde, déplacer le détail dans un fichier dédié.
