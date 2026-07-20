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
// biome-ignore lint/suspicious/noExplicitAny: optional dynamic import — types unavailable when package is absent
let SmartAccountKit: any
// biome-ignore lint/suspicious/noExplicitAny: optional dynamic import — types unavailable when package is absent
let IndexedDBStorage: any
// biome-ignore lint/suspicious/noExplicitAny: optional dynamic import — types unavailable when package is absent
let MemoryStorage: any

export interface SmartAccountKitModule {
	// biome-ignore lint/suspicious/noExplicitAny: optional dynamic import — types unavailable when package is absent
	SmartAccountKit: any
	// biome-ignore lint/suspicious/noExplicitAny: optional dynamic import — types unavailable when package is absent
	IndexedDBStorage: any
	// biome-ignore lint/suspicious/noExplicitAny: optional dynamic import — types unavailable when package is absent
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
