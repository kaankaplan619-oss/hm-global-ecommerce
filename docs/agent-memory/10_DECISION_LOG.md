# 10 — Decision Log

Journal append-only des décisions validées qui doivent influencer toute mission future.

Format :
- **Date** : YYYY-MM-DD (ISO)
- **Décision** : énoncé concis
- **Why** : pourquoi cette décision a été prise (contexte business, contrainte, déclencheur)
- **How to apply** : comment elle doit influencer les futures missions / le code / la communication
- **Statut** : Active | Modifiée | Annulée
- **Décidé par** : Kaan (ou explicitement délégué)

> Append uniquement. Ne pas modifier une entrée passée : si une décision change, créer une nouvelle entrée et marquer l'ancienne `Modifiée` ou `Annulée`.

---

## Décisions actives

### Restructuration de la mémoire agent vers nouvelle convention
- **Date** : 2026-05-19
- **Décision** : Renommer les fichiers `docs/agent-memory/` selon la nouvelle convention (PROJECT_CONTEXT, AGENT_ROLES, DESIGN_RULES, PRODUCT_IMAGES, CATALOGUE, SUPABASE, BAT_WORKFLOW, DO_NOT_TOUCH, CURRENT_TASKS, DECISION_LOG aux numéros 01-10) et conserver les fichiers existants supplémentaires aux numéros 11-15.
- **Why** : Standardiser le nommage pour faciliter la navigation des agents IA (notamment Claude Code) et expliciter la présence d'un decision log dédié.
- **How to apply** : Tous les agents lisent désormais `00_START_HERE.md` qui pointe vers le nouveau mapping. Aucune perte de contenu — les anciens fichiers ont été renommés via `git mv` (historique préservé).
- **Statut** : Active
- **Décidé par** : Kaan

---

### B-Studio Canva-style validé en production
- **Date** : 2026-05-02
- **Décision** : Le studio interactif `/studio/[slug]` avec canvas Fabric.js v6 + 12 designs SVG + export PNG vers Supabase est l'expérience de personnalisation officielle de HM Global.
- **Why** : Donner aux clients pros une UX Canva-style premium plutôt qu'un upload logo basique. Différencie HM Global d'un catalogue fournisseur générique.
- **How to apply** : Toute mission qui touche à la personnalisation doit respecter l'architecture studio (3 colonnes outils / canvas / résumé), les zones par catégorie (`ZONES_BY_CATEGORY`), et le flux export PNG → sessionStorage → redirect fiche produit. Ne pas refaire un studio parallèle.
- **Statut** : Active
- **Commits** : `2827ce2` (studio) + `0b88a52` (fix Suspense + zones)
- **Décidé par** : Kaan

---

### B4 BatPreviewStudio validé en production
- **Date** : 2026-05-01
- **Décision** : Le preview BAT est servi par `BatPreviewStudio.tsx` (full-screen portal) pour les produits avec `showMockup: true`, et fallback `BATModal.tsx` pour les autres (hoodies, softshells sans MockupViewer).
- **Why** : Donner un rendu BAT haute qualité interactif sans modifier `MockupViewer.tsx` (validé B3.2-A2) ni `BATModal.tsx`.
- **How to apply** : Routing automatique via `showMockup ? setShowStudio(true) : setShowBAT(true)` dans `ProductDetailClient.tsx`. Ne pas modifier `MockupViewer` ou `BATModal` ; ajouter de la logique uniquement dans `BatPreviewStudio` ou en amont.
- **Statut** : Active
- **Commits** : `1afa1e9` (studio) + `a6574af` (fix fallback hoodie)
- **Décidé par** : Kaan

---

### Upload logo Supabase validé en production
- **Date** : 2026-05-01
- **Décision** : Les logos clients sont uploadés sur Supabase Storage bucket `customer-logos` avec chemin `cart/{sessionId}/{timestamp}-{filename}`. Upload invité = local uniquement (RLS bloque INSERT sans `auth.uid()`). Upload depuis checkout connecté = Supabase OK.
- **Why** : RLS = sécurité ; chemin par session = permet de réuploader sans collision ; URL publique = accessible côté admin commande sans token.
- **How to apply** : Ne pas modifier `lib/uploadLogo.ts` sans diagnostic validé. Ne jamais toucher aux variables Supabase Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Le chemin `cart/{sessionId}/...` est figé.
- **Statut** : Active
- **Décidé par** : Kaan

---

### Auth + Checkout V1 validés en production
- **Date** : 2026-05-01
- **Décision** : Domaine production = `hm-global.vercel.app`. Tunnel complet (catalogue → fiche → studio → cart → checkout → Stripe) testé sur 14 étapes sans bug bloquant.
- **Why** : V1 finalisée — base stable pour itérer sur les améliorations sans tout casser.
- **How to apply** : Toute mission qui modifie le tunnel doit re-tester les 14 étapes (voir `12_TESTING_PROTOCOL.md`).
- **Statut** : Active
- **Décidé par** : Kaan

---

### Fix TopTex 502 — early return si TOPTEX_API_KEY absent
- **Date** : 2026-04 (avant le rangement)
- **Décision** : `app/api/toptex/enrichment/[sku]/route.ts` contient un early return `if (!process.env.TOPTEX_API_KEY)` qui évite les erreurs console 502 en production.
- **Why** : La clé TopTex n'est pas systématiquement présente en preview/dev ; sans ce garde, on pollue la console et on dégrade la perception.
- **How to apply** : Ne pas retirer ce check. Si on veut activer TopTex enrichment, ajouter la variable d'env, ne pas modifier le code.
- **Statut** : Active
- **Commit** : `6261eaa`
- **Décidé par** : Kaan

---

### MockupViewer B3.2-A2 validé en production — zones figées
- **Date** : 2026-04 (B3.2-A2)
- **Décision** : `components/product/MockupViewer.tsx` est verrouillé. Les zones calibrées Fabric.js (`coeur: [0.60, 0.25, 0.14, 0.14]`, `dos: [0.26, 0.13, 0.48, 0.29]` pour le fallback B&C Exact 190 ; valeurs par catégorie pour tshirts/hoodies/softshells) sont validées visuellement et ne doivent pas bouger sans audit complet.
- **Why** : Une modification non maîtrisée des zones casse le positionnement logo sur la prod, impactant directement les BAT envoyés clients.
- **How to apply** : Ne jamais modifier `MockupViewer.tsx` ni les valeurs de zones sans demande explicite + audit visuel sur toutes les couleurs et vues (front + dos).
- **Statut** : Active
- **Décidé par** : Kaan

---

### Direction artistique — premium, sobre, mobile-first, jamais générique
- **Date** : initiale (avant le rangement)
- **Décision** : Le site HM Global Agence doit être premium, sobre, corporate, propre et moderne. Il ne doit jamais ressembler à un catalogue fournisseur générique (TopTex, B&C, SanMar, Falk & Ross). Mobile-first obligatoire.
- **Why** : Cible B2B pros — la perception visuelle est un signal de qualité et de confiance. Différenciation versus les générateurs e-commerce génériques.
- **How to apply** : Couleur accent `#b13f74`, design tokens `--hm-*` exclusivement. Pas de hard-code couleur. Pas de DA globale refaite sans accord. Images fournisseur en `supplierImages[]` uniquement, jamais en remplacement des `images[]` ou `hmHeroImage`.
- **Statut** : Active
- **Décidé par** : Kaan

---

### Hermès Bot V0 — RMS texte-only
- **Date** : 2026-05-18
- **Décision** : Hermès Bot (repo `hm-hermes-bot`, Vercel séparé) est un assistant texte-only. Il ne déclenche aucune action de production. Les commandes `/hermes audit | mission | decision | idea | ask` et `/agence procedure | client-message` génèrent uniquement du texte à copier-coller.
- **Why** : Garde-fou architectural strict — RMS reste routeur / scribe / garde-fou. Toute action production passe par humain.
- **How to apply** : Toute nouvelle commande RMS doit respecter ce contrat : pas d'écriture externe, pas d'envoi auto, pas d'action production. La logique d'exécution restera côté humain ou (V3+) côté Claude Code Action via GitHub Actions avec PR draft + branch protection.
- **Statut** : Active
- **Repos** : `hm-hermes-bot`, `hm-hermes-gateway` (séparés de hm-global-ecommerce)
- **Décidé par** : Kaan

---

## Décisions modifiées / annulées

(aucune pour l'instant)

---

## Addendum — décisions du 2026-06-14

### Checkout invité et upload serveur
- **Date** : 2026-06-14
- **Décision** : Le checkout doit accepter les invités. Les assets textile et
  Studio sont envoyés par `POST /api/studio/upload-asset`, puis stockés sous
  `studio-exports/{sessionId}/...`.
- **Why** : La création de compte obligatoire ajoutait une friction importante
  et empêchait la conservation fiable des fichiers invités.
- **How to apply** : Garder `/mon-compte` protégé mais laisser `/checkout`
  public. Conserver la service role côté serveur uniquement. Refaire un E2E
  Studio → panier → checkout après toute modification.
- **Statut** : Active dans le working tree, déploiement production à revalider.
- **Remplace** : « Upload logo Supabase validé en production » et la partie
  auth obligatoire de « Auth + Checkout V1 validés en production ».
- **Décidé par** : Kaan, mise en œuvre Codex.

### Positionnement et feuille de route V3 à V6
- **Date** : 2026-06-14
- **Décision** : Structurer l’offre en `Boutique Express`, `Projets locaux` et
  `Programme Entreprises`, puis exécuter V3 à V6 selon
  `17_MARKET_GROWTH_ROADMAP_V3_V6.md`.
- **Why** : Une offre très large sans portes d’entrée distinctes augmente la
  confusion. HM Global doit vendre la simplicité, la preuve locale, le BAT et
  l’accompagnement, pas seulement la largeur du catalogue.
- **How to apply** : Toute évolution stratégique doit définir cible, marge,
  parcours, KPI, propriétaire opérationnel, tests et non-objectifs.
- **Statut** : Active comme hypothèse à valider par l’audit.
- **Décidé par** : Kaan, cadrage Codex.

### Publicité conditionnée à la mesure
- **Date** : 2026-06-14
- **Décision** : Ne pas augmenter significativement Google Ads ou Meta avant
  d’avoir consentement, conversions, UTM, pages d’atterrissage et marge.
- **Why** : Sans mesure, le coût par lead et le retour sur marge ne sont pas
  pilotables.
- **How to apply** : Commencer par un test de 90 jours documenté, puis ajuster
  les budgets sur les conversions qualifiées et la marge, jamais sur les clics
  seuls.
- **Statut** : Active.
- **Décidé par** : Kaan, cadrage Codex.
