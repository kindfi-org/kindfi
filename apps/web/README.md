# KindFi Web Application

A Next.js 16 web application for blockchain-powered social impact crowdfunding, built on Stellar/Soroban with WebAuthn passkey authentication.

## 🚀 Features

- **🔐 Passkey Authentication**: WebAuthn-based passwordless authentication with smart account integration
- **🌐 Stellar Blockchain Integration**: Smart contracts, escrow, and token transfers via Stellar/Soroban
- **💼 Smart Wallets**: OpenZeppelin Smart Account Kit integration for secure wallet management
- **📊 Project Management**: Create, manage, and support social impact projects with milestone-based funding
- **🔒 Escrow System**: Trustless Work escrow integration for secure, milestone-based fund releases
- **👤 KYC Verification**: Identity verification powered by [Didit](https://didit.me/) - AI-native KYC with support for 220+ countries, liveness detection, and document verification
- **💬 Community Features**: Comments, Q&A, project updates, and supporter tracking
- **🔔 Notifications**: Push notifications and real-time updates
- **📰 Content Management**: MDX-based news/blog system with RSS feeds
- **🌍 Internationalization**: Multi-language support (i18n)
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS and Shadcn UI

## 🛠️ Tech Stack

### Core

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Bun** - Package manager and runtime

### Authentication & Security

- **NextAuth.js** - Authentication framework
- **@simplewebauthn** - WebAuthn/Passkey implementation
- **smart-account-kit** - Stellar smart account management
- **Supabase** - Database and authentication backend
- **Didit** - AI-native identity verification and KYC platform

### Blockchain

- **@stellar/stellar-sdk** - Stellar blockchain SDK
- **@openzeppelin/relayer-sdk** - Transaction relaying
- **@trustless-work/escrow** - Escrow contract integration
- **@creit-tech/stellar-wallets-kit** - Wallet connectivity

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library (Radix UI primitives)
- **Framer Motion** - Animation library
- **TipTap** - Rich text editor
- **Lucide React** - Icon library

### Data & State Management

- **@tanstack/react-query** - Server state management
- **Drizzle ORM** - Type-safe database queries
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Additional Tools

- **MDX** - Markdown with JSX
- **Redis/Upstash** - Rate limiting and caching
- **Resend** - Email service
- **Biome** - Linting and formatting

## 📁 Project Structure

```
apps/web/
├── app/                          # Next.js App Router
│   ├── (auth-pages)/            # Authentication routes
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── passkey-registration/
│   │   └── reset-password/
│   ├── (routes)/                # Public routes
│   │   ├── home/
│   │   ├── projects/
│   │   │   └── [slug]/
│   │   │       └── manage/     # Project management
│   │   ├── profile/
│   │   ├── about/
│   │   └── create-project/
│   ├── api/                     # API routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── passkey/           # WebAuthn endpoints
│   │   ├── stellar/           # Stellar blockchain APIs
│   │   ├── escrow/            # Escrow operations
│   │   ├── projects/          # Project CRUD
│   │   ├── comments/          # Comments system
│   │   └── notifications/      # Push notifications
│   ├── actions/               # Server actions
│   ├── news/                  # MDX blog/news
│   └── layout.tsx
├── components/
│   ├── base/                  # Shadcn UI components
│   ├── shared/               # Shared components
│   │   ├── layout/           # Header, Footer, Layout
│   │   ├── kyc/              # KYC flow components
│   │   └── qa/               # Q&A components
│   ├── sections/             # Page sections
│   ├── pages/                # Page-level components
│   └── cards/                # Card components
├── hooks/
│   ├── contexts/             # React contexts
│   ├── passkey/              # Passkey hooks
│   ├── stellar/              # Stellar hooks
│   ├── escrow/               # Escrow hooks
│   └── projects/            # Project hooks
├── lib/
│   ├── auth/                  # Auth utilities
│   ├── stellar/              # Stellar utilities
│   ├── queries/               # React Query queries
│   ├── services/              # Service layer
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   ├── validators/            # Zod schemas
│   ├── constants/            # App constants
│   ├── i18n/                  # Internationalization
│   └── email/                 # Email templates
├── auth/                      # Custom auth adapters
├── content/                   # MDX content files
├── public/                    # Static assets
├── middleware.ts              # Next.js middleware
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- **Bun** >= 1.3.1
- **Node.js** >= 20
- **Supabase** account (for database)
- **Stellar** testnet/mainnet access
- **Didit** account (for KYC verification) - [Sign up for free](https://didit.me/)

### Installation

1. **Install dependencies** (from monorepo root):

```bash
bun run init
```

Or from this directory:

```bash
bun install
```

2. **Set up environment variables**:

Create a `.env` file in `apps/web/` with the following variables:

```bash
# Database
DATABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Smart Account Kit
NEXT_PUBLIC_ACCOUNT_WASM_HASH=your_account_wasm_hash
NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS=your_verifier_address

# Escrow (Trustless Work)
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=your_escrow_contract
TRUSTLESS_WORK_API_KEY=your_api_key

# Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Email (Resend)
RESEND_API_KEY=your_resend_key

# KYC (Didit)
DIDIT_API_KEY=your_didit_api_key
DIDIT_WEBHOOK_SECRET=your_didit_webhook_secret

# Other
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> 💡 **Note**: Check with the KindFi team for development credentials or use the `.env.sample` template.

3. **Run the development server**:

From monorepo root:

```bash
task web:dev
```

Or from this directory:

```bash
bun dev
```

4. **Open your browser**:

Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Authentication Flow

1. **Traditional Auth**: Email/password with NextAuth + Supabase
2. **Passkey Auth**: WebAuthn registration → Smart Account creation → Stellar wallet
3. **Session Management**: NextAuth sessions with Supabase token refresh

### Blockchain Integration

- **Smart Accounts**: OpenZeppelin Smart Account Kit for passkey-secured wallets
- **Transactions**: Stellar SDK for building and signing transactions
- **Escrow**: Trustless Work for milestone-based fund releases
- **Relayer**: OpenZeppelin Relayer SDK for fee-sponsored transactions

### Data Flow

- **Server Components**: Next.js App Router for server-side rendering
- **Client Components**: React Query for client-side data fetching
- **Real-time**: Supabase Realtime subscriptions
- **Caching**: React Query cache + Redis for rate limiting

## 📝 Key Features Explained

### Passkey Authentication

The app supports WebAuthn passkeys for passwordless authentication:

- Registration flow creates a passkey and associated smart account
- Authentication uses passkey signatures
- Smart accounts are deployed on Stellar/Soroban

### Project Management

- **Create Projects**: Rich editor with TipTap, file uploads, milestones
- **Manage Projects**: Team management, settings, pitch deck updates
- **Support Projects**: Contribute funds via Stellar, track contributions

### Escrow System

- Funds are held in smart contract escrows
- Milestone-based releases require verification
- Dispute resolution system for conflicts

### KYC Verification

Identity verification powered by [Didit](https://didit.me/), an AI-native identity verification platform:

- **Free Core KYC**: Government ID verification across 220+ countries
- **Liveness Detection**: Passive and active liveness checks to prevent fraud
- **Face Matching**: 1:1 biometric verification
- **Document Verification**: OCR extraction and validation
- **AML Screening**: Optional advanced checks for compliance
- **Proof of Address**: Address verification support
- **API Integration**: Developer-first API for seamless integration
- **GDPR Compliant**: Meets EU, US, LATAM, and APAC compliance standards

The verification flow can be integrated via:

- **Hosted Flow**: No-code verification links
- **API Integration**: Programmatic verification sessions
- **Webhooks**: Real-time verification status updates

## 🧪 Testing

Run tests:

```bash
bun test
```

Test files are located in the `test/` directory.

## 🎨 Design System

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Pre-built component library
- **Custom Theme**: Extended Tailwind config with brand colors
- **Typography**: Geist font family

### Component Structure

- **Base Components**: Located in `components/base/` (Shadcn UI)
- **Shared Components**: Reusable components in `components/shared/`
- **Page Sections**: Page-specific sections in `components/sections/`

## 🔧 Configuration

### Next.js Config

Key configurations in `next.config.ts`:

- **MDX Support**: Experimental MDX RS for faster compilation
- **Server External Packages**: Stellar and passkey packages
- **Image Optimization**: Supabase storage patterns
- **Security Headers**: CSP, HSTS, X-Frame-Options

### TypeScript

- Strict mode enabled
- Path aliases configured (`~/` for `apps/web/`)
- Shared types from `@packages/lib`

## 📦 Monorepo Integration

This app uses shared packages:

- **@packages/lib**: Shared utilities, hooks, and services
- **@packages/drizzle**: Database schema and migrations
- **@services/supabase**: Supabase service configuration

## 🚢 Deployment

### Build for Production

```bash
bun run build
```

### Start Production Server

```bash
bun start
```

### Environment Variables

Ensure all production environment variables are set in your deployment platform (Vercel, etc.).

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Stellar Documentation](https://developers.stellar.org/)
- [Smart Account Kit](https://github.com/kalepail/smart-account-kit)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)
- [Didit Documentation](https://didit.me/) - Identity verification platform

## 🤝 Contributing

See the main [README.md](../../README.md) for contribution guidelines.

## 📄 License

See the main repository LICENSE file.
