# KindFi Monorepo — Agent Guide

Executor context for AI agents working in this repository. Read this before making changes.

## Overview

KindFi is a Bun workspaces monorepo for blockchain-powered social-impact crowdfunding on Stellar/Soroban. The primary app is `apps/web` (Next.js 16). Shared logic lives in `packages/*`; backend services in `services/*`.

## Workspace Map

| Path | Package | Purpose |
|------|---------|---------|
| `apps/web` | Next.js app | Main product UI, API routes, server actions |
| `apps/contract` | Rust/Soroban | Smart contracts (auth, governance, NFT, quest, referral, reputation, streak) |
| `apps/indexer` | `@kindfi/indexer` | SubQuery indexer for on-chain activity → off-chain data |
| `services/supabase` | `@services/supabase` | Supabase CLI, migrations, generated types/schemas |
| `services/ai` | `ai-service` | Express AI service (sentiment, biometrics, KYC helpers) |
| `packages/lib` | `@packages/lib` | Shared TS: config, Supabase clients, Stellar, passkey, hooks |
| `packages/drizzle` | `@packages/drizzle` | Drizzle ORM schema, migrations, direct Postgres access |

**Workspace boundaries:** `apps/*`, `services/*`, and `packages/*` are Bun workspaces (see root `package.json`). Import shared code via workspace package names (`@packages/lib`, `@packages/drizzle`, `@services/supabase`), not deep relative paths across workspace roots.

## Prerequisites & Setup

- **Bun** `1.3.14` (pinned in `package.json` `engines` / `packageManager`)
- **Node.js** ≥ 20 (some tooling)
- **Rust** + Stellar CLI (for `apps/contract` only)
- **Task** (optional but preferred for dev commands)

```bash
bun run init          # bun install + husky
task web:dev          # start web app
task --list           # all Taskfile commands
```

## Canonical Dev Commands

| Command | What it does |
|---------|--------------|
| `task web:dev` | Next.js dev server (`apps/web`) |
| `task web:build` | Production build |
| `task indexer:dev` | SubQuery indexer (Docker) |
| `task indexer:build` | Build indexer |
| `task supabase:gen` | Regenerate Supabase types + Zod schemas |
| `task supabase:gen-local` | Same, against local Supabase |
| `task ai:dev` | AI service |
| `task lint` / `task lint:fix` | Biome format + lint (root) |

Linting uses **Biome** (not ESLint/Prettier). Run `task lint:fix` before committing.

## Environment Variables

Env validation lives in `packages/lib/src/config/app-env.config.ts`. Call `appEnvConfig('web')` to validate at startup.

### Web app required vars

Defined in `appRequirements.web`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_KYC_API_BASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_SECRET`

### Commonly needed optional vars

- `SUPABASE_SERVICE_ROLE_KEY` — server-only; see Supabase rules below
- `SUPABASE_DB_URL` — direct Postgres (Drizzle)
- `RPC_URL`, `NETWORK_PASSPHRASE`, `STELLAR_NETWORK_URL` — Stellar network
- `SOROBAN_PRIVATE_KEY` — server-side contract signing
- `TRUSTLESS_WORK_API_URL`, `TRUSTLESS_WORK_API_KEY` — escrow
- `RESEND_SMTP_API_KEY` — email
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — rate limiting
- `RP_ID`, `RP_NAME`, `EXPECTED_ORIGIN` — WebAuthn (JSON arrays)

Env examples: `apps/web/.env.example`, `packages/drizzle/.env.example`, `apps/contract/.env.example`.

## Stellar & Passkey Stack (Canonical)

**Use these for all new wallet/smart-account work:**

| Layer | Package / path | Notes |
|-------|----------------|-------|
| Blockchain SDK | `@stellar/stellar-sdk` | Transactions, contracts, RPC |
| Smart accounts | `smart-account-kit` | **Canonical** passkey/smart-wallet SDK |
| Service wrapper | `apps/web/lib/stellar/smart-account-kit.service.ts` | App-specific `SmartAccountKitService` |
| WebAuthn primitives | `@simplewebauthn/server`, `@simplewebauthn/browser` | Challenge/verification via `@packages/lib/passkey` |
| Wallet connectivity | `@creit-tech/stellar-wallets-kit` | External G-address wallets |
| Escrow | `@trustless-work/escrow` | Milestone-based funding |
| Relayer | `@openzeppelin/relayer-sdk` | Fee-sponsored txs |

**Do not use `passkey-kit` for new code.** It is a legacy dependency still listed in `apps/web/package.json` but superseded by `smart-account-kit`. Existing references in `smart-wallet-transactions.ts` throw with a migration message.

Smart Account Kit API reference is also in `.cursor/rules/smart-account-kit.mdc` (Cursor-only); agents outside Cursor should read `apps/web/lib/stellar/smart-account-kit.service.ts` and the [smart-account-kit repo](https://github.com/kalepail/smart-account-kit).

Contract development: `apps/contract` (Rust/Soroban). See `.agents/skills/soroban/SKILL.md`.

## Supabase & Database Boundaries

### Three data-access paths — use the right one

1. **Supabase client (PostgREST)** — most app queries
   - Browser: `createSupabaseBrowserClient()` from `@packages/lib/supabase-client` (anon key, RLS)
   - Server components / RSC: `createSupabaseServerClient()` from `@packages/lib/supabase-server`
   - Types: `Tables`, `Database` from `@services/supabase`

2. **Service-role client (bypasses RLS)** — `@packages/lib/supabase` → `packages/lib/src/supabase/shared/service-role-client.ts`
   - **Server-only:** API routes, server actions, background jobs
   - **Never import in client components, hooks, or `'use client'` modules**
   - Always pair with explicit auth checks (NextAuth session, manual authorization)

3. **Drizzle ORM** — `@packages/drizzle`
   - Direct Postgres for tables Drizzle owns: WebAuthn challenges/devices, NextAuth adapter tables, profiles
   - Used by `@packages/lib/db` (passkey challenges) and some server actions
   - Migrations: `packages/drizzle` (`bun run generate`, `bun run migrate`)
   - Schema source of truth: `packages/drizzle/src/data/schema/`

### Supabase schema changes

1. Add migration in `services/supabase`
2. Run `task supabase:gen` to regenerate `database.types.ts` + Zod schemas
3. Update Drizzle schema only if the table is also managed by Drizzle

**Do not** hand-edit generated files in `services/supabase/src/`.

## App Architecture (`apps/web`)

- **Framework:** Next.js 16 App Router, React 19, TypeScript, Tailwind + Shadcn
- **Auth:** NextAuth.js with custom WebAuthn provider (`apps/web/auth/`)
- **Routes:** `app/(routes)/` (public), `app/(auth-pages)/`, `app/api/` (Route Handlers), `app/actions/` (Server Actions)
- **Shared UI:** `components/base/` (Shadcn), `components/sections/`, `components/shared/`
- **Data fetching:** TanStack Query hooks in `hooks/`, query functions in `lib/queries/`
- **Validation:** Zod schemas in `lib/validators/`

Prefer server-side auth checks in API routes and Server Actions (treat them as public endpoints).

## Agent Skills

Specialized skills live in `.agents/skills/`. Read the relevant `SKILL.md` before domain work:

| Skill | Use when |
|-------|----------|
| `stellar-dev` | Stellar/Soroban development |
| `dapp` | Frontend wallet/blockchain integration |
| `soroban` | Smart contract authoring/testing |
| `trustless-work-dev` | Escrow, milestones, disputes |
| `assets` | Stellar Assets, trustlines, SAC |
| `data` | RPC/Horizon queries, indexing |
| `standards` | SEPs, ecosystem integrations |
| `supabase` | Supabase schema, auth, RLS (also `.cursor/plugins`) |
| `vercel-react-best-practices` | React/Next.js performance |
| `vercel-composition-patterns` | Component architecture |
| `vercel-react-view-transitions` | View Transition API |
| `vercel-optimize` | Vercel cost/performance |
| `deploy-to-vercel` | Deployment |
| `web-design-guidelines` | UI/accessibility review |
| `writing-guidelines` | Docs prose review |

## Conventions for Agents

1. **Minimize scope** — match existing patterns; don't refactor unrelated code.
2. **Workspace imports** — `@packages/lib`, `@packages/drizzle`, `@services/supabase`; avoid `../../../` across workspaces.
3. **No service-role in the browser** — anon client + RLS on client; service-role only in server contexts with auth.
4. **smart-account-kit, not passkey-kit** — for wallet features.
5. **Biome** for lint/format; **Bun** for package management.
6. **No `cd &&` chains** in shell — run commands from the target directory or use Taskfile.
7. **Trustless Work** — follow official docs; use provided types, not `any`.
8. **Contract changes** — test in `apps/contract`; don't couple Rust changes to web deploys without coordination.

## Key File References

| Topic | Path |
|-------|------|
| Env validation | `packages/lib/src/config/app-env.config.ts` |
| Service-role client | `packages/lib/src/supabase/shared/service-role-client.ts` |
| Browser Supabase client | `packages/lib/src/supabase/client/browser-client.ts` |
| Server Supabase client | `packages/lib/src/supabase/server/server-client.ts` |
| Smart Account service | `apps/web/lib/stellar/smart-account-kit.service.ts` |
| Drizzle schema | `packages/drizzle/src/data/schema/` |
| Supabase migrations | `services/supabase/` |
| Taskfile | `Taskfile.yml` |
| Web app README | `apps/web/README.md` |

## Further Reading

- [README.md](./README.md) — community, contributing, quick start
- [apps/web/README.md](./apps/web/README.md) — web app structure and features
- [Architecture docs](https://kindfis-organization.gitbook.io/development/kindfi-architecture)
