# Prompts de génération — Visuels print HM Global

> **Date :** 2026-05-18
> **Cible :** 5 visuels print premium à générer (via ChatGPT GPT-Image / Midjourney v6+ / Adobe Firefly / DALL·E 3) puis intégrer dans `/public/images/home/` et `/public/mockups/print/hm/`.
> **Usage :** copier le prompt dans l'outil de ton choix. Garder les paramètres recommandés. Itérer 3-4 fois et garder la version la plus propre.

---

## 0. Meta-prompt — DA HM Global à respecter sur TOUS les visuels

Ces règles s'appliquent à chaque génération. Si l'outil le permet, les ajouter en "system prompt" ou les copier en tête de chaque demande.

### Palette officielle (à mentionner explicitement)

| Couleur | Hex | Usage sur le support |
|---|---|---|
| Cyan clair | `#6EC7DD` | Touche dynamique, début de gradient |
| Cyan | `#54B6D2` | Accent moderne |
| Violet profond | `#3B235A` | Sérieux, structure, accent foncé |
| Violet | `#4B2A6F` | Variation violet |
| Magenta | `#C13C8A` | Accent créatif, fin de gradient |
| Magenta bright | `#D64A9A` | Highlight |
| Crème | `#F7F3EA` | Fond neutre chaud |
| Blanc chaud | `#FFFDF8` | Fond surface |

### Direction artistique commune

- **Style** : photographie produit éditoriale premium, agence de communication B2B, niveau Pentagram / Aesop / Apple keynote / Behance top 5%
- **Lumière** : naturelle douce, source unique haut-gauche (45°), ombres douces longues
- **Fond** : surface mate beige naturel (`#EFE7DA` à `#F4ECDE`) OU table en bois clair OU mur blanc cassé. **JAMAIS de fond gradient saturé ou de scène fictive**
- **Caméra** : angle légèrement plongeant 15-25° pour donner de la profondeur, OU top-down (vue zénithale) pour les flat lays
- **Cadrage** : produit occupe 60-80% du cadre, marges respirantes, règle des tiers respectée
- **Branding sur le produit** : motif gradient cyan→violet→magenta (smooth waves, blobs, abstract shapes). **JAMAIS de texte lisible** — éviter les fausses marques, faux noms, faux texte décoratif qui distrait

### À ÉVITER absolument

- ❌ Mains de mannequins, visages, personnes
- ❌ Faux ordinateurs, écrans avec UI fictive
- ❌ Polices kitsch, lettrage script, calligraphie
- ❌ Logos de marques tierces reconnaissables (Apple, Nike, Coca-Cola, etc.)
- ❌ Effet "AI watermark", "stock photo", "Adobe Stock"
- ❌ Saturation excessive, néons, glitter, particules
- ❌ Texte illisible / charabia généré par IA
- ❌ Fonds gradient saturés (sauf sur les supports eux-mêmes)
- ❌ Composition centrée trop symétrique (donne effet template)
- ❌ Filtres "vintage", "polaroid", "filter Instagram"

### Sortie attendue

- **Format** : 1600×1200 px minimum (4:3) ou 1920×1080 (16:9 selon support)
- **Export** : sauvegarder en PNG ou JPG haute qualité, puis convertir en WebP via le projet
- **Itérations** : générer 4 variations, garder la plus propre

---

## 1. Cartes de visite — `hm-print-cartes-de-visite.webp`

**Brief :** Stack de cartes de visite premium 350 g/m² posé sur table créative, avec une carte du dessus dont le design met en valeur la palette HM Global. Vue 30° légèrement plongeante. Une 2e carte tournée sur le côté pour montrer le verso.

### Prompt EN (Midjourney / Firefly / DALL·E 3)

```
Premium product photography of a stack of business cards on a warm natural
beige fabric or matte paper surface (#EFE7DA). About 20 cards stacked neatly,
85x55mm landscape format, 350gsm matte finish with subtle rounded corners
visible on top card. The top card features an abstract smooth gradient design:
cyan (#54B6D2) flowing into deep violet (#3B235A) flowing into magenta
(#C13C8A) — wave or blob shape covering 60% of the card surface, leaving
white space on the rest. One additional card placed beside the stack, tilted
slightly to show the back side with a minimalist single cyan circle.
Background: soft natural beige texture, dried botanical sprig in upper left
corner adding warmth. Soft natural light from upper left at 45°, gentle long
shadow on right side of stack. Camera angle 25° downward. No people, no hands,
no devices, no readable text or fake brand names. Professional editorial
catalog style like Aesop, Pentagram, Apple keynote. Photorealistic, sharp
focus on the top card, slight depth of field. Color palette must be exactly:
cyan #54B6D2, deep violet #3B235A, magenta #C13C8A on cream #F7F3EA
background.

--ar 4:3 --style raw --quality 2 --stylize 250
```

### Prompt FR (pour ChatGPT GPT-Image)

```
Photographie produit éditoriale premium. Une pile d'environ 20 cartes de
visite (85×55mm format paysage, papier 350g/m² mat) posée sur une surface
beige naturel chaud. La carte du dessus porte un design abstrait gradient
HM Global : vague fluide cyan #54B6D2 → violet profond #3B235A → magenta
#C13C8A occupant 60% de la surface, le reste en blanc. Une seconde carte
posée à côté inclinée légèrement pour montrer le verso (un seul petit cercle
cyan minimaliste). Décor : surface beige texturée, un petit brin de gypsophile
sec en haut à gauche, lumière naturelle douce 45° haut-gauche, ombre longue
sur la droite. Angle caméra légèrement plongeant 25°, profondeur de champ
subtile. Style éditorial type Aesop ou Pentagram. Aucune personne, aucune
main, aucun écran, aucun texte lisible, aucun nom de marque. Ratio 4:3,
résolution minimum 1600×1200, hyperréaliste.
```

### Paramètres recommandés

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250`
- DALL·E 3 / ChatGPT : "high quality, photorealistic, 4:3 ratio"
- Firefly : Content Type "Photo", Style "Studio light"

### Destination dans le projet

`public/images/home/hm-print-cartes-de-visite.webp` (et `.jpg` fallback)
→ Remplacera l'image actuelle de la card "Cartes de visite" dans `HomeVisualShowcase`.

---

## 2. Flyers — `hm-print-flyers.webp`

**Brief :** Flyer A5 ou A4 posé en éventail sur table naturelle, avec design gradient cyan→violet→magenta sur la moitié haute. Une feuille tenue légèrement relevée pour donner de la profondeur. Pile de feuilles en arrière-plan.

### Prompt EN

```
Premium product photography of a fanned stack of marketing flyers on a warm
matte cream surface (#F4ECDE). About 6 flyers in A5 portrait format (148x210mm),
170gsm coated paper, slightly fanned out from a central stack. The top flyer
features an abstract gradient design in the upper half: smooth flowing waves
of cyan #54B6D2, deep violet #3B235A, and magenta #C13C8A, covering 50% of
the flyer surface with organic blob shapes. The lower half remains white with
subtle horizontal lines suggesting paragraph text (illegible, no real text).
One flyer slightly lifted at a corner showing thickness of the paper. Soft
natural window light from upper left at 40°, casting gentle directional
shadows. Camera angle 25° downward, capturing the elegant fan layout. Background:
warm cream tabletop with subtle linen texture, single dried wheat stem in
upper right corner for warmth. Color must be exactly: cyan #54B6D2, violet
#3B235A, magenta #C13C8A. No people, no hands, no devices, no readable text,
no fake brand names. Editorial catalog style, Aesop / Pentagram aesthetic.

--ar 4:3 --style raw --quality 2 --stylize 250
```

### Prompt FR

```
Photographie produit éditoriale premium. Six flyers A5 portrait (148×210mm,
papier couché 170g/m²) disposés en éventail à partir d'une pile centrale,
sur une surface mate crème naturelle. Le flyer du dessus présente un design
gradient HM Global : vagues abstraites cyan #54B6D2 → violet profond #3B235A
→ magenta #C13C8A sur la moitié supérieure (50% de la surface), moitié basse
en blanc avec lignes horizontales discrètes suggérant des paragraphes
(illisibles). Un flyer légèrement soulevé à un coin pour montrer l'épaisseur.
Lumière naturelle douce 40° haut-gauche, ombres directionnelles douces.
Angle caméra plongeant 25°. Décor : table crème texture lin, brin de blé
séché en haut à droite. Aucune personne, aucune main, aucun écran, aucun
texte lisible, aucune marque. Style éditorial type Aesop / Pentagram. Ratio
4:3, hyperréaliste, 1600×1200 minimum.
```

### Paramètres recommandés

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250`
- DALL·E 3 : "fanned stack of marketing flyers, editorial photography, 4:3"
- Firefly : Content Type "Photo", Lighting "Soft natural"

### Destination

`public/images/home/hm-print-flyers.webp` (+ `.jpg` fallback)
→ Remplacera la card "Flyers & brochures" dans `HomeVisualShowcase`.

---

## 3. Brochures — `hm-print-brochures.webp`

**Brief :** Brochure A4 ouverte sur 2 pages (double page intérieure) avec design gradient HM sur la page de droite + une 2e brochure fermée à côté pour montrer la couverture. Style "design éditorial agence".

### Prompt EN

```
Premium product photography of an open A4 magazine-style brochure laid flat
on a warm cream tabletop (#F4ECDE). The brochure is opened to show a double
page spread: left page is mostly white with subtle horizontal text lines
suggesting paragraphs (illegible, abstract), right page features a large
abstract gradient artwork covering the entire page — flowing waves of cyan
#54B6D2, deep violet #3B235A, and magenta #C13C8A, organic blob shapes with
soft transitions. Paper feels premium 200gsm coated silk finish, subtle paper
shadow at the spine fold. A second brochure is placed closed beside it,
showing the front cover: minimalist design with the gradient pattern in the
upper third, white space below, no readable text. Soft natural light from
upper left at 45°. Camera angle 30° downward showing both brochures clearly.
Background: clean warm cream surface, single small concrete tray with a
fountain pen placed in lower left corner for editorial context. Color palette
strict: cyan #54B6D2, violet #3B235A, magenta #C13C8A on cream #F7F3EA. No
people, no hands, no devices, no readable text, no fake brands. Editorial
catalog photography, Aesop / Pentagram quality.

--ar 4:3 --style raw --quality 2 --stylize 250
```

### Prompt FR

```
Photographie produit éditoriale premium. Une brochure A4 ouverte à plat sur
double page : page de gauche blanche avec lignes horizontales discrètes
suggérant des paragraphes (illisibles), page de droite couverte d'un grand
visuel gradient HM Global — vagues fluides cyan #54B6D2 → violet profond
#3B235A → magenta #C13C8A, blobs organiques transitions douces. Papier
200g/m² couché satiné, ombre subtile au pli central. Une seconde brochure
fermée à côté, couverture minimaliste avec motif gradient sur le tiers
supérieur, reste blanc. Décor : table crème mate, petit bac en béton avec
stylo plume en bas à gauche. Lumière naturelle 45° haut-gauche, angle caméra
plongeant 30°. Aucune personne, aucune main, aucun écran, aucun texte
lisible, aucune marque. Style éditorial type Aesop. Ratio 4:3, hyperréaliste.
```

### Paramètres recommandés

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250`
- DALL·E 3 : "open magazine brochure double page spread, premium editorial"
- Firefly : Content Type "Photo", Camera Angle "High angle"

### Destination

`public/images/home/hm-print-brochures.webp` (+ `.jpg` fallback)
→ Card potentielle "Brochures & magazines" si on ajoute une 5e card print, ou variante de "Flyers & brochures".

---

## 4. Affiches & posters — `hm-print-affiches-posters.webp`

**Brief :** 2 affiches grand format (A3 ou 50×70 cm) posées debout contre un mur clair, l'une de face avec design gradient HM, l'autre légèrement en retrait. Lumière de fenêtre pour donner du volume.

### Prompt EN

```
Premium product photography of two large format posters propped against a
warm cream wall (#F4ECDE). Front poster: 50x70cm vertical format, 200gsm
uncoated paper, full page abstract gradient artwork — flowing organic waves
of cyan #54B6D2 transitioning into deep violet #3B235A then into magenta
#C13C8A, taking 80% of the surface with white margins. Behind it, a second
poster slightly offset to the left, partially visible, showing a different
gradient composition (more violet-dominant) — same color family, different
shape. Both posters are slightly leaned against the wall (5° tilt), casting
gentle shadows on the wall. Foreground: cream tabletop / shelf, single
ceramic vase with dried botanical stem on the right side for warmth. Soft
natural window light from the left at 30°, creating directional volume and
gentle highlights on the paper surface. Camera angle slightly low (20° upward)
to emphasize poster scale. Color palette strict: cyan #54B6D2, violet #3B235A,
magenta #C13C8A on cream wall. No people, no hands, no devices, no readable
text, no fake brand names. Editorial poster series presentation, Pentagram
quality.

--ar 4:3 --style raw --quality 2 --stylize 250
```

### Prompt FR

```
Photographie produit éditoriale premium. Deux affiches grand format (50×70cm
vertical, papier 200g/m² non couché) posées debout contre un mur crème chaud,
légèrement inclinées (5°). Affiche de devant : visuel gradient HM Global
plein cadre — vagues organiques fluides cyan #54B6D2 → violet profond #3B235A
→ magenta #C13C8A, 80% de la surface, marges blanches. Deuxième affiche
décalée à gauche derrière, partiellement visible, composition gradient
différente (plus violette). Décor : étagère/table crème en premier plan,
vase céramique avec brindille séchée à droite. Lumière naturelle douce 30°
gauche, volume directionnel, ombres sur le mur. Angle caméra légèrement en
contre-plongée (20° vers le haut) pour donner l'échelle. Aucune personne,
aucune main, aucun écran, aucun texte lisible. Style éditorial type Pentagram.
Ratio 4:3, hyperréaliste.
```

### Paramètres recommandés

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250`
- DALL·E 3 : "two large posters leaning against cream wall, editorial display"
- Firefly : Content Type "Photo", Lighting "Side light", Camera "Low angle"

### Destination

`public/images/home/hm-print-affiches-posters.webp` (+ `.jpg` fallback)
→ Remplacera la card "Affiches & posters" dans `HomeVisualShowcase`.

---

## 5. Toiles canvas — `hm-print-toiles-canvas.webp`

**Brief :** Toile canvas tendue sur châssis bois FSC, accrochée à un mur clair dans un intérieur épuré, avec design abstrait HM Global. Cadrage 3/4 pour montrer l'épaisseur du châssis.

### Prompt EN

```
Premium interior photography of a canvas print hanging on a clean cream wall
(#F4ECDE) in a minimalist modern office or living room. Canvas size 60x90cm
landscape, stretched on a 4cm thick FSC wood frame (light oak visible on the
sides). Canvas artwork: large abstract gradient composition — smooth flowing
waves and organic blob shapes in cyan #54B6D2, deep violet #3B235A, and
magenta #C13C8A, with soft transitions and 70% color coverage, 30% white
canvas showing through. The canvas hangs straight, casting a subtle drop
shadow on the wall below. Three-quarter angle (15° from the side) revealing
the wooden frame thickness on the right edge. Foreground partially visible:
small wooden console table with a single ceramic vase containing dried
pampas grass, suggesting interior decoration. Soft natural daylight from a
window off-screen left, creating gentle highlights on the canvas surface and
warm shadows. No people, no hands, no devices, no readable text, no fake
brand names. Color palette strict: cyan #54B6D2, violet #3B235A, magenta
#C13C8A. Editorial interior design photography, Architectural Digest quality.

--ar 4:3 --style raw --quality 2 --stylize 250
```

### Prompt FR

```
Photographie d'intérieur éditoriale premium. Une toile canvas (60×90cm
paysage, châssis bois FSC chêne clair 4cm d'épaisseur) accrochée à un mur
crème chaud dans un intérieur moderne épuré. Visuel sur la toile : grande
composition gradient abstraite HM Global — vagues fluides et blobs organiques
cyan #54B6D2 → violet profond #3B235A → magenta #C13C8A, 70% de couverture,
30% blanc visible. Cadrage 3/4 (15° de côté) pour révéler l'épaisseur du
châssis sur le bord droit. Premier plan partiel : petite console bois avec
vase céramique contenant herbe de pampa séchée. Lumière naturelle douce
venant d'une fenêtre hors champ à gauche, ombre portée subtile sur le mur.
Aucune personne, aucune main, aucun écran, aucun texte lisible. Style
photographie d'intérieur éditoriale type Architectural Digest. Ratio 4:3,
hyperréaliste.
```

### Paramètres recommandés

- Midjourney : `--ar 4:3 --style raw --quality 2 --stylize 250`
- DALL·E 3 : "canvas print hanging on cream wall, modern interior photography"
- Firefly : Content Type "Photo", Style "Architectural"

### Destination

`public/images/home/hm-print-toiles-canvas.webp` (+ `.jpg` fallback)
→ Remplacera la card "Toiles canvas" dans `HomeVisualShowcase`.

---

## Workflow recommandé

1. **Génère les 5 visuels** un par un dans ton outil préféré (Midjourney v6 conseillé pour le réalisme produit, DALL·E 3 si tu utilises ChatGPT, Firefly si tu utilises Adobe)
2. **Itère 3-4 fois par prompt**, sélectionne la version la plus propre (pas de texte parasite, pas de mains qui apparaissent, couleurs respectées)
3. **Upscale** à 1920×1440 minimum (Midjourney : bouton Upscale ; ChatGPT : "upscale and increase quality")
4. **Dépose les 5 fichiers** dans `/Users/kaankaplan/Desktop/Site web hm global agence /` (le dossier où tu mets toujours tes images)
5. **Préviens-moi** quand c'est fait — je m'occupe :
   - de les convertir en `.webp` + `.jpg` via `sharp`
   - de les placer dans `public/images/home/` avec les bons noms
   - de mettre à jour les chemins dans `HomeVisualShowcase.tsx` (et `HomeQuickEntries.tsx` si nécessaire)
   - de purger le cache et de tester

## Astuces qualité finale

- **Si Midjourney génère du texte parasite** : ajouter `--no text, --no letters, --no typography` à la fin du prompt
- **Si l'IA met des mains** : ajouter `--no hands, --no people, --no fingers`
- **Si le résultat est trop saturé** : remplacer `cyan #54B6D2` par `cyan #6EC7DD` (version plus claire)
- **Si le rendu fait trop "3D render"** : ajouter `shot on Hasselblad medium format, film grain subtle`
- **Si tu veux un look plus "Instagram lifestyle"** : remplacer "editorial Pentagram quality" par "lifestyle interior magazine, Kinfolk aesthetic"

## Variantes utiles (pour plus tard)

Si tu veux étendre la série, voici des supports supplémentaires non demandés mais utiles :
- **Roll-up / kakemono** — pour la card signalétique
- **Stickers / autocollants** — petite gamme goodies
- **Sacs kraft personnalisés** — packaging
- **Goodies (mug, gourde, carnet)** — pour la rubrique entreprises
- **Carte de membre / badge nominatif** — pour les clubs/asso
- **En-tête de courrier / papier à lettres A4** — corporate identité

Je peux générer ces prompts supplémentaires sur demande.

---

*Fin du document. Une fois les 5 visuels générés et déposés dans ton dossier Desktop, je les intègre automatiquement dans le code en 5 minutes.*
