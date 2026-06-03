# HM Global — Audit Brand / UX / DA / Conversion

> **Date :** 2026-05-17  
> **Périmètre :** homepage, header, footer, catalogue, /catalogue/[category], /impression, /produits/[slug], /contact  
> **Posture :** brand strategist + UX/UI senior + DA + consultant conversion + Instagram strategist  
> **Contrainte :** aucun code modifié — uniquement diagnostic et plan d'action.  
> **Note préalable :** la homepage a été refondue juste avant cet audit (palette violet/magenta/cyan introduite via `HomeHeroPremium`, `HomeQuickEntries`, `HomeVisualShowcase`, `HomePack360`, `HomeTrustStrip`, `HomeFinalCTA`). Le reste du site est encore sur l'ancienne palette `--hm-rose / --hm-primary`. C'est la première chose visible.

---

## A. Résumé exécutif

| Critère | Note | Commentaire |
|---|---|---|
| **Globale** | **7 / 10** | Site solide, structure pro, gros bond après refonte homepage — mais incohérence DA inter-pages |
| **DA** | **6 / 10** | Nouvelle palette homepage non propagée. Effet "gold gradient" hérité jure avec la nouvelle DA. Typographie trop "font-black" |
| **UX** | **7,5 / 10** | Navigation claire, dropdowns nets, breadcrumbs présents, fil cohérent |
| **Conversion** | **6,5 / 10** | CTA visibles mais 0 témoignage, 0 preuve sociale, 0 prix d'entrée affiché en homepage |
| **Mobile** | **7,5 / 10** | Drawer mobile correct, grilles responsives, mais hero pas testé visuellement |

**Verdict :** **presque prêt**. Le site est solide commercialement, mais il manque deux briques pour atteindre le niveau premium positionné : (1) la **cohérence DA** entre la nouvelle homepage et le reste, (2) les **preuves sociales / vraies photos lifestyle**. Sans ça, le site reste perçu comme un template e-commerce de bonne facture, pas comme une agence premium.

---

## B. Points forts actuels

1. **Architecture Next.js 16 / React 19 / Tailwind v4** — stack moderne, performance acquise par défaut.
2. **Tokens de design system centralisés** dans `globals.css` (`--hm-*`) — base saine pour migrer une palette.
3. **Navigation très complète** (Header.tsx) — Catalogue + Impression + Techniques + Entreprises + Réalisations + À propos + Contact, avec dropdowns multi-niveaux et version mobile soignée (CTA "Demander un devis" + tags "Alsace / BAT validé / Dès 10 pcs" en mobile).
4. **Fiches produit ultra-travaillées** (`app/produits/[slug]/page.tsx`) — `USE_CASES` + `STRENGTHS` + recommandation technique dynamique selon les techniques disponibles. Niveau de détail rare en B2B textile français.
5. **Section impression bien pensée** : fallback statique propre + intégration Gelato dynamique conditionnelle, sans casser le rendu si l'API échoue (`STATIC_FALLBACK`).
6. **Footer riche** : contact carte (adresse Google Maps cliquable, tel, email, social, horaires) + 4 colonnes nav + paiements + légal.
7. **Homepage refondue** : structure 7 blocs, mobile-first, palette officielle 2026 partiellement appliquée.
8. **Mockups Printify réels** sur 5 produits/coloris × 5 angles — vraie crédibilité textile.
9. **Authentification + admin** intégrés au header avec garde d'hydratation propre (Zustand persist).
10. **Réassurances présentes partout** (BAT, Alsace, accompagnement humain, dès 10 pièces).

---

## C. Problèmes principaux

### C1. Incohérence DA homepage vs reste du site (P1 — bloquant pour le positionnement premium)

La homepage utilise désormais **violet `#3B235A` + magenta `#C13C8A` + cyan `#54B6D2`** (palette officielle HM Global 2026).  
Le reste du site (Header, Footer, Catalogue, Impression, Contact, Product) reste sur **`--hm-rose #b13f74` + `--hm-purple #4c2f6f`** (palette historique).

Effet utilisateur : on quitte un hero crème/violet/cyan élégant et on arrive sur un catalogue avec hover rose, breadcrumbs rose, footer avec accent rose. **Le site change de tonalité entre les pages** — perception "site fait par 2 personnes différentes". Tue le positionnement premium.

### C2. Effet "gold gradient" hérité partout (P1)

La classe `.text-gradient-gold` est appliquée aux titres de pages clés (`catalogue/page.tsx:35`, `impression/page.tsx:175`, `TrustBand.tsx:98`). Le gradient va de **`--hm-blue-light` → `--hm-purple` → `--hm-rose`**, ce qui crée un dégradé rose-violet qui n'est plus la signature visuelle voulue. Le nom "gold" est aussi trompeur (rien d'or dedans). **À refactorer en `text-gradient-hm`** (violet→magenta→cyan) ou à remplacer par un titre solide en violet profond.

### C3. Pas de preuve sociale ni de témoignage visible (P1 — conversion)

Aucune des pages auditées n'affiche :
- témoignage client avec photo + nom + entreprise
- logos de clients connus (mêmes locaux : restaurants, clubs, PME alsaciennes)
- nombre de pièces produites / commandes traitées / années d'activité
- avis Google / note moyenne

Pour un B2B textile premium qui demande à des entreprises de confier leur image, c'est le frein conversion n°1.

### C4. Pas de vraies photos lifestyle / atelier (P1 — différenciation)

Tous les visuels sont :
- mockups Printify (textile plat, fond uni) — propre mais générique
- mockups print (cartes, flyers) en vue isométrique 3D — propre mais générique

**Aucune photo prise dans l'atelier de Souffelweyersheim, aucune équipe au travail, aucun client portant les produits, aucun pack livré en situation.** Un dropshippeur peut avoir exactement ces mêmes mockups. Le visiteur ne ressent pas que HM Global est une vraie agence locale.

### C5. Typographie "font-black" surutilisée (P2)

`font-black` (poids 900) apparaît 40+ fois dans le code audité. C'est très visible (`text-3xl font-black`, `text-4xl font-black`, `font-black uppercase tracking-wide`). Tendance e-commerce 2018-2020. En 2026, le design premium est plutôt **font-semibold (600) + tracking légèrement négatif (-0.025em)** sur les titres. Les nouveaux composants homepage utilisent déjà cette approche → bonne référence.

### C6. CTA trop nombreux dans le hero (P2)

Hero historique (`Hero.tsx:67-87`) : 3 CTAs côte à côte (Commander textile / Voir catalogue print / Demander un devis). Le nouveau `HomeHeroPremium` en a 2 (mieux). Mais sur fiches produit et catalogue, on a aussi parfois 3-4 CTA en concurrence. **Règle : 1 CTA principal par bloc, 1 secondaire au plus.**

### C7. Catalogue listing peu engageant (P2)

`app/catalogue/page.tsx` : header titre + sous-titre + pills filtres + grilles par catégorie. C'est fonctionnel mais sec. Aucun visuel d'entrée, pas de raison émotionnelle de scroller. Comparé à Tee-shirts-personnalises.fr, T-shirts Compagnie, Etsy ou Vistaprint, il manque un bloc d'inspiration / customer-stories visibles immédiatement.

### C8. Impression : page longue et chargée (P2)

`app/impression/page.tsx` : 5 catégories × 1 carte large + side-card "Formats / Spécifications". Très complet mais dense. Pas de hiérarchie claire entre "Cartes de visite" et "Toiles canvas" — tout au même poids. Risque : le client cherche cartes de visite mais arrive sur une page qui présente 5 univers. **Découper en sous-pages dédiées** (au moins `/impression/cartes-de-visite` existe déjà) et ne montrer que les 3 best-sellers en page index.

### C9. Pas de section "Réalisations" mise en avant côté homepage (P2)

`/realisations` existe dans la nav (`Header.tsx:34`) mais aucun aperçu sur la homepage. C'est pourtant le différenciateur le plus fort possible : "voici ce qu'on a livré chez vrai client X". À remonter en homepage.

### C10. Pas de feed Instagram (P3)

Le footer pointe vers `instagram.com/hmglobalagence` mais aucun contenu Instagram n'est intégré à la homepage. L'utilisateur peut quitter le site pour regarder Insta, ne revient pas. **Embed 6 posts Insta en bas de homepage** = signal d'activité, lifestyle, créativité.

### C11. Aucun affichage de prix d'entrée homepage (P2 — conversion)

Le visiteur B2B veut savoir tout de suite : "ça commence à combien ?". En homepage, aucune ancre de prix ("T-shirts dès 12,90 € HT", "Cartes de visite dès 39 € les 250"). Sans ancre, le visiteur projette des prix au pif et part comparer.

### C12. Pas d'urgence / pas de stock / pas de "production cette semaine" (P3)

Aucun signal temporel. Ajouter "Production lancée chaque mardi" ou "Réponse devis sous 24h ouvrées" rendrait la promesse plus concrète.

---

## D. Analyse section par section

### D.1 — Hero homepage (`HomeHeroPremium.tsx`, neuf)

- **État actuel** : 2 colonnes, gauche texte + 2 CTA, droite grande card image `pack-complet.jpg` avec 3 badges flottants (BAT, Textile+print, Livraison France). Halos cyan/magenta discrets. Fond crème.
- **Problème** : image `pack-complet.jpg` pas encore uploadée → broken image potentielle. Aucune ancre de prix. Aucune signal de preuve sociale (note Google, nombre de clients).
- **Recommandation** : (1) uploader le visuel pack complet sous 48h, (2) ajouter une ligne discrète "★ 4.9 / 5 · 200+ projets livrés" sous les CTAs, (3) ajouter "À partir de 12,90 € HT" en chip à côté du CTA principal.
- **Priorité :** P1
- **Effort :** faible

### D.2 — Univers / cartes d'entrée (`HomeQuickEntries.tsx`, neuf)

- **État actuel** : 3 cards (Textile / Print / Projet complet) avec image, icône colorée (violet/magenta/cyan), titre, desc, CTA.
- **Problème** : la 3e card utilise aussi `pack-complet.jpg` (même image que le hero) → redondance visuelle. Les images textile (`gildan-18500/noir-front.jpg`) et print (`carte-visite-premium.webp`) sont des mockups corrects mais pas signature HM.
- **Recommandation** : varier les images. Card "Projet complet" → image **équipe HM Global au travail** ou **client portant un t-shirt brodé HM**. Card "Textile" → un vrai polo brodé porté, pas un flat lay générique.
- **Priorité :** P2
- **Effort :** moyen (nécessite shooting ou achat photo)

### D.3 — Best-sellers textile (`BestSellers.tsx`, conservé)

- **État actuel** : 4 produits Printify featured, cards propres, prix dynamique, encart "Commandez en 3 étapes" en haut, CTA "Voir tout le catalogue" en bas sur fond violet.
- **Problème** : palette = **ancienne** (`var(--hm-primary)` = rose `#b13f74`). Hover sur card → border rose. Encart violet en bas = bon mais teinte violet `#3f2d58` ancien, pas la nouvelle. **Incohérence avec le hero juste au-dessus.**
- **Recommandation** : migrer les couleurs hover, accent et CTA vers `var(--hm-violet)` / `var(--hm-magenta)`. Garder l'intégration Printify intacte.
- **Priorité :** P1
- **Effort :** faible (search/replace dans 1 fichier)

### D.4 — Section print (`HomeVisualShowcase.tsx`, neuf)

- **État actuel** : 4 cards visuelles larges (cartes, flyers, affiches, canvas), gradient violet/cyan/magenta en background des visuels.
- **Problème** : 3 chemins d'image n'existent pas encore (`flyers-stack.jpg`, `posters.jpg`, `canvas-wall.jpg`) → fallbacks codés mais les vrais visuels HM gradient (issus du brief) seraient plus puissants.
- **Recommandation** : uploader les 3 visuels gradient. À défaut, garder les fallbacks (déjà câblés). Ajouter une chip "À partir de XX €" sur chaque card.
- **Priorité :** P2
- **Effort :** faible (upload + 1 ligne de chip)

### D.5 — Bloc commande rapide vs devis (`OrderOrQuote.tsx`, retiré du flux)

- **État actuel** : composant **non utilisé** dans la nouvelle homepage. Présent dans codebase.
- **Problème** : la distinction "commande rapide / devis volume" est utile pour le B2B mais a été retirée. Un visiteur cherchant un devis volume peut le rater.
- **Recommandation** : (a) soit garder retiré et compter sur les CTA "Demander un devis global" pour absorber la demande, (b) soit le réintégrer en mode plus subtil entre `HomeQuickEntries` et `BestSellers`. **Je recommande (a)** car la nouvelle DA est plus claire et le CTA hero couvre déjà l'intention "devis".
- **Priorité :** P3
- **Effort :** faible

### D.6 — Réassurance / preuves de confiance (`HomeTrustStrip.tsx`, neuf)

- **État actuel** : 4 items (BAT, Accompagnement, Multi-supports, Devis 24h) avec icônes lucide en gradient cyan/magenta.
- **Problème** : pas d'élément quantifié, pas de logo client, pas de note Google. Les 4 items sont des promesses ; il manque les **preuves**.
- **Recommandation** : ajouter au-dessus ou en-dessous une **bande logos clients** (6-8 logos en niveaux de gris) + une **ligne témoignage** ("HM Global a livré nos 80 polos brodés équipe — Restaurant Le Chambard").
- **Priorité :** P1
- **Effort :** moyen (récupérer les logos + 1-2 témoignages clients)

### D.7 — Clients / secteurs (`TrustBand.tsx`, retiré du flux)

- **État actuel** : composant **non utilisé** dans la nouvelle homepage. Contenait 6 secteurs (Restaurants, BTP, Clubs, Retail, PME, Évènementiel) avec icônes et livrables typiques + 3 commitments quantifiés (0 surprise / 7-10 jours / 10 pièces).
- **Problème** : on a **perdu un excellent bloc**. Les 6 secteurs aidaient un visiteur à se reconnaître ("ah, c'est aussi pour les restaurants comme moi"). Très utile pour la conversion B2B.
- **Recommandation** : **réintégrer une version simplifiée** entre `HomeTrustStrip` et `HomePack360`. Garder les 6 chips secteurs (avec icônes cyan/magenta nouvelle palette) mais virer le bloc "0 surprise / 7-10 jours / 10 pièces" qui doublonne avec `HomeTrustStrip`.
- **Priorité :** P2
- **Effort :** faible (réimport composant simplifié)

### D.8 — CTA final (`HomeFinalCTA.tsx`, neuf)

- **État actuel** : bloc fond bleu nuit → violet, halos cyan + magenta, titre + sous-titre + 2 CTA centrés.
- **Problème** : aucune urgence ni preuve sociale. Le visiteur scrolle jusque-là, il a vu 6 sections, et le CTA final n'apporte aucun élément nouveau.
- **Recommandation** : ajouter une mini-photo équipe HM ou un compteur ("250+ projets livrés en Alsace") avant les boutons. Ou un mini-formulaire de capture email en plus du bouton "Demander un devis global".
- **Priorité :** P2
- **Effort :** moyen

### D.9 — Header (`Header.tsx`)

- **État actuel** : logo + nav 7 items + actions (compte, panier badge, CTA Commander pulse). Drop-downs élégants. Mobile drawer riche.
- **Problèmes** :
  1. CTA "Commander" en couleur **`--hm-rose`** (ancien) → incohérent avec hero homepage en violet.
  2. Hover liens = `--hm-rose` partout → idem.
  3. `btn-primary-pulse` (glow rose pulse) sur le CTA = signal créatif fort, mais sur palette obsolète.
  4. Pas de barre de réassurance fine en haut (`Production Alsace · BAT validé · Réponse devis 24h`) — un site comme Printful, Vistaprint, ou même un Shopify premium a souvent une utility bar.
- **Recommandation** :
  - Migrer la couleur du CTA et des hovers vers `--hm-violet` / `--hm-magenta`.
  - Ajouter une utility-bar fine (h-8) au-dessus du logo, fond `--hm-violet`, texte blanc 11px : "Production Alsace · BAT validé avant prod · Devis < 24h ouvrées".
- **Priorité :** P1
- **Effort :** faible-moyen

### D.10 — Footer (`Footer.tsx`)

- **État actuel** : fond `#f7f6f4`, carte contact à gauche + 4 colonnes (Catalogue, Impression, Informations, Espace client), bas légal + paiements.
- **Problèmes** :
  1. Tous les accents en `--hm-rose` (ancien) — hover liens, bordures hover, CTA "Demander un devis", icônes MapPin/Clock3/Phone.
  2. Pas de newsletter — gros manque B2B.
  3. Pas de Instagram embed ni grille de 4 posts.
  4. Paiements ("CB / VISA / Mastercard / Stripe") en chips texte — pas de logos officiels reconnaissables.
- **Recommandation** :
  - Migrer tokens accent vers `--hm-violet` / `--hm-magenta`.
  - Ajouter bloc newsletter ("Recevez 1 fois par mois un guide produit + une remise sur votre 1ère commande volume").
  - Remplacer chips paiements par logos SVG officiels (visa.svg, mastercard.svg, etc.).
- **Priorité :** P2
- **Effort :** moyen

### D.11 — Catalogue (`app/catalogue/page.tsx`)

- **État actuel** : `<h1>` avec `text-gradient-gold`, pills de filtres en `--hm-primary`, sections par catégorie (h2 + divider + grille `ProductCard`).
- **Problèmes** :
  1. `text-gradient-gold` = dégradé qui ne correspond plus à la DA.
  2. Hero très textuel et sec, aucune image ni signal lifestyle.
  3. Pills filtres = approche fonctionnelle mais pas vendeuse. Pas de bloc "Best-sellers du moment", "Saison automne" mis en avant.
  4. Aucun encart de réassurance / urgence / délai dans la liste.
- **Recommandation** :
  - Remplacer le titre gradient par "Textile personnalisé pour les pros" en violet profond solide.
  - Ajouter une bande visuelle haute (banner 16:5) avec 2-3 photos textile portées + texte court.
  - Garder pills filtres mais renforcer l'actif (background violet, texte blanc).
- **Priorité :** P2
- **Effort :** moyen

### D.12 — Catalogue catégorie (`app/catalogue/[category]/page.tsx`)

- **État actuel** : 167 lignes — non lu en détail mais probablement structure similaire au listing.
- **Problème** : par défaut héritage palette ancienne.
- **Recommandation** : audit séparé après migration palette + ajout d'un bandeau guide d'achat ("Comment choisir son t-shirt ?") en haut de catégorie pour le SEO + UX.
- **Priorité :** P3
- **Effort :** moyen

### D.13 — Impression (`app/impression/page.tsx`)

- **État actuel** : titre avec `text-gradient-gold`, bandeau réassurance avec emojis 🎨✅🖌️📦🇫🇷, 5 catégories (Cartes / Flyers / Affiches / Canvas / Cartes invitations) en fallback statique + Gelato dynamique. CTA fin de page sur fond violet `#3f2d58`.
- **Problèmes** :
  1. Emojis 🎨✅🖌️📦🇫🇷 dans les chips réassurance — trop "Instagram caption", incohérent avec positionnement premium. À remplacer par icônes lucide cyan.
  2. 5 catégories = beaucoup, surcharge. Hiérarchie aplatie.
  3. `text-gradient-gold` au titre.
  4. CTA fin de page utilise gradient violet ancien `#433053 → #3f2d58`, pas la nouvelle palette.
  5. Les visuels fallback PrintImageStage sont propres mais aucun **vrai mockup HM** n'a encore été produit (commentaire dans le code à la ligne 67-77 indique que ces visuels HM sont à générer).
- **Recommandation** :
  - Migrer palette + remplacer emojis par icônes.
  - Mettre les 3 best-sellers print en avant (Cartes / Flyers / Affiches), reléguer Canvas + Cartes invitations en bas.
  - Générer les vrais visuels HM print gradient (cf brief utilisateur : canvas-wall, posters, flyers-stack).
- **Priorité :** P1 (la page est très visible)
- **Effort :** moyen

### D.14 — Fiche produit (`app/produits/[slug]/page.tsx`)

- **État actuel** : breadcrumb pills, USE_CASES + STRENGTHS + recommandation technique dynamique selon les techniques (broderie / DTF / flex). Niveau de détail rare.
- **Problèmes** :
  1. Breadcrumb pills en `--hm-rose` (ancien).
  2. Aucun témoignage / use-case réel à la fin ("Voici comment X a utilisé ce produit").
  3. Pas de zoom mockup interactif visible dans cet extrait — à vérifier dans `ProductDetailClient`.
  4. Pas de cross-sell intelligent (sweat + flyer + carte = pack).
- **Recommandation** :
  - Migrer palette.
  - Ajouter "Ils ont commandé ce produit" (3 mini cards client + photo + 1 phrase).
  - Cross-sell "Compléter avec : cartes de visite assorties / flyer évènement".
- **Priorité :** P2
- **Effort :** moyen

### D.15 — Contact (`app/contact/page.tsx`)

- **État actuel** : breadcrumb, titre "Parlons de votre besoin textile, visuel ou projet sur mesure" (excellent wording), 4 items contact (tel / email / adresse / horaires), 6 expertises listées.
- **Problèmes** :
  1. Pas de formulaire de contact visible dans l'extrait — à vérifier.
  2. Pas de carte Google Maps embarquée.
  3. Pas d'option "Prendre rendez-vous Calendly" pour les gros projets.
- **Recommandation** :
  - Vérifier que le formulaire fonctionne et est connecté (Resend déjà dans `package.json`).
  - Ajouter un embed Google Maps de l'atelier.
  - Optionnel : embed Calendly pour les RDV projet > 50 pièces.
- **Priorité :** P2
- **Effort :** moyen

### D.16 — Responsive mobile

- **État actuel** : grilles cassées proprement (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/4`), mobile drawer header riche, ordre `order-1/order-2` sur la nouvelle homepage pour mettre texte avant image.
- **Problèmes** :
  1. Hero `HomeHeroPremium` non testé en navigateur — à valider que les badges flottants ne débordent pas sur mobile.
  2. Sections impression et catalogue peuvent paraître longues sur mobile (5+ sections empilées).
- **Recommandation** :
  - Tester chaque page sur 375px (iPhone SE) et 414px (iPhone Pro Max).
  - Considérer `scroll-snap-type: y` sur la homepage pour un défilement section par section sur mobile.
- **Priorité :** P2
- **Effort :** faible (test) à moyen (snap)

---

## E. Recommandations DA

### E.1 — Palette : migration progressive (P1)

Phase 1 — homepage (✅ fait).  
Phase 2 — header + footer + CTAs globaux (`btn-primary`, `btn-outline`, `section-tag`, `text-gradient-gold`).  
Phase 3 — catalogue + impression + product page.  
Phase 4 — admin, panier, checkout, studio (sensibles → faire en dernier avec accord).

Pas de remplacement brutal de `--hm-rose` ou `--hm-purple` — ces tokens restent valides, on **réoriente** `--hm-primary` vers `var(--hm-violet)` au moment où la majorité des pages est prête, et on retire `text-gradient-gold` au profit d'un nouveau `text-gradient-hm` (violet → magenta → cyan).

### E.2 — Typographie

- Titres : passer de `font-black` à `font-semibold` (600), tracking `-0.025em`.
- Sous-titres : `font-medium` (500) plutôt que `font-bold`.
- Texte courant : conserver `--font-sans` (Avenir Next) — c'est une excellente police.
- Display : `--font-display` (Iowan Old Style) — élégant mais sous-utilisé. Le réserver aux gros titres marketing.
- Ajouter une police d'accent moderne pour les eyebrows / chiffres clés : envisager **"GT Walsheim", "Söhne", "Inter Display" ou "Geist"** (toutes Google Fonts ou via Vercel Font).

### E.3 — Images

Critères pour les nouvelles images :
- Lumière naturelle, ombre douce (jamais flat lighting industriel).
- Mannequin réel ou pack en situation, jamais 100% packshot blanc.
- Inclure des touches gradient violet/magenta/cyan dans les supports imprimés visibles (cartes, flyers).
- Format 16:10 pour les bannières, 4:5 pour les cards mobiles, 1:1 pour Instagram.

Voir section G pour la liste exhaustive.

### E.4 — Formes & rayons

- Cards : `rounded-[1.6rem]` à `rounded-[2rem]` (déjà bien appliqué dans les nouveaux composants).
- Boutons : `rounded-[14px]` (nouveau standard `.btn-hm-violet`) plutôt que `rounded-full` partout.
- Chips / badges : `rounded-full` ok.
- Garder une cohérence — éviter le mix `rounded-xl` + `rounded-2xl` + `rounded-[1.4rem]` sur la même page.

### E.5 — Animations

- Garder : fade-in léger, translate-y léger au hover (déjà appliqué).
- Ajouter : un léger **parallax inverse** sur le visuel hero (l'image descend de 8px quand on scroll, le texte de 0 — sensation de profondeur, sans alourdir).
- Éviter : zoom agressif, rotations, animations infinies type marquee.
- Toujours respecter `prefers-reduced-motion` (déjà géré dans `globals.css`).

### E.6 — Iconographie

- `lucide-react` est déjà la lib utilisée — bon choix, cohérent, moderne, léger.
- Standard : `strokeWidth={1.6}` (légèreté), couleur cyan pour les détails, violet pour les titres.
- Éviter les emojis (🎨✅🖌️) comme dans `impression/page.tsx:187` — à remplacer par lucide.

### E.7 — Style Instagram-ready

- Penser **chaque section comme un post Instagram** : peut-on screenshoter cette section et la poster ?
- Ajouter des **chiffres clés grands** (typo display, font-semibold, color magenta) qui marchent en feed (ex : "+ 250 projets livrés", "98% de clients satisfaits").
- Utiliser des **citations clients en gros caractères** (display + magenta) — très partageables.
- Préparer des **templates Stories / Reels** à partir des sections du site (logo HM + accroche + gradient).

---

## F. Recommandations UX / conversion

### F.1 — Hero

- **Une promesse claire en 1 phrase** au-dessus du titre (déjà : "HM Global Agence" — peut devenir "Agence de communication visuelle · Alsace · depuis 2020").
- **1 CTA principal + 1 secondaire** (pas 3). ✅ déjà fait sur HomeHeroPremium.
- **Une chip de prix d'entrée** sous les CTAs : "À partir de 12,90 € HT le t-shirt brodé".
- **Une chip de preuve sociale** : "★ 4.9/5 · 200+ projets livrés".

### F.2 — CTAs

- Cohérence verbe : "Commander un textile" / "Demander un devis global" — bien ✅.
- Éviter "En savoir plus" et "Découvrir" qui ne convertissent pas.
- Privilégier "Voir le textile" / "Demander un devis" / "Parler à un conseiller".

### F.3 — Parcours commande/devis

Aujourd'hui 2 chemins distincts :
- Commande directe : `/catalogue → /produits/[slug] → studio → panier → checkout`
- Devis : `/contact?sujet=devis`

Risques : visiteur sur fiche produit qui veut un devis volume ne sait pas qu'il existe → ajouter sur fiche produit "Volume > 30 pièces ? Demander un devis dégressif" en chip cyan.

### F.4 — Produits

- Mockup 3D ou viewer interactif (déjà présent via Studio + MockupViewer) — excellent ✅.
- Ajouter "Coup de cœur HM" en badge sur 1-2 produits — biais d'autorité.
- Afficher "Délai moyen production : 7-10 jours après BAT" sur chaque fiche.

### F.5 — Réassurance

- Bandeau utility-bar header (cf D.9).
- Footer : ajouter "✓ Atelier en Alsace ✓ Production France ✓ 250+ projets livrés".
- Page produit : ligne "✓ BAT envoyé sous 48h ✓ Production lancée après votre accord ✓ Livraison France 48-72h après production".

### F.6 — Preuves sociales

- **3 témoignages clients sur la homepage** (avec photo, nom, entreprise, type de projet).
- **Bande logos clients** (6-8 logos en niveaux de gris) sous le hero ou au-dessus du footer.
- **Note Google + lien avis Google Business** dans le hero.
- **Compteur de projets livrés** dynamique si possible (sinon statique "250+").

### F.7 — Tunnel mobile

- Vérifier que `HomeHeroPremium` ne déborde pas en 375px.
- CTA mobile dans la sticky-bottom-bar quand on est sur fiche produit (déjà ?).
- Réduire le nombre de scrolls jusqu'au CTA principal — en mobile, le hero doit tenir en 1 viewport (-1 scroll max).

---

## G. Recommandations images

### G.1 — Images à GARDER

| Fichier | Pourquoi | Usage actuel |
|---|---|---|
| `/mockups/printify/gildan-18500/noir-front.jpg` (et siblings) | Vrais mockups Printify, qualité OK | Card textile homepage, BestSellers, catalogue |
| `/mockups/print/business-card/carte-visite-premium.webp` | Cohérent, propre | Card print homepage |
| `/mockups/print/flyer/flyer-premium.webp` | Idem | Section impression |
| `/mockups/print/affiche/affiche-premium.webp` | Idem | Section impression |
| `/mockups/print/canvas/canvas-premium.webp` | Idem | Section impression |
| `/logo/hm-global-logo.png` | Logo officiel | Header, footer, contact |

### G.2 — Images à REMPLACER / CRÉER (prioritaire)

| Nom | Type | Contenu | Format | Usage |
|---|---|---|---|---|
| `pack-complet.jpg` | **Photo studio** | T-shirt blanc plié + flyers + carte de visite + enveloppe + petits supports imprimés sur table, gradient violet/magenta/cyan en arrière-plan, lumière douce | 1920×1440 (4:3) | **Hero homepage** (CRITIQUE) |
| `flyers-stack.jpg` | **Photo studio** | Stack de brochures HM avec gradient visible en cover | 1600×1000 (16:10) | Section print homepage |
| `posters.jpg` | **Photo studio** | 2 affiches debout sur fond mural neutre, motifs gradient | 1600×1000 | Section print homepage |
| `canvas-wall.jpg` | **Photo lifestyle** | Toile canvas accrochée dans un bureau / café, gradient violet | 1600×1000 | Section print homepage |
| `textile-hero.jpg` | **Photo lifestyle** | Hoodie noir, t-shirt blanc, sweat gris portés ou alignés au sol bois | 1920×1440 | Variation hero, ou Card "Textile" QuickEntries |
| `equipe-atelier.jpg` | **Photo authentique** | Équipe HM Global dans l'atelier de Souffelweyersheim en train de DTF / broderie / pliage | 1920×1280 (16:10) | Section "À propos" / Pack 360 / CTA final |
| `client-portant-polo.jpg` | **Photo lifestyle** | Client (restaurateur, technicien, commerçant) portant un polo brodé HM | 1080×1350 (4:5 IG) | Témoignage + carte "Projet complet" |
| `bat-process.jpg` | **Photo macro** | Gros plan sur un BAT papier annoté + main qui valide | 1600×1067 | Section confiance / page "Techniques" |
| `signaletique-vehicule.jpg` | **Photo lifestyle** | Véhicule professionnel habillé HM Global, ext. réel | 1920×1280 | Page entreprises, footer ou Pack 360 |
| `goodies-pack.jpg` | **Photo studio** | Mug + tote-bag + carnet + stylo HM Global posés ensemble | 1600×1067 | Cross-sell goodies |

### G.3 — Sources photo

Si impossible de shooter en interne :
- **Mannequins** : agence locale strasbourgeoise (budget ~600-1500 € journée).
- **Atelier** : faire venir un photographe d'entreprise local (~400 € matinée).
- **Lifestyle clients** : demander aux 5 meilleurs clients d'envoyer 1 photo "produit en situation" en échange d'un avoir.
- **Stock** : Unsplash + Pexels pour fond gradient, bureau, mais JAMAIS pour mannequin (risque de retrouver la photo ailleurs).

### G.4 — Placement et formats

- Bannière hero : 4:3 desktop, 1:1 mobile.
- Card produit : 4:5 ou 1:1.
- Bannière section : 16:10 ou 16:9.
- Témoignage : 1:1 ou 4:5 (photo + portrait).
- Footer signature : 16:9.
- Instagram-ready : 1:1 (post) et 9:16 (story).

Tous les fichiers en `webp` (priorité) ou `jpg` qualité 85, max 350 ko par image.

---

## H. Plan d'action priorisé

### P1 — À faire maintenant (semaine 1-2)

1. **Uploader `pack-complet.jpg`** dans `/public/mockups/` — c'est le visuel hero, l'absence laisse un trou.
2. **Migrer palette dans `Header.tsx`** : CTA "Commander" + hovers passent à `--hm-violet` / `--hm-magenta`.
3. **Migrer palette dans `BestSellers.tsx`** : `--hm-primary` → `--hm-violet`, hover border → `--hm-magenta`.
4. **Migrer palette dans `Footer.tsx`** : tous les `--hm-rose` → `--hm-magenta`, accent purple → `--hm-violet`.
5. **Remplacer `text-gradient-gold`** par un nouveau `text-gradient-hm` (violet→magenta→cyan) dans `catalogue/page.tsx`, `impression/page.tsx`, `TrustBand.tsx`.
6. **Ajouter une utility-bar fine** au-dessus du header (8 mots de réassurance, fond violet).
7. **Ajouter une bande "logos clients" + 3 témoignages** dans la homepage entre `HomeTrustStrip` et `HomePack360`.
8. **Remplacer les emojis** par icônes lucide dans `impression/page.tsx:187` et autres apparitions.

### P2 — Amélioration importante (semaine 3-5)

9. **Réintégrer `TrustBand` simplifié** (6 secteurs uniquement) après `HomeTrustStrip`.
10. **Ajouter section "Réalisations" homepage** (3 cards cas client) avant le CTA final.
11. **Shooting photo** : pack complet, équipe atelier, 2 clients portant produits, 1 véhicule.
12. **Refondre catalogue listing** : bannière haute + bloc "Sélection saison" + filtres pills couleur violet plein.
13. **Refondre impression** : hiérarchie 3 best-sellers + 2 secondaires.
14. **Migrer palette product page** + ajouter cross-sell.
15. **Ajouter newsletter footer** + bouton Instagram bandeau.
16. **Bandeau de réassurance product page** ("BAT 48h / Production France / Livraison 72h").

### P3 — Amélioration plus tard (semaine 6+)

17. **Embed Instagram feed** (6 derniers posts) sous le CTA final.
18. **Embed Google Maps** sur page contact.
19. **Calendly RDV projet** sur contact pour > 50 pièces.
20. **Logos officiels paiements** SVG dans footer.
21. **Migrer palette admin / studio** (en dernier, sensible).
22. **Refonte page entreprises + page réalisations** (hors scope homepage).

---

## I. Proposition de nouvelle structure homepage idéale

```
┌─────────────────────────────────────────────────┐
│ UTILITY BAR — fin de page, fond violet, 11px    │   ← NEW (P1)
│ "Production Alsace · BAT validé · Devis 24h"    │
├─────────────────────────────────────────────────┤
│ HEADER — palette violet/magenta (migrée)        │   ← migrer
├─────────────────────────────────────────────────┤
│ 1. HERO PREMIUM                                 │   ✅ déjà refondu
│    - Pack complet visuel                        │
│    - 2 CTA + chip prix + chip note ★            │   ← AJOUTER chips
├─────────────────────────────────────────────────┤
│ 2. BANDE LOGOS CLIENTS (6-8 logos N&B)          │   ← NEW (P1)
├─────────────────────────────────────────────────┤
│ 3. 3 ENTRÉES RAPIDES                            │   ✅ déjà refondu
│    Textile / Print / Projet complet             │
├─────────────────────────────────────────────────┤
│ 4. BEST-SELLERS TEXTILE                         │   ✅ + migrer palette
│    4 produits Printify                          │
├─────────────────────────────────────────────────┤
│ 5. SECTION PRINT VISUELLE                       │   ✅ déjà refondu
│    4 cards larges                               │
├─────────────────────────────────────────────────┤
│ 6. 3 TÉMOIGNAGES CLIENTS                        │   ← NEW (P1)
│    Photo + nom + entreprise + 1 phrase          │
├─────────────────────────────────────────────────┤
│ 7. RÉASSURANCE 4 ITEMS (TrustStrip)             │   ✅ déjà refondu
├─────────────────────────────────────────────────┤
│ 8. SECTEURS SERVIS (6 chips)                    │   ← REINJECTER (P2)
│    Restaurants / BTP / Clubs / Retail / PME...  │
├─────────────────────────────────────────────────┤
│ 9. RÉALISATIONS (3 cas concrets)                │   ← NEW (P2)
│    Photo + métier + livrables livrés            │
├─────────────────────────────────────────────────┤
│ 10. PACK 360 (gradient violet → bleu nuit)      │   ✅ déjà refondu
├─────────────────────────────────────────────────┤
│ 11. CTA FINAL                                   │   ✅ déjà refondu
├─────────────────────────────────────────────────┤
│ 12. INSTAGRAM FEED (6 posts)                    │   ← NEW (P3)
├─────────────────────────────────────────────────┤
│ FOOTER — palette migrée + newsletter            │   ← migrer (P1) + NEW (P2)
└─────────────────────────────────────────────────┘
```

→ 12 blocs, mais chacun avec un rôle clair et complémentaire. Cap de longueur respecté car blocs courts.

---

## J. Recommandations de copywriting

### J.1 — Hero (actuel : "Textile, print et communication visuelle pour les entreprises.")

**Bon mais améliorable.**

Variantes à tester :
- "L'agence de communication visuelle qui produit aussi votre textile."  
  *(positionnement clair : on est une agence, on fait aussi le textile)*
- "Textile, print, identité visuelle : un seul interlocuteur pour toute votre image de marque."  
  *(promesse de pack)*
- "Habillez vos équipes. Imprimez vos supports. Maîtrisez votre image."  
  *(rythme ternaire fort, plus marketing)*

**Recommandation principale :**
> **« Textile, print et communication visuelle — fabriqués en Alsace, livrés partout en France. »**  
> Sous-titre : « HM Global Agence accompagne marques, restaurants, clubs, associations et PME dans la création de supports professionnels cohérents : vêtements personnalisés, cartes, flyers, affiches, signalétique. Un seul interlocuteur, du brief à la livraison. »

### J.2 — Section textile (actuel : "Les textiles les plus commandés")

**Bon. À sublimer :**
> **« Bestsellers textile · prêts à recevoir votre logo. »**  
> Sous-titre : « Une sélection courte et solide : t-shirts, sweats, hoodies et polos déjà testés par 200+ équipes. Configurez votre marquage en ligne ou demandez un devis volume — la production démarre après votre validation BAT. »

### J.3 — Section print (actuel : "Cartes, flyers, affiches : vos supports prêts à imprimer.")

**Bon, à enrichir :**
> **« Cartes, flyers, affiches : vos supports imprimés sans surprise. »**  
> Sous-titre : « Envoyez votre fichier PDF, on cadre le BAT avec vous puis on lance la production sur le bon papier au bon grammage. Délai annoncé, qualité contrôlée, livraison France. »

### J.4 — Pack 360 (actuel : "Un seul interlocuteur pour toute votre communication.")

**Excellent — garder.** Ajouter un sous-bénéfice :
> Sous-titre actuel ✅ + ajout : *« Logo + textile + print + signalétique pensés ensemble — pour que votre image soit cohérente sur tous les points de contact, du polo de l'équipe à la carte du restaurant. »*

### J.5 — CTA final (actuel : "Besoin d'un pack complet pour votre entreprise ?")

**Bon. Renforcer urgence + facilité :**
> **« Vous avez un projet, on a l'atelier. »**  
> Texte : « Envoyez-nous votre logo, votre brief ou même juste votre idée. On vous rappelle sous 24h ouvrées avec une recommandation chiffrée — pas de devis robotisé, pas de discours commercial : un vrai retour humain. »  
> Bouton : « Démarrer mon projet »

---

## K. Conclusion

### Ce qu'il faut GARDER

- ✅ La nouvelle architecture homepage 7 blocs (refonte fraîche).
- ✅ La nouvelle palette officielle 2026 (violet `#3B235A` + magenta `#C13C8A` + cyan `#54B6D2`).
- ✅ L'intégration Printify (`BestSellers`) intacte.
- ✅ La richesse fonctionnelle des fiches produit (`USE_CASES` + `STRENGTHS` + recommandation technique).
- ✅ La nav header complète avec dropdowns.
- ✅ Le footer riche.
- ✅ Le wording général (français pro, ton confiant).

### Ce qu'il faut CHANGER

- ❌ Incohérence palette homepage / reste du site → **migrer en cascade** (header → footer → catalogue → impression → product → admin).
- ❌ Effet "gold gradient" omniprésent → renommer en `text-gradient-hm` (violet → magenta → cyan).
- ❌ Typo `font-black` envahissante → repasser en `font-semibold`.
- ❌ Mockups uniquement → mixer avec **vraies photos atelier et lifestyle**.
- ❌ Pas de preuves sociales → ajouter **bande logos + 3 témoignages + note Google**.
- ❌ Emojis dans `impression/page.tsx` → icônes lucide.

### Ce qu'il faut ÉVITER

- ❌ Refaire une refonte DA encore plus grosse — la palette officielle est bonne, il faut la propager, pas la rejouer.
- ❌ Modifier les composants critiques (`MockupViewer`, `Studio`, `checkout`, panier, Stripe, Supabase, Printify) tant que la migration palette n'est pas validée.
- ❌ Ajouter des animations parallax lourdes ou des sliders à zoom — le site doit rester rapide.
- ❌ Saturer Instagram-style : on positionne **Corporate Créatif Premium**, pas "boutique Insta jeune".

### Prochaine mission de code recommandée

**Mission P1 (5-8h dev) — "Migration palette globale + utility-bar + bande logos clients" :**

Fichiers concernés :
1. `app/globals.css` — créer `text-gradient-hm`, ajouter `.hm-utility-bar`, conserver `text-gradient-gold` en dépréciation interne pour ne rien casser.
2. `components/layout/Header.tsx` — ajouter utility-bar au-dessus, migrer hovers et CTA vers palette 2026.
3. `components/layout/Footer.tsx` — migrer accents `--hm-rose` → `--hm-magenta`, accent `--hm-purple` → `--hm-violet`.
4. `components/home/BestSellers.tsx` — migrer hover + CTA encart bas vers palette 2026.
5. `app/catalogue/page.tsx` — remplacer `text-gradient-gold` par `text-gradient-hm`, migrer pills filtres actifs.
6. `app/impression/page.tsx` — idem + remplacer emojis par icônes lucide + migrer CTA final.
7. **Nouveau composant** `components/home/HomeLogosClients.tsx` — bande 6-8 logos clients en niveaux de gris.
8. **Nouveau composant** `components/home/HomeTestimonials.tsx` — 3 témoignages avec photo + nom + entreprise.

Intégration `app/page.tsx` : insérer `HomeLogosClients` après `HomeHeroPremium`, insérer `HomeTestimonials` entre `HomeVisualShowcase` et `HomeTrustStrip`.

**Validation visuelle nécessaire avant merge :** Header, Catalogue, Impression, Footer testés sur mobile + desktop.

---

*Fin du rapport.*
