-- Add down migration script here
-- Drop the covering/indexes first
DROP INDEX IF EXISTS idx_transactions_keyset;
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_transactions_avatar_id;
DROP INDEX IF EXISTS idx_transactions_category_id;
DROP INDEX IF EXISTS idx_transactions_date;
DROP INDEX IF EXISTS idx_transactions_id_desc;
-- Drop the table
DROP TABLE IF EXISTS transactions;
-- Drop the enum type
DROP TYPE IF EXISTS transaction_direction;
