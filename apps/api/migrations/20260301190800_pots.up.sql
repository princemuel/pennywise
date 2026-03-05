-- Add up migration script here
CREATE TABLE IF NOT EXISTS pots (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target NUMERIC(12, 2) NOT NULL CHECK (target > 0),
    theme CHAR(7) NOT NULL CHECK (theme ~ '^#[0-9A-Fa-f]{6}$'),
    -- Denormalized cache: always equals SUM(pot_transactions.amount) for this pot.
    -- Kept in sync by app logic on every add/withdraw operation.
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pots_user_id ON pots (user_id);
CREATE TRIGGER trg_pots_updated_at BEFORE
UPDATE ON pots FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Audit trail for every add/withdraw.
-- Positive = deposit, negative = withdrawal.
CREATE TABLE IF NOT EXISTS pot_transactions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    pot_id UUID NOT NULL REFERENCES pots(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount <> 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pot_transactions_pot_id ON pot_transactions (pot_id, id DESC);
