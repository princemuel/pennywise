-- Add up migration script here
-- Direction enum: cleaner than relying on sign of amount.
-- amount is always positive; direction tells you which way money moved.
CREATE TYPE transaction_direction AS ENUM ('credit', 'debit');
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    direction transaction_direction NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    recurring BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- No updated_at: transactions are immutable records.
    -- Corrections should be a reversal + new entry (double-entry bookkeeping).
);
-- uuidv7 is time-ordered (timestamp in high bits), so id DESC = newest first.
-- Keyset pagination cursor only needs id — no composite (date, id) required.
CREATE INDEX idx_transactions_id_desc ON transactions (id DESC);
-- Still index date for range queries (e.g. "this month's spending")
CREATE INDEX idx_transactions_date ON transactions (date DESC);
CREATE INDEX idx_transactions_category_id ON transactions (category_id);
CREATE INDEX idx_transactions_avatar_id ON transactions (avatar_id);
CREATE INDEX idx_transactions_user_id ON transactions (user_id);
-- Covering index for the transactions list page (avoids heap fetch for common columns)
CREATE INDEX idx_transactions_keyset ON transactions (user_id, id DESC) INCLUDE (amount, direction, date, category_id, avatar_id);
