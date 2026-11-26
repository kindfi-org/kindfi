const DEFAULT_SAFE_PATH = '/profile'

/**
 * Only accepts relative, in-app paths (e.g. `/projects/foo`). Rejects
 * protocol-relative URLs, absolute URLs, and anything that could be used
 * as an open redirect.
 */
export function isSafeInternalPath(path: unknown): path is string {
	if (typeof path !== 'string' || path.length === 0) return false
	if (!path.startsWith('/')) return false
	if (path.startsWith('//')) return false
	if (path.includes('\\')) return false
	if (/^\/\/|^\/\\|^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false
	return true
}

export function resolveSafeCallbackUrl(
	candidate: string | null | undefined,
	fallback: string = DEFAULT_SAFE_PATH,
): string {
	if (isSafeInternalPath(candidate)) {
		return candidate
	}
	return fallback
}
