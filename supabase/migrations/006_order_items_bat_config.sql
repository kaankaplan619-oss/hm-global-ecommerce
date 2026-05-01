-- Migration 006 : Ajout champs BAT config dans order_items
-- Permet à l'admin de retrouver l'effet logo, la position Fabric.js et la référence BAT
-- après paiement, sans recontacter le client.

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS logo_file_path             text,
  ADD COLUMN IF NOT EXISTS logo_effect                text
    CONSTRAINT order_items_logo_effect_check
      CHECK (logo_effect IS NULL OR logo_effect IN ('none', 'white-outline', 'white-bg')),
  ADD COLUMN IF NOT EXISTS logo_placement_transform   jsonb,
  ADD COLUMN IF NOT EXISTS bat_ref                    text;
