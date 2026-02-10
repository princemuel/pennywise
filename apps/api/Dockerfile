ARG RUST_VERSION=1.93

# --- Planner: generate dependency recipe
FROM rust:${RUST_VERSION}-slim-bookworm AS planner
RUN cargo install cargo-chef
WORKDIR /app
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# --- Cacher: build dependencies only (cached unless Cargo.toml changes)
FROM rust:${RUST_VERSION}-slim-bookworm AS cacher
RUN apt-get update && apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*
RUN cargo install cargo-chef
WORKDIR /app
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# --- Builder: compile your actual code
FROM rust:${RUST_VERSION}-slim-bookworm AS builder
RUN apt-get update && apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Reuse compiled dependencies
COPY --from=cacher /app/target target
COPY --from=cacher /usr/local/cargo /usr/local/cargo
# Copy source
COPY . .
# Build only the api binary
RUN cargo build --release -p --bin api

# --- Runtime: minimal final image
FROM debian:trixie-slim AS runtime
RUN apt-get update && apt-get install -y ca-certificates libssl3 && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 axum && \
    useradd --uid 1001 --gid axum --shell /bin/bash --create-home axum

WORKDIR /app

COPY --from=builder /app/target/release/api        ./api
COPY --from=builder /app/apps/api/migrations       ./migrations

RUN chown -R axum:axum /app
USER axum

ENV RUST_LOG=info
ENV PORT=8080
ENV SQLX_OFFLINE=true
EXPOSE 8080

CMD ["./api"]
