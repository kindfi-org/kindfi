# KindFi Web App Platform

## Getting Started

First, install all the dependencies if you haven´t:

```bash
bun install
```

Second, make sure to configure your environment variables by creating a `.env` file based on the `.env.sample` provided. You can do this by running:

```bash
cp .env.sample .env
```

> You can update the `.env` file with the Vercel environment variables from the KindFi team for the development credentials.

Third, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start Editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```bash
kindfi
├── apps
│   ├── web
│   │   ├── app # Next.js app
│   │   │   ├── css
│   │   │   │   └── globals.css
│   │   │   ├── fonts # Custom fonts
│   │   │   │   └── Geist.woff
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components
│   │   │   ├── base # Base components
│   │   │   │   └── dialog.tsx
│   │   │   ├── shared # Shared components
│   │   │   │   └── layout.tsx
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

## Configuration

Make sure to configure your environment variables by creating a `.env` file based on the `.env.sample` provided. Additionally, check the `tsconfig.json` and `next.config.ts` for TypeScript and Next.js configurations respectively.

## Design System

This project uses Tailwind CSS for styling. The configuration can be found in `tailwind.config.ts`. The design system is based on the "New York" style with custom configurations for colors and other styles.

## Why Drizzle ORM?

Drizzle ORM is a lightweight and easy-to-use ORM for Node.js. It simplifies database interactions with a straightforward API and supports multiple databases. In the KindFi monorepo, Drizzle ORM helps manage shared database access across services, reducing complexity and making the application easier to maintain and extend. Using Drizzle ORM for admin actions avoids overloading Supabase with requests, ensuring efficient database operations.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
