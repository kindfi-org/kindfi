'use client'

/**
 * Clears persisted Pollar SDK session data for the current origin.
 * Use after refresh-token reuse (401 on /auth/refresh) during local dev.
 */
export const clearStalePollarStorage = async (): Promise<void> => {
	if (typeof window === 'undefined') {
		return
	}

	const keyPatterns = [/pollar/i, /dpop/i]

	const clearStore = (storage: Storage) => {
		const keysToRemove: string[] = []
		for (let index = 0; index < storage.length; index += 1) {
			const key = storage.key(index)
			if (key && keyPatterns.some((pattern) => pattern.test(key))) {
				keysToRemove.push(key)
			}
		}
		for (const key of keysToRemove) {
			storage.removeItem(key)
		}
	}

	clearStore(localStorage)
	clearStore(sessionStorage)

	if ('indexedDB' in window) {
		const databases = await indexedDB.databases?.()
		if (databases) {
			for (const database of databases) {
				const name = database.name
				if (name && keyPatterns.some((pattern) => pattern.test(name))) {
					indexedDB.deleteDatabase(name)
				}
			}
		}
	}
}
