-- Add down migration script here
-- Dropping users cascades to auth_tokens (FK ON DELETE CASCADE).
-- Triggers, indexes, policies, and RLS are dropped automatically with each table.
DROP TABLE IF EXISTS auth_tokens CASCADE;

DROP TABLE IF EXISTS users CASCADE;
