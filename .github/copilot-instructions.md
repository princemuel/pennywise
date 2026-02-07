# Pennywise: AI Agent Codebase Guide

## Project Architecture

**Pennywise** is a full-stack personal finance management app using a **monorepo structure** with multiple apps and shared Rust crates.

### Technology Stack

- **Rust backend**: Axum web framework + PostgreSQL (SQLx) with compile-time checked queries
- **Node.js frontend**: TanStack Start (apps/site - web app) + shared UI package
- **Build system**: Turbo monorepo orchestrator with pnpm workspace
- **Styling**: Tailwind CSS v4 (with custom `oklch` colors in [packages/tailwind-config/shared.css](packages/tailwind-config/shared.css))
- **Database**: PostgreSQL with SQL migrations (path-based, not macros) in [apps/api/migrations/](apps/api/migrations/)

### Monorepo Structure

```
apps/
  api/          # Rust Axum API server (port 8080)
  site/         # TanStack Start web app (port 3000) - full migration from Next.js
crates/
  auth/         # JWT + Argon2 password hashing (pennapi-auth)
  database/     # SQLx repository implementations (pennapi-db)
  engine/       # Domain models, error types, trait definitions (pennapi-core)
packages/
  eslint-config/    # Shared ESLint with Turbo plugin rules
  tailwind-config/  # Shared Tailwind with custom colors/themes
  typescript-config/
  ui/               # Shared React components (dialog, modal, icon, navlink)
```

## Critical Developer Workflows

### Build & Run

- **Root commands** (via Turbo): `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm format`
- **API Rust build** (nightly toolchain): `cd apps/api && cargo build --release`
- **Local dev server**: `pnpm dev` starts all apps (API on 8080, site on 3000)
- **Docker deployment**: [compose.yaml](compose.yaml) expects `app_network` to exist; uses multi-stage builds

### Database Migrations

- **Location**: [apps/api/migrations/](apps/api/migrations/) with SQL files (e.g., `001_table_users.sql`)
- **Tool**: SQLx migration system using path-based `migrate()` function (NOT compile-time macros)
- **Pattern**: All migrations include `-- +migrate Up/Down` comments; triggers auto-update `updated_at` timestamps
- **Run**: Automatic on API startup via [crates/database/src/lib.rs](crates/database/src/lib.rs#L49)

### Type Checking & Linting

- **TypeScript strict**: `pnpm typecheck` (TanStack Start with tsc)
- **ESLint**: Shared config with Turbo env var rule, no-warn plugin
- **Rust clippy**: `cargo clippy` (linter config in workspace [Cargo.toml](Cargo.toml#L7-L12))
- **Format**: `pnpm format` (Prettier with import/tailwind plugins)

## Architecture Patterns

### Rust Core Layer (pennapi-core)

The **source of truth** with zero external dependencies. All other crates depend on it:

- **Models**: Entity structs with Serde serialization (UUIDs, decimal amounts, timestamps)
- **Repository traits**: Define DB interfaces (no implementation here)
- **Error types**: [crates/engine/src/errors.rs](crates/engine/src/errors.rs) - unified `DBError` enum with variants like `NotFound`, `UniqueConstraintViolation`, `ForeignKeyConstraintViolation`

### Database Repositories

[crates/database/src/pqsl.rs](crates/database/src/pqsl.rs) implements repository traits using SQLx. Key trait:

```rust
pub trait SqlxErrorExt {
    fn into_db_error(self) -> DBError;  // Convert SQLx errors to domain errors
}
```

### Authentication Model

[crates/engine/src/models.rs](crates/engine/src/models.rs) separates concerns:

- **VerifiedIdentity**: External provider data (Google, GitHub, email)
- **User**: Internal user record (email, timezone, currency, locale)
- **AuthCredential**: Maps provider to user (handles OAuth + password hashing)
- **AuthContext**: Request context (user_id, session_id) - passed to handlers, never raw auth data

### Ledger-First Financial Models

Domain entities in [crates/engine/src/models.rs](crates/engine/src/models.rs):

- **Account**: Container for transactions (Checking, Savings, Credit, Cash, Investment types)
- **Transaction**: Core ledger entry with amounts, dates, accounts
- Uses `rust_decimal::Decimal` for currency (no floating-point math)

### Web App Patterns

**TanStack Start** ([apps/site/](apps/site/)) uses:

- **File-based routing**: Routes defined in [apps/site/src/routes/](apps/site/src/routes/) with `createFileRoute()` (e.g., `/dashboard.tsx`, `/auth/signin.tsx`)
- **Server Functions**: Defined in [apps/site/src/server/](apps/site/src/server/) with Zod schemas for validation
- **Conform forms**: Client-side form validation using [@conform-to/react](apps/site/package.json) with Zod integration
- **SSR & Streaming**: Full-document SSR with streaming support for progressive enhancement
- **DevTools**: React Router devtools + TanStack Query devtools for debugging

## Code Conventions

### Error Handling (Rust)

- Return `Result<T, DBError>` from repository functions
- Use `sqlx::Error::into_db_error()` to convert DB errors to domain errors
- Pattern match on DBError variants in handlers

### Database Access (Rust)

- Always use the `SqlxErrorExt` trait to normalize SQLx errors
- Migrations use path-based resolution (pass string path to `migrate()`, not macros)
- Feature-gate backends: default `postgres`, conditionally compile other DB implementations

### TypeScript/React

- **Validation**: Always use Zod schemas (especially for Server Functions)
- **Forms**: Use Conform with Zod for client-side validation (see [apps/site/src/routes/auth/signin.tsx](apps/site/src/routes/auth/signin.tsx))
- **Components**: Use utility components from [@repo/ui](packages/ui/) (dialog, modal, icon, navlink)
- **Types**: Strict mode enabled; avoid `any`; use TypeScript's native enum syntax
- **Styling**: Tailwind CSS with custom oklch colors defined in theme variables
- **Server Functions**: Prefix with "use server" directive; kept in [apps/site/src/server/](apps/site/src/server/)

### File Organization

- **Rust**: Entity models + traits in core, implementations in database/auth crates
- **TypeScript**: Schemas in [apps/site/src/schema/](apps/site/src/schema/), server functions in [apps/site/src/server/](apps/site/src/server/), routes in [apps/site/src/routes/](apps/site/src/routes/), helpers in [apps/site/src/helpers/](apps/site/src/helpers/)

## Integration Points

### API ↔ Web Communication

- API runs on `http://localhost:8080` (configurable via `NEXT_PUBLIC_API_HOST`)
- Site server functions call API endpoints
- Responses typed via Rust models → Serde → TypeScript

### External Dependencies

- **Auth**: Argon2 (password hashing), jsonwebtoken (JWT)
- **Database**: sqlx with tokio runtime, compile-time checked
- **HTTP**: Axum with tower-http middleware (CORS, compression, tracing)
- **Time**: Chrono (serde compatible); site uses temporal-polyfill for Temporal API

### Deployment

- Docker builds via [apps/site/Dockerfile](apps/site/Dockerfile): multi-stage with turbo prune
- Both API and site services in [compose.yaml](compose.yaml) on shared `app_network`
- Rust nightly toolchain ([rust-toolchain.toml](rust-toolchain.toml)) required for API

## Key Files Reference

- **Workspace root**: [Cargo.toml](Cargo.toml) (members, dependencies, lints)
- **Build config**: [turbo.json](turbo.json) (task graph, caching rules)
- **Domain models**: [crates/engine/src/models.rs](crates/engine/src/models.rs)
- **Error handling**: [crates/engine/src/errors.rs](crates/engine/src/errors.rs)
- **Database setup**: [crates/database/src/lib.rs](crates/database/src/lib.rs)
- **Auth schemas**: [apps/site/src/schema/auth.ts](apps/site/src/schema/auth.ts)
