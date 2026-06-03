# Stratégie fournisseurs textile HM Global

> Date : 2026-05-17
> Statut : V1 active · V2 en évaluation · V3 hypothèse long terme
> Document de référence interne. Toute décision fournisseur doit s'aligner sur ce fichier ou le mettre à jour.

## TL;DR (à 1 minute)

- **Printify = V1 automatique.** C'est le fournisseur textile actif aujourd'hui, branché aux fiches produit, au panier, au checkout Stripe et aux mockups locaux cropped. **Aucun changement de fournisseur sur le site tant que les samples SPOD ne sont pas testés et validés en interne.**
- **SPOD (Spreadshirt Print On Demand) = candidat V2 à tester.** Avant tout branchement code : commander un échantillon réel (3 t-shirts, 1 hoodie minimum) avec un logo HM Global, mesurer qualité, délai, packaging, conformité prix annoncé.
- **Production interne HM Global = option volume (V3).** Pour les commandes ≥ 30-50 pièces, un parcours "textile fournisseur (Stanley/Stella, B&C) + DTF / Flex / Broderie en interne ou sous-traité Alsace" peut sortir un coût de revient nettement inférieur à Printify et SPOD, mais demande logistique, stock et un atelier opérationnel. Pas avant que la V2 SPOD soit stabilisée.
- **Seuil volume recommandé : 20 à 30 pièces.** En dessous, on reste sur la commande en ligne Printify. Au-dessus, on bascule sur le formulaire `/contact?sujet=devis-volume-textile`.
- **Prix bas type 12,90 € HT : uniquement sur devis, jamais en automatique pour 1 pièce.** Ce niveau de prix n'est viable mathématiquement qu'à partir de 20-30 pièces (cf audit fournisseurs).

## Rappel audit (mai 2026)

Document source : `docs/audits/textile-suppliers-comparison.md`

Conclusions chiffrées clés issues de l'audit :

| Fournisseur | T-shirt entrée gamme HT | Shipping FR | Délai prod | API | Marge à 19,90 € HT (30 pcs) |
|---|---|---|---|---|---|
| **Printify Premium** (V1 actif) | ~10-14 € selon provider | 4-8 € | 3-7 j | Oui | ~15-20 % |
| **SPOD** (candidat V2) | ~6,24 € impression incluse | ~3-5 € | 2-4 j | Oui REST publique | ~37 % |
| Gelato textile | ~9-12 € | 4-6 € | 3-6 j | Oui | ~25 % |
| Gooten / CustomCat | irrelevant FR | élevé | 8-15 j | Oui | n/a |
| Stanley/Stella grossiste FR + DTF interne | ~5,74 € HT + ~2 € marquage | inclus si retrait | 1-3 j | Non | 50 %+ sur 30 pcs |

## Stratégie phasée

### V1 (actuelle — mai 2026)

**Fournisseur : Printify Premium (annualisé 24,99 $/mois).**

- Pipeline existant : `lib/suppliers/printify/*` + manifest `/public/mockups/printify-cropped/`.
- 5 produits V1 actifs : gildan-5000, bella-3001, comfort-colors-1717, gildan-18000, gildan-18500.
- Mockups locaux cropped (script `scripts/crop-printify-mockups.mjs`).
- Prix de vente public TTC : 19,90 € à 49,90 € selon référence.
- Aucun changement à faire côté Stripe / Supabase / panier / API / pricing.

**Ce qu'on ne fait PAS en V1 :**

- ❌ Brancher SPOD ou Gelato au checkout.
- ❌ Toucher au mapping Printify (`printify-colors.ts`, manifests).
- ❌ Toucher à `pricing.ts`.
- ❌ Modifier les routes API `/api/printful/*` ou `/api/orders/*`.
- ❌ Promettre un prix < 19,90 € HT en automatique sur fiche produit.

**Ce qu'on FAIT en V1 (gestion du tunnel volume) :**

- ✅ Afficher un bloc "Besoin de 20 ou 30 pièces ?" sur les fiches textile (cf `components/product/VolumeQuoteBlock.tsx`).
- ✅ Afficher une section homepage "Commande rapide ou devis volume" qui sépare clairement les deux parcours (cf `components/home/OrderOrQuote.tsx`).
- ✅ CTA `/contact?sujet=devis-volume-textile&produit={slug}` pour qualifier le besoin sans engager de prix.

### V2 (à tester — horizon 2-3 mois)

**Fournisseur à évaluer : SPOD (Spreadshirt Print On Demand).**

**Phase 1 — Test physique (1-2 semaines)**
1. Créer un compte SPOD via `https://www.spod.com/api/` (sandbox dispo).
2. Commander 3 t-shirts (1 blanc, 1 noir, 1 chiné) en taille L avec logo HM Global front + back.
3. Commander 1 hoodie noir avec logo broderie poitrine si dispo.
4. Mesurer :
   - Qualité textile (toucher, grammage réel vs annoncé)
   - Qualité marquage (densité couleur, durabilité au premier lavage)
   - Délai réel d'expédition Allemagne → France
   - Conformité prix annoncé vs prix facturé
   - Packaging (white-label ? carton générique ?)

**Phase 2 — Validation décision GO / NO-GO (1 semaine)**
- Si qualité < Printify → NO-GO, on garde Printify uniquement.
- Si qualité ≥ Printify et marge ≥ 30 % à 14,90 € HT → GO V2.
- Documenter dans ce fichier : `## Test SPOD — résultats <date>`.

**Phase 3 — Intégration (si GO, 1-2 semaines)**
- Brancher SPOD via une nouvelle clé `supplierName: "spod"` dans les types produit (sans toucher au mapping Printify existant).
- Ajouter `lib/suppliers/spod/` (mirroir de la structure printify).
- Créer un manifest mockups SPOD si l'API ne fournit pas d'URLs CDN stables.
- **NE PAS** mélanger les produits Printify et SPOD dans la même commande Stripe tant que le webhook unifié n'a pas été testé.

### V3 (hypothèse long terme — horizon 6-12 mois)

**Production interne HM Global : textile grossiste + marquage atelier.**

**Pré-requis avant lancement V3 :**
- V2 SPOD stable depuis au moins 3 mois.
- Volume mensuel devis volume ≥ 50 pièces / mois en moyenne sur 3 mois.
- Identifier un atelier DTF/broderie en Alsace (Strasbourg / Mulhouse / Colmar) avec capacité 100 pcs/jour.
- Capital de roulement pour stock minimum (50 pcs × 5 modèles × 4 couleurs = 1000 pcs ≈ 6 000 € HT en stock).

**Cible coût de revient (30 pcs) :**
- Textile Stanley/Stella STTU755 via grossiste FR : 5,74 € HT
- Marquage DTF 1 emplacement (interne ou sous-traité) : ~2 € HT
- Logistique préparation + emballage : ~0,80 € HT
- Total : ~8,54 € HT/pc
- Prix de vente possible : 14,90 € HT (43 % marge brute) à 17,90 € HT (52 % marge brute)

**Avantages V3 :**
- Marque "Made in Alsace + coton bio" possible (Stanley/Stella OEKO-TEX + GOTS).
- Pas de dépendance API externe.
- Délais maîtrisés (livraison sous 3-5 jours France).

**Risques V3 :**
- Stock immobilisé.
- Pic de demande non absorbable sans capacité atelier supplémentaire.
- Charge opérationnelle (préparation, expédition) côté HM.

## Règles de cohérence wording (à respecter partout sur le site)

| ✅ À utiliser | ❌ À ne PAS utiliser |
|---|---|
| "Tarif volume possible selon quantité, textile et marquage" | "12,90 € garanti" |
| "Prix optimisé dès 20 / 30 pièces sur devis" | "Tarif imbattable" |
| "Solution de production optimisée" | "Prix usine" |
| "Devis transmis sous 24h ouvrées" | "Réponse immédiate" |
| "Besoin de 20 ou 30 pièces ?" | "Économisez X €" |

## Cartographie des fichiers à NE PAS toucher dans la stratégie

Cette liste est non-négociable tant que SPOD n'est pas validé en V2 :

- `data/pricing.ts`
- `data/products.ts` (sauf wording produit ponctuel)
- `lib/suppliers/printify/*` (mapping, manifests, color utils)
- `lib/suppliers/printful/*`
- `app/api/printful/**`
- `app/api/stripe/**`
- `app/api/orders/**`
- `app/api/webhook/**`
- `public/mockups/printify/` et `public/mockups/printify-cropped/`
- Configuration Supabase (`supabase/migrations/`, `lib/supabase/*`)
- `components/cart/*`
- `components/checkout/*`

## Suivi & révision

- Révision trimestrielle de ce document obligatoire.
- Toute proposition de changement fournisseur doit citer ce fichier et l'audit.
- Si SPOD ou Gelato change ses tarifs publics, relancer l'audit avant décision.

---

*Document interne — ne pas exposer publiquement sur le site.*
