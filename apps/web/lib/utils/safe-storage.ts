/**
 * Browser storage helpers that never throw when access is blocked
 * (e.g. iOS Safari private browsing, strict privacy settings, in-app browsers).
 */

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const probeStorage = (storage: StorageLike): boolean => {
	const probeKey = '__kindfi_storage_probe__'
	storage.setItem(probeKey, '1')
	storage.removeItem(probeKey)
	return true
}

const canUseStorage = (type: 'local' | 'session'): boolean => {
	if (typeof window === 'undefined') return false
	try {
		const storage = type === 'local' ? window.localStorage : window.sessionStorage
		return probeStorage(storage)
	} catch {
		return false
	}
}

const safeStorageGet = (type: 'local' | 'session', key: string): string | null => {
	if (!canUseStorage(type)) return null
	try {
		const storage = type === 'local' ? window.localStorage : window.sessionStorage
		return storage.getItem(key)
	} catch {
		return null
	}
}

const safeStorageSet = (type: 'local' | 'session', key: string, value: string): boolean => {
	if (!canUseStorage(type)) return false
	try {
		const storage = type === 'local' ? window.localStorage : window.sessionStorage
		storage.setItem(key, value)
		return true
	} catch {
		return false
	}
}

const safeStorageRemove = (type: 'local' | 'session', key: string): boolean => {
	if (!canUseStorage(type)) return false
	try {
		const storage = type === 'local' ? window.localStorage : window.sessionStorage
		storage.removeItem(key)
		return true
	} catch {
		return false
	}
}

export const safeLocalStorageGet = (key: string): string | null => safeStorageGet('local', key)

export const safeLocalStorageSet = (key: string, value: string): boolean =>
	safeStorageSet('local', key, value)

export const safeLocalStorageRemove = (key: string): boolean => safeStorageRemove('local', key)

export const isLocalStorageAvailable = (): boolean => canUseStorage('local')

export const safeSessionStorageGet = (key: string): string | null => safeStorageGet('session', key)

export const safeSessionStorageSet = (key: string, value: string): boolean =>
	safeStorageSet('session', key, value)

export const safeSessionStorageRemove = (key: string): boolean => safeStorageRemove('session', key)

export const isSessionStorageAvailable = (): boolean => canUseStorage('session')
