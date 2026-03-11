-- Add down migration script here
-- Drop pot_transactions first: it holds the FK reference to pots.
-- The trg_sync_pot_total trigger is dropped automatically with pot_transactions.
-- Remaining triggers, indexes, policies, and RLS drop automatically with each table.
DROP TABLE IF EXISTS pot_transactions CASCADE;

DROP TABLE IF EXISTS pots CASCADE;
