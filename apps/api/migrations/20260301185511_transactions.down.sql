-- Add down migration script here
-- Triggers, indexes, policies, and RLS are dropped automatically with the table.
DROP TABLE IF EXISTS transactions CASCADE;


-- Drop the kind enum only after all tables using it are gone.
-- CASCADE handles any residual dependencies (e.g. pot_transactions if already dropped).
DROP TYPE IF EXISTS kind CASCADE;
