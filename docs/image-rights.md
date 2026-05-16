# Doctrine images HM Global

Ce document fixe la separation entre images fournisseur, images catalogue et images atelier/BAT.
Objectif V1 : vendre vite avec des visuels catalogue fiables, tout en gardant les rendus logo client dans un cadre legal et maitrise.

## 1. Images fournisseur

Les images fournisseur peuvent etre utilisees pour :

- catalogue
- fiches produits
- galerie produit
- reassurance client

Sources possibles, sous reserve de respecter les droits, chartes et conditions d'acces :

- TopTex Phototheque, CDN ou API
- Falk&Ross espace client / Support & Downloads
- B&C Marketing Resources Hub
- Printful mockup generator ou API pour les produits Printful

Interdictions :

- Ne jamais poser un logo client sur une image fournisseur sans autorisation ecrite.
- Ne pas utiliser Google Images comme source.
- Ne pas scraper des sites tiers.
- Ne pas modifier fortement les packshots fournisseur.

## 2. Images HM Global

Les images HM Global sont reservees aux usages ou HM Global maitrise le rendu final :

- atelier de personnalisation
- previsualisation logo client
- BAT Sharp HD
- admin production

Sources autorisees :

- photos maison
- Blender
- images generees ou retravaillees par HM Global
- assets achetes avec licence commerciale claire

## 3. Regle technique

- `supplierImages` et `public/supplier-images/**` = catalogue, fiches produits et galeries uniquement.
- `hmMockupImages`, `hmMockupImagesBack` et `public/mockups/hm/textile/**` = atelier, personnalisation, BAT et production uniquement.
- Les assets Print V1 Blender = visuels marketing / impression.
- Sharp BAT = rendu final HD avec images HM Global uniquement.

Structure cible :

```txt
public/supplier-images/toptex/{productSlug}/
public/supplier-images/falkross/{productSlug}/
public/supplier-images/printful/{productSlug}/

public/mockups/hm/textile/{productSlug}/{color}/front.webp
public/mockups/hm/textile/{productSlug}/{color}/back.webp
```

## 4. Regle de securite

Si une image vient d'un fournisseur, elle ne sert pas de base a un rendu client personnalise.
Si une image recoit un logo client, elle doit venir d'une source HM Global ou d'un asset dont la licence commerciale autorise explicitement cet usage.

