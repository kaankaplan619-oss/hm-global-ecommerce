# 16 — Checklist de lancement (source de vérité de l'avancement)

> **Règles d'usage** (tout agent, toute session) :
> - La numérotation est **stable** : ne jamais renuméroter ni supprimer un item — on change seulement son statut.
> - Statuts : ✅ fait (avec date + commit) · ⏳ à faire · 🟡 décision Kaan requise · ❌ bloqué.
> - Fin de tâche : mettre à jour l'item concerné ET le signaler à Kaan (« n° X corrigé, n° Y pas corrigé »).
> - Toute nouvelle découverte : **ajouter un item en fin de liste**, ne pas corriger d'office (cf. CLAUDE.md).

Dernière mise à jour : 2026-06-12 (session audit impression/Printful).

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

## D. Vérifications restantes avant publication

13. ⏳ **Compte QA Claude** : `claude.qa@hm-global.fr` créé via l'inscription publique (identifiants dans `.env.local`, rôle client). **Kaan : confirmer l'email** (lien reçu sur la boîte du domaine) pour permettre les E2E connectés.
14. ⏳ **E2E connecté complet** : commande test payée (Stripe test) → bouton Printful admin → brouillon créé sans 422, visuel conforme dans le dashboard, **ne pas confirmer**.
15. ⏳ **Scan DB des anciennes commandes** : `order_items.logo_file_url` en data URL base64 possibles (le garde-fou les fait échouer proprement) — vérifier dans l'admin ou approuver une lecture SQL.
16. ⏳ **Checklist prod** (mémoire 2026-06-11) : clés Stripe LIVE + webhooks Vercel + reset des commandes test avant ouverture.
17. ⏳ **Limites V1 à documenter côté client** : cœur+dos = même visuel sur les 2 faces ; position exacte garantie sur les 5 textiles DTG uniquement (casquettes/totes/goodies = placement par défaut Printful).
18. 🟡 **Revue externe (dev prestataire emails/OVH)** : branche poussée le 2026-06-12 → preview Vercel `hm-global-git-codex-hermes-os-c-602d9b-sumup-agen-ia-s-projects.vercel.app` (protégée par Vercel Authentication = bien). Lien de partage temporaire généré (expire 24 h) — pour un lien durable : Dashboard Vercel → hm-global → Settings → Deployment Protection → **Shareable Links** sur la branche. Accès autorisés : URL preview + compte test auto-créé + GitHub lecture (le repo est PUBLIC — il peut déjà lire le code). JAMAIS : membre du team Vercel (variables d'env lisibles : Stripe LIVE, Supabase service role, Printful), admin du site (données clients), clés API, `.env`.
