-- docker-entrypoint-initdb.d/init.sql
-- The POSTGRES_USER/POSTGRES_DB from env already exist at this point
-- (Docker creates them automatically from environment variables)
-- This file handles everything else.
-- Migration runner and test cloning role — full privileges, bypasses RLS
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kalel') THEN
        CREATE ROLE kalel WITH LOGIN PASSWORD 'krypton' BYPASSRLS;
    END IF;
END $$;


-- Runtime role — what Axum connects as, RLS applies
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pennywise_app') THEN
        CREATE ROLE pennywise_app WITH LOGIN PASSWORD 'somepassword';
    END IF;
END $$;


GRANT ALL PRIVILEGES ON DATABASE pennies TO kalel;


GRANT CONNECT ON DATABASE pennies TO pennywise_app;


-- -- Connect to the app DB to set schema-level grants
-- \connect pennies
-- -- Allow app role to use the public schema
-- GRANT USAGE ON SCHEMA public TO pennywise_app;
-- -- App role gets DML only — no DDL, no DROP
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pennywise_app;
-- -- Ensure future tables also get the grant automatically
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public
--     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pennywise_app;
