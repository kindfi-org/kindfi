You are an expert developer in TypeScript, Node.js, Next.js 15 App Router, React, Supabase, GraphQL, Genql, DrizzleORM, HuggingFace Models, Tailwind CSS, Radix UI, and Shadcn UI.

---

## Coding Philosophy

Our coding philosophy revolves around writing **semantic, idiomatic, functional, and declarative code**. Follow these key principles:

- **Modern JavaScript & TypeScript:**  
  Leverage the latest features for expressive, maintainable code with an emphasis on TypeScript's type safety.
- **Declarative React:**  
  Describe UI structure and state, avoiding imperative code.
- **Readable Naming:**  
  Use self-explanatory names for variables, functions, and components.
- **Single Responsibility Principle:**  
  Keep components focused and reusable.
- **Favor Composition Over Inheritance:**  
  Build components and functions that promote modularity and reusability.
- **File Organization:**  
  Structure code logically, keeping readability and scalability in mind.
- **Utility-First Styling:**  
  Use TailwindCSS for rapid and consistent UI development.

---

## General Conventions

- **Project Structure:**

  - Organize components in a well-structured manner.
  - Separate concerns with clear folder structures.
  - Follow monorepo best practices (`apps/`, `packages/`,`services/`, `config/`).

- **Filenames:**

  - Use lowercase with dash separators (e.g., `auth-wizard.tsx`).
  - File extensions should indicate file types (e.g., `.config.ts`, `.test.ts`, `.hook.tsx`).

- **Exporting:**
  - Prefer named exports over default exports.

---

## JavaScript/TypeScript Best Practices

- **Naming Variables:**

  - Use meaningful names that reflect purpose.
  - Prefix booleans with auxiliary verbs (e.g., `isLoading`, `hasPermission`).

- **Functional Programming:**

  - Prefer `function` declarations for components.
  - Use the RORO (Receive an Object, Return an Object) pattern.

- **TypeScript Usage:**
  - Use `interface` for objects and class definitions.
  - Use `type` for unions, tuples, and aliases.
  - Avoid `any`; prefer explicit types and inference when possible.
  - Use `as` for type assertions when necessary.
  - Explicitly annotate function parameters and return types.

---

## React/Next.js Conventions

- **Component Declaration Order:**

  1. Imports
  2. Component declaration
  3. Styled components (if any)
  4. TypeScript types and interfaces

- **Component Structure:**

  - Small, focused components following single responsibility.
  - Use hooks for state management; avoid unnecessary re-renders.
  - Follow the `use client` directive judiciously.

- **State Management & Fetching:**

  - Prefer React Server Components (RSC) for data-heavy operations.
  - Use `next-safe-action` for secure server actions.
  - Leverage Supabase for real-time data synchronization.

- **Performance Optimization:**
  - Lazy load non-critical components.
  - Use Suspense with fallbacks for client-side components.
  - Optimize image loading with `next/image`.

---

## AI SDK Integration (Vercel AI SDK)

- Use **Vercel AI SDK UI** for chat interfaces.
- Use **Vercel AI SDK Core** for model interactions.
- Handle rate limits and fallback gracefully.
- Sanitize user inputs before sending to models.
- Store API keys securely using environment variables.

---

## HuggingFace Models

- Use `@huggingface/inference` for model interactions.
- Cache frequent model responses to reduce latency.
- Handle model switching and errors gracefully.
- Optimize queries for efficient token usage.

---

## DrizzleORM Best Practices

- Use DrizzleORM for database interactions with Supabase.
- Leverage migrations for schema evolution.
- Follow the repository pattern to encapsulate database logic.
- Optimize queries with proper indexing.
- Adhere to Supabase RLS policies.

---

## Supabase & GraphQL Guidelines

- Use Genql for type-safe GraphQL queries.
- Follow Supabase best practices for authentication and authorization.
- Implement efficient data fetching by requesting only required fields.

---

## Naming Conventions

- **Booleans:** Prefix with `does`, `has`, `is`, `should` (e.g., `isValid`, `hasError`).
- **Files:** Use lowercase with dash separators (e.g., `project-detail.tsx`).
- **Extensions:** Follow the convention:
  - `.config.ts` for configurations
  - `.test.ts` for tests
  - `.context.tsx` for context files
  - `.type.ts` for types
  - `.hook.ts` for hooks

---

## Styling with Tailwind CSS

- Follow utility-first principles.
- Use CVA (Class Variance Authority) for managing component variants.
- Maintain a mobile-first responsive approach.

---

## Testing Guidelines

- **Unit Tests:** Use Jest for utility functions and hooks.
- **Integration Tests:** Validate component interactions.
- **End-to-End Tests:** Use Cypress for key user flows.
- Ensure code coverage meets project standards.

---

## Accessibility Guidelines

- Ensure all interactive elements are keyboard accessible.
- Use ARIA roles and attributes for screen readers.
- Maintain WCAG compliance for color contrast and readability.

---

## Documentation Standards

- Provide clear and concise comments for complex logic.
- Use JSDoc comments to improve IDE intellisense.
- Maintain up-to-date README files with setup instructions.
- Document Supabase schemas and edge functions where applicable.

---

## Key Conventions

1. Rely on Next.js App Router for routing and state changes.
2. Prioritize Web Vitals (LCP, CLS, FID) for performance.
3. Use a monorepo structure with shared code in `packages/` and app-specific code in `apps/`.
4. Use Taskfile for automation of development and deployment workflows.
5. Adhere to the defined database schema with enum tables for predefined values.

---

## Security Practices

- Store sensitive data in environment variables.
- Validate all incoming API requests for security compliance.
- Implement Role-Based Access Control (RBAC) using Supabase policies.
- Set security headers (CSP, HSTS, etc.) using Next.js config
- Implement rate limiting for API routes
- Use prepared statements for database queries
- Enable audit logging for sensitive operations
- Implement session management best practices
- Regular security dependency updates

---

## Performance Optimization

- Minimize client-side dependencies.
- Use streaming and suspense features in Next.js.
- Leverage Incremental Static Regeneration (ISR) where applicable.
- Optimize bundle size using code splitting.

---

Refer to the official documentation for best practices in:

- **Next.js** (Data Fetching, Routing, Rendering)
- **Vercel AI SDK** (AI Integration)
- **Supabase** (Database and Authentication)
- **TailwindCSS** (Styling)
