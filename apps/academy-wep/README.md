# **KindFi Academy**

## **Introduction**

Welcome to **KindFi Academy**—the onboarding platform for project owners and foundations raising funds through KindFi. The academy provides essential training on blockchain basics, Stellar network fundamentals, and the management of USDC and XLM. Completion of the KindFi Academy learning path is required to unlock the **first tranch** of funding for your project.

---

## **Getting Started**

### 1. **Install Dependencies**

Make sure you have [Bun](https://bun.sh/) installed. Then, install all the project dependencies:

```bash
bun install
```

---

### 2. **Set Up Environment Variables**

Create a `.env` file based on the provided `.env.sample` file:

```bash
cp .env.sample .env
```

> Update the `.env` file with the appropriate development credentials provided by the KindFi team.

---

### 3. **Run the Development Server**

Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app locally.

---

## **Project Structure**

```bash
kindfi-academy
├── apps
│   ├── web
│   │   ├── app # Next.js app
│   │   │   ├── css
│   │   │   │   └── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components
│   │   │   ├── base # Base components
│   │   │   ├── shared # Shared components
│   │   │   ├── page # Page components
│   │   │   └── sections # Section components for pages
│   │   ├── context # Context providers
│   │   ├── hooks # Custom hooks (no context)
│   │   │   └── use-supabase.ts
│   │   ├── lib # Utility functions library
│   │   │   └── utils.ts
│   │   ├── public # Static files
│   │   ├── tsconfig.json
│   │   └── README.md
├── services # Shared services
│   └── supabase
│       └── src
│           └── database.schemas.ts
├── package.json
└── README.md
```

---

## **Configuration**

Ensure the following configuration files are properly set up:

- `.env` → environment variables for app configuration.
- `tsconfig.json` → TypeScript configurations.
- `next.config.js` → Next.js configuration.

---

## **Course Structure**

KindFi Academy provides structured lessons on the following topics:

1. **Blockchain Basics** – Introduction to blockchain and the Stellar network.
2. **How Transactions Work** – Fees, P2P transactions, ledgers, and smart wallets.
3. **USDC and XLM** – How to use USDC and XLM within the KindFi ecosystem.

✅ Upon completion of the academy, participants will receive a **graduate NFT** as proof of completion.  
✅ This NFT will unlock the first tranch of project funding within the KindFi escrow system.

---

## **Design System**

This project uses **Tailwind CSS** for styling.  
The configuration can be found in `tailwind.config.ts`.

---

## **Why Drizzle ORM?**

We use **Drizzle ORM** for managing database interactions because:

- Lightweight and easy to use.
- Provides type-safe queries and structured data access.
- Reduces complexity and makes database operations more efficient.
- Works seamlessly with Supabase to handle admin-level actions.

---

## **Learn More**

To learn more about the tools used in this project, check out these resources:

- [Next.js Documentation](https://nextjs.org/docs) – Learn about Next.js features and API.
- [Tailwind CSS](https://tailwindcss.com/docs) – A utility-first CSS framework.
- [Supabase](https://supabase.com/docs) – Realtime database and authentication.
- [Stellar](https://developers.stellar.org/docs) – Blockchain fundamentals and use cases.

---

## **Contributing**

We welcome contributions from the KindFi community!  
If you’d like to contribute, please follow our [contribution guidelines](./CONTRIBUTING.md).

---

## **License**

This project is open-source under the **MIT License**.
