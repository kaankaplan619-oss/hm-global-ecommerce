# Audit fournisseurs API print — HM Global

> Date : 2026-05-17
> Objectif : identifier le meilleur partenaire API print pour HM Global Agence, complémentaire à Gelato actuel.
> Périmètre : 10 fournisseurs print API européens / internationaux pertinents pour une agence basée en Alsace.

---

## TL;DR

- **Meilleur candidat API complète + catalogue print classique** : **Cloudprinter** (Danemark) — REST/JSON solide, hubs propres en France/Allemagne en cours de déploiement, inscription libre, pricing endpoint, 5000+ templates.
- **Meilleur candidat API simple pour démarrer rapidement (cartes/flyers/affiches)** : **Print.com** (Pays-Bas) — API REST documentée publiquement (`developer.print.com`), 2 hubs production NL, livraison Europe.
- **Meilleur candidat images / mockups produits via API** : **Prodigi** (UK) — seule API auditée qui combine catalogue détaillé + générateur de mockups dédié (`mockups.prodigi.com`) + production UK/EU/global.
- **Meilleur candidat marché français pur (papier, ennoblissement, agence)** : **PrintOclock** — API revendeur gratuite, marque blanche par défaut, doc OpenAPI publique (`developer.printoclock.com`). **Concurrent direct de HM Global sur le BtoC, à manier avec prudence.**
- **À rester en devis manuel court terme** : grands formats spéciaux, ennoblissement haut de gamme (dorure à chaud, gaufrage), goodies premium.
- **Automatisable V2 (3-6 mois)** : cartes de visite, flyers standards, affiches A3-A2, stickers planches, canvas — via Cloudprinter ou Print.com en priorité, Prodigi en complément pour canvas et décoration.
- **À reporter V3 (long terme)** : routage multi-fournisseur intelligent selon support × quantité × pays destination.

---

## Méthodologie

**Sources consultées** (toutes le 2026-05-17) :
- Sites officiels et portails développeurs des 10 fournisseurs
- Documentation publique d'API (readme.com, developer portals, GitHub)
- Presse spécialisée : printweek.com, beyond-print.net, lemag-ic.fr
- Blogs et FAQ revendeur
- Audit interne précédent : `docs/audits/gelato-print-images.md`

**Limites** :
- 4 fournisseurs sur 10 (HelloPrint Connect, Print.com, Onlineprinters op.connect, Cimpress Open) ont leur documentation API derrière un login partenaire ou un NDA. Les conclusions sur ces fournisseurs reposent sur les pages marketing publiques, la presse pro et les confirmations indirectes.
- Aucun compte n'a été créé pendant cet audit ; les vérifications "qualité réelle" des mockups, fidélité prix, latence API nécessiteront un test live au moment de la sélection finale.
- Les prix revendeur ne sont jamais publics et doivent être négociés.

**Hypothèses** :
- HM Global cible des volumes "petite agence" (centaines à quelques milliers d'unités par commande, pas industriels). Tous les fournisseurs B2B/wholesale acceptent ce profil sous réserve d'un SIRET / KBIS.
- Production France ou Europe limitrophe = critère prioritaire pour le délai et le bilan carbone affiché.
- Marque blanche (livraison neutre + factures revendeur) = exigence non négociable pour la revente.

---

## Fiches fournisseurs

### 1. HelloPrint Connect

| Champ | Valeur |
|---|---|
| API publique | Partenaire seulement (HelloPrint Connect) |
| URL documentation | `https://developers.helloprint.com/reference/helloprint-api` (accès limité, portail readme.com beta) |
| Accès petite agence | Oui sur demande — email `api@helloprint.com` ou `partners.helloprint.com/hello-connect` |
| Catalogue produits | Cartes, flyers, affiches, brochures, stickers, packaging, textile, goodies (réseau de 13 boutiques pays-spécifiques) |
| Images produit via API | Non confirmé publiquement — documentation beta, pas de mention d'endpoint mockup public |
| Upload fichier | Oui (PDF) — flux orchestré par HelloPrint Connect |
| Preflight | Oui (contrôle fichier interne HelloPrint historique) |
| Preview / BAT | Oui via dashboard, à confirmer via API |
| Prix API | Oui — endpoint `createQuote` documenté |
| Shipping France | Oui (boutique helloprint.fr active) |
| Production EU | Pays-Bas (HQ Rotterdam) + réseau distribué Europe |
| Marque blanche | Oui — argument central de Connect ("white label orders") |
| Facilité Next.js | 2/5 — REST classique, mais doc beta donc pas de SDK officiel JS |
| Contact | `api@helloprint.com`, `partners.helloprint.com/hello-connect` |
| **Verdict** | **TEST** |

#### Verdict détaillé
HelloPrint Connect est conçu **exactement pour ce cas d'usage** — agences et marchands qui revendent du print en marque blanche. Le catalogue européen est vaste, la marque blanche native, et l'API existe depuis 2023. **Principal point d'incertitude** : la documentation est en beta et nécessite un échange préalable avec `api@helloprint.com`. À tester en priorité (top 2 candidats à contacter), en demandant explicitement un exemple de payload `getProductImage` ou `getMockup` avant de s'engager.

---

### 2. Print.com

| Champ | Valeur |
|---|---|
| API publique | Oui — documentation publique sur `developer.print.com` |
| URL documentation | `https://developer.print.com/reference/introduction` |
| Accès petite agence | Oui — inscription via formulaire `print.com/en/api/` puis échange équipe |
| Catalogue produits | Cartes, flyers, affiches, brochures, dépliants, magazines, calendriers, stickers (focus papier) |
| Images produit via API | Partiel — images catalogue produit, pas de générateur de mockups confirmé via API |
| Upload fichier | Oui (PDF principalement) |
| Preflight | Oui (vérification fichier intégrée) |
| Preview / BAT | Oui via flux de commande |
| Prix API | Oui — endpoint de quote disponible |
| Shipping France | Oui |
| Production EU | 2 hubs Pays-Bas en propre + réseau partenaire |
| Marque blanche | Oui (livraison neutre standard) |
| Facilité Next.js | 2/5 — REST documentée, exemples publics |
| Contact | Formulaire `print.com/en/api/` |
| **Verdict** | **GO (à tester en priorité 1)** |

#### Verdict détaillé
Print.com (anciennement Drukwerkdeal / Probo group) est le candidat **le plus accessible techniquement** : documentation publique sans NDA, focus papier/print classique parfaitement aligné avec le catalogue HM Global cible (cartes, flyers, affiches, brochures, stickers). Pas de gros catalogue goodies/textile, donc à coupler avec un second fournisseur. Production Pays-Bas = 24-48h vers la France, marque blanche standard. **Recommandation forte de POC sur les cartes de visite et flyers en V2.**

---

### 3. Cloudprinter

| Champ | Valeur |
|---|---|
| API publique | Oui — documentation 100% publique sur `docs.cloudprinter.com` |
| URL documentation | `https://docs.cloudprinter.com/` et `https://docs.cloudprinter.com/client/cloudprinter-core-api-v1-0/` |
| Accès petite agence | Oui — inscription gratuite immédiate, plan Free disponible |
| Catalogue produits | 5000+ templates : livres, brochures, magazines, cartes, flyers, affiches, calendriers, stickers, packaging, canvas, T-shirts (limité) |
| Images produit via API | Oui partiel — endpoint `products/info` retourne specs, mais mockups limités (pas un mockup generator au niveau de Gelato/Prodigi) |
| Upload fichier | Oui (URL distante hébergée, PDF) |
| Preflight | Oui — contrôles automatiques |
| Preview / BAT | Oui (proof retour PDF) |
| Prix API | Oui — endpoint `prices/lookup` avec pays + quantité |
| Shipping France | Oui — endpoint disponible avec country code FR |
| Production EU | **Hubs en propre en cours de déploiement : France + Allemagne + UK + Espagne + Pays-Bas** (annoncé fin 2025), + réseau 381+ providers / 104 pays |
| Marque blanche | Oui (Brand Portal mentionné) |
| Facilité Next.js | 1/5 — SDK Node.js officiel, REST/JSON propre, doc complète |
| Contact | Inscription directe sur `cloudprinter.com` (pas besoin de contact préalable) |
| **Verdict** | **GO (top 1)** |

#### Verdict détaillé
Cloudprinter coche le **maximum de cases** : API publique sans login partenaire, SDK Node officiel parfait pour Next.js, plan Free pour tester, déploiement de hubs propres en France et Allemagne annoncé fin 2025 (livraison J+2 zone 1), endpoint pricing dynamique par pays. **Le seul vrai bémol** : le générateur de mockups n'est pas au niveau de Gelato/Prodigi (catalogue de templates produits avec images standardisées, pas de mockup contextuel "design sur produit en situation"). Pour le catalogue print papier de HM Global, c'est secondaire : les visuels produits peuvent être pré-générés depuis le dashboard. **Candidat #1 à intégrer en V2.**

---

### 4. Prodigi

| Champ | Valeur |
|---|---|
| API publique | Oui — documentation publique sur `prodigi.com/print-api/docs/` |
| URL documentation | `https://www.prodigi.com/print-api/docs/reference/` (v4.0) |
| Accès petite agence | Oui — inscription libre sur `dashboard.prodigi.com/register`, sandbox dispo |
| Catalogue produits | 200+ produits, focus art & déco : posters, framed prints, **canvas**, metal prints, photo tiles, stickers, **textile (T-shirts, sweats)**, mugs, accessoires, livres, cartes |
| Images produit via API | Oui — endpoint `/products/{sku}` retourne specs + zones impression, **mockup generator dédié** à `mockups.prodigi.com` (image PNG/JPG haute résolution) |
| Upload fichier | Par URL (assets référencés, pas d'upload direct via API) |
| Preflight | Validation assets côté Prodigi avant production |
| Preview / BAT | Oui — endpoint Preview + générateur de mockup |
| Prix API | Oui — endpoint `/quotes` avec ventilation item + shipping |
| Shipping France | Oui (standard EU) — méthodes : Budget, Standard, StandardPlus, Express, Overnight |
| Production EU | UK + Europe (labs identifiés par code pays dans la réponse API) + global (USA, AUS, CAN) |
| Marque blanche | Partiel — packaging neutre possible selon lab, à confirmer |
| Facilité Next.js | 1/5 — REST propre, header `X-API-Key`, doc Postman, sandbox |
| Contact | Inscription directe `dashboard.prodigi.com/register` |
| **Verdict** | **GO (pour canvas / déco / textile uniquement)** |

#### Verdict détaillé
Prodigi est **l'API la plus complète sur le générateur de mockups** — le seul fournisseur audité qui combine vraiment catalogue détaillé + mockup contextuel disponible via outil dédié. **MAIS** son catalogue est orienté art-print / déco / textile, pas print papier classique (cartes de visite, flyers business, brochures pro). Donc complément idéal de Cloudprinter ou Print.com pour la partie canvas / posters déco / textile chez HM Global. Production UK = délai et bilan carbone à surveiller pour le marché français.

---

### 5. Gelato (référence comparative)

| Champ | Valeur |
|---|---|
| API publique | Oui — `dashboard.gelato.com/docs/` |
| URL documentation | `https://dashboard.gelato.com/docs/get-started/` |
| Accès petite agence | Oui — inscription libre |
| Catalogue produits | Cartes, posters, canvas, textile (Printful-like), mugs, stickers, magnets, photo books |
| Images produit via API | Oui — **mockups générés via API depuis templates**, mais audit interne précédent (`gelato-print-images.md`) conclut qu'ils sont **inexploitables pour marketing direct** (visuels neutres sans branding HM Global, qualité éditoriale limitée) |
| Upload fichier | Oui |
| Preflight | Oui |
| Preview / BAT | Oui (mockups produits programmes) |
| Prix API | Oui |
| Shipping France | Oui |
| Production EU | Réseau 130+ sites, France incluse |
| Marque blanche | Oui (livraison neutre) |
| Facilité Next.js | 1/5 — déjà intégré côté HM Global pour devis manuel |
| Contact | `gelato.com` |
| **Verdict** | **MAINTIEN (déjà intégré)** |

#### Verdict détaillé
Statu quo : Gelato reste l'outil de devis back-office actuel. Le rapport `gelato-print-images.md` confirme que **les images produit retournées par l'API Gelato ne sont pas utilisables tels quels pour le storefront marketing HM Global**. Solution complémentaire requise. Pas de raison de désintégrer Gelato — il sert de "filet de sécurité" sur les références non couvertes par les nouveaux fournisseurs.

---

### 6. PrintOclock

| Champ | Valeur |
|---|---|
| API publique | Oui — documentation publique sur `developer.printoclock.com` |
| URL documentation | `https://developer.printoclock.com/docs/reseller/access/` (OpenAPI / SwaggerUI dispo) |
| Accès petite agence | Oui — inscription `printoclock.com/register` + formulaire `printoclock.com/print-api` |
| Catalogue produits | Cartes, flyers, affiches, brochures, dépliants, stickers, kakémonos, PLV, packaging (large catalogue print français) |
| Images produit via API | À confirmer (OpenAPI dispo, à inspecter en compte revendeur) |
| Upload fichier | Oui (PDF) |
| Preflight | Oui (contrôle fichier inclus, BAT) |
| Preview / BAT | Oui |
| Prix API | Oui (Reseller API + Supplier API) |
| Shipping France | Oui — production et livraison France |
| Production EU | **France** (Toulouse, imprimeur indépendant) |
| Marque blanche | Oui — colis neutre, aucune référence PrintOclock dans la livraison |
| Facilité Next.js | 2/5 — SwaggerUI public, REST/JSON, pas de SDK JS officiel |
| Contact | `printoclock.com/print-api` (formulaire) |
| **Verdict** | **TEST (avec précaution stratégique)** |

#### Verdict détaillé
PrintOclock est **le seul fournisseur audité avec production 100% France + API gratuite + marque blanche native**. C'est techniquement le candidat idéal pour l'image "Made in France" de HM Global Alsace. **MAIS attention stratégique** : PrintOclock vend également en direct au consommateur final via printoclock.com, donc il est à la fois fournisseur ET concurrent potentiel sur le BtoC. À tester en priorité, mais en négociant explicitement une grille tarifaire revendeur qui laisse une marge confortable.

---

### 7. Exaprint

| Champ | Valeur |
|---|---|
| API publique | Non documentée publiquement — pas de portail développeur identifié |
| URL documentation | Non trouvée. Solution intégrée = `PrintCommerce` (SaaS web-to-print à 149€/mois) |
| Accès petite agence | Oui (revendeur) — SIRET requis, demande de compte sur `exaprint.fr/imprimerie-en-ligne/devenir-revendeur` |
| Catalogue produits | Très large : cartes, flyers, affiches, brochures, stickers, PLV, packaging, ennoblissement haut de gamme (dorure, gaufrage, vernis sélectif) |
| Images produit via API | Non confirmé — PrintCommerce inclut une banque d'images intégrée mais c'est un SaaS, pas une API |
| Upload fichier | Oui (PDF) — flux PrintCommerce |
| Preflight | Oui (contrôle gratuit du fichier, argument central revendeur) |
| Preview / BAT | Oui (proofing online inclus PrintCommerce) |
| Prix API | Sur demande — pas d'endpoint pricing public identifié |
| Shipping France | Oui (production France, expéditions FR/EU) |
| Production EU | **France** (Montpellier, leader pro) |
| Marque blanche | Oui (100% reseller printing, argument historique 15 ans) |
| Facilité Next.js | 4/5 — pas d'API REST publique identifiée, intégration via PrintCommerce SaaS plus que via dev custom |
| Contact | `exaprint.fr/imprimerie-en-ligne/devenir-revendeur`, formulaire revendeur |
| **Verdict** | **NON pour intégration API directe — TEST PrintCommerce SaaS si besoin storefront clé-en-main** |

#### Verdict détaillé
Exaprint est **le meilleur imprimeur pro français B2B** mais leur stratégie produit privilégie clairement le SaaS PrintCommerce plutôt qu'une API ouverte. Pour HM Global, qui veut intégrer le print dans son propre storefront Next.js, ce n'est pas le bon outil. À conserver dans le rolodex pour le devis manuel haut de gamme (ennoblissement, papiers spéciaux) en B2B, mais pas comme backend API V2.

---

### 8. Saxoprint

| Champ | Valeur |
|---|---|
| API publique | Oui (pour revendeurs inscrits) — pas de portail développeur public identifié |
| URL documentation | Non publique. Accès après inscription revendeur sur `saxoprint.fr` |
| Accès petite agence | Oui — inscription revendeur, user ID fourni après validation |
| Catalogue produits | Cartes, flyers, affiches, brochures, stickers, magazines, calendriers, PLV (catalogue print classique large) |
| Images produit via API | Non confirmé publiquement |
| Upload fichier | Oui (PDF) |
| Preflight | Oui (Saxoprint inclut le contrôle gratuit) |
| Preview / BAT | Oui |
| Prix API | Oui (après inscription) |
| Shipping France | Oui — réseau 10 pays incluant la France |
| Production EU | **Allemagne** (Dresde, l'un des plus gros imprimeurs européens) |
| Marque blanche | Oui — livraison directe au client final au nom du revendeur, jusqu'à 20 adresses différentes |
| Facilité Next.js | 3/5 — API revendeur existante mais doc derrière login, peu de retours publics sur DX |
| Contact | `saxoprint.fr` → espace revendeur |
| **Verdict** | **TEST (en backup Cloudprinter / Print.com)** |

#### Verdict détaillé
Saxoprint est un mastodonte allemand avec une API revendeur en place et la marque blanche native — c'est exactement le profil "imprimeur de confiance, gros volume, prix compétitifs". Le seul frein : la documentation API n'est pas accessible sans s'inscrire d'abord, donc difficile d'évaluer la qualité DX avant engagement. À tester si Cloudprinter ou Print.com ne couvrent pas un produit spécifique, ou si la grille tarifaire revendeur est très compétitive.

---

### 9. Onlineprinters (op.connect)

| Champ | Valeur |
|---|---|
| API publique | Partenaire — service "op.connect" |
| URL documentation | Non publique. Page produit : `onlineprinters.de/c/lp/op-connect` |
| Accès petite agence | Oui sur demande — "ceux qui ont besoin d'automatiser, qui commandent en gros volume ou qui sont revendeurs/grands comptes" |
| Catalogue produits | Cartes, flyers, affiches, brochures, stickers, magazines, calendriers, PLV, packaging |
| Images produit via API | Non confirmé |
| Upload fichier | Oui (PDF, op.connect transfère données de commande) |
| Preflight | Oui |
| Preview / BAT | Oui |
| Prix API | Oui via op.connect (après inscription) |
| Shipping France | Oui (boutique onlineprinters.fr) |
| Production EU | **Allemagne** (Fürth, leader online europe) |
| Marque blanche | Oui (B2B revendeurs et agences) |
| Facilité Next.js | 3/5 — API existante mais positionnement "gros volume" peut limiter accès petites agences |
| Contact | `onlineprinters.de/c/lp/op-connect` (formulaire commercial) |
| **Verdict** | **TEST (en backup, si volumes justifient)** |

#### Verdict détaillé
Onlineprinters cible explicitement les "gros volumes" et les "grands comptes" avec op.connect, ce qui peut être un frein pour une agence en démarrage. Mais leur catalogue est aussi vaste que Saxoprint et leur empreinte européenne très solide. À considérer en V3 (long terme) plutôt qu'en V2, sauf si les volumes HM Global décollent rapidement.

---

### 10. Vistaprint / Cimpress

| Champ | Valeur |
|---|---|
| API publique | Partenaire (beta) — programme "Cimpress Open" |
| URL documentation | `https://developer.cimpress.io/` (portail développeur, accès partenaire) |
| Accès petite agence | À confirmer — beta encore restreinte, partenaires triés sur le volet |
| Catalogue produits | Cartes (signature historique), flyers, brochures, stickers, signalétique, **goodies / textile / vêtements brodés**, packaging |
| Images produit via API | Non confirmé publiquement |
| Upload fichier | Oui (architecture Cimpress Mass Customization Platform) |
| Preflight | Oui (Vista historique) |
| Preview / BAT | Oui |
| Prix API | Oui (via Merchants API) |
| Shipping France | Oui |
| Production EU | Multiple (Cimpress = 30+ sites mondiaux dont plusieurs en Europe) |
| Marque blanche | Oui — c'est même un argument central de Cimpress Open (livraison "unbranded") |
| Facilité Next.js | 3/5 — REST/COAM (Cimpress Open API Methodology), client JS dispo (CoamClient), mais doc encore beta |
| Contact | `developer.cimpress.io`, programme Cimpress Open |
| **Verdict** | **NON court terme (beta partenaire) — VEILLE long terme** |

#### Verdict détaillé
Cimpress Open est le programme le plus ambitieux du marché (le géant Vistaprint qui ouvre son réseau industriel), mais il reste en beta avec un nombre restreint de partenaires. Pour HM Global aujourd'hui, c'est plus un signal qu'une option exploitable. À surveiller : si Cimpress Open passe en GA publique, c'est probablement le meilleur backend pour goodies + signalétique + cartes haut de gamme combinés. **Mettre une alerte calendar à 6 mois.**

---

## Tableau comparatif global

| Fournisseur | API | Doc publique | Accès | Catalogue | Images API | Upload | Preflight | Preview | Prix API | Shipping FR | Prod EU/FR | White-label | Intég. | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| HelloPrint Connect | Partenaire | Beta | Sur demande | Très large (papier+textile+goodies) | À confirmer | Oui | Oui | Oui (dashboard) | Oui | Oui | NL+EU | Oui | 2/5 | **TEST** |
| Print.com | Oui | Oui publique | Libre | Print papier large | Partiel | Oui | Oui | Oui | Oui | Oui | NL (2 hubs) | Oui | 2/5 | **GO** |
| Cloudprinter | Oui | 100% publique | Libre + plan Free | 5000+ templates print/livres | Partiel (specs, peu de mockups) | Oui | Oui | Oui | Oui (`prices/lookup`) | Oui (FR endpoint) | FR/DE/UK/ES/NL hubs propres + 381 partenaires | Oui (Brand Portal) | 1/5 | **GO #1** |
| Prodigi | Oui | Oui publique | Libre + sandbox | Art/déco/textile (200+) | **Oui (mockup generator dédié)** | URL | Oui | Oui | Oui (`/quotes`) | Oui | UK + EU | Partiel | 1/5 | **GO (déco/textile)** |
| Gelato | Oui | Oui publique | Libre | Print/textile/déco large | Mockups API (qualité limitée pour marketing) | Oui | Oui | Oui | Oui | Oui | EU dont FR | Oui | — | **MAINTIEN** |
| PrintOclock | Oui | Oui publique | Libre + form | Print FR très large | À confirmer | Oui | Oui | Oui | Oui | Oui | **France** (Toulouse) | Oui | 2/5 | **TEST** |
| Exaprint | Non (SaaS PrintCommerce uniquement) | Non | Revendeur SIRET | Print pro très large + ennoblissement | Banque d'images SaaS | Oui | Oui | Oui | Sur demande | Oui | **France** (Montpellier) | Oui | 4/5 | **NON API** |
| Saxoprint | Partenaire | Login revendeur | Inscription revendeur | Print classique large | À confirmer | Oui | Oui | Oui | Oui | Oui | **Allemagne** | Oui | 3/5 | **TEST backup** |
| Onlineprinters | Partenaire (op.connect) | Non | Sur demande (gros vol.) | Print classique large | À confirmer | Oui | Oui | Oui | Oui | Oui | **Allemagne** | Oui | 3/5 | **TEST backup** |
| Vistaprint/Cimpress | Beta partenaire | Portail dev | Sélectif beta | Cartes + textile + goodies + signal. | À confirmer | Oui | Oui | Oui | Oui | Oui | EU multiple | Oui | 3/5 | **VEILLE** |

---

## Analyse comparative

### Pour cartes de visite + flyers
**Recommandation : Print.com (priorité 1) + Cloudprinter (priorité 2).**

Justification : Print.com est l'API la plus accessible techniquement (documentation publique, deux hubs aux Pays-Bas garantissant un délai 24-48h vers Strasbourg), avec un catalogue centré justement sur le papier. Cloudprinter ouvre des hubs propres en France ce qui permettra à terme une livraison J+1 zone 1 — pour les commandes urgentes c'est imbattable. PrintOclock arrive en alternative française si la marge négociée est suffisante, mais reste un concurrent direct potentiel.

### Pour affiches + posters grands formats
**Recommandation : Cloudprinter + Prodigi en complément déco.**

Justification : Cloudprinter couvre les formats standards (A3, A2, A1) avec son catalogue de 5000+ templates et un endpoint pricing dynamique par pays. Pour les affiches "déco" (poster art, affiche de chambre, photo grand format) Prodigi propose des canvas + métal + bois que Cloudprinter n'a pas en équivalent.

### Pour canvas / décoration
**Recommandation : Prodigi (priorité absolue).**

Justification : Le mockup generator de Prodigi est le **seul vrai différenciateur visible sur le marché audité** — visuels lifestyle haute résolution, scènes contextuelles (salon, chambre, bureau). Pour vendre du canvas via le storefront HM Global, c'est ce qui transforme une fiche produit "froide" en fiche produit "qui convertit". Le délai UK → FR (3-5 jours standard) est le compromis à accepter.

### Pour brochures / dépliants
**Recommandation : Cloudprinter ou Print.com en fonction des formats demandés.**

Justification : Les deux couvrent les pliages standard (2 volets, 3 volets, accordéon). Pour des reliures plus complexes (cahier piqué, dos carré collé), Cloudprinter a un catalogue spécifique livres/magazines très solide hérité de son historique. Print.com est plus orienté brochures marketing courtes.

### Pour stickers
**Recommandation : Cloudprinter (planches) + Prodigi (kiss-cut individuels).**

Justification : Cloudprinter excelle sur les planches de stickers (formats standards, papier ou vinyle). Prodigi propose des stickers découpés à l'unité (kiss-cut) qui sont la tendance dominante chez les créateurs / petites marques.

### Pour goodies (stylos, mugs, gourdes, tote bags)
**Recommandation : aucun candidat print classique audité ne couvre intégralement.**

Prodigi couvre les mugs, tote bags et accessoires (catégorie "Lifestyle"). Gelato couvre également mugs + textile. **Pour les stylos, gourdes, clés USB, parapluies et goodies promotionnels classiques, aucun fournisseur de cette liste n'est pertinent** — il faut ajouter un fournisseur dédié type **Promonotions**, **Cadeaux Insolites**, **GiftCampaign**, ou **TopShirt promotional**. Ce segment reste en devis manuel V1 et nécessitera un audit séparé pour V2.

---

## Stratégie hybride recommandée pour HM Global

### V1 actuel (statu quo)
- **Gelato** maintenu pour devis manuel back-office
- **Devis manuel via formulaire** pour tous les autres supports
- Aucun changement immédiat requis sur le storefront

### V2 (3-6 mois) — intégration API ciblée
- **Cloudprinter** comme fournisseur API principal (cartes, flyers, affiches, brochures, stickers, livres)
  - Inscription gratuite immédiate, SDK Node.js officiel, doc publique
  - Bénéficier du déploiement hubs France/Allemagne en cours
- **Prodigi** comme fournisseur secondaire (canvas, déco, stickers découpés, textile basique)
  - Pour profiter du mockup generator sur les fiches produit
- **Devis manuel maintenu pour** : ennoblissement (dorure, gaufrage, vernis), grand format spécial, signalétique sur-mesure, packaging custom, goodies promotionnels
- **Gelato** maintenu en backup back-office

### V3 (long terme, 12+ mois) — routing multi-fournisseur intelligent
- Routing automatique selon support × quantité × pays destination :
  - Cartes 100ex livraison Alsace → PrintOclock (FR, J+2)
  - Cartes 5000ex livraison France → Cloudprinter hub FR (J+2-3)
  - Canvas livraison France → Prodigi UK (J+4-5)
  - Brochures gros volume → Saxoprint ou Onlineprinters (DE)
- Surveiller la GA de **Cimpress Open** qui pourrait remplacer plusieurs fournisseurs si elle s'ouvre vraiment
- Ajouter un fournisseur **goodies promotionnels** (audit séparé requis)

---

## Liste des fournisseurs à appeler / contacter

### Priorité 1 : Cloudprinter
- URL : `https://www.cloudprinter.com/` (inscription directe, plan Free)
- Action : créer un compte gratuit, tester l'API en sandbox sur 1-2 produits cartes de visite, mesurer la latence et la qualité de la réponse `products/info`.
- Questions à poser au commercial :
  1. Calendrier précis d'ouverture du hub France ? Quelle ville ? Quels produits couverts au lancement ?
  2. Grille tarifaire revendeur sur les volumes typiques (50, 100, 500, 1000 cartes de visite) ?
  3. Existe-t-il un endpoint mockup ou faut-il utiliser un outil tiers (Dynamic Mockups, Mediamodifier) ?
  4. SLA garantis sur la latence des endpoints `prices/lookup` et `orders/create` ?
- Documents à demander : grille tarifaire revendeur Europe, exemple de payload preview/proof, conditions générales API.

### Priorité 2 : Print.com
- URL : `https://www.print.com/en/api/` (formulaire de contact partner)
- Action : remplir le formulaire en se présentant comme agence print BtoB française.
- Questions à poser :
  1. Conditions tarifaires revendeur (% remise) ?
  2. Délai et coût d'expédition depuis les hubs NL vers la France (Alsace en particulier) ?
  3. Existe-t-il un endpoint mockup / preview API ?
  4. Possibilité de tester la sandbox sans engagement ?
- Documents à demander : doc API complète, exemple JSON catalog + pricing, conditions revendeur.

### Priorité 3 : HelloPrint Connect
- URL/email : `api@helloprint.com`, `https://partners.helloprint.com/hello-connect`
- Action : email direct expliquant le cas d'usage HM Global Alsace.
- Questions à poser :
  1. Quel statut beta de l'API en mai 2026 ? Stabilité production ?
  2. Catalogue exact couvert pour la France (vs autres pays-shops) ?
  3. Endpoint mockup / images produit marketing disponible ?
  4. Conditions financières revendeur (% remise, minimum mensuel) ?
- Documents à demander : exemple complet de payload `createQuote` + réponse, captures du dashboard partenaire.

---

## Risques

- **Dépendance fournisseur unique** : si Cloudprinter devient le backend principal, toute panne ou changement de pricing impacte directement le storefront. **Mitigation** : maintenir Print.com et Prodigi en intégration secondaire dès la V2.
- **Stabilité des prix revendeur** : les imprimeurs européens (papier, énergie) ont fait fluctuer leurs grilles 2024-2025 de ±15%. **Mitigation** : revoir les prix HM Global mensuellement via les endpoints pricing API, automatiser la mise à jour.
- **Concurrence directe** : PrintOclock vend en BtoC, Vistaprint vend en BtoC, HelloPrint vend en BtoC. Risque que ces fournisseurs sous-cotent HM Global sur les requêtes directes (SEO, ads). **Mitigation** : positionnement HM Global = agence conseil + accompagnement Alsace, pas commodité prix.
- **Marge BtoB vs revente** : sur les cartes de visite à 9,90€ TTC chez Vistaprint, la marge agence est très étroite. **Mitigation** : ne pas chasser le marché "ultra prix", cibler les volumes pro et les supports à forte valeur ajoutée (ennoblissement, grand format, packaging).
- **API beta / partenaire** : HelloPrint Connect et Cimpress Open ont des docs encore mouvantes. **Mitigation** : éviter de baser une intégration critique sur une API beta, attendre la GA.
- **Documentation incomplète vérifiée** : sur 10 fournisseurs, seuls Cloudprinter, Prodigi, Print.com, Gelato, PrintOclock ont une documentation API publique vérifiable sans login. Les autres nécessitent un compte revendeur préalable, ce qui peut révéler des limitations après engagement.

---

## Recommandation finale

**Décision recommandée** : démarrer un POC API en V2 avec **Cloudprinter** (fournisseur principal, candidat #1) sur le périmètre cartes de visite + flyers + affiches A3, en parallèle d'un **second POC Prodigi** dédié aux canvas et stickers déco pour exploiter leur mockup generator sur les fiches produit storefront.

**Maintenir Gelato** en backend de devis manuel back-office pour les références non couvertes, et **ouvrir un dialogue commercial avec Print.com et HelloPrint Connect** comme options de repli ou de complément. Mettre **PrintOclock en veille active** (compte créé, documentation lue) mais ne pas l'engager comme fournisseur principal en raison du conflit BtoC.

**Prochaine action concrète** : créer immédiatement le compte gratuit Cloudprinter et faire tourner un script de test Node.js qui appelle successivement `products`, `products/info`, `prices/lookup` (pays=FR) sur 3 SKU cartes de visite — objectif sous 30 minutes pour valider la viabilité technique avant tout autre engagement.

---

## Sources & URLs

Toutes consultées le 2026-05-17.

**HelloPrint Connect**
- https://www.helloprint.com/solutions/api
- https://developers.helloprint.com/reference/helloprint-api
- https://partners.helloprint.com/hello-connect
- https://www.printweek.com/content/news/helloprint-adds-new-api
- https://www.beyond-print.net/news-helloprint-introduces-api-for-corporations-and-franchises/

**Print.com**
- https://www.print.com/en/api/
- https://developer.print.com/reference/introduction

**Cloudprinter**
- https://www.cloudprinter.com/
- https://docs.cloudprinter.com/
- https://docs.cloudprinter.com/client/cloudprinter-core-api-v1-0/
- https://docs.cloudprinter.com/client/how-to-check-prices
- https://www.cloudprinter.com/global-network/
- https://www.cloudprinter.com/countries/local-printing-in-france-with-global-print-api
- https://www.cloudprinter.com/countries/local-printing-in-germany-with-global-print-api
- https://www.cloudprinter.com/service-and-print-api-levels
- https://www.printweek.com/content/news/cloudprinter-plans-to-set-up-print-plants-in-us-and-europe

**Prodigi**
- https://www.prodigi.com/print-api/
- https://www.prodigi.com/print-api/docs/
- https://www.prodigi.com/print-api/docs/reference/
- https://www.prodigi.com/mockup-generator/
- https://mockups.prodigi.com/
- https://www.prodigi.com/blog/announcing-prodigi-print-api-v4/

**Gelato (référence)**
- https://dashboard.gelato.com/docs/get-started/
- https://dashboard.gelato.com/docs/ecommerce/products/create-from-template/
- https://www.gelato.com/mockup-generator
- Audit interne : `docs/audits/gelato-print-images.md`

**PrintOclock**
- https://www.printoclock.com/print-api
- https://developer.printoclock.com/docs/reseller/access/
- https://www.printoclock.com/Revendeurs

**Exaprint**
- https://www.exaprint.fr/
- https://www.exaprint.fr/imprimerie-en-ligne/devenir-revendeur
- https://printcommerce.exaprint.fr/notre-solution/
- https://blog.exaprint.fr/exaprint-lance-printcommerce-la-1ere-solution-saas-de-web-to-print-totalement-connectee-a-un-flux-dimpression-en-marque-blanche/

**Saxoprint**
- https://www.saxoprint.fr/
- https://www.saxoprint.de/ueber-uns/unternehmen/vorteile/reseller
- https://dropshipping.key2print.com/meet-our-partner-saxoprint/

**Onlineprinters**
- https://www.onlineprinters.de/c/lp/op-connect
- https://www.onlineprinters.fr/

**Vistaprint / Cimpress**
- https://developer.cimpress.io/
- https://www.beyond-print.net/cimpress-coopetition-api-via-cimpress-open-first-impression/
- https://www.printweek.com/content/news/cimpress-opens-up-its-mcp-to-outsiders/
- https://ir.cimpress.com/news-releases/news-release-details/vistaprint-evolves-full-service-design-digital-and-print-partner

---
*Fin du rapport. Rédigé le 2026-05-17 par audit automatisé. Toutes les décisions opérationnelles (création de comptes, négociations tarifaires, intégrations) restent à valider par l'équipe HM Global.*
