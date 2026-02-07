# Financial Management App - CTO Architecture (Revised)
**Version:** 2.0 - Ledger-First Design  
**Date:** February 4, 2026

---

## Executive Summary

This document replaces the previous design with a **ledger-first architecture** based on first principles, not patching UI mocks. Key changes:

- **Ledger model** instead of naive transactions
- **Session-based auth** with vendor abstraction
- **No UI data in database** (colors, icons moved to frontend)
- **Auth provider agnostic** (Clerk, NextAuth, Auth0)
- **Double-entry accounting** for correctness
- **Derived balances** (never stored)

---

## 1. Core Architectural Principles

### 1.1 Money is Immutable History
- Transactions are **facts**, not editable records
- Balances are **derived**, never authoritative
- Audit trail is built-in, not added later

### 1.2 Auth vs Authorization Separation
- **Auth provider** says "who you are"
- **Your backend** decides "what you can touch"
- Never trust frontend identity claims

### 1.3 Database is for Facts, Not UI
- No colors, themes, avatars, icons in Postgres
- Frontend owns presentation
- Backend owns business rules

---

## 2. Authentication Architecture (Clean Integration)

### 2.1 The Four Actors

```
┌─────────────┐
│  Frontend   │  (Next.js)
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Login/Signup
       ↓
┌─────────────────┐
│  Auth Provider  │  (Clerk / NextAuth / Auth0)
│                 │
│  Responsibilities:
│  - Password verification
│  - OAuth handshake
│  - Session management
│  - Cookie issuing
└──────┬──────────┘
       │
       │ 2. Verified Identity
       ↓
┌─────────────────┐
│   Rust API      │  (Axum)
│                 │
│  Auth Adapter:
│  - Verify session/token
│  - Map to internal user_id
│  - Enforce ownership
└──────┬──────────┘
       │
       │ 3. Data queries (user_id scoped)
       ↓
┌─────────────────┐
│   Postgres 18   │
│                 │
│  - Source of truth
│  - Ownership via FK
│  - Never sees auth tokens
└─────────────────┘
```

### 2.2 Request Lifecycle (End-to-End)

**Example: User creates a transaction**

```
1. Frontend Action
   User clicks "Add Transaction"
   Browser automatically includes httpOnly cookie

2. Rust Middleware (Auth Adapter)
   Middleware intercepts request
   Verifies session with auth provider:
     - If Clerk: validates session token via Clerk API
     - If NextAuth: looks up session in database
     - If Auth0: validates JWT signature
   
   Extracts verified identity:
     provider: "google"
     provider_user_id: "google:108234..."
     email: "user@example.com"
     session_id: "sess_abc123"

3. Internal User Resolution
   Query: SELECT user_id FROM auth_credentials 
          WHERE provider = 'google' 
          AND provider_user_id = 'google:108234...'
   
   Result: internal_user_id = uuid_v7("...")
   
   Attach to request context:
     ctx.user_id = internal_user_id

4. Handler Execution
   Handler receives authenticated context
   Creates transaction:
     INSERT INTO transactions (id, user_id, ...)
     VALUES (uuid_v7(), ctx.user_id, ...)

5. Database Enforcement
   All queries include: WHERE user_id = ctx.user_id
   Foreign keys enforce ownership
   No cross-user data leakage possible

6. Response
   Returns transaction data
   Frontend updates UI
```

### 2.3 Auth Provider Comparison

| Feature | Clerk | NextAuth (DB mode) | Auth0 |
|---------|-------|-------------------|-------|
| **Session Storage** | Clerk's infra | Your Postgres | Auth0's infra |
| **Immediate Logout** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Device Management** | ✅ Built-in | ⚠️ Manual | ✅ Built-in |
| **Cost** | $25/mo → $99/mo | Free (OSS) | $23/mo → $240/mo |
| **OAuth Providers** | 20+ built-in | Any via config | 30+ built-in |
| **Complexity** | Low | Medium | High |
| **Best For** | Startups | Budget-conscious | Enterprise |

**CTO Recommendation: Start with Clerk or NextAuth (DB sessions)**

### 2.4 The Auth Adapter (Vendor Agnostic)

**Your Rust backend should never import Clerk/NextAuth directly.**

Instead, define a trait:

```
Conceptual Interface (not code):

trait AuthAdapter {
    fn verify_session(request) -> Result<VerifiedIdentity>
}

struct VerifiedIdentity {
    provider: String           // "google", "github", "email"
    provider_user_id: String   // External ID
    email: String
    session_id: String
}
```

Implementations:

- `ClerkAuthAdapter` - calls Clerk's session verification API
- `NextAuthAdapter` - queries NextAuth sessions table
- `Auth0Adapter` - validates Auth0 JWT

**This is how you avoid lock-in.**

### 2.5 Session Security Configuration

Regardless of provider, enforce:

```
Cookie Configuration:
  name: "session_id" (or provider default)
  httpOnly: true         // No JS access
  secure: true           // HTTPS only
  sameSite: "Strict"     // CSRF protection
  maxAge: 30 days        // Long-lived
  domain: ".yourapp.com" // Subdomain support

Rotation:
  Issue new session ID every 24 hours
  Invalidate on password change
  Revoke on suspicious activity
```

### 2.6 OAuth Flow (Google Example)

```
1. User clicks "Sign in with Google"

2. Frontend redirects to auth provider:
   https://yourapp.com/auth/google

3. Auth provider redirects to Google:
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=...
     redirect_uri=https://yourapp.com/auth/google/callback
     scope=email profile
     state=csrf_token_xyz

4. User approves on Google

5. Google redirects back:
   https://yourapp.com/auth/google/callback?
     code=AUTH_CODE
     state=csrf_token_xyz

6. Auth provider exchanges code for tokens:
   POST https://oauth2.googleapis.com/token
   Returns: access_token, id_token, refresh_token

7. Auth provider gets user profile:
   GET https://www.googleapis.com/oauth2/v3/userinfo
   Returns: { sub: "108234...", email: "user@gmail.com" }

8. Auth provider creates session:
   - Sets httpOnly cookie
   - Stores session in database/Redis

9. Webhook to your backend (optional):
   POST https://api.yourapp.com/webhooks/auth
   { event: "user.created", user_id: "...", provider: "google" }

10. Your backend creates user record:
    INSERT INTO users (id, email) VALUES (uuid_v7(), '...')
    INSERT INTO auth_credentials (user_id, provider, provider_user_id)
    VALUES (user_id, 'google', '108234...')

11. Frontend redirects to dashboard
    Browser now has session cookie
    All future requests are authenticated
```

### 2.7 Logout & Revocation

**Single Device Logout:**
```
1. User clicks "Logout"
2. Frontend calls auth provider logout endpoint
3. Provider deletes session from storage
4. Provider clears cookie
5. Next request to Rust API fails (session invalid)
```

**All Devices Logout:**
```
1. User clicks "Logout all devices"
2. Backend calls auth provider API:
   DELETE /sessions?user_id=xyz
3. All sessions for that user are invalidated
4. All devices are logged out on next request
```

**This is why sessions > JWT.**

---

## 3. Database Schema (Ledger-First)

### 3.1 Core Principle Changes

**REMOVED (compared to v1):**
- ❌ Account.balance (derived, not stored)
- ❌ UI fields (colors, icons, themes, avatars)
- ❌ Naive Transaction table
- ❌ Boolean is_recurring flag

**ADDED:**
- ✅ Ledger-style transaction entries
- ✅ Separate transaction events vs entries
- ✅ RecurringRule table
- ✅ Auth credentials table
- ✅ Clean separation of auth vs user data

### 3.2 Schema Overview

```sql
-- ============================================================================
-- IDENTITY & AUTH (separate from user profile)
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,                    -- 'email', 'google', 'github'
    provider_user_id TEXT,                     -- OAuth subject / NULL for email
    password_hash TEXT,                        -- NULL for OAuth
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_auth_user ON auth_credentials(user_id);

-- Optional: session storage if using NextAuth DB mode
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TYPE account_type AS ENUM ('checking', 'savings', 'credit', 'cash', 'investment');

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type account_type NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'USD',
    institution_name TEXT,
    account_number_last4 TEXT,
    opened_at DATE,
    closed_at DATE,
    metadata JSONB,                            -- For future bank sync
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_open ON accounts(user_id, closed_at) WHERE closed_at IS NULL;

COMMENT ON TABLE accounts IS 'Accounts are containers. Balance is derived from entries.';
COMMENT ON COLUMN accounts.metadata IS 'Bank sync data, connection status, etc.';

-- ============================================================================
-- LEDGER (the heart of the system)
-- ============================================================================

-- Transaction represents a real-world event
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    occurred_at TIMESTAMPTZ NOT NULL,          -- When it happened
    description TEXT,
    source TEXT NOT NULL DEFAULT 'manual',     -- 'manual', 'import', 'api', 'recurring'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_occurred ON transactions(occurred_at DESC);

-- TransactionEntry is the double-entry component
CREATE TABLE transaction_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(19,4) NOT NULL,             -- Signed (positive or negative)
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = system category
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    kind category_kind NOT NULL,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(user_id, archived_at) WHERE archived_at IS NULL;

COMMENT ON COLUMN categories.user_id IS 'NULL for system categories, user_id for custom';

-- ============================================================================
-- BUDGETS (rules, not containers)
-- ============================================================================

CREATE TYPE budget_period AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE budget_scope_type AS ENUM ('category', 'account');

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope_type budget_scope_type NOT NULL,
    scope_id UUID NOT NULL,                    -- category_id or account_id
    period budget_period NOT NULL,
    limit_amount DECIMAL(19,4) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    starts_on DATE NOT NULL,
    ends_on DATE,
    rollover BOOLEAN NOT NULL DEFAULT FALSE,
    alert_threshold DECIMAL(5,2),              -- Alert at 80%, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT positive_limit CHECK (limit_amount > 0),
    CONSTRAINT valid_threshold CHECK (alert_threshold IS NULL OR (alert_threshold > 0 AND alert_threshold <= 100))
);

CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_period ON budgets(starts_on, ends_on);

COMMENT ON TABLE budgets IS 'Budgets are constraints over time, not containers';

-- ============================================================================
-- GOALS (mental accounting)
-- ============================================================================

CREATE TYPE goal_status AS ENUM ('active', 'completed', 'abandoned');

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(19,4) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    target_date DATE,
    status goal_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT positive_target CHECK (target_amount > 0)
);

CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_active ON goals(user_id, status) WHERE status = 'active';

-- Goal allocations (link transactions to goals)
CREATE TABLE goal_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    transaction_entry_id UUID NOT NULL REFERENCES transaction_entries(id) ON DELETE CASCADE,
    amount DECIMAL(19,4) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT positive_allocation CHECK (amount > 0),
    UNIQUE(goal_id, transaction_entry_id)
);

CREATE INDEX idx_allocations_goal ON goal_allocations(goal_id);

COMMENT ON TABLE goal_allocations IS 'Links transaction entries to savings goals';

-- ============================================================================
-- RECURRING RULES (not booleans)
-- ============================================================================

CREATE TYPE recurrence_cadence AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly');

CREATE TABLE recurring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cadence recurrence_cadence NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    next_run_at DATE NOT NULL,
    end_at DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    auto_create BOOLEAN NOT NULL DEFAULT FALSE, -- Auto-create or just notify
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_user ON recurring_rules(user_id);
CREATE INDEX idx_recurring_next ON recurring_rules(next_run_at) WHERE active = TRUE;

COMMENT ON TABLE recurring_rules IS 'Drives forecasts, reminders, auto-posting';

-- ============================================================================
-- VIEWS (derived data)
-- ============================================================================

-- Account balances (derived from entries)
CREATE OR REPLACE VIEW v_account_balances AS
SELECT 
    a.id AS account_id,
    a.user_id,
    a.name,
    a.account_type,
    a.currency_code,
    COALESCE(SUM(e.amount), 0) AS balance
FROM accounts a
LEFT JOIN transaction_entries e ON e.account_id = a.id
WHERE a.closed_at IS NULL
GROUP BY a.id, a.user_id, a.name, a.account_type, a.currency_code;

-- Current month spending by category
CREATE OR REPLACE VIEW v_current_month_spending AS
SELECT 
    e.account_id,
    te.user_id,
    c.id AS category_id,
    c.name AS category_name,
    SUM(ABS(e.amount)) AS total_spent,
    COUNT(*) AS transaction_count
FROM transaction_entries e
JOIN transactions te ON te.id = e.transaction_id
JOIN categories c ON c.id = e.category_id
WHERE 
    DATE_TRUNC('month', te.occurred_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND e.amount < 0  -- Expenses only
GROUP BY e.account_id, te.user_id, c.id, c.name;

-- Goal progress
CREATE OR REPLACE VIEW v_goal_progress AS
SELECT 
    g.id AS goal_id,
    g.user_id,
    g.name,
    g.target_amount,
    COALESCE(SUM(ga.amount), 0) AS current_amount,
    g.target_amount - COALESCE(SUM(ga.amount), 0) AS remaining,
    CASE 
        WHEN g.target_amount > 0 
        THEN (COALESCE(SUM(ga.amount), 0) / g.target_amount * 100)
        ELSE 0 
    END AS percentage_complete
FROM goals g
LEFT JOIN goal_allocations ga ON ga.goal_id = g.id
WHERE g.status = 'active'
GROUP BY g.id, g.user_id, g.name, g.target_amount;

-- ============================================================================
-- SEED DATA (system categories)
-- ============================================================================

-- Income
INSERT INTO categories (name, kind, parent_id) VALUES
('Salary', 'income', NULL),
('Freelance', 'income', NULL),
('Investments', 'income', NULL),
('Gifts', 'income', NULL),
('Other Income', 'income', NULL);

-- Expenses
INSERT INTO categories (name, kind, parent_id) VALUES
('Bills', 'expense', NULL),
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
INSERT INTO categories (name, kind, parent_id) VALUES
('Transfer', 'transfer', NULL);
```

---

## 4. Frontend Responsibilities (No DB Data)

### 4.1 What Frontend Owns

**UI Presentation Data (NOT in database):**

```typescript
// Frontend constants (never fetch from DB)

const CATEGORY_ICONS = {
  'Salary': 'briefcase',
  'Groceries': 'shopping-cart',
  'Dining Out': 'utensils',
  // ... etc
}

const CATEGORY_COLORS = {
  'Salary': '#277C78',
  'Groceries': '#82C9D7',
  'Dining Out': '#F2CDAC',
  // ... etc
}

const ACCOUNT_TYPE_ICONS = {
  checking: 'bank',
  savings: 'piggy-bank',
  credit: 'credit-card',
  cash: 'wallet'
}
```

**User Preferences (localStorage or cookies):**
```typescript
{
  theme: 'dark' | 'light',
  compactView: boolean,
  defaultView: 'transactions' | 'budgets' | 'goals',
  chartType: 'line' | 'bar'
}
```

**Why this matters:**
- Database stays small and fast
- No migrations when you change icons
- Frontend can update instantly
- No server round-trip for display data

### 4.2 API Response Shape

**Backend returns minimal data:**
```json
{
  "id": "01944f7c-...",
  "name": "Groceries",
  "kind": "expense",
  "parent_id": null
}
```

**Frontend enriches for display:**
```typescript
const enrichedCategory = {
  ...category,
  icon: CATEGORY_ICONS[category.name],
  color: CATEGORY_COLORS[category.name]
}
```

---

## 5. Transaction Examples (Ledger Model)

### Example 1: Simple Expense
**User buys coffee for $5**

```sql
-- Create transaction
INSERT INTO transactions (id, user_id, occurred_at, description)
VALUES (gen_random_uuid(), 'user_123', NOW(), 'Coffee at Starbucks');

-- Create entry
INSERT INTO transaction_entries (transaction_id, account_id, category_id, amount)
VALUES (
    'txn_id',
    'checking_account_id',
    'dining_out_category_id',
    -5.00  -- Negative = money out
);

-- Balance is automatically derived via view
```

### Example 2: Transfer Between Accounts
**User moves $100 from checking to savings**

```sql
-- Create transaction
INSERT INTO transactions (id, user_id, occurred_at, description)
VALUES (gen_random_uuid(), 'user_123', NOW(), 'Transfer to savings');

-- Two entries (double-entry)
INSERT INTO transaction_entries (transaction_id, account_id, amount) VALUES
('txn_id', 'checking_account_id', -100.00),  -- Out of checking
('txn_id', 'savings_account_id', +100.00);   -- Into savings

-- Net zero across user's accounts
-- Transfer category applied to both
```

### Example 3: Split Transaction
**User pays $100 restaurant bill, split across categories**

```sql
INSERT INTO transactions (id, user_id, occurred_at, description)
VALUES (gen_random_uuid(), 'user_123', NOW(), 'Dinner with clients');

INSERT INTO transaction_entries (transaction_id, account_id, category_id, amount) VALUES
('txn_id', 'checking_id', 'dining_out', -60.00),      -- Personal
('txn_id', 'checking_id', 'business_meals', -40.00);  -- Business

-- Total: -$100 from one account, multiple categories
```

---

## 6. Why This Architecture Wins

### 6.1 Correctness
- **Double-entry ledger**: Transfers can't go wrong
- **Immutable history**: Audit trail is automatic
- **Derived balances**: No stale balance bugs

### 6.2 Flexibility
- **Supports any transaction type**: Simple, transfers, splits, refunds
- **Envelope budgeting ready**: Just add allocation logic
- **Bank sync compatible**: Metadata JSONB field ready

### 6.3 Security
- **Clean auth boundary**: No vendor lock-in
- **Session revocation**: Immediate logout works
- **Ownership enforcement**: Every query scoped to user_id

### 6.4 Performance
- **Views cache derived data**: Balance lookups are fast
- **Indexes on hot paths**: User queries optimized
- **No UI bloat**: Database stays lean

### 6.5 Maintainability
- **Separation of concerns**: Auth ≠ User ≠ Business Logic
- **Frontend freedom**: Change icons/colors without migrations
- **Clear boundaries**: Each layer has one job

---

## 7. Migration from Sample Data

### Mapping Sample JSON to Ledger

**Old transaction:**
```json
{
  "name": "Starbucks",
  "category": "Dining Out",
  "amount": -5.50,
  "recurring": false
}
```

**New structure:**
```sql
-- 1. Find or create payee (if you add payees later)
-- 2. Create transaction
INSERT INTO transactions (user_id, occurred_at, description)
VALUES ('user_id', '2024-08-19', 'Starbucks');

-- 3. Create entry
INSERT INTO transaction_entries (transaction_id, account_id, category_id, amount)
VALUES ('txn_id', 'account_id', 'dining_out_id', -5.50);
```

**Old recurring flag → New recurring rule:**
```sql
INSERT INTO recurring_rules (
    user_id, cadence, amount, account_id, 
    category_id, description, next_run_at, auto_create
) VALUES (
    'user_id', 'monthly', -9.99, 'account_id',
    'subscriptions_id', 'Netflix', '2024-09-01', true
);
```

---

## 8. Next Steps

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Postgres 18 with schema
- [ ] Choose auth provider (Clerk recommended)
- [ ] Implement auth adapter in Axum
- [ ] Test OAuth flows (Google, GitHub)

### Phase 2: Core Ledger (Week 3-4)
- [ ] Transaction creation API
- [ ] Account balance views
- [ ] Category management
- [ ] Basic queries

### Phase 3: Features (Week 5-8)
- [ ] Budgets with alerts
- [ ] Goals with allocations
- [ ] Recurring rules
- [ ] Analytics endpoints

### Phase 4: Polish (Week 9-12)
- [ ] Frontend UI components
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Security audit

---

## Appendix: Key Differences from V1

| Aspect | V1 (Naive) | V2 (Ledger-First) |
|--------|-----------|-------------------|
| **Transactions** | Single table, balance updates | Ledger entries, derived balances |
| **Transfers** | Two transactions | One transaction, two entries |
| **Auth** | User table only | Separate auth_credentials table |
| **UI Data** | In database | Frontend constants |
| **Recurring** | Boolean flag | Separate rules table |
| **Balances** | Stored column | Derived view |
| **Categories** | Flat | Hierarchical |
| **Auth Provider** | Locked in | Adapter pattern |

---

**This is production-grade architecture. Ship it.**
