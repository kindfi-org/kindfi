# Vibe Coding Guide

Single-file AI context guide for Trustless Work Escrow Blocks with Next.js. Built for agent workflows.

{% hint style="info" %}
Export this page to PDF or Markdown and feed it to your copilot (Cursor, Claude, etc).
{% endhint %}

## What This File Is

- **Purpose:** Give an AI (or a very fast human) all the context needed to install, wire, and use **Trustless Work Escrow Blocks** with Next.js.
- **Scope:** Installation, required providers (order matters), commands to add blocks, example pages, dependency rules, actions, and troubleshooting.
- **Audience:** Builders, PMs, and AIs doing codegen for **single-release** and **multi-release** escrow UIs.

## Quick Mental Model

- **Escrow Blocks** = prebuilt React components + hooks that talk to the Trustless Work API/SDK for escrow lifecycles.
- **Providers** must wrap your app in a **specific order** (React Query → TW → Wallet → Escrow → Dialogs → Amount). Do not reorder.
- **Listings** (by role / by signer) show escrows and open detail dialogs with context-aware actions. Some actions ship **commented**; enable the version matching your escrow type (single or multi).

## Project Bootstrap (Next.js + Blocks)

### Create the App

```bash
npx create-next-app@latest tw-blocks-dapp --typescript --tailwind
cd tw-blocks-dapp
```

### Install Escrow Blocks

```bash
npm install @trustless-work/blocks
```

### Run the CLI (Recommended)

```bash
npx trustless-work init
```

**What it does:**
- Installs deps (`@tanstack/react-query`, forms/validation libs, shadcn/ui).
- Generates `.twblocks.json`.
- Offers to **wire providers** in `app/layout.tsx` for you.

> You can also add modules incrementally with `npx trustless-work add <module>`.

## Environment

Create `.env.local` (reads can work without a key; write flows need it):

```bash
# Required for authenticated calls (when you start acting)
NEXT_PUBLIC_API_KEY=your_api_key_here
```

> Get your API key in the dApp when ready to move beyond read-only dev flows.

## Provider Stack (Order is Critical)

> If you skipped CLI wiring, add these providers **in this exact order**.

```tsx
// app/layout.tsx
import "./globals.css";
import { ReactQueryClientProvider } from "@/components/tw-blocks/providers/ReactQueryClientProvider";
import { TrustlessWorkProvider } from "@/components/tw-blocks/providers/TrustlessWork";
import { WalletProvider } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { EscrowProvider } from "@/components/tw-blocks/providers/EscrowProvider";
import { EscrowDialogsProvider } from "@/components/tw-blocks/providers/EscrowDialogsProvider";
import { EscrowAmountProvider } from "@/components/tw-blocks/providers/EscrowAmountProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryClientProvider>
          <TrustlessWorkProvider>
            <WalletProvider>
              <EscrowProvider>
                <EscrowDialogsProvider>
                  <EscrowAmountProvider>
                    {children}
                  </EscrowAmountProvider>
                </EscrowDialogsProvider>
              </EscrowProvider>
            </WalletProvider>
          </TrustlessWorkProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
```

**Why it matters:** The blocks depend on React Query + Trustless Work context + wallet + escrow state + dialogs/amount contexts. Reordering breaks hooks and UI flows.

## Add Modules & Blocks (CLI)

Run these once per project:

```bash
# Core glue
npx trustless-work add wallet-kit
npx trustless-work add providers
npx trustless-work add tanstack
npx trustless-work add helpers
npx trustless-work add handle-errors

# Lifecycle blocks
npx trustless-work add escrows/single-release
npx trustless-work add escrows/multi-release
npx trustless-work add escrows/single-multi-release

# Listings
npx trustless-work add escrows/escrows-by-role/cards
# optional:
# npx trustless-work add escrows/escrows-by-role/table
# npx trustless-work add escrows/escrows-by-signer/cards
# npx trustless-work add escrows/escrows-by-signer/table
```

## Your First Page (Wallet + Init + Listings)

```tsx
// app/page.tsx
"use client";

import { WalletButton } from "@/components/tw-blocks/wallet-kit/WalletButtons";
import { InitializeEscrowDialog } from "@/components/tw-blocks/escrows/single-release/initialize-escrow/dialog/InitializeEscrow";
import { EscrowsByRoleCards } from "@/components/tw-blocks/escrows/escrows-by-role/cards/EscrowsCards";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Trustless Work Demo</h2>
        <WalletButton />
      </header>

      <div className="flex justify-end mb-4">
        <InitializeEscrowDialog />
      </div>

      <EscrowsByRoleCards />
    </div>
  );
}
```

**What you'll see:** wallet connect, "Initialize Escrow" (single-release), and a cards grid filtered by **role** (actions are role/state-aware).

## Actions: Enable the Right Buttons

Inside listings' **detail dialog**, some actions are **commented** so you can enable only what you need per escrow type:

```tsx
// escrows/escrows-by-role/details/Actions.tsx (example)
return (
  <div className="flex items-start justify-start flex-col gap-2 w-full">
    {/* Render actions conditionally by flags + roles */}
    {hasConditionalButtons && (
      <div className="flex flex-col gap-2 w-full">
        {/* Single-release only */}
        {/* {shouldShowEditButton && <UpdateEscrowDialog />} */}
        {/* {shouldShowDisputeButton && <DisputeEscrowButton />} */}
        {/* {shouldShowResolveButton && <ResolveDisputeDialog />} */}
        {/* {shouldShowReleaseFundsButton && <ReleaseEscrowButton />} */}
      </div>
    )}
    <FundEscrowDialog /> {/* shared single/multi */}
  </div>
);
```

When ready, import & enable:

```tsx
// escrows/escrows-by-role/details/Actions.tsx (imports)
import { UpdateEscrowDialog } from "../../single-release/update-escrow/dialog/UpdateEscrow";
/* import { UpdateEscrowDialog as UpdateEscrowDialogMultiRelease } from "../../multi-release/update-escrow/dialog/UpdateEscrow"; */
import { FundEscrowDialog } from "../../single-multi-release/fund-escrow/dialog/FundEscrow";
import { DisputeEscrowButton } from "../../single-release/dispute-escrow/button/DisputeEscrow";
import { ResolveDisputeDialog } from "../../single-release/resolve-dispute/dialog/ResolveDispute";
import { ReleaseEscrowButton } from "../../single-release/release-escrow/button/ReleaseEscrow";
```

> **Rule of thumb:** Use **single-release** actions for single escrows; use **multi-** components for multi escrows. Listings are shared, funding/approve/status are shared via `single-multi-release`.

## Dependency Rules (Practical)

**Listings (by role / by signer)** need:
- `wallet-kit`, `providers`, `tanstack`, `helpers`, `handle-errors`, **plus** lifecycle blocks for the actions you'll expose.

**Single-release or Multi-release actions** need:
- `wallet-kit`, `providers`, `tanstack`, `helpers` (+ `handle-errors`), **and** the corresponding block set(s).

**Provider order** must match the provider stack section above.

## Usage Flow (Testnet Demo Path)

1. **Connect wallet** (Freighter).
2. **Initialize escrow** (single or multi).
3. **Fund** the escrow (shared dialogs/buttons).
4. **Change milestone status**, **approve**, and then **release** (release-all for single; **release milestone** for multi).
5. Optional: **Dispute/Resolve** flows (type-specific components).

> Tip: Listings filter by **role**; the visible actions depend on your **role** + **escrow state**. Add the **USDC trustline** in Freighter to interact smoothly.

## Troubleshooting (Fast Fixes)

- **Buttons do nothing / disabled:** Your account doesn't have the required **role**, the **escrow state** doesn't allow that action, or the escrow isn't **funded/approved** yet.
- **Hooks failing / context error:** Provider order is wrong. Compare with the canonical order here.
- **Client vs server error:** Add `"use client"` to pages/components that consume hooks.
- **Asset errors:** Ensure the **USDC trustline** is added in Freighter for the correct network.
- **Read-only works; writes fail:** Missing or invalid `NEXT_PUBLIC_API_KEY`, wrong role, or wallet not on the right network.

## Minimal "Blocks Gallery" Pattern (Optional)

A local gallery lets teammates see every block live:

- Dev server: `pnpm dev` → open `/blocks`
- Wire the global providers (as above)
- Add pages:
  - `/blocks/wallet-button`
  - `/blocks/escrows-by-role/cards|table`
  - `/blocks/escrows-by-signer/cards|table`
  - `/blocks/single-release/*` (init/update/dispute/resolve/release)
  - `/blocks/multi-release/*` (init/update/dispute/resolve/release-milestone)
  - `/blocks/single-multi-release/*` (fund/approve/change-status)

## Prompt Scaffolds (Copy-Paste)

### A) System Prompt (One-Time Context)

```
You are an expert Next.js + Trustless Work Escrow Blocks engineer.
Follow these rules:
- Use files and paths exactly as provided here.
- Keep provider order identical to the guide.
- Prefer code that compiles with no TODOs.
- When an escrow type is single vs multi, import the matching actions.
```

### B) Task Prompt (Generate Page + Wiring)

```
Build a Next.js page that:
1) shows a WalletButton in the header,
2) renders InitializeEscrowDialog (single-release),
3) lists EscrowsByRoleCards with working details,
4) enables FundEscrowDialog and ReleaseEscrowButton for single-release.

Use the provider order from app/layout.tsx and imports from:
/components/tw-blocks/...

If a component uses hooks, ensure "use client" at top.
```

### C) Debug Prompt (When Things Break)

```
Given provider order MUST be:
ReactQueryClientProvider > TrustlessWorkProvider > WalletProvider > EscrowProvider > EscrowDialogsProvider > EscrowAmountProvider.

Identify why EscrowsByRoleCards actions are disabled. Check:
- wallet role vs escrow role,
- escrow funded/approved flags,
- correct single vs multi action imports,
- USDC trustline present in Freighter (Testnet).
Propose exact code edits.
```

## Notes for AIs (Indexing Hints)

- **Important keywords:** Trustless Work, Escrow Blocks, single-release, multi-release, providers, WalletProvider, ReactQueryClientProvider, role-based actions, FundEscrowDialog, ApproveMilestoneDialog, ChangeMilestoneStatusDialog, ReleaseEscrowButton, ReleaseMilestoneButton, InitializeEscrowDialog.
- **Do not reorder** providers. Quote this rule when suggesting edits.
- Docs are **AI-exportable**; searching the docs in natural language is supported.

## Appendix: Canonical Provider Order

```tsx
<ReactQueryClientProvider>
  <TrustlessWorkProvider>
    <WalletProvider>
      <EscrowProvider>
        <EscrowDialogsProvider>
          <EscrowAmountProvider>
            {children}
          </EscrowAmountProvider>
        </EscrowDialogsProvider>
      </EscrowProvider>
    </WalletProvider>
  </TrustlessWorkProvider>
</ReactQueryClientProvider>
```

**This is the required provider order. Do not reorder.**

## License to Remix

Use, copy, embed, and ship. If your agent needs more, point it at the full docs hub and API reference. The overall documentation explicitly supports AI export & semantic search.
