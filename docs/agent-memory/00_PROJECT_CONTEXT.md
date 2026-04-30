# 00 — Project Context

## Projet

**HM Global Agence** — site e-commerce B2B de textile personnalisé.

Agence créative avec atelier de production, basée à Souffelweyersheim (Alsace).
Spécialisée en textile personnalisé, communication visuelle, préparation de fichiers pour l'impression.

## Objectif du site

Vendre et présenter des textiles personnalisables à des professionnels (entreprises, associations, équipes événementielles).
Permettre au client de configurer son produit, uploader son logo, visualiser un aperçu, et valider un BAT avant production.

## Stack technique

- **Framework** : Next.js 15 (App Router)
- **UI** : Tailwind CSS avec design tokens CSS custom (`--hm-*`)
- **Auth + Storage** : Supabase (bucket `customer-logos`, tables `orders`, `order_items`, `profiles`)
- **Paiement** : Stripe
- **Canvas mockup** : Fabric.js v6
- **Déploiement** : Vercel (production : `hm-global.vercel.app`)

## Produits principaux

| Famille | Exemples |
|---|---|
| T-shirts | B&C Exact 190, iDeal 190 |
| Hoodies / Zoodies | B&C Set In Sweat |
| Softshells / Vestes | B&C Softshell |
| Polos | (à venir) |

## Techniques de personnalisation

- DTF (Direct To Film) — populaire, couleurs illimitées
- Flex / Vinyle — logos simples
- Broderie — finition premium

## Direction produit

Le site ne doit **pas** ressembler à un catalogue fournisseur générique (TopTex, B&C, SanMar).
Les images fournisseur peuvent servir de référence technique, mais pas de vitrine principale.
L'identité visuelle doit être premium, propre, professionnelle, et donner envie d'acheter.
