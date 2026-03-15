ARG RUST_VERSION=1.94

# --- Planner: generate dependency recipe
FROM rust:${RUST_VERSION}-slim-trixie AS chef
RUN cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# --- Cacher: build dependencies only (cached unless Cargo.toml changes)
FROM chef AS cacher
RUN apt-get update && apt-get install -y --no-install-recommends pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# --- Builder: compile the code
FROM rust:${RUST_VERSION}-slim-trixie AS builder
RUN apt-get update && apt-get install -y --no-install-recommends pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Reuse compiled dependencies
COPY --from=cacher /app/target target
COPY --from=cacher /usr/local/cargo /usr/local/cargo
COPY rust-toolchain.toml rust-toolchain.toml
COPY .cargo/config.toml .cargo/config.toml
# Copy the source
COPY . .
ENV SQLX_OFFLINE=true
# Build only the entrypoint's binary
RUN cargo build --release --bin web

# --- Runtime: the minimal final image
FROM debian:trixie-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libssl3 && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 axum && \
    useradd --uid 1001 --gid axum --shell /bin/bash --create-home axum

WORKDIR /app

COPY --from=builder /app/target/release/web          ./api
COPY --from=builder /app/config/environments         ./config/environments
COPY --from=builder /app/db/migrations               ./db/migrations
COPY --from=builder /app/db/.sqlx                    ./db/.sqlx

RUN chown -R axum:axum /app
USER axum

ENV APP_ENVIRONMENT=production
EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=3s --retries=5 --start-period=10s \
    CMD wget -qO- http://localhost:8080/misc/ping || exit 1
CMD ["./api"]
