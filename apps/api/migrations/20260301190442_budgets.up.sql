-- Add up migration script here
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
    maximum NUMERIC(12, 2) NOT NULL CHECK (maximum > 0),
    theme CHAR(7) NOT NULL CHECK (theme ~ '^#[0-9A-Fa-f]{6}$'),
    -- Time dimension: when this budget amount was/is in effect.
    -- valid_from is the first calendar month (truncated to month start) this budget applies.
    -- valid_to NULL means it is the current active budget for that category.
    -- When a user changes a budget, set valid_to = NOW() on the old row and insert a new one.
    -- This preserves history: "what was my Entertainment budget in July?" is now answerable.
    valid_from TIMESTAMPTZ NOT NULL DEFAULT DATE_TRUNC('month', NOW()),
    valid_to TIMESTAMPTZ,
    -- Soft delete retained for explicit user deletion (vs supersession via valid_to).
    deleted_at TIMESTAMPTZ,
    --
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        valid_to IS NULL
        OR valid_to > valid_from
    )
);

-- One active (not superseded, not deleted) budget per user per category
CREATE UNIQUE INDEX idx_budgets_user_category_active ON budgets (user_id, category_id)
WHERE
    valid_to IS NULL
    AND deleted_at IS NULL;

CREATE INDEX idx_budgets_user_id ON budgets (user_id);

CREATE TRIGGER trg_budgets_updated_at BEFORE
UPDATE ON budgets FOR EACH ROW
EXECUTE FUNCTION set_updated_at ();

-- Row-level security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY budgets_isolation ON budgets USING (
    user_id = current_setting('app.current_user_id', TRUE)::UUID
);
