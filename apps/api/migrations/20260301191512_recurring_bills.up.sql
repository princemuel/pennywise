-- Add up migration script here
CREATE TABLE IF NOT EXISTS recurring_bills (
    id UUID PRIMARY KEY DEFAULT UUIDV7(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    -- References merchants: the biller or merchant.
    merchant_id UUID NOT NULL REFERENCES merchants (id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    -- Day of month the bill is due (1–28; avoids Feb edge cases).
    billday SMALLINT NOT NULL CHECK (billday BETWEEN 1 AND 28),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    --
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX idx_recurring_bills_user_id ON recurring_bills (user_id);


CREATE TRIGGER trg_recurring_bills_updated_at BEFORE
UPDATE ON recurring_bills FOR EACH ROW
EXECUTE FUNCTION set_updated_at ();


-- Row-level security
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;


CREATE POLICY recurring_bills_isolation ON recurring_bills USING (
    user_id = CURRENT_SETTING('app.current_user_id', TRUE)::UUID
);


-- One payment record per bill per billing cycle.
-- paid_at NULL  = upcoming or overdue (determined by comparing deadline to CURRENT_DATE)
-- paid_at NOT NULL = paid
CREATE TABLE IF NOT EXISTS recurring_bill_payments (
    id UUID PRIMARY KEY DEFAULT UUIDV7(),
    bill_id UUID NOT NULL REFERENCES recurring_bills (id) ON DELETE CASCADE,
    deadline DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    -- The amount actually charged, which may differ from recurring_bills.amount
    -- (e.g. variable utility bills). NULL until payment is recorded.
    amount_paid NUMERIC(12, 2) CHECK (amount_paid > 0),
    -- NULLed if the linked transaction is ever deleted.
    transaction_id UUID REFERENCES transactions (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (bill_id, deadline),
    -- amount_paid must be set when marking as paid
    CHECK (
        (
            paid_at IS NULL AND
            amount_paid IS NULL
        ) OR
        (
            paid_at IS NOT NULL AND
            amount_paid IS NOT NULL
        )
    )
);


CREATE INDEX idx_rbp_bill_id ON recurring_bill_payments (bill_id, deadline DESC);


CREATE INDEX idx_rbp_deadline ON recurring_bill_payments (deadline);


-- Index on transaction_id: supports "which bill does this transaction belong to?" lookup
CREATE INDEX idx_rbp_transaction_id ON recurring_bill_payments (transaction_id)
WHERE
    transaction_id IS NOT NULL;


-- Partial index for fast unpaid lookups (home page summary)
CREATE INDEX idx_rbp_unpaid ON recurring_bill_payments (deadline)
WHERE
    paid_at IS NULL;


-- Partial index for fast overdue lookups (deadline passed and still unpaid)
CREATE INDEX idx_rbp_overdue ON recurring_bill_payments (deadline)
WHERE
    paid_at IS NULL AND
    deadline < CURRENT_DATE;
