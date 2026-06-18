# PROGRESS — Boutique HM Global
_Dernière mise à jour : 2026-06-15 par session `audit-initial`_

Légende statut : ✅ done · 🟡 partial (socle là, gap précis) · ⬜ todo · ❓ unknown (vérifiable seulement hors repo : dashboard Supabase/Vercel)

## État courant
- Lot en cours : **LOT 0** (sécurité/onboarding) — socle solide, 4 trous précis à fermer.
- Prochaine tâche proposée : voir « Recommandation » plus bas.
- Blocages externes :
  - **Q1 domaine** (DNS `hm-global.fr` non possédé) → bloque la moitié « email de confirmation » de T0.1 (la moitié « Turnstile » n'est PAS bloquée).
  - **Q2 sérigraphie** (Seri 2 Est = Toodlest ? grille prix ?) → nécessaire pour le modèle pricing T1.1.
  - **Q3 Vercel canonique** → ✅ RÉSOLU : canonique = `hm-global` (détient hm-global.fr). Reste : confirmer repo GitHub à jour + Kaan archive les 2 doublons.

## Recommandation de séquence (P0, non bloqué, à valider par Kaan)
Tout ce qui suit est **pur code, zéro dépendance externe** — on peut avancer sans attendre les 3 questions :
1. **T0.2** — idempotency keys Stripe (anti double-commande). ~15 lignes, le plus sûr.
2. **T0.3** — validation magic bytes sur les 4 routes d'upload + nettoyage incohérences SVG.
3. **T0.4** — CSP manquante + rate-limit sur le checkout (`create-payment-intent` non protégé aujourd'hui).
4. **T0.1 (moitié Turnstile)** — widget + vérif serveur (l'email de confirmation attend Q1).
> Après ces fermetures LOT 0, basculer sur LOT 1 (prix volume) qui est le P0 commercial.

## Reconciliation BRIEF ↔ réalité du code (à savoir avant de coder)
- ✅ **Flux commande E2E = déjà codé en entier** (T0.6) — les 8 étapes existent. Reste runtime : Stripe en mode TEST, webhooks prod à reconfigurer, email BAT client absent de lib/email.ts.
- ✅ **Gelato déjà câblé** (lib/gelato.ts + route admin + migration 016 + mapping UID). Le manque = routage **auto** post-paiement (Gelato/Printful/Printify tous déclenchés à la main aujourd'hui).
- ⚠️ **« meta-keywords dupliquées » (T2.2) = faux** : keywords défini une seule fois (layout). Rien à nettoyer.
- ⚠️ **Sérigraphie n'existe pas comme technique** dans le code (type Technique = dtf/dtflex/flex/broderie/print). Reste un circuit « interne »/devis.
- ⚠️ **Dynamic Mockups (T3.1)** largement rendu caduc par le **MockupViewer maison** (Fabric.js + zones cœur/dos calibrées, Printful/Printify) — CLAUDE.md interdit de le casser. À trancher avec Kaan avant d'investir.
- ⚠️ **hreflang/i18n (T2.4) absent par choix** (i18n par cookie, routes /en /tr = V2 reporté).
- ⚠️ **AggregateRating** : ne PAS inventer de note (« 4.9/5 » non sourcé = risque DGCCRF).

## Journal (du plus récent au plus ancien)
### 2026-06-15 — audit-initial — DNS email : trouvé où Tuncer bloque
- DNS public (dig) + API Resend : domaine `hmga.fr` dans Resend = statut **`not_started`** (région eu-west-1). 3 records requis, **0 posé sur hmga.fr**.
- **Cause du blocage** : le DKIM (`resend._domainkey`, clé `p=MIGf…`) a été posé sur **`hm-global.fr`** (mauvais domaine) et non sur `hmga.fr`. Et seulement 1/3 records (les 2 `send` = MX + SPF manquent partout).
- `hmga.fr` zone = **OVH** (dns17.ovh.net) → c'est là qu'il faut poser les 3 records. `hm-global.fr` = NS ns1/ns2.hm-global.fr (autre hébergeur).
- 3 records à poser sur hmga.fr (OVH) : TXT `resend._domainkey`=`p=MIGf…IDAQAB` ; MX `send`=`feedback-smtp.eu-west-1.amazonses.com.` prio 10 ; TXT `send`=`v=spf1 include:amazonses.com ~all`. ⚠️ noms RELATIFS (pas le FQDN). + corriger apex SPF hmga.fr `+all`→`~all`.
- Après vérif Resend : `RESEND_FROM_EMAIL=contact@hmga.fr` (.env.local + Vercel) + Supabase Auth SMTP custom Resend.

### 2026-06-15 — audit-initial — Diagnostic COMPTE + EMAILS (vérifié en réel)
- Supabase `auth.users` : 10 comptes, création OK. Les anciens (avr/mai) = `confirme=true, sent=false` (auto-validés, confirmation OFF). Les 2 récents (12/06) = `sent=true, confirme=false, jamais connecté` → **confirmation activée ~11/06, mais emails non délivrés → nouveaux comptes bloqués**.
- `.env.local` : **`RESEND_FROM_EMAIL=@resend.dev`** = domaine de TEST Resend (envoie uniquement à l'adresse du compte Resend, pas aux clients). REPLY_TO=contact@hmga.fr. lib/email.ts OK côté code.
- Conclusion : **les emails ne marchent PAS pour les clients** (auth confirm + transactionnels). Fix = Q1 (domaine vérifié hmga.fr → RESEND_FROM_EMAIL réel + SMTP Supabase). Voir T0.1.

### 2026-06-15 — audit-initial — T0.5 Vercel : canonique identifié
- Via API Vercel (team `sumup-agen-ia-s-projects`) : 3 projets boutique. **Canonique = `hm-global`** (prj_CyFXL6ntC9VabE1frmLF0KJPLlV9) — détient `hm-global.fr` + `www.hm-global.fr`, deploy prod actif (juin 2026), framework Next.js. Linké dans `.vercel/project.json`.
- **Doublons stales** : `hm-global-app` + `hm-global-app-effg` (créés en mars 2026 à 4 min d'intervalle = duplicata de setup), derniers deploys ~mars, framework=null, que des `*.vercel.app`. Sans risque à archiver.
- Pas des doublons : `hm-apercu-maquettes` (utilitaire), `hm-nettoyage` (autre business), bots Hermès.
- Next step : Kaan archive les 2 doublons côté Vercel + confirme le repo GitHub à jour (action infra, hors code).

### 2026-06-15 — audit-initial — Établissement de l'état réel (lecture seule)
- Workflow 5 agents (un par LOT) contre le code réel. BRIEF.md + AUDIT_HM_GLOBAL_ECOMMERCE.md sauvegardés dans `docs/agent-memory/`.
- Aucun fichier de code modifié. Résultat = la checklist ci-dessous (statuts réels, preuves fichier:ligne dans l'output d'audit).
- Next step : Kaan valide la 1re tâche (reco = T0.2) + répond aux 3 questions bloquantes.

## Checklist globale (statut réel au 2026-06-15)
### LOT 0 — Sécurité & onboarding (P0)
- 🔴 **T0.1** Email confirmation + SMTP Resend + Turnstile — **DIAGNOSTIC 2026-06-15 (vérifié Supabase + .env)** : création de compte OK (10 users en base). MAIS la confirmation email a été ACTIVÉE vers le 11-12/06 → les 2 inscrits depuis (12/06) ont `confirmation_sent_at` SET mais `email_confirmed_at` NULL et ne se sont JAMAIS connectés = **funnel d'inscription cassé, les nouveaux comptes sont bloqués**. Cause racine = **`RESEND_FROM_EMAIL=@resend.dev`** (domaine de TEST Resend → n'envoie QU'À l'adresse du compte Resend, PAS aux vrais clients) → ni confirmation ni emails transactionnels (commande/virement) n'arrivent aux clients. **Turnstile = absent (0 hit).** Débloque par Q1 : domaine d'envoi vérifié (hmga.fr DNS chez Tuncer) → `RESEND_FROM_EMAIL=contact@hmga.fr` + Supabase Auth SMTP custom Resend. Stopgap = désactiver la confirmation (auto-validé) pour que l'inscription marche, mais ça ne règle PAS les emails clients._
- 🟡 **T0.2** Stripe webhook + montants serveur — _signature OK + recompute prix serveur OK ; **manque idempotency keys** (lib/stripe.ts:31)._
- 🟡 **T0.3** Uploads SVG/PNG durcis — _SVG refusé + taille 10Mo + Content-Type forcé ; **manque validation magic bytes** (tout repose sur file.type) ; msg erreur quote-requests:97 trompeur ; svg à nettoyer lib/utils.ts:79, lib/uploadLogo.ts:26._
- 🟡 **T0.4** Headers sécurité + rate limit — _HSTS/X-Frame/nosniff/Referrer/Permissions OK ; **CSP absente** ; rate-limit in-memory sur auth/upload/contact/quote mais **PAS sur checkout** (create-payment-intent) ; Upstash non câblé._
- 🟡 **T0.5** Doublon Vercel — _**canonique identifié = `hm-global`** (prj_CyFXL6…, détient `hm-global.fr` + `www` + hm-global.vercel.app, deploy prod actif juin 2026, framework=nextjs). **Doublons stales à archiver** : `hm-global-app` (prj_Q3pS…) + `hm-global-app-effg` (prj_pHsv…) — derniers deploys ~mars 2026, framework=null, AUCUN domaine réel. (Le « hm-global-ecommerce » du brief n'existe pas.) Reste = Kaan archive/supprime les 2 doublons (action infra)._
- ✅ **T0.6** Test commande bout-en-bout (code) — _les 8 étapes existent dans le code. Reste : E2E navigateur runtime + Stripe LIVE + email BAT client._
- 🟡 **ENV** — _Supabase/Stripe/Resend/Gelato présents ; nombreuses intégrations en + (Printful/Printify/TopTex/CloudPrinter/PrintOClock/Prodigi/Pennylane/Discord/Google/GA/bank) ; **Turnstile/Upstash/Dynamic Mockups absents** ; vars code-only à poser sur Vercel (GOOGLE_PLACES_*, GA, DISCORD_ORDERS, PRINTIFY_SHOP_ID, NEXT_PUBLIC_SITE_URL)._

### LOT 1 — Prix & fulfillment (P0/P1)
- 🟡 **T1.1** Modèle pricing — _paliers volume OK (~25 grilles, data/pricing.ts) + technique + position ; **pas de modèle coût-décomposé** (blank/marquage/marge = commentaires seulement) ; sérigraphie non modélisée ; paliers 10/25/50/100/200 (pas 250) ; rien en SQL._
- 🟡 **T1.2** UI grille dégressive — _tableau dégressif réactif + recalcul live OK (ProductConfigurator:677) ; **pas de vrai panachage** (palier calculé par ligne, pas sur le cumul panier)._
- 🟡 **T1.3** Gelato — _client + route + migration + mapping UID OK ; **pas de routage auto post-paiement** (les 3 circuits restent manuels admin)._
- 🟡 **T1.4** computePrice + tests — _computeUnitPriceWithVolume existe ; **formule ≠ (blank+marquage)×marge** (prix finaux bakés) ; **0 test unitaire** (aucun runner installé)._

### LOT 2 — SEO (P1)
- 🟡 **T2.1** JSON-LD — _LocalBusiness complet & exact ; **manque Product+Offer + BreadcrumbList** sur fiches ; AggregateRating absent (ne pas inventer)._
- 🟡 **T2.2** Titles/metas — _~30 pages avec generateMetadata, home title distinct ; meta-keywords PAS dupliquées ; **manque OG image par catégorie/produit**._
- 🟡 **T2.3** sitemap/robots/canonical — _sitemap.ts + robots.ts complets ; **canonical seulement sur la home**._
- ⬜ **T2.4** hreflang/i18n — _i18n par cookie, **aucune route /en /tr, aucun hreflang** (V2 assumé reporté)._
- ⬜ **T2.5** Pages locales service+ville — _aucune (0 landing dédiée)._

### LOT 3 — Mockups (P1)
- ⬜ **T3.1** Dynamic Mockups — _absent ; **système maison MockupViewer (Fabric.js + zones cœur/dos) déjà en place** → pertinence à trancher (ne pas casser)._
- 🟡 **T3.2** Pipeline design→mockup — _auto upload→preview « ton logo dessus » FONCTIONNE déjà (système maison) ; Dynamic Mockups non utilisé._

### LOT 4 — Animations (P2)
- ⬜ **T4.1** Lenis smooth scroll — _absent (0 lib)._
- ⬜ **T4.2** GSAP/Framer Motion — _absent ; seules animations = CSS keyframes (globals.css)._
- ⬜ **T4.3** View Transitions (hors checkout) — _absent._
