# 07 — Workflow BAT + commande

Flux de bout en bout, de l'arrivée client sur le site jusqu'à l'envoi en production.

---

## Définitions

- **BAT** = Bon À Tirer : visuel final que le client valide **avant** production. Sans BAT validé écrit, aucune impression ne démarre.
- **Studio** = page interactive `/studio/[slug]` permettant la personnalisation Fabric.js (logo, texte, designs).
- **Mockup** = preview du produit avec le visuel client positionné en zone calibrée (`MockupViewer.tsx`).

---

## Étapes côté client

```
Catalogue                 →  Fiche produit                  →  Configuration                  →
/catalogue/[category]        /produits/[slug]                  taille / technique / placement

Studio (optionnel)         →  Ajout panier                  →  Checkout
/studio/[slug]                cart Zustand persisté            /checkout (auth required)
upload logo                                                    upload Supabase customer-logos
12 designs SVG dispo                                           bouton "Payer X €" disabled tant
texte personnalisable                                          que adresse + logo manquants

Stripe                     →  Confirmation                  →  Email + admin commande
Payment Intent               redirect succès                   notification production
```

## Étapes côté production (HM Global)

```
Réception commande         →  BAT généré par admin          →  Envoi BAT client (email)
admin/commandes              BatPreviewStudio rendu HD         attendre validation écrite
                                                                "BAT validé" obligatoire

Si modification demandée   →  Nouvelle version V2/V3         →  Renvoi BAT
                                                                attendre validation finale

BAT validé écrit           →  Préparation fournisseur        →  Production lancée
                              (Printful / Gelato / TopTex)      tracker statut commande

Production terminée        →  Vérif qualité interne         →  Livraison / retrait client
                              archivage BAT signé              numéro suivi gardé dossier
```

---

## Zones calibrées (référence)

Voir `11_MOCKUP_VIEWER_RULES.md` pour le détail technique. Résumé :

```
tshirts    : coeur [0.38, 0.28, 0.18, 0.18]  dos [0.25, 0.20, 0.50, 0.45]
hoodies    : coeur [0.40, 0.32, 0.16, 0.16]  dos [0.25, 0.22, 0.50, 0.42]
softshells : coeur [0.42, 0.30, 0.15, 0.15]  dos [0.26, 0.22, 0.48, 0.40]
fallback   : coeur [0.60, 0.25, 0.14, 0.14]  dos [0.26, 0.13, 0.48, 0.29]   (B&C Exact 190)
```

**Ne pas modifier ces zones sans audit visuel sur toutes les couleurs et vues** — c'est la calibration validée B3.2-A2 en production.

---

## Composants impliqués

| Composant | Rôle | Statut |
|---|---|---|
| `components/product/MockupViewer.tsx` | Affichage mockup zones calibrées | **Validé production (B3.2-A2)** — ne pas modifier |
| `components/product/BatPreviewStudio.tsx` | Studio interactif full-screen | Validé production (commit `1afa1e9`) |
| `components/product/BATModal.tsx` | Modal BAT fallback (hoodies / softshells sans MockupViewer) | Validé production |
| `app/studio/[slug]/page.tsx` | Studio Canva-style (canvas Fabric.js) | Validé production (commits `2827ce2` + `0b88a52`) |
| `app/checkout/page.tsx` | Checkout avec upload logo Supabase | Validé production |
| `lib/uploadLogo.ts` | Upload Supabase bucket `customer-logos` | Validé production — ne pas modifier sans diagnostic |

---

## Garde-fous workflow

### Avant production
- ❌ Aucune production sans **BAT validé écrit** par le client (email ou WhatsApp avec mention explicite)
- ❌ Aucun envoi de commande fournisseur (Printful / Gelato / TopTex) sans validation Kaan
- ❌ Aucun client ne doit pouvoir lancer la production tout seul depuis le checkout — il y a toujours une étape humaine entre paiement Stripe et lancement production

### Pendant le développement
- ❌ Ne pas modifier `MockupViewer.tsx` sans demande explicite + audit visuel complet
- ❌ Ne pas modifier les zones calibrées Fabric.js
- ❌ Ne pas modifier `lib/uploadLogo.ts` sans diagnostic validé
- ❌ Ne pas changer les variables Supabase Vercel (cf. `06_SUPABASE_AND_UPLOAD_RULES`)
- ❌ Ne pas casser le flux Studio → cart → checkout en faisant un refactor de Zustand

---

## Procédures agence associées (Hermès Bot)

Pour les opératrices (mère), Hermès Bot expose des templates via Discord :

| Commande | Cas d'usage |
|---|---|
| `/agence procedure sujet:validation-bat` | Procédure interne pour préparer + envoyer un BAT au client |
| `/agence client-message sujet:bat-en-attente-validation langue:fr` | Message client (FR) demandant la validation du BAT |
| `/agence client-message sujet:bat-en-attente-validation langue:tr` | Idem en turc |
| `/agence procedure sujet:commande-textile` | Procédure préparation commande après validation BAT |
| `/agence client-message sujet:commande-en-preparation langue:fr` | Message client "votre commande est en cours" |
| `/agence procedure sujet:livraison-client` | Procédure préparation livraison |
| `/agence client-message sujet:livraison-disponible langue:fr` | Message client "commande prête" |

Tous ces templates sont **statiques** (pas de LLM) — préservation du ton agence validé.

---

## Statuts commande (informel V0)

| Statut | Signification |
|---|---|
| `en attente de fichier` | Logo client non reçu ou non exploitable |
| `BAT en attente de validation` | BAT envoyé, attente retour client |
| `en production` | BAT validé, commande envoyée fournisseur |
| `prête livraison` | Commande reçue / vérifiée, prête pour retrait ou envoi |
| `livrée` | Confirmation réception client |

Ces statuts vivent aujourd'hui dans la tête du staff agence + admin commandes. V2 = automatisation partielle via le admin commandes.

---

## Liens utiles

- Détail zones et calibration : `11_MOCKUP_VIEWER_RULES.md`
- Images produits et droits : `04_PRODUCT_IMAGES_RULES.md`
- Upload Supabase et RLS : `06_SUPABASE_AND_UPLOAD_RULES.md`
- Zones interdites code : `08_DO_NOT_TOUCH.md`
