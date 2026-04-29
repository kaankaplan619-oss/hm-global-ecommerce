# TEST_CHECKLIST.md — Checklist de validation obligatoire

> À exécuter à la fin de chaque tâche avant de déclarer celle-ci terminée.
> Marquer chaque item : ✅ testé et OK · ❌ testé et KO · ⏭ non testé (justifier)

---

## A. Build & TypeScript

| # | Test | Commande | Résultat |
|---|---|---|---|
| A1 | TypeScript sans erreur | `npm run type-check` | |
| A2 | Build Next.js sans erreur | `npm run build` | |
| A3 | Lint sans erreur bloquante | `npm run lint` | |

> ⚠️ Les items A1 et A2 sont **obligatoires**. Une tâche ne peut pas être déclarée terminée sans les avoir passés.

---

## B. Catalogue

| # | Test | URL | Résultat |
|---|---|---|---|
| B1 | Page catalogue principale se charge | `/catalogue` | |
| B2 | Catégorie T-shirts | `/catalogue/tshirts` | |
| B3 | Catégorie Hoodies & Sweats | `/catalogue/hoodies` | |
| B4 | Catégorie Polos | `/catalogue/polos` | |
| B5 | Catégorie Softshells & Vestes | `/catalogue/softshells` | |
| B6 | Catégorie Polaires & Doudounes | `/catalogue/polaires` | |
| B7 | Catégorie Casquettes | `/catalogue/casquettes` | |
| B8 | Catégorie Sacs & Goodies | `/catalogue/sacs` | |
| B9 | Catégorie Enfants | `/catalogue/enfants` | |
| B10 | Images catalogue : packshots isolés (pas de mannequins) pour produits avec `COLOR_PACKSHOTS` | visuel | |

---

## C. Page produit — T-shirt

| # | Test | Produit | Résultat |
|---|---|---|---|
| C1 | Page produit iDeal (IB320) se charge | `/produits/tshirt-ideal-190-homme` | |
| C2 | Page produit B&C (TU03T) se charge | `/produits/tshirt-bc-exact-190-premium` | |
| C3 | Image principale = packshot blanc au chargement | visuel | |
| C4 | Référence, composition, grammage, prix affichés | visuel | |

---

## D. Page produit — Hoodie

| # | Test | Produit | Résultat |
|---|---|---|---|
| D1 | Page produit WU620 se charge | `/produits/hoodie-bc-hooded-sweat` | |
| D2 | Page produit IB400 se charge | `/produits/sweat-col-rond-ideal` | |

---

## E. Page produit — Softshell / Veste

| # | Test | Produit | Résultat |
|---|---|---|---|
| E1 | Page produit JUI62 se charge | `/produits/softshell-bc-homme` | |
| E2 | Bandeau "broderie recommandée" affiché pour softshell | visuel | |

---

## F. Changement de couleur

| # | Test | Action | Résultat |
|---|---|---|---|
| F1 | Cliquer blanc → image packshot blanc | swatch blanc IB320 | |
| F2 | Cliquer noir → image packshot noir | swatch noir IB320 | |
| F3 | Cliquer couleur sans packshot → image générique (pas mannequin B&C sur iDeal) | swatch bordeaux IB321 | |
| F4 | Couleur non disponible grisée et non cliquable | swatch rupture | |

---

## G. Upload logo

| # | Test | Action | Résultat |
|---|---|---|---|
| G1 | Upload fichier PNG transparent → aperçu s'affiche | upload logo | |
| G2 | Bouton "Prévisualiser le BAT" apparaît après upload | visuel | |
| G3 | Changer de couleur après upload → logo reste affiché, effet reset | action couleur | |

---

## H. Positionnement logo — LightMockupPreview (iDeal, hoodies, polos…)

| # | Test | Action | Résultat |
|---|---|---|---|
| H1 | Logo visible en position cœur | sélectionner "Cœur" | |
| H2 | Logo visible en position dos | sélectionner "Dos" | |
| H3 | Logo visible en positions cœur + dos | sélectionner "Cœur + Dos" | |
| H4 | Effet "Contour blanc" change l'apparence du logo | bouton contour | |
| H5 | Effet "Fond blanc" change l'apparence du logo | bouton fond blanc | |

---

## I. Déplacement et redimensionnement logo — MockupViewer (B&C uniquement)

| # | Test | Action | Résultat |
|---|---|---|---|
| I1 | Logo draggable sur le canvas | drag logo | |
| I2 | Logo redimensionnable avec poignées | resize logo | |
| I3 | Basculer Face / Dos change le mockup | toggle Dos | |
| I4 | Effet lisibilité (contour blanc / fond blanc) visible | bouton effet | |

---

## J. BAT — Bon à Tirer

| # | Test | Action | Résultat |
|---|---|---|---|
| J1 | Modal BAT s'ouvre après clic "Prévisualiser le BAT" | bouton BAT | |
| J2 | Données correctes : produit, couleur, technique, taille, quantité | visuel modal | |
| J3 | Aperçu visuel logo sur produit affiché dans le modal | visuel modal | |
| J4 | Bouton "Imprimer / PDF" déclenche `window.print()` | clic imprimer | |
| J5 | Fermeture par Échap fonctionne | touche Échap | |
| J6 | Fermeture par croix fonctionne | clic X | |

---

## K. Panier

| # | Test | Action | Résultat |
|---|---|---|---|
| K1 | Ajouter un produit au panier | bouton ajouter | |
| K2 | Quantité modifiable dans le panier | +/- quantité | |
| K3 | Suppression d'un article | bouton supprimer | |
| K4 | Total recalculé correctement | visuel total | |

---

## L. Mobile (< 768px)

| # | Test | Vérification | Résultat |
|---|---|---|---|
| L1 | Grille catalogue en 2 colonnes sur mobile | visuel | |
| L2 | Swatches couleur accessibles au toucher | touch swatches | |
| L3 | Tailles et quantité modifiables sur mobile | touch configurateur | |
| L4 | BAT modal scrollable sur petits écrans | scroll modal | |
| L5 | QuoteAssistant ne déborde pas du viewport | visuel flottant | |

---

## M. Desktop (≥ 1024px)

| # | Test | Vérification | Résultat |
|---|---|---|---|
| M1 | Grille catalogue en 3-4 colonnes | visuel | |
| M2 | Layout 2 colonnes page produit (galerie + configurateur) | visuel | |
| M3 | BAT modal centré et lisible | visuel | |

---

## Règle de reporting

Dans `AGENT_REPORT.md`, indiquer pour chaque item :
- ✅ si le test a été effectué et est passé
- ❌ si le test a été effectué et a échoué (décrire le problème)
- ⏭ si le test n'a pas été effectué (donner la raison : non applicable / hors périmètre / manque de temps)

Un item ❌ bloque la clôture de la tâche.
