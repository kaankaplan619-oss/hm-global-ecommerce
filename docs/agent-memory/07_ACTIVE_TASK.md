# 07 — Tâche Active

*Dernière mise à jour : 2026-04-30*

## État actuel du projet

| Étape | Statut | Notes |
|---|---|---|
| B3.2-A2 MockupViewer | ✅ Validé production | Zones calibrées, sélection logo, contrôles |
| Fix TopTex 502 | ✅ Déployé | Commit `6261eaa`, early return si TOPTEX_API_KEY absent |
| Variables Supabase Vercel | ✅ Configurées | Redeploy READY en production |
| Upload logo production | ⏳ En attente | Validation manuelle navigateur par l'utilisateur |
| Suppression `test-ci@hmga.fr` | ⏳ Bloqué | À faire après validation upload (user Supabase ID: `2510b913`) |
| Mémoire projet `/docs/agent-memory/` | ✅ Créée | 10 fichiers (00→09) |
| `CLAUDE.md` mis à jour | ✅ Fait | Section lecture obligatoire ajoutée |
| **B4 / BAT (Bon À Tirer)** | 🔴 Bloqué | Attend confirmation upload logo en production |

## Prochaine action utilisateur

1. Valider manuellement l'upload logo en production :
   - Se connecter sur `hm-global.vercel.app`
   - Aller sur une page produit
   - Uploader un logo (PNG < 10MB)
   - Vérifier dans la console navigateur que `logoFile.url` et `logoFile.path` sont présents dans le cart
2. Confirmer le résultat dans le chat
3. Supprimer `test-ci@hmga.fr` depuis Supabase Dashboard → Auth → Users

## Prochaine action Claude (après confirmation)

→ Démarrer **B4 — Validation BAT (Bon À Tirer)** :
- Interface de validation BAT côté admin
- Email de demande de validation client
- Statut commande `en_attente_client`

## Contexte B4

Le BAT est l'étape où l'admin HM Global valide visuellement le fichier logo uploadé par le client, puis envoie un email de demande de confirmation. Le client reçoit l'email, consulte l'aperçu, et confirme ou demande une correction avant que la production ne démarre.
