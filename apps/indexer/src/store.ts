import type { Store } from '@subql/types-core'

// This is the actual store implementation that will be used by the generated models
// The store is injected by the SubQuery runtime
declare global {
	const store: Store
}

// Re-export the store for use in generated models
export { store }
