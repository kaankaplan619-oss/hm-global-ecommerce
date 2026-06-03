# Prompts Lot 1 — Casser la répétition `/impression`

> **Date :** 2026-05-19
> **Périmètre :** 5 visuels print à générer pour différencier visuellement les cards `business-cards`, `poster`, `flyer/brochures` sur la page `/impression` (et la card "Flyers & brochures" en home).
> **Génération :** Midjourney v6+ / Firefly / DALL·E 3 / GPT-Image. Itérer 3-4 fois, garder la version la plus propre, upscale 1920×1440 min.
> **Référence DA :** voir `docs/prompts/print-mockups-prompts.md` (Meta-prompt § 0 — palette, lumière, exclusions).

---

## 0. Rappel DA — non négociable

Ces règles s'appliquent à TOUS les prompts ci-dessous. **Ne jamais les déroger**, même si le nom de fichier semble suggérer l'inverse.

- **Palette stricte** : cyan `#54B6D2`, violet profond `#3B235A`, magenta `#C13C8A`, fond crème `#F7F3EA` à `#F4ECDE`.
- **Lumière** : naturelle douce, source unique haut-gauche 40-45°, ombres longues douces.
- **Interdits absolus** : ❌ mains, doigts, visages, personnes — ❌ texte lisible / fausses marques / charabia IA — ❌ écrans, devices, UI — ❌ saturation excessive, néons, glitter — ❌ filtres "vintage / polaroid".
- **Style** : photographie produit éditoriale, niveau Aesop / Pentagram / Kinfolk / Architectural Digest. Réalisme matière (grain papier, fibres canvas, plis bois châssis).
- **Ratio** : 4:3 par défaut, 1920×1440 min après upscale.

---

## 1. `carte-visite-tenue.webp`

**Important :** le nom "tenue" signifie ici **tenue debout / inclinée** (orientation verticale, posture éditoriale) — **pas tenue par une main**. La règle no-hands prévaut.

**Brief :** Carte de visite premium debout, légèrement inclinée, appuyée contre un objet éditorial (galet plat foncé OU petit livre fermé OU bloc bois clair). La carte présente le design gradient HM Global sur la face avant. Cadrage rapproché trois-quarts, ouverture faible (mise en valeur de l'objet unique). Casser visuellement le motif "stack à plat" de la card actuelle.

### Prompt EN

```
Premium product photography of a single business card standing upright,
slightly tilted (8° tilt), 85x55mm landscape format, 350gsm matte paper
with subtle rounded corners. The card is leaning against a small editorial
prop: a flat dark river stone (charcoal grey, matte finish) OR a small
closed hardcover notebook in deep violet linen. The visible face features
an abstract gradient design — flowing wave shapes in cyan #54B6D2, deep
violet #3B235A and magenta #C13C8A, covering 65% of the card, white space
on the lower third. Subtle paper edge thickness visible on the right side
of the card (showing 350gsm weight). Background: warm natural beige fabric
(#EFE7DA) with very soft texture, deliberately out of focus (depth of field
shallow, f/2.8 feel). Single dried botanical sprig (eucalyptus or wheat)
softly blurred in the upper-right corner. Soft natural light from upper
left at 45°, gentle directional shadow on the right side of the card.
Camera angle: three-quarter view, 15° rotation, slight 10° downward tilt.
No hands, no fingers, no people, no devices, no readable text, no fake
brand names, no logos. Editorial catalog style, Aesop / Pentagram quality,
shot on Hasselblad medium format, photorealistic, sharp focus on the card,
subtle film grain.

--ar 4:3 --style raw --quality 2 --stylize 250 --no hands, --no people,
--no text, --no letters
```

### Prompt FR

```
Photographie produit éditoriale premium. Une seule carte de visite debout,
légèrement inclinée (8°), format 85×55mm paysage, papier mat 350g/m² coins
arrondis discrets. La carte est appuyée contre un objet déco minimaliste :
au choix un galet plat anthracite mat OU un petit carnet relié toile violet
profond. La face visible présente le design gradient HM Global : vagues
fluides cyan #54B6D2 → violet profond #3B235A → magenta #C13C8A sur 65%
de la surface, tiers inférieur blanc. Tranche du papier 350g/m² subtilement
visible sur le bord droit. Décor : tissu beige naturel chaud (#EFE7DA) en
arrière-plan, légèrement flou (f/2.8), brin de gypsophile ou eucalyptus
séché flou en haut à droite. Lumière naturelle douce 45° haut-gauche,
ombre directionnelle douce à droite de la carte. Angle caméra trois-quarts,
rotation 15°, plongée légère 10°. AUCUNE main, AUCUN doigt, AUCUNE personne,
AUCUN écran, AUCUN texte lisible, AUCUNE marque. Style éditorial type
Aesop / Pentagram, hyperréaliste, grain film léger. Ratio 4:3, 1600×1200
minimum.
```

### Paramètres

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250 --no hands --no text`
- DALL·E 3 : "single business card standing upright leaning against stone, editorial, no hands"
- Firefly : Content Type "Photo", Style "Studio light", Camera "Three-quarter"

### Destination projet

`public/mockups/print/business-card/carte-visite-tenue.webp` (+ `.jpg` fallback)

---

## 2. `carte-visite-stack-ficelle.webp`

**Brief :** Stack de cartes de visite ceinturé par une ficelle naturelle (lin / jute brut), nœud simple visible. Vue top-down zénithale (flat lay éditorial). Objet artisanal premium — casse le rendu "catalogue print" en suggérant un set offert / petit batch.

### Prompt EN

```
Premium top-down flat lay product photography (zenithal, 90° camera).
A neat stack of approximately 25 business cards, 85x55mm landscape format,
350gsm matte finish with rounded corners. The stack is wrapped and tied
with a single natural jute or raw linen twine (3mm thick, warm beige color),
crossing the stack once horizontally with a small clean knot visible on
the upper-right corner of the bundle. The top card features an abstract
gradient design: flowing organic waves in cyan #54B6D2, deep violet
#3B235A, magenta #C13C8A, covering 60% of the card surface, lower portion
white. Visible card edge thickness on the side of the stack shows the
volume (about 8mm tall). Background: warm matte beige paper or fabric
(#F4ECDE), subtle natural texture (slight grain), single small olive
branch sprig placed naturally in the lower-left corner. Soft natural
window light from upper left at 40°, gentle ambient shadow under the stack.
Camera: 90° top-down, perfectly orthogonal, sharp focus across the entire
stack. Editorial flat lay style, Kinfolk / Cereal Magazine aesthetic.
No hands, no fingers, no people, no devices, no readable text, no logos.

--ar 4:3 --style raw --quality 2 --stylize 250 --no hands, --no people,
--no text
```

### Prompt FR

```
Photographie produit éditoriale premium, vue zénithale top-down (caméra 90°).
Une pile nette d'environ 25 cartes de visite (85×55mm paysage, papier mat
350g/m² coins arrondis), ceinturée par une ficelle naturelle (jute brut
ou lin grège, 3mm d'épaisseur, ton beige chaud), un seul tour horizontal
avec petit nœud propre visible en haut à droite. La carte du dessus porte
le design gradient HM Global : vagues organiques fluides cyan #54B6D2 →
violet profond #3B235A → magenta #C13C8A sur 60% de la surface, partie
basse blanche. Tranche cumulée du papier 350g/m² visible sur le côté
(volume ~8mm). Décor : papier ou tissu beige mat chaud (#F4ECDE) avec
légère texture naturelle, une petite branche d'olivier discrète posée en
bas à gauche. Lumière naturelle de fenêtre 40° haut-gauche, ombre
ambiante douce sous la pile. Caméra 90° top-down, parfaitement orthogonale,
mise au point nette sur toute la pile. Style flat lay éditorial type
Kinfolk / Cereal Magazine. AUCUNE main, AUCUN doigt, AUCUNE personne,
AUCUN texte lisible, AUCUNE marque. Ratio 4:3, hyperréaliste.
```

### Paramètres

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250 --no hands --no text`
- DALL·E 3 : "stack of business cards tied with natural jute twine, top-down flat lay, editorial"
- Firefly : Content Type "Photo", Camera "Top-down", Lighting "Soft natural"

### Destination projet

`public/mockups/print/business-card/carte-visite-stack-ficelle.webp` (+ `.jpg` fallback)

---

## 3. `affiche-horizontale.webp`

**Brief :** Une affiche format horizontal (70×50 cm paysage, ratio ~1.4:1) encadrée dans un cadre fin chêne clair ou laiton brossé, accrochée seule sur un mur blanc cassé / crème. Vue de face légèrement décalée (3° latéral) pour donner du volume sans renvoyer de reflet parasite. Le visuel intérieur porte un grand gradient HM Global en composition horizontale.

### Prompt EN

```
Premium interior photography of a single large format poster horizontally
oriented, displayed in a thin minimalist frame on a warm off-white wall
(#F1ECDF). Poster format: 70x50cm landscape (1.4:1 ratio), printed on
200gsm uncoated paper visible through the matte (no glass reflection).
Frame: thin 1.5cm light oak wood OR brushed brass, very minimal, no
ornaments. The poster artwork: large abstract horizontal gradient
composition — flowing organic waves and soft blob shapes in cyan #54B6D2,
deep violet #3B235A, magenta #C13C8A, with composition emphasizing
horizontal flow (left to right), 75% surface coverage, 25% white margin.
The frame is slightly rotated 3° on the vertical axis to suggest dimension
without specular reflection. Foreground: warm wooden console table or
shelf partially visible at the bottom, with a single small ceramic vase
holding a dried palm leaf on the right side. Soft natural window light
from the left at 30°, casting a gentle drop shadow of the frame on the
wall to the right. Camera: eye-level, perfectly straight, three-quarter
view. Editorial interior design style, Architectural Digest / Cereal
Magazine aesthetic. No people, no hands, no devices, no readable text,
no fake brand names.

--ar 4:3 --style raw --quality 2 --stylize 250 --no hands, --no people,
--no text
```

### Prompt FR

```
Photographie d'intérieur éditoriale premium. Une affiche grand format
horizontale (70×50cm paysage, ratio 1.4:1, papier 200g/m² non couché)
encadrée dans un cadre fin minimaliste (1,5cm chêne clair OU laiton
brossé, aucun ornement), accrochée seule sur un mur blanc cassé chaud
(#F1ECDF). Visuel intérieur : grande composition gradient horizontale
HM Global — vagues fluides et blobs organiques cyan #54B6D2 → violet
profond #3B235A → magenta #C13C8A, composition emphasant le flux
horizontal gauche-droite, 75% de la surface, 25% marges blanches. Cadre
légèrement tourné 3° sur l'axe vertical pour donner du volume sans
reflet parasite. Premier plan : console ou étagère bois chaud partiellement
visible en bas, petit vase céramique avec feuille de palmier séchée sur
la droite. Lumière naturelle de fenêtre 30° gauche, ombre portée douce
du cadre sur le mur à droite. Caméra niveau yeux, parfaitement droite,
vue trois-quarts. AUCUNE personne, AUCUNE main, AUCUN écran, AUCUN texte
lisible, AUCUNE marque. Style éditorial type Architectural Digest /
Cereal Magazine. Ratio 4:3, hyperréaliste.
```

### Paramètres

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250 --no hands --no text`
- DALL·E 3 : "framed horizontal poster on cream wall, minimalist interior, editorial"
- Firefly : Content Type "Photo", Camera "Straight on", Lighting "Side natural"

### Destination projet

`public/mockups/print/affiche/affiche-horizontale.webp` (+ `.jpg` fallback)

---

## 4. `affiche-roulee.webp`

**Brief :** Une affiche grand format roulée en cylindre vertical, posée debout (légèrement adossée) contre un mur crème. Le rouleau laisse voir le bord intérieur du papier (gradient HM visible sur la tranche enroulée). Suggère le moment "livraison" / "transport" — diffère radicalement du cadre accroché.

### Prompt EN

```
Premium product photography of a single large format poster rolled into
a vertical cylinder, standing upright leaning very slightly (5° angle)
against a warm off-white wall (#F1ECDF). The roll is approximately 60cm
tall, 5cm diameter, made of 200gsm uncoated paper. The roll is NOT tied
with anything (no rubber band, no ribbon) — just naturally curled, edge
loose enough to reveal the inner side of the paper showing a glimpse of
the printed artwork: visible gradient pattern in cyan #54B6D2, deep
violet #3B235A, magenta #C13C8A, peeking through the open seam vertically.
The outer side of the roll is the white back of the paper (subtle paper
texture). The roll sits on a warm light oak wooden floor with subtle wood
grain texture, casting a gentle shadow on the floor and against the wall.
Foreground: completely uncluttered (no other props besides the roll itself).
Soft natural window light from upper-left at 35°, gentle directional
lighting that catches the curl of the paper. Camera: eye-level, three-
quarter front view, sharp focus on the entire roll. Editorial product
photography, Kinfolk / Apartamento magazine aesthetic. No people, no hands,
no devices, no readable text, no fake brand names.

--ar 4:3 --style raw --quality 2 --stylize 250 --no hands, --no people,
--no text
```

### Prompt FR

```
Photographie produit éditoriale premium. Une affiche grand format roulée
en cylindre vertical, debout légèrement adossée (5°) contre un mur blanc
cassé chaud (#F1ECDF). Rouleau d'environ 60cm de haut, 5cm de diamètre,
papier 200g/m² non couché. Rouleau **non attaché** (pas d'élastique,
pas de ruban) — simplement enroulé naturellement, le bord intérieur
légèrement ouvert laisse entrevoir l'intérieur imprimé : motif gradient
HM Global apparaît verticalement sur la fente ouverte, cyan #54B6D2 →
violet profond #3B235A → magenta #C13C8A. Côté extérieur du rouleau : dos
blanc du papier, texture papier subtile. Le rouleau repose sur un parquet
chêne clair texturé, ombre douce au sol et contre le mur. Premier plan
totalement épuré (aucun autre objet). Lumière naturelle de fenêtre
35° haut-gauche, accroche directionnelle douce sur la courbure du papier.
Caméra niveau yeux, vue trois-quarts de face, mise au point nette sur
tout le rouleau. AUCUNE personne, AUCUNE main, AUCUN écran, AUCUN texte
lisible, AUCUNE marque. Style éditorial type Kinfolk / Apartamento.
Ratio 4:3, hyperréaliste.
```

### Paramètres

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250 --no hands --no text`
- DALL·E 3 : "rolled poster cylinder standing against cream wall, no ribbon, editorial"
- Firefly : Content Type "Photo", Camera "Three-quarter"

### Destination projet

`public/mockups/print/affiche/affiche-roulee.webp` (+ `.jpg` fallback)

---

## 5. `hm-print-brochures.webp`

**Brief :** Brochure 3 volets (leaflet / dépliant tri-fold), format A4 paysage déplié → A4/3 fermé, **entièrement ouverte à plat** sur une table beige. Une seconde brochure fermée à côté pour montrer la couverture. Vue top-down zénithale 90°. Différent du visuel "magazine A4 ouverte double page" du doc original.

### Prompt EN

```
Premium top-down flat lay product photography (zenithal, 90° camera).
A tri-fold brochure (leaflet) fully unfolded flat, A4 landscape format
when open (297×210mm), making three vertical panels of equal width.
Paper: 170gsm coated silk, slight matte finish, visible fold creases
between panels. The interior layout: left panel features a large abstract
gradient artwork (organic waves in cyan #54B6D2 covering 80% of the panel,
white margin); middle panel has subtle horizontal lines suggesting
illegible body text (abstract typography placeholders, NO real letters);
right panel features another gradient composition (deep violet #3B235A
flowing into magenta #C13C8A, organic blob shape covering 70% of the
panel). A second tri-fold brochure is placed closed beside it (folded
state, single-panel A4/3 visible), showing the front cover: minimalist
design with gradient pattern in the upper third only, rest pure white,
no text. Background: warm matte beige tabletop (#F4ECDE), subtle natural
texture. Single small ceramic dish with a single sprig of dried wheat
placed naturally in the lower-right corner. Soft natural light from
upper-left at 40°, very gentle ambient shadows. Camera: 90° top-down,
perfectly orthogonal, sharp focus across both brochures. Editorial
catalog style, Aesop / Pentagram quality. No hands, no fingers, no
people, no devices, no readable text, no fake brand names.

--ar 4:3 --style raw --quality 2 --stylize 250 --no hands, --no people,
--no text
```

### Prompt FR

```
Photographie produit éditoriale premium, vue zénithale top-down (caméra 90°).
Une brochure 3 volets (dépliant tri-fold) entièrement ouverte à plat,
format A4 paysage déplié (297×210mm), trois panneaux verticaux d'égale
largeur. Papier 170g/m² couché satiné, plis verticaux visibles entre les
panneaux. Composition intérieure : panneau gauche grand visuel gradient
abstrait (vagues organiques cyan #54B6D2 sur 80% du panneau, marge
blanche) ; panneau central lignes horizontales discrètes suggérant des
paragraphes (typographie placeholder abstraite, AUCUNE lettre lisible) ;
panneau droit autre composition gradient (violet profond #3B235A → magenta
#C13C8A, blob organique sur 70% du panneau). Une seconde brochure tri-fold
fermée posée à côté (état plié, un seul panneau A4/3 visible), couverture
minimaliste : motif gradient sur le tiers supérieur uniquement, reste blanc,
aucun texte. Décor : table beige mate chaude (#F4ECDE) texture naturelle
discrète, une petite coupelle céramique avec un brin de blé séché en bas à
droite. Lumière naturelle douce 40° haut-gauche, ombres ambiantes très
douces. Caméra 90° top-down parfaitement orthogonale, mise au point nette
sur les deux brochures. Style éditorial type Aesop / Pentagram. AUCUNE
main, AUCUN doigt, AUCUNE personne, AUCUN texte lisible, AUCUNE marque.
Ratio 4:3, hyperréaliste.
```

### Paramètres

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250 --no hands --no text`
- DALL·E 3 : "tri-fold brochure unfolded flat on beige table, top-down flat lay, no text"
- Firefly : Content Type "Photo", Camera "Top-down"

### Destination projet

`public/images/home/hm-print-brochures.webp` (+ `.jpg` fallback)

---

## Récapitulatif chemins de destination

| # | Fichier final | Chemin exact |
|---|---|---|
| 1 | `carte-visite-tenue.webp` (+ `.jpg`) | `public/mockups/print/business-card/` |
| 2 | `carte-visite-stack-ficelle.webp` (+ `.jpg`) | `public/mockups/print/business-card/` |
| 3 | `affiche-horizontale.webp` (+ `.jpg`) | `public/mockups/print/affiche/` |
| 4 | `affiche-roulee.webp` (+ `.jpg`) | `public/mockups/print/affiche/` |
| 5 | `hm-print-brochures.webp` (+ `.jpg`) | `public/images/home/` |

> ⚠️ Le dossier `public/mockups/print/affiche/` n'existe peut-être pas encore — sera créé lors de la mission d'intégration.

---

## Fichiers qui seront modifiés après génération (mission d'intégration future)

### A. `app/impression/page.tsx` — STATIC_FALLBACK (lignes ~80-121)

Diversifier les images par famille pour casser la répétition actuelle.

```diff
  "business-cards": {
-   image:   "/images/home/hm-print-cartes-de-visite.webp",
+   image:   "/mockups/print/business-card/carte-visite-tenue.webp",
    family:  "business-cards",
    ...
  },
  poster: {
-   image:   "/images/home/hm-print-affiches-posters.webp",
+   image:   "/mockups/print/affiche/affiche-horizontale.webp",
    family:  "poster",
    ...
  },
  cards: {
-   image:   "/images/home/hm-print-cartes-de-visite.webp",
+   image:   "/mockups/print/business-card/carte-visite-stack-ficelle.webp",
    family:  "cards",
    ...
  },
```

> `flyer` et `canvas` restent inchangés sur cette mission (Lot 2 plus tard).

### B. `components/home/HomeVisualShowcase.tsx` — card "Flyers & brochures" (ligne ~55)

```diff
  {
    icon:  FileText,
    label: "Flyers & brochures",
    line:  "A4, A5 · 170 g/m² couché · Recto ou recto-verso",
-   image: "/images/home/hm-print-flyers.webp",
+   image: "/images/home/hm-print-brochures.webp",
    ...
  },
```

> Rationale : la nouvelle photo "brochure 3 volets dépliée" représente mieux la promesse "Flyers & brochures" que le flyer A5 actuel, qui pourra alimenter Lot 2 sur une éventuelle 5ᵉ card.

### C. (optionnel) `app/impression/page.tsx` — fallback `poster.image` secondaire

Si on veut faire tourner `affiche-horizontale` et `affiche-roulee` côté `/impression`, on peut envisager soit :
- Ajouter une catégorie `poster-roule` séparée (non recommandé — alourdit la page)
- Garder `affiche-horizontale` comme image principale `poster`, et utiliser `affiche-roulee` sur une future section "transport / livraison" en home.

Décision à valider à la mission d'intégration.

---

## Plan de test visuel (après intégration)

Toutes les étapes utilisent Chrome MCP (`mcp__claude-in-chrome__*`) ou Playwright sur le dev server local + production Vercel.

### 1. Build local

```
npm run dev
```

Ouvrir `http://localhost:3000/impression` et `http://localhost:3000/`.

### 2. Screenshots avant / après

- **Avant** : capturer l'état actuel des deux pages (`/impression` + `/`) pour preuve de répétition.
- **Après** : capturer le nouvel état pour valider la rupture visuelle.

### 3. Checklist `/impression`

- [ ] Card "Cartes de visite" → image `carte-visite-tenue.webp` (carte debout)
- [ ] Card "Affiches & posters" → image `affiche-horizontale.webp` (cadre mur)
- [ ] Card "Cartes & invitations" → image `carte-visite-stack-ficelle.webp` (stack ficelle)
- [ ] Card "Flyers" → image inchangée (`hm-print-flyers.webp`)
- [ ] Card "Toiles canvas" → image inchangée (`hm-print-toiles-canvas.webp`)
- [ ] Aucune card ne partage le même visuel
- [ ] Aspect ratio 4:3 respecté, pas de stretch
- [ ] Couleurs HM Global cohérentes (cyan / violet / magenta)
- [ ] Pas de texte parasite généré par IA visible
- [ ] Pas de main / doigt / visage visible

### 4. Checklist home `/`

- [ ] Section `HomeVisualShowcase` :
  - [ ] Card "Cartes de visite" → `carte-visite-premium.webp` (inchangé, contain)
  - [ ] Card "Flyers & brochures" → `hm-print-brochures.webp` (NOUVEAU)
  - [ ] Card "Affiches & posters" → `hm-print-affiches-posters.webp` (inchangé)
  - [ ] Card "Toiles canvas" → `hm-print-toiles-canvas.webp` (inchangé)

### 5. Responsive

- [ ] Mobile 375px : images crop propre, aucune coupure de zone clé
- [ ] Tablette 768px : grille 2 cols cohérente
- [ ] Desktop 1280px+ : grille 4 cols (`/impression` 5 cards, home 4 cards)

### 6. Performance

- [ ] `next/image` charge bien les nouvelles `.webp`
- [ ] `onError` ne se déclenche pas (sinon = fichier manquant)
- [ ] Pas de warning console
- [ ] LCP `/impression` < 2.5s (mesure Lighthouse)

### 7. Production

Après merge PR sur main :
- [ ] Vercel deploy READY
- [ ] Tester `https://hm-global.vercel.app/impression` et `/`
- [ ] Re-valider les screenshots après / avant

---

## Workflow recommandé (côté Kaan)

1. **Générer les 5 images** un par un sur Midjourney v6 ou Firefly (prompts EN recommandés, FR en backup pour GPT-Image).
2. **Itérer 3-4 fois par prompt**, garder la version la plus propre (zéro texte parasite, zéro main, palette respectée).
3. **Upscale 1920×1440** minimum (bouton Upscale Midjourney, ou "high quality" GPT).
4. **Déposer les 5 fichiers PNG/JPG** sur `~/Desktop/Site web hm global agence/lot1/` (ou équivalent).
5. **Prévenir Claude Code** → mission d'intégration :
   - Conversion `.webp` + `.jpg` via `sharp` (qualité 85, métadonnées strippées)
   - Placement dans les chemins exacts du tableau ci-dessus
   - Édition `app/impression/page.tsx` + `components/home/HomeVisualShowcase.tsx` selon les diffs
   - Branche dédiée `feat/print-lot1-images`
   - PR + revue visuelle Chrome MCP avant merge

---

*Fin du brief Lot 1. Une fois les 5 visuels validés, mission d'intégration estimée 15-20 min (conversion + placement + édition + PR).*
