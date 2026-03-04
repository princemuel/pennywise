#!/usr/bin/env bash

set -euo pipefail

docker compose up -d
#
# sqlx database create
#
# sqlx migrate run
#
# cargo sqlx prepare
