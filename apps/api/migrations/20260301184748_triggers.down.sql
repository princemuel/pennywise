-- Add down migration script here
-- NOTE: triggers attached to tables are dropped automatically when those tables are dropped.
-- These functions are dropped here only if you need to roll back the triggers migration
-- in isolation (i.e. without dropping the tables that depend on them).
-- If dependent tables still exist, drop their triggers first or drop this after the
-- tables migrations are rolled back.
DROP FUNCTION IF EXISTS sync_pot_total () CASCADE;


DROP FUNCTION IF EXISTS set_updated_at () CASCADE;
