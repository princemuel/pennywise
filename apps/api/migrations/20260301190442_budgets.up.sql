-- Add up migration script here
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    maximum NUMERIC(12, 2) NOT NULL CHECK (maximum > 0),
    theme CHAR(7) NOT NULL CHECK (theme ~ '^#[0-9A-Fa-f]{6}$'),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- One active budget per user per category at a time
CREATE UNIQUE INDEX idx_budgets_user_category_active ON budgets (user_id, category_id)
WHERE deleted_at IS NULL;
CREATE INDEX idx_budgets_user_id ON budgets (user_id);
CREATE TRIGGER trg_budgets_updated_at BEFORE
UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
