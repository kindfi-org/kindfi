# Instructions 

Integrate Languine.ai for Automated Localization

## Overview
To enhance KindFi’s global accessibility and reduce manual translation efforts, we will integrate Languine.ai, an AI-powered, developer-first CLI tool designed to automate localization. This ensures our platform remains multilingual, consistent, and efficient, reinforcing KindFi’s vision as an inclusive and scalable Web3 crowdfunding ecosystem.

## Why Languine.ai?
✔ AI-Powered Translations: Automates localization across 100+ languages while ensuring contextual accuracy.
✔ Git-Aware Automation: Tracks translation changes via Git diff, dynamically updating modified strings.
✔ Consistent Localization: Maintains uniform tone, style, and translation key integrity across languages.
✔ Developer-Centric: CLI-based, supports multiple file formats (.json, .yaml, .md, .ts, .po, etc.).
✔ CI/CD-Friendly: Seamless integration into CI/CD pipelines ensures up-to-date translations at every deployment.

## Goal
Integrate Languine.ai into KindFi’s Next.js architecture to automate localization workflows, including:
✅ Setting up Languine CLI (npx languine@latest) and running initial tests.
✅ Defining supported languages and integrating them into our project structure.
✅ Automating translation updates via Git diff detection.
✅ Integrating Languine into CI/CD for automated localization syncing.
✅ Creating a language selector in the navbar for users to switch languages.
✅ Validating AI-generated translations for quality, consistency, and accuracy.
✅ Documenting the setup process, usage, and best practices.

## Technical Approach
1️⃣ Setup & Configuration
📌 Install Languine CLI:

```npx languine@latest```

📌 Configure Languine to detect new, modified, and removed translation keys in KindFi’s repository.
📌 Define source language and target languages in .json or .yaml files.
📌 Verify compatibility with KindFi’s supported formats (.json, .ts, .md, .yaml, .po).

2️⃣ Automating Localization Workflow
📌 Utilize Git diff detection to track and manage new translation keys dynamically.
📌 Ensure automated translation updates upon new feature deployments.
📌 Format extracted translation keys using Prettier/Biome hooks.

3️⃣ Creating the Language Selector
📌 Implement a language selector in the navbar to allow users to switch between supported languages.
📌 Use React Context or Next.js middleware to store and retrieve the selected language preference.
📌 Ensure smooth UX with instant language switching across all pages.
📌 Maintain local storage or session storage for user preferences.

4️⃣ CI/CD Integration
📌 Add Languine to KindFi’s CI/CD pipeline to automate localization updates.
📌 Ensure translation synchronization is triggered on every push/PR merge.

5️⃣ Testing & Validation
📌 Validate AI-generated translations against original content.
📌 Conduct manual reviews for tone, accuracy, and contextual consistency.
📌 Ensure integration does not impact KindFi’s performance.
📌 Test language selector functionality for a seamless user experience.

## Deliverables
📌 Languine integration branch with a fully functional localization setup.
📌 Automated translation workflow via Git diff detection.
📌 CI/CD pipeline automation to keep translations up-to-date.
📌 Language selector in navbar for multilingual support.
📌 Internal documentation detailing setup, usage, and best practices.

## Acceptance Criteria
✅ Languine successfully installed and configured.
✅ Translations auto-generate upon new key detection.
✅ CI/CD integration ensures up-to-date translations.
✅ Localized files are structured, retrievable, and maintain language consistency.
✅ Clear documentation covering setup, troubleshooting, and usage.
✅ Users can switch languages via the navbar language selector.

## File Structure


.
├── README.md
├── Taskfile.yml
├── apps
│   ├── contract
│   ├── indexer
│   ├── kyc-server
│   └── web
├── biome.json
├── bun.lock
├── bun.lockb
├── commitlint.config.js
├── docs
│   ├── README.md
│   ├── SUMMARY.md
│   ├── code-and-design-guide-style-and-conventions
│   └── oss-contribution-guide
├── index.ts
├── instructions
│   └── instructions.md
├── package.json
├── services
│   ├── ai
│   ├── dictionary
│   └── supabase
└── tsconfig.json

14 directories, 12 files
tree -L 3 -I 'node_modules|.git'
.
├── README.md
├── Taskfile.yml
├── apps
│   ├── contract
│   │   ├── Cargo.toml
│   │   ├── README.md
│   │   ├── contracts
│   │   └── scripts
│   ├── indexer
│   │   ├── LICENSE
│   │   ├── README.md
│   │   ├── docker
│   │   ├── docker-compose.yml
│   │   ├── package.json
│   │   ├── project.ts
│   │   ├── schema.graphql
│   │   ├── src
│   │   └── tsconfig.json
│   ├── kyc-server
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── public
│   │   ├── src
│   │   └── tsconfig.json
│   └── web
│       ├── README.md
│       ├── app
│       ├── bun.lockb
│       ├── components
│       ├── components.json
│       ├── hooks
│       ├── lib
│       ├── middleware.ts
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── public
│       ├── tailwind.config.ts
│       └── tsconfig.json
├── biome.json
├── bun.lock
├── bun.lockb
├── commitlint.config.js
├── docs
│   ├── README.md
│   ├── SUMMARY.md
│   ├── code-and-design-guide-style-and-conventions
│   │   ├── README.md
│   │   ├── code-and-design-guide-style-and-conventions-1.md
│   │   └── code-and-design-guide-style-and-conventions.md
│   └── oss-contribution-guide
│       ├── issue-application-template.md
│       ├── oss-contribution-guide-how-to-contribute.md
│       └── oss-contribution-guide-project-architecture.md
├── index.ts
├── instructions
│   └── instructions.md
├── package.json
├── services
│   ├── ai
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── src
│   │   └── tests
│   ├── dictionary
│   │   └── README.md
│   └── supabase
│       ├── README.md
│       ├── config.toml
│       ├── package.json
│       ├── seed.sql
│       └── src
└── tsconfig.json

28 directories, 46 files
tree -L 4 -I 'node_modules|.git'
.
├── README.md
├── Taskfile.yml
├── apps
│   ├── contract
│   │   ├── Cargo.toml
│   │   ├── README.md
│   │   ├── contracts
│   │   │   └── nft
│   │   └── scripts
│   │       └── deploy.sh
│   ├── indexer
│   │   ├── LICENSE
│   │   ├── README.md
│   │   ├── docker
│   │   │   ├── load-extensions.sh
│   │   │   └── pg-Dockerfile
│   │   ├── docker-compose.yml
│   │   ├── package.json
│   │   ├── project.ts
│   │   ├── schema.graphql
│   │   ├── src
│   │   │   ├── index.ts
│   │   │   ├── mappings
│   │   │   └── test
│   │   └── tsconfig.json
│   ├── kyc-server
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── public
│   │   │   ├── index.html
│   │   │   └── styles.css
│   │   ├── src
│   │   │   ├── app.ts
│   │   │   ├── controllers
│   │   │   ├── db
│   │   │   ├── resolvers
│   │   │   ├── routes
│   │   │   └── types
│   │   └── tsconfig.json
│   └── web
│       ├── README.md
│       ├── app
│       │   ├── (api-routes)
│       │   ├── (auth-pages)
│       │   ├── (routes)
│       │   ├── actions.ts
│       │   ├── api
│       │   ├── auth
│       │   ├── css
│       │   ├── favicon.ico
│       │   ├── fonts
│       │   ├── layout.tsx
│       │   ├── not-found.tsx
│       │   └── page.tsx
│       ├── bun.lockb
│       ├── components
│       │   ├── base
│       │   ├── env-var-warning.tsx
│       │   ├── fallbacks
│       │   ├── form-message.tsx
│       │   ├── header-auth.tsx
│       │   ├── hero.tsx
│       │   ├── icons
│       │   ├── mocks
│       │   ├── next-logo.tsx
│       │   ├── pages
│       │   ├── sections
│       │   ├── shared
│       │   └── theme-switcher.tsx
│       ├── components.json
│       ├── hooks
│       │   ├── use-auth.tsx
│       │   ├── use-form-validation.ts
│       │   ├── use-glow-effect.ts
│       │   ├── use-mobile.tsx
│       │   └── use-reduced-motion.tsx
│       ├── lib
│       │   ├── animation.ts
│       │   ├── animations.ts
│       │   ├── config
│       │   ├── constants
│       │   ├── error.ts
│       │   ├── mock-data
│       │   ├── stellar
│       │   ├── supabase
│       │   ├── types
│       │   ├── utils
│       │   ├── utils.ts
│       │   └── validators
│       ├── middleware.ts
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── public
│       │   ├── icons
│       │   └── images
│       ├── tailwind.config.ts
│       └── tsconfig.json
├── biome.json
├── bun.lock
├── bun.lockb
├── commitlint.config.js
├── docs
│   ├── README.md
│   ├── SUMMARY.md
│   ├── code-and-design-guide-style-and-conventions
│   │   ├── README.md
│   │   ├── code-and-design-guide-style-and-conventions-1.md
│   │   └── code-and-design-guide-style-and-conventions.md
│   └── oss-contribution-guide
│       ├── issue-application-template.md
│       ├── oss-contribution-guide-how-to-contribute.md
│       └── oss-contribution-guide-project-architecture.md
├── index.ts
├── instructions
│   └── instructions.md
├── package.json
├── services
│   ├── ai
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.ts
│   │   │   ├── constants
│   │   │   ├── middlewares
│   │   │   ├── services
│   │   │   └── utils
│   │   └── tests
│   │       ├── services
│   │       └── setup.ts
│   ├── dictionary
│   │   └── README.md
│   └── supabase
│       ├── README.md
│       ├── config.toml
│       ├── package.json
│       ├── seed.sql
│       └── src
│           ├── database.schemas.ts
│           └── database.types.ts
└── tsconfig.json



