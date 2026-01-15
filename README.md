# <a href="https://deepwiki.com/kindfi-org/kindfi"><img src="https://deepwiki.com/badge.svg" width="164" height="164" alt="Ask DeepWiki"></a> KindFi Monorepo

The KindFi monorepo contains the following apps, services, and packages:

## Apps

- [apps/web](./apps/web): The Next.js web application
- [apps/contract](./apps/contract): Stellar/Soroban smart contracts (Rust)
- [apps/indexer](./apps/indexer): SubQuery indexer for blockchain data indexing

## Services

- [services/supabase](./services/supabase): Supabase database migrations and configuration
- [services/ai](./services/ai): AI service for face detection and analysis

## Packages

- [packages/lib](./packages/lib): Shared TypeScript library with utilities, hooks, and services
- [packages/drizzle](./packages/drizzle): Drizzle ORM schema and migrations

## 📣 Community

Join our open-source contributor community on Telegram:  
**[https://t.me/+CWeVHOZb5no1NmQx](https://t.me/+CWeVHOZb5no1NmQx)**

We collaborate, debug, and build together — whether you're a beginner or advanced dev, you're welcome here.

## 🚀 Quick Start

### Prerequisites

- **Bun** >= 1.3.1 (see [package.json](./package.json) for exact version)
- **Node.js** >= 20 (for some tooling)
- **Rust** (for smart contract development)

### Setup

> 👀 **Important:** To make Biome work with auto-formatting, make sure to have `Biome` as the **default code formatter**. You can find the configuration with the command `CTRL + ,` or `CMD + ,` for MacOS users and search for `vscode://settings/editor.defaultFormatter`. This will read the monorepo Biome configuration. Make sure to have the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) installed in your IDE.

1. **Install all dependencies:**

```bash
bun run init # Runs: bun install && bun husky:prepare
```

> Biome and pre-commit hooks should be installed by now. Ready to run!

2. **Run development servers:**

The easiest way to run services is using the [Taskfile](./Taskfile.yml) commands:

```bash
# Run web app
task web:dev

# Run indexer in development mode
task indexer:dev

# Build indexer
task indexer:build

# Generate Supabase types
task supabase:gen
```

Or manually:

```bash
# Web app
cd apps/web && bun dev

# Indexer
cd apps/indexer && bun dev

# AI service
cd services/ai && bun dev
```

### Available Taskfile Commands

Run `task` or `task --list` to see all available commands. Key commands include:

- `task web:dev` - Run web app development server
- `task web:build` - Build web app for production
- `task indexer:dev` - Run indexer in development mode
- `task indexer:build` - Build the indexer
- `task supabase:gen` - Generate Supabase types
- `task lint` - Format and lint the codebase
- `task lint:fix` - Fix formatting and linting issues

You can see the full list of commands in each `package.json` file in the `apps`, `services`, and `packages` directories.
