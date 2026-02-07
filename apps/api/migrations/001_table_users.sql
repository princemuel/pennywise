-- +migrate Up
-- Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    passhash TEXT NOT NULL,
    created_at TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT NOW()
);
-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(email);
-- Function to auto-update `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger for the table
CREATE TRIGGER trigger_update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- +migrate Down
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP TABLE IF EXISTS users CASCADE;
