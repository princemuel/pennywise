-- Add migration script here
CREATE TABLE avatars (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    name TEXT NOT NULL UNIQUE,
    avatar_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_avatars_name_trgm ON avatars USING gin (name gin_trgm_ops);
CREATE TRIGGER trg_avatars_updated_at BEFORE
UPDATE ON avatars FOR EACH ROW EXECUTE FUNCTION set_updated_at();
