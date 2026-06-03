# Audit page `/impression` — état actuel & plan de modification

> **Date :** 2026-05-18
> **Périmètre :** `app/impression/page.tsx`, `app/impression/cartes-de-visite/*`, `components/print/PrintImageStage.tsx`, images `public/mockups/print/*` et `public/images/home/hm-print-*`
> **Posture :** audit uniquement — aucun code modifié à ce stade.

---

## 1. Résumé de ce qui a été trouvé

### Structure de la page

`app/impression/page.tsx` (402 lignes) est un **server component async** bien architecturé qui :
- charge les produits dynamiques via l'API Gelato (`getGelatoProducts()`) si configurée
- a un `STATIC_FALLBACK` qui s'affiche si Gelato indisponible ou retourne vide
- présente **5 catégories** : `business-cards`, `flyer`, `poster`, `canvas`, `cards` (cartes & invitations)
- chaque catégorie a une carte large avec `PrintImageStage` + side-card formats/specs en fallback
- a un CTA bas de page sur fond violet historique (`#433053 → #3f2d58`)
- a un bandeau réassurance avec des **emojis 🎨✅🖌️📦🇫🇷** (incohérent avec la nouvelle DA 2026)

Sous-page :
- `app/impression/cartes-de-visite/page.tsx` (entête, 50+ lignes) — délègue à `BusinessCardPageClient.tsx`
- emojis 📐📄🎨✅📦🖌️ aussi présents en bandeau, **`text-3xl font-black`** héritage palette ancienne

### Composant clé

`components/print/PrintImageStage.tsx` (216 lignes, client component) — système sophistiqué :
- 6 familles supportées (`business-cards`, `flyer`, `poster`, `canvas`, `framed-poster`, `hanging-poster`)
- chaque famille a son propre `background` radial-gradient + `objectPosition` + `objectFit` + `padding` + `scale` + `overlayLabel`
- **but** : différencier visuellement les familles à partir d'images potentiellement identiques
- en pratique : c'est élégant, mais les **fonds gradients restent crème/beige clair** → effet "pâle / catalogue fournisseur générique"
- ombre douce d'ancrage simulée sous l'objet (radial-gradient noir 10% opacity)

### Images actuelles (problème principal identifié)

| Fichier | Dimensions | Poids | Constat |
|---|---|---|---|
| `public/mockups/print/business-card/carte-visite-premium.webp` | 1600×1000 | **22 KB** | Très petite, basse qualité visible |
| `public/mockups/print/flyer/flyer-premium.webp` | 1200×1600 | **19 KB** | Idem, paraît "fantôme" |
| `public/mockups/print/affiche/affiche-premium.webp` | 1200×1600 | **18 KB** | Idem |
| `public/mockups/print/canvas/canvas-premium.webp` | 1200×1600 | **11 KB** | Vraiment très petit fichier → pixellisation |

**Diagnostic :** ces images font seulement 10-22 KB chacune. À cette compression, le rendu est **flou et fade**. Aucune image n'a de vrai motif HM Global gradient cyan/violet/magenta — elles sont presque blanches avec une touche rose timide (palette ancienne).

### Images **déjà disponibles** dans `/public/images/home/` (récemment générées)

J'ai installé hier 4 nouvelles photos éditoriales premium qui peuvent **remplacer immédiatement** les images print actuelles :

| Image disponible | Dimensions | Poids | Utilisation actuelle |
|---|---|---|---|
| `hm-print-flyers.webp` | 1456×1093 | **68 KB** | Card "Flyers" homepage |
| `hm-print-affiches-posters.webp` | 1456×1093 | **68 KB** | Card "Affiches" homepage |
| `hm-print-toiles-canvas.webp` | 1456×1093 | **73 KB** | Card "Canvas" homepage |
| `hm-card-print-supports-v2.webp` | 1456×1093 | **64 KB** | Card "Impression & supports" QuickEntries (brochures + bac béton + stylo plume) |

→ Ces 4 images sont **directement utilisables** sur `/impression`. Tailles ×3 plus grandes, photos éditoriales bien composées, palette cyan/violet/magenta respectée, fond beige naturel cohérent.

### Manquants (à générer)

- ❌ **Cartes de visite** premium HM Global (pas encore générée)
- ❌ **BAT validation** (existe mais comme `hm-bat-validation.webp`, focus textile pas print spécifique)
- ❌ **Pack impression complet** (existe comme `hm-pack-communication-complet.webp` = colis client mais c'est un usage différent)

### Data

- `data/print-products.ts` (149 lignes) — uniquement configuration cartes de visite (prix, finitions, formats). **Aucun chemin d'image** stocké ici. Bien séparé.
- Les chemins d'images sont **hardcodés dans `STATIC_FALLBACK`** au sein de `app/impression/page.tsx:79-115` — c'est la source de vérité actuelle.

### Compatibilité technique

- ✅ `next/image` utilisé partout (via `PrintImageStage`)
- ✅ Image responsive via `fill` + `sizes` correctement passé
- ✅ WebP en format principal, PNG en fallback dispo
- ✅ TypeScript strict
- ❌ Pas de `priority` sur les images print (mais c'est ok car pas en LCP)
- ❌ Pas d'image AVIF (acceptable — WebP couvre 97% des navigateurs)

### Conformité licences

D'après `docs/image-rights.md` :
- Les images HM Global doivent venir de : photos maison / Blender / IA propre / assets licence commerciale
- **Interdiction explicite** : scraper Google Images / PrintOclock / Pixartprinting / VistaPrint / MOO
- Les `supplierImages` et `mockups/hm/textile/` ont des règles séparées (rien à voir avec print)
- Les images print actuelles ont été générées par toi via IA → **OK licence**
- Les 4 nouvelles photos générées récemment (Gemini/DALL·E via toi) → **OK licence**

---

## 2. Liste des fichiers concernés (à modifier en phase exécution)

### Fichiers à modifier (3 obligatoires)

| Fichier | Modification | Impact |
|---|---|---|
| **`app/impression/page.tsx`** | Mettre à jour `STATIC_FALLBACK` : remplacer les 4 anciens chemins par les nouveaux `/images/home/hm-print-*`. Remplacer les emojis du bandeau réassurance par icônes lucide. Migrer le CTA fin de page vers palette 2026 (blanc + accents cyan/magenta plutôt que gradient violet plein) | Effet visuel **fort** — la page passe de "pâle catalogue fournisseur" à "premium agence" |
| **`app/impression/cartes-de-visite/page.tsx`** | Remplacer emojis du bandeau par icônes lucide + migrer `text-3xl font-black` → `text-3xl font-semibold tracking-[-0.025em]` (cohérence DA 2026) | Effet **moyen** — sous-page configuratrice plus propre |
| **`components/print/PrintImageStage.tsx`** | Optionnel : ajuster les `background` gradients pour qu'ils soient **plus neutres** (les nouvelles photos ont déjà leur scène complète, le gradient cadre fait doublon). Si on garde le composant tel quel, les nouvelles photos seront servies sur fond beige radial → effet correct mais peut-être trop "encadré". | Effet **subtil** mais cohérent |

### Fichiers à NE PAS toucher

- ✅ `data/print-products.ts` — configuration prix/options, intact
- ✅ `lib/gelato.ts` — intégration API, intact
- ✅ `components/print/BusinessCardConfigurator.tsx` — configurateur fonctionnel
- ✅ `components/print/BusinessCardVisualizer.tsx` — visualiseur HD du BAT
- ✅ Toutes les routes API
- ✅ Stripe / Supabase / panier / checkout

### Fichiers à créer (optionnel selon scope)

| Fichier | Contenu | Priorité |
|---|---|---|
| `public/images/home/hm-print-cartes-de-visite.{webp,jpg}` | Image cartes de visite premium (à générer via IA — prompt fourni section 4) | P1 |
| `public/images/home/hm-print-bat-validation.{webp,jpg}` | Image BAT validation print spécifique (à générer) | P2 |
| `public/images/home/hm-print-pack-complet.{webp,jpg}` | Pack impression complet (cards + flyers + affiche + brochure + enveloppe) | P3 |

---

## 3. Liste des images à créer ou récupérer légalement

### Déjà OK (rien à faire)

- ✅ Flyers — `hm-print-flyers.webp` (68 KB)
- ✅ Affiches & posters — `hm-print-affiches-posters.webp` (68 KB)
- ✅ Toiles canvas — `hm-print-toiles-canvas.webp` (73 KB)
- ✅ Brochures (compatible card "Impression" homepage) — `hm-card-print-supports-v2.webp` (64 KB)

### À générer (3 manquants)

1. **`hm-print-cartes-de-visite.webp`** (prompt section 4.1)
2. **`hm-print-bat-validation.webp`** (prompt section 4.2)
3. **`hm-print-pack-complet.webp`** (prompt section 4.3)

### Sources légales de fallback (si tu ne veux pas générer)

Si la génération IA ne te convient pas, voici les sources **licites** avec leurs conditions :

| Source | URL | Licence | À vérifier |
|---|---|---|---|
| **Unsplash** | https://unsplash.com | Unsplash License (gratuit usage commercial) | Chercher : "business cards mockup", "print stationery", "brochure mockup" |
| **Pexels** | https://www.pexels.com | Pexels License (gratuit usage commercial) | Idem |
| **Mockup World** | https://www.mockupworld.co | Free for personal & commercial use (varie par mockup — toujours lire la fiche) | "Business card mockup free" |
| **Freepik Premium** | https://www.freepik.com | Premium = licence commerciale OK, **Free = attribution obligatoire** | Chercher "mockup PSD free" |
| **Adobe Stock** | https://stock.adobe.com | Paid, licence commerciale incluse | Standard licensing |
| **Pixabay** | https://pixabay.com | Pixabay License (gratuit usage commercial sans attribution) | Idem |

**À ÉVITER absolument** (rappel `docs/image-rights.md`) :
- ❌ Google Images
- ❌ Capture d'écran de PrintOclock / Pixartprinting / VistaPrint / MOO / Canva
- ❌ Scrape automatique de tout site
- ❌ Mockups Behance / Dribbble sans vérifier la licence individuelle

---

## 4. Prompts IA prêts à utiliser

> **Note** : ces 3 prompts complètent le fichier `docs/prompts/print-mockups-prompts.md` qui contient déjà 5 prompts (cartes de visite, flyers, brochures, affiches, canvas). Les prompts ci-dessous sont les **3 nouveaux manquants** spécifiques à la page `/impression`.

### 4.1 — Cartes de visite (manquant n°1)

```
Premium editorial product photography for HM Global Agence print catalogue.
Surface: warm cream matte tabletop, color #F4ECDE, subtle linen texture.
Lighting: single soft natural window light from upper-left at 45°, gentle long
shadows toward the right, no harsh contrast.

Subject: a neat stack of about 20 business cards, 85×55mm landscape format,
350gsm matte finish with slight rounded corners visible on the top card. The
top card features an abstract organic gradient: cyan #54B6D2 → deep violet
#3B235A → magenta #C13C8A, flowing wave shape covering 60% of the surface,
white space on the rest. One additional card placed beside the stack at 40°
angle to reveal the back side showing only a single small cyan circle. Small
dried gypsophila sprig in upper-left corner, out of focus.

Camera angle: 25° downward, slight depth of field, sharp focus on top card.
Style reference: Aesop catalogue, Pentagram studio. Photorealistic.
NO people, NO hands, NO devices, NO readable text, NO fake brand names.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

Destination : `public/images/home/hm-print-cartes-de-visite.{webp,jpg}`

### 4.2 — BAT validation print (manquant n°2)

```
Premium editorial photography of a print proof validation workspace. Layout
flat-lay on a warm cream matte desk surface (#F4ECDE). Elements arranged:

— Center: an A4 printed proof sheet showing crop marks in corners, a color
  control bar (CMYK swatches), and a large abstract gradient artwork on the
  page using cyan #54B6D2, deep violet #3B235A, and magenta #C13C8A
— Right: a smaller printed flyer (A5) with similar gradient design
— Lower-left: a small pile of glossy color swatches/Pantone chip cards
— Lower-center: a black matte fountain pen resting on the proof
— Upper-right: a circular magnifying loupe with brass rim, partially over
  the corner of the proof
— Upper-left: a dried gypsophila sprig in soft focus

Lighting: soft natural window light from upper-left at 45°, long gentle
shadows. Camera angle: 25° downward, partial top-down. Style: editorial
print quality control aesthetic, Aesop / Pentagram quality. Photorealistic
texture on paper.
NO people, NO hands, NO devices, NO readable text, NO fake brand names,
NO logos.

--ar 16:10 --style raw --quality 2 --stylize 250 --seed 42
```

Destination : `public/images/home/hm-print-bat-validation.{webp,jpg}`

### 4.3 — Pack impression complet (manquant n°3)

```
Premium editorial product photography of a complete printed communication
pack for a brand. Surface: warm cream matte tabletop (#F4ECDE), soft linen
texture. Lighting: soft natural window light from upper-left at 45°, gentle
long shadows.

Composition (top-down 20° angle): laid out on the surface, slightly
overlapping but composed:
— Top-left: an A4 brochure laid open showing a centerfold with the brand
  gradient (cyan #54B6D2 → violet #3B235A → magenta #C13C8A) on right page
— Top-center: an A3 poster standing slightly propped against the back wall,
  showing the brand gradient
— Right: a folded letter envelope with gradient pattern on the back flap
— Center-front: a fanned stack of 4 A5 flyers with gradient header
— Lower-left: a stack of about 15 business cards
— Lower-right: a small concrete tray with one matte black fountain pen
— Upper-right corner: a small ceramic vase with one dried pampas stem

Camera angle: 20° downward, slight depth of field. Style: editorial
agency catalogue, Pentagram / Aesop quality. Photorealistic, premium feel.
NO people, NO hands, NO devices, NO readable text, NO fake brand names.

--ar 16:10 --style raw --quality 2 --stylize 250 --seed 42
```

Destination : `public/images/home/hm-print-pack-complet.{webp,jpg}`

### Astuces communes

- **Outil recommandé** : Midjourney v6 (réalisme produit) ou ChatGPT GPT-Image
- **Itérer** 3-4 fois par prompt, garder la version la plus propre
- **Upscale** à 1920×1440 (Midjourney bouton Upscale)
- **Déposer** dans `/Users/kaankaplan/Desktop/Site web hm global agence /` comme d'habitude
- **Cohérence** : utiliser `--seed 42` partout pour garder le même grain photographique entre les 3

---

## 5. Recommandations UI pour rendre la page `/impression` plus premium

### P1 — Effet visuel immédiat (1-2h de dev)

1. **Migrer les chemins d'images** dans `STATIC_FALLBACK` (`app/impression/page.tsx:79-115`) :
   ```diff
   - image: "/mockups/print/business-card/carte-visite-premium.webp"
   + image: "/images/home/hm-print-cartes-de-visite.webp"
   ```
   (idem pour les 3 autres familles avec les images déjà disponibles)

2. **Remplacer les emojis** du bandeau réassurance par icônes lucide cyan :
   - 🎨 → `<Palette size={14} color="var(--hm-cyan)" />`
   - ✅ → `<ShieldCheck size={14} color="var(--hm-cyan)" />`
   - 🖌️ → `<Brush size={14} color="var(--hm-cyan)" />`
   - 📦 → `<Package size={14} color="var(--hm-cyan)" />`
   - 🇫🇷 → `<MapPin size={14} color="var(--hm-cyan)" />` ou texte simple

3. **Migrer le CTA fin de page** :
   - Fond actuel : `bg-[linear-gradient(180deg,#433053_0%,#3f2d58_100%)]` (violet plein)
   - Cible : `bg-[linear-gradient(135deg,#f4f8fb_0%,#ffffff_50%,#faf3f7_100%)]` (gradient blanc subtil cyan→magenta) — même DA que `HomePack360` et `HomeFinalCTA`
   - Boutons : `btn-hm-magenta` + `btn-hm-violet-outline`

4. **Vider le badge format flottant** de `PrintImageStage` pour les nouvelles photos (qui n'en ont pas besoin) :
   - Soit garder le badge mais le rendre plus discret (bordure cyan tinted)
   - Soit ajouter une prop `showBadge?: boolean` (default true) et passer `false` pour les nouvelles photos

### P2 — Polish DA cohérent (3-5h de dev)

5. **Adapter `PrintImageStage`** :
   - Les nouvelles photos ont déjà leur scène complète avec fond beige + lumière + composition. Le `background` radial-gradient du composant fait doublon.
   - Recommandation : ajouter une prop `useNeutralBackground?: boolean` qui passe le background à `#FAFBFC` plain quand on a une vraie photo dominante.

6. **Réduire `font-black` partout** dans la page et la sous-page (`text-3xl font-black md:text-4xl` → `text-3xl font-semibold tracking-[-0.025em]`).

7. **Bannière haute /impression** : ajouter une **photo lifestyle large** (pack impression complet, prompt 4.3) en bannière sous le titre — donne tout de suite le ton "agence premium".

8. **Réordonner les catégories** pour mettre l'accent commercial :
   - Ordre actuel : business-cards / flyer / poster / canvas / cards
   - Ordre suggéré : **business-cards (bestseller V1) / flyer / brochure / poster / canvas / cards invitations** (déplacer brochure en 3e position)

### P3 — Améliorations à plus long terme

9. **Header utility-bar** sur la page /impression spécifique : "Devis sous 24h · BAT validé · Production France" en cyan au-dessus du titre.

10. **Section "Notre process en 3 étapes"** entre la grille produits et le CTA final :
    - Envoi fichier → BAT validation → Production
    - Photos correspondantes : `hm-bat-validation.webp` (déjà disponible — focus textile mais utilisable) + 2 autres à générer
    - Composant à créer : `components/print/PrintProcess.tsx`

11. **Galerie "Réalisations clients"** en bas de page (3-6 cas concrets — restaurant, club, PME, événement). Photos à shooter ou à générer.

12. **Bandeau Instagram** sous les réalisations pour montrer l'activité (6 derniers posts via embed Instagram Graph).

---

## Plan d'action proposé

**Étape 1 — Quick win (2h)** : modifier `STATIC_FALLBACK` dans `page.tsx` pour utiliser les 4 nouvelles images déjà disponibles + remplacer emojis + migrer CTA fin de page. **Impact visuel immédiat sans rien générer**.

**Étape 2 — Si tu valides l'étape 1** : générer les 3 visuels manquants (Cartes de visite / BAT / Pack complet) via les prompts ci-dessus → je les installe.

**Étape 3 — Polish final** : ajustements UI (badge format, font-semibold, bannière haute, process 3 étapes).

**Étape 4 (plus tard)** : réalisations clients + Instagram.

---

## Confirmations

- ✅ **Aucune ligne de code modifiée** pour cet audit
- ✅ **Aucune image téléchargée** depuis sources externes
- ✅ **Doctrine `docs/image-rights.md`** respectée
- ✅ **Stripe / Supabase / panier / checkout / Gelato API** : aucun fichier touché ni analysé en profondeur (out of scope)
- ✅ Type-check non requis (audit pur lecture)

---

*Rapport prêt. Lance "étape 1" dès que tu valides, ou demande des précisions sur n'importe quel point.*
