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
- `NEXT_PUBLIC_ENABLE_POLLAR_ONBOARDING`, `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY`, `POLLAR_SECRET_KEY` — Pollar custodial wallet onboarding (feature-flagged)

Env examples: `apps/web/.env.example`, `packages/drizzle/.env.example`, `apps/contract/.env.example`.

## Stellar & Passkey Stack (Canonical)

**Production (Mainnet):** Dual onboarding — **Pollar** (social/email → custodial G-address, default when flag on) or **legacy passkey** + Stellar Wallet Kit (G-address) + Trustless Work escrow. Smart Account C-address flows are **disabled** by default.

| Layer | Package / path | Notes |
|-------|----------------|-------|
| Pollar onboarding | `apps/web/lib/pollar/` | Social/email login, custodial G-address, session bridge |
| Pollar feature flag | `@packages/lib/pollar` | `NEXT_PUBLIC_ENABLE_POLLAR_ONBOARDING` |
| Legacy auth | `apps/web/hooks/passkey/use-passkey-auth.ts` | WebAuthn + NextAuth |
| Unified escrow signing | `apps/web/hooks/escrow/use-trustless-signer.ts` | Pollar `signAndSubmitTx` or Wallet Kit |
| Production escrow signing | `@creit-tech/stellar-wallets-kit` | G-address only; required for Trustless Work |
| Smart Account module | `apps/web/lib/smart-account/` | Isolated C-address logic; see README in that folder |
| Shared Smart Account types | `@packages/lib/smart-account` | Feature flag, deployer, hooks |
| Blockchain SDK | `@stellar/stellar-sdk` | Transactions, contracts, RPC |
| Smart Account SDK | `smart-account-kit` | Client SDK; wrapped by `SmartAccountKitClientAdapter` |
| WebAuthn primitives | `@simplewebauthn/server`, `@simplewebauthn/browser` | Challenge/verification via `@packages/lib/passkey` |
| Escrow | `@trustless-work/escrow` | Milestone-based funding (G-address signing only) |
| Relayer | `@openzeppelin/relayer-sdk` | Fee-sponsored txs |

**Do not wire Smart Account C-addresses or Pollar smart-wallet C-addresses into production escrow** until Trustless Work supports C-address signing. Do not use `passkey-kit` for new code.

Pollar setup and spike checklist: `apps/web/lib/pollar/README.md`. Smart Account architecture and re-enable checklist: `apps/web/lib/smart-account/README.md`. Product context (why suspended, Mainnet replacement): `docs/smart-account-suspension.md`. Smart Account Kit API reference: `.cursor/rules/smart-account-kit.mdc`.

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
| Smart Account service | `apps/web/lib/smart-account/` | Isolated C-address module (feature-flagged) |
| Pollar integration | `apps/web/lib/pollar/` | Custodial G-address onboarding + TW signing |
| Drizzle schema | `packages/drizzle/src/data/schema/` |
| Supabase migrations | `services/supabase/` |
| Taskfile | `Taskfile.yml` |
| Web app README | `apps/web/README.md` |

## Further Reading

- [README.md](./README.md) — community, contributing, quick start
- [apps/web/README.md](./apps/web/README.md) — web app structure and features
- [Architecture docs](https://kindfis-organization.gitbook.io/development/kindfi-architecture)

## Cursor Cloud specific instructions

Durable, non-obvious caveats for running this repo in the Cursor Cloud VM. Standard commands live in `Taskfile.yml` / `apps/web/README.md`; the update script already runs `bun install`.

### Running the web app (primary product)
- Start: `task web:dev` (or `cd apps/web && bun dev`) → http://localhost:3000. Turbopack compiles routes on first request.
- `apps/web/.env` is required (gitignored). It is generated during setup with **local Supabase** keys. Regenerate keys with `cd services/supabase && bunx supabase status --workdir . -o env`.
- Env gotcha: do **not** put `CHALLENGE_TTL_SECONDS` in `apps/web/.env`. `transformEnv()` reads it raw and the schema requires a number; a string value fails startup validation. Leaving it unset yields the numeric default.

### Local Supabase (Docker) — non-obvious CLI quirk
- Docker is preinstalled (fuse-overlayfs, `containerd-snapshotter` disabled, iptables-legacy). If `docker info` fails, start the daemon: `sudo dockerd &` (then `sudo chmod 666 /var/run/docker.sock`).
- Start Supabase from the config dir with an explicit workdir: `cd services/supabase && bunx supabase start --workdir .`. Plain `supabase start` mis-detects the workdir (the project dir is itself named `supabase`) and aborts on `auth.email.template.*.content_path`. In this CLI version, `content_path` resolves relative to workdir while migrations/seed resolve under `<workdir>/supabase`.
- Because of that split, `--workdir .` brings the stack up but does **not** auto-apply the migrations in `services/supabase/migrations`.

### Known schema drift (applies to a fresh local DB)
The committed `services/supabase/migrations` do not cleanly build a working schema from scratch:
- The RLS-policy migration for `kyc_reviews` predates the migration that creates the table (filename order ≠ dependency order).
- `user_role` enum value `pending` (and `admin`) is referenced by profile-creation triggers but added in a later migration — apply `ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'pending'` / `'admin'` if triggers fail.
- App code (`lib/queries/projects/get-basic-project-info-by-slug.ts`) selects `projects.foundation_id` and reads a `foundations` table, but **no committed migration creates them**; project detail pages throw Postgres `42703` without `projects.foundation_id`. Add `ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS foundation_id uuid;` locally.
- Practical local setup: apply migrations tolerantly via `psql` (multiple passes, no `ON_ERROR_STOP`), then patch the objects above, then `NOTIFY pgrst, 'reload schema';` so PostgREST sees new columns. The committed `services/supabase/seed.sql` is also drifted (enum/FK mismatches) and only partially loads.

### Flows that need external services (cannot be exercised locally without secrets)
- **Email signup / OTP**: `lib/auth/signup-otp.service.ts` sends the code via **Resend** and hard-requires `RESEND_SMTP_API_KEY` (no dev/Mailpit fallback). Supabase Auth has `enable_confirmations = false`, so it is only the Resend send that blocks.
- **KYC**: needs Didit + the `services/ai` Express service (`task ai:dev`).
- **Passkey / smart-account auth** (the primary auth): needs a WebAuthn authenticator; not feasible headless.
- Unauthenticated **project discovery** (browse `/projects`, filter by category, open `/projects/[slug]`) is fully exercisable locally and is the recommended smoke test.

### Lint / test status
- `bun run lint` (Biome) and `cd apps/web && bun test` both run, but have **pre-existing** failures unrelated to setup (formatting nits; several tests time out waiting on unconfigured Redis/Upstash and external APIs).
