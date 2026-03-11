-- Add down migration script here
-- reverse index fixes patch.
-- 1. Restore the original (broken) auth_tokens partial index.
DROP INDEX IF EXISTS idx_auth_tokens_hash_active;


CREATE INDEX idx_auth_tokens_hash_active ON auth_tokens (token_hash)
WHERE
    revoked_at IS NULL AND
    expires_at > NOW();


-- 2. Restore the original blanket unique constraint on categories.name.
DROP INDEX IF EXISTS idx_categories_name_active;


ALTER TABLE categories
ADD CONSTRAINT categories_name_key UNIQUE (name);
