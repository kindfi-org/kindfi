/**
 * Browser storage helpers that never throw when access is blocked
 * (e.g. iOS Safari private browsing, strict privacy settings, in-app browsers).
 */

const canUseStorage = (): boolean => {
	if (typeof window === 'undefined') return false
	try {
		const storage = window.localStorage
		const probeKey = '__kindfi_storage_probe__'
		storage.setItem(probeKey, '1')
		storage.removeItem(probeKey)
		return true
	} catch {
		return false
	}
}

export const safeLocalStorageGet = (key: string): string | null => {
	if (!canUseStorage()) return null
	try {
		return window.localStorage.getItem(key)
	} catch {
		return null
	}
}

export const safeLocalStorageSet = (key: string, value: string): boolean => {
	if (!canUseStorage()) return false
	try {
		window.localStorage.setItem(key, value)
		return true
	} catch {
		return false
	}
}

export const safeLocalStorageRemove = (key: string): boolean => {
	if (!canUseStorage()) return false
	try {
		window.localStorage.removeItem(key)
		return true
	} catch {
		return false
	}
}

export const isLocalStorageAvailable = (): boolean => canUseStorage()
