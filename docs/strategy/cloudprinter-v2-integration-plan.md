# Plan d'intégration V2 — Cloudprinter

> Date : 2026-05-17
> Statut : audit gelé, GO V2 semi-automatique
> Document de référence interne. Toute proposition d'intégration future doit s'aligner sur ce fichier.

## TL;DR

- **Cloudprinter est validé GO pour V2** sur les supports print papier (cartes, flyers, posters, brochures, canvas).
- **Intégration en V2 semi-automatique uniquement** : le client n'ira jamais en direct sur `/orders/add`. Une **validation admin HM** est obligatoire avant toute production.
- **Pas de remplacement de Gelato** : Gelato reste sur ses produits historiques (back-office devis), Cloudprinter s'ajoute pour automatiser le parcours papier courant.
- **Pas d'intégration au checkout actuel** tant qu'on n'a pas commandé d'échantillon physique pour valider qualité réelle + transporteur + délai.

## 1. Ce que Cloudprinter sait faire

Audit live confirmé sur sandbox `api.cloudprinter.com/cloudcore/1.0/` (voir `docs/audits/cloudprinter-sandbox-test.md`).

| Capacité | Endpoint Cloudprinter | Couche HM | Statut |
|---|---|---|---|
| **Catalogue produits** | `/products` | `lib/suppliers/cloudprinter/adapter.listProducts()` | ✅ 1666 produits, 367 utiles HM |
| **Détail produit + options** | `/products/info` | `adapter.getProductInfo(ref)` | ✅ Familles d'options décodées (paper, finish, shape, packaging, frame) |
| **Prix unitaire** | `/prices/lookup` | `adapter.lookupPrice(...)` | ✅ Prix HT + TVA + expire_date, supporte options explicites |
| **Devis complet avec shipping** | `/orders/quote` | `adapter.quoteOrder(...)` | ✅ Prix produit + shipping FR + quote hash + production SLA |
| **Suivi commande existante** | `/orders/info` | `adapter.getOrderInfo(ref)` | ✅ État + tracking si dispo |
| **Pays / niveaux de shipping** | `/shipping/countries`, `/shipping/levels` | `adapter.listShippingCountries/Levels()` | ✅ Lecture |
| **Création commande réelle** | `/orders/add` | `adapter.createOrder()` | 🔒 **STUB `throw`** — pas activé en V1, à débloquer sur décision explicite V2 |
| **Webhooks "CloudSignal"** | callback HTTP côté Cloudprinter | _non branché_ | 🟡 À brancher en V2 pour synchroniser le suivi côté Supabase |

### Spécificités API utiles à savoir

- **Auth** : `apikey` dans le body JSON (jamais en header)
- **Tous les endpoints sont POST** (même les lectures)
- **Format options dans payload** : `[{option: "product_material", option_reference: "paper_300off", count: 1}]` — clé `option` SANS préfixe `type_`, clé `option_reference` pour la valeur
- **Quote hash + expire_date** : permet de **freezer un prix pendant ~48h** avant validation client. Très utile pour le parcours devis HM.
- **Production SLA** : 2 jours ouvrés annoncés sur nos 3 produits testés → délai total France ~3-5 jours ouvrés
- **Service de livraison standard sandbox** : "Ground - Tracked" (suivi colis). Express dispo sur d'autres `shipping_level`.

## 2. Ce que Cloudprinter **ne sait pas faire**

| Manque | Impact pour HM | Solution recommandée |
|---|---|---|
| **Pas d'images marketing produit** | On ne peut pas remplir le catalogue front avec des visuels Cloudprinter | Images HM générées (cf `docs/prompts/print-mockups-prompts.md`) + `PrintImageStage` actuel |
| **Pas de mockup generator API** | Pas de visuel "votre fichier sur le produit" automatique | Pipeline interne HM (Blender existant dans `scripts/blender/`) ou rendu canvas 2D simple, V3 |
| **Pas de preview client en temps réel** | Le client ne voit pas un BAT visuel avant validation | Génération BAT côté HM : convertir le PDF client en thumbnail + overlay sur template produit |
| **Pas de BAT formel** | Validation se fait sur le PDF brut envoyé | Workflow HM : admin vérifie fichier + envoie BAT manuel (PDF preview) par email avant validation production |
| **Pas de preflight PDF** | Aucune vérification résolution, fonds perdus, CMYK, fontes vectorisées avant production | **Validation manuelle admin HM obligatoire** + checklist preflight côté back-office (potentiellement automatisable plus tard via `pdf.js` + `Ghostscript` côté serveur) |

## 3. Workflow recommandé HM Global pour V2

Parcours **semi-automatique** — le client a une UX fluide jusqu'au paiement, mais aucune commande Cloudprinter n'est créée tant qu'un admin HM n'a pas validé le fichier.

```
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 1 — Choix produit (front HM)                                  │
│   Client choisit : famille + format + options (papier/finition)     │
│   → catalogue HM affiche prix indicatif basé sur /prices/lookup     │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 2 — Upload PDF                                                │
│   Client upload son PDF (jusqu'à ~30 Mo)                            │
│   → POST /api/print/upload                                          │
│   → stockage Supabase Storage (bucket print-uploads, privé)         │
│   → URL signée 24h renvoyée                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 3 — Calcul prix Cloudprinter                                  │
│   Côté serveur : adapter.quoteOrder(...)                            │
│   → Cloudprinter retourne quote_hash + price + shipping + expire    │
│   → HM stocke quote_hash + expire_date dans la table orders         │
│   → Prix affiché au client : prix Cloudprinter + marge HM           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
            ┌──────────────────┐         ┌──────────────────┐
            │  3a. Paiement    │   OU    │  3b. Devis       │
            │  Stripe direct   │         │  email validation│
            └──────────────────┘         └──────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 4 — Validation admin HM (obligatoire avant production)        │
│   Dashboard admin :                                                 │
│     · télécharger PDF depuis Supabase Storage                       │
│     · checklist preflight (résolution / marges / CMYK / fontes)     │
│     · OK → action "Lancer production"                               │
│     · NOK → action "Refuser fichier" (email client + remboursement) │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 5 — Création commande Cloudprinter (action admin)             │
│   adapter.createOrder(...) ← déverrouillé seulement V2              │
│   → POST /orders/add avec quote_hash + URL PDF Supabase             │
│   → Cloudprinter envoie en production                               │
│   → quote_hash consommé, plus modifiable                            │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ÉTAPE 6 — Suivi via webhooks CloudSignal                            │
│   /api/cloudprinter/webhook (à créer en V2)                         │
│   → maj orders.state dans Supabase                                  │
│   → email client à chaque étape (en production / expédié / livré)   │
└─────────────────────────────────────────────────────────────────────┘
```

### Pourquoi semi-automatique et pas full-automatique

- **Pas de preflight** côté Cloudprinter = un PDF mal préparé peut être imprimé tel quel (mauvaise résolution, sans fonds perdus, etc.) → réimpression à nos frais
- **Pas de BAT visuel** = le client n'a pas de validation finale avant production
- **Pas de mockup** = pas de "moment magique" UX comme sur Vistaprint
- → **L'admin HM est le filet de sécurité** entre le client et Cloudprinter

## 4. Produits V2 prioritaires

Trois familles à intégrer en V2 par ordre de priorité :

### 1. Cartes de visite 85×55 mm

- Référence Cloudprinter : `businesscard_ss_int_bc_fc`
- 3 familles d'options : material (8 papiers), shape (2 formes), finish (8 finitions)
- Prix défaut sandbox 250 pcs : 21,97 € TTC livré → PV HM cible 49-59 € TTC
- Marge brute estimée : **55-63 %**
- Public cible : tous (PME / restos / clubs / freelances)

### 2. Flyers A5

- Référence Cloudprinter : `flyer_ss_a5_fc`
- 2 familles d'options : material (14 papiers), finish (6 finitions)
- Prix défaut sandbox 250 pcs : 73,85 € TTC livré → PV HM cible 119-149 € TTC
- Marge brute estimée : **38-50 %**
- Public cible : restos (menus, opérations promo), clubs (événements), retail

### 3. Posters A3

- Référence Cloudprinter : `poster_a3_fc`
- 4 familles d'options : packaging, paper (17 papiers), finish (2), frame (4)
- Prix défaut sandbox 10 pcs : 27,33 € TTC livré → PV HM cible 59-79 € TTC
- Marge brute estimée : **54-65 %**
- Public cible : clubs (affiches saison), événementiel, retail (vitrines)

### Famille reportée en V2.5

- **Brochures / dépliants** (`folder_*`) : 117 produits dispos chez Cloudprinter dans la catégorie `Folded brochure`. Configuration plus complexe (pliage, recto/verso, nb de pages) → V2.5 une fois V2 stabilisée.
- **Canvas / wall art** (`Wall decoration` : 266 produits) : alternative à Gelato existant. À ne pas dupliquer en V2 → V3.

## 5. Options commerciales

Trois packs proposés au client par produit :

### Pack "Standard"

- Options Cloudprinter par défaut (`product_finish_none` / pas de finition)
- Prix le plus bas
- Cible : volume rapide, événementiel, opération promo

### Pack "Premium"

- Options HM explicites validées en audit :
  - Cartes : `paper_300off` + `product_finish_matte`
  - Flyers : `paper_170mcg` + `product_finish_gloss`
  - Posters : `poster_200art_matt` + `product_finish_matte`
- Surcoût ~4 € (cartes) à ~34 € (posters) HT
- Cible : PME / corporate qui valorisent la qualité fichier perçue

### Pack "Sur devis"

- Quantités > 1000 pcs OU configurations spécifiques (coins ronds, formats custom, frames, packaging spécial)
- Devis transmis sous 24 h ouvrées
- Cible : commandes événementielles importantes, multi-supports

### Tableau récapitulatif

| Pack | Cible | Surcoût vs base | Marge brute estimée |
|---|---|---|---|
| Standard | volume / promo | 0 € | 50-63 % |
| Premium | PME / corporate | +4 à +34 € HT | 38-58 % |
| Sur devis | événementiel / volume / custom | variable | négocié au cas par cas |

## 6. Risques

| # | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **PDF client incorrect** (basse résolution, sans fonds perdus, RGB) | Élevée | Élevé (réimpression à nos frais) | Validation manuelle admin HM avant production (étape 4 du workflow) + checklist preflight côté back-office |
| R2 | **Pas de preflight API Cloudprinter** | Certaine | Moyen | Préflight manuel admin OBLIGATOIRE en V2. Automatiser en V3 (Ghostscript / pdf-lib côté serveur) |
| R3 | **Prix options Premium élevés** (poster +223 % vs défaut) | Certaine | Faible si bien communiqué | Affichage explicite du delta dans le configurateur HM. Ne PAS imposer Premium par défaut sur posters. |
| R4 | **Pas de mockup BAT** | Certaine | Moyen | Génération BAT manuel côté admin HM (export thumbnail PDF + overlay HTML) avant production. V3 : automatisation. |
| R5 | **Validation humaine = goulot d'étranglement** | Moyenne | Moyen sur le délai | Capacity planning : ~5-10 minutes par commande pour la validation. Au-delà de 50 commandes/jour, prévoir un workflow asynchrone (validation par lots) |
| R6 | **Quote hash expire à ~48h** | Faible | Faible | Si client paie après expiration → recalculer un nouveau quote avant `/orders/add`. Code à prévoir en V2. |
| R7 | **Routing print provider variable** (anomalie flyer 500 pcs) | Moyenne | Variable selon volume | Possibilité de fixer le print provider via options en V2 si comportement non désiré. À tester. |
| R8 | **Évolution tarifs Cloudprinter** sans préavis | Moyenne | Variable | Surveillance trimestrielle des prix sur les 3 références principales via script de monitoring (`scripts/monitor-cloudprinter-prices.mjs` — à créer V2.5) |
| R9 | **Dépendance API unique** | Faible | Élevé (si Cloudprinter tombe) | Garder Gelato comme fallback manuel pour les commandes critiques. Documenter le passage manuel dans le runbook. |

## 7. Décision

### Statut V2 : **GO Cloudprinter en intégration semi-automatique**

| Aspect | Décision |
|---|---|
| Catalogue + prix + shipping + options décodées | ✅ Validé, intégrable |
| Commande directe automatique au checkout | ❌ **Refusée en V2** — validation admin obligatoire |
| Branchement Stripe → Cloudprinter direct | ❌ **Refusé** — Stripe = paiement uniquement, Cloudprinter = lancé après validation admin |
| Webhooks CloudSignal | 🟡 À brancher en V2.1 pour suivi commande |
| Production de mockups / BAT côté Cloudprinter | ❌ Impossible — à gérer côté HM |
| Remplacement de Gelato | ❌ Non — Gelato garde son périmètre back-office |

### Pré-requis avant lancement V2 (non négociables)

1. **Commander 1 échantillon physique** (1 carte 250pcs + 1 flyer A5 100pcs + 1 poster A3 1pc) — valider qualité réelle, transporteur, délai
2. **Préparer le dashboard admin de validation fichier** (route `/admin/print-orders/[id]/review` à créer)
3. **Brancher les webhooks CloudSignal** sur `/api/cloudprinter/webhook` pour suivi automatique
4. **Stocker `quote_hash` + `expire_date`** dans la table `orders` Supabase (migration à prévoir)
5. **Documenter le runbook de fallback** en cas de panne Cloudprinter

### Ne pas faire en V2

- ❌ Activer `adapter.createOrder()` sans dashboard admin de validation
- ❌ Connecter directement Stripe → Cloudprinter sans étape admin intermédiaire
- ❌ Promettre un délai < 5 jours ouvrés au client (SLA 2j Cloudprinter + shipping + validation admin + marge sécurité)
- ❌ Pousser le Pack Premium par défaut sur les posters (multiplie le prix par 3)
- ❌ Migrer les produits Gelato actuels vers Cloudprinter sans audit séparé

### Horizon temporel

| Étape | Délai cible | Bloquant |
|---|---|---|
| Commande échantillon physique | Semaine +1 | Création compte Live (depuis Sandbox) |
| Validation qualité échantillon | Semaine +2 | Réception colis France |
| Développement dashboard admin validation | Semaines +3 à +5 | UX admin, intégration Supabase |
| Branchement webhooks CloudSignal | Semaine +6 | Préparation route `/api/cloudprinter/webhook` |
| Bascule progressive front V2 (cartes uniquement d'abord) | Semaine +7 | Toutes les étapes ci-dessus validées |
| Extension flyers + posters | Semaine +9 à +10 | Retour d'expérience sur les 10 premières commandes cartes |

## Annexes

### Documents de référence

- `docs/audits/cloudprinter-sandbox-test.md` — audit technique complet (5 addendums, ~700 lignes)
- `docs/audits/print-api-suppliers-deep-audit.md` — comparatif fournisseurs print
- `docs/audits/gelato-print-images.md` — pourquoi Gelato n'est pas la solution complète
- `docs/outreach/print-api-access-emails.md` — emails outreach Print.com / HelloPrint en attente
- `docs/strategy/internal-textile-production.md` — stratégie textile (V1/V2/V3) pour cohérence

### Endpoints d'audit en place (lecture seule, server-only)

```bash
# Health-check
curl http://localhost:3000/api/cloudprinter/test

# Catalogue par catégorie HM
curl http://localhost:3000/api/cloudprinter/catalog-audit

# Pricing 3 produits × 3 quantités
curl http://localhost:3000/api/cloudprinter/price-audit

# Quote complet avec shipping FR vers 67460
curl http://localhost:3000/api/cloudprinter/quote-audit

# Décodage options + comparaison default vs HM explicit
curl http://localhost:3000/api/cloudprinter/options-audit
```

### Code à NE PAS toucher tant que la V2 n'est pas validée par direction HM

- `lib/suppliers/cloudprinter/adapter.ts` — fonction `createOrder()` reste stub `throw`
- `app/api/cloudprinter/**` — routes en lecture pure, aucune écriture
- `data/products.ts`, `data/pricing.ts`, panier, checkout, Stripe, Supabase — intacts
- Intégration Gelato existante — intacte

---

*Document interne — ne pas exposer publiquement. Révision trimestrielle obligatoire.*
