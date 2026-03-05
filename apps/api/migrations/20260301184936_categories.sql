-- Add migration script here
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_categories_updated_at BEFORE
UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
INSERT INTO categories (name)
VALUES ('general'),
    ('entertainment'),
    ('dining out'),
    ('groceries'),
    ('transportation'),
    ('lifestyle'),
    ('shopping'),
    ('bills'),
    ('personal care'),
    ('education');
