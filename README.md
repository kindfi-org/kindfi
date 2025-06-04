# KindFi Monorepo

The KindFi monorepo apps and services are the following:

- [apps/web](./apps/web): The web app.
- [apps/kyc-server](./apps/kyc-server): The KYC server.
- [apps/contract](./apps/contract): The smart contract.
- [services/supabase](./services/supabase): The Supabase service.
- [services/ai](./services/ai): The AI service.
- [services/dictionary](./services/dictionary): The dictionary service.

## 📣 Community

Join our open-source contributor community on Telegram:  
**[https://t.me/+CWeVHOZb5no1NmQx](https://t.me/+CWeVHOZb5no1NmQx)**

We collaborate, debug, and build together — whether you're a beginner or advanced dev, you're welcome here.

## 🚀 Quick Start

### BEFORE ANYTHING ELSE

> **Mac/Linux Users:** Follow the [Taskfile.yml](./Taskfile.yml) for the full list of commands to run the project in different areas. Each command has a description of what it does.

> 👀 To make Biome work with auto-formatting, make sure to have `Biome` as the **default code formatter**. You can find the configuration with the command `CTRL + ,` or `CMD + ,` for MacOS users and search for the `vscode://settings/editor.defaultFormatter`. This will read the monorepo Biome configuration. Make sure to have the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) in your IDE before doing any installation.

1. To install all dependencies, run the following command:

```bash
bun run init # bun install && bun husky:prepare
```

> Biome and pre-commit hooks should be installed by now. Ready to run!

1. To run:

```bash
# web app
cd apps/web
bun dev

# kyc-server
cd apps/kyc-server
bun dev

# ...
```

You can see the full list of commands in each of the `package.json` files in the `apps` and `services` directories.

## Environment Variables

The following Supabase-related environment variables are required for the application to function correctly:

```
# Server-side Supabase credentials
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Client-side (public) Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Ensure these are set in your environment or .env files as appropriate for your deployment.
