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
