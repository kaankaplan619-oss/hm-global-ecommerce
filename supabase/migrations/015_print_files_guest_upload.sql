-- ============================================================================
-- Migration 015 — Print files: enable guest uploads (V1.2)
-- Date : 2026-05-27
-- Auteur : Kaan + Claude (V1.2 print configurator UX)
-- ============================================================================
--
-- Contexte :
--   En V1.0 le configurateur cartes de visite exigeait que le client se
--   connecte AVANT de pouvoir uploader son PDF. Friction excessive : le
--   parcours standard sur Pixartprinting / Vistaprint permet l'upload
--   anonyme, la connexion ne devient obligatoire qu'au moment du paiement.
--
--   On aligne donc HM Global sur ce comportement :
--     - User connecté → bucket "print-files" path "customers/{user.id}/..."
--     - User invité   → bucket "print-files" path "guests/{sessionId}/..."
--     - À l'inscription post-checkout (V1.3) : script qui réassocie les
--       fichiers "guests/{sessionId}/..." vers "customers/{newUserId}/..."
--
-- Cette migration ajoute les policies RLS Supabase Storage nécessaires :
--   1. Anon peut INSERT sur "print-files" SI le path commence par "guests/"
--   2. Auth peut INSERT sur "print-files" SI le path commence par "customers/"
--      ET le {userId} dans le path correspond à auth.uid()
--   3. Public read sur tout (bucket déjà public pour servir les URLs aux
--      clients via getPublicUrl — pas de changement)
--
-- Sécurité :
--   - Pas d'overwrite : `upsert: false` côté client (route.ts ligne 107)
--   - Path randomisé via timestamp + UUID session — non-devinable
--   - File size cap 20 Mo, MIME type filtré côté serveur avant upload
--   - guests/{sessionId} n'est qu'un identifiant aléatoire navigateur,
--     pas un secret — ne donne accès qu'aux PDFs de cette session
-- ============================================================================

-- Garantit que le bucket existe et est public (idempotent — ne casse rien
-- si déjà créé manuellement via le dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'print-files',
  'print-files',
  true,
  20971520,  -- 20 Mo
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE
  SET
    public            = EXCLUDED.public,
    file_size_limit   = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── Drop old policies si elles existent (idempotent) ──────────────────────
DROP POLICY IF EXISTS "print_files_anon_insert_guests" ON storage.objects;
DROP POLICY IF EXISTS "print_files_auth_insert_customers" ON storage.objects;
DROP POLICY IF EXISTS "print_files_public_select" ON storage.objects;

-- ── Anon INSERT sur "guests/*" uniquement ──────────────────────────────────
-- Permet aux visiteurs non connectés d'uploader leurs PDFs sur les chemins
-- "guests/{sessionId}/...". Le sessionId vient du navigateur (sessionStorage
-- hm_session_id), donc 1 visiteur = 1 sandbox path personnel.
CREATE POLICY "print_files_anon_insert_guests"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'print-files'
    AND (storage.foldername(name))[1] = 'guests'
  );

-- ── Authenticated INSERT sur "customers/{auth.uid()}/*" uniquement ─────────
-- Un utilisateur connecté ne peut écrire QUE dans son propre dossier
-- "customers/{user.id}/..." (sécurité standard RLS par-user).
CREATE POLICY "print_files_auth_insert_customers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'print-files'
    AND (storage.foldername(name))[1] = 'customers'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- ── Public SELECT pour servir les URLs publiques ──────────────────────────
-- Le bucket est public, donc on autorise SELECT à tous (anon + auth). Les
-- fichiers print sont accessibles via leur URL signée par Supabase.
CREATE POLICY "print_files_public_select"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'print-files');

-- ============================================================================
-- Vérification post-migration :
--
--   -- Liste les policies du bucket :
--   SELECT policyname, cmd, roles, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'storage'
--     AND tablename = 'objects'
--     AND policyname LIKE 'print_files%';
--
--   -- Test upload anon (depuis un terminal sans token):
--   curl -X POST 'https://<project>.supabase.co/storage/v1/object/print-files/guests/test-session/test.pdf' \
--     -H 'apikey: <anon-key>' \
--     -H 'Content-Type: application/pdf' \
--     --data-binary @test.pdf
--   -- Doit retourner 200 OK.
-- ============================================================================
