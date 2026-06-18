# Audit e-commerce HM Global — état des lieux & plan d'amélioration

**Périmètre analysé en live :** page d'accueil + page `/impression` (HTML réel récupéré le 15/06/2026), benchmark prix concurrents FR, vérification des fournisseurs (Gelato, Printful, Printify, T-Pop) et des outils (Dynamic Mockups, Higgsfield).
**Stack constatée :** Next.js (App Router) + Next/Image, Supabase, Stripe, Vercel, multilingue en cours.
**Rôle de ce document :** servir de base de décision. Le plan d'exécution détaillé pour Claude Code est dans `BRIEF.md`.

---

## 0. Résumé exécutif

**Bonne nouvelle d'abord :** le socle technique du site est bien meilleur que craint.
- `meta-robots` = **`index, follow`** → noindex corrigé, Google peut indexer.
- **Rendu servi côté serveur** (contenu texte récupéré sans JS) → plus de page vide pour Google.
- **canonical, OpenGraph, Twitter Card, alt d'images** présents et propres. `Next/Image` partout.
- La page impression assume « **vraies photos, pas des mockups** » → bon signal de confiance, à garder.

**Les 3 vrais chantiers prioritaires :**

| Priorité | Sujet | Pourquoi c'est critique |
|---|---|---|
| **P0** | **Email / DNS + comptes auto-validés** | 0 email de confirmation, comptes validés automatiquement → faux comptes, fautes de frappe, usurpation, spam. Trou de sécurité **et** frein commercial. |
| **P0** | **Compétitivité prix au volume** | Pas de tarif dégressif visible. Au-delà de 50 pièces, 2–3× au-dessus des ateliers avec prod propre (4–7 € HT le tee imprimé). Grosses commandes perdues. |
| **P0** | **Vérifier que les commandes marchent** | Aucune commande test passée. Pousser trafic/pub sur un tunnel cassé = pire scénario. À tester **avant** prospection. |
| P1 | Données structurées (JSON-LD) + hreflang i18n | Manque rich snippets (étoiles, prix) et balisage multilingue propre. |
| P1 | Mockups manquants | Résolu par Dynamic Mockups (API + MCP). |
| P2 | Animations « à la Apple » + contenu vidéo (Reels) | Important pour l'image, mais après la base. |

**Verdict global :** PAS besoin de tout refaire. Design + SEO de base tiennent. Il faut **sécuriser, rendre les prix lisibles/compétitifs, brancher les bons fournisseurs, automatiser mockups + contenu**.

---

## 1. SEO & indexation

### Déjà bien ✅
- `index, follow`, `canonical`, OG/Twitter complets, `og:locale fr_FR`, `og:site_name`.
- Alt d'images descriptifs et riches en mots-clés.
- `Next/Image` → lazy-loading + formats optimisés.
- Ciblage local fort (Alsace, Souffelweyersheim, Strasbourg, DTF, broderie, enseigne).
- Bon maillage interne (Textile / Print / Techniques / Entreprises / Réalisations).

### À corriger (par impact)
1. **Title home trop faible.** Actuel = « Agence de communication visuelle à Strasbourg » → sans marque. Cible : `HM Global — Textile personnalisé, impression & enseignes à Strasbourg`.
2. **JSON-LD absent ou à vérifier** (LE gros manque SEO) : `Organization`/`LocalBusiness`, `AggregateRating` (si vrais avis vérifiables), `Product`+`Offer` sur fiches, `BreadcrumbList` sur catégories.
3. **`meta-keywords` identiques** sur toutes les pages (impact ~nul, à nettoyer/supprimer).
4. **hreflang / i18n** : pages vues = FR only. Si multilingue : URLs localisées `/en/...`, `hreflang` réciproques, métadonnées traduites. Sinon = contenu dupliqué.
5. **`sitemap.xml` + `robots.txt`** à vérifier (présence, sitemap déclaré, soumis à Search Console).
6. **OG image par page** (aujourd'hui toutes partagent l'image atelier).

### SEO local = levier n°1 (sous-exploité)
- **14 avis = trop peu, viser 50+.** Routine QR/lien d'avis après livraison.
- **Répondre au 1★** factuellement.
- **Poster régulièrement** sur la fiche GBP.
- **Pages locales service/ville** : « flocage textile Strasbourg », « enseigne lumineuse Strasbourg », « impression flyers Souffelweyersheim ».

### Perf / Core Web Vitals
- Bien parti via `Next/Image`. Hero chargé en `w=3840` → définir `sizes` responsive, `priority` UNIQUEMENT sur le LCP (hero), lazy le reste. LCP < 2,5 s mobile.

---

## 2. Prix & compétitivité — le gros sujet

### Constat chiffré (benchmark FR — ateliers avec prod propre, 1 couleur incluse)

| Quantité | Atelier type (ex. Graphy West, FR) | Entrée de gamme actuelle |
|---|---|---|
| 25 pièces | ~6,75 € HT / pièce | 14,90 € TTC « dès 10 pièces » (≈ 12,40 € HT) |
| 50 pièces | ~4,75 € HT / pièce | (pas de palier affiché) |
| 100 pièces | ~3,75 € HT / pièce | (pas de palier affiché) |

Repères : sérigraphie ≈ 6 € pour marquer un tee blanc petite série ; DTG ≈ 25 €/u ; broderie/flocage > 20 €/u à l'unité ; front+dos plus cher qu'une face. Sérigraphie imbattable au-delà de ~50 pièces.

**Traduction :** prix d'entrée correct en petite série full-color, mais **pas de dégressif visible** → à 50–100 pièces le concurrent affiche 4–5 € HT, toi 12 €+ → commande perdue sans consultation.

### Pourquoi le coût est trop haut
1. Dépendance POD (Printful) sur certains SKU → marge sous-traitant intégrée.
2. DTF interne : film + presse + main d'œuvre + galère calage cœur+dos.

### Solution coût : fulfillment à 3 niveaux

| Niveau | Cas d'usage | Production | Coût indicatif/u |
|---|---|---|---|
| **1. Interne DTF** | Petite série, quadri, foncés, urgences | Atelier Kaan | blank + film (~3–6 €) |
| **2. Sérigraphie externalisée** | Volume (50+), aplats, logos simples | **Seri 2 Est (Illkirch, 4,8★, 03 88 65 03 33)** ou « Toodlest » (~0,90 € cœur+dos) | blank 2–3 € + séri 1–1,5 € ≈ **4 €** |
| **3. POD / dropship** | Articles non produits, faible MOQ, livraison directe | **Gelato** (prod France) ; Printful EU secours | variable |

→ Niveau 2 = vendre un tee **7–9 € HT** au volume : compétitif ET rentable. C'est ce qui manque pour les demandes « équipe de 50 ».
**L'intuition d'externaliser le cœur+dos en sérigraphie est la bonne.** DTF interne pour full-color petite quantité, externaliser les aplats en volume.

### Rendre les prix LISIBLES
- Paliers visibles par fiche : **10 / 25 / 50 / 100 / 250**, prix unitaire décroissant.
- **Frais technique offerts** (argument fort).
- **Panachage autorisé** (tailles/couleurs/modèles mélangés).
- Prix = (coût blank + marquage) × marge, recalculé par technique et position (1 face / cœur+dos).

### Print (cartes / flyers / affiches)
- **Cartes « dès 34,90 € » = perçu cher.** Afficher la quantité (« dès 34,90 € les 250 ex. ») OU sourcer moins cher.
- Imprimeur trade marque blanche : **Exaprint** (réf pro FR), Onlineprinters/Print24, Pixartprinting, Helloprint. Marge ≈ coût × 1,4–1,8 + paliers.

### Positionnement — à assumer
Pas le moins cher, et c'est ok : angle « **atelier local + BAT validé + accompagnement PAO** ». Mais afficher **les deux** : prix d'entrée bas **et** grille dégressive.

---

## 3. Fournisseurs & production (synthèse)

| Besoin | Fournisseur | Note |
|---|---|---|
| Blanks | **TopTex**, **Falk & Ross** (déjà) | + B&C / Stanley & Stella, L'Atelier Textile |
| Sérigraphie locale volume | **Seri 2 Est** (Illkirch) / « Toodlest » | Négocier grille cœur+dos. Local = délais courts |
| POD prod France + API | **Gelato** ⭐ | Prod locale FR, routage auto, API/SDK solides |
| POD secours / catalogue large | Printful EU, Printify | Printify = marketplace providers (qualité variable) |
| POD éco FR | T-Pop | Made in France, plastic-free |
| POD ultra-rapide | SPOD / Spreadconnect | Expédition < 48 h Europe |

**Reco :** hybride. Interne (DTF) + sérigraphie locale (Seri 2 Est) en cœur, **Gelato** en complément dropship. Volume hors POD → marges remontent.

---

## 4. Mockups — résolu par Dynamic Mockups
- API REST + SDK (JS/Python) + **serveur MCP** → branchable dans l'app ET le workflow Claude.
- PSD smart objects, **presets zones cœur/dos** (calage auto), **effet broderie**, batch (~100 en ~10 s), full-res sans watermark, 50 crédits gratuits.
- Workflow : `design client (PNG/SVG)` → Dynamic Mockups (preset cœur/dos) → image fiche + preview « ton logo dessus » + frames Reels.
- Alternatives : Mockey.ai, Placeit, Canva Smartmockups (MCP Canva), Photoshop smart objects (MCP Adobe). Pour automatiser à l'échelle = Dynamic Mockups.

---

## 5. Email, DNS & onboarding — P0 sécurité

### Problème
**Le domaine n'appartient pas à Kaan (ami / sa mère)** → pas d'accès DNS → Resend ne peut pas authentifier l'envoi → email de confirmation désactivé + comptes validés automatiquement. Résultat : faux comptes, emails non vérifiés, risque usurpation, déliverabilité nulle pour le transactionnel.

### Fix par ordre de préférence
1. **Faire ajouter ~3–4 records DNS par le propriétaire** pour un sous-domaine d'envoi (`send.hm-global.fr`) : DKIM, SPF/return-path, DMARC. Puis Supabase Auth → SMTP custom Resend + réactiver confirmation email.
2. **Mieux : transférer le domaine principal sur le compte registrar de Kaan.** Posséder son domaine = impératif.
3. **Si le proprio ne bouge pas : acheter un domaine que Kaan possède** (au min pour l'envoi email + Stripe/transactionnel).

### En plus
- Réactiver confirmation email dès que l'envoi marche.
- **CAPTCHA Cloudflare Turnstile** (natif Supabase Auth) sur l'inscription.
- **Séparer les emails** : Resend = transactionnel ; **Brevo** (déjà connecté) = newsletters opt-in ; cold prospecting = **domaine séparé** + outil dédié (jamais depuis le domaine transactionnel).

---

## 6. Sécurité & cyber — checklist
- **Supabase** : RLS sur toutes les tables ; `service_role` jamais côté client ; policies buckets Storage ; rate-limit auth.
- **Stripe** : signature webhooks vérifiée ; montants/prix côté serveur (anti-tampering) ; idempotency keys ; Checkout/PaymentIntent serveur.
- **Vercel** : secrets en env, aucun `NEXT_PUBLIC_*` secret ; headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) ; Firewall/Attack Challenge ; rate-limit applicatif (`@upstash/ratelimit`).
- **Uploads ⚠️** : SVG = vecteur XSS → sanitiser (DOMPurify/svg-sanitizer) OU rasteriser PNG OU servir depuis Storage avec Content-Type forcé + CSP stricte. Valider magic bytes, pas l'extension. Limiter taille.
- **Général** : zod, CSRF sur mutations, deps à jour, rotation secrets, monitoring (logs Vercel + Supabase + Sentry).
- **Doublon Vercel** (`hm-global` vs `hm-global-ecommerce`) : garder un seul projet prod + domaine canonique, archiver l'autre.

---

## 7. Domaine & marque
- **Garder `hm-global.fr` principal** (indexé, historique). Boutique sur le MÊME domaine (`hm-global.fr/boutique` ou `shop.hm-global.fr`). Ne pas fragmenter l'autorité SEO.
- Pré-lancement boutique (0 commande) = bon moment pour figer le domaine/URL canonique.
- **Domaines défensifs** (301 vers le principal) : `hm-global.com`, `hmglobal.shop`, `hmglobalagence.fr` + fautes courantes (~10–15 €/an).
- **Priorité absolue : posséder le domaine principal.** Lancer le transfert.

---

## 8. Marketing, prospection & contenu vidéo
- **Prospection B2B locale** : listes (Google Maps/Pages Jaunes + Pappers/Societe.com + LinkedIn), agent n8n+Claude pour qualifier. Cold email depuis **domaine séparé** + warmup (Lemlist, La Growth Machine). RGPD B2B intérêt légitime + opt-out.
- **Séquence 3–4 touches** : accroche locale → preuve (réalisations) → offre (pack tenues / devis 24 h) → relance.
- **Fidélisation** : Brevo (clients existants).
- **Avis & SEO local** : GBP priorité n°1, 14 → 50+ avis.
- **Reels = Higgsfield** (« IceField » = Higgsfield AI) : image-to-video depuis une vraie photo / render Dynamic Mockups → clip 2–5 s 9:16. Pas de MCP natif → `photo/mockup` → Higgsfield (web) → Final Cut → publication. Kling reste pour le projet anime.
- **MCP vidéo dédié = pas indispensable.** n8n peut orchestrer la publication (Buffer/Metricool/Publer), pas la génération.

---

## 9. Avant toute pub : vérifier que les commandes marchent
**Risque silencieux n°1.** Test bout-en-bout (1 textile + 1 print) :
1. Création compte → email reçu (une fois email réactivé).
2. Panier → Checkout Stripe → paiement (carte test puis 1 vrai).
3. Webhook Stripe reçu → commande en base → statut correct.
4. Email de confirmation envoyé.
5. Commande visible espace client + suivi.
6. Flux BAT déclenché / info reçue.

Tant que non validé : **ni prospection ni pub.**

---

## Décisions / hypothèses
- Multilingue partiel sans hreflang propre → « à finaliser ».
- « Toodlest » = imprimeur sérigraphie ~0,90 € cœur+dos ; **Seri 2 Est** (Illkirch, 4,8★) = option locale partagée — à confirmer si même presta ou second.
- « IceField » = **Higgsfield**.
- Boutique sur `hm-global.fr` (pas de domaine séparé).

## Besoins côté Kaan (3 questions bloquantes)
1. **Domaine** : l'ami/sa mère peut-il ajouter quelques records DNS, OU partir sur un domaine que Kaan possède ? (conditionne email + sécurité)
2. **Imprimeur sérigraphie** : Seri 2 Est et « Toodlest » = le même ? Grille de prix dispo ?
3. **Repo / accès** : confirmer le repo GitHub à jour + le projet Vercel canonique.

➡️ Plan d'exécution lot par lot : `BRIEF.md`.
