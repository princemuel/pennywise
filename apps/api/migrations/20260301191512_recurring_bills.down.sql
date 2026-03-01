-- Add down migration script here
-- Drop triggers
DROP TRIGGER IF EXISTS trg_recurring_bills_updated_at ON recurring_bills;
-- Drop indexes (optional, will be removed with table automatically)
DROP INDEX IF EXISTS idx_rbp_unpaid;
DROP INDEX IF EXISTS idx_rbp_deadline;
DROP INDEX IF EXISTS idx_rbp_bill_id;
DROP INDEX IF EXISTS idx_recurring_bills_user_id;
-- Drop child table first
DROP TABLE IF EXISTS recurring_bill_payments;
-- Drop parent table last
DROP TABLE IF EXISTS recurring_bills;
