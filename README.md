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

## 🤝 Contributing

We welcome contributions from the Stellar community and beyond! Before contributing, please read our guidelines to ensure your contributions align with our standards.

### Getting Started

1. **Read Our Code of Conduct**: All contributors must follow our [Code of Conduct](./CODE_OF_CONDUCT.md). It outlines our community standards, values, and expectations for respectful collaboration.

2. **Review Our Contribution Guide**: Familiarize yourself with our comprehensive [OSS Contribution Guide](https://kindfis-organization.gitbook.io/development/oss-contribution-guide) which covers:
   - How to set up your development environment
   - Our code style and conventions
   - Git workflow and branch naming
   - Pull request process

3. **Study Our Code Standards**: Review our [Code Style and Conventions](https://kindfis-organization.gitbook.io/development/code-and-design-guide-style-and-conventions) to understand:
   - TypeScript best practices
   - React/Next.js conventions
   - File organization and naming
   - Testing requirements

### Using React Best Practices in Your Coding Agent

We recommend using React best practices in your coding agent (Cursor, Codex, Claude Code, Opencode, etc.) to help maintain code quality. These best practices are packaged as Agent Skills that can detect issues like cascading `useEffect` calls or heavy client-side imports and suggest fixes.

**Install the agent skills globally:**

```bash
npx add-skill vercel-labs/agent-skills
```

> ⚠️ **Important:** These agent skills should be installed globally on your development machine and should **not** be committed to the repository. They are personal development tools and should not be part of any OSS contributions or commits.

### Recommended MCP Servers

We recommend configuring Model Context Protocol (MCP) servers in your development environment to enhance your AI coding assistant's capabilities when working with KindFi. MCPs provide your AI assistant with direct access to documentation, APIs, and tools specific to our tech stack.

**Configure MCPs in Cursor:**

Add the following configuration to your `~/.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF",
      "headers": {}
    },
    "OpenZeppelinStellarContracts": {
      "type": "streamable-http",
      "url": "https://mcp.openzeppelin.com/contracts/stellar/mcp"
    },
    "trustlesswork": {
      "type": "streamable-http",
      "url": "https://docs.trustlesswork.com/trustless-work/~gitbook/mcp"
    }
  }
}
```

**Available MCPs:**

1. **Supabase MCP** - Provides direct access to your Supabase project:
   - Database schema queries and migrations
   - Edge function management
   - Real-time subscriptions
   - Authentication and storage operations
   - Replace `YOUR_PROJECT_REF` with your actual Supabase project reference

2. **OpenZeppelin Stellar Contracts MCP** - Access to OpenZeppelin's Stellar contract library:
   - Generate contract code for NFTs, tokens, and access control
   - Access contract templates and best practices
   - Helps with smart contract development in `apps/contract`

3. **Trustless Work MCP** - Documentation and resources for Stellar development:
   - React library documentation
   - Wallet Kit integration guides
   - Type definitions and API references
   - Stellar ecosystem best practices

> 💡 **Note:** MCP configurations are personal development tools and should **not** be committed to the repository. Each developer should configure their own MCP servers with their project-specific credentials.

### Contribution Process

1. **Find an Issue**: Browse our GitHub issues or join our Telegram community to find tasks that match your skills.

2. **Create a Branch**: Follow our branch naming convention:
   - Features: `feat-123-feature-name`
   - Fixes: `fix-456-bug-description`
   - Always branch from `develop`

3. **Write Quality Code**:
   - Follow our TypeScript and React conventions
   - Write meaningful commit messages (lowercase, under 72 characters)
   - Sign all commits for security
   - Include tests and documentation

4. **Submit a Pull Request**:
   - All PRs undergo automated review by CodeRabbitAI
   - Human review follows from project maintainers
   - Ensure your code passes all linting and tests

### Key Requirements

- ✅ **Signed Commits**: All commits must be signed for authenticity
- ✅ **Code Quality**: Follow our established code style guide
- ✅ **Documentation**: Include JSDoc comments and update relevant docs
- ✅ **Testing**: Ensure code coverage meets project standards
- ✅ **Respectful Communication**: Engage constructively in reviews and discussions

### Resources

- 📚 [Live Documentation](https://kindfis-organization.gitbook.io/development)
- 💬 [Telegram Community](https://t.me/+CWeVHOZb5no1NmQx) - Get help and connect with contributors
- 📋 [Code of Conduct](./CODE_OF_CONDUCT.md) - Community standards and expectations
- 🏗️ [Architecture Documentation](https://kindfis-organization.gitbook.io/development/kindfi-architecture)

### Questions?

If you have questions about contributing, feel free to:

- Ask in our [Telegram community](https://t.me/+CWeVHOZb5no1NmQx)
- Open a GitHub discussion
- Review our [contribution guide](https://kindfis-organization.gitbook.io/development/oss-contribution-guide)

**Thank you for contributing to KindFi!** 🚀

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
