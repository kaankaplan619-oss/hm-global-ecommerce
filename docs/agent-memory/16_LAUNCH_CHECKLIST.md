# 16 — Checklist de lancement (source de vérité de l'avancement)

> **Règles d'usage** (tout agent, toute session) :
> - La numérotation est **stable** : ne jamais renuméroter ni supprimer un item — on change seulement son statut.
> - Statuts : ✅ fait (avec date + commit) · ⏳ à faire · 🟡 décision Kaan requise · ❌ bloqué.
> - Fin de tâche : mettre à jour l'item concerné ET le signaler à Kaan (« n° X corrigé, n° Y pas corrigé »).
> - Toute nouvelle découverte : **ajouter un item en fin de liste**, ne pas corriger d'office (cf. CLAUDE.md).

Dernière mise à jour : 2026-06-14 (roadmap V3-V6 et checkout invité local).

---

## A. Conformité catalogue ↔ production (audits 2026-06-12)

1. ✅ **Fiches goodies par produit** — stickers/mugs/dessous de verre n'affichent plus le texte mug générique (`2d16cd7`).
2. ✅ **Sacoche QS309 vendue impression → produite impression** — fichier `front_dtf_backpack` au lieu du fichier broderie `default` ; validé par brouillon Printful réel (`bcc3ea7`). ⚠️ surcoût +5,25 $/pc → voir item 9.
3. ✅ **Broderie des 5 textiles Printful réellement brodée** — mapping `embroidery_chest_left` + option `thread_colors` obligatoire (sans elle, TOUTE broderie POD échouait en 400 : polos, casquettes, totes inclus). IDs vérifiés par brouillons réels (`bcc3ea7`).
4. ✅ **Contraintes par technique** — broderie = cœur uniquement sur textiles Printful (pas de broderie dos en POD), DTFlex = dès 10 pièces (bascule atelier), Broderie ∞ retirée des produits POD, garde-fous 422 dans la route commande (`bcc3ea7` + volet data/UI embarqué dans `bd715ee`).
5. ✅ **Polo gildan-64800 masqué** — aucun circuit de production (pas dans le variant map, atelier ne brode pas). Réactivable si un circuit existe (`bd715ee`).
6. ✅ **Emplacements véridiques sur les fiches** — casquettes/sacs n'affichent plus « poitrine gauche / manches » (`bd715ee`).

## B. Pipeline impression Studio → Printful (audit 2026-06-12)

7. ✅ **Logo en URL publique** — le logo studio partait en data URL base64 jusqu'à Printful (improductible). Upload attendu + URL publique, QR uploadé, designs absolutisés, garde-fou 422 côté route (`a37ebec`).
8. ✅ **Texte et multi-objets imprimables** — avant : texte seul = photo du produit en fichier print, texte+logo = texte jamais imprimé. Maintenant : export par face, objets seuls, fond transparent, cadré zone DTG 1800×2400, sans position (`1f22ff7`). **E2E validé en navigateur réel le 2026-06-12** : logo+texte → panier avec URL publique Supabase, PNG 1800×2400 transparent vérifié au pixel, transform null.

## C. Décisions business en attente (Kaan)

9. 🟡 **Pricing QS309** : absorber ou répercuter le +5,25 $/pc du fichier impression Printful (PV actuel 46,90 € → marge OK mais réduite).
10. 🟡 **« Impression DTF » sur textiles Printful < 10 pcs** : c'est du DTG en réalité. Options : relabel (« Impression numérique »), ou vrais fichiers `front_dtf` Printful (+5,25 $/pc), ou laisser (rendu très proche).
11. 🟡 **Mug céramique EU (Printify)** : aucune route de commande automatique → l'admin affiche « Atelier » alors que c'est une commande manuelle Printify. Créer un badge dédié ou assumer le flux manuel.
12. 🟡 **Texte sur produits broderie POD** (casquettes…) : le fichier texte part comme fichier broderie — Printful le digitalise. À valider sur UN brouillon réel avant d'ouvrir l'offre.

## D. Déploiement & domaine

19. ✅ **Production à jour** (2026-06-12) : `main` était bloqué sur l'ancien site (45bcc58) → production Vercel montrait l'ancienne version. Fast-forward `codex/hermes-os-cockpit-v1` → `main` (propre, 178 commits, 0 conflit). Production déployée READY (commit 15b08ed), nouveau site confirmé sur `https://hm-global.vercel.app` (hero « On habille votre équipe… », favicon HM, section METEM). ⚠️ **Flux à retenir** : la prod se déploie depuis `main`. Pour la mettre à jour, `git push origin codex/hermes-os-cockpit-v1:main`.
20. ⏳ **SSL domaine hm-global.fr** : DNS CORRECT (apex → 76.76.21.21, www → cname.vercel-dns.com, CAA autorise Let's Encrypt) mais TLS fermé (ERR_CONNECTION_CLOSED) → **certificat Vercel en cours de provisionnement**. À faire côté Vercel : Dashboard → hm-global → Settings → Domains → vérifier l'état de hm-global.fr + www (Refresh si « pending »). Se résout en général < 1 h après propagation DNS. Lien fonctionnel en attendant : `https://hm-global.vercel.app`.

## E. Vérifications restantes avant publication (commerce réel)

13. ⏳ **Compte QA Claude** : `claude.qa@hm-global.fr` créé via l'inscription publique (identifiants dans `.env.local`, rôle client). **Kaan : confirmer l'email** (lien reçu sur la boîte du domaine) pour permettre les E2E connectés.
14. ⏳ **E2E connecté complet** : commande test payée (Stripe test) → bouton Printful admin → brouillon créé sans 422, visuel conforme dans le dashboard, **ne pas confirmer**.
15. ⏳ **Scan DB des anciennes commandes** : `order_items.logo_file_url` en data URL base64 possibles (le garde-fou les fait échouer proprement) — vérifier dans l'admin ou approuver une lecture SQL.
16. ⏳ **Checklist prod** (mémoire 2026-06-11) : clés Stripe LIVE + webhooks Vercel + reset des commandes test avant ouverture.
17. ⏳ **Limites V1 à documenter côté client** : cœur+dos = même visuel sur les 2 faces ; position exacte garantie sur les 5 textiles DTG uniquement (casquettes/totes/goodies = placement par défaut Printful).
18. 🟡 **Revue externe (Tuncer, dev prestataire emails/OVH)** : lien de partage ENVOYÉ sur WhatsApp le 2026-06-12 14h48 (expire le 13/06 ~11h30 — regénérer sur demande). Branche poussée → preview Vercel `hm-global-git-codex-hermes-os-c-602d9b-sumup-agen-ia-s-projects.vercel.app` (protégée par Vercel Authentication = bien). Lien de partage temporaire généré (expire 24 h) — pour un lien durable : Dashboard Vercel → hm-global → Settings → Deployment Protection → **Shareable Links** sur la branche. Accès autorisés : URL preview + compte test auto-créé + GitHub lecture (le repo est PUBLIC — il peut déjà lire le code). JAMAIS : membre du team Vercel (variables d'env lisibles : Stripe LIVE, Supabase service role, Printful), admin du site (données clients), clés API, `.env`.

## F. Conversion, croissance et roadmap V3 à V6 (ajout 2026-06-14)

21. ⏳ **Checkout invité** : implémenté et validé localement le 2026-06-14 dans
le working tree non commité. Déployer puis tester Studio → panier → checkout →
Stripe test, sans débit réel ni commande fournisseur.
22. ⏳ **Upload serveur Studio/logo invité** : route
`/api/studio/upload-asset` validée localement le 2026-06-14. Avant publicité,
faire validation production, revue sécurité, limitation de débit et stratégie
de nettoyage des fichiers orphelins.
23. ⏳ **Redirection ancien lien Google** : redirection permanente
`/contactez-nous/` → `/contact` implémentée localement le 2026-06-14. Vérifier
le `308` en production après déploiement, puis corriger le lien de la fiche.
24. ⏳ **Mesure acquisition** : installer consentement, conversions, Search
Console et conventions UTM avant toute hausse du budget Google/Meta.
25. 🟡 **Google Business Profile** : confirmer la propriété dans le compte
Google, corriger liens/catégories/services et créer le lien direct de demande
d’avis. Ne pas acheter d’avis ni filtrer les clients.
26. ⏳ **SEO local V3** : produire cinq pages services locales et cinq cas
clients réels avec photos, preuves, CTA et mesure. Interdiction des pages villes
dupliquées.
27. ⏳ **Roadmap V3-V6** : lancer l’audit en lecture seule avec
`docs/prompts/CLAUDE_CODE_V3_V6_MARKET_AUDIT.md`, puis faire valider le premier
lot V3 avant développement.

---

## Déploiement du 2026-07-02 (GO Kaan) — commit 5255f7e

**Déployé en prod** (5 commits, `main` 0652204 → 5255f7e) :
- Sécurité API : rate-limit (checkout, virement, render-bat, image-proxy, bank-info,
  gelato, toptex), garde SSRF BAT, secrets optionnels webhooks Gelato/Printful,
  `/api/toptex/raw` en DEV_ONLY, Next 16.2.9.
- Catalogue : polo femme gildan-64800l VISIBLE (packshots à plat Printful), fix wg004,
  atelier aperçu mug sur fiche (zone mesurée au pixel), CTA goodies calibrés → Studio.
- Studio Mug : zone d'impression calibrée (`ZONE_OVERRIDES_BY_PRODUCT_ID`), libellés
  « Face du produit » (fr/en/tr), texte baké au fichier d'impression + composite.
  Non-régression textile vérifiée avant push.
- Accueil : section Instagram 12 réels cliquables, DA premium Journeys/FinalCTA,
  polish hero/about/trust/reviews.
- Chore : CI GitHub (type-check strict), scripts outillage, doc déploiement.

**Volontairement NON déployé** (untracked) : /studio/flyer, /devis-textile,
illustrations non importées, maquettes (_curation, _maquettes-emails,
maquette-accueil-v3.html), photo erasmus non référencée.

**Restes bloquants connus (item 16 & co)** :
- Webhook Stripe LIVE : à confirmer dans le dashboard Stripe (mode Live) — sans lui,
  commande payée reste « pending » (démontré le 2026-07-02 en local, HM-2026-2298).
- `HM_BANK_*` absentes de Vercel → `/api/payment/bank-info` = 500 en prod (circuit
  virement cassé à l'étape IBAN).
- Commande TEST HM-2026-2298 (fantôme, non payée) dans la vraie DB → à supprimer.
