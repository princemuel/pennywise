-- Add up migration script here
CREATE TABLE IF NOT EXISTS pots (
    id UUID PRIMARY KEY DEFAULT UUIDV7(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target NUMERIC(12, 2) NOT NULL CHECK (target > 0),
    theme CHAR(7) NOT NULL CHECK (theme ~ '^#[0-9A-Fa-f]{6}$'),
    -- total is maintained automatically by the sync_pot_total trigger (see triggers migration).
    -- Do NOT update this column directly from application code.
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    deleted_at TIMESTAMPTZ,
    --
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX idx_pots_user_id ON pots (user_id);


CREATE TRIGGER trg_pots_updated_at BEFORE
UPDATE ON pots FOR EACH ROW
EXECUTE FUNCTION set_updated_at ();


-- Row-level security
ALTER TABLE pots ENABLE ROW LEVEL SECURITY;


CREATE POLICY pots_isolation ON pots USING (
    user_id = CURRENT_SETTING('app.current_user_id', TRUE)::UUID
);


-- Audit trail for every pot deposit/withdrawal.
-- Uses the same kind enum as transactions for consistency:
--   credit = money added to pot, debit = money withdrawn from pot.
-- amount is always positive; kind indicates the movement.
-- This replaces the previous signed-amount convention which conflicted
-- with the transactions table design.
CREATE TABLE IF NOT EXISTS pot_transactions (
    id UUID PRIMARY KEY DEFAULT UUIDV7(),
    pot_id UUID NOT NULL REFERENCES pots (id) ON DELETE CASCADE,
    -- Denormalized for convenience: avoids a join through pots to find a user's pot activity.
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    kind kind NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX idx_pot_transactions_pot_id ON pot_transactions (pot_id, id DESC);


CREATE INDEX idx_pot_transactions_user_id ON pot_transactions (user_id);


-- Trigger to keep pots.total accurate after every pot_transaction change.
-- Defined in triggers migration; attached here once the table exists.
CREATE TRIGGER trg_sync_pot_total
AFTER INSERT OR
UPDATE OR
DELETE ON pot_transactions FOR EACH ROW
EXECUTE FUNCTION sync_pot_total ();


-- Row-level security (pot_id join would be needed without user_id column)
ALTER TABLE pot_transactions ENABLE ROW LEVEL SECURITY;


CREATE POLICY pot_transactions_isolation ON pot_transactions USING (
    user_id = CURRENT_SETTING('app.current_user_id', TRUE)::UUID
);
