-- ============================================================================
-- Migration 013 — Order items: composed BAT preview URLs
-- Date : 2026-05-26
-- Auteur : Kaan + Claude (admin workflow review + customer trust)
-- ============================================================================
--
-- Contexte :
--   Au moment où le client valide son BAT dans le Studio (modale "Aperçu de
--   votre personnalisation"), Fabric.js génère 2 images data URL base64
--   (face + dos) qui montrent le rendu final : packshot + logo overlayé +
--   contour transparent + ombre.
--
--   Jusqu'ici ces aperçus étaient gardés UNIQUEMENT en mémoire (zustand
--   cart store), exclus du localStorage (trop lourds) et JAMAIS persistés en
--   DB. Conséquences :
--     - Refresh navigateur = aperçus perdus → cart affiche juste le nom du logo
--     - Admin de commande = pas d'aperçu visuel du rendu à approuver
--     - Client peut douter de ce qu'il commande vraiment
--
--   On ajoute 2 colonnes à order_items pour persister les URLs publiques de
--   ces aperçus (uploadées en amont dans bucket customer-logos/previews/
--   par lib/uploadComposedPreview.ts).
--
-- Champs ajoutés :
--   composed_preview_url   text   nullable — URL publique de l'aperçu FACE
--   composed_preview_back  text   nullable — URL publique de l'aperçu DOS
--
-- Nullable parce que :
--   - Articles print (cartes de visite) n'ont pas de composé (utilisent
--     printConfig.frontFileUrl / backFileUrl directement)
--   - Articles textile sans personnalisation (vendus tels quels) n'ont pas
--     de composé non plus
--   - Si l'upload a échoué (réseau, auth), on garde l'article quand même
--
-- Pas d'index : ces colonnes sont lues uniquement quand on ouvre la fiche
-- commande détail, pas pour des recherches.
-- ============================================================================

BEGIN;

ALTER TABLE order_items
  ADD COLUMN composed_preview_url  text,
  ADD COLUMN composed_preview_back text;

COMMENT ON COLUMN order_items.composed_preview_url IS
  'URL publique Supabase Storage de l''aperçu BAT face (packshot + logo). '
  'Généré par Fabric.js dans le Studio, uploadé par '
  'lib/uploadComposedPreview.ts dans bucket customer-logos/previews/. '
  'Null = pas d''aperçu (article print, sans personnalisation, ou upload KO).';

COMMENT ON COLUMN order_items.composed_preview_back IS
  'URL publique Supabase Storage de l''aperçu BAT dos. Pareil que '
  'composed_preview_url mais pour le verso (dos du textile). Null si '
  'l''article n''a qu''un placement face.';

COMMIT;

-- ============================================================================
-- Vérification post-migration :
--
--   \d+ order_items
--   -- Doit montrer 2 nouvelles colonnes text nullable.
--
--   -- Une fois la première commande passée avec un BAT :
--   SELECT id, composed_preview_url IS NOT NULL AS has_face,
--          composed_preview_back IS NOT NULL AS has_back
--   FROM order_items
--   WHERE created_at >= NOW() - INTERVAL '1 day';
-- ============================================================================
