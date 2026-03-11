-- Add up migration script here
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT UUIDV7(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    -- Store bcrypt/argon2 hash, never plaintext.
    -- 255 chars comfortably fits any modern hash format.
    password TEXT NOT NULL,
    -- Brute-force protection: tracked at DB level so all app instances share state.
    -- Application should lock the account after N failed attempts (e.g. 10).
    failed_attempts SMALLINT NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
    locked_at TIMESTAMPTZ,
    -- Currency code (ISO 4217) for display formatting.
    -- All stored amounts are in this currency; no conversion is performed.
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    deleted_at TIMESTAMPTZ,
    --
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique email among non-deleted users only
CREATE UNIQUE INDEX idx_users_email_active ON users (email)
WHERE
    deleted_at IS NULL;

CREATE TRIGGER trg_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW
EXECUTE FUNCTION set_updated_at ();

-- Row-level security: users can only see and modify their own rows.
-- The application must set the config parameter before querying:
--   SET app.current_user_id = '<uuid>';
-- This provides a DB-level safety net against missing WHERE clauses in app code.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_isolation ON users USING (id = CURRENT_SETTING('app.current_user_id', TRUE)::UUID);

-- Auth tokens table for session/refresh token management.
-- Stores hashed tokens only — never the raw token value.
CREATE TABLE IF NOT EXISTS auth_tokens (
    id UUID PRIMARY KEY DEFAULT UUIDV7(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    -- Store a SHA-256 hash of the token, never the raw value.
    token_hash TEXT NOT NULL UNIQUE,
    -- 'refresh' or 'session'; extend enum as needed.
    token_type TEXT NOT NULL CHECK (token_type IN ('refresh', 'session')),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    --
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens (user_id);

-- Fast lookup of valid tokens by hash
CREATE INDEX idx_auth_tokens_hash_active ON auth_tokens (token_hash)
WHERE
    revoked_at IS NULL AND
    expires_at > NOW();
