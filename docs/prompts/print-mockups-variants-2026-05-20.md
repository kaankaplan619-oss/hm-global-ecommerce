# Prompts de génération — 10 variantes mockups print HM Global

> **Date :** 2026-05-20
> **Mission :** option B audit `docs/audits/impression-image-variants-2026-05-20.md` (Ambition catalogue)
> **Cible :** générer 10 mockups premium pour passer de "1 visuel par catégorie + 1 fallback médiocre" à "3 visuels premium par catégorie"
> **Statut :** prompts seulement — **aucun code modifié**, l'intégration `IMAGE_VARIANTS_BY_CATEGORY` se fera après validation visuelle utilisateur

---

## 0. Base DA HM Global (à coller en tête de chaque prompt)

Ces règles s'appliquent à TOUS les 10 visuels. Reprend exactement la base DA du fichier `print-mockups-prompts.md` (cohérence avec les 5 photos premium déjà générées et installées).

```
Premium editorial product photography for HM Global Agence print catalogue.
Surface: warm cream matte tabletop, color #F4ECDE, subtle linen texture.
Lighting: single soft natural window light from upper-left at 45°, gentle long
shadows toward the right, no harsh contrast. Camera angle: 25° downward,
slight depth of field, sharp focus on hero product.
Brand gradient applied on the printed surface ONLY: abstract organic waves
flowing cyan #54B6D2 → deep violet #3B235A → magenta #C13C8A, covering ~60%
of the product surface, white space on the rest.
Style reference: Aesop catalogue, Pentagram studio, Apple keynote, Behance top 5%.
NO people, NO hands, NO devices, NO readable text, NO fake brand names,
NO logos of third-party brands, NO emoji, NO stock photo aesthetic.
```

### Paramètres Midjourney communs (cohérence visuelle avec les 5 photos existantes)

```
--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

Le `--seed 42` est **critique** pour garder la même signature visuelle (grain, lumière, texture) que les 5 photos déjà installées (`hm-print-cartes-de-visite`, `hm-print-flyers`, `hm-print-affiches-posters`, `hm-print-toiles-canvas`, `hm-card-print-supports-v2`).

### Astuce cohérence ultime

Une fois la **première image générée et validée** parmi les 10 ci-dessous, copier son URL Midjourney et la passer en image-prompt reference au début des 9 autres prompts :

```
[URL_image_validee] [Base DA] [Subject specific]
```

Cela force Midjourney à reproduire le grain photographique exact entre les 10 visuels.

---

## P1 — Cards / invitations (priorité haute)

> Catégorie la plus critique : pool actuel = 100% doublon avec business-cards et flyer. Pas une seule image dédiée invitation.

### 1. `hm-print-cards-invitations-folded.webp`

**Brief :** Carton plié A6 vertical posé à plat + enveloppe assortie + ruban discret. Effet "carte de mariage / vœux entreprise / invitation événement".

```
[Base DA above] + Subject: a folded A6 portrait greeting card (vertical fold,
148×105mm when closed) placed flat on the cream tabletop, slightly opened
showing both inside pages. The cover (right page when closed) features the
brand gradient as an elegant organic wave covering ~50% of the surface, top
half. A matching cream envelope (130×185mm) is placed beside the card, flap
slightly open, with a small triangular brand gradient detail on the flap.
A thin natural cotton ribbon (4mm wide, cream color) curls loosely across
the composition for editorial elegance. Paper feels premium 350gsm coated
silk finish. Small detail: one dried gypsophila sprig in upper-left corner,
soft focus. Camera angle: 25° downward.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-cards-invitations-folded.webp`
- **Priorité :** P1 (à générer en premier)

### 2. `hm-print-cards-invitations-stack.webp`

**Brief :** Pile de cartes carrées 140×140 mm avec finition dorure mate, posées en éventail léger.

```
[Base DA above] + Subject: a neat stack of about 12 square invitation cards
(140×140mm format, 350gsm matte coated silk paper) on the cream tabletop,
slightly fanned out asymmetrically from a central stack. The top card
features the brand gradient as a centered circular composition (~40% of the
surface, leaving generous white margins). The corner of one card is slightly
lifted to reveal paper thickness and the smooth back side. One additional
square card placed at 30° angle showing the back: minimalist single cyan
circle in lower-right corner. Small detail: one dried pampas grass blade in
upper-right corner, soft focus. Camera angle: 25° downward.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-cards-invitations-stack.webp`
- **Priorité :** P1

---

## P2 — Business cards (priorité moyenne-haute)

> Élimine le packshot vectoriel basse résolution actuel.

### 3. `hm-print-cartes-detail-macro.webp`

**Brief :** Macro texture papier 350 g/m² + coin rond visible + gradient HM sur la tranche.

```
[Base DA above, BUT camera angle becomes a close-up macro shot at 20°
downward, focal length 90mm equivalent] + Subject: extreme close-up macro of
a single business card (85×55mm landscape) with rounded corners, isolated
on the cream tabletop. The card surface fills 80% of the frame, showing
visible paper grain texture (350gsm matte coated paper). The brand gradient
flows organically from the upper-left corner, covering ~50% of the visible
card surface with cyan #54B6D2 transitioning to deep violet #3B235A then
magenta #C13C8A. Two more cards visible underneath, very slightly fanned to
the side, blurred (depth of field), showing the paper edge stack. Soft
shadow on right side of card. No other props.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-cartes-detail-macro.webp`
- **Priorité :** P2

### 4. `hm-print-cartes-trio-finitions.webp`

**Brief :** 3 cartes côte à côte montrant les 3 finitions Mat / Brillant / Coins ronds.

```
[Base DA above] + Subject: three business cards (85×55mm landscape) arranged
side by side on the cream tabletop with a small gap between them. From left
to right: card 1 with MATTE finish (subtle grain visible, no reflection)
showing the brand gradient on the upper half; card 2 with GLOSSY finish
(soft specular highlight visible on the surface) showing a different gradient
composition with sharper cyan; card 3 with ROUNDED CORNERS (visibly cut
corners, ~3mm radius) and matte finish showing the gradient as a corner
accent only. Subtle ambient occlusion shadow under each card. Small detail:
single dried wheat stem in upper-right corner. Camera angle: 25° downward.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-cartes-trio-finitions.webp`
- **Priorité :** P2

---

## P3 — Posters / affiches (priorité moyenne)

> Élimine le packshot 3D isométrique basse résolution actuel.

### 5. `hm-print-poster-roll.webp`

**Brief :** Poster A3 enroulé partiellement déroulé sur table cream, ruban fin de maintien.

```
[Base DA above] + Subject: an A3 size poster (297×420mm, 200gsm uncoated
paper) partially rolled and partially unrolled on the cream tabletop. The
unrolled portion (~60% of the poster length) lies flat and shows the brand
gradient as a large organic wave composition (cyan to deep violet to magenta)
covering 70% of the visible surface. The rolled portion at the top of the
frame shows the paper coiled neatly, secured by a thin natural cotton ribbon
(4mm wide, cream color) tied in a simple knot. The paper edge has a slight
curl showing thickness and texture. Small detail: one ceramic vase with a
single dried gypsophila sprig in upper-right corner, soft focus. Camera
angle: 25° downward.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-poster-roll.webp`
- **Priorité :** P3

### 6. `hm-print-poster-grid-3.webp`

**Brief :** 3 affiches alignées contre un mur clair (galerie style expo).

```
[Base DA above, BUT change camera angle to slight upward 10° to give scale,
AND surface becomes a cream wall #F4ECDE behind a low cream shelf in the
foreground] + Subject: three vertical posters (50×70cm each, 200gsm uncoated
paper) propped against the cream wall, slightly leaning at 5° angle, arranged
in a row with even ~10cm spacing. Each poster shows a DIFFERENT brand
gradient composition using the same color palette (cyan #54B6D2, deep violet
#3B235A, magenta #C13C8A): poster 1 has a flowing wave covering 70% from
upper-right, poster 2 has organic blob shapes centered, poster 3 has a
diagonal gradient covering 60% from lower-left. Each casts a subtle shadow
on the wall. Small detail: a ceramic vase with one dried pampas stem on the
right side of the foreground shelf.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-poster-grid-3.webp`
- **Priorité :** P3

---

## P4 — Canvas / toiles (priorité moyenne)

> Élimine le packshot 11 KB basse résolution actuel.

### 7. `hm-print-canvas-bureau.webp`

**Brief :** Canvas accroché derrière un bureau créatif (laptop fermé + plante + mug), ambiance lifestyle pro.

```
[Base DA above, BUT change setting to: a clean cream interior wall #F4ECDE
behind a light-oak wooden desk visible in the lower third of the frame.
Camera angle becomes a slight three-quarter shot 15° from the side] +
Subject: one canvas print (60×90cm landscape, stretched on 4cm-thick FSC
light oak wood frame) hanging on the cream wall as the main subject. The
canvas artwork shows the brand gradient as a flowing wave composition,
covering 70% of the canvas surface. On the wooden desk in the foreground
(partially visible, blurred by depth of field): a closed silver-gray laptop,
a small monstera leaf in a ceramic pot (left side), a matte ceramic mug
(right side, partial view). Soft natural daylight from off-screen left
casting gentle directional shadows on the canvas surface and wall.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-canvas-bureau.webp`
- **Priorité :** P4

### 8. `hm-print-canvas-pair-wall.webp`

**Brief :** 2 canvas de tailles différentes sur mur cream, composition asymétrique.

```
[Base DA above, BUT change setting to: a clean cream interior wall #F4ECDE
with a low wooden console table visible in the bottom 20% of the frame.
Camera angle: front-facing slightly off-axis at 5°] + Subject: two canvas
prints of different sizes hanging on the cream wall in an asymmetric
composition: one large canvas (60×90cm landscape) on the left, one smaller
canvas (40×40cm square) on the right placed slightly lower and shifted right.
Both canvases stretched on 4cm-thick FSC light oak wood frames (visible on
the side edges of the right canvas). Each shows a DIFFERENT gradient
composition: large = flowing waves dominant cyan/violet, small = organic
blob shape dominant magenta/violet. Both colors from the strict palette
(cyan #54B6D2, deep violet #3B235A, magenta #C13C8A). Subtle drop shadows
beneath each canvas. Small detail: a single ceramic vase with one dried
pampas stem on the console below the small canvas.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-canvas-pair-wall.webp`
- **Priorité :** P4

---

## P5 — Flyers (priorité plus basse)

> Donne enfin un vrai flyer #2 distinct de l'éventail existant ET de la brochure (qui sera déplacée si tu ouvres une catégorie `brochure` plus tard).

### 9. `hm-print-flyer-stack-portrait.webp`

**Brief :** Pile dense de flyers A5 portrait dépliés (≠ éventail #1), vue 3/4, grain papier visible.

```
[Base DA above, BUT camera angle: 30° downward three-quarter view from the
upper right] + Subject: a tall stack of about 25 A5 portrait flyers
(148×210mm, 170gsm coated paper) neatly piled on the cream tabletop, edges
aligned. The top flyer is the only one with full visibility of its design:
the brand gradient occupies the upper 60% as a flowing wave composition
(cyan #54B6D2 to deep violet #3B235A to magenta #C13C8A), with the lower 40%
white and showing three subtle horizontal grey lines suggesting paragraph
text (illegible). The side of the stack shows the paper thickness with
visible layers. Small detail: one folded paper plane (made from a flyer)
placed at 30° angle in the upper-right corner — single subtle creative cue
referencing diffusion/distribution. Dried wheat stem in lower-left corner.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-flyer-stack-portrait.webp`
- **Priorité :** P5

### 10. `hm-print-flyer-recto-verso.webp`

**Brief :** 2 flyers côte à côte montrant recto + verso d'un même design.

```
[Base DA above] + Subject: two A5 portrait flyers (148×210mm, 170gsm coated
paper) placed side by side on the cream tabletop with a small 8mm gap
between them. Left flyer: front side (recto) showing the brand gradient
covering the upper 60% with a flowing wave, lower 40% white with three
subtle horizontal grey lines (illegible text). Right flyer: back side
(verso) showing a more minimal design — a single cyan circle in upper-right,
and four subtle horizontal grey lines distributed across the page suggesting
contact information layout (illegible). The paper thickness is visible on
the edges. Soft drop shadow under each flyer. Small detail: a black matte
fountain pen placed diagonally between the two flyers, partially visible
in the lower part of the frame. Camera angle: 25° downward.

--ar 4:3 --style raw --quality 2 --stylize 250 --seed 42
```

- **Destination :** `public/images/home/hm-print-flyer-recto-verso.webp`
- **Priorité :** P5

---

## Tableau récap

| # | Mockup | Catégorie | Priorité | Nom de fichier final |
|---|---|---|---|---|
| 1 | Carton plié A6 + enveloppe + ruban | `cards` | **P1** | `hm-print-cards-invitations-folded.webp` |
| 2 | Stack cartes carrées 140×140 + éventail | `cards` | **P1** | `hm-print-cards-invitations-stack.webp` |
| 3 | Macro texture papier carte 350 g/m² | `business-cards` | P2 | `hm-print-cartes-detail-macro.webp` |
| 4 | 3 cartes finitions Mat/Brillant/Coins ronds | `business-cards` | P2 | `hm-print-cartes-trio-finitions.webp` |
| 5 | Poster A3 enroulé + ruban | `poster` | P3 | `hm-print-poster-roll.webp` |
| 6 | 3 affiches galerie expo | `poster` | P3 | `hm-print-poster-grid-3.webp` |
| 7 | Canvas + bureau lifestyle | `canvas` | P4 | `hm-print-canvas-bureau.webp` |
| 8 | 2 canvas asymétriques sur mur | `canvas` | P4 | `hm-print-canvas-pair-wall.webp` |
| 9 | Pile flyers A5 portrait + paper plane | `flyer` | P5 | `hm-print-flyer-stack-portrait.webp` |
| 10 | 2 flyers recto/verso + stylo plume | `flyer` | P5 | `hm-print-flyer-recto-verso.webp` |

**Toutes** dans `public/images/home/` (cohérent avec les 5 photos premium existantes).

---

## Bloc TypeScript final — à intégrer APRÈS validation visuelle utilisateur

> ⚠️ **Ne pas coller maintenant.** Ce bloc est code-ready pour quand les 10 mockups seront générés, validés visuellement, et déposés dans `public/images/home/`.

```typescript
const IMAGE_VARIANTS_BY_CATEGORY: Record<string, string[]> = {
  "business-cards": [
    "/images/home/hm-print-cartes-de-visite.webp",        // existant — stack éditorial top-down
    "/images/home/hm-print-cartes-detail-macro.webp",     // NEW P2 — macro texture papier
    "/images/home/hm-print-cartes-trio-finitions.webp",   // NEW P2 — 3 finitions côte à côte
  ],
  flyer: [
    "/images/home/hm-print-flyers.webp",                  // existant — éventail
    "/images/home/hm-print-flyer-stack-portrait.webp",    // NEW P5 — pile portrait + paper plane
    "/images/home/hm-print-flyer-recto-verso.webp",       // NEW P5 — recto/verso + stylo
  ],
  poster: [
    "/images/home/hm-print-affiches-posters.webp",        // existant — 2 affiches contre mur
    "/images/home/hm-print-poster-roll.webp",             // NEW P3 — poster enroulé + ruban
    "/images/home/hm-print-poster-grid-3.webp",           // NEW P3 — 3 affiches galerie
  ],
  canvas: [
    "/images/home/hm-print-toiles-canvas.webp",           // existant — canvas mur + console
    "/images/home/hm-print-canvas-bureau.webp",           // NEW P4 — canvas lifestyle bureau
    "/images/home/hm-print-canvas-pair-wall.webp",        // NEW P4 — paire asymétrique
  ],
  cards: [
    "/images/home/hm-print-cards-invitations-folded.webp",// NEW P1 — carton plié + enveloppe
    "/images/home/hm-print-cards-invitations-stack.webp", // NEW P1 — stack cartes carrées
    "/images/home/hm-card-print-supports-v2.webp",        // existant — brochure (en 3e pour minimiser doublon)
  ],
};
```

**Effet attendu après intégration :**
- 3 visuels premium par catégorie
- Modulo 3 → alternance large même si Gelato retourne 6 formats
- Plus aucun fallback fournisseur 11-23 KB dans le pool actif
- Catégorie `cards` aura enfin 2 images dédiées invitations (au lieu de 100% doublon)

**Effet sur `STATIC_FALLBACK`** : aucun changement requis. Les fallbacks pointent vers les images existantes #1 de chaque catégorie, donc le rendu V1 (Gelato inactif) reste identique.

---

## Workflow recommandé

1. **Génère P1** (mockups 1 et 2) en premier — la catégorie `cards` est la plus critique
2. **Valide visuellement** chaque image avant de passer à la suivante (cohérence avec les 5 existantes)
3. **Dépose les `.png/.jpg` générés** dans `/Users/kaankaplan/Desktop/Site web hm global agence /` comme d'habitude
4. **Préviens-moi par mockup généré** ("P1.1 fait", "P1.2 fait", etc.) → je convertis en WebP + JPG via `sharp`, je dépose dans `public/images/home/`
5. **Une fois tous les P1 + P2 validés** (4 mockups) → on peut faire une activation partielle de `IMAGE_VARIANTS_BY_CATEGORY` pour ces 2 catégories sans attendre les 6 restantes
6. **Ou attendre les 10 complets** avant le swap atomique du bloc TypeScript

### Si une image échoue (qualité, gestes parasites, palette ratée)

- Re-roll Midjourney (bouton 🔄) plutôt que régénérer un nouveau prompt
- Si re-roll échoue 3 fois : ajuster légèrement le prompt en gardant `--seed 42`
- Si dérive de cohérence visuelle (lumière différente des 5 existantes) : utiliser image-prompt reference avec une des 5 photos validées

---

## Confirmations

- ✅ **Aucune ligne de code modifiée**
- ✅ `app/impression/page.tsx` intact
- ✅ Stripe / Supabase / Gelato API / checkout / textile / admin / supplierMap / catalogue : non concernés
- ✅ Doctrine `docs/image-rights.md` respectée (images HM Global générées sous prompts validés)
- ✅ Conformité `CLAUDE.md` : périmètre strict, pas d'initiative non demandée, prompts comme livrable explicite

---

*Prompts livrés. À toi de générer les images dans l'ordre P1 → P2 → P3 → P4 → P5. Je n'agis pas sur le code tant que tu ne me préviens pas qu'un mockup est validé.*
