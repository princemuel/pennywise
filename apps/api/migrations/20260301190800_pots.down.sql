-- Add down migration script here
DROP TRIGGER IF EXISTS trg_pots_updated_at ON pots;
DROP INDEX IF EXISTS idx_pot_transactions_pot_id;
DROP INDEX IF EXISTS idx_pots_user_id;
DROP TABLE IF EXISTS pot_transactions;
DROP TABLE IF EXISTS pots;
