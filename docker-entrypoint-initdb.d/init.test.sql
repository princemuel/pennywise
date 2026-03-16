-- docker-entrypoint-initdb.d/init.test.sql
-- db_test container uses POSTGRES_USER=api_test, POSTGRES_DB=api_test
-- Those are created automatically by Docker.
-- This file just flags it and grants privileges.
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kalel') THEN
        CREATE ROLE kalel WITH LOGIN PASSWORD 'krypton' BYPASSRLS;
    END IF;
END $$;


GRANT ALL PRIVILEGES ON DATABASE api_test TO kalel;


-- Flag this as the test DB so current_app_user_id() uses fallback behaviour
ALTER DATABASE api_test
SET
    app.is_test_db = 'true';
