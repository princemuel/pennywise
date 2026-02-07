-- ============================================================================
-- IDENTITY & AUTH (separate from user profile)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    email TEXT UNIQUE NOT NULL,
    email_verified_at TIMESTAMPTZ,
    display_name TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    currency TEXT NOT NULL DEFAULT 'USD',
    locale TEXT NOT NULL DEFAULT 'en_US',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    disabled_at TIMESTAMPTZ
);
-- Auth credentials (multiple login methods per user)
CREATE TABLE auth_credentials (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    -- 'email', 'google', 'github'
    provider_user_id TEXT,
    -- OAuth subject / NULL for email
    password_hash TEXT,
    -- NULL for OAuth
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    UNIQUE(provider, provider_user_id)
);
CREATE INDEX idx_auth_user ON auth_credentials(user_id);
-- Optional: session storage if using NextAuth DB mode
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
-- ============================================================================
-- ACCOUNTS (containers, not balances)
-- ============================================================================
CREATE TYPE account_type AS ENUM (
    'checking',
    'savings',
    'credit',
    'cash',
    'investment'
);
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type account_type NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'USD',
    institution_name TEXT,
    account_number_last4 TEXT,
    opened_at DATE,
    closed_at DATE,
    metadata JSONB,
    -- For future bank sync
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_open ON accounts(user_id, closed_at)
WHERE closed_at IS NULL;
COMMENT ON TABLE accounts IS 'Accounts are containers. Balance is derived from entries.';
COMMENT ON COLUMN accounts.metadata IS 'Bank sync data, connection status, etc.';
-- ============================================================================
-- LEDGER (the heart of the system)
-- ============================================================================
-- Transaction represents a real-world event
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    occurred_at TIMESTAMPTZ NOT NULL,
    -- When it happened
    description TEXT,
    source TEXT NOT NULL DEFAULT 'manual',
    -- 'manual', 'import', 'api', 'recurring'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_occurred ON transactions(occurred_at DESC);
-- TransactionEntry is the double-entry component
CREATE TABLE transaction_entries (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE
    SET NULL,
        amount DECIMAL(19, 4) NOT NULL,
        -- Signed (positive or negative)
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT amount_not_zero CHECK (amount != 0)
);
CREATE INDEX idx_entries_transaction ON transaction_entries(transaction_id);
CREATE INDEX idx_entries_account ON transaction_entries(account_id);
CREATE INDEX idx_entries_category ON transaction_entries(category_id);
COMMENT ON TABLE transactions IS 'Represents a real-world event (payment, transfer, etc.)';
COMMENT ON TABLE transaction_entries IS 'Double-entry ledger. One transaction can have multiple entries.';
-- Examples:
-- Simple expense: 1 transaction, 1 entry (account: -$50)
-- Transfer: 1 transaction, 2 entries (account A: -$100, account B: +$100)
-- Split transaction: 1 transaction, N entries
-- ============================================================================
-- CATEGORIES (hierarchical, user-owned)
-- ============================================================================
CREATE TYPE category_kind AS ENUM ('income', 'expense', 'transfer');
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    -- NULL = system category
    parent_id UUID REFERENCES categories(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        kind category_kind NOT NULL,
        archived_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(user_id, archived_at)
WHERE archived_at IS NULL;
COMMENT ON COLUMN categories.user_id IS 'NULL for system categories, user_id for custom';
-- ============================================================================
-- BUDGETS (rules, not containers)
-- ============================================================================
CREATE TYPE budget_period AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE budget_scope_type AS ENUM ('category', 'account');
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope_type budget_scope_type NOT NULL,
    scope_id UUID NOT NULL,
    -- category_id or account_id
    period budget_period NOT NULL,
    limit_amount DECIMAL(19, 4) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    starts_on DATE NOT NULL,
    ends_on DATE,
    rollover BOOLEAN NOT NULL DEFAULT FALSE,
    alert_threshold DECIMAL(5, 2),
    -- Alert at 80%, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_limit CHECK (limit_amount > 0),
    CONSTRAINT valid_threshold CHECK (
        alert_threshold IS NULL
        OR (
            alert_threshold > 0
            AND alert_threshold <= 100
        )
    )
);
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_period ON budgets(starts_on, ends_on);
COMMENT ON TABLE budgets IS 'Budgets are constraints over time, not containers';
-- ============================================================================
-- GOALS (mental accounting)
-- ============================================================================
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'abandoned');
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(19, 4) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    target_date DATE,
    status goal_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT positive_target CHECK (target_amount > 0)
);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_active ON goals(user_id, status)
WHERE status = 'active';
-- Goal allocations (link transactions to goals)
CREATE TABLE goal_allocations (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    transaction_entry_id UUID NOT NULL REFERENCES transaction_entries(id) ON DELETE CASCADE,
    amount DECIMAL(19, 4) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_allocation CHECK (amount > 0),
    UNIQUE(goal_id, transaction_entry_id)
);
CREATE INDEX idx_allocations_goal ON goal_allocations(goal_id);
COMMENT ON TABLE goal_allocations IS 'Links transaction entries to savings goals';
-- ============================================================================
-- RECURRING RULES (not booleans)
-- ============================================================================
CREATE TYPE recurrence_cadence AS ENUM (
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'yearly'
);
CREATE TABLE recurring_rules (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cadence recurrence_cadence NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE
    SET NULL,
        description TEXT NOT NULL,
        next_run_at DATE NOT NULL,
        end_at DATE,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        auto_create BOOLEAN NOT NULL DEFAULT FALSE,
        -- Auto-create or just notify
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recurring_user ON recurring_rules(user_id);
CREATE INDEX idx_recurring_next ON recurring_rules(next_run_at)
WHERE active = TRUE;
COMMENT ON TABLE recurring_rules IS 'Drives forecasts, reminders, auto-posting';
-- ============================================================================
-- VIEWS (derived data)
-- ============================================================================
-- Account balances (derived from entries)
CREATE OR REPLACE VIEW v_account_balances AS
SELECT a.id AS account_id,
    a.user_id,
    a.name,
    a.account_type,
    a.currency_code,
    COALESCE(SUM(e.amount), 0) AS balance
FROM accounts a
    LEFT JOIN transaction_entries e ON e.account_id = a.id
WHERE a.closed_at IS NULL
GROUP BY a.id,
    a.user_id,
    a.name,
    a.account_type,
    a.currency_code;
-- Current month spending by category
CREATE OR REPLACE VIEW v_current_month_spending AS
SELECT e.account_id,
    te.user_id,
    c.id AS category_id,
    c.name AS category_name,
    SUM(ABS(e.amount)) AS total_spent,
    COUNT(*) AS transaction_count
FROM transaction_entries e
    JOIN transactions te ON te.id = e.transaction_id
    JOIN categories c ON c.id = e.category_id
WHERE DATE_TRUNC('month', te.occurred_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND e.amount < 0 -- Expenses only
GROUP BY e.account_id,
    te.user_id,
    c.id,
    c.name;
-- Goal progress
CREATE OR REPLACE VIEW v_goal_progress AS
SELECT g.id AS goal_id,
    g.user_id,
    g.name,
    g.target_amount,
    COALESCE(SUM(ga.amount), 0) AS current_amount,
    g.target_amount - COALESCE(SUM(ga.amount), 0) AS remaining,
    CASE
        WHEN g.target_amount > 0 THEN (
            COALESCE(SUM(ga.amount), 0) / g.target_amount * 100
        )
        ELSE 0
    END AS percentage_complete
FROM goals g
    LEFT JOIN goal_allocations ga ON ga.goal_id = g.id
WHERE g.status = 'active'
GROUP BY g.id,
    g.user_id,
    g.name,
    g.target_amount;
-- ============================================================================
-- SEED DATA (system categories)
-- ============================================================================
-- Income
INSERT INTO categories (name, kind, parent_id)
VALUES ('Salary', 'income', NULL),
    ('Freelance', 'income', NULL),
    ('Investments', 'income', NULL),
    ('Gifts', 'income', NULL),
    ('Other Income', 'income', NULL);
-- Expenses
INSERT INTO categories (name, kind, parent_id)
VALUES ('Bills', 'expense', NULL),
    ('Groceries', 'expense', NULL),
    ('Dining Out', 'expense', NULL),
    ('Transportation', 'expense', NULL),
    ('Entertainment', 'expense', NULL),
    ('Shopping', 'expense', NULL),
    ('Personal Care', 'expense', NULL),
    ('Healthcare', 'expense', NULL),
    ('Education', 'expense', NULL),
    ('Housing', 'expense', NULL),
    ('Insurance', 'expense', NULL),
    ('Subscriptions', 'expense', NULL),
    ('Travel', 'expense', NULL);
-- Transfer
INSERT INTO categories (name, kind, parent_id)
VALUES ('Transfer', 'transfer', NULL);
