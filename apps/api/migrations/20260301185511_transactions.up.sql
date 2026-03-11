-- Add up migration script here
-- kind enum: cleaner than relying on sign of amount.
-- amount is always positive; the type tells you which way money moved.
CREATE TYPE kind AS ENUM('credit', 'debit');


CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT UUIDV7(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    -- References merchants: the shop, biller, utility, or person on the other side.
    merchant_id UUID NOT NULL REFERENCES merchants (id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    kind kind NOT NULL,
    -- No future-dated transactions: financial records should reflect events that have occurred.
    -- The recurring_bills table is used for scheduled future payments.
    date TIMESTAMPTZ NOT NULL CHECK (date <= NOW() + INTERVAL '1 minute'),
    recurring BOOLEAN NOT NULL DEFAULT FALSE,
    --
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- No updated_at: transactions are immutable records.
    -- Corrections should be a reversal + new kind (double-kind bookkeeping).
);


-- uuidv7 is time-ordered (timestamp in high bits), so id DESC ≈ newest first.
-- Keyset pagination cursor only needs id — no composite (date, id) required.
-- idx_transactions_date is intentionally omitted: for per-user range queries
-- the covering index below is sufficient; a standalone date index adds write
-- overhead without meaningful read benefit.
CREATE INDEX idx_transactions_category_id ON transactions (category_id);


CREATE INDEX idx_transactions_merchant_id ON transactions (merchant_id);


CREATE INDEX idx_transactions_user_id ON transactions (user_id);


-- Covering index for the transactions list page (avoids heap fetch for common columns).
-- Also serves keyset pagination and per-user date-range queries.
CREATE INDEX idx_transactions_keyset ON transactions (user_id, id DESC) include (amount, kind, date, category_id, merchant_id);


-- Row-level security: users can only access their own transactions.
ALTER TABLE transactions enable ROW level security;


CREATE POLICY transactions_isolation ON transactions USING (
    user_id = CURRENT_SETTING('app.current_user_id', TRUE)::UUID
);
