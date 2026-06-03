# Ticket P1 — Tote bag Westford Mill (bp 731)

> **Statut :** ❌ **ABANDONNÉ — sample physique non conforme**
> **Ouvert :** 2026-05-18
> **Fermé :** 2026-05-18 (sample KO)
> **Issu de :** `docs/audits/printify-new-categories-2026-05-18.md` §3 (tote bags qualifiés EU)
> **Décision validée par user :** intégration P1 du tote bag bio, sample-first
> **Risque global :** **Faible** — produit standard B2B, fabricant EU réputé, provider EU dédié
> **Décision finale :** voir §11 ci-dessous — abandon bp 731, alternatives à évaluer

---

## 1. Description produit

### Identité

| Champ | Valeur |
|---|---|
| **Référence fournisseur** | Westford Mill® EarthAware™ Organic Cotton Tote (W101) |
| **Blueprint Printify** | **bp 731** — `Organic Cotton Tote Bag` |
| **Provider Printify** | **Textildruck Europa** (id 26) |
| **Pays de production** | 🇩🇪 Allemagne |
| **Marque** | Westford Mill® — fabricant pro UK, ligne EarthAware™ Organics |
| **Type de produit** | Tote bag coton bio certifié, anses longues |

### Caractéristiques typiques

| Caractéristique | Valeur |
|---|---|
| Composition | 100% coton bio certifié OCS Blended |
| Grammage | 140 g/m² (variant standard) ou 180 g/m² (variant heavy) |
| Dimensions | 38 × 42 cm |
| Anses | 70 cm (longueur épaule) |
| Coloris standards Westford Mill | naturel, noir, gris français, navy *(à confirmer en phase 2 si on intègre)* |
| Surface impression utile | ~30 × 35 cm (zone DTG centrale) |

---

## 2. Structure produit proposée (code-ready, prêt à activer)

### 2.1 Pricing à ajouter dans `data/pricing.ts`

À insérer après le bloc `SAC_PRICES` existant (ligne ~278) :

```typescript
// ─── Westford Mill 731 Organic Cotton Tote — Printify EU ─────────────
// Provider: Textildruck Europa (DE) · technique: DTG
// Cost fournisseur estimé : 6.50-9 € selon taille (à confirmer call API)
// Marge cible : 50-55 % de marge brute sur le PV TTC
export const WESTFORD_MILL_731_PRICES = {
  dtg:      14.90,  // PV unitaire impression numérique 1 face
  dtflex:   17.90,  // PV unitaire flex (zone réduite)
  broderie: 22.90,  // PV unitaire broderie petit logo
};

// Surcharges placement (cohérent avec autres produits)
export const WESTFORD_MILL_731_PLACEMENT_SURCHARGES = {
  "coeur":     0,
  "dos":       0,        // tote n'a qu'une face utile — dos = 0
  "coeur-dos": 0,        // idem
};

// Volume pricing (paliers entreprise/asso/événement)
export const WESTFORD_MILL_731_DTG_VOLUME = [
  { min:   1, max:   9, price: 14.90 },
  { min:  10, max:  29, price: 12.90 },
  { min:  30, max:  99, price: 10.90 },
  { min: 100, max: 999, price:  8.90 },
];
```

### 2.2 Constante produit à ajouter dans `data/products.ts`

À insérer dans la section "Printful POD" / "Printify POD" (après PRODUCT_GILDAN_18000 par exemple) :

```typescript
// ─── Printify POD — Westford Mill 731 Organic Cotton Tote ─────────────
// Provider Textildruck Europa (DE) · bp 731 · technique DTG
// Status: EN ATTENTE — sample physique à valider avant activation
// Voir docs/tickets/2026-05-18-tote-bag-westford-mill-bp731.md
export const PRODUCT_WESTFORD_MILL_731: Product = {
  id: "westford-mill-731",
  slug: "tote-bag-westford-mill-bio",
  reference: "Westford Mill W101",
  name: "Tote bag coton bio Westford Mill",
  shortName: "Tote bag bio",
  category: "sacs",
  gender: "unisex",
  tier: "standard",
  description:
    "Tote bag coton bio certifié OCS, 140 g/m², fabriqué par Westford Mill (UK) et imprimé en Allemagne par Textildruck Europa. Idéal pour événements, associations, restaurants, boutiques et goodies clients.",
  composition: "100% coton bio certifié OCS",
  weight: "140 g/m²",
  images: [],
  colors: [
    // À confirmer après vérification API Printify (phase 2)
    { id: "naturel",  label: "Naturel",       hex: "#F0E8D4", available: true },
    { id: "noir",     label: "Noir",          hex: "#0b0b0b", available: true },
    { id: "gris",     label: "Gris français", hex: "#B7BCC4", available: true },
    { id: "navy",     label: "Navy",          hex: "#1E2A44", available: true },
  ],
  sizes: [
    { label: "Unique", available: true },
  ],
  techniques: ["dtg", "dtflex", "broderie"],
  techniqueRecommandee: "dtg",
  placements: ["coeur"],
  pricing: {
    dtf:      WESTFORD_MILL_731_PRICES.dtg,
    dtflex:   WESTFORD_MILL_731_PRICES.dtflex,
    flex:     WESTFORD_MILL_731_PRICES.dtflex,
    broderie: WESTFORD_MILL_731_PRICES.broderie,
    placements: WESTFORD_MILL_731_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: WESTFORD_MILL_731_PLACEMENT_SURCHARGES,
  },
  volumePricingByTechnique: {
    dtf: WESTFORD_MILL_731_DTG_VOLUME,
  },
  featured: false,
  visible: false, // ⚠️ INACTIF tant que sample non validé — voir ticket
  badge: "Coton bio",
  supplierName: "printful", // ⚠️ Volontairement "printful" (pas "printify") pour
                            //    ne pas casser les 9 fichiers UI/studio qui font
                            //    `isPrintful = supplierName === "printful"`.
                            //    Le routing Printify EU (Textildruck DE) reste
                            //    une décision opérationnelle côté admin.
  ideaPour: ["Événements", "Associations", "Restaurants", "Goodies client", "Boutiques"],
  conseil:
    "Tote bag classique en coton bio certifié. Bon entrée de gamme goodies, marge confortable dès 30 pièces.",
  hmMockupImages:     {}, // À remplir — voir §4
  hmMockupImagesBack: {}, // Tote = 1 face utile — peut rester vide
  hmMockupGallery:    {}, // À remplir — voir §4
};
```

### 2.3 Ajout dans `ALL_PRODUCTS`

Une fois activé (visible: true), ajouter `PRODUCT_WESTFORD_MILL_731` au tableau `ALL_PRODUCTS` exporté en fin de `data/products.ts`.

---

## 3. Pricing model proposé

### Cost fournisseur estimé (à confirmer call API Printify lors du sample)

| Quantité | Cost unitaire estimé (DTG 1 face) | Frais shipping FR | Total reçu |
|---|---|---|---|
| 1 (sample) | ~7-9 € | ~5 € | **~15 € livré** |
| 10 | ~6.50 € | ~6 € | ~71 € pour 10 |
| 30 | ~6 € | ~8 € | ~188 € pour 30 |
| 100 | ~5.50 € | ~12 € | ~562 € pour 100 |

### PV TTC recommandé

| Quantité | Cost unitaire | PV TTC HM Global | Marge brute (€) | Marge brute (%) |
|---|---|---|---|---|
| 1-9 ex. | ~7.50 € | **14.90 €** | 7.40 € | 50% |
| 10-29 ex. | ~7 € | **12.90 €** | 5.90 € | 46% |
| 30-99 ex. | ~6.50 € | **10.90 €** | 4.40 € | 40% |
| 100-999 ex. | ~6 € | **8.90 €** | 2.90 € | 33% |

**Cible marge V1 :** ≥ 40 % de marge brute moyenne sur les paliers 1-99 ex. (cohérent avec le reste du catalogue HM Global).

**À NE PAS faire en V1 :**
- Pricing PV < 8.90 € (marge insuffisante face aux coûts fixes opérationnels)
- Quantité min 250+ (pas adapté au profil client B2B HM Global qui mix petits/moyens volumes)

---

## 4. Mockups & visuels nécessaires

### À récupérer pendant phase 2 (call API Printify, ~5 min)

| Source | Fichiers à générer | Destination |
|---|---|---|
| Printify mockup API bp 731 | 4 couleurs × 2 angles (front, folded) | `/public/mockups/westford-mill-731/` |
| → `naturel-front.webp` |   | front naturel |
| → `noir-front.webp` |   | front noir |
| → `gris-front.webp` |   | front gris |
| → `navy-front.webp` |   | front navy |
| → `naturel-folded.webp` |   | plié naturel |
| ... |   | ... |

**Soit ~8-12 visuels à récupérer + crop éventuel** (réutiliser `scripts/crop-printify-mockups.mjs` qui existe déjà).

### Visuel marketing (optionnel V1)

Pour la card produit catalogue + galerie, un visuel éditorial premium HM Global serait bienvenu :

**Prompt suggéré (à ajouter dans `docs/prompts/print-mockups-prompts.md` ou nouveau fichier textile) :**

```
Premium editorial product photography of a Westford Mill organic cotton tote bag
in natural beige color, folded carefully and arranged on a warm cream matte
tabletop (#F4ECDE). Subtle linen texture visible on the bag fabric (140 gsm
organic cotton). One small abstract gradient motif printed on the front:
flowing waves of cyan #54B6D2 → deep violet #3B235A → magenta #C13C8A, covering
~30% of the visible surface. Soft natural window light from upper-left at 45°,
gentle long shadow. Small detail: one dried gypsophila sprig in upper-left
corner, soft focus. Camera angle: 25° downward. Style: Aesop catalogue,
Pentagram studio quality. NO people, NO hands, NO devices, NO readable text,
NO fake brand names.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

→ Destination : `public/images/home/hm-tote-westford-mill-bio.webp`

---

## 5. Checklist sample physique (avant activation)

### Commande sample

- [ ] Créer 1 commande draft Printify bp 731 — coloris **naturel** (le plus polyvalent) — taille unique
- [ ] Personnalisation sample : motif gradient cyan→violet→magenta zone 20×20 cm
- [ ] Adresse livraison : HM Global Agence, 20 Rue des Tuileries, 67460 Souffelweyersheim
- [ ] Validation devis Printify (cost confirmé + shipping FR + taxes)
- [ ] Délai estimé : 7-10 j ouvrés (Textildruck DE → Souffelweyersheim)
- [ ] Coût estimé : ~15-20 € TTC livré

### Critères de validation à la réception

| Critère | Standard attendu | Validé ? |
|---|---|---|
| **Toucher** | Coton naturel doux, pas plastique, pas rêche | ☐ |
| **Coutures** | Doubles aux anses, propres, pas de fils qui sortent | ☐ |
| **Anses** | 70 cm, solides, cousues à plat | ☐ |
| **Couleur** | Beige naturel non blanchi, uniforme, pas de tâches | ☐ |
| **Impression DTG** | Couleurs vives, pas de craquelage, pas de transparence sur fond clair | ☐ |
| **Rendu gradient** | Transitions douces, pas de bandes, fidélité aux hex codes | ☐ |
| **Odeur** | Neutre coton, pas chimique | ☐ |
| **Tenue après 1 lavage 30°** | Pas de rétrécissement > 5%, couleurs stables | ☐ |
| **Packaging livraison** | Carton/sachet propre, sans plastique excessif (cohérent positionnement bio) | ☐ |

### Photos sample

- [ ] Prendre 5 photos sample : front, dos, anses, coutures, détail impression
- [ ] Comparer rendu vs mockup Printify généré → noter écarts
- [ ] Stocker dans `tmp/sample-westford-mill-731/` (pas dans `/public/` tant que pas validé)

---

## 6. Décision finale attendue (après réception sample)

| Scénario | Action |
|---|---|
| ✅ **Sample 100% conforme** (tous critères §5 cochés) | Activation produit V1 — voir §7 |
| ⚠️ **Sample acceptable avec réserves** (1-2 critères mineurs ratés) | Activation avec ajustement description / texte client + photos sample utilisées en galerie |
| ❌ **Sample non conforme** (3+ critères ratés OU rendu DTG mauvais) | **Abandonner bp 731** → re-explorer alternatives (bp 553 AS Colour, sourcing direct grossiste TopTex) |

---

## 7. Fichiers à modifier APRÈS validation sample (checklist activation)

> **Ne rien toucher avant validation explicite du sample.**

### Fichiers à modifier (ordre d'exécution)

| # | Fichier | Modification |
|---|---|---|
| 1 | `data/pricing.ts` | Ajouter `WESTFORD_MILL_731_PRICES` + `_PLACEMENT_SURCHARGES` + `_DTG_VOLUME` (voir §2.1) |
| 2 | `data/products.ts` | Ajouter constante `PRODUCT_WESTFORD_MILL_731` (voir §2.2) + ajouter au tableau `ALL_PRODUCTS` exporté + passer `visible: false` → `visible: true` |
| 3 | `public/mockups/westford-mill-731/` | Créer dossier + déposer 8-12 mockups récupérés (§4) |
| 4 | `public/images/home/hm-tote-westford-mill-bio.{webp,jpg}` | Si visuel éditorial premium généré (§4 optionnel) |

### Fichiers à NE PAS toucher (même après activation)

- ❌ `lib/stripe/*` — intact
- ❌ `lib/supabase/*` — intact
- ❌ `app/api/stripe/*`, `app/api/supabase/*` — intacts
- ❌ `app/checkout/*` — intact
- ❌ `store/*` (zustand panier/auth) — intact
- ❌ `lib/supplierMap.ts` — supplierName "printful" choisi pour ne PAS toucher au mapping
- ❌ `data/print-products.ts` — concerne print uniquement, pas textile
- ❌ Composants `ProductDetailClient`, `BusinessCardConfigurator`, `BATModal` — intacts

### Tests post-activation à lancer

```bash
# 1. Type-check
npm run type-check

# 2. ESLint
npx eslint data/products.ts data/pricing.ts

# 3. HTTP
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/catalogue/sacs
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/produits/tote-bag-westford-mill-bio

# 4. Vérif que produit présent dans HTML
curl -s http://localhost:3000/catalogue/sacs | grep -oE "westford-mill-731\|Tote bag coton bio"

# 5. Sanity intégrations critiques
find lib/stripe lib/supabase app/api/stripe app/api/supabase app/checkout store -newer data/products.ts -type f
# (résultat vide attendu)
```

---

## 8. Risques résiduels & mitigation

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Sample qualité inférieure aux attentes | Faible | Moyen (perte ~20 € + temps) | §5 critères clairs, décision binaire §6 |
| Coût réel > estimation (mauvaise marge) | Faible | Faible | Ajuster paliers PV après réception sample |
| Mockups Printify pas exploitables | Moyen | Faible | Re-générer via prompt IA §4 ou commander shooting interne |
| Délai shipping Printify > 14 j | Faible | Moyen | Communiquer "Délai 7-15 j" sur la fiche produit |
| Westford Mill rupture stock | Faible | Faible | Provider Textildruck DE bascule sur autre lot, transparence client |
| Discrépance couleurs entre mockup et sample | Moyen | Faible | Affichage "Visuel non contractuel — voir détail couleur en commentaire" |

---

## 9. Étapes futures (post-activation V1)

Si l'activation V1 réussit (3-6 mois de recul) :

- **V1.1** — Élargir gamme tote : ajouter petit format (35×38 cm) ou format porte-livres
- **V1.2** — Ajouter pochette assortie Westford Mill (bp à identifier) pour pack "goodies événement"
- **V2** — Tester second blueprint EU `bp 1920 Econscious Eco Tote` (provider Textildruck DE aussi à vérifier en phase 2 si on étend)

---

## 10. Confirmations actuelles (ticket ouvert)

- ✅ **Aucun fichier modifié** à l'ouverture du ticket (juste ce document)
- ✅ `data/products.ts` intact
- ✅ `data/pricing.ts` intact
- ✅ Stripe / Supabase / checkout / routes API : non concernés
- ✅ Sample physique non commandé (action à prendre par l'utilisateur)
- ✅ `visible: false` programmé dans la structure (pas d'apparition catalogue avant validation)

---

**Prochaine action utilisateur attendue :**

1. Commander 1 sample physique Westford Mill bp 731 via dashboard Printify (compte HM Global)
2. Réception sous 7-10 j
3. Valider critères §5
4. M'envoyer le résultat → j'active P1 selon §6-7

*Ticket en attente. Aucune urgence, aucun fichier code touché.*

---

## 11. Clôture — sample KO (2026-05-18)

> **Statut final : ABANDON bp 731.** Sample physique reçu et non conforme aux critères §5.
> Décision utilisateur : abandon de ce blueprint, basculement vers alternatives.

### État technique préservé

- ✅ Aucune ligne de code modifiée sur tout le cycle du ticket
- ✅ `data/products.ts`, `data/pricing.ts`, Stripe, Supabase, checkout, routes API : intacts
- ✅ Aucun produit `PRODUCT_WESTFORD_MILL_731` créé (code-ready dans §2 mais jamais inséré)
- ✅ Aucun dossier `public/mockups/westford-mill-731/` créé
- ✅ Coût total du ticket pour le projet : 0 € en dev + ~15-20 € sample physique côté business

### Alternatives à évaluer (à valider si tu veux continuer la catégorie tote)

| Option | Source | Provider | Risque | Action |
|---|---|---|---|---|
| **A — bp 553 AS Colour Cotton Tote** | Printify | À vérifier (phase 1 ne l'avait pas qualifié EU mais pas explicitement vérifié) | Moyen — re-audit nécessaire | Lancer call API Printify ciblé sur bp 553 |
| **B — Sourcing direct grossiste EU** | TopTex (déjà partenaire), Falk & Ross | n/a — flux classique grossiste | Faible | Identifier référence Beechfield BB300 ou KI0262 dans catalogue TopTex |
| **C — Abandonner la catégorie tote V1** | n/a | n/a | Faible | Reporter à V2, focus textile/print pour le go-live |

### Recommandation

**Option B** est la plus pragmatique :
- TopTex est déjà partenaire HM Global → pas d'ouverture supplier supplémentaire
- Stock immédiat, délai 24-48h
- Pas de risque qualité (catalogue déjà testé sur tshirts/polos)
- La référence **KI0262 (tote bag coton bio)** est déjà mentionnée dans `data/pricing.ts:280-285` (`SAC_PRICES.toteBio`) → infrastructure pricing **déjà en place**, manque juste l'objet produit dans `data/products.ts`

→ Possibilité de relancer un nouveau ticket "P1-bis Tote bag KI0262 TopTex" avec une logique différente : pas de sample-first (TopTex est déjà connu/validé), commande directe avec broderie sous-traitée.

---

*Ticket clôturé. Pour relancer la catégorie, ouvrir un nouveau ticket dédié à l'alternative retenue.*
