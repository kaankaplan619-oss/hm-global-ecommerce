# Vision Plateforme HM Global Agence
**Créé le : mai 2026 — Document de référence inter-sessions**

---

## 1. Contexte et positionnement

HM Global Agence est une agence de communication / branding / production, pas un simple revendeur textile.

**Ce que le site doit être :**
Un portail de commande et de gestion de projet couvrant toutes les lignes de service HM Global — pas uniquement le textile.

**Ce que le site ne doit pas être :**
Un catalogue TopTex re-skinné ou un site e-commerce générique.

**Lignes de service HM Global :**
- Textile personnalisé (DTF, flex, broderie)
- PAO / création graphique
- Impression (flyers, menus, cartes de visite)
- Bâches et banderoles
- Signalétique et enseignes
- Habillage véhicule
- Supports publicitaires
- Objets personnalisés
- Projets web
- Prestations de communication globale

---

## 2. Architecture future — Sections à prévoir

```
HM Global Agence (plateforme)
│
├── Textile personnalisé          ← Phase A/B — en cours
│     ├── Catalogue produits
│     ├── Configurateur (logo + technique + placement)
│     ├── Devis rapide
│     └── Commande + paiement
│
├── Print & PAO                   ← Phase D
│     ├── Flyers / Dépliants
│     ├── Cartes de visite
│     ├── Menus / Supports
│     ├── Bâches / Banderoles
│     └── Upload fichier + BAT
│
├── Signalétique & Enseignes      ← Phase D
│     ├── Enseignes lumineuses
│     ├── Habillage véhicule
│     ├── Vitrophanie
│     └── Panneaux / Totems
│
├── Web & Branding                ← Phase D
│     ├── Identité visuelle
│     ├── Sites web
│     └── Supports de communication
│
├── Devis rapide transversal      ← Phase C — formulaire multi-service
│
├── Espace client                 ← Phase C
│     ├── Historique commandes
│     ├── BAT en cours / validation
│     ├── Factures
│     └── Fichiers uploadés
│
└── Back-office admin             ← Phase C
      ├── Gestion commandes
      ├── Suivi production
      ├── Envoi BAT
      └── Connexion fournisseurs (Phase E)
```

**Principe architecture technique :**
Chaque ligne de service = module indépendant branchant sur des briques communes (auth, BAT, devis, notifications). On ne repart pas de zéro — on étend.

---

## 3. Direction artistique — Règles immuables

### Identité visuelle
- **Palette** : charcoal `#0c0e14`, rose HM `#b13f74`, blanc cassé `#f7f6f4`. Bonne — à exploiter davantage.
- Le rose est un vrai accent de marque : l'utiliser sur séparateurs, hovers, numéros de section, soulignements actifs.
- Typographie : hiérarchie plus affirmée sur H1/H2. Envisager une police display distinctive pour la Phase B.

### Règles absolues
- **Jamais** de photo mannequin en image principale du catalogue
- **Jamais** de photo stock générique (bureau, sourires, business generique)
- **Jamais** un rendu qui ressemble à un copier-coller TopTex
- **Jamais** de placeholder vide ou cassé — toujours un placeholder premium "Visuel à venir"

### Ambition long terme
Une agence qui maîtrise la production et le design. Le site doit le montrer.

---

## 4. Stratégie visuels catalogue — Les 4 niveaux

### Niveau 1 — Asset HM propriétaire (priorité absolue)
- **Condition** : photo ou mockup réalisé/commandé par HM Global, fond HM, rendu unique
- **Affichage** : mode `"hm"` fond sombre charcoal + lumière rose, badge HM Global possible
- **Usage** : 5-10 bestsellers maximum, produits phares homepage
- **Effort** : élevé — session photo ou render Blender/3D
- **Exemples actuels** : tu01t (noir), tw02t (blanc), tu03t (bordeaux) — mockups locaux

### Niveau 2 — Packshot fournisseur propre (standard catalogue)
- **Condition** : image TopTex sur fond blanc/clair, sans mannequin, produit seul
- **Affichage** : mode `"supplier"` fond `#f7f6f4`
- **Usage** : la grande majorité du catalogue
- **Effort** : zéro — TopTex les fournit, mapper les couleurs correctement
- **Exemples actuels** : iDéal IB320/321/322/323, IB400/401/402/403, hoodies WG004

### Niveau 3 — AVIF local (performance + indépendance CDN)
- **Condition** : packshot fournisseur récupéré, optimisé, hébergé dans `/public/images/products/`
- **Affichage** : identique au niveau 2
- **Usage** : top 20 produits les plus consultés
- **Effort** : faible — download, conversion AVIF, mapping colorPackshots.ts
- **Exemples actuels** : wu620 (6 AVIF), jui62 (4 AVIF), tu01t (75+ AVIF — secondaires)

### Niveau 4 — Placeholder premium (dernier recours)
- **Condition** : aucune image propre disponible, mannequin, mauvaise qualité, CDN 404
- **Affichage** : icône Package Lucide + "Visuel à venir" sur fond neutre
- **Usage** : tout ce qui reste — jamais une image mannequin en principal
- **Effort** : zéro — déjà implémenté dans HMProductVisual.tsx
- **Exemples actuels** : ib900, ib6175, ib6176, wk904, kp157, kp162

### Sur le 3D / Blender / IA
- **Blender** : réserver aux 2-3 produits stars. Ne jamais en faire une dépendance systématique.
- **IA générative** : mockups de contexte (produit dans un environnement), pas remplacement packshot.
- **2.5D (Photoshop/Smartmockups)** : bonne option intermédiaire, effort modéré, résultat correct pour 80% des cas.

---

## 5. Roadmap Phase A → E

### Phase A — Stabilisation textile ← PRIORITÉ ACTUELLE
**Objectif** : le module textile est fiable, propre, vendable de bout en bout.

- [ ] Stripe webhook validé (paiement test → Supabase → email confirmation)
- [ ] Visuels catalogue : zéro mannequin, placeholders propres, AVIF locaux actifs
- [ ] Pages légales : CGV, confidentialité, mentions légales
- [ ] Parcours commande complet sans friction (du catalogue au paiement confirmé)
- [ ] Core Web Vitals / LCP catalogue optimisé
- [ ] SEO de base : metas, balises OG, sitemap

**Critère de sortie** : un client peut aller de la découverte produit jusqu'au devis validé / commande payée sans friction.

---

### Phase B — Direction artistique catalogue
**Objectif** : le site donne l'impression d'une agence, pas d'un catalogue revendeur.

- [ ] Homepage refonte : accroche globale HM + entrées par domaine + bestsellers
- [ ] Cards catalogue : hiérarchie visuelle, bestsellers mis en avant différemment
- [ ] Assets propriétaires pour 5 produits phares (photo ou render commandé)
- [ ] Menu desktop mega-menu + menu mobile refonte
- [ ] Footer enrichi (services complets, réassurances, contact direct)
- [ ] Micro-animations (scroll reveal, transitions pages, hovers profondeur)
- [ ] Typographie renforcée (heading display)

**Critère de sortie** : montrer le site à un directeur com d'une PME → il identifie immédiatement une agence sérieuse.

---

### Phase C — Espace client + BAT + Admin
**Objectif** : commandes tracées, BAT validés en ligne, admin fonctionnel.

- [ ] Authentification client (inscription, login, profil)
- [ ] Espace client : historique, statuts, téléchargement factures
- [ ] Upload fichier client (logo HD, brief) intégré au devis
- [ ] Module BAT : envoi admin, validation/refus client, commentaires
- [ ] Back-office admin (gestion commandes, statuts, export)
- [ ] Notifications email (devis reçu, BAT disponible, commande expédiée)

**Note** : justifie l'introduction d'une vraie BDD si pas encore en place (Supabase déjà utilisé — bien).

---

### Phase D — Nouvelles lignes de service
**Objectif** : le site reflète l'offre globale HM.

- [ ] Section Print & PAO : calculateur prix, upload, choix format/papier
- [ ] Section Signalétique : formulaire guidé, gabarits
- [ ] Section Web/Branding : présentation offres, portfolio, formulaire brief
- [ ] Devis rapide transversal multi-services
- [ ] Page "L'agence" : références clients, équipe, certifications

**Ordre** : Print d'abord (marché plus large, ticket élevé), puis Signalétique, puis Web/Branding.

---

### Phase E — API fournisseurs + Automatisation
**Objectif** : réduire la charge de gestion manuelle de 60%.

- [ ] API TopTex : synchro stocks, prix, disponibilités temps réel
- [ ] Workflow automatisé : commande → bon de commande fournisseur → suivi livraison
- [ ] Dashboard admin temps réel (CA, commandes en cours, alertes stock)
- [ ] Relances automatiques (devis sans suite, BAT non validé)

---

## 6. Interdictions — Ce qu'il ne faut jamais faire

| ❌ Interdit | Pourquoi |
|-------------|----------|
| Tout refaire en Blender | Coût exponentiel, non maintenable à l'échelle |
| Dépendre uniquement de TopTex | Risque CDN, mauvaise DA, pas propriétaire |
| Coder des fonctionnalités sans vision globale | On accumule de la dette sans cohérence |
| Mélanger trop de produits dès le départ | Sélectionner 30-50 produits et les travailler bien |
| Casser le checkout textile en cours | Tout ajout doit être additif, pas destructif |
| Lancer espace client avant que textile soit stable | L'espace client vide ne sert à rien |
| Construire back-office sophistiqué avant volume | Sur-ingénierie avant d'en avoir besoin |
| Photo stock générique sur le site | Tue la crédibilité d'une agence |
| Négliger le contenu au profit du dev | Un bon site sans contenu ne convertit pas |
| Pousser en prod sans test E2E du checkout | Le paiement est le flux critique |

---

## 7. Priorité actuelle (Phase A)

**Question à trancher à chaque session :**
> Le parcours commande (catalogue → panier → paiement → confirmation → Supabase) est-il fiable à 100% ?

Si non → Phase A en priorité absolue.
Si oui → on peut démarrer Phase B.

**Premières actions Phase B possibles quand Phase A terminée :**
1. Homepage globale HM (au-delà du textile)
2. 5 visuels propriétaires bestsellers (session photo ou Blender)
3. Menu mobile / header plus professionnel

---

*Ce document est la référence stratégique inter-sessions. Toujours le lire avant de coder une nouvelle fonctionnalité majeure.*
