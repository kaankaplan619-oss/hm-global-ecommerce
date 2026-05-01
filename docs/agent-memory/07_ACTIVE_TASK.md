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
| **B4 / BAT Preview Studio** | ✅ Validé production | Commit `1afa1e9` — studio Fabric.js full-screen |

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

## B4 BAT Preview Studio — Validé 2026-05-01

Commit `1afa1e9` — Testé localement sur `http://localhost:3000/produits/tshirt-bc-exact-190-homme` :
- Studio ouvre via bouton "Prévisualiser le BAT" ✅
- Canvas Fabric.js présent, logo test-logo.png chargé ✅
- Boutons Face/Dos, zoom+/-, recentrer, sélecteur d'effet ✅
- Panel info : Blanc / L / DTF / Cœur / test-logo.png ✅
- "Voir le BAT complet" → studio fermé, BATModal ouvert (z-9999) ✅
- "← Retour au configurateur" → ferme le studio ✅
- Zéro erreur console ✅

## Prochaine action

→ **B5 — Flux de commande complet** (Stripe, création commande Supabase, email confirmation)
→ Ou **Pages légales** (CGV, Politique de confidentialité, Mentions légales) — déjà en todo
