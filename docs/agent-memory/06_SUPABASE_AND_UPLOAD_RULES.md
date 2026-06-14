# 06 — Règles Supabase et upload

Dernière mise à jour : 2026-06-14.

## État actuel

L’ancien comportement « upload invité local uniquement » est remplacé dans le
working tree par un upload serveur compatible avec la commande invitée.

Flux textile/Studio :

1. le navigateur appelle `lib/uploadLogo.ts` ou `lib/uploadStudioAsset.ts` ;
2. `POST /api/studio/upload-asset` valide origine, session, type et taille ;
3. la route serveur utilise la service role sans l’exposer au navigateur ;
4. le fichier est placé dans le bucket public `customer-logos` ;
5. l’URL et le chemin sont stockés dans le panier puis la commande.

Ce flux a été validé localement le 2026-06-14. La validation production reste
obligatoire après déploiement.

## Fichiers concernés

- `lib/uploadLogo.ts`
- `lib/uploadStudioAsset.ts`
- `lib/uploadComposedPreview.ts`
- `app/api/studio/upload-asset/route.ts`
- `components/product/ProductConfigurator.tsx`
- `components/studio/StudioSummaryPanel.tsx`
- `app/checkout/page.tsx`

Toute modification de ce contrat exige un E2E Studio → panier → checkout et une
vérification que les URL publiques ne sont ni des `blob:` ni des data URLs.

## Bucket textile et Studio

```text
Nom        : customer-logos
Visibilité : public
Taille max : 10 Mo côté route
Types      : PNG, JPG, SVG côté route
Chemin     : studio-exports/{sessionId}/{timestamp}-{kind}-{filename}
```

`sessionId` doit être un UUID navigateur stable. Les valeurs de `kind`
autorisées sont `logo`, `print`, `preview-face` et `preview-back`.

`lib/uploadLogo.ts` limite actuellement le logo utilisateur à PNG et SVG. La
route accepte aussi JPG pour les exports et aperçus.

## Print

Les fichiers d’impression utilisent le bucket séparé `print-files` via
`POST /api/orders/upload-print-file`.

```text
Connecté : customers/{userId}/...
Invité   : guests/{sessionId}/...
```

Ne pas mélanger les fichiers print haute définition et les assets Studio sans
une migration documentée.

## Variables Vercel — ne pas modifier

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

La service role reste exclusivement côté serveur. Ne jamais la logger, la
retourner dans une réponse ou la préfixer en `NEXT_PUBLIC_`.

## Garde-fous

- Ne pas supprimer ou renommer les buckets sans migration.
- Ne pas élargir taille ou MIME sans vérifier Supabase et les routes.
- Ne pas remplacer les URL publiques par des data URLs dans une commande.
- Ne pas contourner la route serveur par une policy d’écriture anonyme globale.
- Auditer limitation de débit, nettoyage des fichiers orphelins et abus avant
  une campagne publicitaire importante.
