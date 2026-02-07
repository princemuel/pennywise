# Architecture Revision - What Changed and Why

## Critical Changes Based on ChatGPT Conversation

### 1. AUTH: Session-Based (NOT JWT)

**Why this matters for financial apps:**
- ✅ Immediate logout across all devices
- ✅ Can revoke compromised sessions instantly
- ✅ Password change = all sessions invalidated
- ✅ Better audit trail for compliance
- ❌ JWT can't be revoked until expiry

**Recommendation: Use Clerk or NextAuth (DB sessions mode)**

---

### 2. LEDGER: Double-Entry (NOT Naive Transactions)

#### ❌ OLD WAY (Wrong):
```sql
CREATE TABLE transactions (
    amount DECIMAL,
    account_id UUID,
    -- Balance stored and updated
);

CREATE TABLE accounts (
    balance DECIMAL  -- WRONG: Source of bugs
);
```

#### ✅ NEW WAY (Correct):
```sql
CREATE TABLE transactions (
    -- Event metadata only
    occurred_at TIMESTAMPTZ,
    description TEXT
);

CREATE TABLE transaction_entries (
    transaction_id UUID,
    account_id UUID,
    amount DECIMAL,  -- Signed: + or -
);

-- Balance is DERIVED, never stored
CREATE VIEW account_balances AS
SELECT account_id, SUM(amount) as balance
FROM transaction_entries
GROUP BY account_id;
```

**Why this wins:**
- Transfers are first-class (1 transaction, 2 entries)
- Split transactions just work
- Balance bugs are impossible
- Audit trail is automatic

---

### 3. UI DATA: Frontend-Only (NOT Database)

#### ❌ REMOVED from Database:
```sql
-- NO LONGER IN SCHEMA:
color VARCHAR(7)
icon VARCHAR(50)
theme VARCHAR(7)
avatar_url VARCHAR(500)
```

#### ✅ MOVED to Frontend:
```typescript
// Frontend constants file
const CATEGORY_ICONS = {
  'Salary': 'briefcase',
  'Groceries': 'shopping-cart',
  'Dining Out': 'utensils'
}

const CATEGORY_COLORS = {
  'Salary': '#277C78',
  'Groceries': '#82C9D7',
  'Dining Out': '#F2CDAC'
}
```

**Benefits:**
- Database stays small and fast
- No migrations when changing icons
- Frontend updates instantly
- Backend doesn't care about UI

---

### 4. AUTH SEPARATION: Credentials ≠ User Profile

#### ❌ OLD (Coupled):
```sql
CREATE TABLE users (
    email TEXT,
    password_hash TEXT,  -- Mixed concerns
    name TEXT
);
```

#### ✅ NEW (Separated):
```sql
CREATE TABLE users (
    id UUID,
    email TEXT,
    display_name TEXT
    -- Profile data only
);

CREATE TABLE auth_credentials (
    user_id UUID,
    provider TEXT,  -- 'email', 'google', 'github'
    provider_user_id TEXT,
    password_hash TEXT  -- NULL for OAuth
);
```

**Why this matters:**
- Users can have multiple login methods
- Start with Google, add email later
- Rotate credentials safely
- Clean separation of concerns

---

### 5. RECURRING: Rules Table (NOT Boolean)

#### ❌ OLD (Inflexible):
```sql
CREATE TABLE transactions (
    recurring BOOLEAN  -- Not enough information
);
```

#### ✅ NEW (Proper):
```sql
CREATE TABLE recurring_rules (
    cadence ENUM ('daily', 'weekly', 'monthly', ...),
    next_run_at DATE,
    end_at DATE,
    auto_create BOOLEAN  -- Auto-post or notify
);
```

**Enables:**
- Forecasting
- Reminders
- Auto-posting
- Complex schedules

---

### 6. BUDGETS: Constraints (NOT Containers)

#### ❌ OLD (Rigid):
```sql
CREATE TABLE budgets (
    category_id UUID,  -- Only category budgets
    amount_limit DECIMAL
);
```

#### ✅ NEW (Flexible):
```sql
CREATE TABLE budgets (
    scope_type ENUM ('category', 'account'),
    scope_id UUID,
    period ENUM ('weekly', 'monthly', ...),
    rollover BOOLEAN,
    alert_threshold DECIMAL
);
```

**Supports:**
- Category budgets
- Account budgets
- Envelope budgeting (future)
- Custom periods

---

### 7. GOALS: First-Class (NOT Afterthought)

#### ❌ OLD (Missing):
```
-- Goals were just JSON in sample data
```

#### ✅ NEW (Proper):
```sql
CREATE TABLE goals (
    name TEXT,
    target_amount DECIMAL,
    target_date DATE,
    status ENUM ('active', 'completed', 'abandoned')
);

CREATE TABLE goal_allocations (
    goal_id UUID,
    transaction_entry_id UUID,  -- Links to actual money
    amount DECIMAL
);
```

**Why this works:**
- Goals are funded by real transactions
- Progress is derived from allocations
- No magic numbers

---

## Authentication Flow (NextJS → Rust → Postgres)

### Request Lifecycle

```
1. USER ACTION
   User clicks "Create Transaction"
   Browser includes httpOnly cookie (automatic)

2. RUST MIDDLEWARE (Auth Adapter)
   Verifies session with auth provider
   
   If Clerk:
     → Calls Clerk API to validate session
   
   If NextAuth:
     → Queries sessions table in Postgres
   
   If Auth0:
     → Validates JWT signature
   
   Returns: VerifiedIdentity {
     provider: "google",
     provider_user_id: "108234...",
     email: "user@gmail.com",
     session_id: "sess_abc123"
   }

3. USER RESOLUTION
   Query auth_credentials table:
   
   SELECT user_id 
   FROM auth_credentials 
   WHERE provider = 'google' 
   AND provider_user_id = '108234...'
   
   Result: internal_user_id = uuid_v7("...")
   
   Attach to context: ctx.user_id = internal_user_id

4. HANDLER EXECUTION
   Handler receives AuthContext
   
   All queries scoped to user:
   WHERE user_id = ctx.user_id
   
   Postgres enforces ownership via FK

5. RESPONSE
   Return data to frontend
   Frontend never sees auth internals
```

### Logout Flow

```
SINGLE DEVICE:
1. User clicks "Logout"
2. Frontend calls auth provider logout
3. Provider deletes session
4. Cookie cleared
5. Next request fails (session invalid)

ALL DEVICES:
1. User clicks "Logout everywhere"
2. Backend calls provider API
3. All sessions deleted
4. All devices logged out on next request
```

---

## Database Size Comparison

### Old Design (Bloated)
```
users: 20 columns (mixed auth + profile + UI)
accounts: 15 columns (including colors, icons)
transactions: 18 columns (including avatars, themes)
categories: 12 columns (UI data mixed in)

Total: ~65 columns of mostly UI fluff
```

### New Design (Lean)
```
users: 8 columns (profile only)
auth_credentials: 7 columns (auth only)
accounts: 10 columns (no UI data)
transactions: 6 columns (events only)
transaction_entries: 7 columns (ledger)
categories: 7 columns (no UI data)

Total: ~45 columns of pure business logic
Frontend: Separate UI constants (icons, colors)
```

**Result: 30% smaller database, 100% cleaner**

---

## What You Can Do Now (That You Couldn't Before)

### ✅ Transfers
- Old: Two separate transactions (messy)
- New: One transaction, two entries (clean)

### ✅ Split Transactions
- Old: Not possible
- New: One transaction, N entries

### ✅ Multi-Device Logout
- Old: JWT can't be revoked
- New: Session revocation works

### ✅ Change Auth Provider
- Old: Locked into vendor types
- New: Auth adapter swaps easily

### ✅ Bank Sync Integration
- Old: Would require schema rewrite
- New: JSONB metadata field ready

### ✅ Envelope Budgeting
- Old: Would need new tables
- New: Just add allocation logic

### ✅ Forecasting
- Old: Boolean recurring flag useless
- New: Recurring rules drive predictions

---

## Migration Strategy

### If You Already Built V1

**Week 1: Add Ledger**
```sql
-- Keep old transactions table
-- Add new tables:
CREATE TABLE transaction_entries ...
CREATE TABLE recurring_rules ...

-- Migrate data:
INSERT INTO transaction_entries
SELECT ... FROM old_transactions
```

**Week 2: Add Auth Separation**
```sql
CREATE TABLE auth_credentials ...

-- Migrate existing users:
INSERT INTO auth_credentials (user_id, provider, password_hash)
SELECT id, 'email', password_hash FROM users

-- Drop password_hash from users
ALTER TABLE users DROP COLUMN password_hash
```

**Week 3: Remove UI Data**
```sql
-- Extract to frontend constants
-- Drop columns:
ALTER TABLE categories DROP COLUMN color, icon
ALTER TABLE accounts DROP COLUMN color, icon
```

**Week 4: Switch to Sessions**
```
-- If using Clerk: Just update middleware
-- If using NextAuth: Enable DB sessions in config
-- Existing users re-login (acceptable)
```

---

## Final Recommendation

**DO THIS:**
1. Use the ledger-first schema (transaction_entries)
2. Choose Clerk or NextAuth (session-based)
3. Keep UI data in frontend (colors, icons)
4. Separate auth_credentials from users
5. Use recurring_rules table
6. Derive balances (never store)

**DON'T DO THIS:**
1. Store balances in accounts table
2. Use JWT-only auth
3. Mix UI data in database
4. Use boolean recurring flags
5. Couple auth with user profile
6. Lock into vendor-specific types

---

## Questions to Ask Yourself

**Before implementing anything:**
1. "Is this data a fact or a preference?"
   - Fact → Database
   - Preference → Frontend

2. "Can I revoke this session immediately?"
   - No → You chose the wrong auth

3. "Can I handle transfers correctly?"
   - No → You need the ledger model

4. "Can I swap auth providers in a week?"
   - No → Your adapter is too coupled

5. "Will this work with bank sync?"
   - No → Your schema is too rigid

---

**This is the difference between a demo app and a real company.**
