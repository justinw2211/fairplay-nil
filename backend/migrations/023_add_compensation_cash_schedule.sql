-- 023_add_compensation_cash_schedule.sql
-- Add server-side field to persist payment schedule for cash compensation

ALTER TABLE deals
ADD COLUMN IF NOT EXISTS compensation_cash_schedule TEXT
  CHECK (compensation_cash_schedule IN (
    'lump_sum',
    'monthly',
    'quarterly',
    'per_deliverable',
    'milestone_based',
    'other'
  ));

-- Optional: backfill nulls remains null; no data migration required


