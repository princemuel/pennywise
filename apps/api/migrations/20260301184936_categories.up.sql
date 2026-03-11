-- Add migration script here
-- Categories are global (shared across all users).
-- Users cannot create custom categories in this version.
-- All names are stored lowercase; application layer should display-format them.
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT UUIDV7(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    deleted_at TIMESTAMPTZ,
    --
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_updated_at BEFORE
UPDATE ON categories FOR EACH ROW
EXECUTE FUNCTION set_updated_at ();

INSERT INTO
    categories (name)
VALUES
    ('general'),
    ('entertainment'),
    ('dining out'),
    ('groceries'),
    ('transportation'),
    ('lifestyle'),
    ('shopping'),
    ('bills'),
    ('personal care'),
    ('education');
