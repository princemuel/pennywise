-- Add migration script here
-- Renamed from 'avatars' → 'payees' → 'merchants'.
-- Represents the other party in a transaction: a shop, biller, utility, or person.
-- NOTE: the name 'merchants' is accurate for the majority of entries but also
-- covers person-to-person transactions (e.g. a friend paying you back).
-- The avatar_url column holds the merchant/payee logo image URL.
--
-- Trigram index on name supports fuzzy search on the transactions list
-- (e.g. "show me transactions like 'netflix'").
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT UUIDV7(),
    name TEXT NOT NULL UNIQUE,
    avatar_url TEXT NOT NULL,
    --
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Trigram index for fuzzy merchant name search
CREATE INDEX idx_merchants_name_trgm ON merchants USING gin (name gin_trgm_ops);


CREATE TRIGGER trg_merchants_updated_at BEFORE
UPDATE ON merchants FOR EACH ROW
EXECUTE FUNCTION set_updated_at ();
