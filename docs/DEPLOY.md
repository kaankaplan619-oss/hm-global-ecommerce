# Déploiement — HM Global Agence

> Procédure de mise en ligne + checklist des variables Vercel.
> Source de vérité de l'avancement : `docs/agent-memory/16_LAUNCH_CHECKLIST.md`.

## TL;DR

- **Prod** = Vercel, **auto-déployé depuis la branche `main`** du repo GitHub.
- **Déployer** = pousser le travail validé vers `main`.
  - Convention actuelle : `git push origin codex/hermes-os-cockpit-v1:main`
  - 💡 Reco : simplifier en travaillant directement sur `main` (réaligner le `main` local sur `origin/main`).
- **Rien ne part en prod tant qu'on ne pousse pas vers `main`.** Les autres branches ne déploient pas.

## Avant de déployer (checklist locale)

```bash
npm run check-env     # variables locales présentes ?
npm run type-check    # 0 erreur TypeScript
npm run lint          # 0 erreur ESLint
npm run build         # build Next OK en local
```

Pour toute modif d'interface : vérifier aussi le **rendu réel** (cf. `docs/agent-memory/12_TESTING_PROTOCOL.md`). type-check + lint ne suffisent jamais pour conclure sur l'UI.

## Variables d'environnement à poser dans Vercel

Liste de référence complète : `.env.local.example` (54 variables, commentées `[CRITIQUE]`/`[LIVE]`/`[OPTIONNEL]`).

**Critiques (sans elles, le site ne tourne pas) :**
- `NEXT_PUBLIC_SITE_URL` = `https://hm-global.fr`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, `CONTACT_TO_EMAIL`

**À poser selon les fonctions activées :**
- Virement : `HM_BANK_BENEFICIARY`, `HM_BANK_IBAN`, `HM_BANK_BIC`
- Prospection : `BREVO_API_KEY`, `BREVO_LIST_ID=4`
- Notifications : `DISCORD_WEBHOOK_URL`, `DISCORD_ORDERS_WEBHOOK_URL`
- Avis Google / analytics : `GOOGLE_REVIEW_URL`, `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACES_PLACE_ID`, `NEXT_PUBLIC_GA_ID`
- Fournisseurs : `PRINTFUL_*`, `PRINTIFY_*`, `GELATO_*`, etc. (cf. `.env.local.example`)

⚠️ **Ne JAMAIS mettre `QA_CLAUDE_EMAIL` / `QA_CLAUDE_PASSWORD` en prod** (compte de test, local uniquement).

## Passage Stripe TEST → LIVE (go-live commerce)

Tant que ce n'est pas fait, le site tourne mais ne prend pas de vrai paiement.

1. Activer le compte Stripe en LIVE (identité + compte bancaire vérifiés).
2. Dans Vercel (Production), remplacer par les clés **live** :
   - `STRIPE_SECRET_KEY` → `sk_live_…`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_…`
3. Recréer le **webhook** Stripe en prod (endpoint `https://hm-global.fr/api/stripe/webhook`) → coller son secret dans `STRIPE_WEBHOOK_SECRET`.
4. Redéployer, puis faire **1 vraie commande test** (petit montant) → vérifier email + paiement → rembourser.

## Après déploiement

- Ouvrir `https://hm-global.fr` : accueil, `/studio`, `/panier`, `/realisations`.
- Vérifier les **logs Vercel** (aucune erreur runtime).
- Mettre à jour le statut dans `16_LAUNCH_CHECKLIST.md`.

## CI (garde-fou)

`.github/workflows/ci.yml` lance **type-check + lint** sur chaque push vers `main` et chaque PR
(+ un build informatif). Un feu rouge = ne pas déployer tant que ce n'est pas corrigé.
