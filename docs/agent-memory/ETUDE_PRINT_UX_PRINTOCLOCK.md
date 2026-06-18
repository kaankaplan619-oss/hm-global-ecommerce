# Étude UX print — PrintOclock & secteur, vs notre existant (juin 2026)

But : reproduire le « moitié illustration + moitié photo » de PrintOclock pour notre catégorie print. Workflow 3 axes (PrintOclock détaillé + pattern secteur + audit de notre code).

## 1. Comment PrintOclock fait (confirmé via leur code Symfony + Vue.js)
- **Configurateur = wizard à ONGLETS** : Format → Papier → Recto Verso → Vernis & Dorure → Finitions → Coins & Façonnage → Quantité → Délais. Prix recalculé **en live** en JS. Configurateur **maison**.
- **Options = illustrations SVG schématiques** (silhouettes de carte colorées « rose marque » + label + dimensions). Papiers/finitions = pastilles/vignettes matière. (champ `svg` dans leur modèle JSON).
- **Aperçu produit (hero) = PHOTOS studio de mockups** de cartes **avec un design d'exemple dessus** + galerie de vignettes (≥5 visuels, fancybox).
- **Page catégorie `/imprimerie`** (leur `/impression` = 404) : **vignettes PHOTO + « à partir de X € HT » + badges PROMO/NEW/TOP VENTE**.
- **Réassurance martelée** : « Imprimé à Toulouse » · « Petits prix » · « Livraison 24h » · contrôle fichier/BAT · livraison gratuite.
- Stack : Symfony + Vue.js + Webpack Encore, Algolia (search), Trustpilot (avis), GSAP, axept.io (RGPD).

## 2. Le pattern du secteur (Vistaprint, MOO, Exaprint) — universel
- **Carte produit / hero = PHOTO de mockup réaliste AVEC design d'exemple = 4/4 des sites.** Jamais de produit vide.
- **Convention « fausse marque crédible »** : Exaprint « Ventury Travel »/« Rockapop », Vistaprint « bar à jus ». Pourquoi ça vend mieux qu'une photo stock vide : (a) le client **se projette**, (b) la carte habillée **prouve la finition** (vernis/dorure ne se voient que sur un design), (c) signale le **soin/premium**, (d) le vide ressemble à un gabarit non fini → tue la désirabilité.
- Couche **options = souvent juste des menus texte** chez les concurrents → nos illustrations SVG d'options sont **au-dessus** du standard.
- Aperçu live (upload→mockup) = partout mais dans un **éditeur séparé**, pas sur la fiche.

## 3. Notre existant (la bonne surprise : on a déjà la quasi-totalité du moteur)
- **Grille `/impression`** = illustrations schématiques `spec/*.webp` (style « carte option » Vistaprint). `app/impression/page.tsx` + `printSpecImage()`.
- **Configurateurs existent** : `PrintConfigurator.tsx` (flyers/affiches/toiles/invit) + `BusinessCardConfigurator.tsx` (cartes). MAIS **tout sur une page en 2 colonnes, PAS un wizard à onglets**.
- **✅ MOTEUR « design sur la carte » DÉJÀ là** (équivalent print du MockupViewer textile, en CSS `matrix3d` perspective + occlusion doigts) : `PrintMockupPreview.tsx`, `PrintMockupViewer.tsx`, `CardSituationPreview.tsx`, `PrintSupportVisualizer.tsx`. Le design client est réellement projeté sur une photo de support → **l'effet « ton logo sur le produit » existe déjà, dans le configurateur**.
- **Photos de mockups réelles déjà au repo** : `public/mockups/print/{business-card,flyer,poster,canvas,brochure,rollup,sticker,mug}/*.webp` (source Mockups Design) — utilisées **dans les configurateurs**, PAS sur la grille. Dossier `cards/` = **vide**.

### Écarts vs PrintOclock + effort
| Brique | État | Effort |
|---|---|---|
| Vignettes **photo-mockup avec design d'exemple** sur la grille `/impression` | ⬜ grille = illustrations only (photos existent mais pas exposées) | **faible-moyen** |
| Aperçu live logo pour la famille **cards/invitations** | ⬜ non branché (dossier `cards/` vide, zones à calibrer) | **moyen** (moteur déjà là) |
| **Wizard à onglets** (parcours guidé étapes) | ⬜ tout sur une page 2 colonnes | **moyen** |
| **Sélecteur papier / pelliculage / vernis / façonnage** | ⬜ figé en texte + UID Gelato baké | **élevé** (impacte pricing + fulfillment + anti-tampering) |
| Réalisme aperçu (ombres/grain papier) | 🟡 basique | **faible** |

## 4. Réponse à la question de Kaan (« faut-il mettre un logo d'exemple ? »)
**Oui.** Le « logo » = un **design d'exemple / fausse marque crédible** (style « Paul Lucien ») posé sur le mockup — c'est ce qui fait qu'une photo se lit comme un produit fini et pas comme une photo stock « bof ». C'est **universel** dans le secteur. Et on a déjà le moteur pour poser un design sur la carte → il suffit d'exposer une photo-mockup **habillée d'un design démo** sur la grille (pas un blanc, pas un stock vide).

## 5. Reco de séquence (si Kaan valide — rien codé)
1. **Grille `/impression` : photo-mockup AVEC design d'exemple** (réutiliser nos photos + un design démo HM par famille). Garder les illustrations SVG pour les **options** du configurateur. = le « moitié illustration / moitié photo » qu'il veut. **Effort faible-moyen.**
2. Brancher l'**aperçu live logo pour les cartes** (remplir `cards/`, calibrer zones). **Moyen.**
3. **Wizard à onglets** pour le configurateur. **Moyen.**
4. (Gros morceau, plus tard) **Sélecteur papier/finitions**. **Élevé.**

⚠️ Nuance vs la décision du 2026-06-15 (« pas de photos sur /impression ») : ce qui était rejeté = **photos stock vides « bof »**. Ici = **mockups propres habillés d'un design d'exemple** (le pattern PrintOclock), ce que Kaan demande explicitement. Direction OK.
