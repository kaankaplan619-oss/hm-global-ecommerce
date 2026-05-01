# 07 — Tâche Active

*Dernière mise à jour : 2026-05-01*

## État actuel du projet

| Étape | Statut | Notes |
|---|---|---|
| B3.2-A2 MockupViewer | ✅ Validé production | Zones calibrées, sélection logo, contrôles |
| Fix TopTex 502 | ✅ Déployé | Commit `6261eaa`, early return si TOPTEX_API_KEY absent |
| Variables Supabase Vercel | ✅ Configurées | Redeploy READY en production |
| Fix hydration Zustand (`_hasHydrated`) | ✅ Déployé | 10 pages protégées, commits `8f226c9` + `47fd8b2` |
| Upload logo production | ✅ Validé | URL `customer-logos/cart/…` confirmée en production |
| Auth register/login production | ✅ Validé | Domaine final : `hm-global.vercel.app` |
| Checkout flux complet V1 | ✅ Validé | Voir détail ci-dessous |
| Suppression `test-ci@hmga.fr` | ⏳ À faire | User Supabase ID: `2510b913` — depuis Dashboard Auth |
| Mémoire projet `/docs/agent-memory/` | ✅ Créée | 10 fichiers (00→09) |
| `CLAUDE.md` mis à jour | ✅ Fait | Section lecture obligatoire ajoutée |
| **B4 / BAT (Bon À Tirer)** | 🟡 Prêt à démarrer | Flux V1 validé, plus aucun bloquant |

## Détail validation flux V1 (2026-05-01)

Testé sur `https://hm-global.vercel.app` — 14 étapes validées :

1. `/catalogue/tshirts` non connecté → 6 produits affichés ✅
2. Fiche produit `/produits/tshirt-bc-exact-190-homme` ✅
3. Taille L + DTF + placement Cœur sélectionnés ✅
4. Upload logo PNG sans compte → local preview uniquement ✅
5. Notice *"Logo chargé pour la prévisualisation. Il sera enregistré au moment de la commande."* + bouton non bloqué ✅
6. Ajout au panier → cart Zustand persisté ✅
7. `/checkout` → middleware 307 → `/connexion?redirect=%2Fcheckout` ✅
8. Connexion compte test → API 200, cookies Supabase posés ✅
9. Retour automatique sur `/checkout` ✅
10. Panier conservé après login ✅
11. Bloc *"Logo à enregistrer"* affiché, bouton Payer `disabled: true` ✅
12. Re-sélection logo dans checkout ✅
13. Upload Supabase Storage → `logoFile.url` + `logoFile.path` présents ✅
14. Bouton *"Payer 28,80 €"* `disabled: false` après adresse + logo ✅

Aucune erreur console. Aucun bug bloquant.

## Prochaine action

→ Démarrer **B4 — Validation BAT (Bon À Tirer)** :
- Interface de validation BAT côté admin (visualiser logo uploadé, approuver/rejeter)
- Email de demande de validation envoyé au client
- Statut commande `en_attente_client` → `validee` selon retour client

## Contexte B4

Le BAT est l'étape où l'admin HM Global valide visuellement le fichier logo uploadé par le client, puis envoie un email de demande de confirmation. Le client reçoit l'email, consulte l'aperçu, et confirme ou demande une correction avant que la production ne démarre.
