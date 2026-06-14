# 09 — Tâche active

Dernière mise à jour : 2026-06-14.

## Mission actuelle

Préparer HM Global pour une évolution structurée V3 à V6 :

- audit marché et concurrents ;
- UX et conversion ;
- SEO local, avis et mesure ;
- rentabilité et routage fournisseurs ;
- récurrence entreprise et passage à l’échelle.

Références :

- `17_MARKET_GROWTH_ROADMAP_V3_V6.md`
- `docs/prompts/CLAUDE_CODE_V3_V6_MARKET_AUDIT.md`
- `16_LAUNCH_CHECKLIST.md`

## État utile

| Sujet | État | Suite |
|---|---|---|
| MockupViewer et zones Fabric.js | Validés production, protégés | Ne pas modifier sans audit complet |
| Studio Canva-style | Déployé historiquement | Revalider le parcours après le prochain déploiement |
| Checkout invité | Implémenté et testé localement le 2026-06-14 | Déployer puis faire un E2E production sans débit réel |
| Upload Studio/logo invité | Route serveur testée localement le 2026-06-14 | Revoir abus/rate limit puis valider production |
| Pipeline Printful | Garde-fous et brouillons déjà audités | Ne jamais confirmer une commande fournisseur en QA |
| Domaine `hm-global.fr` | Utilisé en production publique | Vérifier Vercel, TLS, canonical et redirections |
| Mesure acquisition | Aucun socle GA4/GTM confirmé dans le code | Décision consentement + IDs avant publicité |
| Google Business Profile | Fiche publique observée | Confirmer propriété, liens, catégories et UTM |
| Roadmap marché V3-V6 | Documentée le 2026-06-14 | Faire l’audit Claude Code en lecture seule |

## Priorité immédiate

1. Exécuter le prompt d’audit sans modification de code.
2. Valider le premier lot V3.
3. Déployer et tester la commande invitée en production.
4. Installer la mesure avant toute augmentation du budget publicitaire.
5. Lancer les pages locales et cas clients avec preuves réelles.

## Garde-fous

- Le working tree contient plusieurs changements non commités : ne rien écraser.
- Ne pas effectuer de paiement ou de commande fournisseur réelle en QA.
- Ne pas inventer de cas client, avis, partenariat ou chiffre de performance.
- Ne pas ouvrir massivement le catalogue avant d’avoir la marge et le circuit de production.
