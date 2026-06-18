# BRIEF CLAUDE CODE — Boutique HM Global

But de ce fichier : permettre à Claude Code d'exécuter le chantier lot par lot sans se perdre, même après un compactage de conversation.

## 0. Contexte projet (à lire en premier, à chaque session)

- Stack : Next.js (App Router) + TypeScript, Tailwind + shadcn/ui, Supabase (Auth + Postgres + Storage), Stripe, Vercel. Multilingue (next-intl ou équivalent) en cours.
- Domaine principal : `hm-global.fr` (boutique sur le même domaine — ne pas migrer).
- Org GitHub : `kaankaplan619-oss`. Action requise de Kaan : confirmer le repo exact + le projet Vercel canonique (doublon `hm-global` / `hm-global-ecommerce` à résoudre — voir T0.5).
- Fournisseurs/intégrations cibles : Gelato (POD API, prod FR), Dynamic Mockups (API mockups), Resend (email transactionnel), Brevo (newsletters), Stripe (paiement).
- Réf. décision : voir `AUDIT_HM_GLOBAL_ECOMMERCE.md` à la racine `outputs/`.

## 1. RÈGLE D'OR ANTI-DÉRIVE (obligatoire)

Le compactage de conversation fait perdre le fil. Pour l'éviter :

1. **Fichier d'état persistant** : `docs/agent-memory/PROGRESS.md` (template au §5).
   - Au début de CHAQUE session : lire `PROGRESS.md` + ce `BRIEF.md` avant toute action.
   - À la fin de CHAQUE tâche : cocher la tâche, noter les fichiers modifiés, les décisions et le « next step » dans `PROGRESS.md`, puis commit.
2. **Une tâche = une petite PR / un commit atomique.** Jamais plusieurs lots dans un même commit.
3. **Definition of Done (DoD) par tâche** : code + test/vérif passé + `PROGRESS.md` mis à jour + build OK (`npm run build`).
4. **Ne jamais inventer un chemin de fichier.** Si incertain : `grep`/`find` dans le repo d'abord.
5. **Ordre = P0 → P1 → P2.** Ne pas commencer un lot tant que le précédent n'est pas « Done » (sauf blocage externe documenté dans `PROGRESS.md`).
6. **Secrets** : jamais en clair, jamais en `NEXT_PUBLIC_*`. Toujours via env Vercel + `.env.local` non commité.

## 2. Prompt de démarrage de session (à coller à Claude Code)

```
Lis docs/agent-memory/BRIEF.md puis docs/agent-memory/PROGRESS.md.
Donne-moi : (1) le dernier état, (2) la prochaine tâche non terminée selon l'ordre P0→P2,
(3) les fichiers concernés que tu comptes toucher. Ne code rien avant ma validation de la tâche.
```

## 3. BACKLOG PRIORISÉ (lot par lot)

Format : ID — Objectif · Fichiers probables · Étapes · DoD / Vérif

### LOT 0 — Sécurité & onboarding (P0, à faire en premier)

**T0.1 — Réactiver l'email de confirmation + SMTP Resend + CAPTCHA**
- Fichiers : config Supabase Auth (dashboard), `lib/supabase/*`, page d'inscription (`app/(auth)/inscription` ou équivalent).
- Étapes : configurer SMTP custom Resend dans Supabase Auth → réactiver « Confirm email » → intégrer Cloudflare Turnstile sur le formulaire d'inscription (supporté nativement par Supabase).
- Bloqué tant que le DNS d'envoi n'est pas en place (records DKIM/SPF/DMARC sur `send.hm-global.fr`). Documenter le blocage dans `PROGRESS.md` si non résolu.
- DoD : une inscription test envoie bien un email de confirmation ; un compte non confirmé ne peut pas se connecter ; Turnstile bloque une soumission sans token.

**T0.2 — Sécuriser Stripe (webhook + montants serveur)**
- Fichiers : `app/api/webhooks/stripe/route.ts`, `app/api/checkout/route.ts` (ou équivalents).
- Étapes : vérifier la signature du webhook (`stripe.webhooks.constructEvent`) ; s'assurer que le prix/montant est défini côté serveur à la création de la session (jamais lu depuis le client) ; ajouter idempotency keys.
- DoD : un webhook sans signature valide est rejeté (401) ; modifier le prix côté client n'a aucun effet sur le montant débité.

**T0.3 — Durcir les uploads (SVG/PNG)**
- Fichiers : route/handler d'upload, policies Storage Supabase.
- Étapes : sanitiser le SVG (svg-sanitizer/DOMPurify côté serveur) OU rasteriser en PNG ; valider le type réel (magic bytes), pas l'extension ; limiter la taille ; servir depuis Storage avec `Content-Type` forcé.
- DoD : un SVG contenant `<script>` est nettoyé/rejeté ; un fichier renommé `.png` mais non-image est refusé.

**T0.4 — Headers de sécurité + rate limiting**
- Fichiers : `next.config.js` (headers) ou `middleware.ts`, `lib/ratelimit.ts`.
- Étapes : ajouter `CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` ; rate-limit (`@upstash/ratelimit`) sur auth + checkout + upload.
- DoD : headers présents (vérif via `curl -I`) ; au-delà du seuil, les requêtes auth renvoient 429.

**T0.5 — Résoudre le doublon Vercel**
- Étapes : identifier le projet prod canonique, y rattacher le domaine `hm-global.fr`, archiver/supprimer le doublon, vérifier qu'une seule URL est en ligne et indexable.
- DoD : une seule URL de prod accessible ; l'autre redirige ou est hors ligne ; env vars présentes uniquement sur le bon projet.

**T0.6 — Test commande bout-en-bout (checklist, pas du code)**
- Compte → email reçu → panier → Checkout → paiement test puis réel → webhook → commande en base → email confirmation → espace client/suivi → flux BAT.
- DoD : chaque étape cochée dans `PROGRESS.md`. Aucune pub/prospection avant ce point.

### LOT 1 — Prix & fulfillment (P0/P1)

**T1.1 — Modèle de données pricing (paliers + technique + position)**
- Fichiers : migration Supabase (`supabase/migrations/*`), types (`types/*`).
- Étapes : table/colonnes pour paliers quantité (10/25/50/100/250), technique (DTF / sérigraphie / broderie / flex), position (1 face / cœur+dos), coût blank + coût marquage par technique/position, marge.
- DoD : on peut stocker, pour un produit, un prix unitaire qui décroît par palier et varie selon technique+position.

**T1.2 — UI grille dégressive sur la fiche produit**
- Fichiers : `app/produits/[slug]/*`, composants prix/`PriceTable`.
- Étapes : afficher les paliers + prix unitaire ; mention frais technique offerts ; panachage tailles/couleurs autorisé ; recalcul live du total.
- DoD : changer la quantité met à jour le prix unitaire selon le palier ; le total reflète le panachage.

**T1.3 — Intégration Gelato (POD complément)**
- Fichiers : `lib/gelato/*`, route de création de commande fournisseur.
- Étapes : connecter l'API Gelato (clé en env), mapper les SKU « dropship », router automatiquement la commande après paiement validé.
- DoD : une commande sur un SKU Gelato crée bien une commande Gelato en sandbox ; les SKU produits en interne ne partent pas chez Gelato.

**T1.4 — Logique de calcul de prix**
- Fichiers : `lib/pricing/*`.
- Étapes : fonction `computePrice({ produit, qty, technique, position })` = (coût blank + coût marquage) × marge, paliers appliqués.
- DoD : tests unitaires sur 3 cas (10 pièces DTF 1 face ; 50 pièces sérigraphie cœur+dos ; 100 pièces broderie) renvoient des prix cohérents et décroissants.

### LOT 2 — SEO & données structurées (P1)

**T2.1 — JSON-LD**
- Fichiers : `app/layout.tsx` (global), composant `JsonLd`, pages produits/catégories.
- Étapes : `Organization`/`LocalBusiness` (NAP, horaires, géo, `sameAs`), `AggregateRating` (note + nb d'avis réels), `Product`+`Offer` (prix/dispo) sur fiches, `BreadcrumbList` sur catégories.
- DoD : validation OK dans le Rich Results Test de Google pour LocalBusiness et Product.

**T2.2 — Titles & metas uniques**
- Fichiers : `generateMetadata` par page.
- Étapes : corriger le title home → `HM Global — Textile personnalisé, impression & enseignes à Strasbourg` ; titles/descriptions uniques par page ; nettoyer/retirer `meta-keywords` dupliquées ; OG image par catégorie.
- DoD : chaque page a un `<title>` et une `meta description` distincts et pertinents.

**T2.3 — sitemap.xml + robots.txt + canonical**
- Fichiers : `app/sitemap.ts`, `app/robots.ts`.
- Étapes : sitemap dynamique (toutes les routes indexables), robots déclarant le sitemap, `canonical` correct par page.
- DoD : `/sitemap.xml` et `/robots.txt` répondent ; sitemap soumis à Search Console.

**T2.4 — hreflang & i18n (si multilingue actif)**
- Fichiers : config i18n, `generateMetadata`.
- Étapes : URLs localisées, balises `hreflang` réciproques, métadonnées traduites par locale.
- DoD : chaque page localisée référence ses alternates ; pas de contenu dupliqué cross-langue.

**T2.5 — Pages locales (SEO local)**
- Fichiers : template de page locale réutilisable.
- Étapes : générer des pages « service + ville » (flocage Strasbourg, enseigne Strasbourg, impression Souffelweyersheim…).
- DoD : au moins 3 pages locales publiées, indexables, maillées depuis le site.

### LOT 3 — Mockups automatisés (P1)

**T3.1 — Intégration Dynamic Mockups**
- Fichiers : `lib/mockups/*`.
- Étapes : clé API en env ; endpoint render ; utiliser les print_area_presets (cœur/dos) ; activer l'effet broderie pour les produits brodés.
- DoD : un appel render renvoie une URL d'image avec le design placé correctement en zone cœur ET en zone dos.

**T3.2 — Pipeline design → mockup produit**
- Étapes : à l'upload d'un design, générer automatiquement le(s) mockup(s) pour la fiche + un preview « ton logo dessus ».
- DoD : uploader un logo génère un mockup affiché sur la fiche produit sans intervention manuelle.

### LOT 4 — Animations & polish « à la Apple » (P2)

**T4.1 — Smooth scroll**
- Fichiers : provider global.
- Étapes : intégrer Lenis ; respecter `prefers-reduced-motion`.
- DoD : scroll fluide ; désactivé si l'utilisateur a réduit les animations.

**T4.2 — Reveals & micro-interactions**
- Étapes : GSAP + ScrollTrigger pour hero/reveals/sections épinglées (scrub) ; Framer Motion pour boutons/cartes/hover.
- DoD : animations 60 fps, pas de jank, LCP non dégradé (mesurer avant/après).

**T4.3 — Transitions de page**
- Étapes : View Transitions (next-view-transitions) entre pages.
- DoD : transitions fluides. ⚠️ NE PAS sur-animer le tunnel de paiement — la conversion prime sur l'effet ; le checkout doit rester rapide et sobre (micro-confirmations max).

### LOT 5 — Contenu / vidéo (ops, hors code)

- Pipeline Reels : `photo produit réelle ou render Dynamic Mockups` → Higgsfield (clip 2–5 s, 9:16, preset caméra) → Final Cut (montage + hook) → publication. Brevo pour les newsletters, Lemlist/La Growth Machine (domaine séparé) pour le cold B2B.
- (Pas de tâche code — à piloter manuellement / via n8n pour la planification de publication.)

## 4. Schéma d'exécution (vue d'ensemble)

```
P0  ─ LOT 0 Sécurité/onboarding ─┐
                                 ├─ T0.6 Test commande bout-en-bout  ← VERROU : rien après sans ce test
P0  ─ LOT 1 Prix/fulfillment ────┘
            │
P1  ─ LOT 2 SEO/JSON-LD
P1  ─ LOT 3 Mockups
            │
P2  ─ LOT 4 Animations
P2  ─ LOT 5 Contenu/vidéo (ops)
```

## 5. Template `PROGRESS.md`

Voir `docs/agent-memory/PROGRESS.md`.

## 6. Variables d'environnement attendues (à compléter par Kaan)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # SERVEUR UNIQUEMENT
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
# Resend
RESEND_API_KEY=
# Gelato
GELATO_API_KEY=
# Dynamic Mockups
DYNAMIC_MOCKUPS_API_KEY=
# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
# Upstash (rate limit)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
