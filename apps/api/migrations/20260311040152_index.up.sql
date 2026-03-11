-- Add up migration script here
-- PATCH: fix auth_tokens partial index and categories unique constraint.
-- 1. auth_tokens: drop the broken partial index that used NOW() in its predicate.
--    Postgres evaluates the predicate at index-creation time, so expires_at > NOW()
--    matched only rows that were unexpired at migration time — not at query time.
--    The replacement index keeps only the immutable predicate (revoked_at IS NULL);
--    query WHERE clauses must filter expires_at themselves.
DROP INDEX IF EXISTS idx_auth_tokens_hash_active;


CREATE INDEX idx_auth_tokens_hash_active ON auth_tokens (token_hash)
WHERE
    revoked_at IS NULL;


-- 2. categories: drop the blanket UNIQUE constraint on name and replace it with a
--    partial unique index that only enforces uniqueness among non-deleted rows.
--    Without this, soft-deleting a category and re-inserting one with the same name
--    (e.g. after a rename cycle) raises a spurious unique-violation error.
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_name_key;


CREATE UNIQUE INDEX idx_categories_name_active ON categories (name)
WHERE
    deleted_at IS NULL;
