import { describe, expect, test } from 'bun:test'
import { loadSmartAccountKit } from '../lib/smart-account/kit/smart-account-kit-loader'

describe('loadSmartAccountKit', () => {
	test('resolves the smart-account-kit module members', async () => {
		const result = await loadSmartAccountKit()

		expect(result).not.toBeNull()
		expect(result?.SmartAccountKit).toBeDefined()
		expect(result?.IndexedDBStorage).toBeDefined()
		expect(result?.MemoryStorage).toBeDefined()
	})

	test('caches the module across calls (same references)', async () => {
		const first = await loadSmartAccountKit()
		const second = await loadSmartAccountKit()

		expect(second?.SmartAccountKit).toBe(first?.SmartAccountKit)
		expect(second?.IndexedDBStorage).toBe(first?.IndexedDBStorage)
		expect(second?.MemoryStorage).toBe(first?.MemoryStorage)
	})
})
