# Étude fournisseurs — élargir le catalogue (juin 2026)

Objectif : ajouter des fournisseurs **automatisables** (API/feed) pour rendre le catalogue plus attractif (textile premium, goodies/stylos, enseigne/display, print). Recherche web datée juin 2026 (workflow 4 axes). **Tous les prix = à obtenir en compte revendeur — ne RIEN afficher de non sourcé (risque DGCCRF).**

Déjà intégrés (API) : Printful (live), Printify, Gelato. Blanks manuels : TopTex, Falk&Ross.
⚠️ **3 clés déjà dans `.env.local` mais NON câblées** (= « finir » plutôt qu'« ajouter ») : **PrintOclock** (`PRINTOCLOCK_*`), **Cloudprinter** (`CLOUDPRINTER_*`), **Prodigi** (`PRODIGI_*`).

---

## 🎯 Recommandation : 3 ajouts V1 (forte valeur, peu de chantiers)

| # | Fournisseur | Axe | Pourquoi | Intégration |
|---|---|---|---|---|
| 1 | **midocean** | Goodies/stylos | Vraie API (commande + épreuve), couvre stylos (la demande B2B n°1) + mugs/gourdes/totes/tech. Déjà au backlog. Stock UE. | API REST — effort moyen |
| 2 | **PrintOclock** | Print + Display | **Clé déjà posée.** API FR documentée, marque blanche, prod **France** (Toulouse), couvre print 2D **ET** grand format/PLV/roll-up/kakémono = comble le trou display. Paiement 30j. | API — effort moyen |
| 3 | **Tunetoo** | Textile premium | POD **made in France** (Bordeaux), Stanley/Stella officiel, **broderie + DTF**, ~700 produits, livraison 48h FR. Rend le textile désirable + argument local fort. | API — effort moyen |

> Ces 3 couvrent les 3 envies exprimées (textile attractif + enseigne/display + stylos/objets pub), 2 sont du made-in-France (argument délai/port), et 1 a déjà sa clé.

**✅ DÉCISION KAAN (2026-06-15)** : V1 = **midocean** (stylos/goodies) + **Tunetoo** (textile FR premium) + **Helloprint** (connecteur 2-en-1 print/goodies/display, à la place de PrintOclock pour mutualiser print+display+goodies en une API). Niveau = **étude only** : Kaan ouvre les comptes revendeur lui-même, intégration code plus tard (après accès API). PrintOclock/Cloudprinter/Prodigi (clés déjà posées) = à finir éventuellement plus tard.

---

## Détail par axe (du + au − pertinent)

### Axe 1 — Textile premium/éco
| Fournisseur | Intég. | Prod | Atout |
|---|---|---|---|
| **Tunetoo** ⭐ | API | **France (Bordeaux)** | Stanley/Stella officiel, broderie+DTF, 48h FR |
| **Prodigi** | API | EU/UK (hub FR à vérifier) | Stanley/Stella bio premium — **clé déjà posée** |
| **SpreadConnect** | API | EU (DE) | EarthPositive/Continental (éco) + Russell/B&C (workwear) + Jako (sport) en une API |
| Inkthreadable | API | UK (hors-EU) | Broderie à l'unité sans MOQ, mais port/douane |
| Ralawise / PenCarrie | feed | UK | Distributeurs de **blancs** workwear/hi-vis pour le **circuit atelier** (pas POD) |

⚠️ Gelato a **arrêté Stanley/Stella** (juillet 2025) — Printful/Printify le portent encore.

### Axe 2 — Goodies / stylos
| Fournisseur | Intég. | Atout |
|---|---|---|
| **midocean** ⭐ | API | Order + épreuve, tout le panier goodies, déjà repéré |
| **PF Concept** | feed/XML | Plus gros catalogue EU, **SureShip 24h** (marquage Pologne) |
| **Helloprint** | API | Dropship white-label clé en main, couvre **aussi** print + PLV |
| **Promidata** | feed | **Agrégateur** : 1 flux = 150+ fournisseurs (PF/midocean/XD/Toppoint). 197-297€/mois + 950€ setup. Pour gonfler vite le catalogue |
| XD Connects | feed | Tech cadeau premium (enceintes/USB), marquage Roumanie 24h |
| Toppoint | feed | Objets **durables/éco**, prod UE (RSE) |
| Stricker / REFLECTS / IGO | inconnu | À qualifier par tél. (REFLECTS = Cologne, proche Strasbourg) |

ℹ️ Stylos de marque (BIC, Senator, Prodir) = via distributeurs (midocean/PF/Promidata), pas d'API fabricant.

### Axe 3 — Enseigne / display
| Fournisseur | Intég. | Atout |
|---|---|---|
| **Probo** ⭐ | API | Meilleur pur-display : roll-up/Dibond/PVC/drapeaux/stickers, blind dropship, prod NL |
| **PrintOclock** | API | **Prod France**, kakémono/roll-up/akilux, marque blanche — **clé déjà posée** |
| Print.com | API | White-label, signage/PLV, NL |
| Printdeal/Drukwerkdeal | API | Vrai REST, NL/BE (livraison FR à confirmer) |
| Cloudprinter | API | **Impression locale FR** + white-label, mais surtout posters — **clé déjà posée** |
| Camaloon | webhooks | Stickers/goodies seulement |

🚫 **Reste en devis/local (AUCUNE API)** : enseigne lumineuse, lettres découpées/boîtier, néon LED, totem alu, caisson, **pose**. → circuit devis manuel (fabricant régional / atelier Strasbourg).
💡 Sous-exploité : **Gelato fait déjà le grand format poster** → activer la catégorie avant d'ajouter un fournisseur pour ce besoin.

### Axe 4 — Print trade FR/EU
| Fournisseur | Intég. | Atout |
|---|---|---|
| **Helloprint** ⭐ | API | Portail dev public, white-label, catalogue le plus large (print+stickers+PLV+goodies) |
| **PrintOclock** ⭐ | API | Prod France, marque blanche, paiement 30j — **clé déjà posée** |
| Exaprint | feed/SaaS | Référence qualité FR J+1, mais automation via PrintCommerce/iframe (effort élevé) |
| Realisaprint | feed | FR « moins cher d'Europe », app Shopify (API directe à confirmer) |
| Saxoprint | API (middleware) | Arme prix DE sur flyers/brochures/cartes |
| Print API | API | REST propre/gratuit mais niche (livres/déco murale) |
| Viaprinto | API | B2B, mais **marque blanche non confirmée** (risque colis marqué) |

---

## Garde-fous (important)
1. **Dispersion opérationnelle** : viser **2-3 ajouts V1 max**, pas 8 (chaque fournisseur = SAV, qualité, mapping à maintenir). L'étude croissance avait déjà pointé ce risque.
2. **Prix** : tous « inconnu » sans compte revendeur → obtenir les grilles HT avant d'afficher quoi que ce soit.
3. **Port/délai FR réel** à vérifier par fournisseur (prod NL vs FR change l'argument « local/rapide »).
4. **Helloprint = 2-en-1** (print + goodies + display) : si on le prend, il peut couvrir plusieurs axes d'un coup → à arbitrer vs midocean+PrintOclock séparés.

## Prochaines actions (Kaan / commercial — hors code)
- Ouvrir comptes revendeur + demander sandbox & grille HT : **midocean**, **PrintOclock** (déjà clé), **Tunetoo**. Optionnel : Helloprint, Probo.
- Confirmer colis 100% neutres (marque blanche) + port/délai FR.
- Décider : intégrations natives séparées (midocean + PrintOclock + Tunetoo) **ou** un connecteur large (Helloprint) **ou** un agrégateur data (Promidata).
