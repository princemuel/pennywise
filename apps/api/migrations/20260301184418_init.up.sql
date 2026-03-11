-- Add up migration script here
-- pg_trgm: used for fuzzy/trigram search on merchant names.
-- uuidv7() is available as a native function in PostgreSQL 18+. No extension required.
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
