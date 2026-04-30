# 05 — Règles Supabase Upload Logo

## Statut

Infrastructure Supabase validée. Variables Vercel Production configurées. **Validation manuelle de l'upload logo en attente côté utilisateur (navigateur).**

## Bucket

```
Nom       : customer-logos
Visibilité: public
Taille max: 10 MB
Types     : PNG, JPEG, WEBP, SVG, PDF
```

## RLS (Row Level Security)

- INSERT : authentifié uniquement (`auth.uid() IS NOT NULL`)
- SELECT : public (URL publique accessible sans auth)

## Fichier concerné

```
lib/uploadLogo.ts
```

**Ne pas modifier sans raison explicite.**

## Variables Vercel Production — NE PAS TOUCHER

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Ces variables ont été ajoutées manuellement dans Vercel Production. Le redeploy est READY. Toute modification doit être explicitement demandée.

## Chemin de stockage

```
cart/{sessionId}/{timestamp}-{filename}
```

- `sessionId` = identifiant de session navigateur stable (pas l'orderId)
- Les fichiers sont déplacés / re-référencés à la création de commande

## Interface CartFile

```typescript
interface CartFile {
  name: string;
  size: number;
  type: string;
  url?: string;    // URL publique Supabase — défini après upload réussi
  path?: string;   // Chemin storage Supabase — défini après upload réussi
  uploadedAt?: string;
}
```

`url` et `path` sont **optionnels** — ils ne sont définis qu'après un upload réussi. Si l'utilisateur n'est pas connecté, le logo est conservé localement (File object) et uploadé depuis l'espace commande.

## Erreurs possibles

| Code | Signification |
|---|---|
| `NOT_AUTHENTICATED` | Pas de session Supabase active — normal si non connecté |
| `FILE_TOO_LARGE` | > 10 MB |
| `FORMAT_NOT_ALLOWED` | MIME type non autorisé |
| `SUPABASE_UPLOAD_ERROR` | Erreur bucket (vérifier RLS, variables) |
| `PUBLIC_URL_ERROR` | Upload OK mais URL non récupérable |

## Projet Supabase

```
ID : kbeeedbfkalovtusaden
Région : eu-west-3 (Paris)
Statut : ACTIVE_HEALTHY
```

## À ne jamais faire

- Ne pas modifier `lib/uploadLogo.ts` sans demande explicite
- Ne pas changer les variables Vercel Supabase sans accord
- Ne pas modifier la structure du chemin `cart/{sessionId}/...`
- Ne pas changer les types MIME autorisés sans mise à jour des settings bucket Supabase
- Ne pas supprimer ou modifier le bucket `customer-logos`
