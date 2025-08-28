-- Adds user-managed labels to deals
-- Migration: 025_add_status_labels_to_deals.sql
-- Date: 2025-01-27

ALTER TABLE deals
ADD COLUMN IF NOT EXISTS status_labels jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN deals.status_labels IS 'User-managed status labels array. System labels (FMV Calculated, Cleared by NIL Go) are computed from deal data.';
