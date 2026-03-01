-- Add down migration script here
DROP TRIGGER IF EXISTS trg_budgets_updated_at ON budgets;
DROP INDEX IF EXISTS idx_budgets_user_category_active;
DROP INDEX IF EXISTS idx_budgets_user_id;
DROP TABLE IF EXISTS budgets;
