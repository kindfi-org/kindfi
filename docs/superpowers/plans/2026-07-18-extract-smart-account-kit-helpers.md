# Extract rpId/rpName resolution and kit loader from SmartAccountKitService — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the standalone helpers (`getRpId`, `getRpName`) and the dynamic package loader (`loadSmartAccountKit`) out of `smart-account-kit.service.ts` into two focused, independently unit-testable modules, leaving `SmartAccountKitService` focused on wallet lifecycle operations.

**Architecture:** Pure config-resolution helpers move to `smart-account-kit-config.utils.ts`; the module-level lazy-import cache moves to `smart-account-kit-loader.ts`. The service imports both and its behavior is unchanged. Behavior parity is protected by new unit tests for the extracted modules.

**Tech Stack:** TypeScript, Next.js (`apps/web`), `bun:test`, Biome (lint/format). Path alias `@/*` → `apps/web/*`.

---

## Context

- `apps/web/lib/stellar/smart-account-kit.service.ts` is 416 lines. It mixes the `SmartAccountKitService` class with the standalone helpers `getRpId`/`getRpName` (lines 68–126) and the dynamic loader `loadSmartAccountKit` with its module-level cache (lines 15–40).
- The service is **not imported anywhere else** (only referenced in comments/strings in `smart-wallet-transactions*.ts`), so this refactor is low-risk.
- Existing sibling pattern: `apps/web/lib/passkey/rp-id-helper.ts` exports origin-based `getRpIdFromOrigin`/`getRpNameFromOrigin`. Our helpers are `appConfig`-based and stay distinct.
- Tests live in `apps/web/test/*.test.ts` and run with `bun test`. Run from `apps/web` with `bun test`.

## Acceptance Criteria

- No change in wallet creation/connection behavior.
- New utility modules are independently unit-testable (covered by new tests).

## File Structure

- **Create** `apps/web/lib/stellar/smart-account-kit-config.utils.ts` — exports `getRpId`, `getRpName` (pure resolution from `AppEnvInterface` + optional override).
- **Create** `apps/web/lib/stellar/smart-account-kit-loader.ts` — exports `loadSmartAccountKit` + `SmartAccountKitModule` type; owns the module-level lazy-import cache.
- **Create** `apps/web/test/smart-account-kit-config.utils.test.ts` — unit tests for the helpers.
- **Create** `apps/web/test/smart-account-kit-loader.test.ts` — unit test for the loader.
- **Modify** `apps/web/lib/stellar/smart-account-kit.service.ts` — remove the moved code, import from the two new modules.

---

### Task 1: Extract config helpers (`getRpId`, `getRpName`)

**Files:**
- Create: `apps/web/lib/stellar/smart-account-kit-config.utils.ts`
- Test: `apps/web/test/smart-account-kit-config.utils.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/test/smart-account-kit-config.utils.test.ts`:

```ts
import { afterEach, describe, expect, test } from 'bun:test'
import type { AppEnvInterface } from '@packages/lib/types'
import {
	getRpId,
	getRpName,
} from '../lib/stellar/smart-account-kit-config.utils'

// Minimal appConfig shape used by the helpers
const makeConfig = (): AppEnvInterface =>
	({
		passkey: {
			expectedOrigin: ['https://app.kindfi.org'],
			rpId: ['kindfi.org'],
			rpName: ['KindFi'],
		},
	}) as unknown as AppEnvInterface

const originalWindow = (globalThis as { window?: unknown }).window

afterEach(() => {
	if (originalWindow === undefined) {
		// biome-ignore lint/performance/noDelete: test cleanup of injected global
		delete (globalThis as { window?: unknown }).window
	} else {
		;(globalThis as { window?: unknown }).window = originalWindow
	}
})

const setWindow = (origin: string, hostname: string) => {
	;(globalThis as { window?: unknown }).window = {
		location: { origin, hostname },
	}
}

describe('getRpId', () => {
	test('returns the explicitly provided rpId', () => {
		expect(getRpId(makeConfig(), 'explicit.example')).toBe('explicit.example')
	})

	test('server-side falls back to first configured rpId', () => {
		expect(getRpId(makeConfig())).toBe('kindfi.org')
	})

	test('server-side falls back to localhost when none configured', () => {
		const config = makeConfig()
		config.passkey.rpId = []
		expect(getRpId(config)).toBe('localhost')
	})

	test('browser matches origin to configured rpId', () => {
		setWindow('https://app.kindfi.org', 'app.kindfi.org')
		expect(getRpId(makeConfig())).toBe('kindfi.org')
	})

	test('browser falls back to hostname when origin not configured', () => {
		setWindow('https://staging.kindfi.org', 'staging.kindfi.org')
		expect(getRpId(makeConfig())).toBe('staging.kindfi.org')
	})
})

describe('getRpName', () => {
	test('returns the explicitly provided rpName', () => {
		expect(getRpName(makeConfig(), 'Explicit')).toBe('Explicit')
	})

	test('server-side falls back to first configured rpName', () => {
		expect(getRpName(makeConfig())).toBe('KindFi')
	})

	test('server-side falls back to default when none configured', () => {
		const config = makeConfig()
		config.passkey.rpName = []
		expect(getRpName(config)).toBe('App')
	})

	test('browser matches origin to configured rpName', () => {
		setWindow('https://app.kindfi.org', 'app.kindfi.org')
		expect(getRpName(makeConfig())).toBe('KindFi')
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test test/smart-account-kit-config.utils.test.ts`
Expected: FAIL — cannot resolve `../lib/stellar/smart-account-kit-config.utils`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/lib/stellar/smart-account-kit-config.utils.ts` (moved verbatim from the service, now exported):

```ts
import type { AppEnvInterface } from '@packages/lib/types'

/**
 * Get the appropriate RP ID based on the current environment
 * In the browser, uses the current hostname to match WebAuthn requirements
 */
export function getRpId(appConfig: AppEnvInterface, providedRpId?: string): string {
	// If explicitly provided, use it
	if (providedRpId) {
		return providedRpId
	}

	// In the browser, use the current hostname
	if (typeof window !== 'undefined') {
		const hostname = window.location.hostname

		// Try to match the current origin with expected origins
		const currentOrigin = window.location.origin
		const expectedOrigins = appConfig.passkey.expectedOrigin
		const rpIds = appConfig.passkey.rpId

		const originIndex = expectedOrigins.indexOf(currentOrigin)

		if (originIndex !== -1 && rpIds[originIndex]) {
			return rpIds[originIndex]
		}

		// If no match found, use the hostname directly (without port)
		// This ensures WebAuthn works correctly in production
		return hostname
	}

	// Server-side: use the first configured RP ID or fallback to localhost
	return appConfig.passkey.rpId[0] || 'localhost'
}

/**
 * Get the appropriate RP Name based on the current environment
 */
export function getRpName(appConfig: AppEnvInterface, providedRpName?: string): string {
	// If explicitly provided, use it
	if (providedRpName) {
		return providedRpName
	}

	// In the browser, try to match with expected origins
	if (typeof window !== 'undefined') {
		const currentOrigin = window.location.origin
		const expectedOrigins = appConfig.passkey.expectedOrigin
		const rpNames = appConfig.passkey.rpName

		const originIndex = expectedOrigins.indexOf(currentOrigin)

		if (originIndex !== -1 && rpNames[originIndex]) {
			return rpNames[originIndex]
		}
	}

	// Fallback to first configured RP name or default
	return appConfig.passkey.rpName[0] || 'App'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && bun test test/smart-account-kit-config.utils.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/stellar/smart-account-kit-config.utils.ts apps/web/test/smart-account-kit-config.utils.test.ts
git commit -m "refactor: extract rpId/rpName resolution into config utils module"
```

---

### Task 2: Extract the dynamic kit loader

**Files:**
- Create: `apps/web/lib/stellar/smart-account-kit-loader.ts`
- Test: `apps/web/test/smart-account-kit-loader.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/test/smart-account-kit-loader.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import { loadSmartAccountKit } from '../lib/stellar/smart-account-kit-loader'

describe('loadSmartAccountKit', () => {
	test('returns null when smart-account-kit is not installed', async () => {
		// The optional peer dependency is not installed in the test environment,
		// so the loader must degrade gracefully instead of throwing.
		const result = await loadSmartAccountKit()
		expect(result).toBeNull()
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test test/smart-account-kit-loader.test.ts`
Expected: FAIL — cannot resolve `../lib/stellar/smart-account-kit-loader`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/lib/stellar/smart-account-kit-loader.ts` (moved verbatim from the service, now exported with a return type):

```ts
/**
 * Smart Account Kit dynamic loader
 *
 * Lazily imports the optional `smart-account-kit` package and caches the
 * resolved module members. Returns `null` when the package is not installed
 * so callers can degrade gracefully.
 *
 * Install with: bun add smart-account-kit
 */

// Dynamic import to handle missing package gracefully
// Types are dynamically imported and may not exist if package is not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SmartAccountKit: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let IndexedDBStorage: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MemoryStorage: any

export interface SmartAccountKitModule {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	SmartAccountKit: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	IndexedDBStorage: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	MemoryStorage: any
}

// Lazy load the package - will be loaded when first needed
export const loadSmartAccountKit = async (): Promise<SmartAccountKitModule | null> => {
	if (SmartAccountKit && IndexedDBStorage) {
		return { SmartAccountKit, IndexedDBStorage, MemoryStorage }
	}

	try {
		const kitModule = await import('smart-account-kit')
		SmartAccountKit = kitModule.SmartAccountKit
		IndexedDBStorage = kitModule.IndexedDBStorage
		MemoryStorage = kitModule.MemoryStorage
		return { SmartAccountKit, IndexedDBStorage, MemoryStorage }
	} catch {
		// Package not installed - this is expected until user installs it
		return null
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && bun test test/smart-account-kit-loader.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/stellar/smart-account-kit-loader.ts apps/web/test/smart-account-kit-loader.test.ts
git commit -m "refactor: extract smart-account-kit dynamic loader into its own module"
```

---

### Task 3: Wire the service to the extracted modules

**Files:**
- Modify: `apps/web/lib/stellar/smart-account-kit.service.ts`

- [ ] **Step 1: Remove the loader block and its module-level cache**

Delete lines 15–40 (the `SmartAccountKit`/`IndexedDBStorage`/`MemoryStorage` `let` declarations and the `loadSmartAccountKit` const). Delete lines 68–126 (the `getRpId` and `getRpName` function definitions). Keep the interfaces (`SmartAccountKitConfig`, `CreateWalletOptions`, `CreateWalletResult`) and the class.

- [ ] **Step 2: Add imports at the top of the file**

Replace the top-of-file imports so they read:

```ts
import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import { logger } from '@/lib/logger'
import {
	getRpId,
	getRpName,
} from '@/lib/stellar/smart-account-kit-config.utils'
import { loadSmartAccountKit } from '@/lib/stellar/smart-account-kit-loader'
```

The service continues to call `getRpId(appConfig, config?.rpId)` and `getRpName(appConfig, config?.rpName)` in the constructor and `loadSmartAccountKit()` in `ensureInitialized` — no call-site changes needed since signatures are identical.

- [ ] **Step 3: Verify types**

Run: `cd apps/web && bunx tsc --noEmit -p tsconfig.json`
Expected: no new errors referencing `smart-account-kit.service.ts`, `smart-account-kit-config.utils.ts`, or `smart-account-kit-loader.ts`. (If the project has pre-existing unrelated errors, confirm none are newly introduced by these files.)

- [ ] **Step 4: Run the full stellar-related test suite + lint**

Run: `cd apps/web && bun test test/smart-account-kit-config.utils.test.ts test/smart-account-kit-loader.test.ts`
Expected: PASS (10 tests total).

Run: `bun run lint` (from repo root) or `bunx biome check apps/web/lib/stellar apps/web/test/smart-account-kit-config.utils.test.ts apps/web/test/smart-account-kit-loader.test.ts`
Expected: no Biome errors on the touched files. Apply `biome check --write` if formatting differs.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/stellar/smart-account-kit.service.ts
git commit -m "refactor: import extracted rpId/rpName helpers and loader in service"
```

---

## Self-Review

- **Spec coverage:** `getRpId`/`getRpName` → `smart-account-kit-config.utils.ts` (Task 1). `loadSmartAccountKit` → `smart-account-kit-loader.ts` (Task 2). Service imports utilities, stays focused on wallet lifecycle (Task 3). New modules independently unit-testable (Tasks 1 & 2 tests). Behavior unchanged — code moved verbatim, call sites unchanged.
- **Type consistency:** Helper signatures `(appConfig: AppEnvInterface, provided?: string) => string` match the service call sites. Loader returns `SmartAccountKitModule | null`, consumed by `ensureInitialized` exactly as before (`if (!kitModule) …`, `kitModule.MemoryStorage`, `kitModule.IndexedDBStorage`, `kitModule.SmartAccountKit`).
- **Placeholder scan:** none.
