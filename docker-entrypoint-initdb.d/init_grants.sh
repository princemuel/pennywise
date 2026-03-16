#!/usr/bin/env bash
# docker-entrypoint-initdb.d/init_grants.sh

set -Eeuo pipefail
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "pennies" <<-EOSQL
    GRANT USAGE ON SCHEMA public TO pennywise_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pennywise_app;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pennywise_app;
EOSQL
